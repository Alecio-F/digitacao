const BASE_WORDS =
  'olá bom dia boa tarde boa noite oi tchau adeus por favor obrigado desculpe sim não talvez hoje ontem amanhã agora logo sempre nunca aqui lá ali aí bem mal rápido devagar alto baixo longe perto dentro fora muito pouco mais menos com sem também já ainda só apenas até depois antes então assim como porque se mas e ou para por ele ela nós eles elas você eu tu meu minha teu tua seu sua nosso nossa dele dela aquilo este esta isso muitos poucos algum nenhum todo cada qualquer esteja seja faça está estamos sejam tenha tenham fazer pode vai indo vem para sobre entre sob acima abaixo através quando onde quem qual quanto quantas neste nesse agora antes depois ainda nossa esta essas o a os as um uma uns umas outro outra outros outras alguma algumas alguns estávamos estiveram esteve estavam'.split(
    ' ',
  );

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

let pool: string[] = shuffle(BASE_WORDS);
let poolIndex = 0;

export function nextRandomWord(): string {
  const word = pool[poolIndex];
  poolIndex = (poolIndex + 1) % pool.length;
  if (poolIndex === 0) pool = shuffle(BASE_WORDS);
  return word;
}

export function resetWordPool(): void {
  pool = shuffle(BASE_WORDS);
  poolIndex = 0;
}
