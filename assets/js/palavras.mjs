const palavras =
  "olá bom dia boa tarde boa noite oi tchau adeus por favor obrigado desculpe sim não talvez hoje ontem amanhã agora logo sempre nunca aqui lá ali aí acolá bem mal rápido devagar alto baixo longe perto dentro fora em dia às vezes muito pouco mais menos com sem também já ainda só apenas até depois antes então assim como porque se mas e ou para por comigo contigo conosco convosco ele ela nós vós eles elas você eu tu meu minha teu tua seu sua nosso nossa vosso vossa dele dela nele nela aquilo este esta isso aí muitos poucos algum nenhum todo cada qualquer esteja seja faça está estamos sejam tenha tenham fazer pode poderia podia vai indo vem vindo para por sobre entre sob acima abaixo através a partir de contra durante enquanto quando onde quem cujo qual quanto quantos quantas neste nesse agora antes depois ainda minha teu nossa vosso esta estas esses essas o a os as um uma uns umas outro outra outros outras alguma algum algumas alguns pouca poucos muita muitas estávamos estiveram esteve estavam estive estivemos estiveste estivestes estiveram estivéramos estejamos estejam esteja sendo sido que você está como ir pelo pela pelos pelas".split(" ");
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

