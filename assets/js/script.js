function removerAcentos(texto) {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }
  
  let texto = $("#texto").text().trim();
  
  $("#input-texto").on("keyup", function(event) {
    let tecla = removerAcentos(event.key);
    let primeiraLetra = removerAcentos(texto[0]);
    if (primeiraLetra === tecla) {
      texto = texto.slice(1);
      $("#texto").text(texto);
      $(this).val("");
    }
  });
  