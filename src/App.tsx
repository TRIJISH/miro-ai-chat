import React, { useState, useEffect } from 'react';
import { User, Conversation, Message, Memory, UserSettings, EmotionType } from './types';
import { api } from './services/api';
import { speech } from './services/speech';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { Sidebar } from './components/Sidebar';
import { ChatView } from './components/ChatView';
import { MemoryModal } from './components/MemoryModal';
import { SettingsModal } from './components/SettingsModal';
import { AuthModal } from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'chat'>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(true);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);

  const [settings, setSettings] = useState<UserSettings>({
    userId: 'guest_user',
    personality: 'friendly',
    voiceEnabled: true,
    voiceRate: 1.0,
    voicePitch: 1.05,
    voiceName: '',
    autoPlayVoice: false,
    theme: 'system',
    animationsEnabled: true,
  });

  const [activeEmotion, setActiveEmotion] = useState<EmotionType>('happy');
  const [isThinking, setIsThinking] = useState(false);
  const [newMemoryNotice, setNewMemoryNotice] = useState<string | null>(null);

  // Modals
  const [isMemoryOpen, setIsMemoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Initial load
  useEffect(() => {
    async function init() {
      try {
        // Authenticate or get guest
        const me = await api.getMe();
        setUser(me.user);
        setIsGuest(me.isGuest);

        // Fetch settings
        const userSettings = await api.getSettings();
        setSettings(userSettings);
        applyTheme(userSettings.theme);

        // Fetch memories
        const userMemories = await api.getMemories();
        setMemories(userMemories);

        // Fetch conversations
        const convList = await api.getConversations();
        setConversations(convList);

        if (convList.length > 0) {
          const firstId = convList[0].id;
          setActiveConversationId(firstId);
          const fullConv = await api.getConversation(firstId);
          setMessages(fullConv.messages);
        }
      } catch (err) {
        console.error('Initial loading error:', err);
      }
    }

    init();
  }, []);

  const applyTheme = (theme: 'light' | 'dark' | 'system') => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const handleSelectConversation = async (id: string) => {
    setActiveConversationId(id);
    try {
      const fullConv = await api.getConversation(id);
      setMessages(fullConv.messages);
      setActiveEmotion('happy');
    } catch (err) {
      console.error('Failed to load conversation:', err);
    }
  };

  const handleNewConversation = async () => {
    try {
      const res = await api.createConversation();
      setConversations((prev) => [res.conversation, ...prev]);
      setActiveConversationId(res.conversation.id);
      setMessages(res.messages);
      setCurrentView('chat');
      setActiveEmotion('happy');
    } catch (err) {
      console.error('Failed to create new conversation:', err);
    }
  };

  const handleRenameConversation = async (id: string, newTitle: string) => {
    try {
      const updated = await api.renameConversation(id, newTitle);
      setConversations((prev) => prev.map((c) => (c.id === id ? updated : c)));
    } catch (err) {
      console.error('Failed to rename conversation:', err);
    }
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      await api.deleteConversation(id);
      const remaining = conversations.filter((c) => c.id !== id);
      setConversations(remaining);

      if (activeConversationId === id) {
        if (remaining.length > 0) {
          handleSelectConversation(remaining[0].id);
        } else {
          setActiveConversationId(null);
          setMessages([]);
        }
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  const handleSendMessage = async (content: string) => {
    let convId = activeConversationId;
    if (!convId) {
      const newConv = await api.createConversation(content.slice(0, 24));
      setConversations((prev) => [newConv.conversation, ...prev]);
      setActiveConversationId(newConv.conversation.id);
      convId = newConv.conversation.id;
    }

    // Optimistically add user message
    const tempUserMsg: Message = {
      id: `temp_${Date.now()}`,
      conversationId: convId,
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    setIsThinking(true);
    setActiveEmotion('thinking');

    try {
      const res = await api.sendMessage(convId, content);

      // Replace optimistic and add assistant message
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempUserMsg.id),
        res.userMessage,
        res.assistantMessage,
      ]);

      setActiveEmotion(res.emotion || 'happy');

      // Update conversations list updatedAt
      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, updatedAt: new Date().toISOString() } : c))
      );

      // Handle new memory notification
      if (res.newMemoryDetected) {
        setNewMemoryNotice(res.newMemoryDetected);
        // Refresh memories
        const updatedMemories = await api.getMemories();
        setMemories(updatedMemories);
      }

      // Voice read aloud if enabled
      if (settings.voiceEnabled) {
        speech.speak(res.assistantMessage.content, {
          rate: settings.voiceRate,
          pitch: settings.voicePitch,
          voiceName: settings.voiceName,
        });
      }
    } catch (err: any) {
      console.error('Send message error:', err);
      setActiveEmotion('concerned');
      const errorMsg: Message = {
        id: `err_${Date.now()}`,
        conversationId: convId,
        role: 'assistant',
        content: "Miro couldn't respond right now. Please try again.",
        emotion: 'concerned',
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleRegenerate = async () => {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (!lastUserMsg || !activeConversationId) return;
    await handleSendMessage(lastUserMsg.content);
  };

  const handleDeleteMessage = async (msgId: string) => {
    try {
      await api.deleteMessage(msgId);
      setMessages((prev) => prev.filter((m) => m.id !== msgId));
    } catch (err) {
      console.error('Delete message error:', err);
    }
  };

  const handleClearChat = async () => {
    if (!activeConversationId) return;
    if (confirm('Clear all messages in this conversation?')) {
      try {
        await api.clearConversationMessages(activeConversationId);
        setMessages([]);
      } catch (err) {
        console.error('Clear chat error:', err);
      }
    }
  };

  // Memory Handlers
  const handleAddMemory = async (memory: string, category?: string) => {
    try {
      const created = await api.addMemory(memory, category);
      setMemories((prev) => [created, ...prev]);
    } catch (err) {
      console.error('Add memory error:', err);
    }
  };

  const handleUpdateMemory = async (id: string, memory: string) => {
    try {
      const updated = await api.updateMemory(id, memory);
      setMemories((prev) => prev.map((m) => (m.id === id ? updated : m)));
    } catch (err) {
      console.error('Update memory error:', err);
    }
  };

  const handleDeleteMemory = async (id: string) => {
    try {
      await api.deleteMemory(id);
      setMemories((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error('Delete memory error:', err);
    }
  };

  const handleClearAllMemories = async () => {
    try {
      await api.clearAllMemories();
      setMemories([]);
    } catch (err) {
      console.error('Clear memories error:', err);
    }
  };

  // Settings Handlers
  const handleUpdateSettings = async (partial: Partial<UserSettings>) => {
    try {
      const updated = await api.updateSettings(partial);
      setSettings(updated);
      if (partial.theme) {
        applyTheme(partial.theme);
      }
    } catch (err) {
      console.error('Update settings error:', err);
    }
  };

  const handleToggleVoice = async () => {
    const nextState = !settings.voiceEnabled;
    await handleUpdateSettings({ voiceEnabled: nextState });
    if (!nextState) {
      speech.stopSpeaking();
    }
  };

  // Auth Handlers
  const handleLogin = async (email: string, pass: string) => {
    const res = await api.login(email, pass);
    setUser(res.user);
    setIsGuest(false);
    refreshUserData();
  };

  const handleRegister = async (name: string, email: string, pass: string) => {
    const res = await api.register(name, email, pass);
    setUser(res.user);
    setIsGuest(false);
    refreshUserData();
  };

  const handleGuestLogin = async () => {
    const res = await api.loginAsGuest();
    setUser(res.user);
    setIsGuest(true);
    refreshUserData();
  };

  const handleLogout = async () => {
    await api.logout();
    const guestRes = await api.loginAsGuest();
    setUser(guestRes.user);
    setIsGuest(true);
    refreshUserData();
  };

  const refreshUserData = async () => {
    const convList = await api.getConversations();
    setConversations(convList);
    if (convList.length > 0) {
      setActiveConversationId(convList[0].id);
      const fullConv = await api.getConversation(convList[0].id);
      setMessages(fullConv.messages);
    } else {
      setActiveConversationId(null);
      setMessages([]);
    }
    const userMemories = await api.getMemories();
    setMemories(userMemories);
    const userSettings = await api.getSettings();
    setSettings(userSettings);
  };

  const activeConv = conversations.find((c) => c.id === activeConversationId) || null;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] dark:bg-[#0C0A09] text-stone-900 dark:text-stone-100 transition-colors">
      
      {/* Universal Top Navigation Bar */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        user={user}
        isGuest={isGuest}
        voiceEnabled={settings.voiceEnabled}
        onToggleVoice={handleToggleVoice}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenMemory={() => setIsMemoryOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        activePersonality={settings.personality}
      />

      {/* Main View Router */}
      {currentView === 'landing' ? (
        <LandingPage
          onStartChat={() => setCurrentView('chat')}
          onOpenMemory={() => setIsMemoryOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      ) : (
        <div className="flex-1 flex overflow-hidden">
          {/* Collapsible Sidebar for History */}
          <Sidebar
            conversations={conversations}
            activeConversationId={activeConversationId}
            onSelectConversation={handleSelectConversation}
            onNewConversation={handleNewConversation}
            onRenameConversation={handleRenameConversation}
            onDeleteConversation={handleDeleteConversation}
            onOpenMemory={() => setIsMemoryOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            isOpen={isSidebarOpen}
            onCloseMobile={() => setIsSidebarOpen(false)}
            memoryCount={memories.length}
          />

          {/* Chat Container */}
          <main className="flex-1 flex flex-col lg:pl-72 w-full transition-all overflow-hidden">
            <ChatView
              conversation={activeConv}
              messages={messages}
              onSendMessage={handleSendMessage}
              onRegenerate={handleRegenerate}
              onDeleteMessage={handleDeleteMessage}
              onClearChat={handleClearChat}
              isThinking={isThinking}
              activeEmotion={activeEmotion}
              settings={settings}
              onOpenSidebar={() => setIsSidebarOpen(true)}
              onOpenMemory={() => setIsMemoryOpen(true)}
              onOpenSettings={() => setIsSettingsOpen(true)}
              newMemoryNotice={newMemoryNotice}
              onClearMemoryNotice={() => setNewMemoryNotice(null)}
            />
          </main>
        </div>
      )}

      {/* Modals */}
      <MemoryModal
        isOpen={isMemoryOpen}
        onClose={() => setIsMemoryOpen(false)}
        memories={memories}
        onAddMemory={handleAddMemory}
        onUpdateMemory={handleUpdateMemory}
        onDeleteMemory={handleDeleteMemory}
        onClearAllMemories={handleClearAllMemories}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onClearAllChats={async () => {
          for (const c of conversations) {
            await api.deleteConversation(c.id);
          }
          setConversations([]);
          setActiveConversationId(null);
          setMessages([]);
        }}
        onClearAllMemories={handleClearAllMemories}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onGuestLogin={handleGuestLogin}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        memoryCount={memories.length}
        conversationCount={conversations.length}
        onLogout={handleLogout}
        onOpenMemory={() => setIsMemoryOpen(true)}
      />

    </div>
  );
}
