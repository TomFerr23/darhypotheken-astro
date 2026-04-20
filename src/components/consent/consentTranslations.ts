// Lightweight inline translations for the cookie banner + settings modal.
// Kept separate from the main i18n system so the island bundle stays tiny.
const copy: Record<string, Record<string, string>> = {
  nl: {
    bannerTitle: "Wij gebruiken cookies",
    bannerBody:
      "Essentiële cookies zorgen dat de website werkt. Met uw toestemming gebruiken we aanvullende cookies om onze site te verbeteren en u relevanter te informeren. U kunt uw keuze altijd aanpassen via de link onderaan elke pagina.",
    acceptAll: "Alles accepteren",
    rejectAll: "Alles weigeren",
    customize: "Voorkeuren",
    privacyLink: "Privacybeleid",
    privacyLinkHref: "/privacy",
    modalTitle: "Cookie-voorkeuren",
    modalIntro:
      "Kies per categorie welke cookies u toestaat. Essentiële cookies zijn altijd actief omdat de site zonder deze niet werkt.",
    modalSave: "Voorkeuren opslaan",
    modalCancel: "Annuleren",
    catEssentialTitle: "Essentieel",
    catEssentialDesc:
      "Noodzakelijk voor basisfuncties zoals beveiliging, formulieren en uw taalinstelling. Deze kunt u niet uitzetten.",
    catEssentialLocked: "Altijd aan",
    catAnalyticsTitle: "Statistieken",
    catAnalyticsDesc:
      "Helpen ons te begrijpen welke pagina’s populair zijn en waar u wegklikt, zodat we de site kunnen verbeteren. Bijv. Google Analytics.",
    catMarketingTitle: "Marketing",
    catMarketingDesc:
      "Maken het mogelijk om u relevante informatie te tonen op andere websites (retargeting). Bijv. advertentiepixels.",
    catPreferencesTitle: "Voorkeuren",
    catPreferencesDesc:
      "Onthouden uw keuzes zoals taal of weergave, zodat u ze niet opnieuw hoeft in te stellen.",
  },
  en: {
    bannerTitle: "We use cookies",
    bannerBody:
      "Essential cookies make this site work. With your permission we use additional cookies to improve the site and make what we show you more relevant. You can change your choice anytime via the link in the footer.",
    acceptAll: "Accept all",
    rejectAll: "Reject all",
    customize: "Preferences",
    privacyLink: "Privacy policy",
    privacyLinkHref: "/en/privacy",
    modalTitle: "Cookie preferences",
    modalIntro:
      "Choose per category which cookies you allow. Essential cookies are always on because the site cannot function without them.",
    modalSave: "Save preferences",
    modalCancel: "Cancel",
    catEssentialTitle: "Essential",
    catEssentialDesc:
      "Required for core features like security, forms and your language setting. You cannot turn these off.",
    catEssentialLocked: "Always on",
    catAnalyticsTitle: "Analytics",
    catAnalyticsDesc:
      "Help us understand which pages are popular and where visitors drop off, so we can improve. e.g. Google Analytics.",
    catMarketingTitle: "Marketing",
    catMarketingDesc:
      "Let us show you relevant information on other websites (retargeting). e.g. advertising pixels.",
    catPreferencesTitle: "Preferences",
    catPreferencesDesc:
      "Remember your choices such as language or display, so you don't need to set them again.",
  },
};

export function cT(locale: string, key: string): string {
  return copy[locale]?.[key] ?? copy.nl[key] ?? key;
}
