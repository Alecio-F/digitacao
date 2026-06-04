import {
  getRecentRandomWords,
  saveRecentRandomWords,
} from '@/repositories/randomWordsRepository';
import { getUniqueWordBank } from '../data/wordBank';

export interface GenerateRandomWordsOptions {
  count: number;
  /** Palavras a evitar, além das recentes salvas localmente. */
  avoidRecent?: string[];
  minLength?: number;
  maxLength?: number;
  includeAccents?: boolean;
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Lê as palavras recentes salvas localmente com fallback seguro. */
export function readRecentRandomWords(): string[] {
  return getRecentRandomWords();
}

/** Normaliza modos antigos para o padrão atual ("randomWords" -> "random-words"). */
export function normalizeTrainingMode(mode: string | null | undefined): string {
  if (mode === 'randomWords') return 'random-words';
  return mode ?? '';
}

/** Quantidade de palavras adequada ao tempo escolhido, gerando com folga. */
export function getRandomWordCountByDuration(durationSeconds: number): number {
  const seconds = Number.isFinite(durationSeconds) ? durationSeconds : 60;
  if (seconds <= 30) return 80;
  if (seconds <= 60) return 150;
  if (seconds <= 120) return 260;
  if (seconds <= 300) return 600;
  if (seconds <= 600) return 1000;
  return 1500;
}

/**
 * Gera uma sequência de palavras aleatórias.
 * - evita repetir dentro da mesma rodada até esgotar o banco disponível;
 * - evita palavras usadas em rodadas recentes;
 * - se o banco for menor que `count`, embaralha de novo e só então repete;
 * - nunca coloca a mesma palavra duas vezes seguidas;
 * - nunca retorna lista vazia.
 */
export function generateRandomWords(options: GenerateRandomWordsOptions): string[] {
  const {
    count,
    avoidRecent,
    minLength = 1,
    maxLength = Infinity,
    includeAccents = false,
  } = options;

  const safeCount = Math.max(1, Math.floor(count) || 1);

  let bank = getUniqueWordBank(includeAccents).filter(
    (word) => word.length >= minLength && word.length <= maxLength,
  );
  if (bank.length === 0) bank = getUniqueWordBank(true);
  if (bank.length === 0) return Array.from({ length: safeCount }, () => 'panda');

  const recent = new Set([...(avoidRecent ?? readRecentRandomWords())]);

  let preferred = bank.filter((word) => !recent.has(word));
  if (preferred.length < Math.min(safeCount, Math.ceil(bank.length * 0.25))) {
    preferred = [...bank];
  }

  const result: string[] = [];
  let pool = shuffle(preferred);
  let poolIndex = 0;

  while (result.length < safeCount) {
    if (poolIndex >= pool.length) {
      pool = shuffle(bank);
      poolIndex = 0;
    }
    const candidate = pool[poolIndex];
    poolIndex += 1;
    if (result.length > 0 && result[result.length - 1] === candidate) continue;
    result.push(candidate);
  }

  const updatedRecent = Array.from(new Set([...result, ...recent]));
  saveRecentRandomWords(updatedRecent);

  return result;
}
