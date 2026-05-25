import { GameStatus, applyDifficulty, finishGame } from "./state.mjs";
import { updateSpawner } from "./spawner.mjs";
import { applyMiss } from "./score.mjs";
import { HIT_WINDOW, addLaneFlash, getHitLineY, render, updateEffects } from "./renderer.mjs";

const FIXED_STEP = 1000 / 60;
const MAX_FRAME_DELTA = 100;

export function createGameLoop({ state, canvas, ctx, audio, onHudChange, onCountdown, onGameOver, onMiss }) {
  let rafId = null;
  let lastTimestamp = 0;
  let accumulated = 0;

  function start() {
    if (rafId !== null) {
      return;
    }
    lastTimestamp = 0;
    rafId = requestAnimationFrame(tick);
  }

  function stop() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    lastTimestamp = 0;
    accumulated = 0;
  }

  function tick(timestamp) {
    if (lastTimestamp === 0) {
      lastTimestamp = timestamp;
    }

    const delta = Math.min(MAX_FRAME_DELTA, timestamp - lastTimestamp);
    lastTimestamp = timestamp;
    accumulated += delta;

    while (accumulated >= FIXED_STEP) {
      update(FIXED_STEP);
      accumulated -= FIXED_STEP;
    }

    render(ctx, canvas, state, accumulated / FIXED_STEP);

    if (state.status === GameStatus.PLAYING || state.status === GameStatus.COUNTDOWN) {
      rafId = requestAnimationFrame(tick);
    } else {
      rafId = null;
      lastTimestamp = 0;
      accumulated = 0;
    }
  }

  function update(stepMs) {
    updateEffects(state, stepMs);

    if (state.status === GameStatus.COUNTDOWN) {
      state.countdownRemaining -= stepMs;
      state.countdownValue = Math.max(1, Math.ceil(state.countdownRemaining / 1000));
      onCountdown(state.countdownValue);

      if (state.countdownRemaining <= 0) {
        state.status = GameStatus.PLAYING;
        onCountdown(null);
      }
      return;
    }

    if (state.status !== GameStatus.PLAYING) {
      return;
    }

    state.elapsed += stepMs;
    updateSpawner(state, canvas, stepMs);

    const hitLineY = getHitLineY(canvas);
    for (let index = state.activeTiles.length - 1; index >= 0; index -= 1) {
      const tile = state.activeTiles[index];
      tile.previousY = tile.y;
      tile.y += tile.speed * stepMs;

      if (tile.y > hitLineY + HIT_WINDOW) {
        state.activeTiles.splice(index, 1);
        const missResult = applyMiss(state, "escaped");
        addLaneFlash(state, tile.laneIndex, "#db3d35");
        audio.miss();
        onMiss(tile, missResult);
      }
    }

    if (applyDifficulty(state)) {
      audio.levelUp();
    }

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
    renderOnce() {
      render(ctx, canvas, state, 1);
    },
  };
}
