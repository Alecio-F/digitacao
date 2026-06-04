import type { DailyChallengeResult } from '../types';

type PandaMessageCategory =
  | 'perfectRun'
  | 'highSpeedHighAccuracy'
  | 'highSpeedLowAccuracy'
  | 'lowAccuracy'
  | 'mediumResult'
  | 'comboMaster'
  | 'manyErrors'
  | 'validForRanking'
  | 'notEligible';

type PandaResultInput = Partial<DailyChallengeResult> & {
  dateKey?: string;
};

const PANDA_MESSAGES: Record<PandaMessageCategory, string[]> = {
  perfectRun: [
    'Impecável. O teclado até fez reverência.',
    'Sem erros? Interessante... talvez eu tenha um rival.',
    'Hoje você digitou como se tivesse treinado no templo secreto.',
  ],
  highSpeedHighAccuracy: [
    'Rápido e preciso. Está começando a ficar perigoso.',
    'Você foi bem. Não melhor que o Mestre Panda, mas bem.',
    'O teclado sobreviveu, e isso já é impressionante.',
  ],
  highSpeedLowAccuracy: [
    'Velocidade você teve. Controle... ficou para amanhã.',
    'Você digitou como um foguete sem volante.',
    'Foi rápido, sim. O texto que lute para acompanhar.',
  ],
  lowAccuracy: [
    'O teclado pediu férias depois dessa rodada.',
    'O importante é participar... e talvez mirar nas teclas certas.',
    'O Dojo registrou sua tentativa com coragem e um pouco de preocupação.',
  ],
  mediumResult: [
    'Bom começo. Agora falta convencer seus dedos a cooperarem.',
    'Você está no caminho. Um caminho com algumas teclas tropeçadas.',
    'O Mestre Panda viu potencial. E alguns sustos.',
  ],
  comboMaster: [
    'Esse combo teve respeito. Continue assim e o Dojo abre alas.',
    'Sequência forte. Até o bambu ficou em silêncio.',
    'Combo bonito. Não deixa subir à cabeça... ainda.',
  ],
  manyErrors: [
    'Você encontrou muitas teclas. Algumas até eram as certas.',
    'Essa rodada foi uma exploração completa do teclado.',
    'O importante é que nenhuma tecla se sentiu esquecida.',
  ],
  validForRanking: [
    'Resultado digno de ranking. O Dojo aprovou.',
    'Essa marca pode ir para o mural. Não se acostume.',
    'Competitivo o suficiente para chamar atenção.',
  ],
  notEligible: [
    'Treino salvo, mas o ranking pediu um pouco mais de disciplina.',
    'O Dojo guardou sua tentativa, mas o ranking ficou desconfiado.',
    'Velocidade sem precisão é só barulho de teclado.',
  ],
};

function safeNumber(value: unknown): number {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? Math.max(0, numberValue) : 0;
}

function buildSeed(result: PandaResultInput, category: PandaMessageCategory): string {
  return [
    category,
    result.challengeId ?? '',
    result.date ?? result.dateKey ?? '',
    safeNumber(result.ppm),
    safeNumber(result.accuracy),
    safeNumber(result.errors),
    safeNumber(result.maxCombo),
    result.validForRanking === false ? 'invalid' : 'valid',
  ].join('-');
}

function hashSeed(seed: string): number {
  let hash = 0;
  for (let index = 0; index < seed.length; index++) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }
  return hash;
}

export function pickPandaMessage(messages: string[], seed: string): string {
  if (messages.length === 0) return PANDA_MESSAGES.mediumResult[0];
  return messages[hashSeed(seed) % messages.length] ?? messages[0];
}

function getPandaMessageCategory(result: PandaResultInput): PandaMessageCategory {
  const ppm = safeNumber(result.ppm);
  const accuracy = safeNumber(result.accuracy);
  const errors = safeNumber(result.errors);
  const maxCombo = safeNumber(result.maxCombo);
  const invalidReasons = Array.isArray(result.rankingInvalidReasons)
    ? result.rankingInvalidReasons
    : [];
  const invalidByInputPattern = invalidReasons.some((reason) => (
    reason === 'repeated_key_abuse' ||
    reason === 'input_burst_suspicious' ||
    reason === 'random_typing_pattern'
  ));

  if (accuracy >= 99 && errors === 0) return 'perfectRun';
  if (ppm >= 70 && accuracy >= 95) return 'highSpeedHighAccuracy';
  if (ppm >= 70 && accuracy < 85) return 'highSpeedLowAccuracy';
  if (accuracy < 70) return 'lowAccuracy';
  if (result.validForRanking === false && invalidByInputPattern) return 'notEligible';
  if (errors >= 15) return 'manyErrors';
  if (maxCombo >= 30 && accuracy >= 85) return 'comboMaster';
  if (result.validForRanking === false) return 'notEligible';
  if (result.validForRanking === true) return 'validForRanking';
  return 'mediumResult';
}

export function getMasterPandaShareMessage(result: PandaResultInput): string {
  const category = getPandaMessageCategory(result);
  return pickPandaMessage(PANDA_MESSAGES[category], buildSeed(result, category));
}
