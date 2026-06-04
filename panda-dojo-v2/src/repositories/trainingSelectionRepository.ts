import { persistence } from '@/services/persistence/types';
import { PERSISTENCE_KEYS } from '@/services/persistence/persistenceKeys';

/**
 * Repositório da SELEÇÃO de treino (qual conteúdo a Type Arena vai carregar).
 * Centraliza a lógica que antes estava duplicada em PracticeTextCard,
 * RandomWordsCard, ArenaPage e no serviço do desafio diário.
 *
 * Compatibilidade: versões anteriores gravavam estas strings de forma "crua"
 * (sem JSON). A leitura aqui é tolerante — entende tanto o valor cru antigo
 * quanto o JSON novo — para nunca quebrar dados já salvos.
 */

export type TrainingMode =
  | 'random-words'
  | 'practice-text'
  | 'daily-challenge'
  | 'lesson'
  | string;

/** Leitura tolerante: aceita string crua (legado) ou JSON. */
export function readSelectionString(key: string): string {
  return persistence.getItem<string>(key, '');
}

export function getTrainingMode(): string {
  return readSelectionString(PERSISTENCE_KEYS.selectedTrainingMode);
}

export function setTrainingMode(mode: TrainingMode): void {
  persistence.setItem(PERSISTENCE_KEYS.selectedTrainingMode, mode);
}

export function getSelectedLessonId(): string {
  return readSelectionString(PERSISTENCE_KEYS.selectedLessonId);
}

export function getSelectedPracticeText(): string {
  return readSelectionString(PERSISTENCE_KEYS.selectedPracticeText);
}

export function getSelectedPracticeTextId(): string {
  return readSelectionString(PERSISTENCE_KEYS.selectedPracticeTextId);
}

export function getSelectedPracticeTextTitle(): string {
  return readSelectionString(PERSISTENCE_KEYS.selectedPracticeTextTitle);
}

export function getSelectedDailyChallengeId(): string {
  return readSelectionString(PERSISTENCE_KEYS.selectedDailyChallengeId);
}

function clearLessonSelection(): void {
  persistence.removeItem(PERSISTENCE_KEYS.selectedLessonId);
}

function clearPracticeTextSelection(): void {
  persistence.removeItem(PERSISTENCE_KEYS.selectedPracticeText);
  persistence.removeItem(PERSISTENCE_KEYS.selectedPracticeTextId);
  persistence.removeItem(PERSISTENCE_KEYS.selectedPracticeTextTitle);
}

export function clearSelection(): void {
  clearLessonSelection();
  clearPracticeTextSelection();
  persistence.removeItem(PERSISTENCE_KEYS.selectedDailyChallengeId);
  persistence.removeItem(PERSISTENCE_KEYS.selectedTrainingMode);
}

/** Seleciona um texto livre para a Arena. */
export function selectPracticeText(input: { id: string; title: string; text: string }): void {
  clearLessonSelection();
  persistence.setItem(PERSISTENCE_KEYS.selectedPracticeTextId, input.id);
  persistence.setItem(PERSISTENCE_KEYS.selectedPracticeTextTitle, input.title);
  persistence.setItem(PERSISTENCE_KEYS.selectedPracticeText, input.text);
  setTrainingMode('practice-text');
}

/** Seleciona o modo Palavras Aleatórias. */
export function selectRandomWords(): void {
  clearLessonSelection();
  clearPracticeTextSelection();
  setTrainingMode('random-words');
}

/**
 * Seleciona uma fase do Mapa para a Arena. Mantém a convenção existente de
 * gravar o id da fase também em `selectedTrainingMode` (a Arena identifica fase
 * pela presença de `selectedLessonId`). A regra de `startedLessons` continua no
 * lessonProgressService.
 */
export function selectLesson(lessonId: string): void {
  clearPracticeTextSelection();
  persistence.removeItem(PERSISTENCE_KEYS.selectedDailyChallengeId);
  persistence.setItem(PERSISTENCE_KEYS.selectedLessonId, lessonId);
  setTrainingMode(lessonId);
}

/** Seleciona o desafio diário (carrega o texto do dia na Arena). */
export function selectDailyChallenge(input: { id: string; title: string; text: string }): void {
  clearLessonSelection();
  persistence.setItem(PERSISTENCE_KEYS.selectedPracticeText, input.text);
  persistence.setItem(PERSISTENCE_KEYS.selectedPracticeTextTitle, input.title);
  persistence.setItem(PERSISTENCE_KEYS.selectedDailyChallengeId, input.id);
  setTrainingMode('daily-challenge');
}
