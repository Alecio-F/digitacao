$(document).ready(function () {
  const dicas = $(".dica");
  let indiceAtual = 0;
  let intervalo;
  let podeClicar = true;

  function mostrarDica(indice) {
    dicas.fadeOut(300);
    dicas.eq(indice).delay(300).fadeIn(300);
  }

  function avancarDica() {
    if (!podeClicar) {
      return; // Impede a ação se não for possível clicar
    }

    if (indiceAtual < dicas.length - 1) {
      indiceAtual++;
    } else {
      indiceAtual = 0;
    }
    mostrarDica(indiceAtual);
    reiniciarIntervalo();
    bloquearClique();
  }

  function voltarDica() {
    if (!podeClicar) {
      return; // Impede a ação se não for possível clicar
    }

    if (indiceAtual > 0) {
      indiceAtual--;
    } else {
      indiceAtual = dicas.length - 1;
    }
    mostrarDica(indiceAtual);
    reiniciarIntervalo();
    bloquearClique();
  }

  function bloquearClique() {
    podeClicar = false;
    setTimeout(function () {
      podeClicar = true; // Reabilita o clique após o atraso de 300ms
    }, 600);
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
