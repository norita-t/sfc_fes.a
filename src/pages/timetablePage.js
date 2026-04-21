import { renderEmptyState } from '../components/ui.js';
import { escapeHTML } from '../utils/helpers.js';
import { formatTimeRange, sortItemsByStartTime, toMinutes } from '../utils/time.js';

const DEFAULT_STAGE_VENUE_ID = 'gym-2';
const EXCLUDED_STAGE_VENUE_IDS = new Set(['gym-1']);

const pageState = {
  day: '11/14',
  stageVenueId: DEFAULT_STAGE_VENUE_ID,
};

const TIMELINE_START = 9 * 60;
const TIMELINE_END = 16 * 60;
const TIMELINE_HOURS = (TIMELINE_END - TIMELINE_START) / 60;

function getSelectableStageVenues(context) {
  const venueIdsWithPrograms = new Set(context.data.stagePrograms.map((program) => program.stageVenueId));
  return context.data.stageVenues.filter((venue) => {
    return !EXCLUDED_STAGE_VENUE_IDS.has(venue.id) && venueIdsWithPrograms.has(venue.id);
  });
}

function ensureStageState(context) {
  const venues = getSelectableStageVenues(context);

  if (!venues.some((venue) => venue.id === pageState.stageVenueId)) {
    pageState.stageVenueId = venues[0]?.id ?? DEFAULT_STAGE_VENUE_ID;
  }

  return venues;
}

function getFilteredPrograms(context) {
  ensureStageState(context);
  return sortItemsByStartTime(
    context.data.stagePrograms.filter((program) => {
      return program.day === pageState.day && program.stageVenueId === pageState.stageVenueId;
    }),
  );
}

function renderDayTabs() {
  return `
    <div class="stage-days" role="tablist" aria-label="開催日切り替え">
      ${[
        { value: '11/14', label: 'Day 1', subLabel: '11/14' },
        { value: '11/15', label: 'Day 2', subLabel: '11/15' },
      ]
        .map(
          (day) => `
            <button
              class="stage-days__tab ${pageState.day === day.value ? 'is-active' : ''}"
              type="button"
              data-stage-day="${day.value}"
              aria-selected="${pageState.day === day.value ? 'true' : 'false'}"
            >
              <span>${day.label}</span>
              <small>${day.subLabel}</small>
            </button>
          `,
        )
        .join('')}
    </div>
  `;
}

function renderVenueSelect(context) {
  const venues = ensureStageState(context);

  return `
    <label class="stage-venue-select">
      <span>会場</span>
      <select data-stage-venue-select aria-label="ステージ会場">
        ${venues
          .map(
            (venue) => `
              <option value="${escapeHTML(venue.id)}" ${pageState.stageVenueId === venue.id ? 'selected' : ''}>
                ${escapeHTML(venue.name)}
              </option>
            `,
          )
          .join('')}
      </select>
    </label>
  `;
}

function renderHourLabels() {
  return Array.from({ length: TIMELINE_HOURS + 1 }, (_, index) => {
    const hour = (TIMELINE_START / 60) + index;
    const top = (index / TIMELINE_HOURS) * 100;
    return `<span class="stage-stream__hour-label" style="top:${top}%">${hour}</span>`;
  }).join('');
}

function renderHourLines() {
  return Array.from({ length: TIMELINE_HOURS + 1 }, (_, index) => {
    const top = (index / TIMELINE_HOURS) * 100;
    return `<span class="stage-stream__hour-line" style="top:${top}%"></span>`;
  }).join('');
}

function renderStageProgram(program) {
  const start = toMinutes(program.startTime);
  const end = toMinutes(program.endTime);
  const top = Math.max(0, ((start - TIMELINE_START) / (TIMELINE_END - TIMELINE_START)) * 100);
  const height = Math.max(7.5, ((end - start) / (TIMELINE_END - TIMELINE_START)) * 100);

  return `
    <button
      type="button"
      class="stage-stream__program"
      data-stage-card="${escapeHTML(program.id)}"
      style="top:${top}%;height:calc(${height}% - 7px);"
      aria-label="${escapeHTML(program.title)} ${escapeHTML(formatTimeRange(program.startTime, program.endTime))}"
    >
      <span class="stage-stream__time">${escapeHTML(formatTimeRange(program.startTime, program.endTime))}</span>
      <strong>${escapeHTML(program.title)}</strong>
    </button>
  `;
}

function renderStageStream(programs, currentVenue) {
  if (!currentVenue) {
    return renderEmptyState('表示できる会場がありません', 'ステージ会場データを確認してください。', '/stage', 'ステージへ戻る');
  }

  if (programs.length === 0) {
    return renderEmptyState('表示できる予定がありません', '別の日付や会場を選ぶと予定が表示されます。', '/stage', 'ステージへ戻る');
  }

  return `
    <div class="stage-stream" style="--timeline-hours:${TIMELINE_HOURS};">
      <div class="stage-stream__venue-bar">
        <span>${escapeHTML(currentVenue.name)}</span>
      </div>
      <div class="stage-stream__main">
        <div class="stage-stream__axis" aria-hidden="true">
          ${renderHourLabels()}
        </div>
        <div class="stage-stream__track">
          ${renderHourLines()}
          ${programs.map((program) => renderStageProgram(program)).join('')}
        </div>
      </div>
    </div>
  `;
}

export const timetablePage = {
  render(context) {
    const venues = ensureStageState(context);
    const currentVenue = venues.find((venue) => venue.id === pageState.stageVenueId);
    const programs = getFilteredPrograms(context);

    return `
      <section class="stage-page" aria-labelledby="stage-page-title">
        <div class="stage-page__header">
          <span class="eyebrow">Stage Program</span>
          <h2 id="stage-page-title">ステージ公演</h2>
        </div>

        ${renderDayTabs()}

        <div class="stage-page__tools">
          ${renderVenueSelect(context)}
        </div>


        ${renderStageStream(programs, currentVenue)}
      </section>
    `;
  },

  bind(root, context) {
    root.querySelectorAll('[data-stage-day]').forEach((button) => {
      button.addEventListener('click', () => {
        pageState.day = button.dataset.stageDay;
        context.render();
      });
    });

    root.querySelector('[data-stage-venue-select]')?.addEventListener('change', (event) => {
      pageState.stageVenueId = event.currentTarget.value;
      context.render();
    });
  },
};
