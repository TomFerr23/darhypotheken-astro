export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface LeadInfo {
  name: string;
  email: string;
  phone: string;
  leadId?: string;
}

export interface ChatApiResponse {
  message: string;
  available: boolean;
}

export interface LeadApiResponse {
  success: boolean;
  leadId?: string;
  error?: string;
}
