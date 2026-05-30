export function getContentBlock(data, id) {
  return (data?.contentBlocks ?? []).find((block) => block.id === id) ?? null;
}

export function getContentText(data, id, fallback = '') {
  return getContentBlock(data, id)?.text ?? fallback;
}
