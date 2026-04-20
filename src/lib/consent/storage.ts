import {
  CONSENT_STORAGE_KEY,
  CONSENT_VERSION,
  type ConsentCategories,
  type ConsentRecord,
} from "./types";

const DEFAULT_CATEGORIES: ConsentCategories = {
  essential: true,
  analytics: false,
  marketing: false,
  preferences: false,
};

export function defaultCategories(): ConsentCategories {
  return { ...DEFAULT_CATEGORIES };
}

export function readConsent(): ConsentRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentRecord;
    // Invalidate on version bump so we re-prompt
    if (parsed.version !== CONSENT_VERSION) return null;
    // Invalidate after 12 months (EU guidance)
    const twelveMonthsMs = 365 * 24 * 60 * 60 * 1000;
    if (Date.now() - parsed.timestamp > twelveMonthsMs) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeConsent(categories: ConsentCategories): ConsentRecord {
  const record: ConsentRecord = {
    version: CONSENT_VERSION,
    timestamp: Date.now(),
    categories: { ...categories, essential: true },
  };
  if (typeof window !== "undefined") {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));
    // Notify interested scripts (future: GA4 consent mode update bridge)
    window.dispatchEvent(
      new CustomEvent("dar:consent-updated", { detail: record }),
    );
  }
  return record;
}

export function clearConsent(): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(CONSENT_STORAGE_KEY);
  }
}
