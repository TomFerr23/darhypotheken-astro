// Lightweight chat translations — avoids importing the full i18n system into client bundle
// Keys must match what ChatPanel, ChatInput, ChatLeadForm use via t("key")
const translations: Record<string, Record<string, string>> = {
  nl: {
    title: "DAR Assistent",
    welcome: "Welkom! Vul uw gegevens in om te beginnen.",
    welcomeMessage: "Hallo! Hoe kan ik u helpen met informatie over DAR Hypotheken?",
    close: "Sluiten",
    leadFormIntro: "Vul uw gegevens in zodat wij u beter kunnen helpen. Uw gegevens worden vertrouwelijk behandeld.",
    labelName: "Naam",
    labelEmail: "E-mail",
    labelPhone: "Telefoon",
    placeholderName: "Uw naam",
    placeholderEmail: "E-mailadres",
    placeholderPhone: "Telefoonnummer",
    startChat: "Start gesprek",
    submitting: "Bezig...",
    inputPlaceholder: "Typ uw bericht...",
    send: "Verstuur",
    comingSoon: "Onze chat-assistent is binnenkort beschikbaar. Wij hebben uw gegevens ontvangen en nemen contact met u op. U kunt ook mailen naar info@darhypotheken.nl.",
    errorGeneric: "Er is een fout opgetreden. Probeer het opnieuw.",
    errorNameRequired: "Naam is verplicht",
    errorEmailRequired: "E-mailadres is verplicht",
    errorEmailInvalid: "Ongeldig e-mailadres",
    errorPhoneRequired: "Telefoonnummer is verplicht",
    rateLimited: "U stuurt te veel berichten. Wacht even en probeer het opnieuw.",
    poweredBy: "Powered by DAR Hypotheken",
    consentLabel:
      "Ik ga ermee akkoord dat DAR mijn gegevens verwerkt en per e-mail of telefoon contact met mij opneemt.",
    errorConsentRequired: "U moet akkoord gaan om door te gaan.",
  },
  en: {
    title: "DAR Assistant",
    welcome: "Welcome! Please fill in your details to get started.",
    welcomeMessage: "Hello! How can I help you with information about DAR Hypotheken?",
    close: "Close",
    leadFormIntro: "Fill in your details so we can assist you better. Your information is treated confidentially.",
    labelName: "Name",
    labelEmail: "Email",
    labelPhone: "Phone",
    placeholderName: "Your name",
    placeholderEmail: "Email address",
    placeholderPhone: "Phone number",
    startChat: "Start chat",
    submitting: "Loading...",
    inputPlaceholder: "Type your message...",
    send: "Send",
    comingSoon: "Our chat assistant will be available soon. We have received your details and will contact you. You can also email info@darhypotheken.nl.",
    errorGeneric: "An error occurred. Please try again.",
    errorNameRequired: "Name is required",
    errorEmailRequired: "Email address is required",
    errorEmailInvalid: "Invalid email address",
    errorPhoneRequired: "Phone number is required",
    rateLimited: "You are sending too many messages. Please wait and try again.",
    poweredBy: "Powered by DAR Hypotheken",
    consentLabel:
      "I agree that DAR may process my data and contact me by email or phone.",
    errorConsentRequired: "You must agree to continue.",
  },
};

export function chatT(locale: string, key: string): string {
  return translations[locale]?.[key] || translations["nl"][key] || key;
}
