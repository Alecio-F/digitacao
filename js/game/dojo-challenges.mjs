const SEAL_WORDS = ["foco", "ritmo", "panda", "teclado", "precisao"];

export function initDojoChallenges() {
  const root = document.querySelector("[data-seal-prototype]");
  if (!root) return;

  const wordElement = root.querySelector("[data-seal-word]");
  const input = root.querySelector("[data-seal-input]");
  const comboElement = root.querySelector("[data-seal-combo]");
  const statusElement = root.querySelector("[data-seal-status]");
  let index = 0;
  let combo = 0;

  render();

  input.addEventListener("input", () => {
    const currentWord = SEAL_WORDS[index];
    const value = input.value.trim().toLowerCase();

    if (!currentWord.startsWith(value)) {
      combo = 0;
      comboElement.textContent = "0x";
      statusElement.textContent = "Respire, corrija e retome o selo.";
      statusElement.dataset.tone = "danger";
      return;
    }

    if (value === currentWord) {
      combo++;
      index = (index + 1) % SEAL_WORDS.length;
      input.value = "";
      comboElement.textContent = `${combo}x`;
      statusElement.textContent = combo >= 3
        ? "Técnica do panda carregada."
        : "Selo ativado. Continue a sequência.";
      statusElement.dataset.tone = "success";
      render();
    }
  });

  function render() {
    wordElement.textContent = SEAL_WORDS[index];
  }
}
