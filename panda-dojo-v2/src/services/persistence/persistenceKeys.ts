import { STORAGE_KEYS } from '@/constants';

/**
 * Mapa semântico das chaves de persistência usado pela camada de repositories.
 *
 * IMPORTANTE: os VALORES apontam para as mesmas strings já gravadas no
 * navegador (STORAGE_KEYS). Não renomeie chaves sem criar migração — isso
 * apagaria o progresso local dos usuários.
 *
 * Observação de compatibilidade:
 * - `arenaCursor` mapeia para a chave existente `pandaCursorMode`
 *   (não `pandaArenaCursor`), preservando os dados já salvos.
 * - `virtualKeyboardEnabled` mapeia para `pandaKeyboardVisible`.
 */
export const PERSISTENCE_KEYS = {
  // Configurações
  theme: STORAGE_KEYS.ativo,
  practiceTime: STORAGE_KEYS.tempoPratica,
  arenaCursor: STORAGE_KEYS.pandaCursorMode,
  arenaFontSize: STORAGE_KEYS.pandaArenaFontSize,
  virtualKeyboardEnabled: STORAGE_KEYS.pandaKeyboardVisible,
  soundsEnabled: STORAGE_KEYS.pandaSoundsEnabled,
  animationsEnabled: STORAGE_KEYS.pandaAnimationsEnabled,
  reducedEffects: STORAGE_KEYS.pandaReducedEffects,
  motionPreferenceTouched: STORAGE_KEYS.pandaMotionPreferenceTouched,

  // Perfil / progresso
  xp: STORAGE_KEYS.pandaXp,
  level: STORAGE_KEYS.pandaLevel,
  xpAwards: STORAGE_KEYS.pandaXpAwards,
  history: STORAGE_KEYS.historico,
  lessonProgress: STORAGE_KEYS.pandaLessonProgress,
  startedLessons: STORAGE_KEYS.pandaStartedLessons,
  achievements: STORAGE_KEYS.pandaAchievements,
  dailyStreak: STORAGE_KEYS.pandaDailyStreak,
  lastTrainingDate: STORAGE_KEYS.pandaLastTrainingDate,
  lastMistakes: STORAGE_KEYS.pandaLastMistakes,
  lastMasterPandaRecommendation: STORAGE_KEYS.pandaLastMasterPandaRecommendation,
  recommendations: STORAGE_KEYS.pandaTrainingRecommendations,
  dailyMissions: STORAGE_KEYS.pandaDailyMissions,
  missionDate: STORAGE_KEYS.pandaMissionDate,

  // Arcade
  pandaKeysBestScore: STORAGE_KEYS.pandaKeysBestScore,
  pandaSealBestScore: STORAGE_KEYS.pandaSealBestScore,

  // Seleção de treino
  selectedTrainingMode: STORAGE_KEYS.pandaSelectedTrainingMode,
  selectedLessonId: STORAGE_KEYS.pandaSelectedLessonId,
  selectedPracticeText: STORAGE_KEYS.pandaSelectedPracticeText,
  selectedPracticeTextId: STORAGE_KEYS.pandaSelectedPracticeTextId,
  selectedPracticeTextTitle: STORAGE_KEYS.pandaSelectedPracticeTextTitle,
  selectedDailyChallengeId: STORAGE_KEYS.pandaSelectedDailyChallengeId,

  // Desafio diário
  dailyChallengeResult: STORAGE_KEYS.pandaDailyChallengeResult,
  dailyChallengeDate: STORAGE_KEYS.pandaDailyChallengeDate,
  dailyChallengeDismissedDate: STORAGE_KEYS.pandaDailyChallengeDismissedDate,

  // Palavras aleatórias
  recentRandomWords: STORAGE_KEYS.pandaRecentRandomWords,

  // Sync com a nuvem: importação local -> nuvem e restauração nuvem -> local.
  cloudSyncImported: STORAGE_KEYS.pandaCloudSyncImported,
  cloudRestoreCompleted: STORAGE_KEYS.pandaCloudRestoreCompleted,
  // Fila de itens que falharam ao enviar para a nuvem (reenvio posterior).
  pendingSyncQueue: STORAGE_KEYS.pandaPendingSyncQueue,
} as const;

export type PersistenceKeyName = keyof typeof PERSISTENCE_KEYS;
export type PersistenceKey = (typeof PERSISTENCE_KEYS)[PersistenceKeyName];
