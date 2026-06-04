import type { RankingInvalidReason, SuspiciousFlags } from '@/features/typing/types';
import type { DailyChallengeResult } from '../types';
import { getMasterPandaShareMessage } from './masterPandaMessages';

export type DailyMedal = 'Ouro' | 'Prata' | 'Bronze' | null;

const FALLBACK_URL = 'https://pandadigitacoes.vercel.app';

export function getDailyMedal(accuracy: number, ppm: number): DailyMedal {
  if (accuracy >= 97 && ppm >= 50) return 'Ouro';
  if (accuracy >= 95 && ppm >= 30) return 'Prata';
  if (accuracy >= 85) return 'Bronze';
  return null;
}

function safeNumber(value: unknown): number {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? Math.max(0, numberValue) : 0;
}

function formatMetric(value: unknown): number {
  return Math.round(safeNumber(value));
}

function formatTime(seconds: number): string {
  const safe = Math.max(0, Math.round(seconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatShareDate(dayKey?: string): string {
  if (!dayKey) return 'Missão de hoje';
  const [year, month, day] = dayKey.split('-').map(Number);
  if (!year || !month || !day) return dayKey;

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(year, month - 1, day));
}

function getSiteUrl(): string {
  if (typeof window !== 'undefined' && window.location?.origin) return window.location.origin;
  return FALLBACK_URL;
}

function precisionBlock(accuracy: number): string {
  if (accuracy >= 97) return '🟩';
  if (accuracy >= 90) return '🟦';
  if (accuracy >= 80) return '🟨';
  return '⬛';
}

function speedBlock(ppm: number): string {
  if (ppm >= 80) return '🟪';
  if (ppm >= 60) return '🟦';
  if (ppm >= 35) return '🟩';
  if (ppm >= 20) return '🟨';
  return '⬛';
}

function errorBlock(errors: number): string {
  if (errors === 0) return '🟩';
  if (errors <= 3) return '🟦';
  if (errors <= 10) return '🟨';
  return '⬛';
}

export function generatePerformanceEmojiGrid(result: {
  accuracy?: number;
  ppm?: number;
  errors?: number;
  maxCombo?: number;
}): string {
  const accuracy = safeNumber(result.accuracy);
  const ppm = safeNumber(result.ppm);
  const errors = safeNumber(result.errors);
  const maxCombo = safeNumber(result.maxCombo);
  const comboBlock = maxCombo >= 30 ? '🟩' : maxCombo >= 15 ? '🟦' : maxCombo >= 6 ? '🟨' : '⬛';

  return [
    [
      precisionBlock(accuracy),
      precisionBlock(accuracy),
      speedBlock(ppm),
      errorBlock(errors),
      comboBlock,
    ].join(''),
    [
      speedBlock(ppm),
      precisionBlock(accuracy),
      errorBlock(errors),
      comboBlock,
      precisionBlock(accuracy),
    ].join(''),
  ].join('\n');
}

type ShareInput = Pick<
  DailyChallengeResult,
  'challengeNumber' | 'ppm' | 'cpm' | 'accuracy' | 'maxCombo' | 'durationSeconds'
> & {
  date?: string;
  challengeId?: string;
  errors?: number;
  displayDate?: string;
  medal?: DailyMedal | string | null;
  validForRanking?: boolean;
  rankingInvalidReasons?: RankingInvalidReason[];
  suspiciousFlags?: SuspiciousFlags;
};

export function generateDailyShareText(result: ShareInput): string {
  const ppm = formatMetric(result.ppm);
  const cpm = formatMetric(result.cpm);
  const accuracy = Math.min(100, formatMetric(result.accuracy));
  const errors = formatMetric(result.errors);
  const maxCombo = formatMetric(result.maxCombo);
  const durationSeconds = formatMetric(result.durationSeconds);
  const medal = result.medal ?? getDailyMedal(accuracy, ppm) ?? 'Continue treinando';
  const dateLabel = result.displayDate ?? formatShareDate(result.date);
  const challengeLabel = result.challengeNumber
    ? `Dojo Daily #${String(result.challengeNumber).padStart(3, '0')}`
    : 'Missão diária do Dojo';
  const pandaMessage = getMasterPandaShareMessage({
    ...result,
    ppm,
    cpm,
    accuracy,
    errors,
    maxCombo,
    durationSeconds,
  });

  return [
    `🐼 Panda Dojo - Desafio Diário · ${dateLabel}`,
    challengeLabel,
    '',
    `🏅 Medalha: ${medal}`,
    `⚡ ${ppm} PPM`,
    `⌨️ ${cpm} CPM`,
    `🎯 ${accuracy}% precisão`,
    `🔥 Combo ${maxCombo}x`,
    `⌨️ ${errors} erros`,
    `⏱️ Tempo: ${formatTime(durationSeconds)}`,
    '',
    '💬 Mestre Panda:',
    `"${pandaMessage}"`,
    '',
    generatePerformanceEmojiGrid({ accuracy, ppm, errors, maxCombo }),
    '',
    `Jogue também: ${getSiteUrl()}`,
  ].join('\n');
}

export async function copyDailyResultToClipboard(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fallback below.
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}
