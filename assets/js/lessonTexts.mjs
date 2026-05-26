export const LESSON_TEXTS = Object.freeze({
  "base-keys": [
    "asdf jklç asdf jklç",
    "a s d f j k l ç",
    "sala fala fada jaca",
    "dada fala sala jafa",
  ],
  "left-hand": [
    "a s d f q w e r z x c v",
    "casa faca queda fera",
    "verde cera esquerda",
    "fazer escrever quase",
  ],
  "right-hand": [
    "j k l ç u i o p n m",
    "julho ilha milho olho",
    "limpo nuvem junho",
    "pulo moinho online",
  ],
  accents: [
    "olá manhã você café",
    "ação coração lição",
    "rápido música útil",
    "pão não órgão",
  ],
  numbers: [
    "1 2 3 4 5 6 7 8 9 0",
    "hoje fiz 3 treinos em 15 minutos",
    "meta 90 porcento em 2 rodadas",
    "fase 5 vale 80 pontos",
  ],
  punctuation: [
    "Respire, digite, revise.",
    "Foco: ritmo; calma: precisão.",
    "Você consegue? Sim, com treino.",
    "Ponto. Vírgula, dois pontos: atenção.",
  ],
  "short-sentences": [
    "O panda treina com calma.",
    "A prática diária melhora o ritmo.",
    "Digite olhando para a tela.",
    "Precisão vem antes da velocidade.",
  ],
  "final-challenge": [
    "O dojo mistura letras, números 123 e pontuação.",
    "Treine precisão, ritmo e foco em uma rodada completa.",
    "A evolução aparece quando a rotina continua.",
    "Panda Keys e Type Arena trabalham reflexo e controle.",
  ],
});

export function getTextsForLesson(lessonId) {
  return LESSON_TEXTS[lessonId] || null;
}

export function getWordsForLesson(lessonId) {
  const texts = getTextsForLesson(lessonId);
  if (!texts) return null;
  return texts.join(" ").split(/\s+/).filter(Boolean);
}
