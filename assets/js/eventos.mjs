export function eventos() {
  let minhaDiv = document.querySelector(".inputD");
  let meuLabel = document.querySelector(".label");

  minhaDiv.addEventListener("click", function () {
    meuLabel.click();
  });

  // Manipulador de cliques para o botão #reset
  $("#reset").click(function () {
    if ($(this).closest(".testeDigita").length > 0) {
      location.reload();
    }
  });

  $("#reset").click(function () {
    digitacaoTexto();
    atualizarCursorContinuamente();
    $("#palavras").css("margin-top", "0px");
    window.timer = null;
  });

  const btnFazerNovamente = document.querySelector(
    "#proxima-acao .acao:nth-child(1)"
  );
  btnFazerNovamente.addEventListener("click", function () {

    location.reload();
  });

  const btnProximoTexto = document.querySelector(
    "#proxima-acao .acao:nth-child(2)"
  );
  btnProximoTexto.addEventListener("click", function () {
    location.reload();
  });
}
