import { User, Conversation, Message, Memory, UserSettings, EmotionType } from '../types';

const TOKEN_KEY = 'miro_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorMsg = 'An unexpected error occurred';
    try {
      const data = await res.json();
      errorMsg = data.error || errorMsg;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return res.json();
}

export const api = {
  // Auth
  register: async (name: string, email: string, password: string) => {
    const data = await request<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    setStoredToken(data.token);
    return data;
  },

  login: async (email: string, password: string) => {
    const data = await request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setStoredToken(data.token);
    return data;
  },

  loginAsGuest: async () => {
    const data = await request<{ token: string; user: User }>('/api/auth/guest', {
      method: 'POST',
    });
    setStoredToken(data.token);
    return data;
  },

  getMe: async () => {
    return request<{ isGuest: boolean; user: User }>('/api/auth/me');
  },

  logout: async () => {
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    clearStoredToken();
  },

  // Conversations
  getConversations: async () => {
    return request<Conversation[]>('/api/conversations');
  },

  createConversation: async (title?: string) => {
    return request<{ conversation: Conversation; messages: Message[] }>('/api/conversations', {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
  },

  getConversation: async (id: string) => {
    return request<{ conversation: Conversation; messages: Message[] }>(`/api/conversations/${id}`);
  },

  renameConversation: async (id: string, title: string) => {
    return request<Conversation>(`/api/conversations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ title }),
    });
  },

  deleteConversation: async (id: string) => {
    return request<{ success: boolean }>(`/api/conversations/${id}`, {
      method: 'DELETE',
    });
  },

  clearConversationMessages: async (id: string) => {
    return request<{ success: boolean }>(`/api/conversations/${id}/messages`, {
      method: 'DELETE',
    });
  },

  // Chat
  sendMessage: async (conversationId: string, content: string) => {
    return request<{
      userMessage: Message;
      assistantMessage: Message;
      emotion: EmotionType;
      newMemoryDetected?: string;
    }>('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ conversationId, content }),
    });
  },

  deleteMessage: async (id: string) => {
    return request<{ success: boolean }>(`/api/messages/${id}`, {
      method: 'DELETE',
    });
  },

  // Memories
  getMemories: async () => {
    return request<Memory[]>('/api/memories');
  },

  addMemory: async (memory: string, category?: string) => {
    return request<Memory>('/api/memories', {
      method: 'POST',
      body: JSON.stringify({ memory, category }),
    });
  },

  updateMemory: async (id: string, memory: string) => {
    return request<Memory>(`/api/memories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ memory }),
    });
  },

  deleteMemory: async (id: string) => {
    return request<{ success: boolean }>(`/api/memories/${id}`, {
      method: 'DELETE',
    });
  },

  clearAllMemories: async () => {
    return request<{ success: boolean }>('/api/memories', {
      method: 'DELETE',
    });
  },

  // Settings
  getSettings: async () => {
    return request<UserSettings>('/api/settings');
  },

  updateSettings: async (settings: Partial<UserSettings>) => {
    return request<UserSettings>('/api/settings', {
      method: 'PATCH',
      body: JSON.stringify(settings),
    });
  },
};
