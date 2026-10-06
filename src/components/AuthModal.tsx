import React, { useState } from 'react';
import { User } from '../types';
import { X, Lock, Mail, User as UserIcon, ArrowRight, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, pass: string) => Promise<void>;
  onRegister: (name: string, email: string, pass: string) => Promise<void>;
  onGuestLogin: () => Promise<void>;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  onRegister,
  onGuestLogin,
}) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (tab === 'login') {
        await onLogin(email, password);
      } else {
        if (!name.trim()) throw new Error('Please enter your name');
        await onRegister(name.trim(), email, password);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    setError(null);
    setLoading(true);
    try {
      await onGuestLogin();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Could not continue as guest');
    } finally {
      setLoading(false);
    }
  };

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

        {/* Title */}
        <div className="text-center mb-6">
          <span className="text-sm font-semibold tracking-tight text-stone-900 dark:text-stone-100">
            ✦ MIRO CHAT
          </span>
          <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mt-1">
            {tab === 'login' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Sync memories and conversations across sessions
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex p-1 bg-stone-200/60 dark:bg-stone-800/80 rounded-xl mb-5">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              tab === 'login'
                ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                : 'text-stone-500 dark:text-stone-400'
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              tab === 'register'
                ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                : 'text-stone-500 dark:text-stone-400'
            }`}
          >
            Sign up
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl text-xs text-rose-600 dark:text-rose-400">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {tab === 'register' && (
            <div>
              <label className="text-[11px] font-medium text-stone-600 dark:text-stone-400 block mb-1">
                Your Name
              </label>
              <div className="relative flex items-center">
                <UserIcon className="w-3.5 h-3.5 absolute left-3 text-stone-400" />
                <input
                  type="text"
                  placeholder="Alex"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:border-stone-400"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-[11px] font-medium text-stone-600 dark:text-stone-400 block mb-1">
              Email
            </label>
            <div className="relative flex items-center">
              <Mail className="w-3.5 h-3.5 absolute left-3 text-stone-400" />
              <input
                type="email"
                placeholder="alex@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:border-stone-400"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium text-stone-600 dark:text-stone-400 block mb-1">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="w-3.5 h-3.5 absolute left-3 text-stone-400" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:border-stone-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 rounded-xl text-xs font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <span>Please wait...</span>
            ) : (
              <>
                <span>{tab === 'login' ? 'Sign in' : 'Create Account'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="relative my-4 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-stone-200 dark:border-stone-800" />
          </div>
          <span className="relative px-2 bg-[#FAF9F6] dark:bg-[#141210] text-[10px] text-stone-400 uppercase tracking-widest">
            or
          </span>
        </div>

        {/* Continue as Guest */}
        <button
          type="button"
          onClick={handleGuest}
          disabled={loading}
          className="w-full py-2 bg-stone-100 dark:bg-stone-800/80 hover:bg-stone-200/70 dark:hover:bg-stone-700/80 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-medium transition-colors cursor-pointer"
        >
          Continue as Guest
        </button>

      </div>
    </div>
  );
};
