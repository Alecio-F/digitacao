import { PERSISTENCE_KEYS, persistence } from '@/services/persistence/types';

type RecommendationCategory =
  | 'high-accuracy'
  | 'medium-accuracy'
  | 'low-accuracy'
  | 'many-errors'
  | 'few-errors'
  | 'high-combo'
  | 'high-ppm'
  | 'fast-low-accuracy'
  | 'ranking-ineligible'
  | 'general';

export interface MasterPandaRecommendationInput {
  ppm: number;
  accuracy: number;
  errors: number;
  maxCombo: number;
  topErrors?: [string, number][];
  validForRanking?: boolean;
  mode?: string | null;
  seedHint?: string | null;
}

export interface MasterPandaRecommendation {
  id: string;
  category: RecommendationCategory;
  text: string;
  href: string | null;
  linkText: string | null;
}

interface StoredMasterPandaRecommendation {
  id: string;
  category: RecommendationCategory;
  text: string;
  savedAt: string;
}

const PHRASES: Record<RecommendationCategory, string[]> = {
  'high-accuracy': [
    'Sua precisão foi boa. O bambu sagrado balançou em aprovação.',
    'Você mirou nas teclas com respeito. O Dojo quase ficou em silêncio, coisa rara.',
    'Precisão de respeito. O teclado respirou aliviado e o Mestre Panda fingiu normalidade.',
    'Boa rodada. O Mestre Panda fingiu que não ficou impressionado.',
    'Pouca bagunça, muito controle. O tatame das teclas agradece.',
  ],
  'medium-accuracy': [
    'Você está no caminho. O Dojo ainda não colocou seu nome na parede, mas deixou um espaço.',
    'Nada mal, aprendiz. Não melhor que o Mestre Panda, obviamente.',
    'Sua precisão ficou honesta. Agora falta convencer os dedos a não improvisarem tanto.',
    'O treino teve forma. O Mestre Panda viu técnica, drama e umas teclas tentando fugir.',
    'A base está aparecendo. Continue firme, porque o teclado já percebeu sua intenção.',
  ],
  'low-accuracy': [
    'Sua precisão tropeçou no tatame. Respire, mire nas teclas e tente de novo.',
    'Muitos erros, muita coragem. O Dojo respeita a tentativa.',
    'O teclado sobreviveu. Isso já é uma vitória, mas vamos mirar melhor na próxima.',
    'Você explorou caminhos alternativos no teclado. Interessante, mas o texto discordou.',
    'A precisão pediu treino de base. O Mestre Panda já separou o bambu da concentração.',
  ],
  'many-errors': [
    'Você explorou o teclado inteiro. Agora tente acertar mais o caminho.',
    'As teclas ficaram agitadas. O Mestre Panda recomenda foco antes que o teclado peça férias.',
    'Teve coragem, teve velocidade e teve confusão. Falta só combinar as três coisas direito.',
    'Os erros fizeram fila no Dojo. Vamos dispersar essa turma com treino de precisão.',
    'O teclado viu aventura demais. Na próxima, menos passeio turístico e mais mira.',
  ],
  'few-errors': [
    'Poucos erros. O teclado piscou duas vezes e fingiu que isso é normal.',
    'Você quase saiu limpo. O Mestre Panda anotou isso em uma prancheta muito suspeita.',
    'Boa precisão de sobrevivência. O texto tentou te derrubar e falhou com elegância.',
    'Quase sem tropeços. O tatame das teclas ficou orgulhoso, discretamente.',
    'Pouca poeira no caminho. Agora dá para acelerar sem assustar o Dojo.',
  ],
  'high-combo': [
    'Esse combo teve presença. Quase ouvi uma música de chefe final.',
    'Combo forte. O Dojo piscou em neon e fingiu que era parte do treinamento.',
    'Esse combo fez barulho. O Mestre Panda está recalculando sua pose dramática.',
    'Sequência firme. O teclado tentou intimidar e você respondeu com ritmo.',
    'O combo ganhou respeito. Falta pouco para desbloquear a sobrancelha aprovada do Mestre Panda.',
  ],
  'high-ppm': [
    'Você digitou rápido. O texto ainda está tentando entender o que aconteceu.',
    'Boa velocidade. O teclado aqueceu, o Dojo observou e o Mestre Panda sorriu de lado.',
    'Ritmo alto. Agora mantenha a mira, porque velocidade sem controle vira show de susto.',
    'Você acelerou bonito. O placar local colocou um capacete por precaução.',
    'Velocidade de arcade. Só falta transformar esse foguete em caligrafia digital.',
  ],
  'fast-low-accuracy': [
    'Boa velocidade. Agora falta avisar seus dedos para acertarem as teclas.',
    'Você foi rápido demais para a própria precisão. Clássico aprendiz com motor de fliperama.',
    'O texto levou um susto. Agora diminua um pouco e mostre quem manda nas teclas.',
    'Velocidade existe. Direção ainda está negociando com seus dedos.',
    'Você correu pelo Dojo. Agora tente não derrubar metade das lanternas no caminho.',
  ],
  'ranking-ineligible': [
    'O ranking olhou para isso e disse: treine mais um pouquinho.',
    'Rodada salva, mas o placar competitivo levantou a sobrancelha. O Mestre Panda também.',
    'O histórico aceitou. O ranking pediu calma, precisão e menos teatro no teclado.',
    'Essa rodada foi treino de laboratório. Divertida, mas o ranking quer algo mais disciplinado.',
    'O placar competitivo não comprou a ideia. Respire e tente uma rodada mais limpa.',
  ],
  general: [
    'O teclado sobreviveu. Isso já é uma vitória.',
    'Boa rodada. O Mestre Panda vai dizer que era exatamente o esperado, mesmo que não fosse.',
    'O Dojo registrou sua tentativa. As teclas ainda estão comentando entre si.',
    'Treino concluído. O bambu balançou, o placar piscou e ninguém precisou chamar reforços.',
    'Você saiu da arena com XP e dignidade suficiente. O Mestre Panda aprova com moderação.',
    'O texto foi enfrentado. A glória vem em parcelas pequenas e muito digitadas.',
  ],
};

function clampMetric(value: number, min = 0, max = Number.MAX_SAFE_INTEGER): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function hashString(value: string): number {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function formatErrorKey(char: string): string {
  return char === ' ' ? 'Espaço' : char.toUpperCase();
}

function getStrongErrorKeys(topErrors: [string, number][]): string[] {
  const strongestCount = topErrors[0]?.[1] ?? 0;
  if (topErrors.length < 3 || strongestCount < 4) return [];

  return topErrors.slice(0, 3).map(([char]) => formatErrorKey(char));
}

function getLastRecommendationText(): string | null {
  const stored = persistence.getItem<StoredMasterPandaRecommendation | null>(
    PERSISTENCE_KEYS.lastMasterPandaRecommendation,
    null,
  );

  return stored?.text ?? null;
}

function selectCategory(input: MasterPandaRecommendationInput): RecommendationCategory {
  const ppm = clampMetric(input.ppm);
  const accuracy = clampMetric(input.accuracy, 0, 100);
  const errors = clampMetric(input.errors);
  const maxCombo = clampMetric(input.maxCombo);
  const topErrors = input.topErrors ?? [];
  const hasStrongErrorKeys = getStrongErrorKeys(topErrors).length > 0;

  if (input.validForRanking === false) return 'ranking-ineligible';
  if (ppm >= 60 && accuracy > 0 && accuracy < 85) return 'fast-low-accuracy';
  if (hasStrongErrorKeys || errors >= 10) return 'many-errors';
  if (maxCombo >= 20) return 'high-combo';
  if (ppm >= 60 && accuracy >= 85) return 'high-ppm';
  if (errors <= 1 && accuracy >= 85) return 'few-errors';
  if (accuracy >= 95) return 'high-accuracy';
  if (accuracy >= 85) return 'medium-accuracy';
  if (accuracy > 0 && accuracy < 85) return 'low-accuracy';

  return 'general';
}

function pickPhrase(
  category: RecommendationCategory,
  seed: string,
  previousText: string | null,
): string {
  const phrases = PHRASES[category];
  const fallback = PHRASES.general[0] ?? 'O teclado sobreviveu. Isso já é uma vitória.';
  if (phrases.length === 0) return fallback;

  let index = hashString(seed) % phrases.length;
  if (phrases.length > 1 && phrases[index] === previousText) {
    index = (index + 1) % phrases.length;
  }

  return phrases[index] ?? phrases[0] ?? fallback;
}

function getAction(
  category: RecommendationCategory,
  input: MasterPandaRecommendationInput,
): Pick<MasterPandaRecommendation, 'href' | 'linkText'> {
  const ppm = clampMetric(input.ppm);
  const accuracy = clampMetric(input.accuracy, 0, 100);

  if (category === 'many-errors') {
    return { href: '/mapa', linkText: 'Treinar essas teclas' };
  }

  if (category === 'low-accuracy' || category === 'fast-low-accuracy') {
    return { href: '/aprenda', linkText: 'Revisar precisão' };
  }

  if (category === 'high-accuracy' && ppm > 0 && ppm < 35) {
    return { href: '/arcade', linkText: 'Treinar reflexo no Arcade' };
  }

  if (category === 'ranking-ineligible') {
    return accuracy > 0 && accuracy < 85
      ? { href: '/aprenda', linkText: 'Rever fundamentos' }
      : { href: '/arena', linkText: 'Tentar rodada limpa' };
  }

  return { href: null, linkText: null };
}

export function getMasterPandaRecommendation(
  input: MasterPandaRecommendationInput,
): MasterPandaRecommendation {
  const category = selectCategory(input);
  const seed = [
    category,
    input.mode ?? 'arena',
    input.seedHint ?? '',
    clampMetric(input.ppm),
    clampMetric(input.accuracy, 0, 100),
    clampMetric(input.errors),
    clampMetric(input.maxCombo),
  ].join('|');
  const previousText = getLastRecommendationText();
  const strongKeys = getStrongErrorKeys(input.topErrors ?? []);
  const keyCopy = category === 'many-errors' && strongKeys.length > 0
    ? ` Teclas na mira do Dojo: ${strongKeys.join(', ')}.`
    : '';
  const text = `${pickPhrase(category, seed, previousText)}${keyCopy}`;
  const action = getAction(category, input);

  return {
    id: `${category}-${hashString(text)}`,
    category,
    text,
    ...action,
  };
}

export function saveLastMasterPandaRecommendation(recommendation: MasterPandaRecommendation): void {
  persistence.setItem<StoredMasterPandaRecommendation>(
    PERSISTENCE_KEYS.lastMasterPandaRecommendation,
    {
      id: recommendation.id,
      category: recommendation.category,
      text: recommendation.text,
      savedAt: new Date().toISOString(),
    },
  );
}
