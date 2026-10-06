# MIRO CHAT ✦ A companion that understands you

> **“Talk. Think. Connect.”**

MIRO CHAT is a premium, minimal, modern AI companion web application. Inspired by the quiet simplicity of Apple interfaces and charming digital companions, MIRO CHAT puts the animated character **Miro** front and center. Miro reacts visually, speaks naturally, listens via speech recognition, remembers your personal context across conversations, and adapts to five distinct personalities.

---

## Table of Contents

1. [Features](#features)
2. [Project Architecture](#project-architecture)
3. [Prerequisites & Installation](#prerequisites--installation)
4. [Environment Variables](#environment-variables)
5. [Running Locally](#running-locally)
6. [Database Setup & Persistence](#database-setup--persistence)
7. [AI API Setup (Gemini 3.8 Flash)](#ai-api-setup-gemini-38-flash)
8. [Authentication System](#authentication-system)
9. [Voice & Speech (TTS / STT)](#voice--speech-tts--stt)
10. [Customizing Miro's Personality & System Instructions](#customizing-miros-personality--system-instructions)
11. [Replacing or Customizing Miro Character Assets](#replacing-or-customizing-miro-character-assets)
12. [Deployment](#deployment)

---

## 1. Features

- **Expressive Companion Character**: Miro blinks, breathes, tracks mouse movement with pupils, perks up when listening, gazes up when thinking, and smiles when hearing positive remarks.
- **Natural Conversation**: Powered by Gemini 3.8 Flash with companion-specific system prompts that eliminate canned robotic answers.
- **Continuous Memory**: Miro detects facts (e.g., your name, passions, goals) during organic conversation and retains them in a user-manageable memory bank.
- **Adaptive Demeanor**: Switch between **Calm**, **Friendly**, **Playful**, **Motivational**, and **Curious** personality modes.
- **Voice Input & Text-to-Speech**: Speak aloud using the browser Speech Recognition API and hear Miro read replies aloud with synchronized mouth animations.
- **Zero-Friction Authentication**: Immediate Guest session support plus complete email/password registration with secure PBKDF2 hashing.
- **Minimal Apple-Inspired Design**: Large whitespace, hairline borders, soft shadows, balanced typography, and dark/light/system theme support.

---

## 2. Project Architecture

```text
miro-chat/
├── server/
│   ├── db.ts               # Persistent JSON storage (users, conversations, messages, memories)
│   ├── auth.ts             # Password hashing (crypto PBKDF2) & session token manager
│   ├── memory.ts           # Automatic memory heuristic detection & CRUD endpoints
│   └── ai.ts               # Gemini 3.8 Flash client, system prompts & emotional parsing
│
├── src/
│   ├── assets/             # Character illustrations and photography
│   ├── components/
│   │   ├── MiroCompanion.tsx  # Expressive vector cartoon companion (SVG + state animations)
│   │   ├── Navbar.tsx         # 3-zone minimal navigation bar
│   │   ├── LandingPage.tsx    # Hero section, feature cards, emotion preview, footer
│   │   ├── ChatView.tsx       # Message thread, mic input, text-to-speech, action controls
│   │   ├── Sidebar.tsx        # Chat history grouped by Today/Yesterday, search, rename
│   │   ├── MemoryModal.tsx    # Memory management interface (view, add, edit, delete)
│   │   ├── SettingsModal.tsx  # Personality, voice, theme, and privacy settings
│   │   ├── AuthModal.tsx      # Sign in, Sign up, and Guest continue
│   │   └── ProfileModal.tsx   # User profile, statistics, and logout
│   │
│   ├── services/
│   │   ├── api.ts             # Typed REST API client with Bearer auth
│   │   └── speech.ts          # Web Speech API recognition & speech synthesis
│   │
│   ├── types.ts            # TypeScript interfaces
│   ├── App.tsx             # Root router and state coordinator
│   ├── index.css           # Tailwind CSS configuration & Miro keyframes
│   └── main.tsx            # React root mount
│
├── server.ts               # Express server mounting Vite middlewares in dev
├── vite.config.ts          # Vite bundler configuration
├── package.json            # Scripts and dependencies
└── README.md
```

---

## 3. Prerequisites & Installation

- **Node.js**: v18.0.0 or higher
- **npm** or **pnpm**

Install dependencies:

```bash
npm install
```

---

## 4. Environment Variables

Create or configure `.env` in the root directory:

```env
# GEMINI_API_KEY: Google Gemini API key
GEMINI_API_KEY="your-gemini-api-key-here"

# PORT: Server port (defaults to 3000)
PORT=3000

# NODE_ENV: 'development' or 'production'
NODE_ENV="development"
```

*Note: The frontend never accesses `GEMINI_API_KEY`. All Gemini SDK calls run securely inside `server/ai.ts`.*

---

## 5. Running Locally

Start the full-stack development server:

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 6. Database Setup & Persistence

The application uses a persistent file-backed JSON store in `./data/db.json`:

- **Users**: Unique ID, email, name, avatar, salt + PBKDF2 password hash.
- **Conversations**: ID, user ID, title, active personality, timestamps.
- **Messages**: ID, conversation ID, role (`user` | `assistant`), content, emotion tag.
- **Memories**: ID, user ID, category (`personal` | `preference` | `goal`), memory text.
- **Settings**: Voice speed, pitch, enabled state, selected personality, theme.

The data file and folder are automatically initialized on server startup. To reset your local database, simply delete `./data/db.json`.

---

## 7. AI API Setup (Gemini 3.8 Flash)

Calls are handled in `server/ai.ts` using the official `@google/genai` TypeScript SDK:

```typescript
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});
```

Model: `'gemini-3.8-flash'` with custom system instructions that inject the user's saved memories and return an `[emotion: <state>]` tag to animate Miro's face.

If no API key is set, the server seamlessly provides thoughtful companion fallback responses so the application remains 100% interactive during development.

---

## 8. Authentication System

1. **Guest Mode**: Automatically assigns a guest friend profile (`guest_user`) so visitors can immediately chat without barrier.
2. **User Registration & Login**: Creates a permanent user with password salt + SHA-512 PBKDF2 hashing (`server/auth.ts`).
3. **Session Management**: Issues a secure random token stored in `localStorage` and passed via standard `Authorization: Bearer <token>` headers.

---

## 9. Voice & Speech (TTS / STT)

- **Speech-to-Text**: Built on the native browser `SpeechRecognition` / `webkitSpeechRecognition` API. Click the microphone icon to transcribe speech directly into the input bar.
- **Text-to-Speech**: Built on the native `window.speechSynthesis` API. Miro speaks replies with adjustable rate (0.75x–1.4x), pitch, and customizable voices in the Settings modal. Miro's mouth animates rhythmically during speech playback.

---

## 10. Customizing Miro's Personality & System Instructions

Miro's prompts are defined in `server/ai.ts`:

- `calm`: Mindful, grounded, tranquil, gentle pauses.
- `friendly`: Open, cheerful, empathetic, supportive.
- `playful`: Witty, creative, lighthearted humor.
- `motivational`: Encouraging, momentum-building, celebrating small wins.
- `curious`: Inquisitive, philosophical, deep questions.

You can modify these or add new modes by updating `PERSONALITY_PROMPTS` in `server/ai.ts` and `src/components/SettingsModal.tsx`.

---

## 11. Replacing or Customizing Miro Character Assets

The character is implemented in `src/components/MiroCompanion.tsx`.

### Vector SVG Structure:
- **Body & Gradient**: `<linearGradient id="miroBodyGrad">` controls the porcelain skin tone.
- **Eyes**: Responsive SVG ellipses that calculate cursor offset and morph into happy crescents (`^ ^`) or blink lines.
- **Mouth**: Dynamic SVG path that transitions between smiling, talking (`animate-mouth-speak`), and thinking.
- **Antenna**: Gentle bobbing halo with glowing tip.

To replace with your own 3D renders or illustrations:
1. Place your PNG/SVG/WebP images in `src/assets/miro/`.
2. Update `src/components/MiroCompanion.tsx` to display your image assets based on the `status` prop (`idle`, `listening`, `thinking`, `speaking`, `happy`, `concerned`).

---

## 12. Deployment

Build the client bundle:

```bash
npm run build
```

Run in production:

```bash
npm run start
```

Express serves the optimized static assets in `/dist` while handling all `/api/*` endpoints.
