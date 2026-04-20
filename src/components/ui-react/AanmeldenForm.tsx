import { useState, type FormEvent } from "react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  city: string;
  country: string;
  email: string;
  purchaseType: "" | "alone" | "together";
  income: string;
  financingPercentage: string;
  currentMortgage: string;
  dataConsent: boolean;
  emailConsent: boolean;
}

const translations: Record<string, Record<string, string>> = {
  nl: {
    pageTitle: "Aanmelden",
    introText:
      "DAR is voornemens een halalhypotheek op de Nederlandse markt te introduceren. Om de belangstelling voor dit product te kunnen inschatten en een eerste indicatie te krijgen of dit product voor u geschikt is, vraagt DAR u om hieronder enkele persoonsgegevens en financi\u00eble gegevens in te vullen.",
    introText2:
      "Deze gegevens worden uitsluitend gebruikt om (i) vast te stellen of u interesse heeft in de DAR hypotheek en (ii) te beoordelen of uw situatie in grote lijnen aansluit bij de verwachte voorwaarden van het product.",
    introText3:
      "Daarnaast gebruiken wij uw contactgegevens om u per e-mail te informeren zodra DAR officieel van start gaat, mits u daarvoor toestemming geeft.",
    sectionPerson: "Persoon",
    firstName: "Voornaam",
    lastName: "Achternaam",
    dateOfBirth: "Geboortedatum",
    city: "Woonplaats",
    country: "Land",
    email: "E-mail",
    sectionMortgage: "Hypotheek",
    purchaseType: "Wilt u alleen of samen kopen?",
    alone: "Alleen",
    together: "Samen",
    income: "Wat is uw (gezamenlijke) bruto jaarinkomen?",
    financingPercentage:
      "Hoeveel procent van de woningwaarde wenst u te financieren?",
    currentMortgage: "Heeft u momenteel een hypotheek?",
    yes: "Ja",
    no: "Nee",
    currentMortgageHelp:
      "Deze vraag helpt ons om de algemene vraag naar oversluit- of aankoophypotheken te bepalen.",
    sectionContact: "Contact",
    dataConsent:
      "Ik ben ervan op de hoogte dat DAR mijn persoonsgegevens gebruikt om de vraag naar de DAR hypotheek te bepalen en om een eerste inschatting te maken of mijn situatie past binnen de verwachte productvoorwaarden.",
    emailConsent:
      "Ik ga ermee akkoord dat DAR mij per e-mail benadert om mij te informeren zodra het product beschikbaar is.",
    privacyNote:
      "Voor meer informatie over de verwerking van uw persoonsgegevens, verwijzen we u naar onze",
    privacyLink: "privacyverklaring",
    submit: "Versturen",
    required: "Dit veld is verplicht",
    emailInvalid: "Ongeldig e-mailadres",
    consentRequired: "U moet akkoord gaan om door te gaan",
    successTitle: "Bedankt voor uw aanmelding!",
    successMessage:
      "Wij hebben uw gegevens ontvangen. Zodra DAR Hypotheken officieel van start gaat, informeren wij u per e-mail.",
    successBack: "Terug naar de homepage",
  },
  en: {
    pageTitle: "Apply",
    introText:
      "DAR intends to introduce a halal mortgage on the Dutch market. To gauge interest in this product and get an initial indication of whether it may be suitable for you, DAR asks you to fill in some personal and financial details below.",
    introText2:
      "This data will be used exclusively to (i) determine your interest in the DAR mortgage and (ii) assess whether your situation broadly fits the expected product conditions.",
    introText3:
      "Additionally, we will use your contact details to inform you by email once DAR officially launches, provided you give consent.",
    sectionPerson: "Personal Details",
    firstName: "First Name",
    lastName: "Last Name",
    dateOfBirth: "Date of Birth",
    city: "City",
    country: "Country",
    email: "Email",
    sectionMortgage: "Mortgage",
    purchaseType: "Do you want to buy alone or together?",
    alone: "Alone",
    together: "Together",
    income: "What is your (combined) gross annual income?",
    financingPercentage:
      "What percentage of the property value do you wish to finance?",
    currentMortgage: "Do you currently have a mortgage?",
    yes: "Yes",
    no: "No",
    currentMortgageHelp:
      "This question helps us determine the general demand for refinancing vs. new purchase mortgages.",
    sectionContact: "Contact",
    dataConsent:
      "I am aware that DAR uses my personal data to determine the demand for the DAR mortgage and to make an initial assessment of whether my situation fits within the expected product conditions.",
    emailConsent:
      "I agree that DAR may contact me by email to inform me once the product is available.",
    privacyNote:
      "For more information about the processing of your personal data, please refer to our",
    privacyLink: "privacy statement",
    submit: "Submit",
    required: "This field is required",
    emailInvalid: "Invalid email address",
    consentRequired: "You must agree to continue",
    successTitle: "Thank you for your registration!",
    successMessage:
      "We have received your details. Once DAR Hypotheken officially launches, we will inform you by email.",
    successBack: "Back to homepage",
  },
};

interface Props {
  locale: string;
}

export default function AanmeldenForm({ locale }: Props) {
  const dict = translations[locale] || translations.nl;
  const t = (key: string) => dict[key] || key;

  const homeHref = locale === "nl" ? "/" : "/en";
  const privacyHref = locale === "nl" ? "/privacy" : "/en/privacy";

  const [form, setForm] = useState<FormData>({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    city: "",
    country: "",
    email: "",
    purchaseType: "",
    income: "",
    financingPercentage: "",
    currentMortgage: "",
    dataConsent: false,
    emailConsent: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  function updateField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!form.firstName.trim()) newErrors.firstName = t("required");
    if (!form.lastName.trim()) newErrors.lastName = t("required");
    if (!form.dateOfBirth) newErrors.dateOfBirth = t("required");
    if (!form.city.trim()) newErrors.city = t("required");
    if (!form.country.trim()) newErrors.country = t("required");
    if (!form.email.trim()) {
      newErrors.email = t("required");
    } else if (!EMAIL_REGEX.test(form.email.trim())) {
      newErrors.email = t("emailInvalid");
    }
    if (!form.purchaseType) newErrors.purchaseType = t("required");
    if (!form.income) newErrors.income = t("required");
    if (!form.financingPercentage)
      newErrors.financingPercentage = t("required");
    if (!form.currentMortgage) newErrors.currentMortgage = t("required");
    if (!form.dataConsent) newErrors.dataConsent = t("consentRequired");

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.firstName.trim(),
          surname: form.lastName.trim(),
          email: form.email.trim(),
          locale,
          source: "form",
          dateOfBirth: form.dateOfBirth,
          city: form.city.trim(),
          country: form.country.trim(),
          purchaseType: form.purchaseType,
          income: form.income,
          financingPercentage: form.financingPercentage,
          currentMortgage: form.currentMortgage,
          dataConsent: form.dataConsent,
          emailConsent: form.emailConsent,
        }),
      });

      if (res.ok) {
        setIsSuccess(true);
      }
    } catch {
      // silent fail
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="py-20 md:py-28">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-dar-green/10">
            <svg
              className="h-8 w-8 text-dar-green"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-dar-slate md:text-4xl">
            {t("successTitle")}
          </h1>
          <p className="mt-4 text-lg text-dar-gray leading-relaxed">
            {t("successMessage")}
          </p>
          <a
            href={homeHref}
            className="mt-8 inline-block rounded-full bg-dar-green px-10 py-4 font-semibold text-white transition-all hover:brightness-105"
          >
            {t("successBack")}
          </a>
        </div>
      </div>
    );
  }

  const inputClass = (field: string) =>
    `mt-1 w-full rounded-lg border px-4 py-3 text-dar-slate outline-none transition-colors focus:border-[#060097] focus:ring-1 focus:ring-[#060097] ${
      errors[field] ? "border-red-500" : "border-gray-300"
    }`;

  const pillClass = (field: string, value: string) =>
    `rounded-full px-6 py-2.5 text-sm font-medium transition-colors ${
      (form as any)[field] === value
        ? "bg-[#060097] text-white"
        : "border border-gray-300 bg-white text-dar-slate hover:border-gray-400"
    }`;

  return (
    <>
      {/* Navy intro section */}
      <section className="bg-[#1c3349] py-16 md:py-20">
        <div className="mx-auto max-w-2xl px-6">
          <h1 className="text-3xl font-bold text-[#f8fddb] md:text-5xl">
            {t("pageTitle")}
          </h1>
          <div className="mt-6 space-y-4 text-[#f8fddb]/90 leading-relaxed">
            <p>{t("introText")}</p>
            <p>{t("introText2")}</p>
            <p>{t("introText3")}</p>
          </div>
        </div>
      </section>

      {/* Form body */}
      <section className="py-12 md:py-16">
        <form
          onSubmit={handleSubmit}
          noValidate
          className="mx-auto max-w-2xl px-6"
        >
          {/* Section: Person */}
          <h2 className="text-xl font-semibold text-dar-slate">
            {t("sectionPerson")}
          </h2>
          <div className="mt-6 space-y-5">
            {/* First Name */}
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-dar-slate"
              >
                {t("firstName")} <span className="text-red-500">*</span>
              </label>
              <input
                id="firstName"
                type="text"
                required
                aria-required="true"
                value={form.firstName}
                onChange={(e) => updateField("firstName", e.target.value)}
                className={inputClass("firstName")}
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-dar-slate"
              >
                {t("lastName")} <span className="text-red-500">*</span>
              </label>
              <input
                id="lastName"
                type="text"
                required
                aria-required="true"
                value={form.lastName}
                onChange={(e) => updateField("lastName", e.target.value)}
                className={inputClass("lastName")}
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <label
                htmlFor="dateOfBirth"
                className="block text-sm font-medium text-dar-slate"
              >
                {t("dateOfBirth")} <span className="text-red-500">*</span>
              </label>
              <input
                id="dateOfBirth"
                type="date"
                required
                aria-required="true"
                value={form.dateOfBirth}
                onChange={(e) => updateField("dateOfBirth", e.target.value)}
                className={inputClass("dateOfBirth")}
              />
              {errors.dateOfBirth && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.dateOfBirth}
                </p>
              )}
            </div>

            {/* City */}
            <div>
              <label
                htmlFor="city"
                className="block text-sm font-medium text-dar-slate"
              >
                {t("city")} <span className="text-red-500">*</span>
              </label>
              <input
                id="city"
                type="text"
                required
                aria-required="true"
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
                className={inputClass("city")}
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-600">{errors.city}</p>
              )}
            </div>

            {/* Country */}
            <div>
              <label
                htmlFor="country"
                className="block text-sm font-medium text-dar-slate"
              >
                {t("country")} <span className="text-red-500">*</span>
              </label>
              <input
                id="country"
                type="text"
                required
                aria-required="true"
                value={form.country}
                onChange={(e) => updateField("country", e.target.value)}
                className={inputClass("country")}
              />
              {errors.country && (
                <p className="mt-1 text-sm text-red-600">{errors.country}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-dar-slate"
              >
                {t("email")} <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                required
                aria-required="true"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                className={inputClass("email")}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
          </div>

          {/* Divider */}
          <hr className="my-10 border-gray-200" />

          {/* Section: Mortgage */}
          <h2 className="text-xl font-semibold text-dar-slate">
            {t("sectionMortgage")}
          </h2>
          <div className="mt-6 space-y-6">
            {/* Purchase Type */}
            <div>
              <p className="text-sm font-medium text-dar-slate">
                {t("purchaseType")} <span className="text-red-500">*</span>
              </p>
              <div className="mt-2 flex gap-3">
                {(["alone", "together"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => updateField("purchaseType", option)}
                    className={pillClass("purchaseType", option)}
                  >
                    {t(option)}
                  </button>
                ))}
              </div>
              {errors.purchaseType && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.purchaseType}
                </p>
              )}
            </div>

            {/* Income */}
            <div>
              <label
                htmlFor="income"
                className="block text-sm font-medium text-dar-slate"
              >
                {t("income")} <span className="text-red-500">*</span>
              </label>
              <select
                id="income"
                required
                aria-required="true"
                value={form.income}
                onChange={(e) => updateField("income", e.target.value)}
                className={inputClass("income")}
              >
                <option value="" disabled>
                  --
                </option>
                <option value="50k-100k">
                  &euro;50.000 - &euro;100.000
                </option>
                <option value="100k-150k">
                  &euro;100.000 - &euro;150.000
                </option>
                <option value="150k-200k">
                  &euro;150.000 - &euro;200.000
                </option>
                <option value=">200k">&gt; &euro;200.000</option>
              </select>
              {errors.income && (
                <p className="mt-1 text-sm text-red-600">{errors.income}</p>
              )}
            </div>

            {/* Financing Percentage */}
            <div>
              <label
                htmlFor="financingPercentage"
                className="block text-sm font-medium text-dar-slate"
              >
                {t("financingPercentage")} <span className="text-red-500">*</span>
              </label>
              <select
                id="financingPercentage"
                required
                aria-required="true"
                value={form.financingPercentage}
                onChange={(e) =>
                  updateField("financingPercentage", e.target.value)
                }
                className={inputClass("financingPercentage")}
              >
                <option value="" disabled>
                  --
                </option>
                <option value="100">100%</option>
                <option value="90">90%</option>
                <option value="80">80%</option>
                <option value="70">70%</option>
              </select>
              {errors.financingPercentage && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.financingPercentage}
                </p>
              )}
            </div>

            {/* Current Mortgage */}
            <div>
              <p className="text-sm font-medium text-dar-slate">
                {t("currentMortgage")} <span className="text-red-500">*</span>
              </p>
              <div className="mt-2 flex gap-3">
                {(["yes", "no"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => updateField("currentMortgage", option)}
                    className={pillClass("currentMortgage", option)}
                  >
                    {t(option)}
                  </button>
                ))}
              </div>
              {errors.currentMortgage && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.currentMortgage}
                </p>
              )}
              <p className="mt-2 text-sm text-gray-500">
                {t("currentMortgageHelp")}
              </p>
            </div>
          </div>

          {/* Divider */}
          <hr className="my-10 border-gray-200" />

          {/* Section: Contact / Consent */}
          <h2 className="text-xl font-semibold text-dar-slate">
            {t("sectionContact")}
          </h2>
          <div className="mt-6 space-y-5">
            {/* Combined Consent — single checkbox covering both statements */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.dataConsent && form.emailConsent}
                onChange={(e) => {
                  updateField("dataConsent", e.target.checked);
                  updateField("emailConsent", e.target.checked);
                }}
                className="mt-1 h-5 w-5 shrink-0 rounded border-gray-300 text-[#060097] accent-[#060097]"
              />
              <span className="text-sm text-dar-slate leading-relaxed space-y-3 block">
                <span className="block">{t("dataConsent")}</span>
                <span className="block">{t("emailConsent")}</span>
              </span>
            </label>
            {errors.dataConsent && (
              <p className="text-sm text-red-600">{errors.dataConsent}</p>
            )}

            {/* Privacy link */}
            <p className="text-sm text-gray-500">
              {t("privacyNote")}{" "}
              <a
                href={privacyHref}
                className="text-[#060097] underline hover:text-[#060097]/80"
              >
                {t("privacyLink")}
              </a>
              .
            </p>
          </div>

          {/* Submit */}
          <div className="mt-10">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-block rounded-full bg-dar-green px-10 py-4 font-semibold text-white transition-all hover:brightness-105 hover:scale-[1.03] active:scale-[0.97] disabled:opacity-60 cursor-pointer text-base md:text-lg"
            >
              {isSubmitting ? "..." : t("submit")}
            </button>
          </div>
        </form>
      </section>
    </>
  );
}
