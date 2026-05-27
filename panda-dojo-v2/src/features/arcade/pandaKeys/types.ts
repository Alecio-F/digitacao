export type GameStatusType = 'INIT' | 'IDLE' | 'COUNTDOWN' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';
export type StageLayout = 'lanes' | 'free' | 'word-stair';

export interface Tile {
  id: number;
  key: string;
  label: string;
  laneIndex: number;
  x: number;
  y: number;
  previousY: number;
  width: number;
  height: number;
  speed: number;
  state: 'falling' | 'hit';
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  life: number;
  remaining: number;
  color: string;
}

export interface LaneFlash {
  color: string;
  remaining: number;
  duration: number;
}

export interface GameStage {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  layout: StageLayout;
  keys: string[];
  speed: number;
  spawnInterval: number;
  visualLaneCount?: number;
  words?: string[];
}

export interface GameState {
  status: GameStatusType;
  stageId: string;
  level: number;
  speed: number;
  spawnInterval: number;
  mode: StageLayout;
  score: number;
  combo: number;
  maxCombo: number;
  lives: number;
  misses: number;
  hits: number;
  activeTiles: Tile[];
  particles: Particle[];
  laneFlashes: (LaneFlash | null)[];
  elapsed: number;
  lastSpawn: number;
  countdownRemaining: number;
  countdownValue: number;
  tutorialMissesLeft: number;
  nextTileId: number;
  freeLaneCursor: number;
}

export interface HitResult {
  gained: number;
  multiplier: number;
  score: number;
  combo: number;
}

export interface MissResult {
  penalty: number;
  score: number;
  lives: number;
}

export interface TimingRating {
  name: string;
  maxDistance: number;
  points: number;
  color: string;
}

export interface InputResult {
  type: 'hit' | 'miss';
  rating?: string;
  laneIndex: number;
  x: number;
  y: number;
  text: string;
}
