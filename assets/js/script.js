$(document).ready(function () {
    const pontosDica = $(".ponto-dica");
    const dicas = $(".dica");
  
    // Inicialmente, exiba a primeira dica e marque o primeiro ponto como ativo
    mostrarDica(0);
  
    pontosDica.on("click", function () {
      const indice = $(this).index();
      
      // Oculte todas as dicas e remova a classe ativa de todos os pontos
      dicas.hide();
      pontosDica.removeClass("ativo");
  
      // Mostre a dica selecionada e marque o ponto correspondente como ativo
      mostrarDica(indice);
      $(this).addClass("ativo");
    });
  
    function mostrarDica(indice) {
      dicas.eq(indice).show();
    }
  });
  