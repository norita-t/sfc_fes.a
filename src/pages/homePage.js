import { festivalTheme } from '../data/mockData.js';
import { renderQuickLink, renderThemeIllustration } from '../components/ui.js';

export const homePage = {
  render(context) {
    return `


      <section class="quick-grid quick-grid--home">
        ${renderQuickLink(
          'マップ',
          '/map',
          '地図から企画やトイレ等の検索が可能です。',
          'assets/img/map.png',
          'quick-link__hint--map-pop',
        )}
        ${renderQuickLink('企画', '/projects', '全ての企画あああり込み検索が可能です。', "assets/img/attractions.png")}
        ${renderQuickLink('ステージ公演', '/stage', '公演の時間と場所の確認をすることができます。', "assets/img/event.png")}
        ${renderQuickLink('飲食', '/food', 'あああああ。', "assets/img/food.png")}
        ${renderQuickLink('お気に入り', '/favorites', '保存した企画', "assets/img/map.png")}
      </section>
    `;
  },

  bind() {},
};
