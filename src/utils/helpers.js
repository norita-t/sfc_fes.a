const crowdMeta = {
  low: { label: 'Low', jpLabel: '空き気味', rank: 1, tone: 'low' },
  medium: { label: 'Medium', jpLabel: 'ふつう', rank: 2, tone: 'medium' },
  high: { label: 'High', jpLabel: '混雑', rank: 3, tone: 'high' },
};

const projectTypeMeta = {
  classroom: { label: '教室企画', areaType: 'indoor', tone: 'classroom' },
  outdoor: { label: '屋外企画', areaType: 'outdoor', tone: 'outdoor' },
};

export function escapeHTML(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function crowdToMeta(crowdLevel) {
  return crowdMeta[crowdLevel] ?? crowdMeta.medium;
}

export function crowdRank(crowdLevel) {
  return crowdToMeta(crowdLevel).rank;
}

export function projectTypeToMeta(projectType) {
  return projectTypeMeta[projectType] ?? projectTypeMeta.classroom;
}

export function projectTypeLabel(projectType) {
  return projectTypeToMeta(projectType).label;
}

export function venueLabel(areaType) {
  return areaType === 'outdoor' ? '屋外' : '屋内';
}

export function unique(values) {
  return [...new Set(values)];
}

export function getById(collection, id) {
  return collection.find((item) => item.id === id);
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function sortByText(items, extractor) {
  return [...items].sort((a, b) => extractor(a).localeCompare(extractor(b), 'ja'));
}

export function cellsFromRect(x, y, w = 1, h = 1) {
  const cells = [];
  for (let column = x; column < x + w; column += 1) {
    for (let row = y; row < y + h; row += 1) {
      cells.push({ x: column, y: row });
    }
  }
  return cells;
}

export function parseCellsString(value) {
  return String(value ?? '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [xRaw, yRaw] = entry.split(':');
      return {
        x: Number(xRaw),
        y: Number(yRaw),
      };
    })
    .filter((cell) => Number.isFinite(cell.x) && Number.isFinite(cell.y));
}

export function formatCellsString(cells) {
  return (cells ?? []).map((cell) => `${cell.x}:${cell.y}`).join(',');
}

export function getLocationCells(location) {
  if (!location?.map) {
    return [];
  }

  if (location.map.mode === 'cells') {
    return parseCellsString(location.map.cells);
  }

  return cellsFromRect(
    Number(location.map.x || 1),
    Number(location.map.y || 1),
    Number(location.map.w || 1),
    Number(location.map.h || 1),
  );
}

export function getLocationCenter(location) {
  const cells = getLocationCells(location);
  if (cells.length === 0) {
    return { x: 1, y: 1 };
  }

  const total = cells.reduce(
    (sum, cell) => ({ x: sum.x + cell.x, y: sum.y + cell.y }),
    { x: 0, y: 0 },
  );

  return {
    x: total.x / cells.length,
    y: total.y / cells.length,
  };
}

export function getLocationBounds(location) {
  const cells = getLocationCells(location);
  if (cells.length === 0) {
    return { minX: 1, maxX: 1, minY: 1, maxY: 1 };
  }

  return {
    minX: Math.min(...cells.map((cell) => cell.x)),
    maxX: Math.max(...cells.map((cell) => cell.x)),
    minY: Math.min(...cells.map((cell) => cell.y)),
    maxY: Math.max(...cells.map((cell) => cell.y)),
  };
}

export function locationHasCell(location, x, y) {
  return getLocationCells(location).some((cell) => cell.x === x && cell.y === y);
}

export function splitProjectName(name) {
  const rawName = String(name ?? '').trim();
  const parts = rawName.split(/\s*\/\s*/).map((part) => part.trim()).filter(Boolean);

  if (parts.length < 2) {
    return { title: rawName, organizer: '' };
  }

  return {
    title: parts.slice(0, -1).join(' / '),
    organizer: parts.at(-1) || '',
  };
}
