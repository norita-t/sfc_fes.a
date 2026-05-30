import {
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

export const mockFestivalRepository = {
  async getBootstrapData() {
    return {
      events,
      stagePrograms,
      stageVenues,
      locations,
      categories,
      foodBooths,
      contentBlocks,
      mapFloors,
      stageDayVisuals,
    };
  },

  async saveBootstrapData(data) {
    return data;
  },

  async resetBootstrapData() {
    return this.getBootstrapData();
  },

  async getEvents() {
    return events;
  },

  async getStagePrograms() {
    return stagePrograms;
  },

  async getStageVenues() {
    return stageVenues;
  },

  async getLocations() {
    return locations;
  },

  async getCategories() {
    return categories;
  },

  async getFoodBooths() {
    return foodBooths;
  },

  async getContentBlocks() {
    return contentBlocks;
  },
};
