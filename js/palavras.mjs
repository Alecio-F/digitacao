const palavras =
  "casa amor feliz trabalho cidade carro família sol comida rua escola dinheiro gato cachorro rua livro amigo café dia noite amor música filme viagem chuva montanha árvore festa criança jovem velho escola praia mar rio felicidade tristeza computador celular televisão notícia foto comida bebida encontro jantar almoço café da manhã lanche escola universidade professor estudante escritório reunião projeto recompensa desafio conquista esforço sucesso falha vitória derrota argumento opinião política governo democracia liberdade direitos humanos paz guerra casamento divórcio namoro paquera flerte mensagem telefonema reunião conferência estudo aprendizado experiência testemunha crime investigação polícia prisão julgamento sentença juiz júri verdade mentira história romance poesia pintura escultura arte artista música dança teatro ator atriz espetáculo plateia público aplausos palco luz som maquiagem figurino cena beijo abraço sorriso lágrima medo coragem felicidade tristeza surpresa alegria raiva desprezo saudade memória sonho desejo esperança futuro presente passado vida morte nascimento despedida encontro separação viuvez".split(
    " "
  );
const quantidadePalavras = palavras.length;


export function palavrasAleatorias() {
  const aleatorioIndex = Math.ceil(Math.random() * quantidadePalavras);
  return palavras[aleatorioIndex - 1];
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

$(document).ready(function() {
  const divAmostraTexto = $("#amostraTexto");
  divAmostraTexto.text(palavras.join(" "));
});


