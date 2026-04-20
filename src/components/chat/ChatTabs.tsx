import { useChat } from "./ChatContext";
import { chatT } from "./chatTranslations";
import type { ChatView } from "@/lib/chat/types";

const TABS: {
  view: ChatView;
  labelKey: string;
  icon: (active: boolean) => JSX.Element;
}[] = [
  {
    view: "home",
    labelKey: "tabHome",
    icon: (active) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={active ? 0 : 1.75}
        className="h-5 w-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 12 12 2.25 21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75"
        />
      </svg>
    ),
  },
  {
    view: "lead",
    labelKey: "tabChat",
    icon: (active) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={active ? 0 : 1.75}
        className="h-5 w-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
        />
      </svg>
    ),
  },
  {
    view: "faq",
    labelKey: "tabFaq",
    icon: (active) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={active ? 0 : 1.75}
        className="h-5 w-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
        />
      </svg>
    ),
  },
];

export default function ChatTabs() {
  const { view, setView, lead, locale } = useChat();
  const t = (key: string) => chatT(locale, key);

  return (
    <nav className="flex items-center justify-around border-t border-[#e2e8f0] bg-white px-2 py-2">
      {TABS.map((tab) => {
        // If chat tab is clicked after lead is captured, jump to qualifier, not lead form
        const isActive =
          view === tab.view ||
          (tab.view === "lead" &&
            (view === "qualifier" || view === "thanks"));
        const handle = () => {
          if (tab.view === "lead" && lead) {
            // after lead captured, resume qualifier
            setView("qualifier");
          } else {
            setView(tab.view);
          }
        };
        return (
          <button
            key={tab.view}
            onClick={handle}
            className={`flex flex-1 flex-col items-center gap-0.5 py-1 text-[11px] font-medium transition-colors ${
              isActive ? "text-[#060097]" : "text-[#94a3b8] hover:text-[#1c3349]"
            }`}
          >
            {tab.icon(isActive)}
            <span>{t(tab.labelKey)}</span>
          </button>
        );
      })}
    </nav>
  );
}
