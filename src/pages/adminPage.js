import { foodTypes } from '../data/mockData.js';
import { isFestivalBootstrapData } from '../services/browserFestivalRepository.js';
import { renderMediaFrame, renderSectionHeader, renderStatCard, renderTag } from '../components/ui.js';
import { escapeHTML } from '../utils/helpers.js';
import {
  ADMIN_NEW_ID,
  adminCollectionMeta,
  createItemFromForm,
  duplicateCollectionItem,
  filterCollectionItems,
  getCollectionCountSummary,
  getCollectionItems,
  getEmptyItem,
  getItemSubtitle,
  getItemTitle,
  removeCollectionItem,
  upsertCollectionItem,
} from '../utils/adminData.js';

const collectionOrder = ['events', 'stagePrograms', 'foodBooths', 'locations', 'categories', 'contentBlocks'];
const crowdOptions = [
  { value: 'low', label: 'Low / 空き気味' },
  { value: 'medium', label: 'Medium / ふつう' },
  { value: 'high', label: 'High / 混雑' },
];
const areaTypeOptions = [
  { value: 'indoor', label: '屋内' },
  { value: 'outdoor', label: '屋外' },
];
const projectTypeOptions = [
  { value: 'classroom', label: '教室企画' },
  { value: 'outdoor', label: '屋外企画（2件まで）' },
];
const projectGroupOptions = [
  { value: 'class', label: 'クラス企画' },
  { value: 'club', label: '文連企画' },
  { value: 'teacher', label: '教員企画' },
  { value: 'volunteer', label: '有志企画' },
];
const stageDayOptions = [
  { value: '11/14', label: '11/14' },
  { value: '11/15', label: '11/15' },
];

const pageState = {
  activeCollection: 'events',
  search: '',
  selectedId: null,
  flash: null,
};

let adminSearchRenderTimer = 0;

function renderAdminSearchResults(context, input, delay = 120) {
  const selectionRange = {
    start: input.selectionStart ?? input.value.length,
    end: input.selectionEnd ?? input.value.length,
  };

  window.clearTimeout(adminSearchRenderTimer);
  adminSearchRenderTimer = window.setTimeout(() => {
    context.render({ focusSelector: '#admin-search', selectionRange });
  }, delay);
}

function renderTextField({
  label,
  name,
  value = '',
  placeholder = '',
  type = 'text',
  required = false,
  min,
  max,
  step,
  hint = '',
}) {
  return `
    <label class="field">
      <span class="field__label">${escapeHTML(label)}</span>
      <input
        class="field__input"
        type="${escapeHTML(type)}"
        name="${escapeHTML(name)}"
        value="${escapeHTML(value)}"
        placeholder="${escapeHTML(placeholder)}"
        ${required ? 'required' : ''}
        ${min !== undefined ? `min="${escapeHTML(String(min))}"` : ''}
        ${max !== undefined ? `max="${escapeHTML(String(max))}"` : ''}
        ${step !== undefined ? `step="${escapeHTML(String(step))}"` : ''}
      />
      ${hint ? `<span class="field__hint">${escapeHTML(hint)}</span>` : ''}
    </label>
  `;
}

function renderTextAreaField({ label, name, value = '', rows = 4, placeholder = '', hint = '' }) {
  return `
    <label class="field">
      <span class="field__label">${escapeHTML(label)}</span>
      <textarea class="field__textarea" name="${escapeHTML(name)}" rows="${rows}" placeholder="${escapeHTML(placeholder)}">${escapeHTML(value)}</textarea>
      ${hint ? `<span class="field__hint">${escapeHTML(hint)}</span>` : ''}
    </label>
  `;
}

function renderSelectField({ label, name, value = '', options = [], hint = '' }) {
  return `
    <label class="field">
      <span class="field__label">${escapeHTML(label)}</span>
      <select class="field__select" name="${escapeHTML(name)}">
        ${options
          .map(
            (option) => `
              <option value="${escapeHTML(option.value)}" ${value === option.value ? 'selected' : ''}>
                ${escapeHTML(option.label)}
              </option>
            `,
          )
          .join('')}
      </select>
      ${hint ? `<span class="field__hint">${escapeHTML(hint)}</span>` : ''}
    </label>
  `;
}

function renderCheckboxField({ label, name, value, checked = false, description = '' }) {
  return `
    <label class="checkbox-card">
      <input class="checkbox-card__input" type="checkbox" name="${escapeHTML(name)}" value="${escapeHTML(value)}" ${checked ? 'checked' : ''} />
      <span class="checkbox-card__body">
        <strong>${escapeHTML(label)}</strong>
        ${description ? `<span>${escapeHTML(description)}</span>` : ''}
      </span>
    </label>
  `;
}

function renderImageUploadField({ label, fieldName, value = '', altLabel = '画像プレビュー' }) {
  return `
    <div class="field field--image-upload">
      <span class="field__label">${escapeHTML(label)}</span>
      <input type="hidden" name="${escapeHTML(fieldName)}" value="${escapeHTML(value)}" data-image-hidden="${escapeHTML(fieldName)}" />
      <div class="admin-image-field">
        <div class="admin-image-field__preview" data-image-preview="${escapeHTML(fieldName)}">
          ${renderMediaFrame({ imageUrl: value, alt: altLabel, label: altLabel, aspect: 'square' })}
        </div>
        <div class="admin-image-field__controls">
          <label class="secondary-button admin-file-trigger">
            画像をアップロード
            <input class="admin-import-input" type="file" accept="image/*" data-image-upload="${escapeHTML(fieldName)}" />
          </label>
          <button class="secondary-button" type="button" data-clear-image="${escapeHTML(fieldName)}">画像を外す</button>
          <span class="field__hint">画像は正方形に整えてブラウザ保存します。公開画面ではカード横のスクエア写真として表示されます。</span>
        </div>
      </div>
    </div>
  `;
}

function ensureSelection(context) {
  const items = getCollectionItems(context.data, pageState.activeCollection);

  if (pageState.selectedId === ADMIN_NEW_ID) {
    return pageState.selectedId;
  }

  if (!pageState.selectedId || !items.some((item) => item.id === pageState.selectedId)) {
    pageState.selectedId = items[0]?.id ?? ADMIN_NEW_ID;
  }

  return pageState.selectedId;
}

function getSelectedItem(context) {
  const selectedId = ensureSelection(context);
  if (selectedId === ADMIN_NEW_ID) {
    return { item: getEmptyItem(pageState.activeCollection, context.data), mode: 'new' };
  }

  const item = getCollectionItems(context.data, pageState.activeCollection).find((entry) => entry.id === selectedId);
  if (!item) {
    return { item: getEmptyItem(pageState.activeCollection, context.data), mode: 'new' };
  }

  return { item, mode: 'edit' };
}

function renderFlash() {
  if (!pageState.flash) {
    return '';
  }

  return `
    <div class="admin-flash admin-flash--${escapeHTML(pageState.flash.tone || 'info')}">
      <strong>${escapeHTML(pageState.flash.title)}</strong>
      <span>${escapeHTML(pageState.flash.message)}</span>
    </div>
  `;
}

function renderCollectionTabs() {
  return `
    <div class="chip-row admin-tabs" role="tablist" aria-label="管理対象の切り替え">
      ${collectionOrder
        .map(
          (collectionKey) => `
            <button class="chip-button ${pageState.activeCollection === collectionKey ? 'is-active' : ''}" data-admin-tab="${collectionKey}">
              ${escapeHTML(adminCollectionMeta[collectionKey].label)}
            </button>
          `,
        )
        .join('')}
    </div>
  `;
}

function renderListPanel(context) {
  const items = filterCollectionItems(context.data, pageState.activeCollection, pageState.search);
  const selectedId = ensureSelection(context);
  const meta = adminCollectionMeta[pageState.activeCollection];

  return `
    <article class="admin-panel-card admin-list-card">
      <div class="section-header">
        <div>
          <h2>${escapeHTML(meta.label)}一覧</h2>
          <p>${escapeHTML(meta.description)}</p>
        </div>
      </div>

      <div class="admin-list-toolbar">
        <label class="field admin-search-field">
          <span class="field__label">検索</span>
          <input id="admin-search" class="field__input" type="search" value="${escapeHTML(pageState.search)}" placeholder="名前・ID・説明で検索" />
        </label>
        <button class="secondary-button admin-add-button" type="button" data-admin-add>
          ＋ 新規${escapeHTML(meta.singular)}
        </button>
      </div>

      <div class="results-meta">
        <strong>${items.length}件</strong>
        <span>クリックして編集フォームを開きます</span>
      </div>

      ${items.length > 0
        ? `
          <div class="admin-list">
            ${items
              .map(
                (item) => `
                  <button class="admin-list-item ${selectedId === item.id ? 'is-active' : ''}" type="button" data-admin-select="${escapeHTML(item.id)}">
                    <span class="admin-list-item__title">${escapeHTML(getItemTitle(pageState.activeCollection, item))}</span>
                    <span class="admin-list-item__meta">${escapeHTML(getItemSubtitle(pageState.activeCollection, item, context.data))}</span>
                    <span class="admin-list-item__id">ID: ${escapeHTML(item.id)}</span>
                  </button>
                `,
              )
              .join('')}
          </div>
        `
        : `
          <div class="empty-state admin-empty-list">
            <div class="empty-state__icon">＋</div>
            <h3>${escapeHTML(meta.singular)}がありません</h3>
            <p>右上の追加ボタンから最初のデータを作成できます。</p>
          </div>
        `}
    </article>
  `;
}

function renderEventForm(item, context) {
  const categoryOptions = context.data.categories.map((category) => ({ value: category.id, label: category.jpLabel }));
  const locationOptions = context.data.locations.map((location) => ({ value: location.id, label: location.name }));

  return `
    <div class="admin-form-grid">
      ${renderTextField({ label: 'ID', name: 'id', value: item.id, required: true, hint: 'URLや内部参照に使う識別子です。例: future-archive-gallery' })}
      ${renderTextField({ label: '企画名', name: 'name', value: item.name, required: true })}
      ${renderSelectField({ label: 'ラベル', name: 'categoryId', value: item.categoryId, options: categoryOptions })}
      ${renderSelectField({ label: '企画区分', name: 'projectGroupId', value: item.projectGroupId || 'class', options: projectGroupOptions })}
      ${renderSelectField({ label: 'エリア', name: 'locationId', value: item.locationId, options: locationOptions })}
      ${renderTextField({ label: '詳細スポット', name: 'spotLabel', value: item.spotLabel, placeholder: '南校舎 2F / 共用棟前広場 など' })}
      ${renderSelectField({ label: '企画種別', name: 'projectType', value: item.projectType, options: projectTypeOptions, hint: '屋外企画は2件までです。' })}
      ${renderTextField({ label: '人気スコア', name: 'popularityScore', value: String(item.popularityScore), type: 'number', min: 0, max: 100, step: 1 })}
      ${renderTextField({ label: '掲載順', name: 'sortOrder', value: String(item.sortOrder || 1), type: 'number', min: 1, max: 999, step: 1 })}
      ${renderTextField({ label: '画像代替テキスト', name: 'imageAlt', value: item.imageAlt, placeholder: '企画画像プレースホルダー' })}
    </div>
    ${renderImageUploadField({ label: '企画写真', fieldName: 'imageUrl', value: item.imageUrl, altLabel: item.imageAlt || item.name || '企画写真' })}
    ${renderTextAreaField({ label: '短い説明', name: 'shortDescription', value: item.shortDescription, rows: 3, placeholder: '一覧カードに表示する説明' })}
    ${renderTextAreaField({ label: '詳細説明', name: 'description', value: item.description, rows: 6, placeholder: '詳細ページに表示する本文' })}
  `;
}

function renderStageProgramForm(item, context) {
  const stageVenueOptions = context.data.stageVenues.map((venue) => ({ value: venue.id, label: venue.name }));

  return `
    <div class="admin-form-grid">
      ${renderTextField({ label: 'ID', name: 'id', value: item.id, required: true, hint: '例: stage-middle-school-drama-1114' })}
      ${renderTextField({ label: 'タイトル', name: 'title', value: item.title, required: true })}
      ${renderSelectField({ label: '開催日', name: 'day', value: item.day, options: stageDayOptions })}
      ${renderSelectField({ label: '会場', name: 'stageVenueId', value: item.stageVenueId, options: stageVenueOptions })}
      ${renderTextField({ label: '開始時刻', name: 'startTime', value: item.startTime, type: 'time', required: true })}
      ${renderTextField({ label: '終了時刻', name: 'endTime', value: item.endTime, type: 'time', required: true })}
      ${renderTextField({ label: '主催', name: 'presentedBy', value: item.presentedBy, placeholder: '部活名 / 教科名 など' })}
      ${renderTextField({ label: '画像代替テキスト', name: 'imageAlt', value: item.imageAlt || '', placeholder: 'ステージ画像プレースホルダー' })}
    </div>
    ${renderImageUploadField({ label: 'ステージ紹介画像', fieldName: 'imageUrl', value: item.imageUrl || '', altLabel: item.imageAlt || item.title || 'ステージ紹介画像' })}
    ${renderTextAreaField({ label: '短い説明', name: 'shortDescription', value: item.shortDescription, rows: 3, placeholder: '一覧に表示する説明' })}
    ${renderTextAreaField({ label: '詳細説明', name: 'description', value: item.description, rows: 5, placeholder: '詳細ページに表示する本文' })}
  `;
}

function renderFoodForm(item, context) {
  const locationOptions = context.data.locations.map((location) => ({ value: location.id, label: location.name }));
  const typeOptions = foodTypes.filter((type) => type.id !== 'all').map((type) => ({ value: type.id, label: type.label }));

  return `
    <div class="admin-form-grid">
      ${renderTextField({ label: 'ID', name: 'id', value: item.id, required: true, hint: '例: spice-curry-plate' })}
      ${renderTextField({ label: '商品名', name: 'name', value: item.name, required: true })}
      ${renderTextField({ label: '出店名', name: 'boothName', value: item.boothName, required: true, placeholder: 'スパイスカレーキッチン など' })}
      ${renderSelectField({ label: '飲食種別', name: 'type', value: item.type, options: typeOptions })}
      ${renderSelectField({ label: '場所', name: 'locationId', value: item.locationId, options: locationOptions })}
      ${renderTextField({ label: '表示場所名', name: 'venueLabel', value: item.venueLabel || item.venueName || item.spotLabel || '', placeholder: '第一体育館内' })}
      ${renderTextField({ label: '営業日メモ', name: 'dateNote', value: item.dateNote || '', placeholder: '11/8(土)・11/9(日)' })}
      ${renderTextField({ label: '提供開始', name: 'openTime', value: item.openTime, type: 'time', required: true })}
      ${renderTextField({ label: '提供終了', name: 'closeTime', value: item.closeTime, type: 'time', required: true })}
      ${renderSelectField({ label: '待ち列目安', name: 'crowdLevel', value: item.crowdLevel, options: crowdOptions })}
      ${renderTextField({ label: '価格メモ', name: 'priceNote', value: item.priceNote, placeholder: '¥500 / セット価格 など' })}
      ${renderTextField({ label: '補足ライン', name: 'menuSummary', value: item.menuSummary, placeholder: 'トッピング / セット内容 など' })}
      ${renderTextField({ label: '注意書き', name: 'notice', value: item.notice || '', placeholder: '営業時間や補足事項' })}
      ${renderTextField({ label: '画像代替テキスト', name: 'imageAlt', value: item.imageAlt, placeholder: '飲食画像プレースホルダー' })}
    </div>
    ${renderImageUploadField({ label: '飲食写真', fieldName: 'imageUrl', value: item.imageUrl, altLabel: item.imageAlt || item.name || '飲食写真' })}
    ${renderTextAreaField({ label: '短い説明', name: 'shortDescription', value: item.shortDescription, rows: 4, placeholder: 'カードに表示する説明' })}
    ${renderTextAreaField({ label: '詳細説明', name: 'description', value: item.description, rows: 4, placeholder: '商品説明や買いやすい時間帯など' })}
  `;
}

function renderLocationForm(item, context) {
  const stageVenueCheckboxes = context.data.stageVenues
    .map((venue) => renderCheckboxField({
      label: venue.name,
      name: 'stageVenueIds',
      value: venue.id,
      checked: (item.stageVenueIds ?? []).includes(venue.id),
      description: 'このエリアに紐づける場合にチェックします。',
    }))
    .join('');

  return `
    <div class="admin-form-grid">
      ${renderTextField({ label: 'ID', name: 'id', value: item.id, required: true, hint: '例: west-building' })}
      ${renderTextField({ label: 'エリア名', name: 'name', value: item.name, required: true })}
      ${renderTextField({ label: '短縮名', name: 'shortName', value: item.shortName, required: true })}
      ${renderTextField({ label: 'ゾーン名', name: 'zone', value: item.zone, placeholder: '校舎エリア / ステージ など' })}
      ${renderSelectField({ label: '屋内 / 屋外', name: 'areaType', value: item.areaType, options: areaTypeOptions })}
      <input type="hidden" name="currentCrowdLevel" value="${escapeHTML(item.currentCrowdLevel || 'medium')}" />
      ${renderSelectField({ label: 'マップ形状', name: 'mapMode', value: item.map?.mode ?? 'rect', options: [{ value: 'rect', label: '長方形' }, { value: 'cells', label: 'セル指定' }], hint: '西校舎のようなL字はセル指定を使います。' })}
      ${renderTextField({ label: 'マップX', name: 'mapX', value: String(item.map?.x ?? 1), type: 'number', min: 1, max: 5, step: 1 })}
      ${renderTextField({ label: 'マップY', name: 'mapY', value: String(item.map?.y ?? 1), type: 'number', min: 1, max: 7, step: 1 })}
      ${renderTextField({ label: 'マップ幅', name: 'mapW', value: String(item.map?.w ?? 1), type: 'number', min: 1, max: 5, step: 1 })}
      ${renderTextField({ label: 'マップ高さ', name: 'mapH', value: String(item.map?.h ?? 1), type: 'number', min: 1, max: 7, step: 1 })}
    </div>
    ${renderTextAreaField({ label: 'セル指定', name: 'mapCells', value: item.map?.cells ?? '', rows: 3, placeholder: '4:2,4:3,4:4,4:5,5:1,5:2,5:3,5:4,5:5', hint: 'セル指定を使う場合のみ入力します。' })}
    ${renderTextAreaField({ label: 'エリア説明', name: 'description', value: item.description, rows: 4, placeholder: '来場者向けの場所説明' })}
    <div class="checkbox-grid">
      ${stageVenueCheckboxes || '<span class="field__hint">固定ステージ会場はありません。</span>'}
    </div>
  `;
}

function renderCategoryForm(item) {
  return `
    <div class="admin-form-grid">
      ${renderTextField({ label: 'ID', name: 'id', value: item.id, required: true, hint: '例: workshop' })}
      ${renderTextField({ label: '英語ラベル', name: 'label', value: item.label, required: true, placeholder: 'Workshop' })}
      ${renderTextField({ label: '日本語ラベル', name: 'jpLabel', value: item.jpLabel, required: true, placeholder: '体験' })}
    </div>
  `;
}

function renderContentBlockForm(item) {
  return `
    <div class="admin-form-grid">
      ${renderTextField({ label: 'ID', name: 'id', value: item.id, required: true, hint: '公開画面が参照する固定キーです。例: projects-classroom-subtitle' })}
      ${renderTextField({ label: '管理名', name: 'title', value: item.title, required: true, placeholder: '企画 / 教室企画の説明' })}
      ${renderTextField({ label: 'ページ・セクション', name: 'section', value: item.section, placeholder: '企画 / マップ / ホーム など' })}
    </div>
    ${renderTextAreaField({ label: '表示テキスト', name: 'text', value: item.text, rows: 5, placeholder: '公開画面に表示する説明文' })}
  `;
}

function renderEditorForm(context) {
  const { item, mode } = getSelectedItem(context);
  const meta = adminCollectionMeta[pageState.activeCollection];
  const title = mode === 'new' ? `新規${meta.singular}を作成` : `${meta.singular}を編集`;
  const summary = mode === 'new'
    ? '保存するとこのブラウザの管理データに追加されます。'
    : '保存すると来場者向け画面にも即時反映されます。';

  const innerForm = pageState.activeCollection === 'events'
    ? renderEventForm(item, context)
    : pageState.activeCollection === 'stagePrograms'
      ? renderStageProgramForm(item, context)
      : pageState.activeCollection === 'foodBooths'
        ? renderFoodForm(item, context)
        : pageState.activeCollection === 'locations'
          ? renderLocationForm(item, context)
          : pageState.activeCollection === 'contentBlocks'
            ? renderContentBlockForm(item)
            : renderCategoryForm(item);

  return `
    <article class="admin-panel-card admin-editor-card">
      <div class="section-header">
        <div>
          <h2>${escapeHTML(title)}</h2>
          <p>${escapeHTML(summary)}</p>
        </div>
        ${mode === 'edit' ? renderTag(`ID: ${item.id}`, 'neutral') : renderTag('新規作成', 'accent')}
      </div>

      <form
        id="admin-editor-form"
        class="admin-form"
        data-admin-mode="${mode}"
        data-admin-collection="${pageState.activeCollection}"
        data-admin-previous-id="${mode === 'edit' ? escapeHTML(item.id) : ''}"
      >
        ${innerForm}

        <div class="admin-form-actions">
          <button class="primary-button" type="submit">保存する</button>
          ${mode === 'edit'
            ? `
              <button class="secondary-button" type="button" data-admin-duplicate>複製する</button>
              <button class="secondary-button secondary-button--danger" type="button" data-admin-delete>削除する</button>
            `
            : '<button class="secondary-button" type="button" data-admin-cancel-new>一覧に戻る</button>'}
        </div>
      </form>
    </article>
  `;
}

async function handleSave(context, form) {
  try {
    const collectionKey = form.dataset.adminCollection;
    const previousId = form.dataset.adminPreviousId || null;
    const nextItem = createItemFromForm(collectionKey, form);
    const nextData = upsertCollectionItem(context.data, collectionKey, nextItem, previousId);

    pageState.selectedId = nextItem.id;
    pageState.flash = {
      tone: 'success',
      title: '保存しました',
      message: `${adminCollectionMeta[collectionKey].singular}を更新しました。`,
    };

    await context.saveData(nextData);
  } catch (error) {
    pageState.flash = {
      tone: 'error',
      title: '保存できませんでした',
      message: error.message || '入力内容を確認してください。',
    };
    context.render();
  }
}

async function handleDuplicate(context) {
  try {
    const { nextData, duplicateId } = duplicateCollectionItem(context.data, pageState.activeCollection, pageState.selectedId);
    pageState.selectedId = duplicateId;
    pageState.flash = {
      tone: 'success',
      title: '複製しました',
      message: `${adminCollectionMeta[pageState.activeCollection].singular}のコピーを作成しました。`,
    };
    await context.saveData(nextData);
  } catch (error) {
    pageState.flash = {
      tone: 'error',
      title: '複製できませんでした',
      message: error.message || '複製に失敗しました。',
    };
    context.render();
  }
}

async function handleDelete(context) {
  const itemId = pageState.selectedId;
  const item = getCollectionItems(context.data, pageState.activeCollection).find((entry) => entry.id === itemId);
  if (!item) {
    return;
  }

  const confirmed = window.confirm(`「${getItemTitle(pageState.activeCollection, item)}」を削除しますか？`);
  if (!confirmed) {
    return;
  }

  try {
    const nextData = removeCollectionItem(context.data, pageState.activeCollection, itemId);
    pageState.selectedId = getCollectionItems(nextData, pageState.activeCollection)[0]?.id ?? ADMIN_NEW_ID;
    pageState.flash = {
      tone: 'success',
      title: '削除しました',
      message: `${adminCollectionMeta[pageState.activeCollection].singular}を削除しました。`,
    };
    await context.saveData(nextData);
  } catch (error) {
    pageState.flash = {
      tone: 'error',
      title: '削除できませんでした',
      message: error.message || '関連データを確認してください。',
    };
    context.render();
  }
}

function exportData(context) {
  const payload = JSON.stringify(context.data, null, 2);
  const blob = new Blob([payload], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'sfc-festival-guide-data.json';
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);

  pageState.flash = {
    tone: 'info',
    title: 'JSONを書き出しました',
    message: 'バックアップ用のデータを保存しました。',
  };
}

async function importData(context, file) {
  if (!file) {
    return;
  }

  try {
    const rawText = await file.text();
    const parsed = JSON.parse(rawText);

    if (!isFestivalBootstrapData(parsed)) {
      throw new Error('events / stagePrograms / stageVenues / locations / categories / foodBooths / contentBlocks を含むJSONを読み込んでください。');
    }

    pageState.selectedId = null;
    pageState.flash = {
      tone: 'success',
      title: 'JSONを読み込みました',
      message: '管理データをインポートしました。',
    };

    await context.saveData(parsed);
  } catch (error) {
    pageState.flash = {
      tone: 'error',
      title: '読み込みに失敗しました',
      message: error.message || 'JSONファイルを確認してください。',
    };
    context.render();
  }
}

async function resetData(context) {
  const confirmed = window.confirm('管理データを初期状態に戻しますか？ 現在のブラウザに保存した変更は消えます。');
  if (!confirmed) {
    return;
  }

  pageState.activeCollection = 'events';
  pageState.search = '';
  pageState.selectedId = null;
  pageState.flash = {
    tone: 'warning',
    title: '初期データに戻しました',
    message: 'モックデータを再読み込みしました。',
  };
  await context.resetData();
}

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('画像を読み込めませんでした。'));
    };
    image.src = objectUrl;
  });
}

async function fileToSquareDataUrl(file) {
  const image = await loadImageFromFile(file);
  const squareSize = Math.min(image.width, image.height);
  const sx = Math.max(0, (image.width - squareSize) / 2);
  const sy = Math.max(0, (image.height - squareSize) / 2);
  const canvas = document.createElement('canvas');
  canvas.width = 720;
  canvas.height = 720;
  const context2d = canvas.getContext('2d');
  context2d.drawImage(image, sx, sy, squareSize, squareSize, 0, 0, 720, 720);
  return canvas.toDataURL('image/jpeg', 0.88);
}

function renderPreviewMarkup(dataUrl) {
  return renderMediaFrame({ imageUrl: dataUrl, label: '画像プレビュー', aspect: 'square' });
}

function bindImageUploadControls(root, context) {
  root.querySelectorAll('[data-image-upload]').forEach((input) => {
    input.addEventListener('change', async (event) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      try {
        const dataUrl = await fileToSquareDataUrl(file);
        const fieldName = input.dataset.imageUpload;
        const hidden = root.querySelector(`[data-image-hidden="${fieldName}"]`);
        const preview = root.querySelector(`[data-image-preview="${fieldName}"]`);
        if (hidden) {
          hidden.value = dataUrl;
        }
        if (preview) {
          preview.innerHTML = renderPreviewMarkup(dataUrl);
        }
      } catch (error) {
        window.alert(error.message || '画像を読み込めませんでした。');
      }
    });
  });

  root.querySelectorAll('[data-clear-image]').forEach((button) => {
    button.addEventListener('click', () => {
      const fieldName = button.dataset.clearImage;
      const hidden = root.querySelector(`[data-image-hidden="${fieldName}"]`);
      const preview = root.querySelector(`[data-image-preview="${fieldName}"]`);
      if (hidden) {
        hidden.value = '';
      }
      if (preview) {
        preview.innerHTML = renderPreviewMarkup('');
      }

    });
  });
}

export const adminPage = {
  render(context) {
    ensureSelection(context);
    const summary = getCollectionCountSummary(context.data);

    return `
      <section class="hero-panel hero-panel--admin">
        <div class="hero-panel__copy">
          <span class="eyebrow">運営向け</span>
          <h2>管理画面</h2>
          <p>企画・ステージ・飲食・エリア・ラベル・画面文言を GUI で編集できます。変更内容はこのブラウザに保存され、来場者向け画面にもすぐ反映されます。</p>
        </div>

        <div class="admin-hero__actions">
          <button class="secondary-button" type="button" data-route="/">来場者画面を開く</button>
          <button class="secondary-button" type="button" data-admin-export>JSONを書き出す</button>
          <label class="secondary-button admin-file-trigger">
            JSONを読み込む
            <input id="admin-import-input" class="admin-import-input" type="file" accept="application/json" />
          </label>
          <button class="secondary-button secondary-button--danger" type="button" data-admin-reset>初期データに戻す</button>
        </div>

        <div class="stats-grid">
          ${summary.map((item) => renderStatCard(item.label, item.value, '管理対象の件数')).join('')}
        </div>

        <p class="admin-note">
          ※ localStorage 保存です。画像は正方形に整えて保存します。将来的に Firebase / Firestore へ差し替えやすい構成を維持しています。
        </p>
      </section>

      ${renderFlash()}

      <section class="section-block">
        ${renderSectionHeader('管理対象を選ぶ', '一覧から選択してフォームで編集します')}
        ${renderCollectionTabs()}
      </section>

      <section class="admin-layout">
        ${renderListPanel(context)}
        ${renderEditorForm(context)}
      </section>
    `;
  },

  bind(root, context) {
    root.querySelectorAll('[data-admin-tab]').forEach((button) => {
      button.addEventListener('click', () => {
        pageState.activeCollection = button.dataset.adminTab;
        pageState.search = '';
        pageState.selectedId = null;
        pageState.flash = null;
        context.render();
      });
    });

    const adminSearchInput = root.querySelector('#admin-search');
    if (adminSearchInput) {
      let isComposing = false;

      adminSearchInput.addEventListener('compositionstart', () => {
        isComposing = true;
      });

      adminSearchInput.addEventListener('compositionend', (event) => {
        isComposing = false;
        pageState.search = event.target.value;
        renderAdminSearchResults(context, event.target, 0);
      });

      adminSearchInput.addEventListener('input', (event) => {
        pageState.search = event.target.value;
        if (isComposing || event.isComposing) {
          return;
        }
        renderAdminSearchResults(context, event.target);
      });

      adminSearchInput.addEventListener('search', (event) => {
        pageState.search = event.target.value;
        renderAdminSearchResults(context, event.target, 0);
      });
    }

    root.querySelectorAll('[data-admin-select]').forEach((button) => {
      button.addEventListener('click', () => {
        pageState.selectedId = button.dataset.adminSelect;
        pageState.flash = null;
        context.render();
      });
    });

    root.querySelector('[data-admin-add]')?.addEventListener('click', () => {
      pageState.selectedId = ADMIN_NEW_ID;
      pageState.flash = null;
      context.render();
    });

    root.querySelector('[data-admin-cancel-new]')?.addEventListener('click', () => {
      pageState.selectedId = getCollectionItems(context.data, pageState.activeCollection)[0]?.id ?? ADMIN_NEW_ID;
      pageState.flash = null;
      context.render();
    });

    root.querySelector('#admin-editor-form')?.addEventListener('submit', async (event) => {
      event.preventDefault();
      await handleSave(context, event.currentTarget);
    });

    root.querySelector('[data-admin-duplicate]')?.addEventListener('click', async () => {
      await handleDuplicate(context);
    });

    root.querySelector('[data-admin-delete]')?.addEventListener('click', async () => {
      await handleDelete(context);
    });

    root.querySelector('[data-admin-export]')?.addEventListener('click', () => {
      exportData(context);
      context.render();
    });

    root.querySelector('#admin-import-input')?.addEventListener('change', async (event) => {
      await importData(context, event.target.files?.[0]);
    });

    root.querySelector('[data-admin-reset]')?.addEventListener('click', async () => {
      await resetData(context);
    });

    bindImageUploadControls(root, context);
  },
};
