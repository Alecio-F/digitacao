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
    
}