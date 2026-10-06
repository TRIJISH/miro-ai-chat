export type EmotionType =
  | 'idle'
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'happy'
  | 'concerned'
  | 'playful'
  | 'calm';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  personality: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  emotion?: EmotionType;
  createdAt: string;
}

export interface Memory {
  id: string;
  userId: string;
  category?: string;
  memory: string;
  createdAt: string;
}

export interface UserSettings {
  userId: string;
  personality: 'calm' | 'friendly' | 'playful' | 'motivational' | 'curious';
  voiceEnabled: boolean;
  voiceRate: number;
  voicePitch: number;
  voiceName: string;
  autoPlayVoice: boolean;
  theme: 'light' | 'dark' | 'system';
  animationsEnabled: boolean;
}
