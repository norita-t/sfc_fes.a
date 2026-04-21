import { FestivalGuideApp } from './app.js';
import { browserFestivalRepository } from './services/browserFestivalRepository.js';
import { initTheme } from './utils/theme.js';

initTheme();

const root = document.querySelector('#app');

const app = new FestivalGuideApp({
  root,
  repository: browserFestivalRepository,
});

app.init();
