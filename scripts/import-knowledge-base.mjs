// Import the Sharif Q&A knowledge-base xlsx into the chatbot's runtime data.
//
// Reads:  ~/Downloads/Dar_Hypotheken_QA_Knowledge_Base - input Sharif.xlsx
// Writes: src/data/knowledge/chunks-{nl,en}.json   (one chunk per Q001-Q100)
//         src/data/faq/faq-{nl,en}.json            (flat list of Q/A pairs)
//
// The xlsx has two parallel sheets (one per language). Each row is:
//   ID | Category | Question | Answer |
//   Follow-up 1 Q | Follow-up 1 A | Follow-up 2 Q | Follow-up 2 A |
//   Follow-up 3 Q | Follow-up 3 A | Source | Review Status
//
// Chunks: one per Q-id. Follow-ups are embedded inside content so the LLM
// sees the whole related cluster when the chunk is retrieved. Keywords are
// auto-extracted from the question + follow-up questions.
//
// FAQ: every question with Review Status "Ready" becomes its own
// instant-answer entry. Main questions AND both follow-ups are emitted —
// a follow-up is often a user's actual first question. Pending-review rows
// are excluded from FAQ so risky/outdated answers only flow via the LLM
// path (where the system prompt tells Claude to add a "still finalising"
// caveat).
//
// Re-runnable at any time — overwrites the JSON files in place.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import XLSX from "xlsx";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const SOURCE_XLSX =
  process.env.KB_XLSX ??
  path.join(
    process.env.HOME ?? "",
    "Downloads",
    "Dar_Hypotheken_QA_Knowledge_Base - input Sharif.xlsx",
  );

const STOPWORDS = {
  nl: new Set([
    "de", "het", "een", "van", "in", "is", "dat", "op", "te", "en",
    "voor", "met", "zijn", "er", "aan", "als", "bij", "door", "naar",
    "om", "ook", "dan", "maar", "nog", "wel", "wat", "hoe", "wie",
    "kan", "kun", "je", "ik", "we", "wij", "ze", "zij", "mijn",
    "dit", "die", "niet", "meer", "al", "tot", "uit", "over", "of",
    "u", "uw", "heeft", "hebben", "worden", "word", "wordt", "naar",
  ]),
  en: new Set([
    "the", "a", "an", "is", "it", "in", "of", "to", "and", "for",
    "with", "on", "at", "by", "from", "as", "or", "but", "not",
    "be", "are", "was", "were", "been", "do", "does", "did", "has",
    "have", "had", "can", "will", "would", "should", "may", "might",
    "i", "you", "we", "they", "my", "your", "this", "that", "what",
    "how", "who", "which", "there", "more", "about", "mean", "means",
  ]),
};

function extractKeywords(text, locale) {
  if (!text) return [];
  const stop = STOPWORDS[locale];
  const tokens = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stop.has(w));
  return Array.from(new Set(tokens));
}

function loadSheet(workbook, sheetName) {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) throw new Error(`Sheet not found: ${sheetName}`);
  const rows = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: null,
  });
  // First row is headers; slice and cast to an object per row
  const [, ...data] = rows;
  return data
    .filter((r) => Array.isArray(r) && r[0]) // must have an ID
    .map((r) => ({
      id: String(r[0]).trim(),
      category: r[1] ?? "",
      question: (r[2] ?? "").toString().trim(),
      answer: (r[3] ?? "").toString().trim(),
      fu1q: (r[4] ?? "").toString().trim(),
      fu1a: (r[5] ?? "").toString().trim(),
      fu2q: (r[6] ?? "").toString().trim(),
      fu2a: (r[7] ?? "").toString().trim(),
      fu3q: (r[8] ?? "").toString().trim(),
      fu3a: (r[9] ?? "").toString().trim(),
      source: (r[10] ?? "").toString().trim(),
      reviewStatus: (r[11] ?? "").toString().trim(),
    }));
}

function buildChunk(row, locale) {
  const followups = [];
  if (row.fu1q && row.fu1a) followups.push({ q: row.fu1q, a: row.fu1a });
  if (row.fu2q && row.fu2a) followups.push({ q: row.fu2q, a: row.fu2a });
  if (row.fu3q && row.fu3a) followups.push({ q: row.fu3q, a: row.fu3a });

  // Keywords: extract from question + follow-up questions + category for
  // best retrieval coverage without bloating the token budget
  const keywords = Array.from(
    new Set(
      [
        ...extractKeywords(row.question, locale),
        ...followups.flatMap((f) => extractKeywords(f.q, locale)),
        ...extractKeywords(row.category, locale),
      ],
    ),
  );

  // Content: the main answer + both follow-up Q/A pairs concatenated. When
  // this chunk is retrieved the LLM sees the whole cluster and can answer
  // either the main question or any follow-up without another lookup.
  const followupBlock = followups
    .map((f) => `\n\nRelated question: ${f.q}\nAnswer: ${f.a}`)
    .join("");

  return {
    id: row.id,
    category: row.category,
    title: row.question,
    question: row.question,
    content: row.answer + followupBlock,
    followups,
    keywords,
    source: row.source,
    reviewStatus: row.reviewStatus,
  };
}

function buildFaq(rows) {
  const entries = [];
  for (const row of rows) {
    if (row.reviewStatus !== "Ready") continue;
    if (row.question && row.answer) {
      entries.push({ patterns: [row.question], answer: row.answer });
    }
    if (row.fu1q && row.fu1a) {
      entries.push({ patterns: [row.fu1q], answer: row.fu1a });
    }
    if (row.fu2q && row.fu2a) {
      entries.push({ patterns: [row.fu2q], answer: row.fu2a });
    }
    if (row.fu3q && row.fu3a) {
      entries.push({ patterns: [row.fu3q], answer: row.fu3a });
    }
  }
  return entries;
}

// Home-screen preview questions — chosen for highest first-click conversion
// intent (plain-language explainer, core value prop, eligibility, compare).
// Edit this list if we want to surface different topics on the landing view.
const HOT_FAQ_IDS = ["Q037", "Q042", "Q050", "Q051"];

function buildHotFaqs(rows) {
  const byId = new Map(rows.map((r) => [r.id, r]));
  return HOT_FAQ_IDS
    .map((id) => byId.get(id))
    .filter((r) => r && r.question && r.answer)
    .map((r) => ({
      id: r.id,
      question: r.question,
      answer: r.answer,
      category: r.category,
    }));
}

function writeJson(relPath, data) {
  const absPath = path.join(REPO_ROOT, relPath);
  fs.writeFileSync(absPath, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log(`  ✓ wrote ${relPath}  (${data.length} entries)`);
}

function main() {
  if (!fs.existsSync(SOURCE_XLSX)) {
    throw new Error(`Knowledge base xlsx not found at: ${SOURCE_XLSX}`);
  }
  console.log(`Reading: ${SOURCE_XLSX}`);
  const workbook = XLSX.readFile(SOURCE_XLSX);
  console.log(`Sheets: ${workbook.SheetNames.join(", ")}`);

  const rowsEn = loadSheet(workbook, "Q&A (EN)");
  const rowsNl = loadSheet(workbook, "Q&A (NL)");
  console.log(`EN rows: ${rowsEn.length}   NL rows: ${rowsNl.length}`);

  const chunksEn = rowsEn.map((r) => buildChunk(r, "en"));
  const chunksNl = rowsNl.map((r) => buildChunk(r, "nl"));

  const faqEn = buildFaq(rowsEn);
  const faqNl = buildFaq(rowsNl);

  const hotEn = buildHotFaqs(rowsEn);
  const hotNl = buildHotFaqs(rowsNl);

  writeJson("src/data/knowledge/chunks-en.json", chunksEn);
  writeJson("src/data/knowledge/chunks-nl.json", chunksNl);
  writeJson("src/data/faq/faq-en.json", faqEn);
  writeJson("src/data/faq/faq-nl.json", faqNl);
  writeJson("src/data/faq/hot-faqs-en.json", hotEn);
  writeJson("src/data/faq/hot-faqs-nl.json", hotNl);

  const readyEn = rowsEn.filter((r) => r.reviewStatus === "Ready").length;
  const readyNl = rowsNl.filter((r) => r.reviewStatus === "Ready").length;
  console.log(`\nReady rows — EN: ${readyEn} / ${rowsEn.length}   NL: ${readyNl} / ${rowsNl.length}`);
  console.log(`Pending rows are in chunks (with reviewStatus) but NOT in FAQ.`);
}

main();
