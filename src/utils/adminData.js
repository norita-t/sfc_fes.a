import { foodTypes } from '../data/mockData.js';
import {
  clamp,
  crowdToMeta,
  formatCellsString,
  getById,
  getLocationCells,
  parseCellsString,
  projectTypeLabel,
  venueLabel,
} from './helpers.js';
import { toMinutes } from './time.js';

export const ADMIN_NEW_ID = '__new__';

const allowedCrowdLevels = new Set(['low', 'medium', 'high']);
const allowedAreaTypes = new Set(['indoor', 'outdoor']);
const allowedProjectTypes = new Set(['classroom', 'outdoor']);
const projectGroupLabels = {
  class: 'クラス企画',
  club: '文連企画',
  teacher: '教員企画',
  volunteer: '有志企画',
};
const allowedFoodTypes = new Set(foodTypes.filter((type) => type.id !== 'all').map((type) => type.id));
const allowedDays = new Set(['11/14', '11/15']);
const mapBounds = {
  xMin: 1,
  xMax: 5,
  yMin: 1,
  yMax: 7,
};

export const adminCollectionMeta = {
  events: {
    key: 'events',
    label: '企画',
    singular: '企画',
    description: '教室企画と屋外企画を管理します。画像アップロードにも対応しています。',
  },
  stagePrograms: {
    key: 'stagePrograms',
    label: 'ステージ',
    singular: 'ステージ枠',
    description: '11/14・11/15 のステージ予定を管理します。',
  },
  foodBooths: {
    key: 'foodBooths',
    label: '飲食',
    singular: '飲食商品',
    description: '出店ではなく、商品単位で飲食情報を管理します。画像アップロードにも対応しています。',
  },
  locations: {
    key: 'locations',
    label: 'エリア',
    singular: 'エリア',
    description: 'マップ上の施設・ゾーン・校舎情報を管理します。',
  },
  categories: {
    key: 'categories',
    label: 'ラベル',
    singular: 'ラベル',
    description: '企画一覧で使うラベル種別を管理します。',
  },
  contentBlocks: {
    key: 'contentBlocks',
    label: '画面文言',
    singular: '画面文言',
    description: '各ページの説明文や補足テキストを編集します。',
  },
  announcements: {
    key: 'announcements',
    label: 'お知らせ',
    singular: 'お知らせ',
    description: 'ホーム最下部の「お知らせ」欄に表示します。見出し・本文・表示順を設定できます。',
  },
};

function cloneData(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeText(value) {
  return String(value ?? '').trim();
}

function assertIdFormat(id) {
  if (!id) {
    throw new Error('ID は必須です。');
  }
  if (!/^[a-z0-9-_]+$/.test(id)) {
    throw new Error('ID は半角英小文字・数字・ハイフン・アンダースコアで入力してください。');
  }
}

function assertTimeFormat(value, label) {
  if (!/^\d{2}:\d{2}$/.test(value)) {
    throw new Error(`${label}は HH:MM 形式で入力してください。`);
  }
  const [hours, minutes] = value.split(':').map(Number);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error(`${label}の値が不正です。`);
  }
}

function ensureUniqueId(collection, nextId, previousId = null) {
  const duplicated = collection.some((item) => item.id === nextId && item.id !== previousId);
  if (duplicated) {
    throw new Error(`ID「${nextId}」はすでに使われています。`);
  }
}

function getStageVenueIds(data) {
  return new Set((data.stageVenues ?? []).map((venue) => venue.id));
}

function getLocationShapeCells(location) {
  const cells = getLocationCells(location);
  if (cells.length === 0) {
    throw new Error('マップ形状が設定されていません。');
  }

  const invalid = cells.find((cell) => (
    cell.x < mapBounds.xMin || cell.x > mapBounds.xMax || cell.y < mapBounds.yMin || cell.y > mapBounds.yMax
  ));
  if (invalid) {
    throw new Error(`マップセル ${invalid.x}:${invalid.y} が範囲外です。`);
  }

  const deduped = new Map();
  cells.forEach((cell) => {
    deduped.set(`${cell.x}:${cell.y}`, cell);
  });
  return [...deduped.values()];
}

function assertNoLocationOverlap(locations) {
  const cellMap = new Map();
  locations.forEach((location) => {
    const cells = getLocationShapeCells(location);
    cells.forEach((cell) => {
      const key = `${cell.x}:${cell.y}`;
      if (cellMap.has(key) && cellMap.get(key) !== location.id) {
        throw new Error(`エリアのマップ位置が重なっています（${location.name} / ${key}）。`);
      }
      cellMap.set(key, location.id);
    });
  });
}

export function getCollectionItems(data, collectionKey) {
  return Array.isArray(data?.[collectionKey]) ? data[collectionKey] : [];
}

export function getCollectionCountSummary(data) {
  return [
    { key: 'events', label: '企画', value: `${getCollectionItems(data, 'events').length}件` },
    { key: 'stagePrograms', label: 'ステージ', value: `${getCollectionItems(data, 'stagePrograms').length}件` },
    { key: 'foodBooths', label: '飲食', value: `${getCollectionItems(data, 'foodBooths').length}件` },
    { key: 'locations', label: 'エリア', value: `${getCollectionItems(data, 'locations').length}件` },
    { key: 'categories', label: 'ラベル', value: `${getCollectionItems(data, 'categories').length}件` },
    { key: 'contentBlocks', label: '画面文言', value: `${getCollectionItems(data, 'contentBlocks').length}件` },
    { key: 'announcements', label: 'お知らせ', value: `${getCollectionItems(data, 'announcements').length}件` },
  ];
}

export function getEmptyItem(collectionKey, data) {
  const defaultCategoryId = getCollectionItems(data, 'categories')[0]?.id ?? '';
  const defaultLocationId = getCollectionItems(data, 'locations')[0]?.id ?? '';
  const defaultStageVenueId = getCollectionItems(data, 'stageVenues')[0]?.id ?? '';

  if (collectionKey === 'events') {
    return {
      id: 'new-project',
      name: '',
      categoryId: defaultCategoryId,
      projectGroupId: 'class',
      projectGroupLabel: projectGroupLabels.class,
      locationId: defaultLocationId,
      spotLabel: '',
      projectType: 'classroom',
      shortDescription: '',
      description: '',
      popularityScore: 70,
      imageAlt: '企画画像プレースホルダー',
      imageUrl: '',
      sortOrder: getCollectionItems(data, 'events').length + 1,
    };
  }

  if (collectionKey === 'stagePrograms') {
    return {
      id: 'new-stage-program',
      title: '',
      day: '11/14',
      stageVenueId: defaultStageVenueId,
      startTime: '10:00',
      endTime: '10:30',
      presentedBy: '',
      shortDescription: '',
      description: '',
      imageAlt: 'ステージ画像プレースホルダー',
      imageUrl: '',
    };
  }

  if (collectionKey === 'foodBooths') {
    return {
      id: 'new-food-item',
      name: '',
      boothName: '',
      type: 'meals',
      locationId: 'gym-complex',
      venueLabel: '第一体育館内',
      spotLabel: '第一体育館内',
      dateNote: '11/8(土)・11/9(日)',
      openTime: '11:00',
      closeTime: '15:30',
      crowdLevel: 'medium',
      priceNote: '15:00 L.O.',
      menuSummary: '',
      notice: '',
      shortDescription: '',
      description: '',
      imageAlt: '飲食画像プレースホルダー',
      imageUrl: '',
    };
  }

  if (collectionKey === 'locations') {
    return {
      id: 'new-location',
      name: '',
      shortName: '',
      areaType: 'indoor',
      currentCrowdLevel: 'medium',
      zone: '新エリア',
      description: '',
      stageVenueIds: [],
      map: {
        mode: 'rect',
        x: 1,
        y: 1,
        w: 1,
        h: 1,
        cells: '',
      },
    };
  }

  if (collectionKey === 'contentBlocks') {
    return {
      id: 'new-content-block',
      title: '',
      section: '',
      text: '',
    };
  }

  if (collectionKey === 'announcements') {
    return {
      id: 'new-notice',
      title: '',
      body: '',
      sortOrder: getCollectionItems(data, 'announcements').length + 1,
    };
  }

  return {
    id: 'new-category',
    label: '',
    jpLabel: '',
  };
}

export function getSearchText(collectionKey, item, data) {
  if (collectionKey === 'events') {
    return [
      item.id,
      item.name,
      item.shortDescription,
      item.description,
      item.venueLabel,
      item.venueName,
      item.spotLabel,
      item.dateNote,
      item.projectGroupLabel,
      projectGroupLabels[item.projectGroupId],
      getById(data.locations, item.locationId)?.name,
      getById(data.categories, item.categoryId)?.jpLabel,
    ].join(' ');
  }

  if (collectionKey === 'stagePrograms') {
    return [
      item.id,
      item.title,
      item.presentedBy,
      item.shortDescription,
      item.description,
      item.day,
      getById(data.stageVenues, item.stageVenueId)?.name,
    ].join(' ');
  }

  if (collectionKey === 'foodBooths') {
    return [
      item.id,
      item.name,
      item.boothName,
      item.venueLabel,
      item.spotLabel,
      item.dateNote,
      item.priceNote,
      item.menuSummary,
      item.shortDescription,
      item.description,
      getById(data.locations, item.locationId)?.name,
      item.notice,
    ].join(' ');
  }

  if (collectionKey === 'locations') {
    return [
      item.id,
      item.name,
      item.shortName,
      item.zone,
      item.description,
      item.map?.cells,
    ].join(' ');
  }

  if (collectionKey === 'contentBlocks') {
    return [item.id, item.title, item.section, item.text].join(' ');
  }

  if (collectionKey === 'announcements') {
    return [item.id, item.title, item.body].join(' ');
  }

  return [item.id, item.label, item.jpLabel].join(' ');
}

export function filterCollectionItems(data, collectionKey, search) {
  const searchText = normalizeText(search).toLowerCase();
  const items = getCollectionItems(data, collectionKey);

  if (!searchText) {
    return items;
  }

  return items.filter((item) => getSearchText(collectionKey, item, data).toLowerCase().includes(searchText));
}

export function getItemTitle(collectionKey, item) {
  if (collectionKey === 'categories') {
    return item.jpLabel || item.label || item.id;
  }
  if (collectionKey === 'stagePrograms') {
    return item.title || item.id;
  }
  if (collectionKey === 'contentBlocks') {
    return item.title || item.id;
  }
  if (collectionKey === 'announcements') {
    return item.title || item.id;
  }
  return item.name || item.id;
}

export function getItemSubtitle(collectionKey, item, data) {
  if (collectionKey === 'events') {
    const location = getById(data.locations, item.locationId)?.name ?? '場所未設定';
    const category = getById(data.categories, item.categoryId)?.jpLabel ?? 'ラベル未設定';
    const group = item.projectGroupLabel || projectGroupLabels[item.projectGroupId] || '企画';
    return `${projectTypeLabel(item.projectType)} ・ ${group} ・ ${location} ・ ${category}`;
  }

  if (collectionKey === 'stagePrograms') {
    const venue = getById(data.stageVenues, item.stageVenueId)?.name ?? '会場未設定';
    return `${item.day} ・ ${item.startTime} - ${item.endTime} ・ ${venue}`;
  }

  if (collectionKey === 'foodBooths') {
    const location = getById(data.locations, item.locationId)?.name ?? '場所未設定';
    const foodTypeLabel = foodTypes.find((type) => type.id === item.type)?.label ?? '飲食';
    return `${item.boothName || '出店名未設定'} ・ ${item.venueLabel || item.venueName || location} ・ ${foodTypeLabel}`;
  }

  if (collectionKey === 'locations') {
    return `${item.zone} ・ ${venueLabel(item.areaType)}`;
  }

  if (collectionKey === 'contentBlocks') {
    return `${item.section || '画面文言'} ・ ${item.text || ''}`;
  }

  if (collectionKey === 'announcements') {
    return `順序 ${item.sortOrder ?? 0} ・ ${(item.body || '').slice(0, 40)}${(item.body || '').length > 40 ? '…' : ''}`;
  }

  return `${item.label || '-'} / ${item.jpLabel || '-'}`;
}

export function createItemFromForm(collectionKey, form) {
  const formData = new FormData(form);
  const values = Object.fromEntries(formData.entries());

  if (collectionKey === 'events') {
    return {
      id: normalizeText(values.id),
      name: normalizeText(values.name),
      categoryId: normalizeText(values.categoryId),
      projectGroupId: normalizeText(values.projectGroupId) || 'class',
      projectGroupLabel: projectGroupLabels[normalizeText(values.projectGroupId)] || '',
      locationId: normalizeText(values.locationId),
      venueLabel: normalizeText(values.venueLabel),
      dateNote: normalizeText(values.dateNote),
      projectType: normalizeText(values.projectType),
      shortDescription: normalizeText(values.shortDescription),
      description: normalizeText(values.description),
      popularityScore: clamp(Number(values.popularityScore || 0), 0, 100),
      imageAlt: normalizeText(values.imageAlt),
      imageUrl: normalizeText(values.imageUrl),
      sortOrder: Math.max(1, Number(values.sortOrder || 1)),
    };
  }

  if (collectionKey === 'stagePrograms') {
    return {
      id: normalizeText(values.id),
      title: normalizeText(values.title),
      day: normalizeText(values.day),
      stageVenueId: normalizeText(values.stageVenueId),
      startTime: normalizeText(values.startTime),
      endTime: normalizeText(values.endTime),
      presentedBy: normalizeText(values.presentedBy),
      shortDescription: normalizeText(values.shortDescription),
      description: normalizeText(values.description),
      imageAlt: normalizeText(values.imageAlt),
      imageUrl: normalizeText(values.imageUrl),
    };
  }

  if (collectionKey === 'foodBooths') {
    return {
      id: normalizeText(values.id),
      name: normalizeText(values.name),
      boothName: normalizeText(values.boothName),
      type: normalizeText(values.type),
      locationId: normalizeText(values.locationId),
      venueLabel: normalizeText(values.venueLabel),
      spotLabel: normalizeText(values.venueLabel),
      dateNote: normalizeText(values.dateNote),
      openTime: normalizeText(values.openTime),
      closeTime: normalizeText(values.closeTime),
      crowdLevel: normalizeText(values.crowdLevel),
      priceNote: normalizeText(values.priceNote),
      menuSummary: normalizeText(values.menuSummary),
      notice: normalizeText(values.notice),
      shortDescription: normalizeText(values.shortDescription),
      description: normalizeText(values.description),
      imageAlt: normalizeText(values.imageAlt),
      imageUrl: normalizeText(values.imageUrl),
    };
  }

  if (collectionKey === 'locations') {
    return {
      id: normalizeText(values.id),
      name: normalizeText(values.name),
      shortName: normalizeText(values.shortName),
      areaType: normalizeText(values.areaType),
      currentCrowdLevel: normalizeText(values.currentCrowdLevel),
      zone: normalizeText(values.zone),
      description: normalizeText(values.description),
      stageVenueIds: formData.getAll('stageVenueIds').map((value) => normalizeText(value)).filter(Boolean),
      map: {
        mode: normalizeText(values.mapMode) || 'rect',
        x: clamp(Number(values.mapX || 1), mapBounds.xMin, mapBounds.xMax),
        y: clamp(Number(values.mapY || 1), mapBounds.yMin, mapBounds.yMax),
        w: clamp(Number(values.mapW || 1), 1, mapBounds.xMax),
        h: clamp(Number(values.mapH || 1), 1, mapBounds.yMax),
        cells: normalizeText(values.mapCells),
      },
    };
  }

  if (collectionKey === 'contentBlocks') {
    return {
      id: normalizeText(values.id),
      title: normalizeText(values.title),
      section: normalizeText(values.section),
      text: normalizeText(values.text),
    };
  }

  if (collectionKey === 'announcements') {
    return {
      id: normalizeText(values.id),
      title: normalizeText(values.title),
      body: normalizeText(values.body),
      sortOrder: Math.max(0, Number(values.sortOrder) || 0),
    };
  }

  return {
    id: normalizeText(values.id),
    label: normalizeText(values.label),
    jpLabel: normalizeText(values.jpLabel),
  };
}

function validateEventItem(item, data) {
  assertIdFormat(item.id);
  if (!item.name) {
    throw new Error('企画名は必須です。');
  }
  if (!allowedProjectTypes.has(item.projectType)) {
    throw new Error('企画種別が不正です。');
  }
  if (!getById(data.categories, item.categoryId)) {
    throw new Error('企画に紐づくラベルが見つかりません。');
  }
  if (!getById(data.locations, item.locationId)) {
    throw new Error('企画に紐づく場所が見つかりません。');
  }
}

function validateStageProgramItem(item, data) {
  assertIdFormat(item.id);
  if (!item.title) {
    throw new Error('ステージタイトルは必須です。');
  }
  if (!allowedDays.has(item.day)) {
    throw new Error('開催日は 11/14 または 11/15 を選んでください。');
  }
  assertTimeFormat(item.startTime, '開始時刻');
  assertTimeFormat(item.endTime, '終了時刻');
  if (toMinutes(item.endTime) < toMinutes(item.startTime)) {
    throw new Error('終了時刻は開始時刻より後にしてください。');
  }
  if (!getById(data.stageVenues, item.stageVenueId)) {
    throw new Error('ステージ会場が見つかりません。');
  }
}

function validateFoodBoothItem(item, data) {
  assertIdFormat(item.id);
  if (!item.name) {
    throw new Error('商品名は必須です。');
  }
  if (!item.boothName) {
    throw new Error('出店名は必須です。');
  }
  assertTimeFormat(item.openTime, '提供開始時刻');
  assertTimeFormat(item.closeTime, '提供終了時刻');
  if (toMinutes(item.closeTime) < toMinutes(item.openTime)) {
    throw new Error('提供終了時刻は提供開始時刻より後にしてください。');
  }
  if (!allowedCrowdLevels.has(item.crowdLevel)) {
    throw new Error('飲食の混雑度が不正です。');
  }
  if (!allowedFoodTypes.has(item.type)) {
    throw new Error('飲食種別が不正です。');
  }
  if (!getById(data.locations, item.locationId)) {
    throw new Error('飲食に紐づく場所が見つかりません。');
  }
}

function validateLocationItem(item, data) {
  assertIdFormat(item.id);
  if (!item.name) {
    throw new Error('エリア名は必須です。');
  }
  if (!item.shortName) {
    throw new Error('短縮名は必須です。');
  }
  if (!allowedAreaTypes.has(item.areaType)) {
    throw new Error('エリアの屋内 / 屋外設定が不正です。');
  }
  if (!allowedCrowdLevels.has(item.currentCrowdLevel)) {
    throw new Error('エリアの混雑度が不正です。');
  }
  if (!['rect', 'cells'].includes(item.map?.mode)) {
    throw new Error('マップ形状モードが不正です。');
  }
  const stageVenueIds = getStageVenueIds(data);
  const invalidStageVenueId = (item.stageVenueIds ?? []).find((venueId) => !stageVenueIds.has(venueId));
  if (invalidStageVenueId) {
    throw new Error(`関連ステージ会場 ${invalidStageVenueId} が不正です。`);
  }
  getLocationShapeCells(item);
}

function validateCategoryItem(item) {
  assertIdFormat(item.id);
  if (!item.label || !item.jpLabel) {
    throw new Error('ラベルの英語名 / 日本語名は両方必須です。');
  }
}

function validateContentBlockItem(item) {
  assertIdFormat(item.id);
  if (!item.title) {
    throw new Error('画面文言の管理名は必須です。');
  }
  if (!item.text) {
    throw new Error('表示テキストは必須です。');
  }
}

function validateAnnouncementItem(item) {
  assertIdFormat(item.id);
  if (!item.title) {
    throw new Error('お知らせの見出しは必須です。');
  }
}

function replaceItemById(items, previousId, nextItem) {
  const existingIndex = items.findIndex((item) => item.id === previousId);
  if (existingIndex === -1) {
    return [...items, nextItem];
  }
  const nextItems = [...items];
  nextItems.splice(existingIndex, 1, nextItem);
  return nextItems;
}

function ensureOutdoorProjectsLimit(events) {
  const outdoorCount = events.filter((event) => event.projectType === 'outdoor').length;
  if (outdoorCount > 2) {
    throw new Error('屋外企画は2件までにしてください。');
  }
}

export function upsertCollectionItem(data, collectionKey, nextItem, previousId = null) {
  const nextData = cloneData(data);
  const items = getCollectionItems(nextData, collectionKey);
  const effectivePreviousId = previousId || null;

  ensureUniqueId(items, nextItem.id, effectivePreviousId);

  if (collectionKey === 'events') {
    validateEventItem(nextItem, nextData);
    nextData.events = replaceItemById(nextData.events, effectivePreviousId ?? nextItem.id, nextItem);
    ensureOutdoorProjectsLimit(nextData.events);
    return nextData;
  }

  if (collectionKey === 'stagePrograms') {
    validateStageProgramItem(nextItem, nextData);
    nextData.stagePrograms = replaceItemById(nextData.stagePrograms, effectivePreviousId ?? nextItem.id, nextItem);
    return nextData;
  }

  if (collectionKey === 'foodBooths') {
    validateFoodBoothItem(nextItem, nextData);
    nextData.foodBooths = replaceItemById(nextData.foodBooths, effectivePreviousId ?? nextItem.id, nextItem);
    return nextData;
  }

  if (collectionKey === 'locations') {
    validateLocationItem(nextItem, nextData);
    nextData.locations = replaceItemById(nextData.locations, effectivePreviousId ?? nextItem.id, nextItem);

    if (effectivePreviousId && effectivePreviousId !== nextItem.id) {
      nextData.events = nextData.events.map((event) => (
        event.locationId === effectivePreviousId
          ? { ...event, locationId: nextItem.id }
          : event
      ));
      nextData.foodBooths = nextData.foodBooths.map((item) => (
        item.locationId === effectivePreviousId
          ? { ...item, locationId: nextItem.id }
          : item
      ));
      nextData.stageVenues = nextData.stageVenues.map((venue) => (
        venue.parentLocationId === effectivePreviousId
          ? { ...venue, parentLocationId: nextItem.id }
          : venue
      ));
    }

    nextData.stageVenues = nextData.stageVenues.map((venue) => (
      nextItem.stageVenueIds.includes(venue.id)
        ? { ...venue, parentLocationId: nextItem.id }
        : venue.parentLocationId === nextItem.id
          ? { ...venue, parentLocationId: nextItem.id }
          : venue
    ));

    assertNoLocationOverlap(nextData.locations);
    return nextData;
  }

  if (collectionKey === 'contentBlocks') {
    validateContentBlockItem(nextItem);
    nextData.contentBlocks = replaceItemById(nextData.contentBlocks, effectivePreviousId ?? nextItem.id, nextItem);
    return nextData;
  }

  if (collectionKey === 'announcements') {
    validateAnnouncementItem(nextItem);
    nextData.announcements = replaceItemById(nextData.announcements, effectivePreviousId ?? nextItem.id, nextItem);
    return nextData;
  }

  validateCategoryItem(nextItem);
  nextData.categories = replaceItemById(nextData.categories, effectivePreviousId ?? nextItem.id, nextItem);

  if (effectivePreviousId && effectivePreviousId !== nextItem.id) {
    nextData.events = nextData.events.map((event) => (
      event.categoryId === effectivePreviousId
        ? { ...event, categoryId: nextItem.id }
        : event
    ));
  }

  return nextData;
}

export function removeCollectionItem(data, collectionKey, itemId) {
  const nextData = cloneData(data);

  if (collectionKey === 'locations') {
    if (nextData.locations.length <= 1) {
      throw new Error('エリアは最低1件必要です。');
    }

    const dependentEvents = nextData.events.filter((event) => event.locationId === itemId).length;
    const dependentFood = nextData.foodBooths.filter((item) => item.locationId === itemId).length;
    const dependentStageVenues = nextData.stageVenues.filter((venue) => venue.parentLocationId === itemId).length;
    if (dependentEvents > 0 || dependentFood > 0 || dependentStageVenues > 0) {
      throw new Error('このエリアを使っている企画・飲食・ステージ会場があるため削除できません。');
    }

    nextData.locations = nextData.locations.filter((item) => item.id !== itemId);
    return nextData;
  }

  if (collectionKey === 'categories') {
    if (nextData.categories.length <= 1) {
      throw new Error('ラベルは最低1件必要です。');
    }

    const dependentEvents = nextData.events.filter((event) => event.categoryId === itemId).length;
    if (dependentEvents > 0) {
      throw new Error('このラベルを使っている企画があるため削除できません。');
    }

    nextData.categories = nextData.categories.filter((item) => item.id !== itemId);
    return nextData;
  }

  if (collectionKey === 'events') {
    nextData.events = nextData.events.filter((item) => item.id !== itemId);
    return nextData;
  }

  if (collectionKey === 'stagePrograms') {
    nextData.stagePrograms = nextData.stagePrograms.filter((item) => item.id !== itemId);
    return nextData;
  }

  if (collectionKey === 'contentBlocks') {
    nextData.contentBlocks = nextData.contentBlocks.filter((item) => item.id !== itemId);
    return nextData;
  }

  if (collectionKey === 'announcements') {
    nextData.announcements = nextData.announcements.filter((item) => item.id !== itemId);
    return nextData;
  }

  nextData.foodBooths = nextData.foodBooths.filter((item) => item.id !== itemId);
  return nextData;
}

export function makeUniqueId(baseId, data, collectionKey) {
  const existingIds = new Set(getCollectionItems(data, collectionKey).map((item) => item.id));
  const safeBase = normalizeText(baseId).replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase() || 'item';

  if (!existingIds.has(safeBase)) {
    return safeBase;
  }

  let counter = 2;
  while (existingIds.has(`${safeBase}-${counter}`)) {
    counter += 1;
  }
  return `${safeBase}-${counter}`;
}

export function duplicateCollectionItem(data, collectionKey, itemId) {
  const sourceItem = getCollectionItems(data, collectionKey).find((item) => item.id === itemId);
  if (!sourceItem) {
    throw new Error('複製元のデータが見つかりません。');
  }

  const duplicate = cloneData(sourceItem);
  duplicate.id = makeUniqueId(`${sourceItem.id}-copy`, data, collectionKey);

  if ('name' in duplicate) {
    duplicate.name = `${duplicate.name}（コピー）`;
  }
  if ('title' in duplicate) {
    duplicate.title = `${duplicate.title}（コピー）`;
  }
  if ('jpLabel' in duplicate) {
    duplicate.jpLabel = `${duplicate.jpLabel}（コピー）`;
  }
  if ('label' in duplicate) {
    duplicate.label = `${duplicate.label} Copy`;
  }
  if ('text' in duplicate && collectionKey === 'contentBlocks') {
    duplicate.text = `${duplicate.text}`;
    duplicate.title = `${duplicate.title}（コピー）`;
  }
  if (collectionKey === 'announcements') {
    duplicate.sortOrder = getCollectionItems(data, 'announcements').length + 1;
  }
  if (collectionKey === 'locations' && duplicate.map?.mode === 'rect') {
    duplicate.map = {
      ...duplicate.map,
      x: clamp(Number(duplicate.map.x || 1) + 1, mapBounds.xMin, mapBounds.xMax),
    };
  }
  if (collectionKey === 'locations' && duplicate.map?.mode === 'cells') {
    const shiftedCells = parseCellsString(duplicate.map.cells).map((cell) => ({
      x: clamp(cell.x + 1, mapBounds.xMin, mapBounds.xMax),
      y: cell.y,
    }));
    duplicate.map = {
      ...duplicate.map,
      cells: formatCellsString(shiftedCells),
    };
  }

  const nextData = upsertCollectionItem(data, collectionKey, duplicate);
  return { nextData, duplicateId: duplicate.id };
}
