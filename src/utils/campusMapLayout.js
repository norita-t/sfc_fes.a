export const MAP_VIEWBOX = {
  width: 720,
  height: 920,
};

const routePoints = {
  'south-building': { x: 2.2, y: 6.2 },
  'classroom-pool': { x: 2.8, y: 4.9 },
  'classroom-ground': { x: 1.1, y: 3.7 },
  'shared-building': { x: 2.5, y: 4.1 },
  lawn: { x: 3.4, y: 4.1 },
  'office-building': { x: 3.3, y: 1.3 },
  'gym-complex': { x: 4.4, y: 2.2 },
  'west-building': { x: 4.9, y: 3.8 },
};

export function getMapRoutePoint(location) {
  return routePoints[location?.id] ?? { x: 1, y: 1 };
}

function label(x, y, width, height, lines, options = {}) {
  return {
    x,
    y,
    width,
    height,
    lines,
    compact: options.compact ?? false,
    rotation: options.rotation ?? 0,
  };
}

function rectRegion(id, locationId, x, y, width, height, lines, options = {}) {
  const baseLabel = lines
    ? label(x, y, width, height, lines, { compact: options.compact, rotation: options.rotation })
    : null;

  return {
    id,
    kind: options.kind ?? 'room',
    locationId,
    projectId: options.projectId ?? null,
    projectHint: options.projectHint ?? null,
    shape: 'rect',
    x,
    y,
    width,
    height,
    radius: options.radius ?? 14,
    label: baseLabel ? { ...baseLabel, ...(options.label ?? {}) } : options.label ?? null,
    interactive: options.interactive ?? Boolean(locationId),
  };
}

function ellipseRegion(id, locationId, cx, cy, rx, ry, lines, options = {}) {
  return {
    id,
    kind: options.kind ?? 'feature',
    locationId,
    shape: 'ellipse',
    cx,
    cy,
    rx,
    ry,
    label: lines ? label(cx - rx, cy - 24, rx * 2, 48, lines, { compact: options.compact }) : null,
    interactive: options.interactive ?? Boolean(locationId),
  };
}

function pathRegion(id, locationId, path, lines, options = {}) {
  return {
    id,
    kind: options.kind ?? 'outline',
    locationId,
    projectId: options.projectId ?? null,
    projectHint: options.projectHint ?? null,
    shape: 'path',
    path,
    label: lines ? {
      ...options.label,
      lines,
    } : options.label ?? null,
    interactive: options.interactive ?? Boolean(locationId),
  };
}

function polygonRegion(id, locationId, points, lines, options = {}) {
  return {
    id,
    kind: options.kind ?? 'outline',
    locationId,
    projectId: options.projectId ?? null,
    projectHint: options.projectHint ?? null,
    shape: 'polygon',
    points,
    label: lines ? {
      ...options.label,
      lines,
    } : options.label ?? null,
    interactive: options.interactive ?? Boolean(locationId),
  };
}

function lineGuide(id, d, options = {}) {
  return {
    id,
    kind: 'connector',
    shape: 'path',
    path: d,
    dash: options.dash ?? '10 12',
    weight: options.weight ?? 2.5,
  };
}

export const campusOverviewBlueprint = {
  id: 'campus',
  label: '全体',
  title: '統合キャンパスマップ',
  description: '配布平面図をもとに、建物配置とフロア情報をひとつの見た目に再構成したマップです。',
  viewBox: { x: 42, y: 54, width: 646, height: 820 },
  regions: [
    pathRegion('south-shell', 'south-building', 'M138 84 H440 L518 154 L518 336 H472 V370 H164 V338 H138 Z', null, {
      kind: 'zone',
      label: label(170, 88, 166, 54, ['南校舎']),
      interactive: true,
    }),
    rectRegion('room-150-overview', 'south-building', 150, 170, 88, 84, ['150番', '教室'], { kind: 'room', compact: true }),
    rectRegion('classroom-pool-overview', 'classroom-pool', 170, 350, 310, 62, ['教室棟', '（プール側）'], { kind: 'zone', compact: true }),
    rectRegion('classroom-ground-overview', 'classroom-ground', 92, 350, 74, 410, ['教室棟', '（グラウンド側）'], {
      kind: 'zone',
      compact: true,
      rotation: -90,
    }),
    rectRegion('shared-overview', 'shared-building', 214, 430, 142, 182, ['共用棟'], { kind: 'zone' }),
    ellipseRegion('lawn-overview', 'lawn', 438, 502, 82, 64, ['芝生'], { kind: 'feature' }),
    polygonRegion('west-overview', 'west-building', '488,348 610,306 662,518 546,566', null, {
      kind: 'zone',
      label: label(534, 402, 124, 52, ['西校舎'], { rotation: 61 }),
      interactive: true,
    }),
    rectRegion('gym-3-overview', 'west-building', 578, 644, 116, 148, ['第三', '体育館'], { kind: 'room', compact: true }),
    rectRegion('gym-1-overview', 'gym-complex', 420, 570, 126, 170, ['第一', '体育館'], { kind: 'room', compact: true }),
    rectRegion('gym-2-overview', 'gym-complex', 548, 530, 58, 240, ['第二', '体育館'], { kind: 'room', compact: true }),
    pathRegion('office-overview', 'office-building', 'M246 726 H548 V840 H246 Z', null, {
      kind: 'zone',
      label: label(316, 748, 166, 56, ['事務室棟']),
      interactive: true,
    }),
    rectRegion('pool-feature', null, 278, 178, 126, 126, ['プール'], { kind: 'feature', compact: true, interactive: false }),
    rectRegion('courtyard-feature', null, 224, 500, 120, 96, ['中庭'], { kind: 'feature', compact: true, interactive: false }),
    rectRegion('reception-feature', null, 144, 806, 88, 38, ['受付'], { kind: 'feature', compact: true, interactive: false, radius: 10 }),
    rectRegion('hq-feature', null, 398, 792, 116, 36, ['本部 / BC'], { kind: 'feature', compact: true, interactive: false, radius: 12 }),
  ],
  groups: [
    { id: 'campus-south', locationId: 'south-building', title: '南校舎', items: ['150番教室', '上階教室', 'B1F 151〜155'] },
    { id: 'campus-pool', locationId: 'classroom-pool', title: '教室棟（プール側）', items: ['101〜105', '201〜206', 'プール横'] },
    { id: 'campus-ground', locationId: 'classroom-ground', title: '教室棟（グラウンド側）', items: ['107〜112', '207〜212'] },
    { id: 'campus-shared', locationId: 'shared-building', title: '共用棟', items: ['図書室', '茶道部', '理科部'] },
    { id: 'campus-west', locationId: 'west-building', title: '西校舎', items: ['406 同窓会', '第三体育館'] },
    { id: 'campus-gym', locationId: 'gym-complex', title: '第一・第二体育館', items: ['第一体育館', '第二体育館'] },
    { id: 'campus-office', locationId: 'office-building', title: '事務室棟', items: ['本部 / BC会議室', 'AVC-A', '技術室側'] },
    { id: 'campus-lawn', locationId: 'lawn', title: '芝生', items: ['休憩', '屋外回遊'] },
  ],
};

export const floorBlueprints = {
  '1f': {
    id: '1f',
    label: '1F',
    title: '1F 統合マップ',
    description: '1F の主要教室、体育館、共用棟、受付を同じキャンパス配置でまとめた再構成図です。',
    viewBox: { x: 70, y: 58, width: 660, height: 818 },
    regions: [
      pathRegion('1f-south-outline', 'south-building', 'M136 76 H434 L506 148 L506 336 H464 V366 H162 V334 H136 Z', null, {
        kind: 'outline',
        label: label(166, 88, 140, 48, ['南校舎']),
        interactive: true,
      }),
      rectRegion('1f-150', 'south-building', 154, 158, 132, 158, ['150番', '教室'], { kind: 'room' }),
      rectRegion('1f-166', 'south-building', 166, 104, 44, 38, ['166'], { kind: 'room', compact: true }),
      rectRegion('1f-165', 'south-building', 212, 104, 44, 38, ['165'], { kind: 'room', compact: true }),
      rectRegion('1f-164', 'south-building', 258, 104, 44, 38, ['164'], { kind: 'room', compact: true }),
      rectRegion('1f-163', 'south-building', 304, 104, 44, 38, ['163'], { kind: 'room', compact: true }),
      rectRegion('1f-162', 'south-building', 350, 104, 44, 38, ['162'], { kind: 'room', compact: true }),
      rectRegion('1f-161', 'south-building', 396, 104, 44, 38, ['161'], { kind: 'room', compact: true }),
      rectRegion('1f-pool', null, 302, 172, 118, 110, ['プール'], { kind: 'feature', interactive: false }),
      rectRegion('1f-pool-side-outline', 'classroom-pool', 176, 356, 306, 132, ['教室棟（プール側）'], { kind: 'outline', compact: true, label: label(194, 366, 270, 34, ['教室棟（プール側）'], { compact: true }) }),
      rectRegion('1f-101', 'classroom-pool', 410, 434, 54, 38, ['101'], { kind: 'room', compact: true }),
      rectRegion('1f-102', 'classroom-pool', 354, 434, 54, 38, ['102'], { kind: 'room', compact: true }),
      rectRegion('1f-103', 'classroom-pool', 298, 434, 54, 38, ['103'], { kind: 'room', compact: true }),
      rectRegion('1f-104', 'classroom-pool', 242, 434, 54, 38, ['104'], { kind: 'room', compact: true }),
      rectRegion('1f-105', 'classroom-pool', 186, 434, 54, 38, ['105'], { kind: 'room', compact: true }),
      rectRegion('1f-ground-outline', 'classroom-ground', 92, 426, 74, 390, ['教室棟（グラウンド側）'], {
        kind: 'outline',
        compact: true,
        rotation: -90,
      }),
      rectRegion('1f-107', 'classroom-ground', 102, 466, 54, 42, ['107'], { kind: 'room', compact: true }),
      rectRegion('1f-108', 'classroom-ground', 102, 510, 54, 42, ['108'], { kind: 'room', compact: true }),
      rectRegion('1f-109', 'classroom-ground', 102, 554, 54, 42, ['109'], { kind: 'room', compact: true }),
      rectRegion('1f-110', 'classroom-ground', 102, 598, 54, 42, ['110'], { kind: 'room', compact: true }),
      rectRegion('1f-111', 'classroom-ground', 102, 650, 54, 48, ['111'], { kind: 'room', compact: true }),
      rectRegion('1f-112', 'classroom-ground', 102, 700, 54, 48, ['112'], { kind: 'room', compact: true }),
      rectRegion('1f-shared-outline', 'shared-building', 180, 470, 190, 170, ['共用棟'], { kind: 'outline', label: label(236, 476, 96, 30, ['共用棟']) }),
      rectRegion('1f-library', 'shared-building', 248, 520, 86, 58, ['図書室'], { kind: 'room', compact: true }),
      rectRegion('1f-tea', 'shared-building', 188, 574, 44, 54, ['茶道部'], { kind: 'room', compact: true }),
      rectRegion('1f-courtyard', null, 220, 650, 150, 112, ['中庭'], { kind: 'feature', interactive: false }),
      rectRegion('1f-lawn', 'lawn', 388, 490, 104, 70, ['芝生'], { kind: 'feature', compact: true }),
      polygonRegion('1f-west-outline', 'west-building', '490,344 622,372 676,534 620,548 572,450 518,370', null, {
        kind: 'outline',
        label: label(552, 386, 100, 46, ['西校舎'], { rotation: 61 }),
        interactive: true,
      }),
      rectRegion('1f-406', 'west-building', 542, 414, 56, 54, ['406'], { kind: 'room', compact: true }),
      rectRegion('1f-gym-1', 'gym-complex', 416, 610, 126, 170, ['第一体育館'], { kind: 'room', compact: true }),
      rectRegion('1f-gym-2', 'gym-complex', 550, 558, 56, 188, ['第二体育館'], { kind: 'room', compact: true }),
      rectRegion('1f-gym-3', 'west-building', 612, 612, 90, 180, ['第三体育館'], { kind: 'room', compact: true }),
      pathRegion('1f-office-outline', 'office-building', 'M242 772 H604 V852 H242 Z', null, {
        kind: 'outline',
        label: label(338, 792, 170, 46, ['事務室棟']),
        interactive: true,
      }),
      rectRegion('1f-hq', 'office-building', 430, 776, 98, 48, ['本部 / BC'], { kind: 'room', compact: true }),
      rectRegion('1f-reception', null, 140, 818, 84, 36, ['受付'], { kind: 'feature', compact: true, interactive: false, radius: 10 }),
    ],
    groups: [
      { id: '1f-south', locationId: 'south-building', title: '南校舎', items: ['150番教室', '161 6A', '162 6B', '163 6C', '164 6D', '165 6E', '166 6F'] },
      { id: '1f-pool', locationId: 'classroom-pool', title: '教室棟（プール側）', items: ['101 美術部', '102 図書委員会・英語科', '103 環プロ新聞部', '104 創作部', '105 歌留多部'] },
      { id: '1f-ground', locationId: 'classroom-ground', title: '教室棟（グラウンド側）', items: ['107 3A', '108 3B', '109 3C', '110 3D', '111 4D', '112 3F'] },
      { id: '1f-shared', locationId: 'shared-building', title: '共用棟', items: ['図書室', '茶道部'] },
      { id: '1f-west', locationId: 'west-building', title: '西校舎', items: ['406 同窓会', '第三体育館'] },
      { id: '1f-gym', locationId: 'gym-complex', title: '体育館・案内', items: ['第一体育館（飲食エリア）', '第二体育館（ステージ）', '受付', '本部 / BC会議室'] },
    ],
  },
  'b1f': {
    id: 'b1f',
    label: 'B1F',
    title: 'B1F 南校舎',
    description: '配布図の B1F をもとに、南校舎の 151〜155 教室を見やすく再構成しています。',
    viewBox: { x: 78, y: 78, width: 422, height: 246 },
    regions: [
      pathRegion('b1f-south-outline', 'south-building', 'M116 144 H458 V298 H116 Z', null, {
        kind: 'outline',
        label: label(236, 104, 110, 42, ['南校舎']),
        interactive: true,
      }),
      rectRegion('b1f-151', 'south-building', 386, 162, 64, 62, ['151'], { kind: 'room', compact: true }),
      rectRegion('b1f-152', 'south-building', 320, 162, 64, 62, ['152'], { kind: 'room', compact: true }),
      rectRegion('b1f-153', 'south-building', 254, 162, 64, 62, ['153'], { kind: 'room', compact: true }),
      rectRegion('b1f-154', 'south-building', 188, 162, 64, 62, ['154'], { kind: 'room', compact: true }),
      rectRegion('b1f-155', 'south-building', 122, 162, 64, 62, ['155'], { kind: 'room', compact: true }),
      rectRegion('b1f-corridor', null, 124, 228, 326, 34, ['廊下'], { kind: 'feature', compact: true, interactive: false, radius: 10 }),
    ],
    groups: [
      { id: 'b1f-south', locationId: 'south-building', title: '南校舎 B1F', items: ['151 5A', '152 5B', '153 5C', '154 5D', '155 5E'] },
    ],
  },
  '2f': {
    id: '2f',
    label: '2F',
    title: '2F 教室棟・事務室棟',
    description: '2F の教室棟と事務室棟側の展示教室を、全体配置が分かるようにひとつにまとめています。',
    viewBox: { x: 54, y: 130, width: 652, height: 720 },
    regions: [
      rectRegion('2f-pool-outline', 'classroom-pool', 124, 160, 378, 92, ['教室棟（プール側）'], { kind: 'outline', compact: true, label: label(222, 164, 182, 26, ['教室棟（プール側）'], { compact: true }) }),
      rectRegion('2f-201', 'classroom-pool', 430, 198, 58, 42, ['201'], { kind: 'room', compact: true }),
      rectRegion('2f-202', 'classroom-pool', 370, 198, 58, 42, ['202'], { kind: 'room', compact: true }),
      rectRegion('2f-203', 'classroom-pool', 310, 198, 58, 42, ['203'], { kind: 'room', compact: true }),
      rectRegion('2f-204', 'classroom-pool', 250, 198, 58, 42, ['204'], { kind: 'room', compact: true }),
      rectRegion('2f-205', 'classroom-pool', 190, 198, 58, 42, ['205'], { kind: 'room', compact: true }),
      rectRegion('2f-206', 'classroom-pool', 130, 198, 58, 42, ['206'], { kind: 'room', compact: true }),
      rectRegion('2f-ground-outline', 'classroom-ground', 84, 250, 92, 510, ['教室棟（グラウンド側）'], {
        kind: 'outline',
        compact: true,
        rotation: -90,
      }),
      rectRegion('2f-207', 'classroom-ground', 98, 290, 64, 54, ['207'], { kind: 'room', compact: true }),
      rectRegion('2f-208', 'classroom-ground', 98, 346, 64, 54, ['208'], { kind: 'room', compact: true }),
      rectRegion('2f-209', 'classroom-ground', 98, 422, 64, 60, ['209'], { kind: 'room', compact: true }),
      rectRegion('2f-210', 'classroom-ground', 98, 484, 64, 60, ['210'], { kind: 'room', compact: true }),
      rectRegion('2f-211', 'classroom-ground', 98, 592, 64, 74, ['211'], { kind: 'room', compact: true }),
      rectRegion('2f-212', 'classroom-ground', 98, 668, 64, 74, ['212'], { kind: 'room', compact: true }),
      pathRegion('2f-shared-outline', 'shared-building', 'M214 274 H410 V510 H250 V664 H206 V512 H170 V384 H214 Z', null, {
        kind: 'outline',
        label: label(232, 362, 140, 46, ['共用棟']),
        interactive: true,
      }),
      rectRegion('2f-teachers-room', 'shared-building', 238, 368, 102, 78, ['教員室'], { kind: 'room', compact: true }),
      pathRegion('2f-office-outline', 'office-building', 'M250 660 H690 V822 H250 Z', null, {
        kind: 'outline',
        label: label(394, 786, 142, 40, ['事務室棟']),
        interactive: true,
      }),
      rectRegion('2f-avc', 'office-building', 286, 712, 126, 66, ['AVC-A'], { kind: 'room', compact: true }),
      rectRegion('2f-cooking', 'office-building', 460, 706, 94, 72, ['クッキング', '被服室'], { kind: 'room', compact: true }),
      rectRegion('2f-electronics', 'office-building', 560, 676, 110, 116, ['電子工学', '研究会'], { kind: 'room', compact: true }),
    ],
    groups: [
      { id: '2f-pool', locationId: 'classroom-pool', title: '教室棟（プール側）', items: ['201 英語', '202 社会家庭', '203 数学理科', '204 4C', '205 4E', '206 4A'] },
      { id: '2f-ground', locationId: 'classroom-ground', title: '教室棟（グラウンド側）', items: ['207 2A', '208 2B', '209 2C', '210 2D', '211 2E', '212 2F'] },
      { id: '2f-shared', locationId: 'shared-building', title: '共用棟', items: ['教員室'] },
      { id: '2f-office', locationId: 'office-building', title: '事務室棟側', items: ['AVC-A', 'クッキング被服室', '電子工学研究会技術室'] },
    ],
  },
  '3f': {
    id: '3f',
    label: '3F',
    title: '3F 共用棟',
    description: '3F の共用棟は理科部と理科室B が中心です。立ち入り動線が分かるように簡潔な図に整理しています。',
    viewBox: { x: 150, y: 118, width: 380, height: 590 },
    regions: [
      pathRegion('3f-shared-outline', 'shared-building', 'M196 176 H474 V514 H406 V682 H326 V514 H196 Z', null, {
        kind: 'outline',
        label: label(260, 144, 150, 42, ['共用棟 3F']),
        interactive: true,
      }),
      rectRegion('3f-science-club', 'shared-building', 310, 356, 102, 92, ['理科部'], { kind: 'room', compact: true }),
      rectRegion('3f-science-room-b', 'shared-building', 310, 450, 102, 88, ['理科室B'], { kind: 'room', compact: true }),
      rectRegion('3f-stair-core', null, 420, 206, 42, 142, ['階段'], { kind: 'feature', compact: true, interactive: false }),
    ],
    groups: [
      { id: '3f-shared', locationId: 'shared-building', title: '共用棟 3F', items: ['理科部', '理科室B'] },
    ],
  },
};

export function getFloorBlueprint(floorId) {
  if (floorId === 'campus') {
    return campusOverviewBlueprint;
  }
  return floorBlueprints[floorId] ?? campusOverviewBlueprint;
}
