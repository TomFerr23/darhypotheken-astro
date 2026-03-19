import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { ChatMessage, LeadInfo } from "@/lib/chat/types";

interface ChatContextValue {
  isOpen: boolean;
  messages: ChatMessage[];
  lead: LeadInfo | null;
  isLoading: boolean;
  isAvailable: boolean;
  locale: string;
  toggleOpen: () => void;
  setLead: (lead: LeadInfo) => void;
  addMessage: (message: ChatMessage) => void;
  replaceTypingMessage: (message: ChatMessage) => void;
  setLoading: (loading: boolean) => void;
  setAvailable: (available: boolean) => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children, locale = "nl" }: { children: ReactNode; locale?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [lead, setLeadState] = useState<LeadInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);

  const toggleOpen = useCallback(() => setIsOpen((prev) => !prev), []);

  const setLead = useCallback((lead: LeadInfo) => {
    setLeadState(lead);
  }, []);

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const replaceTypingMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => {
      const idx = prev.findIndex(
        (m) => m.role === "assistant" && m.content === ""
      );
      if (idx === -1) return [...prev, message];
      const next = [...prev];
      next[idx] = message;
      return next;
    });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  const setAvailable = useCallback((available: boolean) => {
    setIsAvailable(available);
  }, []);

  return (
    <ChatContext.Provider
      value={{
        isOpen,
        messages,
        lead,
        isLoading,
        isAvailable,
        locale,
        toggleOpen,
        setLead,
        addMessage,
        replaceTypingMessage,
        setLoading,
        setAvailable,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
