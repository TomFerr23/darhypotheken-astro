import { useState, type FormEvent } from "react";
import { chatT } from "./chatTranslations";
import { useChat } from "./ChatContext";
import type { LeadApiResponse } from "@/lib/chat/types";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ChatLeadForm() {
  const { setLead, locale, setView, pendingFaqIndex } = useChat();
  const t = (key: string) => chatT(locale, key);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = t("errorNameRequired");
    }
    if (!email.trim()) {
      newErrors.email = t("errorEmailRequired");
    } else if (!EMAIL_REGEX.test(email.trim())) {
      newErrors.email = t("errorEmailInvalid");
    }
    if (!phone.trim()) {
      newErrors.phone = t("errorPhoneRequired");
    }
    if (!consent) {
      newErrors.consent = t("errorConsentRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setApiError("");

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          locale,
          source: "chatbot",
          dataConsent: consent,
          emailConsent: consent,
        }),
      });

      const data: LeadApiResponse = await res.json();

      if (data.success) {
        setLead({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          leadId: data.leadId,
        });
        setView(pendingFaqIndex !== null ? "answer" : "qualifier");
      } else {
        setApiError(data.error || t("errorGeneric"));
      }
    } catch {
      setApiError(t("errorGeneric"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses =
    "w-full rounded-lg border border-[#cbd5e1] bg-white px-3 py-2 text-sm text-[#1c3349] placeholder:text-[#94a3b8] focus:border-[#060097] focus:outline-none focus:ring-1 focus:ring-[#060097]";
  const labelClasses = "block text-xs font-medium text-[#1c3349] mb-1";

  return (
    <div className="flex flex-1 flex-col justify-center px-5 py-6">
      <p className="mb-4 text-sm text-[#1c3349] leading-relaxed">
        {t("leadFormIntro")}
      </p>

      <form onSubmit={handleSubmit} className="space-y-3" noValidate>
        <div>
          <label htmlFor="chat-name" className={labelClasses}>
            {t("labelName")}
          </label>
          <input
            id="chat-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("placeholderName")}
            className={inputClasses}
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-600">{errors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="chat-email" className={labelClasses}>
            {t("labelEmail")}
          </label>
          <input
            id="chat-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("placeholderEmail")}
            className={inputClasses}
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-600">{errors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="chat-phone" className={labelClasses}>
            {t("labelPhone")}
          </label>
          <input
            id="chat-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t("placeholderPhone")}
            className={inputClasses}
            disabled={isSubmitting}
          />
          {errors.phone && (
            <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
          )}
        </div>

        <div className="pt-1">
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              disabled={isSubmitting}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-[#cbd5e1] text-[#060097] accent-[#060097]"
            />
            <span className="text-xs text-[#1c3349] leading-snug">
              {t("consentLabel")}
            </span>
          </label>
          {errors.consent && (
            <p className="mt-1 text-xs text-red-600">{errors.consent}</p>
          )}
        </div>

        {apiError && (
          <p className="text-xs text-red-600 text-center">{apiError}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-[#80C33F] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#6daa33] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? t("submitting") : t("startChat")}
        </button>
      </form>
    </div>
  );
}
