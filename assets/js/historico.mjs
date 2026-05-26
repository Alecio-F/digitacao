import { KEYS, MAX_HISTORY } from "./constants.mjs";

export function salvarResultado({ ppm, cpm, precisao, erros, tempo, lessonId = null, novoRecorde = false }) {
  const historico = lerHistoricoSeguro();
  historico.unshift({
    ppm,
    cpm,
    precisao,
    erros,
    tempo,
    lessonId,
    novoRecorde,
    data: new Date().toLocaleDateString("pt-BR"),
  });
  if (historico.length > MAX_HISTORY) historico.pop();
  localStorage.setItem(KEYS.historico, JSON.stringify(historico));
}

export function obterRecordePPM() {
  const historico = lerHistoricoSeguro();
  if (historico.length === 0) return 0;
  return Math.max(...historico.map((r) => Number(r.ppm) || 0));
}

function formatarDuracao(tempo) {
  const valor = Number(tempo);
  if (!Number.isFinite(valor) || valor <= 0) return "—";
  return valor >= 1 ? `${valor}min` : `${Math.round(valor * 60)}s`;
}

function escape(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[ch]));
}

export function renderizarHistorico() {
  const container = $("#historico-resultados");
  if (!container.length) return;

  const historico = lerHistoricoSeguro();

  if (historico.length === 0) {
    container.html('<p class="history-empty">Nenhum resultado ainda. Conclua um treino para ver seu histórico.</p>');
    return;
  }

  const recordePpm = Math.max(...historico.map((r) => Number(r.ppm) || 0));

  const cards = historico
    .map((r, index) => {
      const ppm = Number(r.ppm) || 0;
      const cpm = Number(r.cpm) || 0;
      const erros = Number(r.erros) || 0;
      const precisao = escape(r.precisao || "0%");
      const data = escape(r.data || "");
      const duracao = formatarDuracao(r.tempo);
      const ehRecorde = ppm > 0 && ppm === recordePpm;
      const ehAtual = index === 0;

      const classes = ["history-item"];
      if (ehAtual) classes.push("is-latest");
      if (ehRecorde) classes.push("is-record");

      const flag = ehRecorde
        ? '<span class="history-item-flag">Recorde</span>'
        : ehAtual
        ? '<span class="history-item-flag">Atual</span>'
        : "";

      return `
        <article class="${classes.join(" ")}">
          <header class="history-item-head">
            <span class="history-item-date">${data}</span>
            ${flag}
          </header>
          <div class="history-item-ppm">
            <span class="history-item-ppm-value">${ppm}</span>
            <span class="history-item-ppm-label">PPM</span>
          </div>
          <div class="history-item-meta">
            <span>${precisao}</span>
            <span>${cpm} CPM</span>
            <span>${erros} erros</span>
            <span>${duracao}</span>
          </div>
        </article>`;
    })
    .join("");

  container.html(cards);
}

function lerHistoricoSeguro() {
  try {
    const historico = JSON.parse(localStorage.getItem(KEYS.historico) || "[]");
    return Array.isArray(historico) ? historico : [];
  } catch (error) {
    return [];
  }
}
