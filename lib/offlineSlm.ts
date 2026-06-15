import { OfflineFaqEntry } from "./chatApi";

/**
 * Extracts character 3-grams from a string.
 */
function getTrigrams(str: string): Set<string> {
  const trigrams = new Set<string>();
  const clean = `  ${str.toLowerCase().replace(/[^\w\s]/g, "").trim()}  `;
  for (let i = 0; i < clean.length - 2; i++) {
    trigrams.add(clean.substring(i, i + 3));
  }
  return trigrams;
}

/**
 * Calculates similarity score between query and target string using character 3-grams (Dice's Coefficient).
 * Returns a score between 0.0 and 1.0.
 */
export function similarityScore(str1: string, str2: string): number {
  const trigrams1 = getTrigrams(str1);
  const trigrams2 = getTrigrams(str2);

  if (trigrams1.size === 0 && trigrams2.size === 0) return 1.0;
  if (trigrams1.size === 0 || trigrams2.size === 0) return 0.0;

  let intersection = 0;
  for (const t of trigrams1) {
    if (trigrams2.has(t)) {
      intersection++;
    }
  }

  return (2.0 * intersection) / (trigrams1.size + trigrams2.size);
}

/**
 * Suggests the best-matching FAQ entries from the offline pack based on a query.
 * Matches keywords and trigram similarity to rank and filter entries.
 */
export function suggestBestFaqs(
  query: string,
  pack: OfflineFaqEntry[],
  language: "en" | "sw",
  limit = 3
): OfflineFaqEntry[] {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery || !pack.length) return [];

  const queryWords = cleanQuery.split(/\W+/).filter((w) => w.length > 2);

  const scored = pack
    .filter((e) => e.language === language)
    .map((e) => {
      // 1. Trigram similarity of the question
      const charSim = similarityScore(cleanQuery, e.question);

      // 2. Keyword overlap score
      let keywordMatches = 0;
      if (queryWords.length > 0) {
        for (const word of queryWords) {
          // Check question, answer, and keywords list
          if (
            e.question.toLowerCase().includes(word) ||
            e.answer.toLowerCase().includes(word) ||
            e.keywords.some((k) => k.toLowerCase().includes(word))
          ) {
            keywordMatches++;
          }
        }
      }
      const keywordSim = queryWords.length > 0 ? keywordMatches / queryWords.length : 0;

      // Weighted score: 70% character similarity, 30% keyword match
      const score = charSim * 0.7 + keywordSim * 0.3;

      return { entry: e, score };
    });

  return scored
    .filter((s) => s.score > 0.15) // minimum similarity threshold
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.entry);
}
