import React, { useState } from 'react';
import { MiroCompanion } from './MiroCompanion';
import { EmotionType } from '../types';
import { Sparkles, MessageSquare, Brain, Mic, Heart, Smile, ArrowRight, ShieldCheck } from 'lucide-react';

interface LandingPageProps {
  onStartChat: () => void;
  onOpenMemory: () => void;
  onOpenSettings: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartChat,
  onOpenMemory,
  onOpenSettings,
}) => {
  const [demoEmotion, setDemoEmotion] = useState<EmotionType>('happy');
  const [demoQuote, setDemoQuote] = useState<string>("Hey, I'm Miro. I'm here whenever you want to talk.");

  const handleMoodSelect = (mood: EmotionType, quote: string) => {
    setDemoEmotion(mood);
    setDemoQuote(quote);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] dark:bg-[#0C0A09] text-stone-900 dark:text-stone-100 transition-colors">
      
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 px-4 sm:px-6 overflow-hidden">
        {/* Very subtle ambient gradient glow behind hero */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-stone-200/50 dark:bg-stone-900/40 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          
          {/* Main Visual Focus: Interactive Miro Character */}
          <div className="relative mb-6 group">
            <MiroCompanion
              size="hero"
              status={demoEmotion}
              interactive={true}
              onClick={() => {
                setDemoEmotion('happy');
                setDemoQuote("I'm always glad when you say hello!");
              }}
            />
            {/* Interactive speech thought pill */}
            <div className="mt-3 px-4 py-2 bg-white/90 dark:bg-stone-900/90 border border-stone-200/80 dark:border-stone-800 rounded-2xl shadow-sm text-sm text-stone-700 dark:text-stone-300 max-w-xs sm:max-w-md mx-auto transition-all">
              <span className="italic">"{demoQuote}"</span>
            </div>
          </div>

          {/* Emotional Headline */}
          <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight text-stone-900 dark:text-stone-100 mb-4 max-w-2xl text-balance">
            Meet Miro.
            <span className="block text-2xl sm:text-4xl font-normal text-stone-500 dark:text-stone-400 mt-2">
              A companion that understands you.
            </span>
          </h1>

          {/* Subtitle / Supporting Text */}
          <p className="text-base sm:text-lg text-stone-600 dark:text-stone-400 max-w-xl mb-3 leading-relaxed text-balance">
            Talk naturally, share your thoughts, and have conversations that feel personal.
          </p>

          <p className="text-xs sm:text-sm font-medium tracking-widest uppercase text-stone-400 dark:text-stone-500 mb-8">
            Talk. Think. Connect.
          </p>

          {/* Primary CTA */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onStartChat}
              className="w-full sm:w-auto px-7 py-3.5 text-sm font-medium text-white bg-stone-900 dark:bg-stone-100 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Start chatting</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={onOpenMemory}
              className="w-full sm:w-auto px-6 py-3.5 text-sm font-medium text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-900 hover:bg-stone-200/70 dark:hover:bg-stone-800 border border-stone-200/60 dark:border-stone-800 rounded-xl transition-all cursor-pointer"
            >
              How Miro remembers
            </button>
          </div>

          {/* Quick Emotion Switcher Preview */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-2 text-xs text-stone-500 dark:text-stone-400">
            <span className="mr-1">Tap an expression:</span>
            <button
              onClick={() => handleMoodSelect('calm', "Take your time. There's no rush here.")}
              className={`px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                demoEmotion === 'calm'
                  ? 'border-stone-900 dark:border-stone-100 text-stone-900 dark:text-stone-100 bg-stone-100 dark:bg-stone-800'
                  : 'border-stone-200 dark:border-stone-800 hover:border-stone-400'
              }`}
            >
              Calm
            </button>
            <button
              onClick={() => handleMoodSelect('happy', "It's so wonderful to connect with you today!")}
              className={`px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                demoEmotion === 'happy'
                  ? 'border-stone-900 dark:border-stone-100 text-stone-900 dark:text-stone-100 bg-stone-100 dark:bg-stone-800'
                  : 'border-stone-200 dark:border-stone-800 hover:border-stone-400'
              }`}
            >
              Friendly
            </button>
            <button
              onClick={() => handleMoodSelect('playful', "Let's see what interesting idea we can uncover next!")}
              className={`px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                demoEmotion === 'playful'
                  ? 'border-stone-900 dark:border-stone-100 text-stone-900 dark:text-stone-100 bg-stone-100 dark:bg-stone-800'
                  : 'border-stone-200 dark:border-stone-800 hover:border-stone-400'
              }`}
            >
              Playful
            </button>
            <button
              onClick={() => handleMoodSelect('thinking', "Hmm, that gives me a whole new way of looking at it...")}
              className={`px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                demoEmotion === 'thinking'
                  ? 'border-stone-900 dark:border-stone-100 text-stone-900 dark:text-stone-100 bg-stone-100 dark:bg-stone-800'
                  : 'border-stone-200 dark:border-stone-800 hover:border-stone-400'
              }`}
            >
              Curious
            </button>
          </div>
        </div>
      </section>

      {/* CORE FEATURES SECTION */}
      <section className="py-20 px-4 sm:px-6 border-t border-stone-200/60 dark:border-stone-800/60">
        <div className="max-w-5xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900 dark:text-stone-100 mb-3">
              More than a chatbot.
            </h2>
            <p className="text-base text-stone-600 dark:text-stone-400 leading-relaxed">
              Miro remembers context, responds naturally, and stays with you through every conversation.
            </p>
          </div>

          {/* Minimal 5-Capability Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div className="p-6 bg-white dark:bg-stone-900/60 border border-stone-200/70 dark:border-stone-800 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-800 dark:text-stone-200 mb-4">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-2">
                  Natural Conversation
                </h3>
                <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                  Talk naturally without rigid command words. Miro listens carefully, asks perceptive questions, and avoids repetitive robotic phrasing.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="p-6 bg-white dark:bg-stone-900/60 border border-stone-200/70 dark:border-stone-800 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-800 dark:text-stone-200 mb-4">
                  <Brain className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-2">
                  Continuous Memory
                </h3>
                <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                  Miro remembers useful context across visits—like your name, goals, and passions. You stay in control with full permission to view, edit, or delete any memory.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="p-6 bg-white dark:bg-stone-900/60 border border-stone-200/70 dark:border-stone-800 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-800 dark:text-stone-200 mb-4">
                  <Mic className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-2">
                  Voice & Speech
                </h3>
                <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                  Speak aloud using your device's microphone and hear Miro read responses back with smooth speech pacing and synced mouth movements.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="p-6 bg-white dark:bg-stone-900/60 border border-stone-200/70 dark:border-stone-800 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-800 dark:text-stone-200 mb-4">
                  <Smile className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-2">
                  Adaptive Personality
                </h3>
                <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                  Tune Miro’s demeanor to fit your mood: choose between Calm, Friendly, Playful, Motivational, or Curious companions.
                </p>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="p-6 bg-white dark:bg-stone-900/60 border border-stone-200/70 dark:border-stone-800 rounded-2xl flex flex-col justify-between md:col-span-2 lg:col-span-2">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="shrink-0">
                  <MiroCompanion size="sm" status="happy" interactive={false} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-2">
                    Visual Companion Reactions
                  </h3>
                  <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                    Miro blinks, breathes, tracks your cursor, ponders while thinking, and smiles when hearing positive thoughts. An expressive friend that makes every conversation feel warm and present.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Illustrated Banner Card */}
          <div className="mt-10 p-6 sm:p-10 rounded-3xl bg-stone-100/70 dark:bg-stone-900/40 border border-stone-200/80 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="max-w-md">
              <h3 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-2">
                A calm space for your thoughts
              </h3>
              <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed mb-4">
                No loud notifications, no endless dashboards, no advertisements. Just a quiet sanctuary to talk through ideas, untangle feelings, and reflect.
              </p>
              <button
                onClick={onStartChat}
                className="inline-flex items-center gap-2 text-sm font-semibold text-stone-900 dark:text-stone-100 hover:text-stone-600 dark:hover:text-stone-300 transition-colors cursor-pointer"
              >
                Open Miro Chat now <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="w-full sm:w-64 h-44 rounded-2xl overflow-hidden border border-stone-200/60 dark:border-stone-800/80 shrink-0">
              <img
                src="/src/assets/images/miro_features_banner_1791308352272.jpg"
                alt="Miro calm atmosphere"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

        </div>
      </section>

      {/* QUIET FOOTER (Requirement #30) */}
      <footer className="mt-auto py-12 px-4 sm:px-6 border-t border-stone-200/60 dark:border-stone-800/60 text-xs text-stone-500 dark:text-stone-500">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            <p className="font-semibold text-stone-900 dark:text-stone-100 text-sm mb-1">
              ✦ MIRO CHAT
            </p>
            <p className="text-stone-500 dark:text-stone-400">
              A companion that understands you.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => alert("Privacy Notice: Miro Chat does not sell or share conversation data. All memories are stored securely in your private session and can be deleted at any time.")} className="hover:text-stone-900 dark:hover:text-stone-200 transition-colors cursor-pointer">
              Privacy
            </button>
            <button onClick={() => alert("Terms: Miro Chat is a virtual AI companion. Designed for reflection, casual conversation, and personal organization.")} className="hover:text-stone-900 dark:hover:text-stone-200 transition-colors cursor-pointer">
              Terms
            </button>
            <button onClick={() => alert("Contact: For inquiries, reach out at hello@miro.chat")} className="hover:text-stone-900 dark:hover:text-stone-200 transition-colors cursor-pointer">
              Contact
            </button>
          </div>

          <p className="text-center sm:text-right">
            © 2026 Miro Chat
          </p>
        </div>
      </footer>

    </div>
  );
};
