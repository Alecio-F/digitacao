const STORAGE = Object.freeze({
  xp: "pandaXp",
  level: "pandaLevel",
  achievements: "pandaAchievements",
  dailyStreak: "pandaDailyStreak",
  lastTrainingDate: "pandaLastTrainingDate",
  lastMistakes: "pandaLastMistakes",
});

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
]);

export function getHistory() {
  return readJson("historico", []);
}

export function getDojoProfile() {
  const historico = getHistory();
  const storedXp = Number(localStorage.getItem(STORAGE.xp));
  const xp = Number.isFinite(storedXp) && storedXp > 0 ? storedXp : deriveXpFromHistory(historico);
  const level = calculateLevel(xp);
  const achievements = getUnlockedAchievements(historico);
  const bestPpm = historico.reduce((best, item) => Math.max(best, Number(item.ppm) || 0), 0);
  const lastResult = historico[0] || null;
  const lastPrecision = lastResult ? String(lastResult.precisao || "0%") : "0%";
  const nextLevelXp = level * 220;
  const previousLevelXp = (level - 1) * 220;
  const currentLevelXp = Math.max(0, xp - previousLevelXp);
  const requiredForLevel = Math.max(1, nextLevelXp - previousLevelXp);
  const progressPercent = Math.min(100, Math.round((currentLevelXp / requiredForLevel) * 100));

  persistProfile({ xp, level, achievements });

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
    dailyStreak: Number(localStorage.getItem(STORAGE.dailyStreak) || 0),
    lastTrainingDate: localStorage.getItem(STORAGE.lastTrainingDate) || "",
    bestPpm,
    lastPrecision,
    lastResult,
    history: historico,
    lastMistakes: readJson(STORAGE.lastMistakes, []),
    gameBestScore: Number(localStorage.getItem("pandaKeysBestScore") || 0),
  };
}

export function registerTrainingResult(result, options = {}) {
  const historico = getHistory();
  const storedXp = localStorage.getItem(STORAGE.xp);
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
  });

  updateDailyStreak();

  if (Array.isArray(options.topErros)) {
    localStorage.setItem(STORAGE.lastMistakes, JSON.stringify(options.topErros));
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
  return Math.max(1, Math.floor(Number(xp || 0) / 220) + 1);
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
  const stored = readJson(STORAGE.achievements, []);
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

  return [...unlocked].filter((id) => getAchievementById(id));
}

function getAchievementById(id) {
  return ACHIEVEMENTS.find((achievement) => achievement.id === id);
}

function updateDailyStreak() {
  const today = getDateKey(new Date());
  const lastDate = localStorage.getItem(STORAGE.lastTrainingDate);
  let streak = Number(localStorage.getItem(STORAGE.dailyStreak) || 0);

  if (lastDate === today) {
    return;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  streak = lastDate === getDateKey(yesterday) ? streak + 1 : 1;
  localStorage.setItem(STORAGE.dailyStreak, String(streak));
  localStorage.setItem(STORAGE.lastTrainingDate, today);
}

function getDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function persistProfile({ xp, level, achievements }) {
  localStorage.setItem(STORAGE.xp, String(xp));
  localStorage.setItem(STORAGE.level, String(level));
  localStorage.setItem(STORAGE.achievements, JSON.stringify(achievements));
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
