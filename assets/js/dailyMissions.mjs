import { KEYS } from "./constants.mjs";
import { getStorage, setStorage } from "./utils/storage.mjs";
import { awardXp, unlockAchievement } from "./gamification.mjs";

const DAILY_MISSION_TEMPLATES = Object.freeze([
  { id: "quick-training", title: "Treino rápido", description: "Complete 1 treino na Type Arena", rewardXp: 30, target: 1 },
  { id: "precision-90", title: "Precisão", description: "Faça um treino com pelo menos 90% de precisão", rewardXp: 50, target: 1 },
  { id: "arcade-play", title: "Arcade", description: "Jogue Panda Keys uma vez", rewardXp: 40, target: 1 },
  { id: "dojo-map", title: "Mapa do Dojo", description: "Inicie uma fase do Mapa do Dojo", rewardXp: 30, target: 1 },
  { id: "match-best-ppm", title: "Evolução", description: "Bata ou iguale seu melhor PPM", rewardXp: 80, target: 1 },
]);

export function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function generateDailyMissions() {
  return DAILY_MISSION_TEMPLATES.map((mission) => ({
    ...mission,
    progress: 0,
    completed: false,
    rewarded: false,
  }));
}

export function resetDailyMissionsIfNeeded() {
  const today = getTodayKey();
  const storedDate = localStorage.getItem(KEYS.missionDate);
  if (storedDate !== today) {
    setStorage(KEYS.dailyMissions, generateDailyMissions());
    localStorage.setItem(KEYS.missionDate, today);
  }
}

export function getDailyMissions() {
  resetDailyMissionsIfNeeded();
  const missions = getStorage(KEYS.dailyMissions, []);
  return Array.isArray(missions) && missions.length ? missions : setStorage(KEYS.dailyMissions, generateDailyMissions());
}

export function updateMissionProgress(eventType, payload = {}) {
  const missions = getDailyMissions();
  let changed = false;
  const completedNow = [];

  for (const mission of missions) {
    if (mission.completed) continue;

    if (eventType === "training:complete" && mission.id === "quick-training") {
      mission.progress = mission.target;
    }
    if (eventType === "training:complete" && mission.id === "precision-90" && parseAccuracy(payload.precisao ?? payload.accuracy) >= 90) {
      mission.progress = mission.target;
    }
    if (eventType === "training:record" && mission.id === "match-best-ppm") {
      mission.progress = mission.target;
    }
    if (eventType === "arcade:panda-keys" && mission.id === "arcade-play") {
      mission.progress = mission.target;
    }
    if (eventType === "dojo:lesson-start" && mission.id === "dojo-map") {
      mission.progress = mission.target;
    }

    if (mission.progress >= mission.target) {
      mission.completed = true;
      completedNow.push(mission);
      changed = true;
    }
  }

  if (changed) {
    setStorage(KEYS.dailyMissions, missions);
    completedNow.forEach((mission) => completeMission(mission.id));
  }

  return completedNow;
}

export function completeMission(missionId) {
  const missions = getDailyMissions();
  const mission = missions.find((item) => item.id === missionId);
  if (!mission || mission.rewarded) return null;

  mission.completed = true;
  mission.rewarded = true;
  awardXp(mission.rewardXp, `daily:${mission.id}:${getTodayKey()}`);
  unlockAchievement("daily-routine");
  setStorage(KEYS.dailyMissions, missions);
  return mission;
}

function parseAccuracy(value) {
  if (typeof value === "number") return value;
  return Number(String(value || "0").replace("%", "").replace(",", ".")) || 0;
}
