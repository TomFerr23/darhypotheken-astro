import { useChat } from "./ChatContext";
import { chatT } from "./chatTranslations";
import faqNl from "@/data/faq/faq-nl.json";
import faqEn from "@/data/faq/faq-en.json";

interface FaqEntry {
  patterns: string[];
  answer: string;
}

const FAQ_PREVIEW_COUNT = 4;

export default function ChatHome() {
  const { locale, setView, setPendingFaqIndex, toggleOpen } = useChat();
  const t = (key: string) => chatT(locale, key);

  const faq = (locale === "en" ? faqEn : faqNl) as FaqEntry[];
  const preview = faq.slice(0, FAQ_PREVIEW_COUNT);

  const openLead = () => {
    setPendingFaqIndex(null);
    setView("lead");
  };

  const openFaq = (idx: number) => {
    setPendingFaqIndex(idx);
    setView("lead");
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[#f4f6fa]">
      {/* Hero */}
      <div className="shrink-0 bg-[#0f2336] px-5 pb-7 pt-5 text-white">
        <div className="flex items-start justify-between gap-3">
          <img
            src="/images/dar-logo.svg"
            alt="DAR Hypotheken"
            className="h-6 w-auto opacity-90"
          />
          <div className="flex items-center gap-3">
            <div className="flex -space-x-3">
              <img
                src="/images/team/karim-dar.png"
                alt=""
                className="relative z-30 h-9 w-9 rounded-full object-cover ring-2 ring-sky-300"
              />
              <img
                src="/images/team/rachid_new.png"
                alt=""
                className="relative z-20 h-9 w-9 rounded-full object-cover ring-2 ring-sky-300"
              />
              <img
                src="/images/team/fouad_new.png"
                alt=""
                className="relative z-10 h-9 w-9 rounded-full object-cover ring-2 ring-sky-300"
              />
            </div>
            <button
              onClick={toggleOpen}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              aria-label={t("close")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
              </svg>
            </button>
          </div>
        </div>

        <p className="mt-5 text-sm font-medium text-[#f8fddb]/80">
          {t("homeGreeting")}
        </p>
        <h2 className="mt-1 text-xl font-bold leading-snug text-white">
          {t("homeHeadline")}
        </h2>
        <p className="mt-1.5 text-xs text-white/70">{t("homeSubhead")}</p>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3 px-4 py-4">
        {/* Primary CTA */}
        <button
          onClick={openLead}
          className="group flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-4 text-left shadow-[0_4px_20px_-8px_rgba(10,30,51,0.2)] transition-all hover:shadow-[0_8px_28px_-8px_rgba(10,30,51,0.3)] active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#80C33F] text-white transition-transform group-hover:scale-105">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5"
              >
                <path
                  fillRule="evenodd"
                  d="M4.804 21.644A6.707 6.707 0 0 0 6 21.75a6.721 6.721 0 0 0 3.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 0 1-.814 1.686.75.75 0 0 0 .44 1.223Z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#1c3349]">
                {t("homeStartCard")}
              </p>
              <p className="mt-0.5 text-xs text-[#64748b]">
                {t("homeStartCardSub")}
              </p>
            </div>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="h-4 w-4 shrink-0 text-[#1c3349] transition-transform group-hover:translate-x-0.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 4.5l7.5 7.5-7.5 7.5"
            />
          </svg>
        </button>

        {/* FAQ preview card — tap goes through lead form first */}
        <div className="rounded-2xl bg-white p-4 shadow-[0_4px_20px_-8px_rgba(10,30,51,0.15)]">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#64748b]">
            {t("homeFaqTitle")}
          </p>
          <ul className="flex flex-col">
            {preview.map((item, idx) => (
              <li key={idx}>
                <button
                  onClick={() => openFaq(idx)}
                  className="flex w-full items-center justify-between gap-3 border-b border-[#e2e8f0] py-3 text-left last:border-none hover:text-[#060097]"
                >
                  <span className="text-sm text-[#1c3349]">
                    {capitalise(item.patterns[0])}
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    className="h-4 w-4 shrink-0 text-[#94a3b8]"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.25 4.5l7.5 7.5-7.5 7.5"
                    />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function capitalise(s: string): string {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}
