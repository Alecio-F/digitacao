import type { GameState, HitResult, MissResult, TimingRating } from './types';

const TIMING: TimingRating[] = [
  { name: 'PERFECT', maxDistance: 15, points: 100, color: '#f6c453' },
  { name: 'GOOD',    maxDistance: 40, points: 50,  color: '#35b779' },
  { name: 'LATE',    maxDistance: 72, points: 20,  color: '#f2a43a' },
];

export function evaluateTiming(distance: number): TimingRating | null {
  return TIMING.find((r) => Math.abs(distance) <= r.maxDistance) ?? null;
}

export function comboMultiplier(combo: number): number {
  if (combo >= 20) return 3;
  if (combo >= 10) return 2;
  if (combo >= 5)  return 1.5;
  return 1;
}

export function applyHit(state: GameState, rating: TimingRating): HitResult {
  state.combo++;
  state.maxCombo = Math.max(state.maxCombo, state.combo);
  state.hits++;

  const multiplier = comboMultiplier(state.combo);
  const speedBonus = 1 + state.level * 0.1;
  const gained = Math.round(rating.points * multiplier * speedBonus);
  state.score += gained;

  return { gained, multiplier, score: state.score, combo: state.combo };
}

export function applyMiss(state: GameState, type: 'escaped' | 'wrong-key'): MissResult {
  const penalty = type === 'escaped' ? 50 : 25;
  state.combo = 0;
  state.misses++;
  state.score = Math.max(0, state.score - penalty);

  if (type === 'escaped') {
    if (state.tutorialMissesLeft > 0) {
      state.tutorialMissesLeft--;
    } else {
      state.lives = Math.max(0, state.lives - 1);
    }
  }

  return { penalty, score: state.score, lives: state.lives };
}
