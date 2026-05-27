import { applyDifficulty, finishGame } from './state';
import { updateSpawner } from './spawner';
import { applyMiss } from './score';
import { HIT_WINDOW, addLaneFlash, getHitLineY, render, updateEffects } from './renderer';
import type { AudioManager } from './audio';
import type { GameState, MissResult, Tile } from './types';

const FIXED_STEP = 1000 / 60;
const MAX_FRAME_DELTA = 100;

interface LoopOptions {
  state: GameState;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  audio: AudioManager;
  onHudChange: () => void;
  onCountdown: (value: number | null) => void;
  onGameOver: () => void;
  onMiss: (tile: Tile, result: MissResult) => void;
}

export function createGameLoop(options: LoopOptions) {
  const { state, canvas, ctx, audio, onHudChange, onCountdown, onGameOver, onMiss } = options;
  let rafId: number | null = null;
  let lastTimestamp = 0;
  let accumulated = 0;

  function start() {
    if (rafId !== null) return;
    lastTimestamp = 0;
    rafId = requestAnimationFrame(tick);
  }

  function stop() {
    if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
    lastTimestamp = 0;
    accumulated = 0;
  }

  function tick(timestamp: number) {
    if (lastTimestamp === 0) lastTimestamp = timestamp;

    const delta = Math.min(MAX_FRAME_DELTA, timestamp - lastTimestamp);
    lastTimestamp = timestamp;
    accumulated += delta;

    while (accumulated >= FIXED_STEP) {
      update(FIXED_STEP);
      accumulated -= FIXED_STEP;
    }

    render(ctx, canvas, state, accumulated / FIXED_STEP);

    if (state.status === 'PLAYING' || state.status === 'COUNTDOWN') {
      rafId = requestAnimationFrame(tick);
    } else {
      rafId = null;
      lastTimestamp = 0;
      accumulated = 0;
    }
  }

  function update(stepMs: number) {
    updateEffects(state, stepMs);

    if (state.status === 'COUNTDOWN') {
      state.countdownRemaining -= stepMs;
      state.countdownValue = Math.max(1, Math.ceil(state.countdownRemaining / 1000));
      onCountdown(state.countdownValue);
      if (state.countdownRemaining <= 0) {
        state.status = 'PLAYING';
        onCountdown(null);
      }
      return;
    }

    if (state.status !== 'PLAYING') return;

    state.elapsed += stepMs;
    updateSpawner(state, canvas, stepMs);

    const hitLineY = getHitLineY(canvas);
    for (let i = state.activeTiles.length - 1; i >= 0; i--) {
      const tile = state.activeTiles[i];
      tile.previousY = tile.y;
      tile.y += tile.speed * stepMs;

      if (tile.y > hitLineY + HIT_WINDOW) {
        state.activeTiles.splice(i, 1);
        const missResult = applyMiss(state, 'escaped');
        addLaneFlash(state, tile.laneIndex, '#db3d35');
        audio.miss();
        onMiss(tile, missResult);
      }
    }

    if (applyDifficulty(state)) audio.levelUp();
    onHudChange();

    if (state.lives <= 0) {
      finishGame(state);
      audio.gameOver();
      onGameOver();
    }
  }

  return {
    start,
    stop,
    renderOnce() { render(ctx, canvas, state, 1); },
  };
}
