export function getRelatedEvents(currentEvent, events, limit = 3) {
  return [...events]
    .filter((event) => event.id !== currentEvent.id)
    .sort((a, b) => {
      const aScore = Number(a.categoryId === currentEvent.categoryId) * 4
        + Number(a.locationId === currentEvent.locationId) * 3
        + Number(a.projectType === currentEvent.projectType) * 2
        + Math.round((a.popularityScore || 0) / 20);
      const bScore = Number(b.categoryId === currentEvent.categoryId) * 4
        + Number(b.locationId === currentEvent.locationId) * 3
        + Number(b.projectType === currentEvent.projectType) * 2
        + Math.round((b.popularityScore || 0) / 20);
      return bScore - aScore;
    })
    .slice(0, limit);
}
