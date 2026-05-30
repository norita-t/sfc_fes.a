export function findShortestRoute(graph, startId, endId) {
  if (!startId || !endId || startId === endId) {
    return {
      path: startId && endId ? [startId] : [],
      totalMinutes: 0,
    };
  }

  const distances = {};
  const previous = {};
  const queue = new Set(Object.keys(graph));

  Object.keys(graph).forEach((node) => {
    distances[node] = Number.POSITIVE_INFINITY;
    previous[node] = null;
  });
  distances[startId] = 0;

  while (queue.size > 0) {
    let current = null;
    let currentDistance = Number.POSITIVE_INFINITY;

    queue.forEach((node) => {
      if (distances[node] < currentDistance) {
        current = node;
        currentDistance = distances[node];
      }
    });

    if (!current) {
      break;
    }

    queue.delete(current);

    if (current === endId) {
      break;
    }

    const neighbors = graph[current] ?? [];
    neighbors.forEach((edge) => {
      const candidate = distances[current] + edge.minutes;
      if (candidate < distances[edge.to]) {
        distances[edge.to] = candidate;
        previous[edge.to] = current;
      }
    });
  }

  const path = [];
  let cursor = endId;
  while (cursor) {
    path.unshift(cursor);
    cursor = previous[cursor];
  }

  return {
    path,
    totalMinutes: Number.isFinite(distances[endId]) ? distances[endId] : 0,
  };
}
