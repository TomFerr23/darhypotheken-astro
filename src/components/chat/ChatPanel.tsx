import { useRef, useEffect, useCallback } from "react";
import { chatT } from "./chatTranslations";
import { useChat } from "./ChatContext";
import ChatMessageComponent from "./ChatMessage";
import ChatInput from "./ChatInput";
import ChatLeadForm from "./ChatLeadForm";
import type { ChatApiResponse } from "@/lib/chat/types";

export default function ChatPanel() {
  const chatCtx = useChat();
  const t = (key: string) => chatT(chatCtx.locale, key);
  const {
    lead,
    messages,
    isAvailable,
    locale,
    toggleOpen,
    addMessage,
    replaceTypingMessage,
    setLoading,
    setAvailable,
  } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = useCallback(
    async (content: string) => {
      if (!isAvailable) return;

      const userMessage = {
        id: `user-${Date.now()}`,
        role: "user" as const,
        content,
        timestamp: Date.now(),
      };
      addMessage(userMessage);

      const typingMessage = {
        id: `typing-${Date.now()}`,
        role: "assistant" as const,
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
            messages: [...messages, userMessage].map((m) => ({
              role: m.role,
              content: m.content,
            })),
            locale,
          }),
        });

        const data: ChatApiResponse = await res.json();

        // Ensure typing indicator shows for at least 800ms for a natural feel
        const elapsed = Date.now() - startTime;
        if (elapsed < 800) {
          await new Promise((r) => setTimeout(r, 800 - elapsed));
        }

        if (!data.available) {
          setAvailable(false);
          replaceTypingMessage({
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: t("comingSoon"),
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
    },
    [isAvailable, messages, locale, addMessage, replaceTypingMessage, setLoading, setAvailable, t]
  );

  const displayMessages = messages;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-2xl md:rounded-2xl">
      {/* Header */}
      <div className="flex items-center justify-between rounded-t-2xl bg-[#1c3349] px-4 py-3">
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

      {/* Body */}
      {!lead ? (
        <ChatLeadForm />
      ) : (
        <div className="flex flex-1 flex-col overflow-hidden">
          <div
            ref={scrollRef}
            className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4"
          >
            {displayMessages.length === 0 && (
              <p className="text-center text-sm text-[#94a3b8] py-8">
                {t("welcomeMessage")}
              </p>
            )}
            {displayMessages.map((message) => (
              <ChatMessageComponent key={message.id} message={message} />
            ))}
          </div>
          <ChatInput onSend={handleSend} />
        </div>
      )}
    </div>
  );
}
