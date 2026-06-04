import { persistence } from '@/services/persistence/types';
import { PERSISTENCE_KEYS } from '@/services/persistence/persistenceKeys';

const RECENT_LIMIT = 220;

export function getRecentRandomWords(): string[] {
  const stored = persistence.getItem<string[]>(PERSISTENCE_KEYS.recentRandomWords, []);
  return Array.isArray(stored) ? stored.filter((word) => typeof word === 'string') : [];
}

export function saveRecentRandomWords(words: string[]): void {
  const safeWords = words.filter((word) => typeof word === 'string');
  persistence.setItem(PERSISTENCE_KEYS.recentRandomWords, safeWords.slice(0, RECENT_LIMIT));
}

export function clearRecentRandomWords(): void {
  persistence.removeItem(PERSISTENCE_KEYS.recentRandomWords);
}
