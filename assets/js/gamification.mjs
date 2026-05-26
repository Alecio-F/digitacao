import { KEYS, XP_PER_LEVEL } from "./constants.mjs";

const ACHIEVEMENTS = Object.freeze([
  {
    id: "first-training",
    title: "Primeiro Passo",
    description: "Concluiu o primeiro treino no Dojo.",
  },
  {
    id: "precision-90",
    title: "Foco de Bambu",
    description: "Alcançou 90% ou mais de precisão.",
  },
  {
    id: "precision-95",
    title: "Toque Preciso",
    description: "Alcançou 95% ou mais de precisão.",
  },
  {
    id: "new-record",
    title: "Recorde do Dojo",
    description: "Bateu um novo recorde pessoal.",
  },
  {
    id: "three-trainings",
    title: "Rotina de Aprendiz",
    description: "Registrou pelo menos 3 treinos.",
  },
  {
    id: "seven-trainings",
    title: "Disciplina Arcade",
    description: "Registrou pelo menos 7 treinos.",
  },
  {
    id: "master-asdf",
    title: "Mestre ASDF",
    description: "Concluiu Teclas Base com medalha de ouro.",
  },
  {
    id: "daily-routine",
    title: "Rotina do Dojo",
    description: "Completou uma missão diária.",
  },
  {
    id: "map-explorer",
    title: "Explorador do Mapa",
    description: "Iniciou 3 fases diferentes do Mapa do Dojo.",
  },
  {
    id: "arcade-first",
    title: "Arcade Inicial",
    description: "Jogou Panda Keys pela primeira vez.",
  },
  {
    id: "strong-combo",
    title: "Combo Forte",
    description: "Alcançou um combo alto em treino.",
  },
]);

export function getHistory() {
  return readArray(KEYS.historico);
}

export function getDojoProfile() {
  const historico = getHistory();
  const storedXp = Number(localStorage.getItem(KEYS.xp));
  const xp = Number.isFinite(storedXp) && storedXp > 0 ? storedXp : deriveXpFromHistory(historico);
  const level = calculateLevel(xp);
  const achievements = getUnlockedAchievements(historico);
  const bestPpm = historico.reduce((best, item) => Math.max(best, Number(item.ppm) || 0), 0);
  const lastResult = historico[0] || null;
  const lastPrecision = lastResult ? String(lastResult.precisao || "0%") : "0%";
  const nextLevelXp = level * XP_PER_LEVEL;
  const previousLevelXp = (level - 1) * XP_PER_LEVEL;
  const currentLevelXp = Math.max(0, xp - previousLevelXp);
  const requiredForLevel = Math.max(1, nextLevelXp - previousLevelXp);
  const progressPercent = Math.min(100, Math.round((currentLevelXp / requiredForLevel) * 100));

  persistProfile({ xp, level, achievements });
  refreshPlayerHud();

  return {
    xp,
    level,
    title: getProgressionTitle(level),
    nextTitle: getNextProgressionTitle(level),
    progressPercent,
    currentLevelXp,
    requiredForLevel,
    achievements,
    achievementDetails: achievements.map(getAchievementById).filter(Boolean),
    dailyStreak: Number(localStorage.getItem(KEYS.dailyStreak) || 0),
    lastTrainingDate: localStorage.getItem(KEYS.lastTrainingDate) || "",
    bestPpm,
    lastPrecision,
    lastResult,
    history: historico,
    lastMistakes: readArray(KEYS.lastMistakes),
    gameBestScore: Number(localStorage.getItem(KEYS.gameBestScore) || 0),
  };
}

export function registerTrainingResult(result, options = {}) {
  const historico = getHistory();
  const storedXp = localStorage.getItem(KEYS.xp);
  const currentXp = storedXp !== null ? Number(storedXp) || 0 : deriveXpFromHistory(historico.slice(1));
  const precision = parsePrecision(result?.precisao);
  let gainedXp = 50;

  if (precision >= 95) {
    gainedXp += 60;
  } else if (precision >= 90) {
    gainedXp += 30;
  }

  if (options.novoRecorde) {
    gainedXp += 80;
  }

  if (options.semPausa) {
    gainedXp += 20;
  }

  if (Number(options.combo || 0) > 0) {
    gainedXp += 10;
  }

  const xp = currentXp + gainedXp;
  const level = calculateLevel(xp);
  const achievements = getUnlockedAchievements(historico, {
    precision,
    novoRecorde: Boolean(options.novoRecorde),
    combo: Number(options.combo || 0),
  });

  updateDailyStreak();

  if (Array.isArray(options.topErros)) {
    localStorage.setItem(KEYS.lastMistakes, JSON.stringify(options.topErros));
  }

  persistProfile({ xp, level, achievements });

  return {
    gainedXp,
    xp,
    level,
    title: getProgressionTitle(level),
    achievements,
  };
}

export function awardXp(amount, reason = "generic") {
  const safeAmount = Math.max(0, Number(amount) || 0);
  if (!safeAmount) return getDojoProfile();

  const awards = readArray(KEYS.xpAwards);
  if (reason && awards.includes(reason)) {
    return getDojoProfile();
  }

  const currentXp = Math.max(0, Number(localStorage.getItem(KEYS.xp) || 0));
  const xp = currentXp + safeAmount;
  const level = calculateLevel(xp);
  const achievements = readArray(KEYS.achievements);

  if (reason) {
    awards.push(reason);
    localStorage.setItem(KEYS.xpAwards, JSON.stringify(awards.slice(-200)));
  }

  persistProfile({ xp, level, achievements });
  refreshPlayerHud();
  document.dispatchEvent(new CustomEvent("dojo:xp-awarded", { detail: { amount: safeAmount, reason, xp, level } }));
  return getDojoProfile();
}

export function unlockAchievement(id) {
  if (!getAchievementById(id)) return false;
  const achievements = new Set(readArray(KEYS.achievements));
  if (achievements.has(id)) return false;

  achievements.add(id);
  localStorage.setItem(KEYS.achievements, JSON.stringify([...achievements]));
  refreshPlayerHud();
  document.dispatchEvent(new CustomEvent("dojo:achievement", { detail: { id, achievement: getAchievementById(id) } }));
  return true;
}

export function getPlayerProgress() {
  return getDojoProfile();
}

export function refreshPlayerHud() {
  const xp = Math.max(0, Number(localStorage.getItem(KEYS.xp) || 0));
  const level = calculateLevel(xp);
  const percent = Math.min(100, Math.round(((xp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100));

  document.querySelectorAll(".dojo-player-status").forEach((status) => {
    const levelEl = status.querySelector("span");
    const xpEl = status.querySelector("strong");
    const fill = status.querySelector(".dojo-xp-fill");
    if (levelEl) levelEl.textContent = `Nível ${level}`;
    if (xpEl) xpEl.textContent = `${xp} XP`;
    if (fill) fill.style.width = `${percent}%`;
  });

  return { xp, level, percent };
}

export function getProgressionTitle(level) {
  if (level >= 30) return "Guardião do Teclado";
  if (level >= 20) return "Mestre das Teclas";
  if (level >= 10) return "Panda Ágil";
  if (level >= 5) return "Aprendiz do Dojo";
  return "Filhote de Panda";
}

function getNextProgressionTitle(level) {
  if (level < 5) return "Aprendiz do Dojo";
  if (level < 10) return "Panda Ágil";
  if (level < 20) return "Mestre das Teclas";
  if (level < 30) return "Guardião do Teclado";
  return "Lenda do Dojo";
}

function calculateLevel(xp) {
  return Math.max(1, Math.floor(Number(xp || 0) / XP_PER_LEVEL) + 1);
}

function deriveXpFromHistory(historico) {
  return historico.reduce((total, item, index) => {
    const precision = parsePrecision(item.precisao);
    let xp = 50;
    if (precision >= 95) xp += 60;
    else if (precision >= 90) xp += 30;
    if (index === 0 && Number(item.ppm || 0) > 0) xp += 20;
    return total + xp;
  }, 0);
}

function getUnlockedAchievements(historico, current = {}) {
  const stored = readArray(KEYS.achievements);
  const unlocked = new Set(stored);
  const bestPrecision = Math.max(
    0,
    ...historico.map((item) => parsePrecision(item.precisao)),
    Number(current.precision || 0)
  );

  if (historico.length > 0) unlocked.add("first-training");
  if (historico.length >= 3) unlocked.add("three-trainings");
  if (historico.length >= 7) unlocked.add("seven-trainings");
  if (bestPrecision >= 90) unlocked.add("precision-90");
  if (bestPrecision >= 95) unlocked.add("precision-95");
  if (current.novoRecorde) unlocked.add("new-record");
  if (Number(current.combo || 0) >= 24) unlocked.add("strong-combo");

  return [...unlocked].filter((id) => getAchievementById(id));
}

function getAchievementById(id) {
  return ACHIEVEMENTS.find((achievement) => achievement.id === id);
}

function updateDailyStreak() {
  const today = getDateKey(new Date());
  const lastDate = localStorage.getItem(KEYS.lastTrainingDate);
  let streak = Number(localStorage.getItem(KEYS.dailyStreak) || 0);

  if (lastDate === today) {
    return;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  streak = lastDate === getDateKey(yesterday) ? streak + 1 : 1;
  localStorage.setItem(KEYS.dailyStreak, String(streak));
  localStorage.setItem(KEYS.lastTrainingDate, today);
}

function getDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function persistProfile({ xp, level, achievements }) {
  localStorage.setItem(KEYS.xp, String(xp));
  localStorage.setItem(KEYS.level, String(level));
  localStorage.setItem(KEYS.achievements, JSON.stringify(achievements));
}

function parsePrecision(value) {
  if (typeof value === "number") return value;
  return Number(String(value || "0").replace("%", "").replace(",", ".")) || 0;
}

function readJson(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
}

function readArray(key) {
  const value = readJson(key, []);
  return Array.isArray(value) ? value : [];
}
