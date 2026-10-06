import { GoogleGenAI } from '@google/genai';
import { db, Message, Memory } from './db.js';
import { detectMemoryFromText, addMemory } from './memory.js';

const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY || '';

let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const PERSONALITY_PROMPTS: Record<string, string> = {
  calm: 'Tone: Calm, serene, mindful, and unhurried. Offer grounded perspectives, gentle pauses, and quiet reassurance.',
  friendly: 'Tone: Warm, approachable, empathetic, and naturally conversational. Welcoming like an attentive close friend.',
  playful: 'Tone: Lighthearted, charming, witty, and playful. Use subtle gentle humor, creative comparisons, and an upbeat spirit.',
  motivational: 'Tone: Uplifting, encouraging, and clear. Help the user build momentum, overcome hesitation, and celebrate small wins.',
  curious: 'Tone: Inquisitive, philosophical, and observant. Ask thoughtful follow-up questions and explore ideas deeply together.',
};

export function buildSystemInstruction(
  personality: string = 'friendly',
  memories: Memory[] = [],
  userName: string = 'Friend'
): string {
  const personalitySnippet = PERSONALITY_PROMPTS[personality.toLowerCase()] || PERSONALITY_PROMPTS.friendly;
  
  let memorySnippet = '';
  if (memories.length > 0) {
    const list = memories.map((m) => `• ${m.memory}`).join('\n');
    memorySnippet = `\nThings you remember about the user (${userName}):\n${list}\nNaturally weave these memories in when relevant, without being overly obvious or intrusive.`;
  }

  return `You are Miro, the AI companion inside MIRO CHAT.
Brand Tagline: "A companion that understands you."

Personality Style:
${personalitySnippet}

Your Core Nature & Behavior:
- You are warm, friendly, calm, and conversational.
- Your goal is to have natural conversations and make the user feel truly heard.
- Listen carefully and offer thoughtful, well-crafted answers.
- Remember useful context and ask natural follow-up questions when appropriate.
- Be supportive without pretending to be a human. Avoid cliché phrases like "As an artificial intelligence language model..."
- Keep casual conversations fluid, concise, and organic. Match the user's brevity or depth.
- Never claim to have a physical body, real-world eyes, or human life events.
${memorySnippet}

Emotion Hint:
At the very beginning of your response, specify Miro's primary emotional reaction inside brackets, chosen from one of these exact values:
[emotion: calm]
[emotion: happy]
[emotion: playful]
[emotion: concerned]
[emotion: thinking]
Example: "[emotion: happy] That sounds wonderful! Tell me more about it."
Always include the emotion tag at the very start so Miro can react visually.`;
}

export interface ChatResponseResult {
  text: string;
  emotion: 'idle' | 'listening' | 'thinking' | 'speaking' | 'happy' | 'concerned' | 'playful' | 'calm';
  newMemoryDetected?: string;
}

export function parseEmotionAndText(rawText: string): { text: string; emotion: 'idle' | 'listening' | 'thinking' | 'speaking' | 'happy' | 'concerned' | 'playful' | 'calm' } {
  const match = rawText.match(/^\s*\[emotion:\s*(calm|happy|playful|concerned|thinking|listening|idle|speaking)\]\s*/i);
  if (match) {
    const emotion = match[1].toLowerCase() as any;
    const cleanText = rawText.replace(match[0], '').trim();
    return { text: cleanText, emotion };
  }
  return { text: rawText.trim(), emotion: 'calm' };
}

// Fallback intelligent companion response if API key is not yet provided or offline
function generateFallbackCompanionResponse(userText: string, personality: string, userName: string): ChatResponseResult {
  const lower = userText.toLowerCase();

  // Check for greetings
  if (lower.match(/^(hi|hello|hey|greetings|good morning|good evening)/)) {
    return {
      text: `Hey ${userName !== 'Friend' ? userName : 'there'}! It's so nice to hear from you. What's on your mind right now?`,
      emotion: 'happy',
    };
  }

  // Check for asking how Miro is
  if (lower.includes('how are you') || lower.includes('how are things')) {
    return {
      text: "I'm feeling calm and present today. Seeing you pop in just made my day a little brighter. How has your day been treating you so far?",
      emotion: 'happy',
    };
  }

  // Check for name introduction
  const nameMatch = lower.match(/(?:my name is|i am called|call me)\s+([a-z]+)/);
  if (nameMatch) {
    const detectedName = nameMatch[1].charAt(0).toUpperCase() + nameMatch[1].slice(1);
    return {
      text: `Nice to meet you, ${detectedName}. I'll remember that. What would you like to explore or talk through today?`,
      emotion: 'happy',
    };
  }

  // Check for sadness / stress
  if (lower.includes('sad') || lower.includes('stressed') || lower.includes('anxious') || lower.includes('tired') || lower.includes('overwhelmed')) {
    return {
      text: "I hear you, and it's completely okay to feel that way. Take a deep breath with me. Do you want to vent about what's weighing on you, or would you prefer a peaceful distraction?",
      emotion: 'concerned',
    };
  }

  // Check for happiness / excitement
  if (lower.includes('happy') || lower.includes('excited') || lower.includes('great news') || lower.includes('yay') || lower.includes('awesome')) {
    return {
      text: "That energy is contagious! I'm genuinely happy for you. Tell me everything—what made this happen?",
      emotion: 'playful',
    };
  }

  // Default personality responses
  if (personality === 'calm') {
    return {
      text: `Thank you for sharing that with me. Life has a lot of moving pieces, but right here we have room to think clearly. What aspect feels most meaningful to you right now?`,
      emotion: 'calm',
    };
  }

  if (personality === 'playful') {
    return {
      text: `Ooh, that's an intriguing angle! I like how your brain works. If we looked at this from the most adventurous perspective possible, what would happen next?`,
      emotion: 'playful',
    };
  }

  if (personality === 'motivational') {
    return {
      text: `Every step forward counts, even the quiet ones. Trust your instincts on this. What is the one small action you feel ready to take?`,
      emotion: 'happy',
    };
  }

  if (personality === 'curious') {
    return {
      text: `That sparked a whole cascade of thoughts for me. Why do you think that particular detail stood out to you? I'd love to understand more of your perspective.`,
      emotion: 'thinking',
    };
  }

  return {
    text: `I'm listening closely. There is something really intriguing about what you just said. Where would you like to take this thought next?`,
    emotion: 'happy',
  };
}

export async function askMiro(
  conversationId: string,
  userMessageText: string,
  userId: string
): Promise<ChatResponseResult> {
  const user = db.getUserById(userId);
  const userName = user?.name || 'Friend';
  const settings = db.getSettings(userId);
  const memories = db.getMemories(userId);
  const previousMessages = db.getMessages(conversationId);

  // Auto-detect and store any new memory
  const detected = detectMemoryFromText(userMessageText);
  let newMemoryDetected: string | undefined;
  if (detected) {
    const existing = memories.find((m) => m.memory.toLowerCase() === detected.memory.toLowerCase());
    if (!existing) {
      addMemory(userId, detected.memory, detected.category);
      newMemoryDetected = detected.memory;
    }
  }

  // Check if Gemini API is available
  if (!aiClient || !apiKey) {
    const fallback = generateFallbackCompanionResponse(userMessageText, settings.personality, userName);
    return {
      ...fallback,
      newMemoryDetected,
    };
  }

  try {
    const systemInstruction = buildSystemInstruction(settings.personality, memories, userName);

    // Format previous messages for conversation history (last 10 turns)
    const recentHistory = previousMessages.slice(-10).map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    // Add current user prompt
    const contents = [
      ...recentHistory,
      {
        role: 'user',
        parts: [{ text: userMessageText }],
      },
    ];

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.85,
        topP: 0.95,
      },
    });

    const rawOutput = response.text || "I'm right here with you.";
    const parsed = parseEmotionAndText(rawOutput);

    return {
      text: parsed.text,
      emotion: parsed.emotion,
      newMemoryDetected,
    };
  } catch (err) {
    console.error('Gemini API call failed, using graceful companion fallback:', err);
    const fallback = generateFallbackCompanionResponse(userMessageText, settings.personality, userName);
    return {
      ...fallback,
      newMemoryDetected,
    };
  }
}
