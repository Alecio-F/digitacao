import { eventos } from "./eventos.mjs";
import { atualizarCursorContinuamente } from "./cursor.mjs";
import { calcularPrecisao } from "./paramentros.mjs";
import { palavrasAleatorias, formatarPalavras } from "./palavras.mjs";
import { moverLinhasSeNecessario } from "./linhas.mjs";
import { iniciouContagem, isPausado, resetTempo } from "./tempo.mjs";
import { registrarErro, resetarEstado } from "./estado.mjs";

export function textodigitacao() {
  let totalLetrasCorretas = 0;
  let totalLetrasIncorretas = 0;
  let comboAtual = 0;
  let digitando = false;
  window.emPratica = null;

  eventos();

  function addClass(el, nome) { el.addClass(nome); }
  function removeClass(el, nome) { el.removeClass(nome); }
  function atualizarCombo() {
    $("#dojo-combo-value").text(`${comboAtual}x`);
  }
  function feedbackDojo(mensagem, tom = "neutral") {
    $("#dojo-feedback")
      .attr("data-tone", tom)
      .text(mensagem)
      .addClass("is-pulsing");
    setTimeout(() => $("#dojo-feedback").removeClass("is-pulsing"), 430);
  }
  function emitirEventoDojo(nome, detalhe = {}) {
    document.dispatchEvent(new CustomEvent(nome, { detail: detalhe }));
  }

  function digitacaoTexto() {
    $("#palavras").html("");
    $("#amostraTexto").html("");

    for (let i = 0; i < 200; i++) {
      const palavraFormatada = formatarPalavras(palavrasAleatorias());
      $("#palavras").append(palavraFormatada);
      $("#amostraTexto").append(palavraFormatada);
    }
    addClass($(".palavra").first(), "atual");
    addClass($(".letra").first(), "atual");
  }

  // ─── Handler de digitação ──────────────────────────────────────────────────
  $("#digitandoTexto").on("input keydown", function (ev) {
    if (isPausado()) return;

    const tecla = ev.key;
    const palavraAtual = $(".palavra.atual");
    const letraAtual = $(".letra.atual");
    const expected = letraAtual[0]?.innerHTML || " ";
    const ehLetra = tecla.length === 1 && tecla !== " ";
    const ehEspaco = tecla === " ";
    const ehBackspace = tecla === "Backspace";
    const primeiraLetra = letraAtual[0] === palavraAtual.find(".letra").first()[0];

    if (!digitando) {
      digitando = true;
      iniciouContagem();
    }

    // ── Letra normal ────────────────────────────────────────────────────────
    if (ehLetra) {
      if (letraAtual[0]) {
        if (tecla === expected) {
          totalLetrasCorretas++;
          comboAtual++;
          addClass(letraAtual, "correto");
          addClass(letraAtual, "char-correct");
          emitirEventoDojo("dojo:typing-success", { key: tecla, combo: comboAtual });
          if (comboAtual > 0 && comboAtual % 12 === 0) {
            feedbackDojo("Boa sequência! Mantenha o ritmo.", "success");
            if (comboAtual >= 24) feedbackDojo("Combo ativo!", "success");
          }
        } else {
          totalLetrasIncorretas++;
          comboAtual = 0;
          registrarErro(expected);
          addClass(letraAtual, "incorreto");
          addClass(letraAtual, "char-wrong");
          feedbackDojo("Quase. Respire e continue.", "danger");
          emitirEventoDojo("dojo:typing-error", { key: tecla, expected });
        }
        atualizarCombo();
        removeClass(letraAtual, "atual");
        if (letraAtual.next()[0]) addClass(letraAtual.next(), "atual");
      } else {
        // letra extra além do fim da palavra
        const extras = palavraAtual.find(".letra.incorreto.extra");
        if (extras.length >= 5) return;
        totalLetrasIncorretas++;
        comboAtual = 0;
        registrarErro(" ");
        palavraAtual.append($('<span class="letra incorreto extra char-extra"></span>').html(tecla));
        atualizarCombo();
        feedbackDojo("Quase. Respire e continue.", "danger");
        emitirEventoDojo("dojo:typing-error", { key: tecla, expected: " " });
      }
    }

    // ── Espaço ──────────────────────────────────────────────────────────────
    if (ehEspaco) {
      if (letraAtual.length > 0) {
        comboAtual = 0;
        addClass(letraAtual, "incorreto");
        addClass(letraAtual, "char-wrong");
        removeClass(letraAtual, "atual");
        if (letraAtual.next()[0]) addClass(letraAtual.next(), "atual");
        atualizarCombo();
        feedbackDojo("Finalize a palavra antes de avançar.", "danger");
        emitirEventoDojo("dojo:typing-error", { key: " ", expected });
      } else {
        removeClass(palavraAtual, "atual");
        addClass(palavraAtual.next(), "atual");
        addClass(palavraAtual.next().find(".letra").first(), "atual");
      }
    }

    // ── Backspace ────────────────────────────────────────────────────────────
    if (ehBackspace) {
      const letrasDaPalavra = palavraAtual.find(".letra");

      // 1. remover letra extra
      for (let i = letrasDaPalavra.length - 1; i >= 0; i--) {
        const l = letrasDaPalavra[i];
        if ($(l).hasClass("incorreto") && $(l).hasClass("extra")) {
          $(l).remove();
          totalLetrasIncorretas--;
          calcularPrecisao(totalLetrasCorretas, totalLetrasIncorretas);
          return;
        }
      }

      // 2. primeira letra da palavra → voltar palavra
      if (letraAtual[0] && primeiraLetra) {
        if (palavraAtual.prev()[0]) {
          removeClass(palavraAtual, "atual");
          addClass(palavraAtual.prev(), "atual");
          removeClass(letraAtual, "atual");
        }
        calcularPrecisao(totalLetrasCorretas, totalLetrasIncorretas);
        return;
      }

      // 3. letra do meio → desfaz a anterior
      if (letraAtual[0] && !primeiraLetra) {
        const prev = letraAtual.prev();
        if (prev.hasClass("correto")) totalLetrasCorretas--;
        else if (prev.hasClass("incorreto")) totalLetrasIncorretas--;
        removeClass(letraAtual, "atual");
        addClass(prev, "atual");
        removeClass(prev, "correto");
        removeClass(prev, "incorreto");
      }

      // 4. cursor no fim da palavra → desfaz a última
      if (!letraAtual[0]) {
        const ultima = palavraAtual.find(".letra").last();
        if (ultima.hasClass("correto")) totalLetrasCorretas--;
        else if (ultima.hasClass("incorreto")) totalLetrasIncorretas--;
        addClass(ultima, "atual");
        removeClass(ultima, "correto");
        removeClass(ultima, "incorreto");
      }
    }

    calcularPrecisao(totalLetrasCorretas, totalLetrasIncorretas);
  });

  // ─── Reiniciar sem recarregar a página ────────────────────────────────────
  function reiniciar() {
    totalLetrasCorretas = 0;
    totalLetrasIncorretas = 0;
    comboAtual = 0;
    digitando = false;

    resetarEstado();
    resetTempo();

    $("#palavras").css("margin-top", "0px");
    $("#digitandoTexto").val("");
    digitacaoTexto();
    calcularPrecisao(0, 0);
    atualizarCombo();
    feedbackDojo("Digite a primeira palavra para iniciar o desafio.", "neutral");

    $("#desempenhoTexto").hide();
    $("#badge-recorde").hide();
    $("#top-erros").hide();
    $(".parametros").show();
    $(".h1Teste").show();
    $(".dojo-typing-panel").show();
    $(".conteinerDigita").css("opacity", "1").show();
  }

  digitacaoTexto();
  atualizarCombo();
  feedbackDojo("Digite a primeira palavra para iniciar o desafio.", "neutral");
  atualizarCursorContinuamente();
  moverLinhasSeNecessario();

  return { reiniciar };
}
