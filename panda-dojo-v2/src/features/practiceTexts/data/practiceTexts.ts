import type { PracticeText } from '../types';

export const PRACTICE_TEXTS: PracticeText[] = [
  {
    id: 'dojo-routine',
    title: 'Rotina do Dojo',
    description: 'Um texto curto para reforçar constância, ritmo e cuidado com os erros.',
    category: 'Fundamentos',
    difficulty: 'Fácil',
    estimatedMinutes: 1,
    text: 'Treinar digitação todos os dias ajuda a melhorar velocidade, precisão e foco. Comece devagar, mantenha o ritmo e procure errar menos a cada rodada.',
  },
  {
    id: 'coffee-code',
    title: 'Café e Código',
    description: 'Prática leve com vocabulário de tecnologia e rotina de estudos.',
    category: 'Tecnologia',
    difficulty: 'Fácil',
    estimatedMinutes: 1,
    text: 'Entre uma xícara de café e algumas linhas de código, o aprendiz do dojo pratica com calma. Cada tecla pressionada é um pequeno passo na evolução.',
  },
  {
    id: 'panda-journey',
    title: 'Jornada do Panda',
    description: 'Texto arcade para treinar sequência, atenção e fluidez.',
    category: 'Arcade',
    difficulty: 'Médio',
    estimatedMinutes: 2,
    text: 'O panda entrou na arena com atenção total. As teclas surgiam em sequência, o combo aumentava e cada acerto deixava o desafio mais intenso.',
  },
  {
    id: 'focus-precision',
    title: 'Foco e Precisão',
    description: 'Treino de controle para equilibrar velocidade e qualidade.',
    category: 'Treino',
    difficulty: 'Médio',
    estimatedMinutes: 2,
    text: 'Velocidade sem precisão causa retrabalho. Por isso, o verdadeiro mestre das teclas aprende primeiro a controlar os dedos antes de buscar recordes.',
  },
  {
    id: 'guardian-challenge',
    title: 'Desafio do Guardião',
    description: 'Texto mais exigente para praticar calma sob pressão.',
    category: 'Desafio',
    difficulty: 'Difícil',
    estimatedMinutes: 3,
    text: 'No último estágio do dojo, o guardião exige calma, ritmo e concentração. Apenas quem domina a base consegue avançar sem perder o controle.',
  },
];

export function getPracticeTextById(id: string | null): PracticeText | undefined {
  if (!id) return undefined;
  return PRACTICE_TEXTS.find((text) => text.id === id);
}
