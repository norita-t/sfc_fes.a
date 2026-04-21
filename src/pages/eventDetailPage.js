import { renderCompactEventRow } from '../components/cards.js';
import {
  renderEmptyState,
  renderMediaFrame,
  renderMetaRow,
  renderProjectTypeTag,
  renderSectionHeader,
} from '../components/ui.js';
import { escapeHTML, splitProjectName } from '../utils/helpers.js';
import { getRelatedEvents } from '../utils/recommendations.js';


function getProjectGroupLabel(event) {
  return event.projectGroupLabel || {
    class: 'クラス企画',
    club: '文連企画',
    teacher: '教員企画',
    volunteer: '有志企画',
  }[event.projectGroupId] || '';
}

export const eventDetailPage = {
  render(context, route) {
    const event = context.data.events.find((item) => item.id === route.params.eventId);

    if (!event) {
      return renderEmptyState('企画が見つかりません', '一覧ページから別の企画を選んでください。', '/projects', '企画一覧へ');
    }

    const relations = context.getEventRelations(event);
    const related = getRelatedEvents(event, context.data.events, 3);
    const favorite = context.isFavorite(event.id);
    const { title: displayTitle, organizer } = splitProjectName(event.name);

    return `
      <section class="detail-hero">
        <div class="detail-hero__media">
          ${renderMediaFrame({ imageUrl: event.imageUrl, alt: event.imageAlt || displayTitle || event.name, label: event.imageAlt || displayTitle || event.name, aspect: 'detail' })}
        </div>
        <div class="detail-hero__body">
          <div class="detail-hero__topline">
            <button class="back-link" data-route="/projects">← 企画一覧に戻る</button>
          </div>
          <div class="inline-tags">
            ${renderProjectTypeTag(event.projectType)}
            ${getProjectGroupLabel(event) ? `<span class="tag tag--neutral">${escapeHTML(getProjectGroupLabel(event))}</span>` : ''}
            <span class="tag tag--accent">${escapeHTML(relations.category?.jpLabel ?? '企画')}</span>
          </div>
          <h2>${escapeHTML(displayTitle || event.name)}</h2>
          <p class="detail-hero__description">${escapeHTML(event.description)}</p>

          <div class="detail-actions">
            <button class="primary-button" data-favorite-id="${escapeHTML(event.id)}" aria-pressed="${String(favorite)}">
              ${favorite ? 'お気に入り解除' : 'お気に入りに追加'}
            </button>
            <button class="secondary-button" data-map-location="${escapeHTML(event.locationId)}">地図で見る</button>
          </div>
        </div>
      </section>

      <section class="section-block">
        ${renderSectionHeader('企画情報', context.getText('project-detail-info-subtitle', '固定の場所で開催期間中を通して楽しめる企画です'))}
        <div class="detail-meta-card">
          ${renderMetaRow('開催形式', event.projectType === 'outdoor' ? '屋外企画' : '教室企画')}
          ${renderMetaRow('ラベル', relations.category?.jpLabel ?? '未設定')}
          ${getProjectGroupLabel(event) ? renderMetaRow('企画区分', getProjectGroupLabel(event)) : ''}
          ${event.pamphletPage ? renderMetaRow('パンフ掲載', event.pamphletPage) : ''}
          ${renderMetaRow('場所', relations.location?.name ?? '未設定')}
          ${renderMetaRow('詳細スポット', event.spotLabel || 'エリア内案内を参照')}
          ${renderMetaRow('開催期間', '開催期間中は終日開催')}
        </div>
      </section>

      <section class="section-block">
        ${renderSectionHeader('あわせて見たい企画', context.getText('project-detail-related-subtitle', '近いカテゴリや近くのエリアからおすすめを表示します'))}
        <div class="stack">
          ${related.map((item) => renderCompactEventRow(item, context.getEventRelations(item), context.isFavorite(item.id))).join('')}
        </div>
      </section>
    `;
  },

  bind() {},
};
