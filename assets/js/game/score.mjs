const TIMING = Object.freeze([
  { name: "PERFECT", maxDistance: 15, points: 100, color: "#f6c453" },
  { name: "GOOD", maxDistance: 40, points: 50, color: "#35b779" },
  { name: "LATE", maxDistance: 72, points: 20, color: "#f2a43a" },
]);

export function evaluateTiming(distance) {
  const absoluteDistance = Math.abs(distance);
  return TIMING.find((rating) => absoluteDistance <= rating.maxDistance) || null;
}

export function comboMultiplier(combo) {
  if (combo >= 20) {
    return 3;
  }
  if (combo >= 10) {
    return 2;
  }
  if (combo >= 5) {
    return 1.5;
  }
  return 1;
}

export function applyHit(state, rating) {
  state.combo += 1;
  state.maxCombo = Math.max(state.maxCombo, state.combo);
  state.hits += 1;

  const multiplier = comboMultiplier(state.combo);
  const speedBonus = 1 + state.level * 0.1;
  const gained = Math.round(rating.points * multiplier * speedBonus);

  state.score += gained;
  return {
    gained,
    multiplier,
    score: state.score,
    combo: state.combo,
  };
}

export function applyMiss(state, type) {
  const penalty = type === "escaped" ? 50 : 25;

  state.combo = 0;
  state.misses += 1;
  state.score = Math.max(0, state.score - penalty);

  if (type === "escaped") {
    if (state.tutorialMissesLeft > 0) {
      state.tutorialMissesLeft -= 1;
    } else {
      state.lives = Math.max(0, state.lives - 1);
    }
  }

  return {
    penalty,
    score: state.score,
    lives: state.lives,
  };
}
