$(document).ready(function () {
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

  const palavras =
    "casa amor feliz trabalho cidade carro família sol comida rua escola dinheiro gato cachorro rua livro amigo café dia noite amor música filme viagem chuva montanha árvore festa criança jovem velho escola praia mar rio felicidade tristeza computador celular televisão notícia foto comida bebida encontro jantar almoço café da manhã lanche escola universidade professor estudante escritório reunião projeto recompensa desafio conquista esforço sucesso falha vitória derrota argumento opinião política governo democracia liberdade direitos humanos paz guerra casamento divórcio namoro paquera flerte mensagem telefonema reunião conferência estudo aprendizado experiência testemunha crime investigação polícia prisão julgamento sentença juiz júri verdade mentira história romance poesia pintura escultura arte artista música dança teatro ator atriz espetáculo plateia público aplausos palco luz som maquiagem figurino cena beijo abraço sorriso lágrima medo coragem felicidade tristeza surpresa alegria raiva desprezo saudade memória sonho desejo esperança futuro presente passado vida morte nascimento despedida encontro separação viuvez".split(
      " "
    );
  const quantidadePalavras = palavras.length;
  const tempo = 30 * 1000;
  window.emPratica = null;
  let letrasDigitadas = [];
let totalLetrasCorretas = 0;
let totalLetrasIncorretas = 0;


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

    const minutosFormatados = minutos.toString().padStart(2);
    const segundosFormatados = segundosRestantes.toString().padStart(2, "0");

    return `${minutosFormatados}:${segundosFormatados}`;
  }

  function digitacaoTexto() {
    $("#palavras").html("");
    for (let i = 0; i < 200; i++) {
      $("#palavras").append(formatarPalavras(palavrasAleatorias(), i));
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

          // Calcule o PPM em tempo real
          const palavrasDigitadasNoIntervalo = $("#digitandoTexto")
            .val()
            .split(" ").length;

          if (tempoRestante > 0) {
            ppm = Math.round(
              (palavrasDigitadasNoIntervalo /
                (tempoSelecionado * 60 - tempoRestante)) *
                60
            );
          }
          $(".ppm .numeros").text(ppm);
        } else {
          clearInterval(contagemIntervalo);
          $('.paramentros.conteinerDigita').hide();
          $('#desempenhoTexto').show();
        }
      }, 1000);
    }
  }

  // cálcular precisão
  function calcularPrecisao() {
    const letras = $(".letra");
    let totalLetrasCorretas = 0;
    let totalLetrasIncorretas = 0;
  
    letras.each(function () {
      const letra = $(this);
  
      if (letra.hasClass("correto")) {
        totalLetrasCorretas++;
      } else if (letra.hasClass("incorreto")) {
        totalLetrasIncorretas++;
      }
    });
  
    const totalLetrasDigitadas = totalLetrasCorretas + totalLetrasIncorretas;
  
    if (totalLetrasDigitadas > 0) {
      const precisao = (totalLetrasCorretas / totalLetrasDigitadas) * 100;
      $(".precisao .numeros").text(precisao.toFixed(0) + '%');
    } else {
      $(".precisao .numeros").text("0%");
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
      if (letraAtual[0]) {
        if (tecla === expected) {
            totalLetrasCorretas++;       
          addClass(letraAtual, "correto");
        } else {
            totalLetrasIncorretas++;
            letrasDigitadas.unshift(tecla);
          addClass(letraAtual, "incorreto");
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
          totalLetrasIncorretas--;
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
        removeClass(palavraAtual.find(".letra").last(), "incorreto");
      }
    }
    calcularPrecisao();
  });

  digitacaoTexto();
  atualizarCursorContinuamente();
});
