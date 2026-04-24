/**
 * Pre-compiled FAQ system for instant answers without hitting the Claude API.
 * Loads FAQ data at startup and uses fuzzy keyword matching.
 */

import faqNl from "@/data/faq/faq-nl.json";
import faqEn from "@/data/faq/faq-en.json";

interface FaqEntry {
  patterns: string[];
  answer: string;
}

// In-memory cache of loaded FAQ data
const faqData: Record<string, FaqEntry[]> = {
  nl: faqNl as FaqEntry[],
  en: faqEn as FaqEntry[],
};

// Common stop words to ignore during matching
const STOP_WORDS_NL = new Set([
  "de", "het", "een", "van", "in", "is", "dat", "op", "te", "en",
  "voor", "met", "zijn", "er", "aan", "als", "bij", "door", "naar",
  "om", "ook", "dan", "maar", "nog", "wel", "wat", "hoe", "wie",
  "kan", "kun", "je", "ik", "we", "wij", "ze", "zij", "mijn",
  "dit", "die", "niet", "meer", "al", "tot", "uit", "over",
]);

const STOP_WORDS_EN = new Set([
  "the", "a", "an", "is", "it", "in", "of", "to", "and", "for",
  "with", "on", "at", "by", "from", "as", "or", "but", "not",
  "be", "are", "was", "were", "been", "do", "does", "did", "has",
  "have", "had", "can", "will", "would", "should", "may", "might",
  "i", "you", "we", "they", "my", "your", "this", "that", "what",
  "how", "who", "which", "there", "more", "about",
]);

/**
 * Normalize a string: lowercase, strip punctuation, collapse whitespace.
 */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extract meaningful keywords from text, filtering out stop words.
 */
function extractKeywords(text: string, locale: "nl" | "en"): string[] {
  const stopWords = locale === "nl" ? STOP_WORDS_NL : STOP_WORDS_EN;
  return normalize(text)
    .split(" ")
    .filter((w) => w.length > 1 && !stopWords.has(w));
}

/**
 * Calculate keyword overlap ratio between user message keywords and pattern keywords.
 * Returns value between 0 and 1.
 */
function keywordHits(
  messageKeywords: string[],
  patternKeywords: string[],
): number {
  let matches = 0;
  for (const pk of patternKeywords) {
    for (const mk of messageKeywords) {
      // Exact match or substring containment (for compound Dutch words)
      if (mk === pk || mk.includes(pk) || pk.includes(mk)) {
        matches++;
        break;
      }
    }
  }
  return matches;
}

/**
 * Match a user message against the FAQ database.
 *
 * Requires BOTH a minimum absolute token-hit count (so a single
 * coincidental word can't trigger a match) AND a minimum overlap ratio.
 * When no pattern clears both bars we return null, and the chat endpoint
 * falls through to the grounded Claude path.
 */
const MIN_TOKEN_HITS = 2;
const MIN_OVERLAP_RATIO = 0.7;

export function matchFaq(
  message: string,
  locale: "nl" | "en",
): string | null {
  const entries = faqData[locale];
  if (!entries) return null;

  const messageKeywords = extractKeywords(message, locale);
  if (messageKeywords.length === 0) return null;

  let bestScore = 0;
  let bestAnswer: string | null = null;

  for (const entry of entries) {
    for (const pattern of entry.patterns) {
      const patternKeywords = extractKeywords(pattern, locale);
      if (patternKeywords.length === 0) continue;

      const hits = keywordHits(messageKeywords, patternKeywords);
      const overlap = hits / patternKeywords.length;

      if (
        hits >= MIN_TOKEN_HITS &&
        overlap >= MIN_OVERLAP_RATIO &&
        overlap > bestScore
      ) {
        bestScore = overlap;
        bestAnswer = entry.answer;
      }
    }
  }

  return bestAnswer;
}
