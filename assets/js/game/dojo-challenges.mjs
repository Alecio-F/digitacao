import { KEYS } from "../constants.mjs";

const SEAL_WORDS = ["foco", "calma", "ritmo", "tecla", "panda", "dojo", "arena", "precisão", "treino"];
const SEQUENCE_SIZE = 5;
const TOTAL_SEQUENCES = 3;

export function initDojoChallenges() {
  const root = document.querySelector("[data-seal-prototype]");
  if (!root) return;

  const wordElement = root.querySelector("[data-seal-word]");
  const input = root.querySelector("[data-seal-input]");
  const comboElement = root.querySelector("[data-seal-combo]");
  const statusElement = root.querySelector("[data-seal-status]");
  const startButton = root.querySelector("[data-seal-start]");
  const scoreElement = root.querySelector("[data-seal-score]");
  const bestElement = root.querySelector("[data-seal-best]");
  const sealsElement = root.querySelector("[data-seal-list]");

  let sequence = [];
  let wordIndex = 0;
  let sequenceIndex = 1;
  let combo = 0;
  let score = 0;
  let playing = false;

  renderIdle();

  startButton?.addEventListener("click", startChallenge);
  input.addEventListener("input", handleInput);

  function startChallenge() {
    sequenceIndex = 1;
    combo = 0;
    score = 0;
    playing = true;
    startSequence();
    input.disabled = false;
    input.focus();
    updateScore();
  }

  function startSequence() {
    sequence = buildSequence();
    wordIndex = 0;
    render();
    setStatus(`Sequência ${sequenceIndex}/${TOTAL_SEQUENCES}. Ative todos os selos.`, "neutral");
  }

  function handleInput() {
    if (!playing) return;

    const currentWord = sequence[wordIndex];
    const value = input.value.trim().toLowerCase();

    if (!currentWord.startsWith(value)) {
      combo = 0;
      updateScore();
      setStatus("Erro quebrou o selo. Corrija e continue.", "danger");
      root.classList.add("is-error");
      setTimeout(() => root.classList.remove("is-error"), 220);
      return;
    }

    if (value === currentWord) {
      combo++;
      score += 100 + combo * 15;
      input.value = "";
      wordIndex++;
      updateScore();

      if (wordIndex >= sequence.length) {
        sequenceIndex++;
        if (sequenceIndex > TOTAL_SEQUENCES) {
          finishChallenge();
        } else {
          startSequence();
        }
        return;
      }

      setStatus("Selo ativado. Próxima palavra.", "success");
      render();
    }
  }

  function finishChallenge() {
    playing = false;
    input.disabled = true;
    const best = Number(localStorage.getItem(KEYS.sealBestScore) || 0);
    if (score > best) {
      localStorage.setItem(KEYS.sealBestScore, String(score));
      setStatus(`Novo recorde dos Selos: ${score} pontos.`, "success");
    } else {
      setStatus(`Desafio concluído: ${score} pontos.`, "success");
    }
    render();
    updateScore();
  }

  function renderIdle() {
    input.disabled = true;
    sequence = SEAL_WORDS.slice(0, SEQUENCE_SIZE);
    wordIndex = 0;
    render();
    updateScore();
    setStatus("Clique em Jogar protótipo para iniciar.", "neutral");
  }

  function render() {
    wordElement.textContent = playing ? sequence[wordIndex] || "completo" : "foco";
    if (sealsElement) {
      sealsElement.innerHTML = sequence
        .map((word, index) => `<span class="seal-token ${index < wordIndex ? "is-lit" : ""}">${word}</span>`)
        .join("");
    }
  }

  function updateScore() {
    comboElement.textContent = `${combo}x`;
    if (scoreElement) scoreElement.textContent = String(score);
    if (bestElement) bestElement.textContent = localStorage.getItem(KEYS.sealBestScore) || "0";
  }

  function setStatus(message, tone) {
    statusElement.textContent = message;
    statusElement.dataset.tone = tone;
  }

  function buildSequence() {
    return [...SEAL_WORDS]
      .sort(() => Math.random() - 0.5)
      .slice(0, SEQUENCE_SIZE);
  }
}
