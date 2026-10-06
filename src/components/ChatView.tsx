import React, { useState, useEffect, useRef } from 'react';
import { Conversation, Message, EmotionType, UserSettings } from '../types';
import { MiroCompanion } from './MiroCompanion';
import { speech } from '../services/speech';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  RotateCcw,
  Copy,
  Check,
  Trash2,
  Brain,
  Menu,
  Sparkles,
  Smile,
  AlertCircle
} from 'lucide-react';

interface ChatViewProps {
  conversation: Conversation | null;
  messages: Message[];
  onSendMessage: (content: string) => Promise<void>;
  onRegenerate: () => Promise<void>;
  onDeleteMessage: (id: string) => Promise<void>;
  onClearChat: () => Promise<void>;
  isThinking: boolean;
  activeEmotion: EmotionType;
  settings: UserSettings;
  onOpenSidebar: () => void;
  onOpenMemory: () => void;
  onOpenSettings: () => void;
  newMemoryNotice: string | null;
  onClearMemoryNotice: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  conversation,
  messages,
  onSendMessage,
  onRegenerate,
  onDeleteMessage,
  onClearChat,
  isThinking,
  activeEmotion,
  settings,
  onOpenSidebar,
  onOpenMemory,
  onOpenSettings,
  newMemoryNotice,
  onClearMemoryNotice,
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeakingAloud, setIsSpeakingAloud] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Adjust textarea height dynamically
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [inputText]);

  // Handle Speech-to-Text via microphone
  const handleToggleMic = () => {
    if (isListening) {
      speech.stopListening();
      setIsListening(false);
      return;
    }

    setVoiceNotice(null);
    const started = speech.startListening(
      (transcript, isFinal) => {
        setInputText(transcript);
        if (isFinal) {
          setIsListening(false);
        }
      },
      (err) => {
        setVoiceNotice(err);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      }
    );

    if (started) {
      setIsListening(true);
    }
  };

  // Speak assistant message aloud
  const handleReadAloud = (text: string) => {
    if (isSpeakingAloud) {
      speech.stopSpeaking();
      setIsSpeakingAloud(false);
      return;
    }

    setIsSpeakingAloud(true);
    speech.speak(text, {
      rate: settings.voiceRate,
      pitch: settings.voicePitch,
      voiceName: settings.voiceName,
      onStart: () => setIsSpeakingAloud(true),
      onEnd: () => setIsSpeakingAloud(false),
    });
  };

  // Copy message to clipboard
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Submit message
  const handleSend = async () => {
    if (!inputText.trim() || isThinking) return;
    const content = inputText.trim();
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    await onSendMessage(content);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Determine current companion status for the top avatar
  const companionStatus: EmotionType = isListening
    ? 'listening'
    : isThinking
    ? 'thinking'
    : isSpeakingAloud
    ? 'speaking'
    : activeEmotion;

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] bg-[#FAF9F6] dark:bg-[#0C0A09] relative overflow-hidden transition-colors">
      
      {/* Top Companion Status Banner */}
      <div className="px-4 py-2 sm:py-3 border-b border-stone-200/60 dark:border-stone-800/60 flex items-center justify-between bg-white/40 dark:bg-stone-900/30 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSidebar}
            className="p-1.5 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/50 dark:hover:bg-stone-800/50 rounded-lg lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-medium text-stone-800 dark:text-stone-200 truncate max-w-[160px] sm:max-w-xs">
              {conversation?.title || 'Chatting with Miro'}
            </span>
            <span className="text-[11px] px-2 py-0.5 bg-stone-100 dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700/80 rounded-md text-stone-600 dark:text-stone-400 capitalize">
              {settings.personality} mode
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={onClearChat}
              title="Clear conversation"
              className="px-2.5 py-1 text-xs text-stone-500 hover:text-rose-600 dark:text-stone-400 dark:hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
            >
              Clear
            </button>
          )}
          <button
            onClick={onOpenMemory}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 bg-stone-100 dark:bg-stone-800/80 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg transition-colors cursor-pointer"
          >
            <Brain className="w-3.5 h-3.5 text-stone-500" />
            <span>Memories</span>
          </button>
        </div>
      </div>

      {/* Memory Notification Banner */}
      {newMemoryNotice && (
        <div className="px-4 py-2 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200/70 dark:border-amber-800/50 flex items-center justify-between text-xs text-amber-800 dark:text-amber-200 transition-all">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              Miro remembered: <strong className="font-medium">"{newMemoryNotice}"</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenMemory}
              className="underline text-amber-900 dark:text-amber-100 hover:text-amber-700 cursor-pointer"
            >
              Manage
            </button>
            <button
              onClick={onClearMemoryNotice}
              className="text-amber-500 hover:text-amber-700 ml-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Voice Warning Notification */}
      {voiceNotice && (
        <div className="px-4 py-2 bg-stone-100 dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700 flex items-center justify-between text-xs text-stone-700 dark:text-stone-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-stone-500 shrink-0" />
            <span>{voiceNotice}</span>
          </div>
          <button onClick={() => setVoiceNotice(null)} className="text-stone-400 hover:text-stone-600">✕</button>
        </div>
      )}

      {/* Central Conversation Thread */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6 max-w-3xl w-full mx-auto">
        
        {/* Floating Miro Companion Focus at Top */}
        <div className="flex flex-col items-center justify-center pt-2 pb-6 select-none">
          <MiroCompanion
            size="md"
            status={companionStatus}
            interactive={true}
            onClick={() => {
              handleReadAloud("Hey! I'm listening. Tell me whatever's on your mind.");
            }}
          />
          <span className="text-xs text-stone-500 dark:text-stone-400 mt-2 font-medium">
            {isListening
              ? 'Listening carefully...'
              : isThinking
              ? 'Miro is thinking...'
              : isSpeakingAloud
              ? 'Miro is speaking...'
              : 'Miro is here with you'}
          </span>
        </div>

        {/* Welcome Empty State */}
        {messages.length === 0 && (
          <div className="text-center py-6 text-stone-500 dark:text-stone-400 space-y-2 max-w-sm mx-auto">
            <p className="text-base font-medium text-stone-800 dark:text-stone-200">
              "Hey, I'm Miro. What are we talking about?"
            </p>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
              Share your thoughts, ask for advice, or just chat about how your day is going.
            </p>
          </div>
        )}

        {/* Message Items */}
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const isCopied = copiedId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} group`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  isUser
                    ? 'bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 rounded-br-sm shadow-sm'
                    : 'bg-white dark:bg-stone-900/80 text-stone-800 dark:text-stone-200 border border-stone-200/70 dark:border-stone-800 rounded-bl-sm shadow-sm'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>

              {/* Message micro-controls */}
              <div
                className={`flex items-center gap-2 mt-1 px-1 text-[11px] text-stone-400 dark:text-stone-500 ${
                  isUser ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <span>
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>

                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  {/* Copy message */}
                  <button
                    onClick={() => handleCopy(msg.id, msg.content)}
                    title="Copy message"
                    className="p-1 hover:text-stone-700 dark:hover:text-stone-300 rounded cursor-pointer"
                  >
                    {isCopied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  </button>

                  {/* Read Aloud button for assistant */}
                  {!isUser && (
                    <button
                      onClick={() => handleReadAloud(msg.content)}
                      title="Read aloud"
                      className="p-1 hover:text-stone-700 dark:hover:text-stone-300 rounded cursor-pointer"
                    >
                      <Volume2 className="w-3 h-3" />
                    </button>
                  )}

                  {/* Delete individual message */}
                  <button
                    onClick={() => onDeleteMessage(msg.id)}
                    title="Delete message"
                    className="p-1 hover:text-rose-500 rounded cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Thinking Indicator */}
        {isThinking && (
          <div className="flex items-start gap-2">
            <div className="p-3 bg-white dark:bg-stone-900/80 border border-stone-200/70 dark:border-stone-800 rounded-2xl rounded-bl-sm text-xs text-stone-500 dark:text-stone-400 flex items-center gap-2 shadow-sm">
              <span>Miro is thinking</span>
              <span className="flex gap-1 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar Area */}
      <div className="p-3 sm:p-4 bg-[#FAF9F6] dark:bg-[#0C0A09] border-t border-stone-200/60 dark:border-stone-800/60 shrink-0">
        <div className="max-w-3xl mx-auto">
          
          <div className="relative flex items-end gap-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700/80 focus-within:border-stone-500 dark:focus-within:border-stone-500 rounded-2xl p-2 transition-all shadow-sm">
            
            {/* Microphone Button */}
            <button
              onClick={handleToggleMic}
              title={isListening ? 'Stop listening' : 'Talk with microphone'}
              className={`p-2 rounded-xl transition-all cursor-pointer shrink-0 ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
              aria-label={isListening ? 'Stop listening' : 'Start microphone input'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Input Textarea */}
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? 'Listening to your voice...' : 'Message Miro...'}
              className="flex-1 max-h-32 bg-transparent text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none resize-none py-1 px-1 leading-relaxed"
            />

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={!inputText.trim() || isThinking}
              title="Send message"
              className={`p-2 rounded-xl transition-all shrink-0 cursor-pointer ${
                inputText.trim() && !isThinking
                  ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 hover:bg-stone-800'
                  : 'text-stone-300 dark:text-stone-700 cursor-not-allowed'
              }`}
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-stone-400 dark:text-stone-500">
            <span>Enter to send · Shift+Enter for new line</span>
            {messages.length > 0 && !isThinking && (
              <button
                onClick={onRegenerate}
                className="hover:text-stone-700 dark:hover:text-stone-300 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Regenerate response</span>
              </button>
            )}
          </div>

        </div>
      </div>

    </div>
  );
};
