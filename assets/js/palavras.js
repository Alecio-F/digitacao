 export function palavras() {
    function palavrasAleatorias() {
        const aleatorioIndex = Math.ceil(Math.random() * quantidadePalavras);
        return palavras[aleatorioIndex - 1];
      }
      let posicaoAtual = 0;
    
      function palavrasNaOrdem() {
        if (posicaoAtual < palavras.length) {
          const palavra = palavras[posicaoAtual];
          posicaoAtual++;
          return palavra;
        } else {
          posicaoAtual = 0;
          return palavras[posicaoAtual];
        }
      }
    
      function formatarPalavras(palavra) {
        const letras = palavra
          .split("")
          .map((letra) => `<span class="letra">${letra}</span>`)
          .join("");
        return `<div class="palavra">${letras}</div>`;
      }
    
      const divAmostraTexto = $("#amostraTexto");
      divAmostraTexto.text(palavras.join(" "));
 }