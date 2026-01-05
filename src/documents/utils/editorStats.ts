export interface EditorStats {
  words: number;
  characters: number;
  readingTime: number;
}

export const INITIAL_STATS: EditorStats = {
  words: 0,
  characters: 0,
  readingTime: 0,
};

export const calculateStatsFromText = (text: string): EditorStats => {
  const safeText = text || "";
  const trimmed = safeText.trim();
  const words = trimmed ? trimmed.split(/\s+/).length : 0;
  const characters = safeText.replace(/\s+/g, "").length;
  const readingTime = words === 0 ? 0 : Math.max(1, Math.ceil(words / 200));

  return { words, characters, readingTime };
};
