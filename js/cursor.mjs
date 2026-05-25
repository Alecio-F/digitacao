import { moverLinhasSeNecessario } from "./linhas.mjs";

export function atualizarCursorContinuamente() {
  function loop() {
    moverLinhasSeNecessario();
    const proximaLetra = $(".letra.atual");
    const proximaPalavra = $(".palavra.atual");
    const cursor = $("#cursor");
    const digitacaoDoTexto = $("#digitacaoDoTexto");

    if (proximaPalavra[0] && digitacaoDoTexto[0]) {
      const parentRect = digitacaoDoTexto[0].getBoundingClientRect();
      const letraRect = proximaLetra[0]?.getBoundingClientRect();
      const palavraRect = proximaPalavra[0].getBoundingClientRect();

      cursor.css("top", (letraRect || palavraRect).top - parentRect.top + "px");
      cursor.css(
        "left",
        (letraRect || palavraRect)[proximaLetra[0] ? "left" : "right"] -
          parentRect.left - 2 + "px"
      );
    }

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}

// animação do cursor: não pisca durante a digitação, retoma 700ms após parar
const cursor = $("#cursor");
const inputElement = $("#digitandoTexto");
let isTyping = false;
let cursorAnimationTimeout;

inputElement.on("input", function () {
  if (!isTyping) {
    cursor.css("animation", "none");
    isTyping = true;
  }

  clearTimeout(cursorAnimationTimeout);
  cursorAnimationTimeout = setTimeout(function () {
    cursor.css("animation", "blink 0.8s infinite");
    isTyping = false;
  }, 700);
});
