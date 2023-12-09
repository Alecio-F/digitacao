const palavras =
  "olá bom dia boa tarde boa noite oi tchau adeus por favor obrigado desculpe sim não talvez hoje ontem amanhã agora logo sempre nunca aqui lá ali aí acolá bem mal rápido devagar alto baixo longe perto dentro fora hoje em dia às vezes muito pouco mais menos com sem também já ainda só apenas até depois antes então assim como porque se mas e ou para por comigo contigo conosco convosco ele ela nós vós eles elas você vocês eu tu meu minha teu tua seu sua nosso nossa vosso vossa dele dela nele nela aquilo este esta isso isso aí aqui ali lá muitos poucos algum nenhum todo nenhum cada qualquer esteja seja faça está estamos sejam tenha tenham fazer pode poder pode poderia podia vai indo vem vindo aqui ali lá para por sobre entre sob acima abaixo através a partir de para com contra durante antes depois enquanto quando onde quem cujo qual quanto quantos quantas quem cujo qual quanto quantos quantas neste nesse aqui ali lá agora antes depois ainda quando onde quem cujo qual quanto quantos quantas comigo contigo conosco convosco para por sob sobre sob acima abaixo através em porque mas então quanto como quando onde quem cujo qual quanto quantos quantas minha meu tua teu nossa nosso vossa vosso nesta neste nesse nesse aqui ali lá agora antes depois ainda quando onde quem cujo qual quanto quantos quantas nesta neste nesse nesse minha meu tua teu nossa nosso vossa vosso seja este esta isto estas estes estas esses essas o a os as um uma uns umas outro outra outros outras alguma algum algumas alguns algumas pouco pouca poucos poucas muita muito muitas muitos muitas estávamos estiveram esteve estavam estive estivemos estiveste estivestes esteve estiveram estivéramos estejamos estejam esteja seja sendo sido que se você está como ir pelo pela pelos pelas para por sob sobre sob acima abaixo através em porque mas então quanto como quando onde quem cujo qual quanto quantos quantas minha meu tua teu nossa nosso vossa vosso nesta neste nesse nesse aqui ali lá agora antes depois ainda quando onde quem cujo qual quanto quantos quantas comigo contigo conosco convosco para por sob sobre sob acima abaixo através em porque mas então quanto como quando onde quem cujo qual quanto quantos quantas minha meu tua teu nossa nosso vossa vosso seja este esta isto estas estes estas esses essas o a os as um uma uns umas outro outra outros outras alguma algum".split(" ");
shuffle(palavras);

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

export function palavrasAleatorias() {
  return palavras.pop();
}

let posicaoAtual = 0;

 export function palavrasNaOrdem() {
  if (posicaoAtual < palavras.length) {
    palavra = palavras[posicaoAtual];
    posicaoAtual++;
    return palavra;
  } else {
    posicaoAtual = 0;
    return palavras[posicaoAtual];
  }
}

export function formatarPalavras(palavra) {
  const letras = palavra.split("").map((letra) => `<span class="letra">${letra}</span>`).join("");
  return `<div class="palavra">${letras}</div>`;
}

