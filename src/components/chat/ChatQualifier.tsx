import { useState } from "react";
import { useChat } from "./ChatContext";
import { chatT, chatTWithParams } from "./chatTranslations";
import type { LeadApiResponse, QualifierAnswers } from "@/lib/chat/types";

interface QuestionBase {
  key: keyof QualifierAnswers;
  labelKey: string;
}

interface ChipsQuestion extends QuestionBase {
  kind: "chips";
  chips: { value: string; labelKey: string }[];
}

interface TextQuestion extends QuestionBase {
  kind: "text";
  placeholderKey: string;
}

interface DateQuestion extends QuestionBase {
  kind: "date";
  helperKey: string;
}

type Question = ChipsQuestion | TextQuestion | DateQuestion;

const QUESTIONS: Question[] = [
  {
    key: "purchaseType",
    labelKey: "qPurchaseTypeLabel",
    kind: "chips",
    chips: [
      { value: "Nieuwbouw", labelKey: "qPurchaseTypeNew" },
      { value: "Bestaande woning", labelKey: "qPurchaseTypeExisting" },
      { value: "Herfinanciering", labelKey: "qPurchaseTypeRefinance" },
      { value: "Anders", labelKey: "qPurchaseTypeOther" },
    ],
  },
  {
    key: "financingPercentage",
    labelKey: "qPriceRangeLabel",
    kind: "chips",
    chips: [
      { value: "<300000", labelKey: "qPriceRange1" },
      { value: "300000-450000", labelKey: "qPriceRange2" },
      { value: "450000-650000", labelKey: "qPriceRange3" },
      { value: ">650000", labelKey: "qPriceRange4" },
    ],
  },
  {
    key: "income",
    labelKey: "qIncomeLabel",
    kind: "chips",
    chips: [
      { value: "<40000", labelKey: "qIncome1" },
      { value: "40000-60000", labelKey: "qIncome2" },
      { value: "60000-90000", labelKey: "qIncome3" },
      { value: ">90000", labelKey: "qIncome4" },
    ],
  },
  {
    key: "currentMortgage",
    labelKey: "qCurrentMortgageLabel",
    kind: "chips",
    chips: [
      { value: "Ja", labelKey: "qCurrentMortgageYes" },
      { value: "Nee", labelKey: "qCurrentMortgageNo" },
    ],
  },
  {
    key: "dateOfBirth",
    labelKey: "qDateOfBirthLabel",
    kind: "date",
    helperKey: "qDateOfBirthHelper",
  },
  {
    key: "city",
    labelKey: "qCityLabel",
    kind: "text",
    placeholderKey: "qCityPlaceholder",
  },
];

export default function ChatQualifier() {
  const { locale, lead, qualifier, updateQualifier, setView } = useChat();
  const t = (key: string) => chatT(locale, key);
  const [step, setStep] = useState(0);
  const [textValue, setTextValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  const total = QUESTIONS.length;
  const q = QUESTIONS[step];
  const currentValue = qualifier[q.key] ?? "";

  const goNext = () => {
    setTextValue("");
    if (step < total - 1) {
      setStep(step + 1);
    } else {
      void submitQualified();
    }
  };

  const goBack = () => {
    setTextValue("");
    if (step > 0) setStep(step - 1);
  };

  const handleChipSelect = (value: string) => {
    updateQualifier({ [q.key]: value });
    window.setTimeout(() => {
      if (step < total - 1) {
        setStep(step + 1);
      } else {
        void submitQualified({ [q.key]: value });
      }
    }, 120);
  };

  const handleTextSubmit = () => {
    const value = textValue.trim();
    if (!value) return;
    updateQualifier({ [q.key]: value });
    setTextValue("");
    if (step < total - 1) {
      setStep(step + 1);
    } else {
      void submitQualified({ [q.key]: value });
    }
  };

  const handleDateSubmit = (value: string) => {
    if (!value) return;
    updateQualifier({ [q.key]: value });
    if (step < total - 1) {
      setStep(step + 1);
    } else {
      void submitQualified({ [q.key]: value });
    }
  };

  const skipQuestion = () => {
    if (step < total - 1) setStep(step + 1);
    else void submitQualified();
  };

  async function submitQualified(extra: Partial<QualifierAnswers> = {}) {
    if (!lead) return;
    setIsSubmitting(true);
    setApiError("");
    const finalAnswers: QualifierAnswers = { ...qualifier, ...extra };

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: lead.name,
          email: lead.email,
          locale,
          source: "chatbot-qualified",
          dataConsent: true,
          emailConsent: true,
          purchaseType: finalAnswers.purchaseType ?? "",
          financingPercentage: finalAnswers.financingPercentage ?? "",
          income: finalAnswers.income ?? "",
          currentMortgage: finalAnswers.currentMortgage ?? "",
          dateOfBirth: finalAnswers.dateOfBirth ?? "",
          city: finalAnswers.city ?? "",
          country: finalAnswers.country ?? "",
        }),
      });
      const data: LeadApiResponse = await res.json();
      if (data.success) {
        setView("thanks");
      } else {
        setApiError(data.error || t("errorGeneric"));
      }
    } catch {
      setApiError(t("errorGeneric"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto overscroll-contain bg-[#f4f6fa] px-5 pb-6 pt-5">
      {/* Progress */}
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between text-xs text-[#64748b]">
          <span>
            {chatTWithParams(locale, "qualifierProgress", {
              current: step + 1,
              total,
            })}
          </span>
          <button
            onClick={skipQuestion}
            className="text-[#060097] hover:underline"
            disabled={isSubmitting}
          >
            {t("qualifierSkip")}
          </button>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-[#e2e8f0]">
          <div
            className="h-full rounded-full bg-[#80C33F] transition-[width] duration-300"
            style={{ width: `${((step + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Intro only on first question */}
      {step === 0 && (
        <p className="mb-4 text-sm text-[#1c3349]/70">{t("qualifierIntro")}</p>
      )}

      {/* Question bubble */}
      <div className="mb-4 flex gap-2">
        <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1c3349] text-xs font-semibold text-[#f8fddb]">
          DAR
        </span>
        <div className="flex-1 rounded-2xl rounded-tl-sm bg-white px-4 py-3 shadow-sm">
          <p className="text-sm font-medium text-[#1c3349]">{t(q.labelKey)}</p>
          {q.kind === "date" && (
            <p className="mt-1 text-xs text-[#64748b]">{t(q.helperKey)}</p>
          )}
        </div>
      </div>

      {/* Answer area */}
      <div className="mt-auto">
        {q.kind === "chips" && (
          <div className="grid grid-cols-2 gap-2">
            {q.chips.map((chip) => {
              const isSelected = currentValue === chip.value;
              return (
                <button
                  key={chip.value}
                  onClick={() => handleChipSelect(chip.value)}
                  disabled={isSubmitting}
                  className={`rounded-xl border px-3 py-3 text-sm font-medium transition-all ${
                    isSelected
                      ? "border-[#80C33F] bg-[#80C33F]/10 text-[#1c3349]"
                      : "border-[#cbd5e1] bg-white text-[#1c3349] hover:border-[#80C33F] hover:bg-[#80C33F]/5"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  {t(chip.labelKey)}
                </button>
              );
            })}
          </div>
        )}

        {q.kind === "text" && (
          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleTextSubmit();
                }
              }}
              placeholder={t(q.placeholderKey)}
              disabled={isSubmitting}
              autoFocus
              className="w-full rounded-xl border border-[#cbd5e1] bg-white px-4 py-3 text-sm text-[#1c3349] placeholder:text-[#94a3b8] focus:border-[#060097] focus:outline-none focus:ring-1 focus:ring-[#060097]"
            />
            <button
              onClick={handleTextSubmit}
              disabled={isSubmitting || !textValue.trim()}
              className="rounded-xl bg-[#80C33F] px-4 py-3 text-sm font-semibold text-white hover:bg-[#6daa33] disabled:opacity-50"
            >
              {step === total - 1 ? t("qualifierFinish") : t("qualifierNext")}
            </button>
          </div>
        )}

        {q.kind === "date" && (
          <div className="flex flex-col gap-2">
            <input
              type="date"
              value={currentValue}
              onChange={(e) => handleDateSubmit(e.target.value)}
              disabled={isSubmitting}
              className="w-full rounded-xl border border-[#cbd5e1] bg-white px-4 py-3 text-sm text-[#1c3349] focus:border-[#060097] focus:outline-none focus:ring-1 focus:ring-[#060097]"
            />
          </div>
        )}

        {apiError && (
          <p className="mt-3 text-center text-xs text-red-600">{apiError}</p>
        )}

        <div className="mt-4 flex justify-between text-xs">
          {step > 0 ? (
            <button
              onClick={goBack}
              disabled={isSubmitting}
              className="text-[#64748b] hover:text-[#1c3349]"
            >
              ← {t("qualifierBack")}
            </button>
          ) : (
            <span />
          )}
          {q.kind === "chips" && currentValue && (
            <button
              onClick={goNext}
              disabled={isSubmitting}
              className="font-medium text-[#060097] hover:underline"
            >
              {step === total - 1 ? t("qualifierFinish") : t("qualifierNext")} →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
