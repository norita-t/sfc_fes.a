const THEME_KEY = 'sfc-festival-guide-theme-v2';
const DARK_THEME_COLOR = '#0b1020';
const LIGHT_THEME_COLOR = '#ffffff';

function readSavedTheme() {
  try {
    return window.localStorage.getItem(THEME_KEY);
  } catch {
    return null;
  }
}

function writeSavedTheme(theme) {
  try {
    window.localStorage.setItem(THEME_KEY, theme);
  } catch {
    // localStorage が使えない環境でも表示は継続する
  }
}

function normalizeTheme(theme) {
  return theme === 'dark' ? 'dark' : 'light';
}

function updateThemeColor(theme) {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute('content', theme === 'dark' ? DARK_THEME_COLOR : LIGHT_THEME_COLOR);
  }
}

export function getActiveTheme() {
  const domTheme = document.documentElement.dataset.theme;
  return normalizeTheme(domTheme || readSavedTheme());
}

export function applyTheme(theme, { persist = true } = {}) {
  const normalizedTheme = normalizeTheme(theme);
  document.documentElement.dataset.theme = normalizedTheme;
  document.documentElement.style.colorScheme = normalizedTheme;
  updateThemeColor(normalizedTheme);

  if (persist) {
    writeSavedTheme(normalizedTheme);
  }

  return normalizedTheme;
}

export function initTheme() {
  return applyTheme(readSavedTheme() || document.documentElement.dataset.theme || 'light', { persist: false });
}

export function toggleTheme() {
  const nextTheme = getActiveTheme() === 'dark' ? 'light' : 'dark';
  return applyTheme(nextTheme);
}

export function getThemeToggleLabel() {
  return getActiveTheme() === 'dark' ? '白' : '暗';
}

export function getThemeToggleIcon() {
  return getActiveTheme() === 'dark' ? 'sun' : 'moon';
}
