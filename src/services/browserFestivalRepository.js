import {
  announcements,
  categories,
  contentBlocks,
  events,
  foodBooths,
  locations,
  mapFloors,
  stageDayVisuals,
  stagePrograms,
  stageVenues,
} from '../data/mockData.js';

const STORAGE_KEY = 'sfc-festival-guide:v17:dropdown-food-stage-data';

function cloneData(value) {
  return JSON.parse(JSON.stringify(value));
}

export function getSeedFestivalData() {
  return cloneData({
    events,
    stagePrograms,
    stageVenues,
    locations,
    categories,
    foodBooths,
    contentBlocks,
    mapFloors,
    stageDayVisuals,
  });
}

export function isFestivalBootstrapData(value) {
  return Boolean(
    value
    && typeof value === 'object'
    && Array.isArray(value.events)
    && Array.isArray(value.stagePrograms)
    && Array.isArray(value.stageVenues)
    && Array.isArray(value.locations)
    && Array.isArray(value.categories)
    && Array.isArray(value.foodBooths)
    && Array.isArray(value.contentBlocks)
    && Array.isArray(value.announcements)
    && value.locations.length > 0
    && value.categories.length > 0
    && value.stageVenues.length > 0,
  );
}

function readStoredData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed.announcements)) {
      parsed.announcements = [];
    }
    return isFestivalBootstrapData(parsed) ? cloneData(parsed) : null;
  } catch (error) {
    console.warn('Could not load festival data from localStorage.', error);
    return null;
  }
}

function writeStoredData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new CustomEvent('festival-data:updated', { detail: cloneData(data) }));
  return cloneData(data);
}

export const browserFestivalRepository = {
  async getBootstrapData() {
    return readStoredData() ?? getSeedFestivalData();
  },

  async saveBootstrapData(nextData) {
    const normalized = {
      ...nextData,
      announcements: Array.isArray(nextData?.announcements) ? nextData.announcements : [],
    };
    if (!isFestivalBootstrapData(normalized)) {
      throw new Error('festival data shape is invalid');
    }
    return writeStoredData(normalized);
  },

  async resetBootstrapData() {
    localStorage.removeItem(STORAGE_KEY);
    const seed = getSeedFestivalData();
    window.dispatchEvent(new CustomEvent('festival-data:updated', { detail: seed }));
    return seed;
  },

  async getEvents() {
    return (await this.getBootstrapData()).events;
  },

  async getStagePrograms() {
    return (await this.getBootstrapData()).stagePrograms;
  },

  async getStageVenues() {
    return (await this.getBootstrapData()).stageVenues;
  },

  async getLocations() {
    return (await this.getBootstrapData()).locations;
  },

  async getCategories() {
    return (await this.getBootstrapData()).categories;
  },

  async getFoodBooths() {
    return (await this.getBootstrapData()).foodBooths;
  },

  async getContentBlocks() {
    return (await this.getBootstrapData()).contentBlocks;
  },
};

export const festivalStorageMeta = {
  storageKey: STORAGE_KEY,
};
