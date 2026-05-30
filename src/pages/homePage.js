import { festivalTheme } from '../data/mockData.js';
import { renderQuickLink, renderThemeIllustration } from '../components/ui.js';

export const homePage = {
  render(context) {
    return `


    <section class="quick-grid quick-grid--home3">
      <img class="home-img"img src="assets/img/date.png" alt="日にち">
      <img class="home-title-img"img src="assets/img/文化祭.png" alt="日にち">
      <img class="home-img"img src="assets/img/date.png" alt="日にち">
    </section>

    <section class="quick-grid quick-grid--home">
      ${renderQuickLink('マップ', '/map', 'Map', 'assets/img/map.png')}
      ${renderQuickLink('企画', '/projects', 'Projects', 'assets/img/attractions.png')}
      ${renderQuickLink('ステージ公演', '/stage', 'Stage events', "assets/img/event.png")}
      ${renderQuickLink('飲食', '/food', 'Foods', "assets/img/food.png")}
    </section>

  

</div>
    `;
  },

  bind() {},
};

//   ${renderQuickLink('お気に入り', '/favorites', '保存した企画', "assets/img/map.png")}
