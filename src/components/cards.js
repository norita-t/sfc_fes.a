import {
  renderMediaFrame,
  renderProjectTypeTag,
  renderTag,
} from './ui.js';
import { escapeHTML, splitProjectName } from '../utils/helpers.js';
import { formatTimeRange } from '../utils/time.js';

export function renderEventCard(event, relations, isFavorite) {
  const locationLabel = event.spotLabel || relations.location?.name || '場所未設定';
  const categoryLabel = relations.category?.jpLabel ?? 'カテゴリ未設定';
  const { title: displayTitle, organizer } = splitProjectName(event.name);
  const participantLabel = organizer || '出展者未設定';

  return `
    <article class="list-card list-card--project project-mini-card" data-project-card="${escapeHTML(event.id)}" tabindex="0" role="button" aria-label="${escapeHTML(displayTitle || event.name)} の詳細を見る">
      <div class="project-mini-card__media">
        ${renderMediaFrame({ imageUrl: event.imageUrl, alt: event.imageAlt || displayTitle || event.name, label: event.imageAlt || displayTitle || event.name, aspect: 'square' })}
      </div>

      <div class="project-mini-card__body">
        <h3>${escapeHTML(displayTitle || event.name)}</h3>
        <p class="project-mini-card__subline"><span aria-hidden="true">👥</span>${escapeHTML(participantLabel)}</p>
        <p class="project-mini-card__description">${escapeHTML(event.shortDescription || event.description || categoryLabel)}</p>
        <div class="project-mini-card__meta">
          <span><span aria-hidden="true">📍</span>${escapeHTML(locationLabel)}</span>
          <span><span aria-hidden="true">○</span>常設展</span>
        </div>
      </div>

      <button
        class="favorite-button project-mini-card__favorite ${isFavorite ? 'is-active' : ''}"
        data-favorite-id="${escapeHTML(event.id)}"
        aria-label="${isFavorite ? 'お気に入り解除' : 'お気に入り追加'}"
        aria-pressed="${String(isFavorite)}"
      >${isFavorite ? '★' : '☆'}</button>
    </article>
  `;
}

export function renderCompactEventRow(event, relations, isFavorite = false) {
  const { title: displayTitle, organizer } = splitProjectName(event.name);
  const participantLabel = organizer || '出展者未設定';

  return `
    <article class="compact-card" data-project-card="${escapeHTML(event.id)}" tabindex="0" role="button" aria-label="${escapeHTML(displayTitle || event.name)} の詳細を見る">
      <div class="compact-card__content">
        <div class="stack stack--xs compact-card__copy">
          <span class="compact-card__eyebrow">${escapeHTML([relations.category?.jpLabel, participantLabel].filter(Boolean).join(' ・ ') || '企画')}</span>
          <h3>${escapeHTML(displayTitle || event.name)}</h3>
          <p>${escapeHTML(event.spotLabel || relations.location?.name || '')}</p>
        </div>
        <div class="compact-card__actions">
          ${renderProjectTypeTag(event.projectType)}
          <button
            class="favorite-button favorite-button--small ${isFavorite ? 'is-active' : ''}"
            data-favorite-id="${escapeHTML(event.id)}"
            aria-label="${isFavorite ? 'お気に入り解除' : 'お気に入り追加'}"
            aria-pressed="${String(isFavorite)}"
          >${isFavorite ? '★' : '☆'}</button>
        </div>
      </div>
    </article>
  `;
}

export function renderStageCard(program, relations) {
  return `
    <article class="list-card list-card--stage" data-stage-card="${escapeHTML(program.id)}" tabindex="0" role="button" aria-label="${escapeHTML(program.title)} の詳細を見る">
      <div class="list-card__layout list-card__layout--with-media list-card__layout--stage">
        <div class="list-card__media-slot list-card__media-slot--stage">
          ${renderMediaFrame({ imageUrl: program.imageUrl || '', alt: program.imageAlt || program.title, label: program.imageAlt || program.title, aspect: 'square' })}
        </div>
        <div class="list-card__body">
          <div class="stack stack--xs">
            <div class="inline-tags">
              ${renderTag(relations.stageVenue?.name ?? '会場未設定', 'indoor')}
              ${renderTag(program.day, 'neutral')}
            </div>
            <h3>${escapeHTML(program.title)}</h3>
            <p class="list-card__meta">${escapeHTML(formatTimeRange(program.startTime, program.endTime))}</p>
            <p class="list-card__description">${escapeHTML(program.shortDescription)}</p>
          </div>
        </div>
      </div>
    </article>
  `;
}

export function renderMiniStageRow(program, relations) {
  return `
    <article class="mini-stage-card" data-stage-card="${escapeHTML(program.id)}" tabindex="0" role="button">
      <span class="mini-stage-card__time">${escapeHTML(program.day)} / ${escapeHTML(formatTimeRange(program.startTime, program.endTime))}</span>
      <strong>${escapeHTML(program.title)}</strong>
      <p>${escapeHTML(relations.stageVenue?.name ?? '')}</p>
    </article>
  `;
}

export function renderFoodCard(item, relations) {
  const venueLabel = item.venueLabel || item.venueName || item.spotLabel || relations.location?.name || '第一体育館内 飲食会場';
  const timeLabel = [item.dateNote, item.openTime && item.closeTime ? `${item.openTime} - ${item.closeTime}` : ''].filter(Boolean).join(' ・ ');
  const description = item.shortDescription || item.menuSummary || item.priceNote || '';

  return `
    <article class="list-card list-card--food food-mini-card">
      <div class="food-mini-card__media">
        ${renderMediaFrame({ imageUrl: item.imageUrl, alt: item.imageAlt || item.name, label: item.imageAlt || item.name, aspect: 'square' })}
      </div>

      <div class="food-mini-card__body">
        <h3>${escapeHTML(item.name)}</h3>
        <p class="food-mini-card__store"><span aria-hidden="true">🏪</span>${escapeHTML(item.boothName || '店舗未設定')}</p>
        <p class="food-mini-card__description">${escapeHTML(description)}</p>
        <div class="food-mini-card__meta">
          ${item.priceNote ? `<span>${escapeHTML(item.priceNote)}</span>` : ''}
          ${timeLabel ? `<span>${escapeHTML(timeLabel)}</span>` : ''}
          <span>${escapeHTML(venueLabel)}</span>
        </div>
      </div>

      <button class="food-mini-card__map" data-map-location="${escapeHTML(item.locationId)}" aria-label="第一体育館を地図で見る">Map</button>
    </article>
  `;
}
