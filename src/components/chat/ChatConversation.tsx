import { useEffect, useRef, useState, type FormEvent } from "react";
import { useChat } from "./ChatContext";
import { chatT } from "./chatTranslations";
import type { ChatApiResponse, ChatMessage } from "@/lib/chat/types";
import hotFaqsNl from "@/data/faq/hot-faqs-nl.json";
import hotFaqsEn from "@/data/faq/hot-faqs-en.json";

interface HotFaq {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export default function ChatConversation() {
  const {
    locale,
    lead,
    messages,
    addMessage,
    replaceTypingMessage,
    isLoading,
    setLoading,
    isAvailable,
    setAvailable,
    setView,
  } = useChat();
  const t = (key: string) => chatT(locale, key);

  const [draft, setDraft] = useState("");
  const [hasSeededWelcome, setHasSeededWelcome] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const quickFaqs = (locale === "en" ? hotFaqsEn : hotFaqsNl) as HotFaq[];

  // Seed a welcome message on first render so the chat isn't empty
  useEffect(() => {
    if (!hasSeededWelcome && messages.length === 0) {
      const firstName = lead?.name.split(" ")[0] ?? "";
      addMessage({
        id: `welcome-${Date.now()}`,
        role: "assistant",
        content: firstName
          ? chatT(locale, "conversationWelcomeNamed").replace("{name}", firstName)
          : chatT(locale, "conversationWelcome"),
        timestamp: Date.now(),
      });
      setHasSeededWelcome(true);
    } else if (messages.length > 0 && !hasSeededWelcome) {
      setHasSeededWelcome(true);
    }
  }, [hasSeededWelcome, messages.length, lead, locale, addMessage]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendToLlm = async (userContent: string) => {
    if (!isAvailable) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: userContent,
      timestamp: Date.now(),
    };
    addMessage(userMessage);

    const typingMessage: ChatMessage = {
      id: `typing-${Date.now()}`,
      role: "assistant",
      content: "",
      timestamp: Date.now(),
    };
    addMessage(typingMessage);
    setLoading(true);

    try {
      const startTime = Date.now();
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage]
            .filter((m) => m.content.trim().length > 0)
            .map((m) => ({ role: m.role, content: m.content })),
          locale,
        }),
      });
      const data: ChatApiResponse = await res.json();

      const elapsed = Date.now() - startTime;
      if (elapsed < 600) {
        await new Promise((r) => setTimeout(r, 600 - elapsed));
      }

      if (!data.available) {
        setAvailable(false);
        replaceTypingMessage({
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.message || t("comingSoon"),
          timestamp: Date.now(),
        });
      } else {
        replaceTypingMessage({
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.message,
          timestamp: Date.now(),
        });
      }
    } catch {
      replaceTypingMessage({
        id: `error-${Date.now()}`,
        role: "assistant",
        content: t("errorGeneric"),
        timestamp: Date.now(),
      });
    } finally {
      setLoading(false);
    }
  };

  // Tap on a quick FAQ chip — inserts local answer, no API call
  const handleQuickFaq = (item: HotFaq) => {
    if (isLoading) return;
    addMessage({
      id: `user-${Date.now()}`,
      role: "user",
      content: item.question,
      timestamp: Date.now(),
    });
    window.setTimeout(() => {
      addMessage({
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: item.answer,
        timestamp: Date.now(),
      });
    }, 250);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const value = draft.trim();
    if (!value || isLoading) return;
    setDraft("");
    void sendToLlm(value);
  };

  // Once the user has sent at least one message, hide the suggestion chips to
  // keep the chat clean
  const showQuickFaqs = messages.filter((m) => m.role === "user").length === 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#f4f6fa]">
      {/* Message list */}
      <div
        ref={scrollRef}
        className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4"
      >
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}

        {showQuickFaqs && (
          <div className="mt-1 flex flex-wrap gap-2">
            {quickFaqs.map((item) => (
              <button
                key={item.id}
                onClick={() => handleQuickFaq(item)}
                disabled={isLoading}
                className="rounded-full border border-[#cbd5e1] bg-white px-3 py-1.5 text-xs font-medium text-[#1c3349] transition-colors hover:border-[#80C33F] hover:bg-[#80C33F]/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {item.question}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Schedule-a-call CTA — small, unobtrusive, opens the qualifier */}
      <button
        onClick={() => setView("qualifier")}
        className="mx-4 mb-2 flex items-center justify-between gap-2 rounded-lg border border-[#cbd5e1] bg-white px-3 py-2 text-left text-xs text-[#64748b] transition-colors hover:border-[#80C33F] hover:text-[#1c3349]"
      >
        <span>
          <span className="font-semibold text-[#1c3349]">
            {t("scheduleCallTitle")}
          </span>{" "}
          — {t("scheduleCallSub")}
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

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-[#e2e8f0] bg-white px-3 py-3"
      >
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={t("inputPlaceholder")}
          disabled={isLoading || !isAvailable}
          enterKeyHint="send"
          autoComplete="off"
          className="flex-1 rounded-full border border-[#cbd5e1] bg-white px-4 py-2 text-sm text-[#1c3349] placeholder:text-[#94a3b8] focus:border-[#060097] focus:outline-none focus:ring-1 focus:ring-[#060097] disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={isLoading || !isAvailable || !draft.trim()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#80C33F] text-white transition-colors hover:bg-[#6daa33] disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={t("send")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path d="M3.478 2.405a.75.75 0 0 0-.926.94l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.405Z" />
          </svg>
        </button>
      </form>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const isTyping = message.content === "" && !isUser;

  return (
    <div className={`flex gap-2 ${isUser ? "flex-row-reverse" : ""}`}>
      {!isUser && (
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1c3349] text-[10px] font-semibold text-[#f8fddb]">
          DA
        </span>
      )}
      <div
        className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${
          isUser
            ? "rounded-tr-sm bg-[#1c3349] text-white"
            : "rounded-tl-sm bg-white text-[#1c3349]"
        }`}
      >
        {isTyping ? <TypingDots /> : message.content}
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <span className="flex items-center gap-1 py-1">
      <span className="h-1.5 w-1.5 animate-[bounce_0.8s_infinite_0ms] rounded-full bg-[#94a3b8]" />
      <span className="h-1.5 w-1.5 animate-[bounce_0.8s_infinite_150ms] rounded-full bg-[#94a3b8]" />
      <span className="h-1.5 w-1.5 animate-[bounce_0.8s_infinite_300ms] rounded-full bg-[#94a3b8]" />
    </span>
  );
}

