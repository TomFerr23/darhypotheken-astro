import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type {
  ChatMessage,
  ChatView,
  LeadInfo,
  QualifierAnswers,
} from "@/lib/chat/types";

interface ChatContextValue {
  isOpen: boolean;
  view: ChatView;
  messages: ChatMessage[];
  lead: LeadInfo | null;
  qualifier: QualifierAnswers;
  pendingFaqId: string | null;
  isLoading: boolean;
  isAvailable: boolean;
  locale: string;
  toggleOpen: () => void;
  setView: (view: ChatView) => void;
  setLead: (lead: LeadInfo) => void;
  updateQualifier: (patch: Partial<QualifierAnswers>) => void;
  resetQualifier: () => void;
  setPendingFaqId: (id: string | null) => void;
  addMessage: (message: ChatMessage) => void;
  replaceTypingMessage: (message: ChatMessage) => void;
  setLoading: (loading: boolean) => void;
  setAvailable: (available: boolean) => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children, locale = "nl" }: { children: ReactNode; locale?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setViewState] = useState<ChatView>("home");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [lead, setLeadState] = useState<LeadInfo | null>(null);
  const [qualifier, setQualifier] = useState<QualifierAnswers>({});
  const [pendingFaqId, setPendingFaqIdState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);

  const toggleOpen = useCallback(() => setIsOpen((prev) => !prev), []);
  const setView = useCallback((next: ChatView) => setViewState(next), []);

  const setLead = useCallback((lead: LeadInfo) => {
    setLeadState(lead);
  }, []);

  const updateQualifier = useCallback((patch: Partial<QualifierAnswers>) => {
    setQualifier((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetQualifier = useCallback(() => setQualifier({}), []);

  const setPendingFaqId = useCallback((id: string | null) => {
    setPendingFaqIdState(id);
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
        view,
        messages,
        lead,
        qualifier,
        pendingFaqId,
        isLoading,
        isAvailable,
        locale,
        toggleOpen,
        setView,
        setLead,
        updateQualifier,
        resetQualifier,
        setPendingFaqId,
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
