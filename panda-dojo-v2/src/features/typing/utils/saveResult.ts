import { KEYS, MAX_HISTORY } from '@/constants';
import { getStorage, setStorage } from '@/services/storage/storageService';
import {
  calculateLevel,
  getProgressionTitle,
} from '@/features/gamification/logic/xpCalculator';
import type { HistoryItem } from '@/features/gamification/types';

interface SaveResultPayload {
  ppm: number;
  cpm: number;
  precision: number;
  errors: number;
  duration: number;
  lessonId: string | null;
  isRecord: boolean;
  topErrors: [string, number][];
  maxCombo: number;
  pauseUsed: boolean;
}

interface SaveResultOutput {
  gainedXp: number;
  xp: number;
  level: number;
  title: string;
}

export function saveSessionResult(payload: SaveResultPayload): SaveResultOutput {
  const { ppm, cpm, precision, errors, duration, lessonId, isRecord, topErrors, maxCombo, pauseUsed } = payload;

  // 1. Save history
  const history = getStorage<HistoryItem[]>(KEYS.historico, []);
  const newEntry: HistoryItem = {
    ppm,
    cpm,
    precisao: `${precision}%`,
    erros: errors,
    tempo: duration,
    lessonId: lessonId ?? undefined,
    novoRecorde: isRecord,
    data: new Date().toLocaleDateString('pt-BR'),
  };
  const updatedHistory = [newEntry, ...history].slice(0, MAX_HISTORY);
  setStorage(KEYS.historico, updatedHistory);

  // 2. Save top errors
  if (topErrors.length > 0) {
    setStorage(KEYS.lastMistakes, topErrors);
  }

  // 3. Compute XP
  const currentXp = Number(getStorage<string>(KEYS.xp, '0')) || 0;
  let gainedXp = 50;
  if (precision >= 95) gainedXp += 60;
  else if (precision >= 90) gainedXp += 30;
  if (isRecord) gainedXp += 80;
  if (!pauseUsed) gainedXp += 20;
  if (maxCombo > 0) gainedXp += 10;

  const xp = currentXp + gainedXp;
  const level = calculateLevel(xp);

  // 4. Unlock achievements
  const achievements = new Set(getStorage<string[]>(KEYS.achievements, []));
  const historyCount = updatedHistory.length;
  if (historyCount >= 1) achievements.add('first-training');
  if (historyCount >= 3) achievements.add('three-trainings');
  if (historyCount >= 7) achievements.add('seven-trainings');
  if (precision >= 90) achievements.add('precision-90');
  if (precision >= 95) achievements.add('precision-95');
  if (isRecord) achievements.add('new-record');
  if (maxCombo >= 24) achievements.add('strong-combo');

  // 5. Daily streak
  const today = new Date().toISOString().slice(0, 10);
  const lastDate = getStorage<string>(KEYS.lastTrainingDate, '');
  if (lastDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yKey = yesterday.toISOString().slice(0, 10);
    const streak = lastDate === yKey ? (Number(getStorage<string>(KEYS.dailyStreak, '0')) || 0) + 1 : 1;
    setStorage(KEYS.dailyStreak, String(streak));
    setStorage(KEYS.lastTrainingDate, today);
    achievements.add('daily-routine');
  }

  // 6. Persist
  setStorage(KEYS.xp, String(xp));
  setStorage(KEYS.level, String(level));
  setStorage(KEYS.achievements, [...achievements]);

  return { gainedXp, xp, level, title: getProgressionTitle(level) };
}

export function getBestPpm(): number {
  const history = getStorage<HistoryItem[]>(KEYS.historico, []);
  return history.reduce((best, item) => Math.max(best, Number(item.ppm) || 0), 0);
}

export function getPrecisionFromResult(precision: number): string {
  return `${precision}%`;
}

export function getResultRecommendation(
  precision: number,
  ppm: number,
  topErrors: [string, number][],
): { text: string; href: string | null; linkText: string | null } {
  if (topErrors.length >= 3 && (topErrors[0]?.[1] ?? 0) >= 4) {
    const keys = topErrors
      .slice(0, 3)
      .map(([c]) => (c === ' ' ? 'Espaço' : c.toUpperCase()))
      .join(', ');
    return {
      text: `Você errou mais nas teclas ${keys}. Reforce essas teclas no Mapa do Dojo.`,
      href: '/mapa',
      linkText: 'Ir para o Mapa',
    };
  }
  if (precision > 0 && precision < 85) {
    return {
      text: 'Precisão abaixo de 85%. Diminua o ritmo e foque em digitar cada letra corretamente.',
      href: '/aprenda',
      linkText: 'Ver dicas de precisão',
    };
  }
  if (precision >= 90 && ppm > 0 && ppm < 35) {
    return {
      text: 'Boa precisão! Agora foque em ritmo — treine reflexo com o Panda Keys.',
      href: '/arcade',
      linkText: 'Abrir Arcade',
    };
  }
  if (precision >= 92 && ppm >= 60) {
    return {
      text: 'Excelente combinação de ritmo e precisão. Tente aumentar a duração do treino.',
      href: null,
      linkText: null,
    };
  }
  return {
    text: 'Continue praticando todo dia — a consistência é o segredo do Dojo.',
    href: null,
    linkText: null,
  };
}
