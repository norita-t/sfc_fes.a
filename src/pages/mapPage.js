import { renderCompactEventRow } from '../components/cards.js';
import { renderEmptyState, renderSectionHeader, renderTag } from '../components/ui.js';
import { MAP_VIEWBOX, getFloorBlueprint } from '../utils/campusMapLayout.js';
import { escapeHTML, venueLabel } from '../utils/helpers.js';

const pageState = {
  selectedLocationId: 'shared-building',
  floorId: 'campus',
  sheetExpanded: false,
};

function ensureLocationState(context, route) {
  const locations = context.data.locations;
  const firstLocationId = locations[0]?.id ?? null;
  const floorIds = ['campus', ...(context.data.mapFloors ?? []).map((floor) => floor.id)];

  if (route.query.location && locations.some((location) => location.id === route.query.location)) {
    pageState.selectedLocationId = route.query.location;
    pageState.sheetExpanded = true;
  }

  if (!locations.some((location) => location.id === pageState.selectedLocationId)) {
    pageState.selectedLocationId = firstLocationId;
  }


  if (!floorIds.includes(pageState.floorId)) {
    pageState.floorId = 'campus';
  }
}

function getSelectedLocation(context, route) {
  ensureLocationState(context, route);
  return context.data.locations.find((location) => location.id === pageState.selectedLocationId) ?? context.data.locations[0];
}

function getProjectsAtLocation(context, locationId) {
  return [...context.data.events]
    .filter((event) => event.locationId === locationId)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
}

function getFoodAtLocation(context, locationId) {
  return context.data.foodBooths.filter((item) => item.locationId === locationId);
}

function normalizeMapSearchText(value = '') {
  return String(value)
    .toLowerCase()
    .replace(/[\s　・/／（）()\-ー〜~]/g, '')
    .replace(/教室|号室/g, '')
    .trim();
}

function getRegionLabelText(region) {
  const lines = Array.isArray(region.label?.lines) ? region.label.lines : [];
  return lines.join('');
}

function getProjectForRoomRegion(context, region) {
  if (region.kind !== 'room') {
    return null;
  }

  if (region.projectId) {
    return context.data.events.find((event) => event.id === region.projectId) ?? null;
  }

  const labelText = getRegionLabelText(region);
  const labelKey = normalizeMapSearchText(region.projectHint || labelText);
  const roomNumber = region.id?.match(/(?:^|-)(\d{3})(?:$|-)/)?.[1] ?? labelText.match(/\d{3}/)?.[0] ?? '';

  if (roomNumber) {
    const byRoom = context.data.events.find((event) => normalizeMapSearchText(event.spotLabel).includes(roomNumber));
    if (byRoom) {
      return byRoom;
    }
  }

  if (!labelKey) {
    return null;
  }

  return context.data.events.find((event) => {
    const nameKey = normalizeMapSearchText(event.name);
    const spotKey = normalizeMapSearchText(event.spotLabel);
    return nameKey.includes(labelKey) || spotKey.includes(labelKey) || labelKey.includes(nameKey);
  }) ?? null;
}

function renderLabelChip(label, selected, groupClass = 'festival-map__label') {
  if (!label) {
    return '';
  }

  const width = label.width ?? 140;
  const height = label.height ?? 52;
  const x = label.x ?? 0;
  const y = label.y ?? 0;
  const cx = x + (width / 2);
  const cy = y + (height / 2);
  const transform = label.rotation ? ` transform="rotate(${label.rotation} ${cx} ${cy})"` : '';
  const className = `${groupClass}${selected ? ' is-selected' : ''}`;
  const lines = Array.isArray(label.lines) ? label.lines : [label.text ?? ''];
  const fontClass = label.compact
    ? 'festival-map__label-text festival-map__label-text--compact'
    : 'festival-map__label-text';
  const step = lines.length > 1 ? 16 : 0;
  const startY = cy - (((lines.length - 1) * step) / 2) + 5;

  return `
    <g class="${className}"${transform}>
      <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="16" />
      ${lines
        .map(
          (line, index) => `<text x="${cx}" y="${startY + (index * step)}" text-anchor="middle" class="${fontClass}">${escapeHTML(line)}</text>`,
        )
        .join('')}
    </g>
  `;
}

function renderRegionShape(region, className) {
  if (region.shape === 'path') {
    return `<path d="${region.path}" class="${className}" ${region.dash ? `stroke-dasharray="${region.dash}"` : ''} ${region.weight ? `stroke-width="${region.weight}"` : ''} />`;
  }

  if (region.shape === 'polygon') {
    return `<polygon points="${region.points}" class="${className}" />`;
  }

  if (region.shape === 'ellipse') {
    return `<ellipse cx="${region.cx}" cy="${region.cy}" rx="${region.rx}" ry="${region.ry}" class="${className}" />`;
  }

  return `<rect x="${region.x}" y="${region.y}" width="${region.width}" height="${region.height}" rx="${region.radius ?? 14}" class="${className}" />`;
}

function renderFloorMap(context, selectedLocationId) {
  const floor = getFloorBlueprint(pageState.floorId);
  const viewBox = floor.viewBox ?? { x: 0, y: 0, width: MAP_VIEWBOX.width, height: MAP_VIEWBOX.height };

  const regionsMarkup = (floor.regions ?? []).map((region) => {
    if (region.kind === 'connector') {
      return renderRegionShape(region, 'festival-map__connector');
    }

    const location = region.locationId
      ? context.data.locations.find((item) => item.id === region.locationId)
      : null;
    const project = getProjectForRoomRegion(context, region);
    const selected = !project && region.locationId === selectedLocationId;
    const regionClass = `festival-map__shape festival-map__shape--${region.kind}${selected ? ' is-selected' : ''}${project ? ' is-project-linked' : ''}`;
    const interactive = region.interactive !== false && Boolean(region.locationId || project);
    const actionAttribute = project
      ? `data-room-project="${escapeHTML(project.id)}"`
      : `data-location-select="${escapeHTML(region.locationId)}"`;
    const ariaLabel = project
      ? `${project.name} の企画詳細を見る`
      : `${location?.name ?? ''} を選択`;

    return `
      <g ${interactive ? `tabindex="0" role="button" ${actionAttribute} aria-label="${escapeHTML(ariaLabel)}" class="festival-map__spot${selected ? ' is-selected' : ''}${project ? ' is-project-linked' : ''}"` : 'aria-hidden="true"'}>
        ${renderRegionShape(region, regionClass)}
        ${renderLabelChip(region.label, selected, project ? 'festival-map__label festival-map__label--project' : 'festival-map__label')}
      </g>
    `;
  }).join('');

  return `
    <svg class="festival-map" viewBox="${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${escapeHTML(floor.title)}">
      <rect class="festival-map__background" x="${viewBox.x}" y="${viewBox.y}" width="${viewBox.width}" height="${viewBox.height}" rx="36" />
      ${regionsMarkup}
    </svg>
  `;
}

function renderFloorTabs(context) {
  const tabs = [
    { id: 'campus', label: '全体' },
    ...(context.data.mapFloors ?? []).map((floor) => ({ id: floor.id, label: floor.label })),
  ];

  return `
    <label class="map-floor-select">
      <span>表示するフロア</span>
      <select data-floor-select aria-label="マップの階層切り替え">
        ${tabs
          .map(
            (tab) => `
              <option value="${escapeHTML(tab.id)}" ${pageState.floorId === tab.id ? 'selected' : ''}>
                ${escapeHTML(tab.label)}
              </option>
            `,
          )
          .join('')}
      </select>
    </label>
  `;
}

function renderFloorDirectory(context, selectedLocationId) {
  const floor = getFloorBlueprint(pageState.floorId);
  const groups = [...(floor.groups ?? [])];

  return `
    <div class="festival-map__directory">
      ${groups
        .map(
          (group) => `
            <button class="festival-map__directory-group ${group.locationId === selectedLocationId ? 'is-active' : ''}" data-location-select="${escapeHTML(group.locationId)}" type="button">
              <div class="festival-map__directory-head">
                <strong>${escapeHTML(group.title)}</strong>
                ${group.locationId === selectedLocationId ? '<span>選択中</span>' : ''}
              </div>
              <div class="inline-tags inline-tags--wrap">
                ${(group.items ?? []).map((item) => renderTag(item, 'neutral')).join('')}
              </div>
            </button>
          `,
        )
        .join('')}
    </div>
  `;
}

function renderFloorNote(context, selectedLocation) {
  const floor = getFloorBlueprint(pageState.floorId);
  const hasSelectedLocation = (floor.groups ?? []).some((group) => group.locationId === selectedLocation.id)
    || (floor.regions ?? []).some((region) => region.locationId === selectedLocation.id);

  if (pageState.floorId === 'campus') {
    return '';
  }

  return `
    <div class="festival-map__note ${hasSelectedLocation ? 'is-visible' : 'is-muted'}">
      ${hasSelectedLocation
        ? `${escapeHTML(selectedLocation.name)} に関係する部屋をこのフロア上で強調表示しています。`
        : `${escapeHTML(selectedLocation.name)} はこのフロアには直接表示されません。全体タブか該当フロアで確認してください。`}
    </div>
  `;
}

function renderMapPullup(context, selectedLocation, locationEvents, locationFood) {
  const expanded = pageState.sheetExpanded;
  return `
    <aside class="map-pullup ${expanded ? 'is-expanded' : ''}" aria-label="選択中の場所の詳細">
      <button class="map-pullup__handle" type="button" data-map-sheet-toggle aria-expanded="${String(expanded)}">
        <span class="map-pullup__bar" aria-hidden="true"></span>
        <span class="map-pullup__summary">
          <span class="map-pullup__eyebrow">選択中</span>
          <strong>${escapeHTML(selectedLocation.name)}</strong>
          <small>${locationEvents.length}件の企画 / ${locationFood.length}件の飲食</small>
        </span>
        <span class="map-pullup__chevron" aria-hidden="true">${expanded ? '下げる' : '上げる'}</span>
      </button>

      <div class="map-pullup__body">
        <div class="stack stack--sm">
          <div class="inline-tags inline-tags--wrap">
            ${renderTag(selectedLocation.zone, 'neutral')}
            ${renderTag(venueLabel(selectedLocation.areaType), selectedLocation.areaType === 'outdoor' ? 'outdoor' : 'indoor')}
          </div>
          <h2>${escapeHTML(selectedLocation.name)}</h2>
          <p>${escapeHTML(selectedLocation.description)}</p>
        </div>

        <div class="stack stack--md">
          <div class="stack stack--sm">
            <div class="results-meta">
              <strong>${locationEvents.length}件の企画</strong>
              <span>${escapeHTML(context.getText('map-projects-note', 'このエリアにある常設企画'))}</span>
            </div>
            ${locationEvents.length > 0
              ? locationEvents.map((event) => renderCompactEventRow(event, context.getEventRelations(event), context.isFavorite(event.id))).join('')
              : renderEmptyState('このエリアに企画はありません', '別の場所を選ぶと企画が見られます。', '/projects', '企画を見る')}
          </div>


          ${locationFood.length > 0
            ? `
              <div class="stack stack--sm">
                <div class="results-meta">
                  <strong>${locationFood.length}件の飲食</strong>
                  <span>${escapeHTML(context.getText('map-food-note', 'このエリアで立ち寄れる飲食'))}</span>
                </div>
                <div class="inline-tags inline-tags--wrap">
                  ${locationFood.map((item) => renderTag(item.name, 'neutral')).join('')}
                </div>
              </div>
            `
            : ''}
        </div>
      </div>
    </aside>
  `;
}

export const mapPage = {
  render(context, route) {
    const selectedLocation = getSelectedLocation(context, route);
    const floor = getFloorBlueprint(pageState.floorId);
    const locationEvents = getProjectsAtLocation(context, selectedLocation.id);
    const locationFood = getFoodAtLocation(context, selectedLocation.id);

    return `
      <section class="section-block">
        ${renderSectionHeader('マップ', context.getText('map-page-subtitle', '全体図と各階の詳細を、同じ見た目の統合マップで切り替えられます'))}
        ${renderFloorTabs(context)}
        <article class="map-card map-card--unified">
          <div class="festival-map__meta">
            <div>
              <h3>${escapeHTML(floor.title)}</h3>
              <p>${escapeHTML(floor.description || '')}</p>
            </div>
            <div class="map-legend map-legend--inline map-legend--simple">
              <div class="legend-item"><span class="legend-box"></span> 施設・教室</div>
              <div class="legend-item"><span class="legend-dot legend-dot--selected"></span> 選択中</div>
            </div>
          </div>
          <div class="festival-map__canvas">
            ${renderFloorMap(context, selectedLocation.id)}
          </div>
          ${renderFloorNote(context, selectedLocation)}
        </article>
      </section>


      <section class="section-block section-block--tight-top section-block--map-pullup">
        ${renderMapPullup(context, selectedLocation, locationEvents, locationFood)}
      </section>
    `;
  },

  bind(root, context) {
    root.querySelectorAll('[data-room-project]').forEach((node) => {
      const openProject = () => {
        context.navigate(`/projects/${node.dataset.roomProject}`);
      };

      node.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        openProject();
      });
      node.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openProject();
        }
      });
    });

    root.querySelectorAll('[data-location-select]').forEach((node) => {
      const selectLocation = () => {
        pageState.selectedLocationId = node.dataset.locationSelect;
        pageState.sheetExpanded = true;
        context.render();
      };

      node.addEventListener('click', selectLocation);
      node.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          selectLocation();
        }
      });
    });

    root.querySelector('[data-floor-select]')?.addEventListener('change', (event) => {
      pageState.floorId = event.currentTarget.value;
      context.render();
    });

    root.querySelector('[data-map-sheet-toggle]')?.addEventListener('click', () => {
      pageState.sheetExpanded = !pageState.sheetExpanded;
      context.render();
    });
  },
};
