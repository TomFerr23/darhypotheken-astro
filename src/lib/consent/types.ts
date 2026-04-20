// Versioned consent record persisted to localStorage. Bump CONSENT_VERSION
// whenever the category set changes so returning users are re-prompted.
export const CONSENT_VERSION = 1;

export const CONSENT_STORAGE_KEY = "dar-cookie-consent";

// The event our Astro footer button dispatches to reopen the modal from
// anywhere in the page.
export const CONSENT_OPEN_EVENT = "dar:open-cookie-settings";

export interface ConsentCategories {
  essential: true; // locked on
  analytics: boolean; // GA4, Clarity, etc.
  marketing: boolean; // Meta Pixel, LinkedIn Insight, etc.
  preferences: boolean; // theme, language, etc.
}

export interface ConsentRecord {
  version: number;
  timestamp: number; // Date.now()
  categories: ConsentCategories;
}

export type ConsentDecision = "accept-all" | "reject-all" | "customize";
