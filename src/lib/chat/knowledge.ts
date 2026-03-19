/**
 * Knowledge base retrieval for the DAR Hypotheken chatbot.
 * Loads pre-built knowledge chunks and retrieves relevant ones by keyword overlap.
 */

import fs from "fs";
import path from "path";

export interface KnowledgeChunk {
  id: string;
  source: string;
  title: string;
  content: string;
  keywords: string[];
}

// In-memory cache of loaded chunks per locale
const chunksCache = new Map<string, KnowledgeChunk[]>();

/**
 * Load knowledge chunks from disk. Caches in memory after first load.
 */
export function loadChunks(locale: "nl" | "en"): KnowledgeChunk[] {
  const cached = chunksCache.get(locale);
  if (cached) return cached;

  const filePath = path.join(
    process.cwd(),
    "src",
    "data",
    "knowledge",
    `chunks-${locale}.json`
  );

  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const chunks: KnowledgeChunk[] = JSON.parse(raw);
    chunksCache.set(locale, chunks);
    return chunks;
  } catch {
    console.warn(`Failed to load knowledge chunks for locale: ${locale}`);
    return [];
  }
}

/**
 * Tokenize a string into lowercase words for comparison.
 */
function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 2)
  );
}

/**
 * Score a chunk against a query by keyword overlap.
 */
function scoreChunk(query: string, chunk: KnowledgeChunk): number {
  const queryTokens = tokenize(query);
  let score = 0;

  // Match against keywords (weighted higher)
  for (const keyword of chunk.keywords) {
    const kwTokens = tokenize(keyword);
    for (const qt of queryTokens) {
      for (const kt of kwTokens) {
        if (kt.includes(qt) || qt.includes(kt)) {
          score += 3;
        }
      }
    }
  }

  // Match against title
  const titleTokens = tokenize(chunk.title);
  for (const qt of queryTokens) {
    for (const tt of titleTokens) {
      if (tt.includes(qt) || qt.includes(tt)) {
        score += 2;
      }
    }
  }

  // Match against content
  const contentTokens = tokenize(chunk.content);
  for (const qt of queryTokens) {
    if (contentTokens.has(qt)) {
      score += 1;
    }
  }

  return score;
}

/**
 * Retrieve the most relevant knowledge chunks for a query.
 */
export function retrieveRelevantChunks(
  query: string,
  locale: "nl" | "en",
  maxChunks: number = 3
): KnowledgeChunk[] {
  const chunks = loadChunks(locale);

  const scored = chunks
    .map((chunk) => ({ chunk, score: scoreChunk(query, chunk) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxChunks);

  // If no matches, return first chunks as general context
  if (scored.length === 0) {
    return chunks.slice(0, Math.min(2, chunks.length));
  }

  return scored.map(({ chunk }) => chunk);
}

/**
 * Format retrieved chunks into a context string for the system prompt.
 */
export function buildContext(chunks: KnowledgeChunk[]): string {
  if (chunks.length === 0) return "No relevant information available.";

  return chunks
    .map(
      (chunk) =>
        `--- ${chunk.title} ---\n${chunk.content}`
    )
    .join("\n\n");
}
