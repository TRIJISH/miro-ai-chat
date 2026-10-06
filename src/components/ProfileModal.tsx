import React from 'react';
import { User } from '../types';
import { X, Brain, MessageSquare, LogOut, Shield } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  memoryCount: number;
  conversationCount: number;
  onLogout: () => Promise<void>;
  onOpenMemory: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  memoryCount,
  conversationCount,
  onLogout,
  onOpenMemory,
}) => {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-[#FAF9F6] dark:bg-[#141210] border border-stone-200 dark:border-stone-800 rounded-3xl shadow-xl overflow-hidden p-6 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg"
        >
          <X className="w-4 h-4" />
        </button>

        {/* User Card */}
        <div className="flex flex-col items-center text-center mt-2 mb-6">
          <div className="w-16 h-16 rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 flex items-center justify-center text-2xl font-bold mb-3 shadow-sm">
            {user.avatar || user.name.charAt(0)}
          </div>
          <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100">
            {user.name}
          </h2>
          <p className="text-xs text-stone-500">{user.email}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2.5 mb-6">
          <button
            onClick={() => {
              onClose();
              onOpenMemory();
            }}
            className="p-3 bg-white dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 rounded-2xl text-left hover:border-stone-300 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-1.5 text-stone-500 mb-1">
              <Brain className="w-3.5 h-3.5" />
              <span className="text-[11px]">Memories</span>
            </div>
            <span className="text-lg font-semibold text-stone-900 dark:text-stone-100">
              {memoryCount}
            </span>
          </button>

          <div className="p-3 bg-white dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 rounded-2xl text-left">
            <div className="flex items-center gap-1.5 text-stone-500 mb-1">
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="text-[11px]">Chats</span>
            </div>
            <span className="text-lg font-semibold text-stone-900 dark:text-stone-100">
              {conversationCount}
            </span>
          </div>
        </div>

        {/* Miro Connection Status */}
        <div className="p-3 bg-stone-100 dark:bg-stone-900/40 rounded-2xl mb-6 text-xs text-stone-600 dark:text-stone-400 flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Your conversations and personal memories are securely stored.</span>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={async () => {
            await onLogout();
            onClose();
          }}
          className="w-full py-2.5 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/50 rounded-xl text-xs font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign out</span>
        </button>

      </div>
    </div>
  );
};
