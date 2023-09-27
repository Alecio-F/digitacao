$(document).ready(function () {
  let minhaDiv = document.querySelector(".inputD");
  let meuLabel = document.querySelector(".label");

  minhaDiv.addEventListener("click", function () {
    meuLabel.click();
  });

  const palavras =
    "Olá! Hoje é um dia especial, o aniversário de 30 anos da Maria. Ela nasceu em 15 de setembro de 1993. Para celebrar essa ocasião, planejamos uma festa incrível com muitas surpresas. O cardápio inclui pratos como Espaguete à carbonara, Frango xadrez, Torta de maçã. Também teremos música ao vivo com a banda Os Amigos do Rock. Esperamos que você possa se juntar a nós nesta festa emocionante. Por favor, confirme sua presença até sexta-feira. Atenciosamente, Equipe de organização da festa.".split(
      " "
    );
  const quantidadePalavras = palavras.length;
  const tempo = 30 * 1000;
  window.emPratica = null;

  $("#reset").click(function () {
    digitacaoTexto();
    atualizarCursorContinuamente();
    $("#palavras").css("margin-top", "0px");
    window.timer = null;
  });

  const tempoPraticaSelecionado = localStorage.getItem("tempoPratica") || "1";

  $("#tempoPratica").val(tempoPraticaSelecionado);
  const tempoSelecionado = $("#tempoPratica").val();
  tempoRestante = tempoSelecionado * 60;

  $("#tempoPratica").change(function () {
    const novoTempoSelecionado = $(this).val();
    localStorage.setItem("tempoPratica", novoTempoSelecionado);
  });

  const divAmostraTexto = $("#amostraTexto");
  divAmostraTexto.text(palavras.join(" "));

  function addClass(el, nome) {
    el.addClass(nome);
  }

  function removeClass(el, nome) {
    el.removeClass(nome);
  }

  function palavrasAleatorias() {
    const aleatorioIndex = Math.ceil(Math.random() * quantidadePalavras);
    return palavras[aleatorioIndex - 1];
  }
  let posicaoAtual = 0;

  function palavrasNaOrdem() {
    if (posicaoAtual < palavras.length) {
      const palavra = palavras[posicaoAtual];
      posicaoAtual++;
      return palavra;
    } else {
      posicaoAtual = 0;
      return palavras[posicaoAtual];
    }
  }

  function formatarPalavras(palavra) {
    const letras = palavra
      .split("")
      .map((letra) => `<span class="letra">${letra}</span>`)
      .join("");
    return `<div class="palavra">${letras}</div>`;
  }

  // mover linhas
  function moverLinhasSeNecessario() {
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

  // mover cursor
  function atualizarCursorContinuamente() {
    setInterval(function () {
      moverLinhasSeNecessario();
      const proximaLetra = $(".letra.atual");
      const proximaPalavra = $(".palavra.atual");
      const cursor = $("#cursor");
      const digitacaoDoTexto = $("#digitacaoDoTexto");
      const parentRect = digitacaoDoTexto[0].getBoundingClientRect();
      const letraRect = proximaLetra[0]?.getBoundingClientRect();
      const palavraRect = proximaPalavra[0].getBoundingClientRect();

      cursor.css("top", (letraRect || palavraRect).top - parentRect.top + "px");
      cursor.css(
        "left",
        (letraRect || palavraRect)[proximaLetra[0] ? "left" : "right"] -
          parentRect.left +
          -2 +
          "px"
      );
    });
  }

  // animação do cursor; não piscar enquanto digita e voltar a piscar quando parar a digitação
  const cursor = $("#cursor");
  const inputElement = $("#digitandoTexto");
  let isTyping = false;
  let cursorAnimationTimeout;

  inputElement.on("input", function () {
    if (!isTyping) {
      cursor.css("animation", "none");
      isTyping = true;
    }

    clearTimeout(cursorAnimationTimeout);
    cursorAnimationTimeout = setTimeout(function () {
      cursor.css("animation", "blink 0.8s infinite");
      isTyping = false;
    }, 700);
  });

  function formatarTempo(segundos) {
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;

    // Use a função `String.padStart` para adicionar um zero à esquerda, se necessário
    const minutosFormatados = minutos.toString().padStart(2);
    const segundosFormatados = segundosRestantes.toString().padStart(2, "0");

    return `${minutosFormatados}:${segundosFormatados}`;
  }

  function digitacaoTexto() {
    $("#palavras").html("");
    for (let i = 0; i < 200; i++) {
      $("#palavras").append(formatarPalavras(palavrasNaOrdem(), i));
    }
    addClass($(".palavra").first(), "atual");
    addClass($(".letra").first(), "atual");
  }

  $("#tempoS").text(formatarTempo(tempoSelecionado * 60));
  let contagemIntervalo;
  let contagemIniciada = false;
  let digitando = false;

  // Função para iniciar a contagem regressiva
  function iniciouContagem() {
    if (!contagemIniciada) {
      contagemIniciada = true;
      let tempoRestante = tempoSelecionado * 60; // Converter para segundos

      contagemIntervalo = setInterval(function () {
        if (tempoRestante > 0) {
          tempoRestante--;
          $("#tempoS").text(formatarTempo(tempoRestante));

          // Calcule o PPM em tempo real aqui
          const palavrasDigitadasNoIntervalo = $("#digitandoTexto")
            .val()
            .split(" ").length;

          if (tempoRestante > 0) {
            ppm = Math.round(
              (palavrasDigitadasNoIntervalo /
                (tempoSelecionado * 60 - tempoRestante)) *
                60
            );
          } else {
            clearInterval(contagemIntervalo);
            alert("Tempo esgotado!");
          }
          // Atualize a div com a classe 'ppm' com o valor calculado
          $(".ppm .numeros").text(ppm);
        } else {
          clearInterval(contagemIntervalo);
          alert("Tempo esgotado!");
        }
      }, 1000);
    }
  }

  // Inicio da digitação
  $("#digitandoTexto").keydown(function (ev) {
    const tecla = ev.key;
    const palavraAtual = $(".palavra.atual");
    const letraAtual = $(".letra.atual");
    const expected = letraAtual[0]?.innerHTML || " ";
    const letra = tecla.length === 1 && tecla !== " ";
    const espaco = tecla === " ";
    const deleteLetra = tecla === "Backspace";
    const primeiraLetra =
      letraAtual[0] === palavraAtual.find(".letra").first()[0];

    console.log({ tecla, expected });

    if (!digitando) {
      digitando = true;
      iniciouContagem();
      inicioDigitacao = new Date().getTime();
    }

    // letra extras incorretas
    const letraIncorreta = $(
      '<span class="letra incorreto extra"></span>'
    ).html(tecla);
    if (letra) {
      caracteresDigitados++;
      if (letraAtual[0]) {
        if (tecla === expected) {
          addClass(letraAtual, "correto");
          caracteresCorretos++;
        } else {
          addClass(letraAtual, "incorreto");
          caracteresIncorretos++;
        }
        removeClass(letraAtual, "atual");
        if (letraAtual.next()[0]) {
          addClass(letraAtual.next(), "atual");
        }
      } else {
        const letrasIncorretasAnteriores = palavraAtual.find(
          ".letra.incorreto.extra"
        );
        if (letrasIncorretasAnteriores.length > 5) {
          letrasIncorretasAnteriores.each(function (index, letra) {
            if (index === letrasIncorretasAnteriores.length - 1) {
              letra.remove();
            }
          });
        }
        palavraAtual.append(letraIncorreta);
      }
    }

    // Condicional ao digitar espaço
    if (espaco) {
      if (letraAtual.length > 0) {
        addClass(letraAtual, "incorreto");
        removeClass(letraAtual, "atual");
        if (letraAtual.next()[0]) {
          addClass(letraAtual.next(), "atual");
        }
      } else {
        removeClass(palavraAtual, "atual");
        addClass(palavraAtual.next(), "atual");
        addClass(palavraAtual.next().find(".letra").first(), "atual");
      }
    }

    // Condicional ao digitar Backspace
    if (deleteLetra) {
      const letrasDaPalavra = palavraAtual.find(".letra");

      for (let i = letrasDaPalavra.length - 1; i >= 0; i--) {
        const letra = letrasDaPalavra[i];
        if ($(letra).hasClass("incorreto") && $(letra).hasClass("extra")) {
          $(letra).remove();
          return;
        }
      }

      if (letraAtual[0] && primeiraLetra) {
        if (palavraAtual.prev()[0]) {
          removeClass(palavraAtual, "atual");
          addClass(palavraAtual.prev(), "atual");
          removeClass(letraAtual, "atual");
        }
      }

      if (letraAtual[0] && !primeiraLetra) {
        removeClass(letraAtual, "atual");
        addClass(letraAtual.prev(), "atual");
        removeClass(letraAtual.prev(), "correto");
        removeClass(letraAtual.prev(), "incorreto");
      }

      if (!letraAtual[0]) {
        addClass(palavraAtual.find(".letra").last(), "atual");
        removeClass(palavraAtual.find(".letra").last(), "correto");
        caracteresCorretos--;
        removeClass(palavraAtual.find(".letra").last(), "incorreto");
      }
    }
    atualizarPrecisao();
  });

  digitacaoTexto();
  atualizarCursorContinuamente();
});
