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
- **Chat widget** React island (FAB → modal panel) with lead-capture form
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
  email: string;             // column C
  phone?: string;            // column D ("-" from aanmelden form)
  dateOfBirth?: string;      // column E
  city?: string;             // column F
  country?: string;          // column G
  purchaseType?: string;     // column H
  income?: string;           // column I
  financingPercentage?: string; // column J
  currentMortgage?: string;  // column K
  emailConsent?: boolean;    // column L (renamed to "Consent" in sheet)
  source: "form" | "chatbot"; // column M
  locale: "nl" | "en";       // column N
  // timestamp is generated server-side → column O
}
```

Phone is required for `source !== "form"` (chatbot requires it).
Aanmelden form always sends `phone: "-"` as a placeholder.

### Sheet config

- Spreadsheet ID: `1fFVoQdsBcDpQY1WiRkrgBSvA-PbzOTY_ZPmxcOwrXfk`
- Tab name: `Sheet1`
- Write range: `Sheet1!A:O` (15 columns)
- Column headers (row 1): Name, Surname, Email, Phone, Date of Birth,
  City, Country, Purchase Type, Income, Financing %, Current Mortgage,
  **Consent**, Source, Locale, Timestamp

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
- [ ] Google Cloud project created
- [ ] Google Sheets API enabled
- [ ] Service account created + JSON key downloaded
- [ ] Sheet shared with service-account email (Editor)
- [ ] Env vars added to Vercel (Production + Preview + Development)
- [ ] Vercel redeployed with env vars
- [ ] End-to-end test (submit form → row appears in sheet)

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
