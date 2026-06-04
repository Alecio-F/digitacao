/**
 * Barrel da camada de repositories (Fase 1A de persistência).
 *
 * Componentes/hooks devem importar daqui em vez de acessar localStorage
 * diretamente. Cada repositório usa o StorageAdapter ativo (localStorage hoje,
 * Supabase no futuro) e/ou delega para serviços de domínio existentes.
 */
export * as typingResultRepository from './typingResultRepository';
export * as lessonProgressRepository from './lessonProgressRepository';
export * as profileProgressRepository from './profileProgressRepository';
export * as arcadeScoreRepository from './arcadeScoreRepository';
export * as dailyChallengeRepository from './dailyChallengeRepository';
export * as dailyMissionRepository from './dailyMissionRepository';
export * as settingsRepository from './settingsRepository';
export * as trainingSelectionRepository from './trainingSelectionRepository';
export * as randomWordsRepository from './randomWordsRepository';
export * as recommendationRepository from './recommendationRepository';
