import { getThemeToggleIcon, getThemeToggleLabel, getActiveTheme } from '../utils/theme.js';

export function renderShell({ routeName, pageClass = '', content }) {
  const shellModeClass = routeName === 'admin' ? 'app-shell--admin' : 'app-shell--public';
  const activeTheme = getActiveTheme();
  const themeIcon = getThemeToggleIcon();
  const themeLabel = getThemeToggleLabel();
  const isHome = routeName === 'home';
  const homeBackRail = isHome
    ? ''
    : `<nav class="app-home-rail" aria-label="ホームに戻る">
          <button class="app-home-rail__link" type="button" data-route="/" aria-label="ホームへ戻る">
            <span class="app-home-rail__arrow" aria-hidden="true">←</span>ホーム
          </button>
        </nav>`;

  return `
    <div class="app-shell ${shellModeClass}">
      <div class="app-sticky-chrome">
        <header class="app-header">
          <div>
            <p class="app-header__eyebrow app-header__eyebrow--spark">Spark!</p>
            <h1 class="app-header__title">SFC Festival Guide</h1>
          </div>
          <div class="app-header__actions">
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
        ${homeBackRail}
      </div>
      <main class="page ${pageClass}">
        ${content}
      </main>
    </div>
  `;
}
