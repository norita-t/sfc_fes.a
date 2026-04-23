import { renderBottomNav } from './bottomNav.js';
import { getThemeToggleIcon, getThemeToggleLabel, getActiveTheme } from '../utils/theme.js';

export function renderShell({ routeName, pageClass = '', content }) {
  const shellModeClass = routeName === 'admin' ? 'app-shell--admin' : 'app-shell--public';
  const activeTheme = getActiveTheme();
  const themeIcon = getThemeToggleIcon();
  const themeLabel = getThemeToggleLabel();
  const homeButton =
    routeName === 'home'
      ? ''
      : `<button class="header-chip-button header-chip-button--home" type="button" data-route="/" aria-label="ホームに戻る">ホーム<span class="header-chip-button__arrow" aria-hidden="true">⇒</span></button>`;

  return `
    <div class="app-shell ${shellModeClass}">
      <header class="app-header">
        <div>
          <p class="app-header__eyebrow">Keio SFC School Festival</p>
          <h1 class="app-header__title">SFC Festival Guide</h1>
        </div>
        <div class="app-header__actions">
          ${homeButton}
          <button
            class="theme-toggle"
            type="button"
            data-theme-toggle
            aria-label="白テーマとダークモードを切り替え"
            aria-pressed="${activeTheme === 'dark' ? 'true' : 'false'}"
          >
            <span class="theme-toggle__icon theme-toggle__icon--${themeIcon}" aria-hidden="true"></span>
            <span class="theme-toggle__label">${themeLabel}</span>
          </button>
          <button class="header-chip-button ${routeName === 'favorites' ? 'is-active' : ''}" data-route="/favorites">お気に入り</button>
          <button class="header-chip-button ${routeName === 'admin' ? 'is-active' : ''}" data-route="/admin">管理</button>
        </div>
      </header>
      <main class="page ${pageClass}">
        ${content}
      </main>
      ${renderBottomNav(routeName)}
    </div>
  `;
}
