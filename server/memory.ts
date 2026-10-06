import { db, Memory } from './db.js';

export function getMemories(userId: string): Memory[] {
  return db.getMemories(userId);
}

export function addMemory(userId: string, memoryText: string, category: string = 'general'): Memory {
  const newMem: Memory = {
    id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    userId,
    category,
    memory: memoryText.trim(),
    createdAt: new Date().toISOString(),
  };
  return db.saveMemory(newMem);
}

export function updateMemory(id: string, memoryText: string): Memory | null {
  const all = db.getMemories('');
  const existing = all.find((m) => m.id === id);
  if (!existing) return null;
  existing.memory = memoryText.trim();
  return db.saveMemory(existing);
}

export function deleteMemory(id: string): void {
  db.deleteMemory(id);
}

export function clearAllMemories(userId: string): void {
  db.clearMemories(userId);
}

// Heuristic pattern extraction for immediate memory detection
export function detectMemoryFromText(text: string): { memory: string; category: string } | null {
  const trimmed = text.trim();
  
  // "My name is [Name]" or "I'm [Name]"
  const nameMatch = trimmed.match(/(?:my name is|i am called|call me)\s+([A-Z][a-z]+)/i);
  if (nameMatch && nameMatch[1]) {
    return {
      memory: `Name is ${nameMatch[1]}`,
      category: 'personal',
    };
  }

  // "I love / I like / I enjoy [thing]"
  const prefMatch = trimmed.match(/i\s+(?:really\s+)?(?:love|like|enjoy|prefer)\s+([^.!?]+)/i);
  if (prefMatch && prefMatch[1] && prefMatch[1].length < 60) {
    const item = prefMatch[1].trim();
    if (!item.startsWith('you') && !item.startsWith('this')) {
      return {
        memory: `Enjoys ${item}`,
        category: 'preference',
      };
    }
  }

  // "I work as / I am a [profession]"
  const jobMatch = trimmed.match(/i\s+(?:work as|am an?)\s+([a-zA-Z\s]{3,30})(?:\s+at|\s+in|\.|$)/i);
  if (jobMatch && jobMatch[1]) {
    const job = jobMatch[1].trim();
    if (!['student', 'person', 'human', 'bot', 'user'].includes(job.toLowerCase())) {
      return {
        memory: `Works as / role: ${job}`,
        category: 'personal',
      };
    }
  }

  // "I live in / I'm from [city/place]"
  const locationMatch = trimmed.match(/i\s+(?:live in|am from|grew up in)\s+([A-Z][a-zA-Z\s,]{2,30})/);
  if (locationMatch && locationMatch[1]) {
    return {
      memory: `Location / hometown: ${locationMatch[1].trim()}`,
      category: 'personal',
    };
  }

  // "I'm trying to / my goal is [goal]"
  const goalMatch = trimmed.match(/(?:my goal is to|i'm trying to|i want to learn)\s+([^.!?]+)/i);
  if (goalMatch && goalMatch[1] && goalMatch[1].length < 60) {
    return {
      memory: `Goal: ${goalMatch[1].trim()}`,
      category: 'goal',
    };
  }

  return null;
}
