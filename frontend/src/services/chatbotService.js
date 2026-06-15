// frontend/src/services/chatbotService.js
import api from '../api/axios.js';

class ChatbotService {
  constructor() {
    this.conversationHistory = [];
  }

  setConversationHistory(messages) {
    this.conversationHistory = messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({
        role: m.role,
        content: m.content,
      }));
  }

  async fetchHistory() {
    const response = await api.get('/chat/history');
    const { messages = [] } = response.data;
    return messages.map((m) => ({
      ...m,
      timestamp: new Date(m.timestamp),
    }));
  }

  async clearServerHistory() {
    await api.delete('/chat/history');
  }

  async sendMessage(message) {
    try {
      this.conversationHistory.push({
        role: 'user',
        content: message,
      });

      const response = await api.post('/chat', {
        messages: this.conversationHistory,
      });
      const { success, message: reply } = response.data;

      if (success) {
        this.conversationHistory.push({
          role: 'assistant',
          content: reply,
        });
        return { success: true, message: reply };
      }

      throw new Error('API returned success: false');

    } catch (error) {
      console.error('Chatbot error:', error);
      this.conversationHistory.pop();
      return {
        success: false,
        message: 'Sorry, I encountered an error. Please try again.',
      };
    }
  }

  clearHistory() {
    this.conversationHistory = [];
  }
}

export default new ChatbotService();
