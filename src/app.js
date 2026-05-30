import { renderShell } from './components/shell.js';
import { foodTypes } from './data/mockData.js';
import { adminPage } from './pages/adminPage.js';
import { favoritesPage } from './pages/favoritesPage.js';
import { eventDetailPage } from './pages/eventDetailPage.js';
import { eventsPage } from './pages/eventsPage.js';
import { foodPage } from './pages/foodPage.js';
import { homePage } from './pages/homePage.js';
import { mapPage } from './pages/mapPage.js';
import { notFoundPage } from './pages/notFoundPage.js';
import { stageDetailPage } from './pages/stageDetailPage.js';
import { timetablePage } from './pages/timetablePage.js';
import { getFavorites, saveFavorites, toggleFavorite } from './store/favoritesStore.js';
import { getCurrentRoute, navigate } from './router.js';
import { getById } from './utils/helpers.js';
import { getContentText } from './utils/content.js';
import { toggleTheme } from './utils/theme.js';

const pageRegistry = {
  home: homePage,
  events: eventsPage,
  'event-detail': eventDetailPage,
  map: mapPage,
  timetable: timetablePage,
  'stage-detail': stageDetailPage,
  food: foodPage,
  favorites: favoritesPage,
  admin: adminPage,
  'not-found': notFoundPage,
};

const pageTitles = {
  home: 'ホーム',
  events: '企画',
  'event-detail': '企画詳細',
  map: 'マップ',
  timetable: 'ステージ公演',
  'stage-detail': 'ステージ詳細',
  food: '飲食',
  favorites: 'お気に入り',
  admin: '管理画面',
  'not-found': 'Not Found',
};

export class FestivalGuideApp {
  constructor({ root, repository }) {
    this.root = root;
    this.repository = repository;
    this.data = null;
    this.favorites = getFavorites();
    this.handleHashChange = this.handleHashChange.bind(this);
    this.handleFavoritesUpdated = this.handleFavoritesUpdated.bind(this);
  }

  async init() {
    this.root.innerHTML = `
      <div class="loading-screen">
        <div class="loading-card">
          <span class="eyebrow">Loading</span>
          <h1>SFC Festival Guide</h1>
          <p>学園祭ガイドを準備しています...</p>
        </div>
      </div>
    `;

    await this.refreshData();
    window.addEventListener('hashchange', this.handleHashChange);
    window.addEventListener('favorites:updated', this.handleFavoritesUpdated);

    if (!window.location.hash) {
      navigate('/');
      return;
    }

    this.render();
  }

  destroy() {
    window.removeEventListener('hashchange', this.handleHashChange);
    window.removeEventListener('favorites:updated', this.handleFavoritesUpdated);
  }

  handleHashChange() {
    this.render();
  }

  handleFavoritesUpdated() {
    this.favorites = getFavorites();
    this.render();
  }

  async refreshData() {
    this.data = await this.repository.getBootstrapData();
    this.syncFavoritesWithData();
  }

  syncFavoritesWithData() {
    const validEventIds = new Set((this.data?.events ?? []).map((event) => event.id));
    const currentFavorites = getFavorites();
    const nextFavorites = currentFavorites.filter((favoriteId) => validEventIds.has(favoriteId));

    if (currentFavorites.length !== nextFavorites.length) {
      saveFavorites(nextFavorites);
      this.favorites = nextFavorites;
      return;
    }

    this.favorites = currentFavorites;
  }

  async saveData(nextData) {
    await this.repository.saveBootstrapData(nextData);
    await this.refreshData();
    this.render();
  }

  async resetData() {
    await this.repository.resetBootstrapData();
    await this.refreshData();
    this.render();
  }

  getEventRelations(event) {
    return {
      location: getById(this.data.locations, event.locationId),
      category: getById(this.data.categories, event.categoryId),
    };
  }

  getFoodRelations(item) {
    return {
      location: getById(this.data.locations, item.locationId),
      foodTypeLabel: foodTypes.find((type) => type.id === item.type)?.label ?? '飲食',
    };
  }

  getStageProgramRelations(program) {
    const stageVenue = getById(this.data.stageVenues, program.stageVenueId);
    return {
      stageVenue,
      parentLocation: stageVenue ? getById(this.data.locations, stageVenue.parentLocationId) : null,
    };
  }

  isFavorite(eventId) {
    return this.favorites.includes(eventId);
  }

  buildContext() {
    return {
      data: this.data,
      favorites: this.favorites,
      repository: this.repository,
      isFavorite: (eventId) => this.isFavorite(eventId),
      getEventRelations: (event) => this.getEventRelations(event),
      getFoodRelations: (item) => this.getFoodRelations(item),
      getStageProgramRelations: (program) => this.getStageProgramRelations(program),
      getText: (id, fallback = '') => getContentText(this.data, id, fallback),
      navigate,
      render: (options) => this.render(options),
      saveData: async (nextData) => this.saveData(nextData),
      resetData: async () => this.resetData(),
    };
  }

  bindCommonInteractions() {
    this.root.querySelector('[data-theme-toggle]')?.addEventListener('click', () => {
      toggleTheme();
      this.render();
    });

    this.root.querySelectorAll('[data-route]').forEach((node) => {
      node.addEventListener('click', (event) => {
        event.preventDefault();
        navigate(node.dataset.route);
      });
    });

    this.root.querySelectorAll('[data-map-location]').forEach((node) => {
      node.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        navigate('/map', { location: node.dataset.mapLocation });
      });
    });

    this.root.querySelectorAll('[data-favorite-id]').forEach((node) => {
      node.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleFavorite(node.dataset.favoriteId);
      });
    });

    this.root.querySelectorAll('[data-project-card]').forEach((node) => {
      const openEvent = () => navigate(`/projects/${node.dataset.projectCard}`);

      node.addEventListener('click', (event) => {
        if (event.target.closest('[data-favorite-id], [data-map-location], [data-route]')) {
          return;
        }
        openEvent();
      });

      node.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openEvent();
        }
      });
    });

    this.root.querySelectorAll('[data-stage-card]').forEach((node) => {
      const openStage = () => navigate(`/stage/${node.dataset.stageCard}`);
      node.addEventListener('click', () => openStage());
      node.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openStage();
        }
      });
    });
  }

  render(options = {}) {
    if (!this.data) {
      return;
    }

    this.favorites = getFavorites();
    const route = getCurrentRoute();
    const page = pageRegistry[route.name] ?? notFoundPage;
    const context = this.buildContext();
    const pageContent = page.render(context, route);

    this.root.innerHTML = renderShell({
      routeName: route.name,
      pageClass: `page--${route.name}`,
      content: pageContent,
    });

    document.title = `SFC Festival Guide | ${pageTitles[route.name] ?? 'Guide'}`;

    this.bindCommonInteractions();
    page.bind?.(this.root, context, route);

    if (options.focusSelector) {
      const element = this.root.querySelector(options.focusSelector);
      element?.focus({ preventScroll: true });

      if (element && options.selectionRange && typeof element.setSelectionRange === 'function') {
        window.requestAnimationFrame(() => {
          try {
            const valueLength = element.value?.length ?? 0;
            const start = Math.min(options.selectionRange.start ?? valueLength, valueLength);
            const end = Math.min(options.selectionRange.end ?? start, valueLength);
            element.setSelectionRange(start, end);
          } catch {
            // 一部の入力タイプでは選択範囲を設定できないため、その場合はフォーカスのみ維持する
          }
        });
      }
    }
  }
}
