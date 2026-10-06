import crypto from 'crypto';
import { db, User } from './db.js';

// Secure password hashing using Node crypto PBKDF2
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, originalHash] = storedHash.split(':');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === originalHash;
}

// In-memory token session store for simple, secure token authentication
const sessions = new Map<string, { userId: string; expiresAt: number }>();

export function createSession(userId: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  // 30 day expiration
  sessions.set(token, {
    userId,
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
  });
  return token;
}

export function verifySession(token?: string): User | null {
  if (!token) return null;
  const session = sessions.get(token);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return null;
  }
  return db.getUserById(session.userId) || null;
}

export function destroySession(token: string): void {
  sessions.delete(token);
}
