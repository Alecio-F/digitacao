export const STORAGE_KEYS = Object.freeze({
  ativo: "ativo",
  tempoPratica: "tempoPratica",
  historico: "historico",
  pandaXp: "pandaXp",
  pandaLevel: "pandaLevel",
  pandaAchievements: "pandaAchievements",
  pandaDailyStreak: "pandaDailyStreak",
  pandaLastTrainingDate: "pandaLastTrainingDate",
  pandaLastMistakes: "pandaLastMistakes",
  pandaKeysBestScore: "pandaKeysBestScore",
  pandaDailyMissions: "pandaDailyMissions",
  pandaMissionDate: "pandaMissionDate",
  pandaLessonProgress: "pandaLessonProgress",
  pandaTrainingRecommendations: "pandaTrainingRecommendations",
  pandaSelectedLessonId: "pandaSelectedLessonId",
  pandaSelectedTrainingMode: "pandaSelectedTrainingMode",
  pandaSealBestScore: "pandaSealBestScore",
  pandaStartedLessons: "pandaStartedLessons",
  pandaXpAwards: "pandaXpAwards",
});

export const KEYS = Object.freeze({
  historico: STORAGE_KEYS.historico,
  xp: STORAGE_KEYS.pandaXp,
  level: STORAGE_KEYS.pandaLevel,
  achievements: STORAGE_KEYS.pandaAchievements,
  dailyStreak: STORAGE_KEYS.pandaDailyStreak,
  lastTrainingDate: STORAGE_KEYS.pandaLastTrainingDate,
  lastMistakes: STORAGE_KEYS.pandaLastMistakes,
  gameBestScore: STORAGE_KEYS.pandaKeysBestScore,
  tempoPratica: STORAGE_KEYS.tempoPratica,
  tema: STORAGE_KEYS.ativo,
  dailyMissions: STORAGE_KEYS.pandaDailyMissions,
  missionDate: STORAGE_KEYS.pandaMissionDate,
  lessonProgress: STORAGE_KEYS.pandaLessonProgress,
  recommendations: STORAGE_KEYS.pandaTrainingRecommendations,
  selectedLessonId: STORAGE_KEYS.pandaSelectedLessonId,
  selectedTrainingMode: STORAGE_KEYS.pandaSelectedTrainingMode,
  sealBestScore: STORAGE_KEYS.pandaSealBestScore,
  startedLessons: STORAGE_KEYS.pandaStartedLessons,
  xpAwards: STORAGE_KEYS.pandaXpAwards,
});

export const TRAINING_MODES = Object.freeze({
  randomWords: "randomWords",
  baseKeys: "baseKeys",
  leftHand: "leftHand",
  rightHand: "rightHand",
  accents: "accents",
  numbers: "numbers",
  punctuation: "punctuation",
  shortSentences: "shortSentences",
  focusMode: "focusMode",
});

export const LEVEL_TITLES = Object.freeze({
  1: "Filhote de Panda",
  5: "Aprendiz do Dojo",
  10: "Panda Ágil",
  20: "Mestre das Teclas",
  30: "Guardião do Teclado",
  50: "Lenda do Dojo",
});

export const XP_PER_LEVEL = 220;
export const MAX_HISTORY = 10;

export const WORDS_COUNT = 200;
export const MAX_EXTRA_LETTERS = 5;
export const COMBO_MILESTONE = 12;
export const TOP_ERRORS_COUNT = 5;
