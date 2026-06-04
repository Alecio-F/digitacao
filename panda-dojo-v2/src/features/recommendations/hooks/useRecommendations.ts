import { useMemo } from 'react';
import type { HistoryItem } from '@/features/gamification/types';
import { getHistory } from '@/repositories/typingResultRepository';
import { getLastMistakes } from '@/repositories/profileProgressRepository';
import {
  getRecommendations,
  saveRecommendations,
} from '@/repositories/recommendationRepository';
import type { TrainingRecommendation } from '../types';

function parsePrecision(value: string | number | undefined): number {
  if (typeof value === 'number') return value;
  return Number(String(value ?? '0').replace('%', '').replace(',', '.')) || 0;
}

function lessonRec(id: string, title: string, message: string): TrainingRecommendation {
  return { id: `mistakes-${id}`, title, message, targetPage: '/mapa', targetLessonId: id, priority: 'high', reason: 'mistake-pattern' };
}

function mistakeRecommendation(mistakes: [string, number][]): TrainingRecommendation | null {
  if (!mistakes.length) return null;
  const keys = mistakes.map(([k]) => String(k ?? '').toLowerCase()).join('');
  if (['a','s','d','f'].some((c) => keys.includes(c))) return lessonRec('left-hand', 'Fase Teclas Base / Mão Esquerda', 'Sua mão esquerda fez teatro no tatame. Reforce ASDF antes que o Dojo cobre ingresso.');
  if (['j','k','l','ç'].some((c) => keys.includes(c))) return lessonRec('right-hand', 'Fase Teclas Base / Mão Direita', 'J, K, L e Ç estão pedindo respeito. O Mestre Panda recomenda domar essa ala do teclado.');
  if (['á','é','í','ó','ú','ã','õ'].some((c) => keys.includes(c))) return lessonRec('accents', 'Fase Acentuação', 'Os acentos apareceram nos erros como ninjas dramáticos. Treine palavras acentuadas.');
  if (/[0-9]/.test(keys)) return lessonRec('numbers', 'Fase Números', 'Os números entraram na rodada e bagunçaram o placar. Hora de chamar ordem no teclado.');
  if (/[.,;:?!]/.test(keys)) return lessonRec('punctuation', 'Fase Pontuação', 'A pontuação tentou fazer pegadinha. Mostre que vírgula e ponto também obedecem ao Dojo.');
  return null;
}

function generate(): TrainingRecommendation[] {
  const history = getHistory() as HistoryItem[];
  const mistakes = getLastMistakes();
  const safe = Array.isArray(history) ? history : [];
  const safeMistakes = Array.isArray(mistakes) ? mistakes : [];

  if (!safe.length) {
    return [{ id: 'start-base-keys', title: 'Fase 01: Teclas Base', message: 'Comece pela linha base. O teclado ainda não reconheceu sua autoridade, então vamos por partes.', targetPage: '/mapa', targetLessonId: 'base-keys', priority: 'high', reason: 'no-history' }];
  }

  const recent = safe.slice(0, 5);
  const avgAcc = recent.reduce((s, i) => s + parsePrecision(i.precisao), 0) / recent.length;
  const avgPpm = recent.reduce((s, i) => s + (Number(i.ppm) || 0), 0) / recent.length;
  const recentRecord = Boolean(safe[0]?.novoRecorde);
  const recs: TrainingRecommendation[] = [];

  const mr = mistakeRecommendation(safeMistakes);
  if (mr) recs.push(mr);

  if (avgAcc < 85) recs.push({ id: 'precision-training', title: 'Treino de Precisão', message: 'Sua precisão tropeçou no tatame. Respire, reduza o ritmo e mire nas teclas certas.', targetPage: '/mapa', targetLessonId: 'base-keys', priority: 'high', reason: 'accuracy-low' });
  else if (avgAcc >= 95 && avgPpm < 35) recs.push({ id: 'speed-training', title: 'Treino de Velocidade', message: 'A precisão está afiada. Agora avise seus dedos que eles podem correr um pouco.', targetPage: '/arena', targetLessonId: null, priority: 'medium', reason: 'speed-low' });

  if (recentRecord) recs.push({ id: 'daily-challenge', title: 'Desafio Diário', message: 'Você bateu recorde recentemente. O Mestre Panda fingiu calma e apontou para o desafio de hoje.', targetPage: '/mapa', targetLessonId: null, priority: 'medium', reason: 'recent-record' });

  if (!recs.length) recs.push({ id: 'next-lesson', title: 'Próxima fase do Dojo', message: 'Seu treino está estável. O Dojo aprovou com um aceno curto e levemente metido.', targetPage: '/mapa', targetLessonId: null, priority: 'normal', reason: 'steady-progress' });

  saveRecommendations(recs);
  return recs;
}

export function useRecommendations(): TrainingRecommendation[] {
  return useMemo(() => {
    const cached = getRecommendations();
    return Array.isArray(cached) && cached.length ? cached : generate();
  }, []);
}
