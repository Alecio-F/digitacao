import { getSelectedStage, getVisualLaneCount, keyLabel } from './state';
import type { GameState, Tile } from './types';

function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function nextFreeLane(state: GameState): number {
  const laneCount = getVisualLaneCount(state);
  const step = 1 + Math.floor(Math.random() * 3);
  state.freeLaneCursor = (state.freeLaneCursor + step) % laneCount;
  return state.freeLaneCursor;
}

function createLetterTile(options: {
  state: GameState;
  canvas: HTMLCanvasElement;
  key: string;
  laneIndex?: number;
  width: number;
  height: number;
  yOffset?: number;
}): Tile {
  const { state, canvas, key, width, height, yOffset = 0 } = options;
  const stage = getSelectedStage(state);
  const laneCount = getVisualLaneCount(state);
  const laneWidth = canvas.width / laneCount;
  const visualLaneIndex = options.laneIndex ?? nextFreeLane(state);
  const centeredX = visualLaneIndex * laneWidth + (laneWidth - width) / 2;
  const jitter = stage.layout === 'free' ? (Math.random() - 0.5) * laneWidth * 0.32 : 0;
  const x = Math.max(8, Math.min(canvas.width - width - 8, centeredX + jitter));

  return {
    id: state.nextTileId++,
    key,
    label: keyLabel(key),
    laneIndex: visualLaneIndex,
    x,
    y: -height - 8 - yOffset,
    previousY: -height - 8 - yOffset,
    width,
    height,
    speed: state.speed,
    state: 'falling',
  };
}

function createFixedLaneTile(state: GameState, canvas: HTMLCanvasElement): Tile {
  const stage = getSelectedStage(state);
  const key = randomItem(stage.keys);
  const laneIndex = stage.keys.indexOf(key);
  const laneWidth = canvas.width / stage.keys.length;
  const width = Math.min(104, laneWidth * 0.72);
  const height = Math.max(58, Math.min(76, canvas.height * 0.105));
  return createLetterTile({ state, canvas, key, laneIndex, width, height });
}

function createFreeTile(state: GameState, canvas: HTMLCanvasElement): Tile {
  const laneCount = getVisualLaneCount(state);
  const laneWidth = canvas.width / laneCount;
  const width = Math.max(44, Math.min(66, laneWidth * 0.82));
  const height = width;
  const stage = getSelectedStage(state);
  return createLetterTile({ state, canvas, key: randomItem(stage.keys), width, height });
}

function createWordTiles(state: GameState, canvas: HTMLCanvasElement): Tile[] {
  const stage = getSelectedStage(state);
  const word = randomItem(stage.words ?? []);
  const laneCount = getVisualLaneCount(state);
  const laneWidth = canvas.width / laneCount;
  const width = Math.max(42, Math.min(58, laneWidth * 0.74));
  const height = width;
  const maxStartLane = Math.max(0, laneCount - word.length);
  const startLane = Math.floor(Math.random() * (maxStartLane + 1));

  return word.split('').map((key, i) =>
    createLetterTile({
      state,
      canvas,
      key,
      laneIndex: Math.min(laneCount - 1, startLane + i),
      width,
      height,
      yOffset: i * 56,
    }),
  );
}

export function updateSpawner(state: GameState, canvas: HTMLCanvasElement, stepMs: number): void {
  state.lastSpawn += stepMs;
  if (state.lastSpawn < state.spawnInterval) return;
  state.lastSpawn = 0;

  const stage = getSelectedStage(state);
  if (stage.layout === 'word-stair') {
    state.activeTiles.push(...createWordTiles(state, canvas));
  } else if (stage.layout === 'free') {
    state.activeTiles.push(createFreeTile(state, canvas));
  } else {
    state.activeTiles.push(createFixedLaneTile(state, canvas));
  }
}
