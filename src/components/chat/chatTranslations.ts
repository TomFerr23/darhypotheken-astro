// Lightweight chat translations — avoids importing the full i18n system into client bundle
const translations: Record<string, Record<string, string>> = {
  nl: {
    inputPlaceholder: "Stel een vraag...",
    send: "Verzenden",
    greeting: "Hoi! 👋 Ik ben de DAR assistent. Hoe kan ik je helpen?",
    leadPrompt: "Wil je dat we contact met je opnemen? Vul dan je gegevens in.",
    nameLabel: "Naam",
    emailLabel: "E-mail",
    phoneLabel: "Telefoon",
    submit: "Versturen",
    thankYou: "Bedankt! We nemen zo snel mogelijk contact met je op.",
    errorGeneric: "Er ging iets mis. Probeer het opnieuw.",
    namePlaceholder: "Je naam",
    emailPlaceholder: "Je e-mailadres",
    phonePlaceholder: "Je telefoonnummer",
    chatTitle: "DAR Assistent",
    poweredBy: "Powered by AI",
  },
  en: {
    inputPlaceholder: "Ask a question...",
    send: "Send",
    greeting: "Hi! 👋 I'm the DAR assistant. How can I help you?",
    leadPrompt: "Want us to get in touch? Fill in your details below.",
    nameLabel: "Name",
    emailLabel: "Email",
    phoneLabel: "Phone",
    submit: "Submit",
    thankYou: "Thank you! We'll get in touch as soon as possible.",
    errorGeneric: "Something went wrong. Please try again.",
    namePlaceholder: "Your name",
    emailPlaceholder: "Your email",
    phonePlaceholder: "Your phone number",
    chatTitle: "DAR Assistant",
    poweredBy: "Powered by AI",
  },
};

export function chatT(locale: string, key: string): string {
  return translations[locale]?.[key] || translations["nl"][key] || key;
}
