import React, { useState, useEffect } from 'react';
import { UserSettings } from '../types';
import { speech } from '../services/speech';
import { Settings, Volume2, Sparkles, Sun, Moon, Monitor, X, Trash2, Check } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onUpdateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  onClearAllChats: () => Promise<void>;
  onClearAllMemories: () => Promise<void>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onClearAllChats,
  onClearAllMemories,
}) => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        const v = window.speechSynthesis.getVoices();
        setVoices(v.filter((voice) => voice.lang.startsWith('en')));
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  if (!isOpen) return null;

  const handlePersonalityChange = async (personality: UserSettings['personality']) => {
    await onUpdateSettings({ personality });
    showSaved();
  };

  const handleThemeChange = async (theme: 'light' | 'dark' | 'system') => {
    await onUpdateSettings({ theme });
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
    showSaved();
  };

  const showSaved = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const personalities: { id: UserSettings['personality']; title: string; desc: string }[] = [
    { id: 'calm', title: 'Calm', desc: 'Mindful, serene, grounded, and unhurried.' },
    { id: 'friendly', title: 'Friendly', desc: 'Warm, open, attentive, and welcoming.' },
    { id: 'playful', title: 'Playful', desc: 'Lighthearted, witty, curious, and cheerful.' },
    { id: 'motivational', title: 'Motivational', desc: 'Uplifting, empowering, and action-oriented.' },
    { id: 'curious', title: 'Curious', desc: 'Inquisitive, philosophical, asks engaging questions.' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#FAF9F6] dark:bg-[#141210] border border-stone-200 dark:border-stone-800 rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-200/70 dark:border-stone-800/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-800 dark:text-stone-200">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100">
                Companion Settings
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Customize Miro's demeanor, voice, and appearance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-6 overflow-y-auto space-y-7 flex-1">
          
          {/* 1. Miro Personality */}
          <div>
            <label className="text-xs font-semibold text-stone-900 dark:text-stone-100 uppercase tracking-wider block mb-3">
              Miro's Personality
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {personalities.map((p) => {
                const isSelected = settings.personality === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handlePersonalityChange(p.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-stone-900 dark:border-stone-100 bg-white dark:bg-stone-800 shadow-sm'
                        : 'border-stone-200 dark:border-stone-800/80 hover:border-stone-300 dark:hover:border-stone-700 bg-stone-50/50 dark:bg-stone-900/40'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                        {p.title}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-stone-900 dark:text-stone-100" />}
                    </div>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-normal">
                      {p.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Appearance */}
          <div>
            <label className="text-xs font-semibold text-stone-900 dark:text-stone-100 uppercase tracking-wider block mb-3">
              Appearance
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleThemeChange('light')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                  settings.theme === 'light'
                    ? 'border-stone-900 dark:border-stone-100 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100'
                    : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Light</span>
              </button>
              <button
                onClick={() => handleThemeChange('dark')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                  settings.theme === 'dark'
                    ? 'border-stone-900 dark:border-stone-100 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100'
                    : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Dark</span>
              </button>
              <button
                onClick={() => handleThemeChange('system')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                  settings.theme === 'system'
                    ? 'border-stone-900 dark:border-stone-100 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100'
                    : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>System</span>
              </button>
            </div>
          </div>

          {/* 3. Voice Settings */}
          <div className="space-y-4">
            <label className="text-xs font-semibold text-stone-900 dark:text-stone-100 uppercase tracking-wider block">
              Voice & Sound
            </label>

            {/* Voice toggle */}
            <div className="flex items-center justify-between p-3.5 bg-white dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 rounded-2xl">
              <div>
                <span className="text-xs font-medium text-stone-900 dark:text-stone-100 block">
                  Voice Replies
                </span>
                <span className="text-[11px] text-stone-500">
                  Allow Miro to speak responses aloud
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.voiceEnabled}
                onChange={async (e) => {
                  await onUpdateSettings({ voiceEnabled: e.target.checked });
                  showSaved();
                }}
                className="w-4 h-4 rounded text-stone-900 focus:ring-stone-500 cursor-pointer"
              />
            </div>

            {/* Speech rate slider */}
            <div className="p-3.5 bg-white dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 rounded-2xl space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-stone-700 dark:text-stone-300">Speaking Pace</span>
                <span className="text-stone-500 font-mono">{settings.voiceRate.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.75"
                max="1.4"
                step="0.05"
                value={settings.voiceRate}
                onChange={async (e) => {
                  await onUpdateSettings({ voiceRate: parseFloat(e.target.value) });
                }}
                className="w-full accent-stone-900 dark:accent-stone-100 cursor-pointer"
              />
            </div>

            {/* Voice Selection */}
            {voices.length > 0 && (
              <div className="p-3.5 bg-white dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 rounded-2xl space-y-1.5">
                <label className="text-xs text-stone-700 dark:text-stone-300 block">
                  Companion Voice
                </label>
                <select
                  value={settings.voiceName}
                  onChange={async (e) => {
                    await onUpdateSettings({ voiceName: e.target.value });
                    showSaved();
                  }}
                  className="w-full px-2.5 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-800 dark:text-stone-200 focus:outline-none"
                >
                  <option value="">Default Friendly Voice</option>
                  {voices.map((v) => (
                    <option key={v.name} value={v.name}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* 4. Privacy & Data */}
          <div>
            <label className="text-xs font-semibold text-stone-900 dark:text-stone-100 uppercase tracking-wider block mb-3">
              Privacy & Storage
            </label>
            <div className="space-y-2">
              <button
                onClick={async () => {
                  if (confirm('Are you sure you want to delete all conversations?')) {
                    await onClearAllChats();
                    showSaved();
                  }
                }}
                className="w-full p-3 bg-white dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 hover:border-rose-300 rounded-2xl text-xs text-stone-700 dark:text-stone-300 hover:text-rose-600 flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>Delete conversation history</span>
                <Trash2 className="w-3.5 h-3.5 text-stone-400" />
              </button>

              <button
                onClick={async () => {
                  if (confirm('Clear all memories Miro has learned?')) {
                    await onClearAllMemories();
                    showSaved();
                  }
                }}
                className="w-full p-3 bg-white dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 hover:border-rose-300 rounded-2xl text-xs text-stone-700 dark:text-stone-300 hover:text-rose-600 flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>Clear all stored memories</span>
                <Trash2 className="w-3.5 h-3.5 text-stone-400" />
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-stone-100/60 dark:bg-stone-900/40 border-t border-stone-200/60 dark:border-stone-800/60 flex items-center justify-between">
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            {savedSuccess ? '✓ Settings updated' : ''}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-medium text-stone-800 dark:text-stone-200 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl hover:bg-stone-50 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
