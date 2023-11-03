// mover cursor
export function atualizarCursorContinuamente() {
  setInterval(function () {
    moverLinhasSeNecessario();
    const proximaLetra = $(".letra.atual");
    const proximaPalavra = $(".palavra.atual");
    const cursor = $("#cursor");
    const digitacaoDoTexto = $("#digitacaoDoTexto");
    const parentRect = digitacaoDoTexto[0].getBoundingClientRect();
    const letraRect = proximaLetra[0]?.getBoundingClientRect();
    const palavraRect = proximaPalavra[0].getBoundingClientRect();

    cursor.css("top", (letraRect || palavraRect).top - parentRect.top + "px");
    cursor.css(
      "left",
      (letraRect || palavraRect)[proximaLetra[0] ? "left" : "right"] -
        parentRect.left +
        -2 +
        "px"
    );
  });
}

// animação do cursor; não piscar enquanto digita e voltar a piscar quando parar a digitação
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
