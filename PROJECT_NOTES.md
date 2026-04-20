# DAR Hypotheken — Project Notes

Living document for picking up context fast across sessions.
Update when you finish a chunk of work, hit a gotcha worth remembering,
or change something that affects future decisions.

## Quick facts

- **Stack:** Astro 6.0.6 + React 19 islands + Tailwind CSS v4 + Sanity CMS
- **Hosting:** Vercel (adapter: `@astrojs/vercel`, output: `static`)
- **Repo:** `https://github.com/TomFerr23/darhypotheken-astro`
- **Locales:** `nl` (default, no prefix) + `en` (prefix `/en`)
- **Node:** `>=22.12.0`
- **Sanity project ID:** `wg4j13ic` — dataset `production`
- **Live URL:** (Vercel auto domain) `https://darhypotheken-astro.vercel.app`
- **Production domain:** `darhypotheken.nl`

## Migration history (2026-04-17 → 2026-04-20)

Previous project: Next.js 16 + React 19 + framer-motion. PageSpeed mobile
score stuck at ~71 because of React hydration + framer-motion JS weight.

Decision: migrate to Astro to ship near-zero JS for the mostly-static
marketing site. Interactive pieces (chat widget, video play button,
scroll-linked timeline, Lottie) are React islands with `client:load`.

Migration covered: every section, both locales, Sanity integration,
blog pages, registration form, privacy page, API endpoints, SEO JSON-LD,
sitemap, robots, favicons, chat widget.

## Current state

### Done

- **All marketing pages** rebuilt in Astro for NL + EN
- **All sections** have scroll-triggered animations via `IntersectionObserver`
  (see `src/layouts/BaseLayout.astro` + `animate-on-scroll` utility class)
- **Hero** rebuilt as a pure server component (no JS) — fixes LCP
- **Timeline / mortgage process** has scroll-linked blue line fill
  (rAF-based, tuned triggers in `TimelineSection.astro <script>`),
  down-pointing chevrons, grey subtle card per step
- **Chat widget** React island (FAB → modal panel). Plug&Pay-style multi-view
  flow: Home (team avatars, CTA card, FAQ preview) → Lead form (name/email
  /consent — phone removed per compliance, writes initial row
  `source: chatbot`) → Qualifier (6-step
  chip/date/text questions: purchase type, price range, income range,
  existing mortgage, DOB, city — writes enriched row `source:
  chatbot-qualified`) → Thanks (call/email CTAs). Bottom tab nav Home /
  Chat / FAQ. Components live in `src/components/chat/`:
  `ChatHome.tsx`, `ChatLeadForm.tsx`, `ChatQualifier.tsx`, `ChatThanks.tsx`,
  `ChatFaq.tsx`, `ChatTabs.tsx`, `ChatPanel.tsx`. View state in
  `ChatContext.tsx` (`view: "home" | "lead" | "qualifier" | "thanks" |
  "faq"`), answer state in `qualifier`.
- **Aanmelden form** with all fields mandatory, single merged consent
  checkbox, validation, error states, success state
- **Address updated** everywhere (footer, JsonLd schema.org, FAQ JSON,
  knowledge chunks) to: Mercuriusweg 26, 2516 AW, The Hague (NL)
- **Sharia Compliance block removed** from timeline section
- **Blog hidden** (preserves code): `src/pages/blog` and
  `src/pages/en/blog` renamed to `_blog` (Astro convention to exclude
  from build); footer link + homepage preview commented out
- **Consent collection** on both entry points (form + chatbot) writes
  `emailConsent` to the API so column L in the sheet records it
- **Cookie consent banner** (`src/components/consent/`) — bottom slide-up
  banner + settings modal React island (`CookieConsentIsland.tsx`).
  Equal-weight Accept/Reject buttons + Customize (per CJEU/NL AP
  guidance). Four categories: Essential (locked), Analytics, Marketing,
  Preferences. Persists to `localStorage["dar-cookie-consent"]`
  (versioned + 12-month expiry). Footer `data-open-cookie-settings`
  button reopens the modal. Inline `is:inline` script sets Google
  Consent Mode v2 `default: "denied"` and bridges
  `dar:consent-updated` → `gtag("consent","update", …)` so future GA4
  / Google Ads respects consent automatically.
- **Analytics (cookieless, always on)** — `@vercel/analytics`
  (`Analytics client:idle`) and `@vercel/speed-insights`
  (`SpeedInsights` Astro integration) mounted in `BaseLayout.astro`.
  Privacy-safe (no cookies / no personal data), no consent gate needed.
  GA4 / Clarity / Meta Pixel to be added later gated behind the
  Analytics + Marketing categories.

### Known gotchas

- **React islands don't hydrate in Astro dev server** due to a
  vite-react-refresh bug. Chat panel doesn't open locally — verify in
  the Vercel production build instead.
- **`output: "static"`** with Vercel adapter still bundles API routes
  as serverless functions. `export const prerender = false;` is required
  on any `src/pages/api/*.ts` file.
- **`.hero-animate` class must NOT start with `opacity: 0`** — Lighthouse
  treats invisible elements as "not painted" and LCP spikes. Use
  `animation: ... both` so the keyframe's 0% state provides opacity.
- **Cloud keyframes** previously used `translateX(100vw)` which caused
  horizontal overflow on mobile. Now use `translateX(calc(100vw - 100%))`
  plus `overflow-x: hidden` on `html` and `body`.

## Google Sheets lead collection

### Architecture

Both forms POST to `/api/leads` (see `src/pages/api/leads.ts`) which
writes a row to Google Sheets using the `googleapis` package.

Request body shape:

```ts
{
  name: string;              // column A
  surname?: string;          // column B (only from aanmelden form)
  dateOfBirth?: string;      // column C
  city?: string;             // column D
  country?: string;          // column E
  email: string;             // column F
  // "alone" | "together" — from the aanmelden form only. Maps to
  // column G "Alone or Together".
  buyerMode?: string;
  income?: string;           // column H
  financingPercentage?: string; // column I
  currentMortgage?: string;  // column J
  emailConsent?: boolean;    // column K (rendered as "Consent" in sheet)
  // timestamp generated server-side → column L
  source: "form" | "chatbot" | "chatbot-qualified"; // column M
  locale: "nl" | "en";       // column N
  // "Nieuwbouw" | "Bestaande woning" | "Herfinanciering" | "Anders" —
  // from the chatbot qualifier only. Maps to column O "Property Type"
  // (extra beyond the reference layout).
  purchaseType?: string;
}
```

Neither form collects a phone number (removed per compliance). The old
"Phone" column was deleted from the sheet via
`scripts/delete-phone-column.mjs`. Columns were later reordered via
`scripts/reorder-columns.mjs` to match the internal reference layout
(Voornaam/Achternaam/Geboortedatum/Woonplaats/Land/E-mail/…
/Toestemming/Datum inzending) but kept in English; our two extras
(`Source`, `Locale`) live in columns M+N after `Timestamp`.

### Sheet config

- Spreadsheet ID: `1fFVoQdsBcDpQY1WiRkrgBSvA-PbzOTY_ZPmxcOwrXfk`
- Tab name: `Sheet1`
- Write range: `Sheet1!A:O` (15 columns)
- Column headers (row 1): Name, Surname, Date of Birth, City, Country,
  Email, **Alone or Together**, Income, Financing %, Current Mortgage,
  **Consent**, Timestamp, Source, Locale, **Property Type**

### Required env vars (set in Vercel)

| Name | Value |
|---|---|
| `GOOGLE_SHEETS_SPREADSHEET_ID` | `1fFVoQdsBcDpQY1WiRkrgBSvA-PbzOTY_ZPmxcOwrXfk` |
| `GOOGLE_SHEETS_CREDENTIALS` | Full JSON contents of the service-account key file (paste including braces) |

If either env var is missing, the endpoint still returns
`{ success: true, leadId }` but only logs the lead to Vercel logs.
This means the form never breaks for users even if the sheet is down.

### Setup status

- [x] Sheet created
- [x] Headers filled (15 columns)
- [x] Column L renamed to "Consent"
- [x] Google Cloud project created (`dar-leads`)
- [x] Google Sheets API enabled
- [x] Service account created + JSON key downloaded
  (`dar-leads-writer@dar-leads.iam.gserviceaccount.com`)
- [x] Org policy `iam.disableServiceAccountKeyCreation` overridden to Not
  Enforced at project level
- [x] Sheet shared with service-account email (Editor)
- [x] `.env.local` configured locally (env vars wrapped in single quotes
  to preserve `\n` escapes in `private_key` for `JSON.parse`)
- [x] Local end-to-end test passing (row appears in sheet)
- [ ] Env vars added to Vercel (Production + Preview + Development)
- [ ] Vercel redeployed with env vars
- [ ] Production end-to-end test

### Gotchas we hit during setup

- **Astro dev loads `.env.local` into `import.meta.env`, NOT `process.env`.**
  Fix: `leads.ts` reads both (`process.env.X ?? import.meta.env.X`) so dev
  + Vercel prod both work without changes.
- **`valueInputOption: "USER_ENTERED"` broke the phone column** — a leading
  `+` in `+31 6 …` made Sheets evaluate it as a formula and show
  `#ERROR!`. Switched to `"RAW"` so every cell is literal text (also avoids
  ISO timestamps being converted to date serials).
- **Two rows per qualified lead by design**: initial row on contact submit
  (`source: chatbot`) + enriched row on qualifier finish
  (`source: chatbot-qualified`). Dedupe by email if you need one row per
  person.

## Pending / future

- **Chatbot LLM integration** — `/api/chat` currently returns the
  "coming soon" message. Wire it to Anthropic's API when ready.
  Knowledge base lives in `src/data/knowledge/chunks-{nl,en}.json`
  and `src/data/faq/faq-{nl,en}.json`.
- **Blog restore** when content is ready: rename `_blog` folders back
  to `blog` and uncomment the two blocks in `Footer.astro` +
  `HomePage.astro`.
- **Sanity CORS** must include the production domain once DNS is cut over
  (currently includes `darhypotheken-astro.vercel.app`,
  `darhypotheken.vercel.app`, `darhypotheken.nl`, `localhost:3001`,
  `localhost:3333`).
- **Performance re-audit** on Vercel production build once all content
  is final — target 90+ mobile.

## Key file paths

```
src/
  pages/
    index.astro               ← NL home
    en/index.astro            ← EN home
    aanmelden.astro           ← mounts AanmeldenForm React island
    en/aanmelden.astro
    privacy.astro
    en/privacy.astro
    _blog/                    ← hidden, ready to restore
    en/_blog/
    api/
      leads.ts                ← writes to Google Sheets
      chat.ts                 ← "coming soon" stub for chatbot LLM
  components/
    pages/HomePage.astro      ← orchestrates section order
    layout/
      Header.astro            ← sticky navy header with shrinking logo
      HeaderIsland.tsx        ← mobile menu (React island)
      Footer.astro            ← address, nav, legal, contact
      LanguageSwitcher.tsx
    sections/
      HeroSection.astro
      AboutSection.astro
      PillarsSection.astro
      TimelineSection.astro   ← mortgage process w/ scroll-linked fill
      TeamSection.astro
      ClosingSection.astro
      ContactSection.astro
      LogoMarquee.astro, TaglineMarquee.astro, LottieSection.astro
    chat/
      ChatPanel.tsx, ChatInput.tsx, ChatLeadForm.tsx
      ChatContext.tsx, ChatFab.tsx, ChatWidget.tsx
      chatTranslations.ts     ← inline NL/EN (avoids bundling full i18n)
    ui-react/AanmeldenForm.tsx ← registration form React island
    seo/JsonLd.astro, BlogJsonLd.astro, BreadcrumbJsonLd.astro
    blog/                     ← BlogCard, PortableTextRenderer (still used when blog restored)
  i18n/
    translations.ts           ← t(locale, key), tWithParams()
    nl.json, en.json
  styles/globals.css
  data/
    knowledge/chunks-{nl,en}.json  ← chatbot knowledge base
    faq/faq-{nl,en}.json
```

## Workflow notes

- Always `npm run build` locally before pushing (catches type errors
  that the Astro dev server misses).
- Commits go to `main` and auto-deploy via Vercel.
- Co-author trailer convention: `Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>`
