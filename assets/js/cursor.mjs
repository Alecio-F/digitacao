import { moverLinhasSeNecessario } from "./linhas.mjs";

let cursorLoopStarted = false;
let cursorAnimationTimeout = null;

export function atualizarCursorContinuamente() {
  bindCursorTypingState();
  if (cursorLoopStarted) return;
  cursorLoopStarted = true;

  function loop() {
    if (document.hidden) {
      requestAnimationFrame(loop);
      return;
    }

    moverLinhasSeNecessario();

    const cursor = document.getElementById("cursor");
    const digitacaoDoTexto = document.getElementById("digitacaoDoTexto");
    const target = getCursorTarget();

    if (cursor && digitacaoDoTexto && target) {
      const rect = target.element.getBoundingClientRect();
      const parentRect = digitacaoDoTexto.getBoundingClientRect();
      const cursorWidth = cursor.offsetWidth || 4;
      const cursorHeight = Math.max(24, Math.round(rect.height * 0.92));
      const edgeX = target.atEnd ? rect.right : rect.left;
      const x = edgeX - parentRect.left + (target.atEnd ? 1 : -cursorWidth - 1);
      const y = rect.top - parentRect.top + (rect.height - cursorHeight) / 2;

      cursor.style.setProperty("--cursor-x", `${Math.round(x)}px`);
      cursor.style.setProperty("--cursor-y", `${Math.round(y)}px`);
      cursor.style.setProperty("--cursor-height", `${cursorHeight}px`);
      cursor.classList.add("is-visible");
    } else if (cursor) {
      cursor.classList.remove("is-visible");
    }

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}

function getCursorTarget() {
  const currentLetter = document.querySelector(".palavra.atual .letra.atual");
  if (currentLetter) {
    return { element: currentLetter, atEnd: false };
  }

  const currentWord = document.querySelector(".palavra.atual");
  const lastLetter = currentWord?.querySelector(".letra:last-child");
  return lastLetter ? { element: lastLetter, atEnd: true } : null;
}

function bindCursorTypingState() {
  const cursor = document.getElementById("cursor");
  const inputElement = document.getElementById("digitandoTexto");
  if (!cursor || !inputElement || inputElement.dataset.cursorBound === "true") return;

  inputElement.dataset.cursorBound = "true";
  cursor.classList.add("is-idle");

  inputElement.addEventListener("input", () => {
    cursor.classList.add("is-typing");
    cursor.classList.remove("is-idle");

    clearTimeout(cursorAnimationTimeout);
    cursorAnimationTimeout = setTimeout(() => {
      cursor.classList.remove("is-typing");
      cursor.classList.add("is-idle");
    }, 700);
  });
}
