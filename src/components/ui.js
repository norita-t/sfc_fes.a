import {
  crowdToMeta,
  escapeHTML,
  projectTypeLabel,
  projectTypeToMeta,
  venueLabel,
} from '../utils/helpers.js';

export function renderCrowdBadge(crowdLevel) {
  const meta = crowdToMeta(crowdLevel);
  return `<span class="badge badge--${meta.tone}">${escapeHTML(meta.jpLabel)}</span>`;
}

export function renderTag(text, tone = 'neutral') {
  return `<span class="tag tag--${tone}">${escapeHTML(text)}</span>`;
}

export function renderProjectTypeTag(projectType) {
  const meta = projectTypeToMeta(projectType);
  return renderTag(projectTypeLabel(projectType), meta.tone);
}

export function renderVenueTag(areaType) {
  return renderTag(venueLabel(areaType), areaType === 'outdoor' ? 'outdoor' : 'indoor');
}

export function renderSectionHeader(title, subtitle = '') {
  return `
    <div class="section-header">
      <div>
        <h2>${escapeHTML(title)}</h2>
        ${subtitle ? `<p>${escapeHTML(subtitle)}</p>` : ''}
      </div>
    </div>
  `;
}

export function renderStatCard(label, value, note = '') {
  return `
    <article class="stat-card">
      <span class="stat-card__label">${escapeHTML(label)}</span>
      <strong class="stat-card__value">${escapeHTML(value)}</strong>
      ${note ? `<span class="stat-card__note">${escapeHTML(note)}</span>` : ''}
    </article>
  `;
}

function renderPictogramIcon(icon) {
  const common = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"';
  const icons = {
    map: '<path d="M4 6l5-2 6 2 5-2v14l-5 2-6-2-5 2z" /><path d="M9 4v14" /><path d="M15 6v14" />',
    projects: '<rect x="4.5" y="5" width="15" height="14" rx="3" /><path d="M8 9.5h8" /><path d="M8 13h5" /><path d="M8 16.5h6" />',
    stage: '<path d="M5 7h14" /><path d="M7.5 7v9.5" /><path d="M16.5 7v9.5" /><path d="M9 16.5h6" /><path d="M12 11.5v5" />',
    food: '<path d="M8 4v8" /><path d="M6 4v4.5" /><path d="M10 4v4.5" /><path d="M8 12v8" /><path d="M16 4c-1.7 1.4-2.5 3.1-2.5 5V20" /><path d="M16 4v16" />',
    favorite: '<path d="M12 3.8l2.55 5.17 5.7.83-4.12 4.02.97 5.68L12 16.82 6.9 19.5l.97-5.68L3.75 9.8l5.7-.83z" />',
  };

  if (icons[icon]) {
    return `<svg class="quick-link__svg" ${common} aria-hidden="true">${icons[icon]}</svg>`;
  }

  return `<span class="quick-link__letter">${escapeHTML(icon)}</span>`;
}

export function renderQuickLink(label, route, hint, icon) {

    console.log(icon);
    const iconHTML = icon
        ? `<img src="${escapeHTML(icon)}" alt="" />`
        : escapeHTML(label.slice(0, 1));


    return `
    <button class="quick-link" data-route="${escapeHTML(route)}">
      <span class="quick-link__icon" aria-hidden="true">
        ${iconHTML}
      </span>
      <span class="quick-link__body">
        <strong>${escapeHTML(label)}</strong>
        <span>${escapeHTML(hint)}</span>
      </span>
    </button>
  `;
}

export function renderMetaRow(label, value) {
  return `
    <div class="meta-row">
      <span class="meta-row__label">${escapeHTML(label)}</span>
      <span class="meta-row__value">${escapeHTML(value)}</span>
    </div>
  `;
}

export function renderEmptyState(title, description, route = '/projects', buttonLabel = '企画一覧へ') {
  return `
    <section class="empty-state">
      <div class="empty-state__icon">○</div>
      <h3>${escapeHTML(title)}</h3>
      <p>${escapeHTML(description)}</p>
      <button class="primary-button" data-route="${escapeHTML(route)}">${escapeHTML(buttonLabel)}</button>
    </section>
  `;
}

export function renderImagePlaceholder(label, aspect = 'square') {
  return `
    <div class="image-placeholder image-placeholder--${escapeHTML(aspect)}" aria-hidden="true">
      <span>${escapeHTML(label)}</span>
    </div>
  `;
}




export function renderMediaFrame({ imageUrl = '', alt = '', label = '画像', aspect = 'square' } = {}) {
  if (imageUrl) {
    return `
      <div class="media-frame media-frame--${escapeHTML(aspect)}">
        <img class="media-frame__image" src="${escapeHTML(imageUrl)}" alt="${escapeHTML(alt || label)}" loading="lazy" />
      </div>
    `;
  }

  return `
    <div class="media-frame media-frame--${escapeHTML(aspect)}">
      ${renderImagePlaceholder(label, aspect)}
    </div>
  `;
}

export function renderThemeIllustration(theme = {}) {
  const normalized = typeof theme === 'string'
    ? { label: theme }
    : {
      imageUrl: theme.imageUrl || '',
      alt: theme.alt || theme.title || theme.placeholderLabel || '今年のテーマイラスト',
      label: theme.placeholderLabel || theme.title || '今年のテーマイラスト',
    };

  if (normalized.imageUrl) {
    return `
      <div class="theme-art theme-art--poster theme-art--media" role="img" aria-label="${escapeHTML(normalized.alt)}">
        <img class="theme-art__image" src="${escapeHTML(normalized.imageUrl)}" alt="${escapeHTML(normalized.alt)}" loading="eager" />
      </div>
    `;
  }

  return `
    <svg class="theme-art theme-art--poster" viewBox="0 0 720 1018.2337649" role="img" aria-label="${escapeHTML(normalized.label)}">
      <defs>
        <linearGradient id="posterBg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="100%" stop-color="#f7fbff" />
        </linearGradient>
        <linearGradient id="posterBlue" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#2563eb" />
          <stop offset="100%" stop-color="#1d4ed8" />
        </linearGradient>
        <linearGradient id="posterRose" x1="0" x2="1" y1="1" y2="0">
          <stop offset="0%" stop-color="#f43f5e" />
          <stop offset="100%" stop-color="#fb7185" />
        </linearGradient>
        <linearGradient id="posterAmber" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#f59e0b" />
          <stop offset="100%" stop-color="#fbbf24" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="720" height="1018.2337649" rx="40" fill="url(#posterBg)" />
      <circle cx="584" cy="138" r="92" fill="#dbeafe" />
      <circle cx="146" cy="862" r="112" fill="#ffe4ec" />
      <circle cx="628" cy="782" r="66" fill="#fef3c7" opacity="0.8" />
      <path d="M86 246C176 170 264 136 360 136C476 136 562 176 654 268L654 318C572 238 476 206 360 206C252 206 170 236 86 300Z" fill="url(#posterBlue)" opacity="0.1" />
      <path d="M68 660C158 580 244 548 344 548C458 548 540 582 646 676L646 730C556 646 460 616 346 616C242 616 164 642 68 716Z" fill="url(#posterRose)" opacity="0.1" />

      <g transform="translate(92 88)">
        <rect x="0" y="0" width="198" height="40" rx="20" fill="#eff6ff" />
        <text x="99" y="26" fill="#1d4ed8" font-size="16" font-weight="800" text-anchor="middle">SFC FESTIVAL THEME</text>
      </g>

      <g transform="translate(90 188)">
        <rect x="0" y="0" width="540" height="564" rx="42" fill="#ffffff" stroke="#e8eef8" stroke-width="2" />
        <path d="M56 370C126 288 206 246 274 246C360 246 430 292 488 376" fill="none" stroke="#0f172a" stroke-width="12" stroke-linecap="round" />
        <path d="M118 396V504" stroke="#0f172a" stroke-width="10" stroke-linecap="round" />
        <path d="M272 270V560" stroke="#0f172a" stroke-width="10" stroke-linecap="round" />
        <path d="M424 396V504" stroke="#0f172a" stroke-width="10" stroke-linecap="round" />
        <rect x="84" y="488" width="68" height="122" rx="24" fill="url(#posterBlue)" />
        <rect x="238" y="456" width="68" height="154" rx="24" fill="url(#posterAmber)" />
        <rect x="392" y="488" width="68" height="122" rx="24" fill="url(#posterRose)" />
        <circle cx="118" cy="504" r="11" fill="#ffffff" opacity="0.96" />
        <circle cx="272" cy="470" r="11" fill="#ffffff" opacity="0.96" />
        <circle cx="426" cy="504" r="11" fill="#ffffff" opacity="0.96" />

        <g opacity="0.92">
          <rect x="56" y="66" width="428" height="132" rx="28" fill="#f8fbff" />
          <text x="82" y="116" fill="#0f172a" font-size="20" font-weight="800">今年のテーマイラスト</text>
          <text x="82" y="152" fill="#64748b" font-size="16">この縦型ビジュアルを、その年のキービジュアルへ差し替える前提です</text>
        </g>
      </g>

      <g transform="translate(88 798)">
        <text x="0" y="0" fill="#0f172a" font-size="34" font-weight="800">${escapeHTML(normalized.label)}</text>
        <text x="0" y="42" fill="#64748b" font-size="17">ホームの先頭で見せるための 1:√2 縦型プレースホルダー</text>
      </g>

      <g transform="translate(90 892)">
        <rect x="0" y="0" width="540" height="74" rx="24" fill="#f8fbff" stroke="#e6eefb" />
        <circle cx="44" cy="37" r="10" fill="url(#posterBlue)" />
        <circle cx="78" cy="37" r="10" fill="url(#posterRose)" />
        <circle cx="112" cy="37" r="10" fill="url(#posterAmber)" />
        <text x="146" y="43" fill="#334155" font-size="16">Festival poster / annual key visual placeholder</text>
      </g>
    </svg>
  `;
}


