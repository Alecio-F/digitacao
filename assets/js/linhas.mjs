 export function moverLinhasSeNecessario() {
    const palavraAtual = $(".palavra.atual");
    const digitacaoDoTexto = $("#digitacaoDoTexto");

    if (
      palavraAtual[0].getBoundingClientRect().top >
      digitacaoDoTexto[0].getBoundingClientRect().top + 35
    ) {
      const palavras = $("#palavras");
      const margin = parseInt(palavras.css("margin-top") || "0px");
      palavras.css("margin-top", margin - 28 + "px");
    }
  }