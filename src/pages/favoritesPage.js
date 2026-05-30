import { renderEventCard } from '../components/cards.js';
import { renderEmptyState, renderSectionHeader } from '../components/ui.js';

export const favoritesPage = {
  render(context) {
    const favoriteEvents = context.data.events.filter((event) => context.favorites.includes(event.id));

    return `
      <section class="section-block">
        ${renderSectionHeader('お気に入り', context.getText('favorites-page-subtitle', '気になる企画を保存してあとでまとめて見返せます'))}
        <div class="results-meta">
          <strong>${favoriteEvents.length}件を保存中</strong>
          <span>ブラウザのローカル保存を利用しています</span>
        </div>
      </section>

      <section class="section-block section-block--tight-top">
        <div class="stack">
          ${favoriteEvents.length > 0
            ? favoriteEvents.map((event) => renderEventCard(event, context.getEventRelations(event), true)).join('')
            : renderEmptyState('まだお気に入りがありません', '企画一覧や詳細ページの ★ ボタンから保存できます。', '/projects', '企画一覧へ')}
        </div>
      </section>
    `;
  },

  bind() {},
};
