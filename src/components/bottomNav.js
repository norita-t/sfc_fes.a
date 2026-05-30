const items = [
  { route: '/', label: 'ホーム', icon: 'home', match: ['home'] },
  { route: '/projects', label: '企画', icon: 'projects', match: ['events', 'event-detail'] },
  { route: '/map', label: 'マップ', icon: 'map', match: ['map'] },
  { route: '/stage', label: 'ステージ', icon: 'stage', match: ['timetable', 'stage-detail'] },
  { route: '/food', label: '飲食', icon: 'food', match: ['food'] },
];

function renderNavIcon(icon) {
  const common = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"';
  const paths = {
    home: '<path d="M3 11.5L12 4l9 7.5" /><path d="M6.5 10.5V20h11V10.5" />',
    projects: '<rect x="4.5" y="5" width="15" height="14" rx="3" /><path d="M8 9.5h8" /><path d="M8 13h5" />',
    map: '<path d="M4 6l5-2 6 2 5-2v14l-5 2-6-2-5 2z" /><path d="M9 4v14" /><path d="M15 6v14" />',
    stage: '<path d="M5 7h14" /><path d="M7.5 7v9" /><path d="M16.5 7v9" /><path d="M9 16h6" /><path d="M12 12v4" />',
    food: '<path d="M8 4v8" /><path d="M6 4v4" /><path d="M10 4v4" /><path d="M8 12v8" /><path d="M16 4c-1.7 1.4-2.5 3-2.5 4.8V20" />',
  };

  return `<svg class="bottom-nav__icon" ${common} aria-hidden="true">${paths[icon] ?? paths.home}</svg>`;
}

export function renderBottomNav(activeRouteName) {
  return `
    <nav class="bottom-nav" aria-label="主要ナビゲーション">
      ${items
        .map(
          (item) => `
            <button
              class="bottom-nav__item ${item.match.includes(activeRouteName) ? 'is-active' : ''}"
              data-route="${item.route}"
            >
              <span class="bottom-nav__icon-box">${renderNavIcon(item.icon)}</span>
              <span class="bottom-nav__label">${item.label}</span>
            </button>
          `,
        )
        .join('')}
    </nav>
  `;
}
