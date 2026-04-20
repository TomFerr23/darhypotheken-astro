import { useState } from "react";
import { useChat } from "./ChatContext";
import { chatT } from "./chatTranslations";
import faqNl from "@/data/faq/faq-nl.json";
import faqEn from "@/data/faq/faq-en.json";

interface FaqEntry {
  patterns: string[];
  answer: string;
}

export default function ChatFaq() {
  const { locale, setView } = useChat();
  const t = (key: string) => chatT(locale, key);
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faq = (locale === "en" ? faqEn : faqNl) as FaqEntry[];

  return (
    <div className="flex flex-1 flex-col overflow-y-auto bg-[#f4f6fa]">
      <div className="bg-gradient-to-b from-[#1c3349] to-[#1c3349] px-5 pb-6 pt-6 text-white">
        <h3 className="text-lg font-bold">{t("homeFaqTitle")}</h3>
        <p className="mt-1 text-xs text-white/70">{t("faqIntro")}</p>
      </div>

      <div className="flex flex-col gap-2 px-4 py-4">
        {faq.map((item, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="overflow-hidden rounded-xl bg-white shadow-sm"
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
              >
                <span className="text-sm font-medium text-[#1c3349]">
                  {capitalise(item.patterns[0])}
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  className={`h-4 w-4 shrink-0 text-[#94a3b8] transition-transform ${isOpen ? "rotate-180" : ""}`}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m19.5 8.25-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </button>
              {isOpen && (
                <div className="px-4 pb-4 text-sm leading-relaxed text-[#475569]">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}

        <button
          onClick={() => setView("lead")}
          className="mt-3 rounded-xl bg-[#80C33F] px-4 py-3 text-sm font-semibold text-white hover:bg-[#6daa33]"
        >
          {t("homeStartCard")}
        </button>
      </div>
    </div>
  );
}

function capitalise(s: string): string {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}
