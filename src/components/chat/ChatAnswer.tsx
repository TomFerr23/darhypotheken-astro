import { useChat } from "./ChatContext";
import { chatT } from "./chatTranslations";
import hotFaqsNl from "@/data/faq/hot-faqs-nl.json";
import hotFaqsEn from "@/data/faq/hot-faqs-en.json";

interface HotFaq {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export default function ChatAnswer() {
  const {
    locale,
    pendingFaqId,
    setPendingFaqId,
    setView,
    addMessage,
  } = useChat();
  const t = (key: string) => chatT(locale, key);

  const hotFaqs = (locale === "en" ? hotFaqsEn : hotFaqsNl) as HotFaq[];
  const item = pendingFaqId
    ? hotFaqs.find((f) => f.id === pendingFaqId)
    : null;

  if (!item) {
    // Nothing to show — skip straight to conversation
    setView("conversation");
    return null;
  }

  const handleContinue = () => {
    // Seed the conversation with the question + answer so the user lands
    // into an already-warmed chat and can keep asking follow-ups.
    addMessage({
      id: `user-faq-${Date.now()}`,
      role: "user",
      content: item.question,
      timestamp: Date.now(),
    });
    addMessage({
      id: `assistant-faq-${Date.now()}`,
      role: "assistant",
      content: item.answer,
      timestamp: Date.now() + 1,
    });
    setPendingFaqId(null);
    setView("conversation");
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain bg-[#f4f6fa] px-5 pb-6 pt-5">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#64748b]">
        {t("answerLabel")}
      </p>

      <h3 className="mb-3 text-base font-bold text-[#1c3349]">
        {item.question}
      </h3>

      <div className="mb-4 flex gap-2">
        <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1c3349] text-xs font-semibold text-[#f8fddb]">
          DA
        </span>
        <div className="flex-1 rounded-2xl rounded-tl-sm bg-white px-4 py-3 text-sm leading-relaxed text-[#1c3349] shadow-sm">
          {item.answer}
        </div>
      </div>

      <div className="mt-auto">
        <button
          onClick={handleContinue}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#80C33F] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#6daa33]"
        >
          {t("answerContinue")}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="h-4 w-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 4.5l7.5 7.5-7.5 7.5"
            />
          </svg>
        </button>
        <p className="mt-2 text-center text-xs text-[#64748b]">
          {t("answerContinueHint")}
        </p>
      </div>
    </div>
  );
}
