import React from 'react';
import { User } from '../types';
import { Volume2, VolumeX, Sparkles, User as UserIcon, Settings, Brain } from 'lucide-react';

interface NavbarProps {
  currentView: 'landing' | 'chat';
  onNavigate: (view: 'landing' | 'chat') => void;
  user: User | null;
  isGuest: boolean;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  onOpenSettings: () => void;
  onOpenMemory: () => void;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  activePersonality?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  user,
  isGuest,
  voiceEnabled,
  onToggleVoice,
  onOpenSettings,
  onOpenMemory,
  onOpenAuth,
  onOpenProfile,
  activePersonality = 'Friendly',
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAF9F6]/90 dark:bg-[#0C0A09]/90 backdrop-blur-md border-b border-stone-200/70 dark:border-stone-800/70 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2 group text-left cursor-pointer focus:outline-none"
        >
          <span className="text-base sm:text-lg font-semibold tracking-tight text-stone-900 dark:text-stone-100 group-hover:text-stone-600 dark:group-hover:text-stone-300 transition-colors">
            ✦ MIRO CHAT
          </span>
        </button>

        {/* Zone 2: Clean Text Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600 dark:text-stone-400">
          <button
            onClick={() => onNavigate('landing')}
            className={`transition-colors hover:text-stone-900 dark:hover:text-stone-100 ${
              currentView === 'landing' ? 'text-stone-900 dark:text-stone-100 font-semibold' : ''
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => onNavigate('chat')}
            className={`transition-colors hover:text-stone-900 dark:hover:text-stone-100 ${
              currentView === 'chat' ? 'text-stone-900 dark:text-stone-100 font-semibold' : ''
            }`}
          >
            Companion
          </button>
          <button
            onClick={onOpenMemory}
            className="transition-colors hover:text-stone-900 dark:hover:text-stone-100 flex items-center gap-1.5"
          >
            <Brain className="w-3.5 h-3.5 text-stone-500" />
            <span>Memory</span>
          </button>
          <button
            onClick={onOpenSettings}
            className="transition-colors hover:text-stone-900 dark:hover:text-stone-100"
          >
            Personality
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Voice Mute / Unmute Button */}
          <button
            onClick={onToggleVoice}
            title={voiceEnabled ? 'Mute Miro voice' : 'Enable Miro voice'}
            className="p-2 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/50 dark:hover:bg-stone-800/50 rounded-lg transition-colors cursor-pointer"
            aria-label={voiceEnabled ? 'Voice is on' : 'Voice is off'}
          >
            {voiceEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            title="Settings"
            className="p-2 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/50 dark:hover:bg-stone-800/50 rounded-lg transition-colors cursor-pointer"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* User Account / Sign In */}
          {user && !isGuest ? (
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2 py-1.5 px-3 text-xs sm:text-sm font-medium text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800/80 hover:bg-stone-200 dark:hover:bg-stone-700/80 rounded-lg transition-colors cursor-pointer"
            >
              <div className="w-5 h-5 rounded-full bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 flex items-center justify-center text-[11px] font-bold">
                {user.avatar || user.name.charAt(0)}
              </div>
              <span className="hidden sm:inline max-w-[100px] truncate">{user.name}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAuth}
                className="py-1.5 px-3 text-xs sm:text-sm font-medium text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 transition-colors cursor-pointer"
              >
                Sign in
              </button>
              {currentView === 'landing' ? (
                <button
                  onClick={() => onNavigate('chat')}
                  className="py-1.5 px-3.5 text-xs sm:text-sm font-medium text-white bg-stone-900 dark:bg-stone-100 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                >
                  Start chatting →
                </button>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
