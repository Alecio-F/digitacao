import { KEYS, TRAINING_MODES } from "./constants.mjs";
import { getStorage, setStorage } from "./utils/storage.mjs";
import { awardXp, unlockAchievement } from "./gamification.mjs";

export const LESSONS = Object.freeze([
  {
    id: "base-keys",
    number: "01",
    title: "Teclas Base",
    objective: "Treinar ASDF e JKLÇ.",
    focus: "ASDF JKLÇ",
    difficulty: "Fácil",
    xp: 50,
    requirement: [],
    completionAccuracy: 85,
    trainingMode: TRAINING_MODES.baseKeys,
  },
  {
    id: "left-hand",
    number: "02",
    title: "Mão Esquerda",
    objective: "Ganhar controle com a mão esquerda.",
    focus: "A S D F Q W E R Z X C V",
    difficulty: "Fácil",
    xp: 60,
    requirement: ["base-keys"],
    completionAccuracy: 85,
    trainingMode: TRAINING_MODES.leftHand,
  },
  {
    id: "right-hand",
    number: "03",
    title: "Mão Direita",
    objective: "Ganhar controle com a mão direita.",
    focus: "J K L Ç U I O P N M",
    difficulty: "Fácil",
    xp: 60,
    requirement: ["base-keys"],
    completionAccuracy: 85,
    trainingMode: TRAINING_MODES.rightHand,
  },
  {
    id: "accents",
    number: "04",
    title: "Acentuação",
    objective: "Treinar acentos comuns do português.",
    focus: "á é í ó ú ã õ ç",
    difficulty: "Médio",
    xp: 80,
    requirement: ["left-hand", "right-hand"],
    completionAccuracy: 85,
    trainingMode: TRAINING_MODES.accents,
  },
  {
    id: "numbers",
    number: "05",
    title: "Números",
    objective: "Alternar letras e linha numérica.",
    focus: "0-9",
    difficulty: "Médio",
    xp: 80,
    requirement: ["base-keys"],
    completionAccuracy: 85,
    trainingMode: TRAINING_MODES.numbers,
  },
  {
    id: "punctuation",
    number: "06",
    title: "Pontuação",
    objective: "Controlar vírgulas, pontos e sinais.",
    focus: "vírgula, ponto, ;, :, ?",
    difficulty: "Médio",
    xp: 90,
    requirement: ["base-keys"],
    completionAccuracy: 85,
    trainingMode: TRAINING_MODES.punctuation,
  },
  {
    id: "short-sentences",
    number: "07",
    title: "Frases Curtas",
    objective: "Treinar fluidez em frases simples.",
    focus: "frases simples em português",
    difficulty: "Médio",
    xp: 100,
    requirement: ["accents", "punctuation"],
    completionAccuracy: 85,
    trainingMode: TRAINING_MODES.shortSentences,
  },
  {
    id: "final-challenge",
    number: "08",
    title: "Desafio Final",
    objective: "Misturar velocidade, precisão e consistência.",
    focus: "misto",
    difficulty: "Difícil",
    xp: 150,
    requirement: ["short-sentences", "numbers"],
    completionAccuracy: 88,
    trainingMode: TRAINING_MODES.focusMode,
  },
]);

export function getLessonById(id) {
  return LESSONS.find((lesson) => lesson.id === id) || null;
}

export function getLessonProgress() {
  const progress = getStorage(KEYS.lessonProgress, {});
  return progress && typeof progress === "object" && !Array.isArray(progress) ? progress : {};
}

export function saveLessonProgress(progress) {
  return setStorage(KEYS.lessonProgress, progress || {});
}

export function isLessonUnlocked(lessonId) {
  const lesson = getLessonById(lessonId);
  if (!lesson) return false;
  const progress = getLessonProgress();
  return lesson.requirement.every((id) => progress[id]?.status === "completed");
}

export function completeLesson(lessonId, result = {}) {
  const lesson = getLessonById(lessonId);
  if (!lesson) return null;

  const accuracy = parseAccuracy(result.precisao ?? result.accuracy);
  const ppm = Number(result.ppm ?? result.wpm ?? 0) || 0;
  const progress = getLessonProgress();
  const current = progress[lessonId] || {};
  const medal = getMedal(accuracy);
  const completed = accuracy >= lesson.completionAccuracy;
  const firstCompletion = completed && current.status !== "completed";

  progress[lessonId] = {
    status: completed ? "completed" : "started",
    bestAccuracy: Math.max(Number(current.bestAccuracy || 0), accuracy),
    bestWpm: Math.max(Number(current.bestWpm || 0), ppm),
    medal: getBestMedal(current.medal, medal),
    completedAt: completed ? (current.completedAt || new Date().toISOString()) : current.completedAt,
    lastAttemptAt: new Date().toISOString(),
  };

  saveLessonProgress(progress);

  let xpAward = 0;
  if (firstCompletion) {
    xpAward = lesson.xp;
    awardXp(lesson.xp, `lesson:${lessonId}`);
    if (lessonId === "base-keys" && medal === "gold") {
      unlockAchievement("master-asdf");
    }
  }

  return {
    lesson,
    completed,
    medal: progress[lessonId].medal,
    xpAward,
    progress: progress[lessonId],
  };
}

export function getNextRecommendedLesson() {
  const progress = getLessonProgress();
  return LESSONS.find((lesson) => isLessonUnlocked(lesson.id) && progress[lesson.id]?.status !== "completed") || LESSONS[0];
}

function getMedal(accuracy) {
  if (accuracy >= 97) return "gold";
  if (accuracy >= 92) return "silver";
  if (accuracy >= 85) return "bronze";
  return "none";
}

function getBestMedal(current, next) {
  const order = { none: 0, bronze: 1, silver: 2, gold: 3 };
  return (order[next] || 0) > (order[current] || 0) ? next : (current || next);
}

function parseAccuracy(value) {
  if (typeof value === "number") return value;
  return Number(String(value || "0").replace("%", "").replace(",", ".")) || 0;
}
