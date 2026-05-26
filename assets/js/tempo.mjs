import { salvarResultado, obterRecordePPM, renderizarHistorico } from "./historico.mjs";
import { dispararConfetes } from "./confete.mjs";
import { getTopErros, getMaxCombo } from "./estado.mjs";
import { registerTrainingResult } from "./gamification.mjs";
import { KEYS, TOP_ERRORS_COUNT } from "./constants.mjs";
import { completeLesson, getLessonById } from "./dojoLessons.mjs";
import { updateMissionProgress } from "./dailyMissions.mjs";
import { generateTrainingRecommendations } from "./trainingRecommendations.mjs";

// ─── Persistência do seletor de tempo ────────────────────────────────────────
const tempoPraticaSalvo = localStorage.getItem(KEYS.tempoPratica) || "1";
$("#tempoPratica").val(tempoPraticaSalvo);

$("#tempoPratica").change(function () {
  localStorage.setItem(KEYS.tempoPratica, $(this).val());
  if (!contagemIniciada) {
    const t = parseFloat($(this).val());
    $("#tempoS").text(formatarTempo(Math.round(t * 60)));
    $("[data-live-time]").text(formatarTempo(Math.round(t * 60)));
  }
});

// ─── Utilitários ─────────────────────────────────────────────────────────────
function getTempoSelecionado() {
  return parseFloat($("#tempoPratica").val() || localStorage.getItem(KEYS.tempoPratica) || "1");
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

// ─── Recomendação adaptativa ──────────────────────────────────────────────────
function gerarRecomendacao({ precision, ppm, topErros }) {
  if (Array.isArray(topErros) && topErros.length >= 3 && (topErros[0]?.[1] || 0) >= 4) {
    const letras = topErros
      .slice(0, 3)
      .map(([letra]) => (letra === " " ? "Espaço" : letra.toUpperCase()))
      .join(", ");
    return {
      text: `Você errou mais nas teclas ${letras}. Reforce essas teclas no Mapa do Dojo.`,
      href: "pratique.html",
      linkText: "Ir para o Mapa",
    };
  }
  if (precision > 0 && precision < 85) {
    return {
      text: "Precisão abaixo de 85%. Diminua o ritmo e foque em digitar cada letra corretamente.",
      href: "aprenda.html",
      linkText: "Ver dicas de precisão",
    };
  }
  if (precision >= 90 && ppm > 0 && ppm < 35) {
    return {
      text: "Boa precisão! Agora foque em ritmo — treine reflexo com o Panda Keys.",
      href: "game.html",
      linkText: "Abrir Arcade",
    };
  }
  if (precision >= 92 && ppm >= 60) {
    return {
      text: "Excelente combinação de ritmo e precisão. Tente aumentar a duração do treino.",
      href: null,
      linkText: null,
    };
  }
  return {
    text: "Continue praticando todo dia — a consistência é o segredo do Dojo.",
    href: null,
    linkText: null,
  };
}

function aplicarRecomendacao(recomendacao) {
  const card = document.querySelector("[data-result-recommendation]");
  const text = document.querySelector("[data-recommendation-text]");
  const link = document.querySelector("[data-recommendation-link]");
  if (!card || !text || !link) return;

  text.textContent = recomendacao.text;

  if (recomendacao.href && recomendacao.linkText) {
    link.href = recomendacao.href;
    link.textContent = recomendacao.linkText;
    link.hidden = false;
  } else {
    link.hidden = true;
  }

  card.hidden = false;
}

function aplicarRecomendacaoInteligente(recomendacoes) {
  const principal = recomendacoes?.[0];
  if (!principal) return;

  aplicarRecomendacao({
    text: principal.message,
    href: principal.targetPage?.replace("./", "") || null,
    linkText: principal.targetLessonId ? "Ir para o Mapa" : "Treinar agora",
  });
}

function renderLessonResult(lessonResult) {
  if (!lessonResult) return;

  let medal = document.querySelector("[data-lesson-medal]");
  if (!medal) {
    medal = document.createElement("div");
    medal.className = "lesson-medal dojo-chip special";
    medal.dataset.lessonMedal = "";
    document.querySelector(".result-header")?.appendChild(medal);
  }

  const labels = { bronze: "Bronze", silver: "Prata", gold: "Ouro", none: "Sem medalha" };
  medal.textContent = `${lessonResult.lesson.title}: ${labels[lessonResult.medal] || "Sem medalha"}`;
}

function renderCompletedMissions(missions) {
  if (!missions?.length) return;

  let container = document.querySelector("[data-daily-mission-completed]");
  if (!container) {
    container = document.createElement("div");
    container.className = "daily-mission-completed";
    container.dataset.dailyMissionCompleted = "";
    document.querySelector("[data-result-recommendation]")?.after(container);
  }

  container.innerHTML = missions
    .map((mission) => `<span class="dojo-chip success">Missão concluída: ${mission.title} (+${mission.rewardXp} XP)</span>`)
    .join("");
}

// ─── Mostrar resultados ───────────────────────────────────────────────────────
function mostrarResultados() {
  const ppmFinal = ppm;
  const cpmFinal = parseInt($("#cpm .numeros").text()) || 0;
  const precisaoTexto = $("#precisao .numeros").text() || "0%";
  const precisaoNum = parseInt(precisaoTexto) || 0;
  const errosFinal = parseInt($("#erros .numeros").text()) || 0;
  const tempoAtual = getTempoSelecionado();
  const comboMax = getMaxCombo();

  const recordeAnterior = obterRecordePPM();
  const ehRecorde = ppmFinal > 0 && ppmFinal > recordeAnterior;
  const topErros = getTopErros(TOP_ERRORS_COUNT);

  const selectedLessonId = localStorage.getItem(KEYS.selectedLessonId);
  const selectedLesson = getLessonById(selectedLessonId);
  const resultPayload = {
    ppm: ppmFinal,
    cpm: cpmFinal,
    precisao: precisaoTexto,
    erros: errosFinal,
    tempo: tempoAtual,
    lessonId: selectedLessonId || null,
    novoRecorde: ehRecorde,
  };

  salvarResultado(resultPayload);
  const progressoDojo = registerTrainingResult(
    resultPayload,
    { novoRecorde: ehRecorde, semPausa: !pausaUsada, topErros, combo: comboMax }
  );
  const lessonResult = selectedLesson ? completeLesson(selectedLesson.id, resultPayload) : null;
  const completedMissions = [
    ...updateMissionProgress("training:complete", resultPayload),
    ...(ehRecorde ? updateMissionProgress("training:record", resultPayload) : []),
  ];
  const recomendacoes = generateTrainingRecommendations();

  $(".parametros").fadeOut(195).hide();
  $(".dojo-typing-panel").fadeOut(195).hide();
  $(".arena-progress").fadeOut(195).hide();
  $(".dojo-keyboard").fadeOut(195).hide();
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

    // Nível e título separados, XP destacado
    $("[data-result-level]").text(`Nível ${progressoDojo.level} · ${progressoDojo.title}`);
    const xpExtra = (lessonResult?.xpAward || 0) + completedMissions.reduce((sum, mission) => sum + (mission.rewardXp || 0), 0);
    $("[data-result-xp]").text(`+${progressoDojo.gainedXp + xpExtra} XP`);

    // Combo final
    $("[data-result-combo]").text(`${comboMax}x`);

    // Animação count-up nos números
    animarContagem("#ppm .numeros", ppmFinal);
    animarContagem("#cpm .numeros", cpmFinal);
    animarContagem("#erros .numeros", errosFinal);
    animarContagem("#precisao .numeros", precisaoNum, "%");

    // Top erros por letra
    const containerErros = $("#top-erros");
    if (containerErros.length && topErros.length > 0) {
      const itens = topErros
        .map(([letra, qtd]) => {
          const display = letra === " " ? "␣" : letra;
          return `<span class="erro-letra">${display} <small>${qtd}×</small></span>`;
        })
        .join("");
      containerErros.html(`<strong>Teclas mais erradas:</strong> ${itens}`);
      containerErros.css("display", "flex");
    } else if (containerErros.length) {
      containerErros.hide();
    }

    // Recomendação adaptativa
    aplicarRecomendacaoInteligente(recomendacoes);
    renderLessonResult(lessonResult);
    renderCompletedMissions(completedMissions);

    // Histórico
    renderizarHistorico({ ppmFinal });

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
