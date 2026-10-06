import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { db } from './server/db.js';
import { hashPassword, verifyPassword, createSession, verifySession, destroySession } from './server/auth.js';
import { askMiro } from './server/ai.js';
import { getMemories, addMemory, updateMemory, deleteMemory, clearAllMemories } from './server/memory.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// Auth helper middleware
function getAuthenticatedUser(req: Request) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : (req.query.token as string);
  const user = verifySession(token);
  if (user) return user;
  
  // Default to guest user for seamless friction-free companion experience
  return db.getUserById('guest_user') || {
    id: 'guest_user',
    name: 'Friend',
    email: 'guest@miro.chat',
    passwordHash: '',
    createdAt: new Date().toISOString(),
  };
}

// ----------------------------------------------------
// AUTH ENDPOINTS
// ----------------------------------------------------

app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const existing = db.getUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const newUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash: hashPassword(password),
      avatar: name.trim().charAt(0).toUpperCase(),
      createdAt: new Date().toISOString(),
    };

    db.saveUser(newUser);
    const token = createSession(newUser.id);

    // Create a first conversation for the user
    const firstConv = {
      id: `conv_${Date.now()}`,
      userId: newUser.id,
      title: 'First chat with Miro',
      personality: 'friendly',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.saveConversation(firstConv);
    db.saveMessage({
      id: `msg_${Date.now()}`,
      conversationId: firstConv.id,
      role: 'assistant',
      content: `Hey ${newUser.name}! I'm Miro. I'm really glad to meet you. What's on your mind today?`,
      emotion: 'happy',
      createdAt: new Date().toISOString(),
    });

    return res.json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        avatar: newUser.avatar,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Could not create account.' });
  }
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = db.getUserByEmail(email);
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = createSession(user.id);
    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Login failed.' });
  }
});

app.post('/api/auth/guest', (req: Request, res: Response) => {
  const guest = db.getUserById('guest_user')!;
  const token = createSession(guest.id);
  return res.json({
    token,
    user: {
      id: guest.id,
      name: guest.name,
      email: guest.email,
      avatar: '✦',
    },
  });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : '';
  const user = verifySession(token);
  if (!user) {
    const guest = db.getUserById('guest_user')!;
    return res.json({
      isGuest: true,
      user: {
        id: guest.id,
        name: guest.name,
        email: guest.email,
        avatar: '✦',
      },
    });
  }
  return res.json({
    isGuest: user.id === 'guest_user',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar || user.name.charAt(0).toUpperCase(),
    },
  });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (token) destroySession(token);
  return res.json({ success: true });
});

// ----------------------------------------------------
// CONVERSATIONS
// ----------------------------------------------------

app.get('/api/conversations', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  const convs = db.getConversations(user.id);
  return res.json(convs);
});

app.post('/api/conversations', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  const settings = db.getSettings(user.id);
  const newConv = {
    id: `conv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId: user.id,
    title: req.body.title || 'New conversation',
    personality: settings.personality || 'friendly',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.saveConversation(newConv);

  // Initial welcome greeting
  const initialMsg = {
    id: `msg_${Date.now()}`,
    conversationId: newConv.id,
    role: 'assistant' as const,
    content: `Hey ${user.name !== 'Guest Friend' ? user.name : 'there'}, I'm Miro. What would you like to talk about today?`,
    emotion: 'happy' as const,
    createdAt: new Date().toISOString(),
  };
  db.saveMessage(initialMsg);

  return res.json({ conversation: newConv, messages: [initialMsg] });
});

app.get('/api/conversations/:id', (req: Request, res: Response) => {
  const conv = db.getConversationById(req.params.id);
  if (!conv) {
    return res.status(404).json({ error: 'Conversation not found' });
  }
  const messages = db.getMessages(conv.id);
  return res.json({ conversation: conv, messages });
});

app.patch('/api/conversations/:id', (req: Request, res: Response) => {
  const conv = db.getConversationById(req.params.id);
  if (!conv) {
    return res.status(404).json({ error: 'Conversation not found' });
  }
  if (req.body.title) {
    conv.title = req.body.title.trim();
  }
  db.saveConversation(conv);
  return res.json(conv);
});

app.delete('/api/conversations/:id', (req: Request, res: Response) => {
  db.deleteConversation(req.params.id);
  return res.json({ success: true });
});

app.delete('/api/conversations/:id/messages', (req: Request, res: Response) => {
  db.clearMessages(req.params.id);
  return res.json({ success: true });
});

// ----------------------------------------------------
// CHAT & MESSAGES
// ----------------------------------------------------

app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const { conversationId, content } = req.body;

    if (!conversationId || !content || !content.trim()) {
      return res.status(400).json({ error: 'conversationId and content are required.' });
    }

    let conv = db.getConversationById(conversationId);
    if (!conv) {
      conv = db.saveConversation({
        id: conversationId,
        userId: user.id,
        title: content.slice(0, 30),
        personality: 'friendly',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // Save user message
    const userMsg = db.saveMessage({
      id: `msg_u_${Date.now()}`,
      conversationId: conv.id,
      role: 'user',
      content: content.trim(),
      createdAt: new Date().toISOString(),
    });

    // Update conversation title if it was first message and still "New conversation"
    if (conv.title === 'New conversation' || conv.title === 'First chat with Miro') {
      const summaryTitle = content.trim().slice(0, 28) + (content.length > 28 ? '...' : '');
      conv.title = summaryTitle;
      db.saveConversation(conv);
    }

    // Call Miro AI Brain
    const aiResult = await askMiro(conv.id, content.trim(), user.id);

    // Save assistant message
    const assistantMsg = db.saveMessage({
      id: `msg_a_${Date.now()}`,
      conversationId: conv.id,
      role: 'assistant',
      content: aiResult.text,
      emotion: aiResult.emotion,
      createdAt: new Date().toISOString(),
    });

    return res.json({
      userMessage: userMsg,
      assistantMessage: assistantMsg,
      emotion: aiResult.emotion,
      newMemoryDetected: aiResult.newMemoryDetected,
    });
  } catch (err) {
    console.error('Chat error:', err);
    return res.status(500).json({
      error: "Miro couldn't respond right now. Please try again.",
    });
  }
});

app.delete('/api/messages/:id', (req: Request, res: Response) => {
  db.deleteMessage(req.params.id);
  return res.json({ success: true });
});

// ----------------------------------------------------
// MEMORY ENDPOINTS
// ----------------------------------------------------

app.get('/api/memories', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  const memories = getMemories(user.id);
  return res.json(memories);
});

app.post('/api/memories', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  const { memory, category } = req.body;
  if (!memory || !memory.trim()) {
    return res.status(400).json({ error: 'Memory content is required.' });
  }
  const created = addMemory(user.id, memory, category || 'general');
  return res.json(created);
});

app.patch('/api/memories/:id', (req: Request, res: Response) => {
  const { memory } = req.body;
  if (!memory || !memory.trim()) {
    return res.status(400).json({ error: 'Memory content is required.' });
  }
  const updated = updateMemory(req.params.id, memory);
  if (!updated) return res.status(404).json({ error: 'Memory not found' });
  return res.json(updated);
});

app.delete('/api/memories/:id', (req: Request, res: Response) => {
  deleteMemory(req.params.id);
  return res.json({ success: true });
});

app.delete('/api/memories', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  clearAllMemories(user.id);
  return res.json({ success: true });
});

// ----------------------------------------------------
// SETTINGS ENDPOINTS
// ----------------------------------------------------

app.get('/api/settings', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  const settings = db.getSettings(user.id);
  return res.json(settings);
});

app.patch('/api/settings', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  const current = db.getSettings(user.id);
  const updated = db.saveSettings({
    ...current,
    ...req.body,
    userId: user.id,
  });
  return res.json(updated);
});

// ----------------------------------------------------
// VITE DEV SERVER OR PRODUCTION STATIC SERVING
// ----------------------------------------------------

async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✦ MIRO CHAT server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
