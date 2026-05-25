import { config } from "../config.mjs";
import { initDojoChallenges } from "./dojo-challenges.mjs";
import { createAudioManager } from "./audio.mjs";
import { createInputManager } from "./input.mjs";
import { createGameLoop } from "./loop.mjs";
import {
  GAME_STAGES,
  KEYBOARD_ROWS,
  GameStatus,
  createGameState,
  getSelectedStage,
  getVisualLaneCount,
  keyLabel,
  resetRun,
  setStage,
  startCountdown,
  pauseGame,
  resumeGame,
} from "./state.mjs";

const state = createGameState();
const audio = createAudioManager();

$(document).ready(function () {
  config();
  bootGame();
  initDojoChallenges();
});

function bootGame() {
  const canvas = document.getElementById("game-canvas");
  const ctx = canvas.getContext("2d");
  const keyCatcher = document.getElementById("game-key-catcher");
  const touchControls = document.querySelector("[data-game-touch-controls]");
  const stageControls = document.querySelector("[data-game-stages]");
  const titleDescription = document.querySelector("[data-game-description]");
  const hud = {
    score: document.querySelector("[data-game-score]"),
    combo: document.querySelector("[data-game-combo]"),
    lives: document.querySelector("[data-game-lives]"),
    level: document.querySelector("[data-game-level]"),
    stage: document.querySelector("[data-game-stage]"),
    best: document.querySelector("[data-game-best]"),
  };
  const startButton = document.querySelector("[data-game-start]");
  const pauseButton = document.querySelector("[data-game-pause]");
  const resetButton = document.querySelector("[data-game-reset]");
  const playAgainButton = document.querySelector("[data-game-again]");
  const statusPanel = document.querySelector("[data-game-status]");
  const statusTitle = document.querySelector("[data-game-status-title]");
  const statusText = document.querySelector("[data-game-status-text]");
  const countdown = document.querySelector("[data-game-countdown]");
  const floatingLayer = document.querySelector("[data-game-floating]");
  const liveRegion = document.querySelector("[data-game-live]");

  if (!canvas || !ctx || !keyCatcher || !touchControls || !stageControls) {
    return;
  }

  const bestScore = Number(localStorage.getItem("pandaKeysBestScore") || 0);
  hud.best.textContent = String(bestScore);

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.floor(rect.width);
    canvas.height = Math.floor(rect.height);
    loop.renderOnce();
  };

  const loop = createGameLoop({
    state,
    canvas,
    ctx,
    audio,
    onHudChange: updateHud,
    onCountdown(value) {
      if (value === null) {
        countdown.hidden = true;
        return;
      }
      countdown.hidden = false;
      countdown.textContent = String(value);
    },
    onGameOver() {
      loop.stop();
      finishRun();
    },
    onMiss(tile, result) {
      const x = tile.x + tile.width / 2;
      showFloating(`-${result.penalty} MISS`, x, canvas.height * 0.74);
      announce(`Miss. Pontuacao ${state.score}. Vidas ${state.lives}.`);
    },
  });

  const input = createInputManager({
    state,
    canvas,
    keyCatcher,
    touchControls,
    audio,
    onResult(result) {
      showFloating(result.text, result.x, result.y);
      updateHud();
      announce(result.type === "hit"
        ? `${result.rating}. Pontuacao ${state.score}. Combo ${state.combo}.`
        : `Miss. Pontuacao ${state.score}.`);
    },
    onVirtualPress(key) {
      flashVirtualKey(key);
    },
  });

  function renderStageControls() {
    stageControls.innerHTML = "";
    for (const stage of GAME_STAGES) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "stage-option";
      button.dataset.stageId = stage.id;
      button.setAttribute("aria-pressed", stage.id === state.stageId ? "true" : "false");
      button.innerHTML = `<strong>${stage.shortTitle}</strong><span>${stage.title}</span>`;
      stageControls.appendChild(button);
    }
  }

  function renderTouchControls() {
    const stage = getSelectedStage(state);
    touchControls.innerHTML = "";
    touchControls.className = "game-touch-controls";

    if (stage.layout === "lanes") {
      touchControls.classList.add("is-lanes");
      touchControls.style.setProperty("--lane-count", stage.keys.length);
      for (const key of stage.keys) {
        touchControls.appendChild(createKeyButton(key, "lane-tap", `Faixa ${keyLabel(key)}`));
      }
      return;
    }

    touchControls.classList.add("is-keyboard");
    touchControls.style.removeProperty("--lane-count");
    for (const row of KEYBOARD_ROWS) {
      const rowElement = document.createElement("div");
      rowElement.className = "keyboard-row";
      for (const key of row) {
        const button = createKeyButton(key, "key-tap", `Tecla ${keyLabel(key)}`);
        if (!stage.keys.includes(key)) {
          button.disabled = true;
        }
        rowElement.appendChild(button);
      }
      touchControls.appendChild(rowElement);
    }
  }

  function createKeyButton(key, className, label) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.dataset.key = key;
    button.setAttribute("aria-label", label);
    button.textContent = keyLabel(key);
    return button;
  }

  function flashVirtualKey(key) {
    const button = Array.from(touchControls.querySelectorAll("[data-key]"))
      .find((item) => item.dataset.key === key);
    if (!button) {
      return;
    }
    button.classList.add("is-active");
    setTimeout(() => button.classList.remove("is-active"), 110);
  }

  function applyStage(stageId) {
    if (state.status === GameStatus.PLAYING || state.status === GameStatus.COUNTDOWN) {
      return;
    }

    setStage(state, stageId);
    renderStageControls();
    renderTouchControls();
    resetToIdle();
  }

  function resizeAndRender() {
    resize();
    updateHud();
  }

  function beginRun() {
    resetRun(state);
    startCountdown(state);
    statusPanel.hidden = true;
    startButton.disabled = true;
    pauseButton.disabled = false;
    pauseButton.textContent = "Pausar";
    audio.unlock();
    input.focus();
    updateHud();
    loop.start();
  }

  function togglePause() {
    if (state.status === GameStatus.PLAYING) {
      pauseGame(state);
      loop.stop();
      pauseButton.textContent = "Continuar";
      statusTitle.textContent = "Pausado";
      statusText.textContent = "Pressione continuar para voltar ao ritmo.";
      statusPanel.hidden = false;
      loop.renderOnce();
      return;
    }

    if (state.status === GameStatus.PAUSED) {
      resumeGame(state);
      statusPanel.hidden = true;
      pauseButton.textContent = "Pausar";
      input.focus();
      loop.start();
    }
  }

  function resetToIdle() {
    const stage = getSelectedStage(state);
    loop.stop();
    resetRun(state);
    titleDescription.textContent = stage.description;
    statusTitle.textContent = stage.title;
    statusText.textContent = `${stage.description} As tres primeiras perdas de tile nao tiram vida.`;
    statusPanel.hidden = false;
    countdown.hidden = true;
    startButton.disabled = false;
    pauseButton.disabled = true;
    pauseButton.textContent = "Pausar";
    updateHud();
    loop.renderOnce();
  }

  function finishRun() {
    const currentBest = Number(localStorage.getItem("pandaKeysBestScore") || 0);
    if (state.score > currentBest) {
      localStorage.setItem("pandaKeysBestScore", String(state.score));
      hud.best.textContent = String(state.score);
    }

    statusTitle.textContent = "Fim de jogo";
    statusText.textContent = `Pontuacao final: ${state.score}. Maior combo: ${state.maxCombo}.`;
    statusPanel.hidden = false;
    startButton.disabled = false;
    pauseButton.disabled = true;
    pauseButton.textContent = "Pausar";
    updateHud();
    announce(`Fim de jogo. Pontuacao final ${state.score}. Maior combo ${state.maxCombo}.`);
  }

  function updateHud() {
    const stage = getSelectedStage(state);
    hud.score.textContent = String(state.score);
    hud.combo.textContent = `${state.combo}x`;
    hud.lives.textContent = String(state.lives);
    hud.level.textContent = String(state.level);
    hud.stage.textContent = stage.shortTitle;
  }

  function showFloating(text, x, y) {
    const item = document.createElement("span");
    item.className = "float-score";
    item.textContent = text;
    item.style.left = `${(x / canvas.width) * 100}%`;
    item.style.top = `${(y / canvas.height) * 100}%`;
    floatingLayer.appendChild(item);
    item.addEventListener("animationend", () => item.remove(), { once: true });
  }

  function announce(message) {
    liveRegion.textContent = message;
  }

  startButton.addEventListener("click", beginRun);
  playAgainButton.addEventListener("click", beginRun);
  pauseButton.addEventListener("click", togglePause);
  resetButton.addEventListener("click", resetToIdle);
  stageControls.addEventListener("click", (event) => {
    const button = event.target.closest("[data-stage-id]");
    if (button) {
      applyStage(button.dataset.stageId);
    }
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && state.status === GameStatus.PLAYING) {
      togglePause();
    }
  });
  window.addEventListener("resize", resizeAndRender);

  renderStageControls();
  renderTouchControls();
  resizeAndRender();
  resetToIdle();
}
