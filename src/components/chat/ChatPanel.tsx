import { chatT } from "./chatTranslations";
import { useChat } from "./ChatContext";
import ChatLeadForm from "./ChatLeadForm";
import ChatHome from "./ChatHome";
import ChatQualifier from "./ChatQualifier";
import ChatThanks from "./ChatThanks";
import ChatFaq from "./ChatFaq";
import ChatTabs from "./ChatTabs";

export default function ChatPanel() {
  const { view, locale, toggleOpen, lead } = useChat();
  const t = (key: string) => chatT(locale, key);

  // On smaller views we keep a compact header so the tab bar can anchor the bottom.
  const showCompactHeader = view !== "home";

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-2xl md:rounded-2xl">
      {showCompactHeader && (
        <div className="flex items-center justify-between bg-[#1c3349] px-4 py-3">
          <span className="text-sm font-semibold text-[#f8fddb]">
            {t("title")}
          </span>
          <button
            onClick={toggleOpen}
            className="flex h-7 w-7 items-center justify-center rounded-full text-[#f8fddb] transition-colors hover:bg-white/10"
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
      )}

      {/* Home has its own immersive header with close button overlay */}
      {!showCompactHeader && (
        <button
          onClick={toggleOpen}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
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
      )}

      {/* View router */}
      {view === "home" && <ChatHome />}
      {view === "lead" && <ChatLeadForm />}
      {view === "qualifier" && lead && <ChatQualifier />}
      {view === "qualifier" && !lead && <ChatLeadForm />}
      {view === "thanks" && <ChatThanks />}
      {view === "faq" && <ChatFaq />}

      <ChatTabs />
    </div>
  );
}
