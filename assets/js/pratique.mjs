import { KEYS } from "./constants.mjs";
import { getDojoProfile, unlockAchievement } from "./gamification.mjs";
import { getDailyMissions, updateMissionProgress } from "./dailyMissions.mjs";
import { LESSONS, getLessonById, getLessonProgress, getNextRecommendedLesson, isLessonUnlocked } from "./dojoLessons.mjs";
import { getTrainingRecommendations } from "./trainingRecommendations.mjs";
import { getStorage, setStorage } from "./utils/storage.mjs";

function applyMapState() {
  const profile = getDojoProfile();
  const recommendation = getTrainingRecommendations()[0];
  const nextLesson = getLessonById(recommendation?.targetLessonId) || getNextRecommendedLesson();

  updatePlayerCard(profile);
  renderLessons(nextLesson);
  renderMapPanels();
}

function updatePlayerCard(profile) {
  const titleEl = document.querySelector("[data-map-title]");
  const levelEl = document.querySelector("[data-map-level]");
  const xpBarEl = document.querySelector("[data-map-xp-bar]");
  const xpProgressEl = document.querySelector("[data-map-xp-progress]");
  const xpLabelEl = document.querySelector("[data-map-xp]");

  if (titleEl) titleEl.textContent = profile.title;
  if (levelEl) levelEl.textContent = `Nível ${profile.level}`;
  if (xpBarEl) xpBarEl.style.width = `${profile.progressPercent}%`;
  if (xpProgressEl) xpProgressEl.setAttribute("aria-valuenow", profile.progressPercent);
  if (xpLabelEl) xpLabelEl.textContent = `${profile.xp} XP`;
}

function renderLessons(nextLesson) {
  const trail = document.querySelector(".dojo-map-trail");
  if (!trail) return;

  const progress = getLessonProgress();
  trail.innerHTML = LESSONS.map((lesson, index) => renderLessonStep(lesson, index, progress, nextLesson)).join("");
}

function renderLessonStep(lesson, index, progress, nextLesson) {
  const state = getLessonState(lesson, progress);
  const side = index % 2 === 0 ? "left" : "right";
  const recommended = nextLesson?.id === lesson.id;
  const nodeIcon = state === "completed" ? "check_circle" : state === "locked" ? "lock" : "play_arrow";
  const medal = progress[lesson.id]?.medal;
  const medalChip = medal && medal !== "none" ? `<span class="dojo-chip special lesson-medal">${medalLabel(medal)}</span>` : "";
  const recommendedChip = recommended ? `<span class="dojo-chip success">Recomendado</span>` : "";
  const disabled = state === "locked" ? "disabled" : "";
  const ctaText = state === "completed" ? "Praticar novamente" : state === "locked" ? "Bloqueada" : "Iniciar lição";
  const stepClass = state === "completed" ? "is-completed" : state === "locked" ? "is-locked" : recommended ? "is-current" : "is-unlocked";

  const card = `
    <article class="trail-card dojo-stage-card ${recommended ? "is-recommended" : ""}">
      <header class="stage-card-head">
        <span class="stage-number">${lesson.number}</span>
        <div class="stage-chips">
          <span class="dojo-chip ${lesson.difficulty === "Difícil" ? "danger" : lesson.difficulty === "Médio" ? "special" : "success"} stage-diff-chip">${lesson.difficulty}</span>
          <span class="stage-xp-chip">+${lesson.xp} XP</span>
          ${recommendedChip}
          ${medalChip}
        </div>
      </header>
      <h3 class="stage-title">${lesson.title}</h3>
      <p class="stage-desc">${lesson.objective}</p>
      <p class="stage-focus">${lesson.focus}</p>
      <button class="dojo-card-button stage-cta" type="button" data-lesson-id="${lesson.id}" ${disabled}>${ctaText}</button>
    </article>`;

  return `
    <div class="trail-step ${stepClass}" data-phase="${index + 1}" data-lesson="${lesson.id}" role="listitem">
      ${side === "right" ? '<div class="trail-spacer"></div>' : card}
      <div class="trail-node" aria-hidden="true">
        <span class="trail-node-icon material-symbols-outlined">${nodeIcon}</span>
      </div>
      ${side === "right" ? card : '<div class="trail-spacer"></div>'}
    </div>`;
}

function renderMapPanels() {
  renderRecommendations();
  renderDailyMissions();
}

function renderRecommendations() {
  let panel = document.querySelector("[data-map-recommendations]");
  const hero = document.querySelector(".dojo-map-hero");
  if (!panel && hero) {
    panel = document.createElement("aside");
    panel.className = "dojo-panel map-recommendation-panel";
    panel.dataset.mapRecommendations = "";
    hero.after(panel);
  }
  if (!panel) return;

  const recommendation = getTrainingRecommendations()[0];
  panel.innerHTML = `
    <span class="dojo-kicker">Próximo treino recomendado</span>
    <h2>${recommendation.title}</h2>
    <p>${recommendation.message}</p>`;
}

function renderDailyMissions() {
  let panel = document.querySelector("[data-map-daily-missions]");
  const container = document.querySelector(".dojo-map-container");
  if (!panel && container) {
    panel = document.createElement("aside");
    panel.className = "dojo-panel daily-missions-panel";
    panel.dataset.mapDailyMissions = "";
    container.appendChild(panel);
  }
  if (!panel) return;

  panel.innerHTML = `
    <span class="dojo-kicker">Missões diárias</span>
    <h2>Rotina de hoje</h2>
    <div class="daily-mission-list">
      ${getDailyMissions().map((mission) => `
        <article class="daily-mission ${mission.completed ? "is-completed" : ""}">
          <strong>${mission.title}</strong>
          <span>${mission.description}</span>
          <em>${mission.completed ? "Concluída" : `${mission.progress}/${mission.target}`} · +${mission.rewardXp} XP</em>
        </article>
      `).join("")}
    </div>`;
}

function getLessonState(lesson, progress) {
  if (progress[lesson.id]?.status === "completed") return "completed";
  return isLessonUnlocked(lesson.id) ? "unlocked" : "locked";
}

function medalLabel(medal) {
  return { bronze: "Bronze", silver: "Prata", gold: "Ouro" }[medal] || "";
}

function startLesson(lessonId) {
  const lesson = LESSONS.find((item) => item.id === lessonId);
  if (!lesson || !isLessonUnlocked(lesson.id)) return;

  localStorage.setItem(KEYS.selectedLessonId, lesson.id);
  localStorage.setItem(KEYS.selectedTrainingMode, lesson.trainingMode);

  const started = new Set(getStorage(KEYS.startedLessons, []));
  started.add(lesson.id);
  setStorage(KEYS.startedLessons, [...started]);
  if (started.size >= 3) unlockAchievement("map-explorer");

  updateMissionProgress("dojo:lesson-start", { lessonId: lesson.id });
  window.location.href = "digitando.html";
}

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-lesson-id]");
  if (button) {
    startLesson(button.dataset.lessonId);
  }
});

applyMapState();
