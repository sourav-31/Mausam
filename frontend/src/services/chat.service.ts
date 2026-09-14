import api from './api';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  isAiGenerated?: boolean;
}

export interface ChatResponse {
  reply: string;
  model: string;
  isAiGenerated: boolean;
}

export const chatService = {
  /**
   * Send conversation messages to backend /api/chat
   */
  async sendMessage(messages: ChatMessage[]): Promise<ChatResponse> {
    const payload = messages.map(({ role, content }) => ({ role, content }));
    const response = await api.post<ChatResponse>('/chat', { messages: payload });
    return response.data;
  },
};
