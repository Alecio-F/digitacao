import { WORDS_COUNT } from '@/constants';
import { getWordsForLesson } from '../data/lessonTexts';
import { nextRandomWord, resetWordPool } from '../data/words';
import type { WordData } from '../types';

export function buildWordList(lessonId: string | null): WordData[] {
  resetWordPool();

  const lessonWords = lessonId ? getWordsForLesson(lessonId) : null;
  let lessonIndex = 0;

  return Array.from({ length: WORDS_COUNT }, () => {
    const text = lessonWords?.length
      ? lessonWords[lessonIndex++ % lessonWords.length]
      : nextRandomWord();
    return {
      text,
      letters: text.split('').map((char) => ({ char, status: 'pending' as const })),
    };
  });
}
