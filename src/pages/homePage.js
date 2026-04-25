import { festivalTheme } from '../data/mockData.js';
import { renderQuickLink, renderThemeIllustration } from '../components/ui.js';

export const homePage = {
  render(context) {
    return `


    <section class="quick-grid quick-grid--home3">
      <img src="assets/img/date.png" alt="日にち">

      <img src="assets/img/date.png" alt="日にち">
    </section>

    <section class="quick-grid quick-grid--home">
      ${renderQuickLink('マ', '/map', 'Map', "assets/img/map.png")}
      ${renderQuickLink('企画', '/projects', 'Projects', "assets/img/attractions.png")}
      ${renderQuickLink('ステージ公演', '/stage', 'Stage events', "assets/img/event.png")}
      ${renderQuickLink('飲食', '/food', 'Foods', "assets/img/food.png")}
    </section>

    <div class="slider">
      <div class="slider-track" id="sliderTrack">
      <img src="assets/img/1.jpg" alt="画像1">
      <img src="assets/img/2.jpg" alt="画像2">
      <img src="assets/img/3.jpg" alt="画像3">
    </div>

</div>
    `;
  },

  bind() {},
};

//   ${renderQuickLink('お気に入り', '/favorites', '保存した企画', "assets/img/map.png")}