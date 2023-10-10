import { cursor} from "./cursor";
import { paramentros, calcularPrecisao } from "./paramentros";

export function textodigitacao() {
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


  function addClass(el, nome) {
    el.addClass(nome);
  }

  function removeClass(el, nome) {
    el.removeClass(nome);
  }

  function digitacaoTexto() {
    $("#palavras").html("");
    for (let i = 0; i < 200; i++) {
      $("#palavras").append(formatarPalavras(palavrasAleatorias(), i));
    }
    addClass($(".palavra").first(), "atual");
    addClass($(".letra").first(), "atual");
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
    paramentros()
    calcularPrecisao();
  });

  digitacaoTexto();
  cursor();
}
