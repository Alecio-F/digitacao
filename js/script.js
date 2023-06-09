$(document).ready(function() {
  var girou = false;

  $("#config").click(function() {
    if (!girou) {
      $(this).css("transform", "rotate(20deg)");
      girou = true;
    } else {
      $(this).css("transform", "rotate(0deg)");
      girou = false;
    }
  });
});

$(document).ready(function() {
  $('#inputConfig').change(function() {
    if ($(this).is(':checked')) {
      $('.menu-engrenagem').removeClass('hide').addClass('show');
    } else {
      $('.menu-engrenagem').removeClass('show').addClass('hide');
    }
  });
});




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
