export function salvarResultado({ ppm, cpm, precisao, erros, tempo }) {
  const historico = JSON.parse(localStorage.getItem("historico") || "[]");
  historico.unshift({
    ppm,
    cpm,
    precisao,
    erros,
    tempo,
    data: new Date().toLocaleDateString("pt-BR"),
  });
  if (historico.length > 10) historico.pop();
  localStorage.setItem("historico", JSON.stringify(historico));
}

export function obterRecordePPM() {
  const historico = JSON.parse(localStorage.getItem("historico") || "[]");
  if (historico.length === 0) return 0;
  return Math.max(...historico.map((r) => r.ppm));
}

export function renderizarHistorico() {
  const container = $("#historico-resultados");
  if (!container.length) return;

  const historico = JSON.parse(localStorage.getItem("historico") || "[]");

  if (historico.length === 0) {
    container.html("<p>Nenhum resultado ainda.</p>");
    return;
  }

  const linhas = historico
    .map(
      (r, i) => `
      <tr class="${i === 0 ? "historico-atual" : ""}">
        <td>${r.data}</td>
        <td>${r.ppm}</td>
        <td>${r.cpm}</td>
        <td>${r.precisao}</td>
        <td>${r.erros}</td>
        <td>${r.tempo >= 1 ? r.tempo + "min" : Math.round(r.tempo * 60) + "s"}</td>
      </tr>`
    )
    .join("");

  container.html(`
    <table class="historico-tabela">
      <thead>
        <tr>
          <th>Data</th><th>PPM</th><th>CPM</th><th>Precisão</th><th>Erros</th><th>Duração</th>
        </tr>
      </thead>
      <tbody>${linhas}</tbody>
    </table>
  `);
}
