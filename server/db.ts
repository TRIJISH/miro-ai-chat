import fs from 'fs';
import path from 'path';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  avatar?: string;
  createdAt: string;
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
  emotion?: 'idle' | 'listening' | 'thinking' | 'speaking' | 'happy' | 'concerned' | 'playful' | 'calm';
  createdAt: string;
}

export interface Memory {
  id: string;
  userId: string;
  category?: string; // 'preference' | 'personal' | 'goal' | 'general'
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

interface DatabaseSchema {
  users: User[];
  conversations: Conversation[];
  messages: Message[];
  memories: Memory[];
  settings: Record<string, UserSettings>;
}

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

// Ensure DB directory and file exist
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const initialData: DatabaseSchema = {
  users: [
    {
      id: 'guest_user',
      name: 'Guest Friend',
      email: 'guest@miro.chat',
      passwordHash: '',
      avatar: '✦',
      createdAt: new Date().toISOString(),
    },
  ],
  conversations: [
    {
      id: 'conv_welcome',
      userId: 'guest_user',
      title: 'First chat with Miro',
      personality: 'friendly',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  messages: [
    {
      id: 'msg_welcome',
      conversationId: 'conv_welcome',
      role: 'assistant',
      content: "Hey, I'm Miro. I'm really glad you're here. How are you feeling today?",
      emotion: 'happy',
      createdAt: new Date().toISOString(),
    },
  ],
  memories: [
    {
      id: 'mem_1',
      userId: 'guest_user',
      category: 'general',
      memory: 'Appreciates quiet, thoughtful conversations and clean spaces.',
      createdAt: new Date().toISOString(),
    },
  ],
  settings: {
    guest_user: {
      userId: 'guest_user',
      personality: 'friendly',
      voiceEnabled: true,
      voiceRate: 1.0,
      voicePitch: 1.05,
      voiceName: '',
      autoPlayVoice: false,
      theme: 'system',
      animationsEnabled: true,
    },
  },
};

function readDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
      return initialData;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed reading DB, recovering with initial data:', err);
    return initialData;
  }
}

function writeDb(data: DatabaseSchema): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed writing DB:', err);
  }
}

export const db = {
  getUsers: () => readDb().users,
  getUserById: (id: string) => readDb().users.find((u) => u.id === id),
  getUserByEmail: (email: string) => readDb().users.find((u) => u.email.toLowerCase() === email.toLowerCase()),
  saveUser: (user: User) => {
    const data = readDb();
    const idx = data.users.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      data.users[idx] = user;
    } else {
      data.users.push(user);
    }
    writeDb(data);
    return user;
  },

  getConversations: (userId: string) => {
    return readDb().conversations
      .filter((c) => c.userId === userId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },
  getConversationById: (id: string) => readDb().conversations.find((c) => c.id === id),
  saveConversation: (conv: Conversation) => {
    const data = readDb();
    const idx = data.conversations.findIndex((c) => c.id === conv.id);
    if (idx >= 0) {
      data.conversations[idx] = conv;
    } else {
      data.conversations.unshift(conv);
    }
    writeDb(data);
    return conv;
  },
  deleteConversation: (id: string) => {
    const data = readDb();
    data.conversations = data.conversations.filter((c) => c.id !== id);
    data.messages = data.messages.filter((m) => m.conversationId !== id);
    writeDb(data);
  },

  getMessages: (conversationId: string) => {
    return readDb().messages
      .filter((m) => m.conversationId === conversationId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },
  saveMessage: (msg: Message) => {
    const data = readDb();
    const idx = data.messages.findIndex((m) => m.id === msg.id);
    if (idx >= 0) {
      data.messages[idx] = msg;
    } else {
      data.messages.push(msg);
    }
    // Update conversation updatedAt
    const cIdx = data.conversations.findIndex((c) => c.id === msg.conversationId);
    if (cIdx >= 0) {
      data.conversations[cIdx].updatedAt = msg.createdAt;
    }
    writeDb(data);
    return msg;
  },
  deleteMessage: (id: string) => {
    const data = readDb();
    data.messages = data.messages.filter((m) => m.id !== id);
    writeDb(data);
  },
  clearMessages: (conversationId: string) => {
    const data = readDb();
    data.messages = data.messages.filter((m) => m.conversationId !== conversationId);
    writeDb(data);
  },

  getMemories: (userId: string) => {
    return readDb().memories
      .filter((m) => m.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  saveMemory: (mem: Memory) => {
    const data = readDb();
    const idx = data.memories.findIndex((m) => m.id === mem.id);
    if (idx >= 0) {
      data.memories[idx] = mem;
    } else {
      data.memories.unshift(mem);
    }
    writeDb(data);
    return mem;
  },
  deleteMemory: (id: string) => {
    const data = readDb();
    data.memories = data.memories.filter((m) => m.id !== id);
    writeDb(data);
  },
  clearMemories: (userId: string) => {
    const data = readDb();
    data.memories = data.memories.filter((m) => m.userId !== userId);
    writeDb(data);
  },

  getSettings: (userId: string): UserSettings => {
    const data = readDb();
    return data.settings[userId] || {
      userId,
      personality: 'friendly',
      voiceEnabled: true,
      voiceRate: 1.0,
      voicePitch: 1.05,
      voiceName: '',
      autoPlayVoice: false,
      theme: 'system',
      animationsEnabled: true,
    };
  },
  saveSettings: (settings: UserSettings) => {
    const data = readDb();
    data.settings[settings.userId] = settings;
    writeDb(data);
    return settings;
  },
};
