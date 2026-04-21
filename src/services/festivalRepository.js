/**
 * 将来的に Firebase Firestore へ接続することを想定した、
 * 学園祭データ取得 / 更新レイヤーのインターフェース定義です。
 *
 * Firestore collections の想定:
 * - events/{eventId}
 * - stagePrograms/{programId}
 * - stageVenues/{venueId}
 * - locations/{locationId}
 * - categories/{categoryId}
 * - foodBooths/{boothId}
 *
 * 現状は browserFestivalRepository.js を使い、
 * localStorage 上で管理画面の変更を保持します。
 * 将来 firebaseFestivalRepository.js へ差し替える構成です。
 */
export const festivalRepositoryContract = {
  getBootstrapData: 'Returns all collections required to render the app.',
  saveBootstrapData: 'Persists all collections after admin editing.',
  resetBootstrapData: 'Resets persisted collections back to seed data.',
  getEvents: 'Returns project documents.',
  getStagePrograms: 'Returns stage program documents.',
  getStageVenues: 'Returns stage venue documents.',
  getLocations: 'Returns campus area documents.',
  getCategories: 'Returns category documents.',
  getFoodBooths: 'Returns food booth documents.',
};
