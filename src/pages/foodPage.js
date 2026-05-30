import { renderFoodCard } from '../components/cards.js';
import { renderEmptyState, renderSectionHeader } from '../components/ui.js';
import { escapeHTML } from '../utils/helpers.js';

const pageState = {
  store: 'all',
};

function getStoreFilters(context) {
  const stores = Array.from(new Set(context.data.foodBooths.map((item) => item.boothName).filter(Boolean)));
  return [{ id: 'all', label: 'すべての店舗' }, ...stores.map((store) => ({ id: store, label: store }))];
}

function getFilteredItems(context) {
  return context.data.foodBooths.filter((item) => pageState.store === 'all' || item.boothName === pageState.store);
}

function renderFoodVenueGuide(context) {
  const venueNote = context.getText(
    'food-venue-note',
    '飲食会場は第一体育館内のみです。商品を決めたら、マップから第一体育館の位置を確認できます。',
  );

  return `
    <article class="food-venue-guide food-venue-guide--compact">
      <div class="food-venue-guide__body">
        <p class="food-venue-guide__eyebrow">飲食会場</p>
        <h3>第一体育館内</h3>
        <p>${escapeHTML(venueNote)}</p>
      </div>
      <button class="secondary-button food-venue-guide__button" data-map-location="gym-complex">マップで見る</button>
    </article>
  `;
}

export const foodPage = {
  render(context) {
    const items = getFilteredItems(context);
    const storeFilters = getStoreFilters(context);

    return `
      <section class="section-block section-block--flat food-page-panel">
        ${renderSectionHeader('飲食', context.getText('food-page-subtitle', '第一体育館内の飲食を、店舗名から商品単位で探せます'))}
        ${renderFoodVenueGuide(context)}

        <div class="filter-panel filter-panel--dropdowns food-filter-panel">
          <label class="field">
            <span class="field__label">店舗名</span>
            <select class="field__select" data-food-store-select>
              ${storeFilters
                .map((store) => `<option value="${escapeHTML(store.id)}" ${pageState.store === store.id ? 'selected' : ''}>${escapeHTML(store.label)}</option>`)
                .join('')}
            </select>
          </label>
        </div>

        <div class="food-results-list">
          ${items.length > 0
            ? items.map((item) => renderFoodCard(item, context.getFoodRelations(item))).join('')
            : renderEmptyState('該当する飲食がありません', '別の店舗を選ぶと候補が表示されます。', '/food', '飲食一覧へ')}
        </div>
      </section>
    `;
  },

  bind(root, context) {
    root.querySelector('[data-food-store-select]')?.addEventListener('change', (event) => {
      pageState.store = event.currentTarget.value;
      context.render();
    });
  },
};
