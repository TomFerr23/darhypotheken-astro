import { useState, useRef, useCallback, type KeyboardEvent } from "react";
import { chatT } from "./chatTranslations";
import { useChat } from "./ChatContext";

export default function ChatInput({
  onSend,
}: {
  onSend: (message: string) => void;
}) {
  const { isLoading, locale } = useChat();
  const t = (key: string) => chatT(locale, key);
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [input, isLoading, onSend]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    const lineHeight = 20;
    const maxHeight = lineHeight * 3 + 16;
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
  };

  const isDisabled = isLoading || input.trim() === "";

  return (
    <div className="flex items-end gap-2 border-t border-[#e2e8f0] px-4 py-3">
      <textarea
        ref={textareaRef}
        value={input}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder={t("inputPlaceholder")}
        rows={1}
        className="flex-1 resize-none rounded-xl border border-[#cbd5e1] bg-white px-3 py-2 text-sm text-[#1c3349] placeholder:text-[#94a3b8] focus:border-[#060097] focus:outline-none focus:ring-1 focus:ring-[#060097]"
        disabled={isLoading}
      />
      <button
        onClick={handleSend}
        disabled={isDisabled}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#80C33F] text-white transition-colors hover:bg-[#6daa33] disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={t("send")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-4 w-4"
        >
          <path d="M3.105 2.288a.75.75 0 0 0-.826.95l1.414 4.926A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95l14.095-5.635a.75.75 0 0 0 0-1.392L3.105 2.288Z" />
        </svg>
      </button>
    </div>
  );
}
