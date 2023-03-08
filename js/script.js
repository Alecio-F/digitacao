let texto = $("#texto").text().trim()

$("#input-texto").on("keypress", function(event) {
  let tecla = event.key;
  if (texto.startsWith(tecla)) {
    texto = texto.slice(1)
    $("#texto").text(texto)
  }
})
