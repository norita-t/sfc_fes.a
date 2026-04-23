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
          'quick-link--home-primary',
        )}
        ${renderQuickLink(
          '企画',
          '/projects',
          '一覧の表示や条件検索で企画を探せます。',
          'assets/img/attractions.png',
          '',
          'quick-link--home-primary',
        )}
        ${renderQuickLink(
          'ステージ公演',
          '/stage',
          '開演時間と会場（ステージ）をまとめて確認。',
          'assets/img/event.png',
          '',
          'quick-link--home-primary',
        )}
        ${renderQuickLink(
          '飲食',
          '/food',
          '模擬店・フードの情報をチェックできます。',
          'assets/img/food.png',
          '',
          'quick-link--home-secondary',
        )}
        ${renderQuickLink(
          'お気に入り',
          '/favorites',
          '登録した企画へすぐ飛べます。',
          'assets/img/map.png',
          '',
          'quick-link--home-secondary',
        )}
      </section>
    `;
  },

  bind() {},
};
