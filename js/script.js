
$(document).ready(function() {
  // Seleciona o input pelo ID
  var input = $('#digitandoTexto');
  
  // Seleciona o parágrafo pelo ID
  var texto = $('.textoParaDigitar');
  
  // Adiciona um evento de teclado ao input
  input.on('keyup', function(event) {
    var valor = input.val(); // Obtém o valor atual do input
    var primeiraLetra = valor.charAt(0); // Obtém a primeira letra do valor
    
    // Verifica se a primeira letra é igual à tecla pressionada
    if (primeiraLetra.toLowerCase() === event.key.toLowerCase()) {
      // Atualiza o texto e o valor do input
      texto.text(texto.text().substring(1)); // Remove a primeira letra do texto
      input.val(valor.substring(1)); // Remove a primeira letra do valor do input
    }
  });
})
