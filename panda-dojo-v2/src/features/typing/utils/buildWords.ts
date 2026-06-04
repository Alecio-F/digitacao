import { WORDS_COUNT } from '@/constants';
import { getWordsForLesson } from '../data/lessonTexts';
import { generateRandomWords } from '../logic/wordGenerator';
import type { WordData } from '../types';

function toWordData(text: string): WordData {
  return {
    text,
    letters: text.split('').map((char) => ({ char, status: 'pending' as const })),
  };
}

function normalizePracticeText(text: string | null | undefined): string[] {
  return String(text ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);
}

export function buildWordList(
  lessonId: string | null,
  practiceText?: string | null,
  randomCount?: number,
): WordData[] {
  const practiceWords = normalizePracticeText(practiceText);
  if (practiceWords.length > 0) {
    return practiceWords.map(toWordData);
  }

  const lessonWords = lessonId ? getWordsForLesson(lessonId) : null;
  if (lessonWords?.length) {
    return Array.from({ length: WORDS_COUNT }, (_unused, index) =>
      toWordData(lessonWords[index % lessonWords.length]),
    );
  }

  // Modo Palavras Aleatórias: banco grande + evita repetição entre rodadas.
  const count = randomCount && randomCount > 0 ? randomCount : WORDS_COUNT;
  return generateRandomWords({ count }).map(toWordData);
}
