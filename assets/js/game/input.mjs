import { GameStatus, getSelectedStage, getVisualLaneCount } from "./state.mjs";
import { evaluateTiming, applyHit, applyMiss } from "./score.mjs";
import { HIT_WINDOW, addLaneFlash, addParticles, getHitLineY } from "./renderer.mjs";

const MIN_KEY_INTERVAL = 70;

function normalizeKey(key) {
  const normalized = key.toLowerCase();
  if (normalized === ";") {
    return "ç";
  }
  return normalized;
}

export function createInputManager({ state, canvas, keyCatcher, touchControls, audio, onResult, onVirtualPress }) {
  const lastPressByKey = new Map();

  function handleKey(rawKey) {
    if (state.status !== GameStatus.PLAYING) {
      return;
    }

    const key = normalizeKey(rawKey);
    const stage = getSelectedStage(state);
    if (!stage.keys.includes(key)) {
      return;
    }

    const now = performance.now();
    if ((now - (lastPressByKey.get(key) || 0)) < MIN_KEY_INTERVAL) {
      return;
    }
    lastPressByKey.set(key, now);
    onVirtualPress(key);

    evaluateKey(key);
  }

  function evaluateKey(key) {
    const hitLineY = getHitLineY(canvas);
    let candidate = null;
    let candidateDistance = Infinity;

    for (const tile of state.activeTiles) {
      if (tile.key !== key || tile.state !== "falling") {
        continue;
      }

      const centerY = tile.y + tile.height / 2;
      const distance = centerY - hitLineY;
      if (Math.abs(distance) <= HIT_WINDOW && Math.abs(distance) < Math.abs(candidateDistance)) {
        candidate = tile;
        candidateDistance = distance;
      }
    }

    if (!candidate) {
      const laneIndex = findLaneForKey(key);
      const missResult = applyMiss(state, "wrong-key");
      addLaneFlash(state, laneIndex, "#ff4f5e");
      audio.miss();
      onResult({
        type: "miss",
        label: "MISS",
        laneIndex,
        x: laneCenterX(laneIndex),
        y: hitLineY,
        text: `-${missResult.penalty} MISS`,
      });
      return;
    }

    const rating = evaluateTiming(candidateDistance);
    if (!rating) {
      return;
    }

    candidate.state = "hit";
    state.activeTiles = state.activeTiles.filter((tile) => tile.id !== candidate.id);

    const hitResult = applyHit(state, rating);
    const x = candidate.x + candidate.width / 2;
    addLaneFlash(state, candidate.laneIndex, rating.color);
    addParticles(state, x, hitLineY, rating.color, rating.name === "PERFECT" ? 8 : 4);
    audio.hit(rating.name);

    onResult({
      type: "hit",
      rating: rating.name,
      laneIndex: candidate.laneIndex,
      x,
      y: hitLineY,
      text: `+${hitResult.gained} ${rating.name}`,
    });
  }

  function findLaneForKey(key) {
    const stage = getSelectedStage(state);
    if (stage.layout === "lanes") {
      return Math.max(0, stage.keys.indexOf(key));
    }
    return Math.floor(getVisualLaneCount(state) / 2);
  }

  function laneCenterX(laneIndex) {
    const laneCount = getVisualLaneCount(state);
    return laneIndex * (canvas.width / laneCount) + (canvas.width / laneCount) / 2;
  }

  keyCatcher.addEventListener("keydown", (event) => {
    if (event.ctrlKey || event.metaKey || event.altKey || event.key.length !== 1) {
      return;
    }

    event.preventDefault();
    handleKey(event.key);
  });

  touchControls.addEventListener("pointerdown", (event) => {
    const button = event.target.closest("[data-key]");
    if (!button) {
      return;
    }

    event.preventDefault();
    keyCatcher.focus();
    button.classList.add("is-active");
    handleKey(button.dataset.key);
  });

  touchControls.addEventListener("pointerup", (event) => {
    const button = event.target.closest("[data-key]");
    if (button) {
      button.classList.remove("is-active");
    }
  });

  touchControls.addEventListener("pointerleave", () => {
    touchControls.querySelectorAll(".is-active").forEach((button) => button.classList.remove("is-active"));
  });

  return {
    focus() {
      keyCatcher.focus();
    },
  };
}
