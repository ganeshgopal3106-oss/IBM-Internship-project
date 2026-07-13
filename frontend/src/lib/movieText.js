const ignoredBoldText = [
  'title',
  'genre',
  'language',
  'runtime',
  'description',
  'rating',
  'overview',
  'why watch',
  'no spoilers',
  'story',
  'action',
  'acting',
  'visual effects',
  'overall verdict',
  'weekend watchlist',
  'hidden gems',
  'must-watch classics',
  'moviemind',
];

export function extractMovieTitles(text) {
  if (!text) return [];

  const titles = [];
  const patterns = [
    /\d+\.\s+\*\*([^*]+?)(?:\s*\(\d{4}\))?\*\*/g,
    /-\s+\*\*([^*]+?)(?:\s*\(\d{4}\))?\*\*/g,
    /\*\*([^*]{3,48})\*\*/g,
  ];

  for (const pattern of patterns) {
    let match;
    pattern.lastIndex = 0;
    while ((match = pattern.exec(text)) !== null) {
      const title = match[1].trim();
      const normalized = title.toLowerCase();
      if (
        title.length < 70 &&
        !titles.includes(title) &&
        !ignoredBoldText.some((ignored) => normalized.includes(ignored))
      ) {
        titles.push(title);
      }
    }
    if (titles.length > 0) break;
  }

  return titles.slice(0, 12);
}
