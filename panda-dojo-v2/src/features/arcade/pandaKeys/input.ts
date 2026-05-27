import { getSelectedStage, getVisualLaneCount } from './state';
import { applyHit, applyMiss, evaluateTiming } from './score';
import { HIT_WINDOW, addLaneFlash, addParticles, getHitLineY } from './renderer';
import type { AudioManager } from './audio';
import type { GameState, InputResult } from './types';

const MIN_KEY_INTERVAL = 70;

function normalizeKey(key: string): string {
  const k = key.toLowerCase();
  return k === ';' ? 'ç' : k;
}

export function createInputManager(options: {
  state: GameState;
  canvas: HTMLCanvasElement;
  keyCatcher: HTMLInputElement;
  touchControls: HTMLElement;
  audio: AudioManager;
  onResult: (result: InputResult) => void;
  onVirtualPress: (key: string) => void;
}) {
  const { state, canvas, keyCatcher, touchControls, audio, onResult, onVirtualPress } = options;
  const lastPressByKey = new Map<string, number>();

  function handleKey(rawKey: string) {
    if (state.status !== 'PLAYING') return;

    const key = normalizeKey(rawKey);
    const stage = getSelectedStage(state);
    if (!stage.keys.includes(key)) return;

    const now = performance.now();
    if (now - (lastPressByKey.get(key) ?? 0) < MIN_KEY_INTERVAL) return;
    lastPressByKey.set(key, now);
    onVirtualPress(key);
    evaluateKey(key);
  }

  function evaluateKey(key: string) {
    const hitLineY = getHitLineY(canvas);
    let candidate = state.activeTiles.find((t) => {
      if (t.key !== key || t.state !== 'falling') return false;
      const dist = Math.abs(t.y + t.height / 2 - hitLineY);
      return dist <= HIT_WINDOW;
    }) ?? null;

    // Pick closest tile if multiple
    if (state.activeTiles.filter((t) => t.key === key && t.state === 'falling' && Math.abs(t.y + t.height / 2 - hitLineY) <= HIT_WINDOW).length > 1) {
      candidate = state.activeTiles
        .filter((t) => t.key === key && t.state === 'falling' && Math.abs(t.y + t.height / 2 - hitLineY) <= HIT_WINDOW)
        .reduce((a, b) => Math.abs(a.y + a.height / 2 - hitLineY) < Math.abs(b.y + b.height / 2 - hitLineY) ? a : b);
    }

    if (!candidate) {
      const laneIndex = findLaneForKey(key);
      const missResult = applyMiss(state, 'wrong-key');
      addLaneFlash(state, laneIndex, '#ff4f5e');
      audio.miss();
      onResult({ type: 'miss', laneIndex, x: laneCenterX(laneIndex), y: hitLineY, text: `-${missResult.penalty} MISS` });
      return;
    }

    const distance = candidate.y + candidate.height / 2 - hitLineY;
    const rating = evaluateTiming(distance);
    if (!rating) return;

    candidate.state = 'hit';
    state.activeTiles = state.activeTiles.filter((t) => t.id !== candidate!.id);

    const hitResult = applyHit(state, rating);
    const x = candidate.x + candidate.width / 2;
    addLaneFlash(state, candidate.laneIndex, rating.color);
    addParticles(state, x, hitLineY, rating.color, rating.name === 'PERFECT' ? 8 : 4);
    audio.hit(rating.name);

    onResult({ type: 'hit', rating: rating.name, laneIndex: candidate.laneIndex, x, y: hitLineY, text: `+${hitResult.gained} ${rating.name}` });
  }

  function findLaneForKey(key: string): number {
    const stage = getSelectedStage(state);
    if (stage.layout === 'lanes') return Math.max(0, stage.keys.indexOf(key));
    return Math.floor(getVisualLaneCount(state) / 2);
  }

  function laneCenterX(laneIndex: number): number {
    const laneCount = getVisualLaneCount(state);
    return laneIndex * (canvas.width / laneCount) + (canvas.width / laneCount) / 2;
  }

  keyCatcher.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1) return;
    e.preventDefault();
    handleKey(e.key);
  });

  touchControls.addEventListener('pointerdown', (e) => {
    const btn = (e.target as Element).closest('[data-key]') as HTMLElement | null;
    if (!btn) return;
    e.preventDefault();
    keyCatcher.focus();
    btn.classList.add('is-active');
    handleKey(btn.dataset['key'] ?? '');
  });

  touchControls.addEventListener('pointerup', (e) => {
    const btn = (e.target as Element).closest('[data-key]') as HTMLElement | null;
    if (btn) btn.classList.remove('is-active');
  });

  touchControls.addEventListener('pointerleave', () => {
    touchControls.querySelectorAll<HTMLElement>('.is-active').forEach((b: HTMLElement) => b.classList.remove('is-active'));
  });

  return {
    focus() { keyCatcher.focus(); },
  };
}
