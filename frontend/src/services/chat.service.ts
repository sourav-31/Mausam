import api from './api';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  isAiGenerated?: boolean;
}

export interface ChatLocation {
  latitude: number;
  longitude: number;
  cityName?: string;
}

export interface ChatResponse {
  reply: string;
  model: string;
  isAiGenerated: boolean;
}

export const chatService = {
  /**
   * Send conversation messages and active location to backend /api/chat
   */
  async sendMessage(messages: ChatMessage[], location?: ChatLocation): Promise<ChatResponse> {
    const payload = messages.map(({ role, content }) => ({ role, content }));
    const response = await api.post<ChatResponse>('/chat', {
      messages: payload,
      location,
    });
    return response.data;
  },
};
