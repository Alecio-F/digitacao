import { persistence } from '@/services/persistence/types';
import { PERSISTENCE_KEYS } from '@/services/persistence/persistenceKeys';

/**
 * Repositório de recordes dos minigames do Arcade.
 * Scores são armazenados como string (compatível com o formato já gravado).
 */

export type ArcadeGameId = 'panda-keys' | 'seal';

const GAME_KEYS: Record<ArcadeGameId, string> = {
  'panda-keys': PERSISTENCE_KEYS.pandaKeysBestScore,
  seal: PERSISTENCE_KEYS.pandaSealBestScore,
};

export function getBestScore(gameId: ArcadeGameId): number {
  const key = GAME_KEYS[gameId];
  if (!key) return 0;
  return Number(persistence.getItem<string>(key, '0')) || 0;
}

/** Grava o score apenas se for maior que o recorde atual. Retorna o recorde. */
export function saveScore(gameId: ArcadeGameId, score: number): number {
  const key = GAME_KEYS[gameId];
  if (!key) return 0;
  const best = Math.max(getBestScore(gameId), Math.max(0, Math.floor(score) || 0));
  persistence.setItem(key, String(best));
  return best;
}

export function getPandaKeysBestScore(): number {
  return getBestScore('panda-keys');
}

export function savePandaKeysBestScore(score: number): number {
  return saveScore('panda-keys', score);
}

export function getSealBestScore(): number {
  return getBestScore('seal');
}

export function saveSealBestScore(score: number): number {
  return saveScore('seal', score);
}
