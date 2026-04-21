import { renderEventCard } from '../components/cards.js';
import { renderEmptyState, renderSectionHeader } from '../components/ui.js';
import { escapeHTML } from '../utils/helpers.js';

const pageState = {
  search: '',
  categoryId: 'all',
  projectType: 'all',
  locationId: 'all',
};

let searchRenderTimer = 0;

function renderSearchResults(context, input, delay = 120) {
  const selectionRange = {
    start: input.selectionStart ?? input.value.length,
    end: input.selectionEnd ?? input.value.length,
  };

  window.clearTimeout(searchRenderTimer);
  searchRenderTimer = window.setTimeout(() => {
    context.render({ focusSelector: '#events-search', selectionRange });
  }, delay);
}

function getFilteredEvents(context) {
  const searchText = pageState.search.trim().toLowerCase();

  return [...context.data.events]
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
    .filter((event) => {
      const relations = context.getEventRelations(event);
      const haystack = [
        event.name,
        event.shortDescription,
        event.description,
        event.spotLabel,
        relations.location?.name,
        relations.category?.jpLabel,
        event.projectGroupLabel,
      ]
        .join(' ')
        .toLowerCase();

      return (!searchText || haystack.includes(searchText))
        && (pageState.categoryId === 'all' || event.categoryId === pageState.categoryId)
        && (pageState.projectType === 'all' || event.projectType === pageState.projectType)
        && (pageState.locationId === 'all' || event.locationId === pageState.locationId);
    });
}

function renderSelectOptions(options, selectedValue) {
  return options
    .map((option) => `
      <option value="${escapeHTML(option.id)}" ${selectedValue === option.id ? 'selected' : ''}>
        ${escapeHTML(option.label)}
      </option>
    `)
    .join('');
}

function getCategoryOptions(context) {
  return [
    { id: 'all', label: 'すべて' },
    ...context.data.categories.map((category) => ({ id: category.id, label: category.jpLabel })),
  ];
}

function getProjectTypeOptions() {
  return [
    { id: 'all', label: 'すべて' },
    { id: 'classroom', label: '教室企画' },
    { id: 'outdoor', label: '屋外企画' },
  ];
}

function getVisibleLocationOptions(context) {
  if (pageState.projectType === 'classroom') {
    return context.data.locations.filter((location) => location.id !== 'lawn');
  }

  if (pageState.projectType === 'outdoor') {
    return context.data.locations.filter((location) => location.id === 'lawn');
  }

  return context.data.locations;
}

function normalizeLocationFilter(context) {
  const visibleLocationIds = new Set(getVisibleLocationOptions(context).map((location) => location.id));

  if (pageState.projectType === 'outdoor') {
    pageState.locationId = visibleLocationIds.has('lawn') ? 'lawn' : 'all';
    return;
  }

  if (pageState.locationId !== 'all' && !visibleLocationIds.has(pageState.locationId)) {
    pageState.locationId = 'all';
  }
}

function getLocationOptions(context) {
  const locations = getVisibleLocationOptions(context).map((location) => ({ id: location.id, label: location.name }));

  if (pageState.projectType === 'outdoor') {
    return locations;
  }

  return [{ id: 'all', label: 'すべて' }, ...locations];
}

function renderProjectFilters(context) {
  return `
    <div class="filter-panel filter-panel--dropdowns">
      <label class="field field--search">
        <span class="field__label">検索</span>
        <input id="events-search" class="field__input" type="search" value="${escapeHTML(pageState.search)}" placeholder="企画名・場所・説明で検索" />
      </label>

      <div class="dropdown-filter-grid" aria-label="企画絞り込み">
        <label class="field">
          <span class="field__label">ラベル</span>
          <select class="field__select" data-category-select>
            ${renderSelectOptions(getCategoryOptions(context), pageState.categoryId)}
          </select>
        </label>

        <label class="field">
          <span class="field__label">種別</span>
          <select class="field__select" data-project-type-select>
            ${renderSelectOptions(getProjectTypeOptions(), pageState.projectType)}
          </select>
        </label>

        <label class="field">
          <span class="field__label">場所</span>
          <select class="field__select" data-location-select>
            ${renderSelectOptions(getLocationOptions(context), pageState.locationId)}
          </select>
        </label>
      </div>
    </div>
  `;
}

export const eventsPage = {
  render(context) {
    normalizeLocationFilter(context);
    const filteredEvents = getFilteredEvents(context);

    return `
      <section class="section-block section-block--flat project-page-panel">
        ${renderSectionHeader('企画', context.getText('projects-page-subtitle', '教室企画と屋外企画を、検索と絞り込みで探せます'))}
        ${renderProjectFilters(context)}

        <div class="project-results-list">
          ${filteredEvents.length === 0
            ? renderEmptyState('条件に合う企画が見つかりません', '検索語や絞り込みを少し広げると候補が表示されます。', '/projects', '企画一覧へ')
            : filteredEvents.map((event) => renderEventCard(event, context.getEventRelations(event), context.isFavorite(event.id))).join('')}
        </div>
      </section>
    `;
  },

  bind(root, context) {
    const searchInput = root.querySelector('#events-search');
    if (searchInput) {
      let isComposing = false;

      searchInput.addEventListener('compositionstart', () => {
        isComposing = true;
      });

      searchInput.addEventListener('compositionend', (event) => {
        isComposing = false;
        pageState.search = event.target.value;
        renderSearchResults(context, event.target, 0);
      });

      searchInput.addEventListener('input', (event) => {
        pageState.search = event.target.value;
        if (isComposing || event.isComposing) {
          return;
        }
        renderSearchResults(context, event.target);
      });

      searchInput.addEventListener('search', (event) => {
        pageState.search = event.target.value;
        renderSearchResults(context, event.target, 0);
      });
    }

    root.querySelector('[data-category-select]')?.addEventListener('change', (event) => {
      pageState.categoryId = event.currentTarget.value;
      context.render();
    });

    root.querySelector('[data-project-type-select]')?.addEventListener('change', (event) => {
      pageState.projectType = event.currentTarget.value;
      normalizeLocationFilter(context);
      context.render();
    });

    root.querySelector('[data-location-select]')?.addEventListener('change', (event) => {
      pageState.locationId = event.currentTarget.value;
      context.render();
    });
  },
};
