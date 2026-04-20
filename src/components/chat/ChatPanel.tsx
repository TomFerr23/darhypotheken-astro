import { chatT } from "./chatTranslations";
import { useChat } from "./ChatContext";
import ChatLeadForm from "./ChatLeadForm";
import ChatHome from "./ChatHome";
import ChatConversation from "./ChatConversation";
import ChatQualifier from "./ChatQualifier";
import ChatThanks from "./ChatThanks";
import ChatAnswer from "./ChatAnswer";
import ChatTabs from "./ChatTabs";

export default function ChatPanel() {
  const { view, locale, toggleOpen, lead } = useChat();
  const t = (key: string) => chatT(locale, key);

  // Home has its own header (logo + avatars + close). Other views get a
  // compact header so the tab bar anchors the bottom and the close is always
  // reachable.
  const showCompactHeader = view !== "home";

  return (
    <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden rounded-2xl bg-white shadow-2xl max-md:rounded-b-none">
      {showCompactHeader && (
        <div className="flex shrink-0 items-center justify-between bg-[#0f2336] px-4 py-3">
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

      {/* View router */}
      {view === "home" && <ChatHome />}
      {view === "lead" && <ChatLeadForm />}
      {view === "answer" && lead && <ChatAnswer />}
      {view === "conversation" && lead && <ChatConversation />}
      {view === "qualifier" && lead && <ChatQualifier />}
      {(view === "conversation" ||
        view === "qualifier" ||
        view === "answer") &&
        !lead && <ChatLeadForm />}
      {view === "thanks" && <ChatThanks />}

      <ChatTabs />
    </div>
  );
}
