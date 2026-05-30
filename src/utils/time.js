export function toMinutes(timeString) {
  const [hours = 0, minutes = 0] = String(timeString ?? '00:00').split(':').map(Number);
  return (hours * 60) + minutes;
}

export function formatTimeRange(startTime, endTime) {
  return `${startTime} - ${endTime}`;
}

export function sortItemsByStartTime(items, startKey = 'startTime') {
  return [...items].sort((a, b) => toMinutes(a[startKey]) - toMinutes(b[startKey]));
}

export function groupBy(items, keyExtractor) {
  return items.reduce((groups, item) => {
    const key = keyExtractor(item);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {});
}
