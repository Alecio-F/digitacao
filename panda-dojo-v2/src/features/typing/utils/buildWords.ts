import { WORDS_COUNT } from '@/constants';
import { getWordsForLesson } from '../data/lessonTexts';
import { nextRandomWord, resetWordPool } from '../data/words';
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

export function buildWordList(lessonId: string | null, practiceText?: string | null): WordData[] {
  resetWordPool();

  const practiceWords = normalizePracticeText(practiceText);
  if (practiceWords.length > 0) {
    return practiceWords.map(toWordData);
  }

  const lessonWords = lessonId ? getWordsForLesson(lessonId) : null;
  let lessonIndex = 0;

  return Array.from({ length: WORDS_COUNT }, () => {
    const text = lessonWords?.length
      ? lessonWords[lessonIndex++ % lessonWords.length]
      : nextRandomWord();
    return toWordData(text);
  });
}
