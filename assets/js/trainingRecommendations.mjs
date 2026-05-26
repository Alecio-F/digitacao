import { KEYS } from "./constants.mjs";
import { getStorage, setStorage } from "./utils/storage.mjs";

export function getTypingHistory() {
  const history = getStorage(KEYS.historico, []);
  return Array.isArray(history) ? history : [];
}

export function getLastMistakes() {
  const mistakes = getStorage(KEYS.lastMistakes, []);
  return Array.isArray(mistakes) ? mistakes : [];
}

export function analyzeTypingPerformance(history = getTypingHistory(), mistakes = getLastMistakes()) {
  const recent = history.slice(0, 5);
  const averageAccuracy = recent.length
    ? recent.reduce((sum, item) => sum + parseAccuracy(item.precisao), 0) / recent.length
    : 0;
  const averagePpm = recent.length
    ? recent.reduce((sum, item) => sum + (Number(item.ppm) || 0), 0) / recent.length
    : 0;
  const last = history[0] || null;

  return {
    hasHistory: history.length > 0,
    averageAccuracy,
    averagePpm,
    mistakes,
    last,
    recentRecord: Boolean(last?.novoRecorde || last?.recorde),
  };
}

export function generateTrainingRecommendations() {
  const history = getTypingHistory();
  const mistakes = getLastMistakes();
  const analysis = analyzeTypingPerformance(history, mistakes);
  const recommendations = [];

  if (!analysis.hasHistory) {
    recommendations.push({
      id: "start-base-keys",
      title: "Fase 01 — Teclas Base",
      message: "Comece pela linha base e faça um teste rápido de 1 minuto.",
      targetPage: "./pratique.html",
      targetLessonId: "base-keys",
      priority: "high",
      reason: "no-history",
    });
    return saveTrainingRecommendations(recommendations);
  }

  const mistakeRecommendation = getMistakeRecommendation(mistakes);
  if (mistakeRecommendation) recommendations.push(mistakeRecommendation);

  if (analysis.averageAccuracy < 85) {
    recommendations.push({
      id: "precision-training",
      title: "Treino de Precisão",
      message: "Sua precisão está baixa. Treine devagar por alguns minutos antes de buscar velocidade.",
      targetPage: "./pratique.html",
      targetLessonId: "base-keys",
      priority: "high",
      reason: "accuracy-low",
    });
  } else if (analysis.averageAccuracy >= 95 && analysis.averagePpm < 35) {
    recommendations.push({
      id: "speed-training",
      title: "Treino de Velocidade",
      message: "Sua precisão está boa. Agora você pode treinar velocidade em rodadas curtas.",
      targetPage: "./digitando.html",
      targetLessonId: null,
      priority: "medium",
      reason: "speed-low",
    });
  }

  if (analysis.recentRecord) {
    recommendations.push({
      id: "daily-challenge",
      title: "Desafio Diário",
      message: "Você bateu recorde recentemente. Continue no modo atual e tente o desafio diário.",
      targetPage: "./pratique.html",
      targetLessonId: null,
      priority: "medium",
      reason: "recent-record",
    });
  }

  if (!recommendations.length) {
    recommendations.push({
      id: "next-lesson",
      title: "Próxima fase do Dojo",
      message: "Mantenha a consistência e avance para a próxima fase desbloqueada.",
      targetPage: "./pratique.html",
      targetLessonId: null,
      priority: "normal",
      reason: "steady-progress",
    });
  }

  return saveTrainingRecommendations(recommendations);
}

export function saveTrainingRecommendations(recommendations) {
  setStorage(KEYS.recommendations, recommendations);
  return recommendations;
}

export function getTrainingRecommendations() {
  const current = getStorage(KEYS.recommendations, null);
  return Array.isArray(current) && current.length ? current : generateTrainingRecommendations();
}

function getMistakeRecommendation(mistakes) {
  if (!Array.isArray(mistakes) || !mistakes.length) return null;
  const keys = mistakes.map(([key]) => String(key || "").toLowerCase()).join("");
  const has = (chars) => chars.some((char) => keys.includes(char));

  if (has(["a", "s", "d", "f"])) return lessonRecommendation("left-hand", "Fase Teclas Base / Mão Esquerda", "Você errou mais teclas da mão esquerda. Reforce ASDF e a região próxima.");
  if (has(["j", "k", "l", "ç"])) return lessonRecommendation("right-hand", "Fase Teclas Base / Mão Direita", "Você errou mais teclas da mão direita. Reforce J, K, L e Ç.");
  if (has(["á", "é", "í", "ó", "ú", "ã", "õ"])) return lessonRecommendation("accents", "Fase Acentuação", "Acentos apareceram entre os erros. Treine palavras acentuadas.");
  if (/[0-9]/.test(keys)) return lessonRecommendation("numbers", "Fase Números", "Números apareceram entre os erros. Treine alternância com a linha numérica.");
  if (/[.,;:?!]/.test(keys)) return lessonRecommendation("punctuation", "Fase Pontuação", "Pontuação apareceu entre os erros. Treine sinais e pausas.");
  return null;
}

function lessonRecommendation(targetLessonId, title, message) {
  return {
    id: `mistakes-${targetLessonId}`,
    title,
    message,
    targetPage: "./pratique.html",
    targetLessonId,
    priority: "high",
    reason: "mistake-pattern",
  };
}

function parseAccuracy(value) {
  if (typeof value === "number") return value;
  return Number(String(value || "0").replace("%", "").replace(",", ".")) || 0;
}
