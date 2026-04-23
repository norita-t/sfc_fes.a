import { renderQuickLink } from '../components/ui.js';
import { escapeHTML } from '../utils/helpers.js';

function formatAnnouncementParagraphs(text) {
  const raw = String(text ?? '').trim();
  if (!raw) {
    return '';
  }
  return raw
    .split(/\n+/)
    .map((p) => `<p class="home-announcements__para">${escapeHTML(p)}</p>`)
    .join('');
}

function renderAnnouncementsBlock(announcements) {
  const items = [...(announcements ?? [])]
    .filter((a) => a && String(a.title || '').trim())
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  const listHtml =
    items.length > 0
      ? `<ul class="home-announcements__list" role="list">
        ${items
          .map(
            (n) => `
        <li class="home-announcements__item">
          <h3 class="home-announcements__title">${escapeHTML(n.title)}</h3>
          <div class="home-announcements__body">
            ${formatAnnouncementParagraphs(n.body)}
          </div>
        </li>
      `,
          )
          .join('')}
      </ul>`
      : `<p class="home-announcements__empty">掲載中のお知らせはありません。追加・編集は <strong>管理</strong> 画面の <strong>お知らせ</strong> タブから行えます。</p>`;
  return `
    <section class="home-announcements" aria-labelledby="home-announcements-heading">
      <h2 id="home-announcements-heading" class="home-announcements__heading">お知らせ</h2>
      ${listHtml}
    </section>
  `;
}

export const homePage = {
  render(context) {
    return `


      <section class="quick-grid quick-grid--home">
        ${renderQuickLink('マッaaaaaaaプ', '/map', '', 'assets/img/map.png', '', 'quick-link--home-primary')}
        ${renderQuickLink('企画', '/projects', '', 'assets/img/attractions.png', '', 'quick-link--home-primary')}
        ${renderQuickLink('ステージ公演', '/stage', '', 'assets/img/event.png', '', 'quick-link--home-primary')}
        ${renderQuickLink('飲食', '/food', '', 'assets/img/food.png', '', 'quick-link--home-secondary')}
        ${renderQuickLink(
          'お気に入り',
          '/favorites',
          '',
          'assets/img/map.png',
          '',
          'quick-link--home-secondary',
        )}
      </section>
      ${renderAnnouncementsBlock(context.data?.announcements)}
    `;
  },

  bind() {},
};
