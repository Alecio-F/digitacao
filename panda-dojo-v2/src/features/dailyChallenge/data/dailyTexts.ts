import type { DailyChallengeText } from '../types';

/**
 * Banco de textos do Desafio Diário. O texto do dia é escolhido de forma
 * determinística pela data (ver getDailyChallenge), então todos veem o mesmo
 * texto no mesmo dia. Mantenha textos curtos/médios em português.
 */
export const DAILY_TEXTS: DailyChallengeText[] = [
  {
    id: 'daily-dojo-foco',
    title: 'Foco do Dojo',
    difficulty: 'Fácil',
    text: 'No dojo do panda, cada tecla importa. Respire fundo, mantenha o foco e digite com calma para evoluir um pouco todo dia.',
  },
  {
    id: 'daily-panda-treino',
    title: 'Treino do Panda',
    difficulty: 'Fácil',
    text: 'O panda treina sem pressa. Primeiro a precisão, depois a velocidade. Com paciência, os dedos aprendem o caminho das teclas.',
  },
  {
    id: 'daily-ritmo-bambu',
    title: 'Ritmo de Bambu',
    difficulty: 'Médio',
    text: 'Assim como o bambu cresce em silêncio, sua digitação melhora a cada treino. Encontre um ritmo constante e deixe o combo crescer.',
  },
  {
    id: 'daily-tecnologia',
    title: 'Código e Café',
    difficulty: 'Médio',
    text: 'Entre uma linha de código e um gole de café, o aprendiz do dojo pratica. Tecnologia é treino diário: erre, corrija e repita com atenção.',
  },
  {
    id: 'daily-precisao',
    title: 'Toque Preciso',
    difficulty: 'Médio',
    text: 'Velocidade sem precisão gera retrabalho. O mestre das teclas digita devagar quando aprende e rápido quando confia nos próprios dedos.',
  },
  {
    id: 'daily-arcade',
    title: 'Modo Arcade',
    difficulty: 'Fácil',
    text: 'Luzes, blocos e reflexos rápidos. No arcade do panda, cada acerto vale ponto e cada combo acende a tela. Jogue, treine e divirta-se.',
  },
  {
    id: 'daily-disciplina',
    title: 'Disciplina Diária',
    difficulty: 'Médio',
    text: 'A constância vence o talento quando o talento não treina. Um desafio por dia mantém os dedos afiados e a mente concentrada no objetivo.',
  },
  {
    id: 'daily-respiracao',
    title: 'Respiração e Postura',
    difficulty: 'Fácil',
    text: 'Sente-se ereto, ombros relaxados e pulsos leves. Boa postura é metade do caminho para digitar mais rápido sem cansar as mãos.',
  },
  {
    id: 'daily-guardiao',
    title: 'O Guardião do Teclado',
    difficulty: 'Difícil',
    text: 'No último estágio do dojo, o guardião exige calma sob pressão. Apenas quem domina a base, mantém o ritmo e respeita cada acento consegue avançar até o fim.',
  },
  {
    id: 'daily-letras-base',
    title: 'Linha de Base',
    difficulty: 'Fácil',
    text: 'As mãos repousam na linha de base e dali partem para todas as teclas. Volte sempre para casa: A, S, D, F, J, K, L e o cedilha.',
  },
  {
    id: 'daily-acentos',
    title: 'Acentos com Cuidado',
    difficulty: 'Difícil',
    text: 'Pão, coração, manhã e atenção. Acentuar exige cuidado: o til, o circunflexo e a cedilha pedem um toque firme e preciso para não escapar.',
  },
  {
    id: 'daily-jornada',
    title: 'Jornada do Aprendiz',
    difficulty: 'Médio',
    text: 'Todo mestre já foi aprendiz. Comece devagar, comemore cada recorde e lembre: o progresso aparece na soma de muitos treinos pequenos.',
  },
  {
    id: 'daily-velocidade',
    title: 'Velocidade com Controle',
    difficulty: 'Difícil',
    text: 'Aumentar o ritmo é tentador, mas o controle é o que sustenta a velocidade. Acelere apenas quando os erros pararem de aparecer na sua frente.',
  },
  {
    id: 'daily-combo',
    title: 'Combo Perfeito',
    difficulty: 'Médio',
    text: 'Cada acerto seguido aumenta o combo e a confiança. Mantenha a sequência limpa, evite o erro bobo e veja sua pontuação subir sem parar.',
  },
  {
    id: 'daily-mente-calma',
    title: 'Mente Calma, Dedos Rápidos',
    difficulty: 'Fácil',
    text: 'Mente calma, dedos rápidos. Quando a pressa some, a precisão aparece. Digite como o panda treina: leve, atento e sempre constante.',
  },
  {
    id: 'daily-desafio-final',
    title: 'Desafio do Dia',
    difficulty: 'Difícil',
    text: 'Hoje o desafio é seu. Misture velocidade, precisão e foco em um único treino, supere o resultado de ontem e compartilhe sua marca com os amigos do dojo.',
  },
];
