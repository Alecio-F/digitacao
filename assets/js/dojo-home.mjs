import { config } from "./config.mjs";
import { getDojoProfile } from "./gamification.mjs";
import { getDailyMissions } from "./dailyMissions.mjs";
import { getTrainingRecommendations } from "./trainingRecommendations.mjs";

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
  renderHomeRecommendations();
  renderHomeMissions();
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

function renderHomeRecommendations() {
  let container = document.querySelector("[data-home-recommendations]");
  const progressPanel = document.querySelector("#progresso .dojo-panel");
  if (!container && progressPanel) {
    container = document.createElement("section");
    container.className = "home-smart-panel";
    container.dataset.homeRecommendations = "";
    progressPanel.appendChild(container);
  }
  if (!container) return;

  const recommendation = getTrainingRecommendations()[0];
  const href = recommendation.targetPage
    ? recommendation.targetPage.replace("./", "page/")
    : "page/pratique.html";
  container.innerHTML = `
    <h3>Próximo treino recomendado</h3>
    <article class="recommendation-card">
      <strong>${recommendation.title}</strong>
      <p>${recommendation.message}</p>
      <a class="dojo-card-button" href="${href}">Abrir treino</a>
    </article>`;
}

function renderHomeMissions() {
  let container = document.querySelector("[data-home-daily-missions]");
  const rankingPanel = document.querySelector("[aria-labelledby='ranking-title']");
  if (!container && rankingPanel) {
    container = document.createElement("section");
    container.className = "home-smart-panel";
    container.dataset.homeDailyMissions = "";
    rankingPanel.appendChild(container);
  }
  if (!container) return;

  container.innerHTML = `
    <h3>Missões de hoje</h3>
    <div class="daily-mission-list compact">
      ${getDailyMissions().slice(0, 3).map((mission) => `
        <article class="daily-mission ${mission.completed ? "is-completed" : ""}">
          <strong>${mission.title}</strong>
          <span>${mission.completed ? "Concluída" : mission.description}</span>
        </article>
      `).join("")}
    </div>`;
}

function setText(selector, value) {
  const element = document.querySelector(selector);
  if (element) {
    element.textContent = value;
  }
}
