import type { ChatMessage as ChatMessageType } from "@/lib/chat/types";

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      <span className="h-2 w-2 rounded-full bg-[#94a3b8] animate-[bounce_1.4s_ease-in-out_0s_infinite]" />
      <span className="h-2 w-2 rounded-full bg-[#94a3b8] animate-[bounce_1.4s_ease-in-out_0.2s_infinite]" />
      <span className="h-2 w-2 rounded-full bg-[#94a3b8] animate-[bounce_1.4s_ease-in-out_0.4s_infinite]" />
    </div>
  );
}

export default function ChatMessage({ message }: { message: ChatMessageType }) {
  const isUser = message.role === "user";
  const isTyping = message.role === "assistant" && message.content === "";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="bg-[#060097] text-white rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[85%] self-end text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="bg-[#f0f4f8] text-[#1c3349] rounded-2xl rounded-bl-sm px-4 py-2.5 max-w-[85%] self-start text-sm leading-relaxed whitespace-pre-wrap">
        {isTyping ? <TypingIndicator /> : message.content}
      </div>
    </div>
  );
}
