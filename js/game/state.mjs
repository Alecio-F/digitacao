export const GameStatus = Object.freeze({
  INIT: "INIT",
  IDLE: "IDLE",
  COUNTDOWN: "COUNTDOWN",
  PLAYING: "PLAYING",
  PAUSED: "PAUSED",
  GAME_OVER: "GAME_OVER",
});

export const KEYBOARD_ROWS = Object.freeze([
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l", "ç"],
  ["z", "x", "c", "v", "b", "n", "m"],
]);

export const KEY_LABELS = Object.freeze({
  "ç": "Ç",
});

const FULL_KEYBOARD_KEYS = KEYBOARD_ROWS.flat();
const WORD_BANK = Object.freeze([
  "panda",
  "teclado",
  "rapido",
  "foco",
  "treino",
  "codigo",
  "preciso",
  "ritmo",
]);

export const GAME_STAGES = Object.freeze([
  {
    id: "asdf",
    title: "Base esquerda",
    shortTitle: "ASDF",
    description: "Primeira etapa com as teclas A, S, D e F.",
    layout: "lanes",
    keys: ["a", "s", "d", "f"],
    speed: 0.25,
    spawnInterval: 920,
  },
  {
    id: "home-row",
    title: "Linha base",
    shortTitle: "ASDF JKLÇ",
    description: "Treino das duas maos na linha base: A, S, D, F, J, K, L e Ç.",
    layout: "lanes",
    keys: ["a", "s", "d", "f", "j", "k", "l", "ç"],
    speed: 0.25,
    spawnInterval: 780,
  },
  {
    id: "keyboard",
    title: "Teclado completo",
    shortTitle: "Teclado",
    description: "Letras caem em trilhas livres e o teclado virtual mostra a area de treino.",
    layout: "free",
    keys: FULL_KEYBOARD_KEYS,
    speed: 0.28,
    spawnInterval: 610,
    visualLaneCount: 12,
  },
  {
    id: "words",
    title: "Palavras em escada",
    shortTitle: "Palavras",
    description: "Cada palavra aparece como uma sequencia de letras em escadinha para digitar no ritmo.",
    layout: "word-stair",
    keys: FULL_KEYBOARD_KEYS,
    speed: 0.22,
    spawnInterval: 2200,
    visualLaneCount: 12,
    words: WORD_BANK,
  },
]);

const BASE_SCORE_STEP = 750;

export function keyLabel(key) {
  return KEY_LABELS[key] || key.toUpperCase();
}

export function getStageById(stageId) {
  return GAME_STAGES.find((stage) => stage.id === stageId) || GAME_STAGES[0];
}

export function getSelectedStage(state) {
  return getStageById(state.stageId);
}

export function getVisualLaneCount(state) {
  const stage = getSelectedStage(state);
  if (stage.layout === "lanes") {
    return stage.keys.length;
  }
  return stage.visualLaneCount || 12;
}

export function setStage(state, stageId) {
  state.stageId = getStageById(stageId).id;
  resetRun(state);
}

export function createGameState() {
  const initialStage = GAME_STAGES[0];
  return {
    status: GameStatus.INIT,
    stageId: initialStage.id,
    level: 1,
    speed: initialStage.speed,
    spawnInterval: initialStage.spawnInterval,
    mode: initialStage.layout,
    score: 0,
    combo: 0,
    maxCombo: 0,
    lives: 3,
    misses: 0,
    hits: 0,
    activeTiles: [],
    particles: [],
    laneFlashes: Array.from({ length: initialStage.keys.length }, () => null),
    elapsed: 0,
    lastSpawn: 0,
    countdownRemaining: 3000,
    countdownValue: 3,
    tutorialMissesLeft: 3,
    nextTileId: 1,
    freeLaneCursor: 0,
  };
}

export function resetRun(state) {
  const stage = getSelectedStage(state);

  state.status = GameStatus.IDLE;
  state.level = 1;
  state.speed = stage.speed;
  state.spawnInterval = stage.spawnInterval;
  state.mode = stage.layout;
  state.score = 0;
  state.combo = 0;
  state.maxCombo = 0;
  state.lives = 3;
  state.misses = 0;
  state.hits = 0;
  state.activeTiles.length = 0;
  state.particles.length = 0;
  state.laneFlashes = Array.from({ length: getVisualLaneCount(state) }, () => null);
  state.elapsed = 0;
  state.lastSpawn = 0;
  state.countdownRemaining = 3000;
  state.countdownValue = 3;
  state.tutorialMissesLeft = 3;
  state.freeLaneCursor = 0;
}

export function startCountdown(state) {
  state.status = GameStatus.COUNTDOWN;
  state.countdownRemaining = 3000;
  state.countdownValue = 3;
}

export function pauseGame(state) {
  if (state.status === GameStatus.PLAYING) {
    state.status = GameStatus.PAUSED;
  }
}

export function resumeGame(state) {
  if (state.status === GameStatus.PAUSED) {
    state.status = GameStatus.PLAYING;
  }
}

export function finishGame(state) {
  state.status = GameStatus.GAME_OVER;
}

export function applyDifficulty(state) {
  const stage = getSelectedStage(state);
  const nextLevel = Math.min(10, Math.floor(state.score / BASE_SCORE_STEP) + 1);
  if (nextLevel === state.level) {
    return false;
  }

  state.level = nextLevel;
  state.speed = stage.speed * (1 + (state.level - 1) * 0.14);
  state.spawnInterval = Math.max(360, stage.spawnInterval * (1 - (state.level - 1) * 0.075));
  return true;
}
