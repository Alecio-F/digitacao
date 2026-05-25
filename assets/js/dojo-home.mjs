import { config } from "./config.mjs";
import { getDojoProfile } from "./gamification.mjs";

$(document).ready(function () {
  config();
  renderHomeProgress();
});

function renderHomeProgress() {
  const profile = getDojoProfile();
  const hasHistory = profile.history.length > 0;

  setText("[data-dojo-best-ppm]", hasHistory ? `${profile.bestPpm} PPM` : "--");
  setText("[data-dojo-precision]", hasHistory ? profile.lastPrecision : "--");
  setText("[data-dojo-level]", `Nível ${profile.level}`);
  setText("[data-dojo-title]", profile.title);
  setText("[data-dojo-xp]", `${profile.xp} XP`);
  setText("[data-dojo-streak]", `${profile.dailyStreak || 0} dia(s)`);

  const progressBar = document.querySelector("[data-dojo-progress-bar]");
  if (progressBar) {
    progressBar.style.width = `${profile.progressPercent}%`;
  }

  const progressText = document.querySelector("[data-dojo-progress-text]");
  if (progressText) {
    progressText.textContent = hasHistory
      ? `${profile.currentLevelXp}/${profile.requiredForLevel} XP para ${profile.nextTitle}`
      : "Você ainda não iniciou sua jornada. Faça seu primeiro treino.";
  }

  renderHistory(profile);
  renderMistakes(profile);
  renderAchievements(profile);
  renderRanking(profile);
}

function renderHistory(profile) {
  const container = document.querySelector("[data-dojo-history]");
  if (!container) return;

  if (profile.history.length === 0) {
    container.innerHTML = `<p class="dojo-empty">Você ainda não iniciou sua jornada. Faça seu primeiro treino.</p>`;
    return;
  }

  container.innerHTML = profile.history
    .slice(0, 4)
    .map((item) => `
      <li>
        <strong>${Number(item.ppm) || 0} PPM</strong>
        <span>${item.precisao || "0%"} de precisão</span>
      </li>
    `)
    .join("");
}

function renderMistakes(profile) {
  const container = document.querySelector("[data-dojo-mistakes]");
  if (!container) return;

  if (!profile.lastMistakes.length) {
    container.innerHTML = `<span class="dojo-chip muted">Sem erros registrados</span>`;
    return;
  }

  container.innerHTML = profile.lastMistakes
    .map(([key, amount]) => `<span class="dojo-chip danger">${key || "espaco"} x${amount}</span>`)
    .join("");
}

function renderAchievements(profile) {
  const container = document.querySelector("[data-dojo-achievements]");
  if (!container) return;

  if (!profile.achievementDetails.length) {
    container.innerHTML = `<span class="dojo-badge locked">Primeira conquista bloqueada</span>`;
    return;
  }

  container.innerHTML = profile.achievementDetails
    .slice(0, 4)
    .map((achievement) => `<span class="dojo-badge">${achievement.title}</span>`)
    .join("");
}

function renderRanking(profile) {
  const container = document.querySelector("[data-dojo-ranking]");
  if (!container) return;

  const rows = [
    {
      position: "01",
      name: "Seu recorde",
      score: profile.bestPpm ? `${profile.bestPpm} PPM` : "Sem registro",
      active: true,
    },
    { position: "02", name: "Slot local", score: "Aguardando treino" },
    { position: "03", name: "Slot local", score: "Aguardando treino" },
  ];

  container.innerHTML = rows
    .map((row) => `
      <li class="${row.active ? "is-player" : ""}">
        <span>${row.position}</span>
        <strong>${row.name}</strong>
        <em>${row.score}</em>
      </li>
    `)
    .join("");
}

function setText(selector, value) {
  const element = document.querySelector(selector);
  if (element) {
    element.textContent = value;
  }
}
