$(document).ready(function () {
  const dicas = $(".dica");
  let indiceAtual = 0;
  let intervalo;

  function mostrarDica(indice) {
    dicas.fadeOut(300);
    dicas.eq(indice).delay(300).fadeIn(300);
  }

  function avancarDica() {
    if (indiceAtual < dicas.length - 1) {
      indiceAtual++;
    } else {
      indiceAtual = 0;
    }
    mostrarDica(indiceAtual);
    reiniciarIntervalo();
  }

  function voltarDica() {
    if (indiceAtual > 0) {
      indiceAtual--;
    } else {
      indiceAtual = dicas.length - 1;
    }
    mostrarDica(indiceAtual);
    reiniciarIntervalo();
  }

  function reiniciarIntervalo() {
    clearInterval(intervalo); // Limpa o intervalo atual
    intervalo = setInterval(avancarDica, 5000); // Define um novo intervalo
  }

  $(".seta-esquerda").click(voltarDica);
  $(".seta-direita").click(avancarDica);

  mostrarDica(indiceAtual);

  // Inicie o intervalo inicial
  reiniciarIntervalo();
});
