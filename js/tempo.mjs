import { salvarResultado, obterRecordePPM, renderizarHistorico } from "./historico.mjs";
import { dispararConfetes } from "./confete.mjs";
import { getTopErros } from "./estado.mjs";
import { registerTrainingResult } from "./gamification.mjs";

// ─── Persistência do seletor de tempo ────────────────────────────────────────
const tempoPraticaSalvo = localStorage.getItem("tempoPratica") || "1";
$("#tempoPratica").val(tempoPraticaSalvo);

$("#tempoPratica").change(function () {
  localStorage.setItem("tempoPratica", $(this).val());
  if (!contagemIniciada) {
    const t = parseFloat($(this).val());
    $("#tempoS").text(formatarTempo(Math.round(t * 60)));
    $("[data-live-time]").text(formatarTempo(Math.round(t * 60)));
  }
});

// ─── Utilitários ─────────────────────────────────────────────────────────────
function getTempoSelecionado() {
  return parseFloat($("#tempoPratica").val() || localStorage.getItem("tempoPratica") || "1");
}

function formatarTempo(segundos) {
  const minutos = Math.floor(segundos / 60);
  const segs = segundos % 60;
  return `${minutos.toString().padStart(2)}:${segs.toString().padStart(2, "0")}`;
}

function animarContagem(seletor, alvo, sufixo = "") {
  const el = $(seletor);
  const steps = 28;
  const intervalMs = 900 / steps;
  let step = 0;
  el.text("0" + sufixo);
  const timer = setInterval(() => {
    step++;
    const progresso = step / steps;
    // easing ease-out
    const valor = Math.round(alvo * (1 - Math.pow(1 - progresso, 3)));
    el.text(valor + sufixo);
    if (step >= steps) {
      el.text(alvo + sufixo);
      clearInterval(timer);
    }
  }, intervalMs);
}

// ─── Estado do timer ──────────────────────────────────────────────────────────
let contagemIntervalo = null;
let contagemIniciada = false;
let pausado = false;
let tempoRestante = 0;
let totalSegundos = 0;
let ppm = 0;
let pausaUsada = false;

// ─── Display inicial ──────────────────────────────────────────────────────────
const tempoInicialSegundos = Math.round(getTempoSelecionado() * 60);
$("#tempoS").text(formatarTempo(tempoInicialSegundos));
$("[data-live-time]").text(formatarTempo(tempoInicialSegundos));
$(".tempo-desempenho .numeros").text(formatarTempo(tempoInicialSegundos));

// ─── Tick (1s) ───────────────────────────────────────────────────────────────
function tick() {
  if (tempoRestante > 0) {
    tempoRestante--;
    $("#tempoS").text(formatarTempo(tempoRestante));
    $("[data-live-time]").text(formatarTempo(tempoRestante));

    // Barra de progresso
    const percentual = (tempoRestante / totalSegundos) * 100;
    $("#barra-progresso").css("width", percentual + "%");

    // PPM em tempo real
    const palavrasDigitadas = ($("#digitandoTexto").val() || "").split(" ").length;
    const tempoDecorrido = totalSegundos - tempoRestante;
    if (tempoDecorrido > 0) {
      ppm = Math.round((palavrasDigitadas / tempoDecorrido) * 60);
    }
    $("#ppm .numeros").text(ppm);
    $("[data-live-ppm]").text(ppm);

    // CPM em tempo real
    const textoDigitado = $("#digitandoTexto").val() || "";
    const minutosDecorridos = tempoDecorrido / 60;
    const cpm = minutosDecorridos > 0 ? Math.round(textoDigitado.length / minutosDecorridos) : 0;
    $("#cpm .numeros").text(cpm);
    $("[data-live-cpm]").text(cpm);
  } else {
    clearInterval(contagemIntervalo);
    contagemIntervalo = null;
    mostrarResultados();
  }
}

// ─── Mostrar resultados ───────────────────────────────────────────────────────
function mostrarResultados() {
  const ppmFinal = ppm;
  const cpmFinal = parseInt($("#cpm .numeros").text()) || 0;
  const precisaoTexto = $("#precisao .numeros").text() || "0%";
  const precisaoNum = parseInt(precisaoTexto) || 0;
  const errosFinal = parseInt($("#erros .numeros").text()) || 0;
  const tempoAtual = getTempoSelecionado();

  const recordeAnterior = obterRecordePPM();
  const ehRecorde = ppmFinal > 0 && ppmFinal > recordeAnterior;
  const topErros = getTopErros(5);

  salvarResultado({ ppm: ppmFinal, cpm: cpmFinal, precisao: precisaoTexto, erros: errosFinal, tempo: tempoAtual });
  const progressoDojo = registerTrainingResult(
    { ppm: ppmFinal, cpm: cpmFinal, precisao: precisaoTexto, erros: errosFinal, tempo: tempoAtual },
    { novoRecorde: ehRecorde, semPausa: !pausaUsada, topErros }
  );

  $(".parametros").fadeOut(195).hide();
  $(".h1Teste").fadeOut(195).hide();
  $(".dojo-typing-panel").fadeOut(195).hide();
  $(".conteinerDigita").fadeOut(200, function () {
    $(this).hide();

    // Badge de recorde
    if (ehRecorde) {
      $("#badge-recorde").show();
      $("#dojo-feedback").text("Novo recorde do Dojo!");
      document.dispatchEvent(new CustomEvent("dojo:record", { detail: { ppm: ppmFinal, cpm: cpmFinal } }));
    } else {
      $("#badge-recorde").hide();
    }

    $("#dojo-xp-gain").text(`+${progressoDojo.gainedXp} XP - Nível ${progressoDojo.level}: ${progressoDojo.title}`);

    // Animação count-up nos números
    animarContagem("#ppm .numeros", ppmFinal);
    animarContagem("#cpm .numeros", cpmFinal);
    animarContagem("#erros .numeros", errosFinal);
    animarContagem("#precisao .numeros", precisaoNum, "%");

    // Top erros por letra
    const containerErros = $("#top-erros");
    if (containerErros.length && topErros.length > 0) {
      const itens = topErros
        .map(([letra, qtd]) => `<span class="erro-letra">${letra} <small>${qtd}×</small></span>`)
        .join("");
      containerErros.html(`<strong>Teclas mais erradas:</strong> ${itens}`);
      containerErros.show();
    }

    // Histórico
    renderizarHistorico();

    $("#desempenhoTexto").fadeIn(200).show();

    if (ehRecorde) {
      setTimeout(dispararConfetes, 350);
    }
  });
}

// ─── API pública ──────────────────────────────────────────────────────────────
export function iniciouContagem() {
  if (contagemIniciada) return;
  contagemIniciada = true;
  totalSegundos = Math.round(getTempoSelecionado() * 60);
  tempoRestante = totalSegundos;
  $("#barra-progresso").css("transition", "width 1s linear");
  contagemIntervalo = setInterval(tick, 1000);
}

export function pausar() {
  if (!contagemIniciada) return null;
  pausado = !pausado;
  if (pausado) {
    pausaUsada = true;
    clearInterval(contagemIntervalo);
    contagemIntervalo = null;
  } else {
    contagemIntervalo = setInterval(tick, 1000);
  }
  return pausado;
}

export function isPausado() {
  return pausado;
}

export function resetTempo() {
  clearInterval(contagemIntervalo);
  contagemIntervalo = null;
  contagemIniciada = false;
  pausado = false;
  tempoRestante = 0;
  totalSegundos = 0;
  ppm = 0;
  pausaUsada = false;

  const t = getTempoSelecionado();
  $("#tempoS").text(formatarTempo(Math.round(t * 60)));
  $("[data-live-time]").text(formatarTempo(Math.round(t * 60)));
  $("[data-live-ppm]").text("0");
  $("[data-live-cpm]").text("0");
  $("#barra-progresso").css({ width: "100%", transition: "none" });
  $("#start").text("pause_circle");
}
