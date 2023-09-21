$(document).ready(function() {
  $("body").css("display", "block");
});

$(document).ready(function() {
  var girou = false;

  $("#config").click(function() {
    if (!girou) {
      $(this).css("transform", "rotate(20deg)");
      girou = true;
    } else {
      $(this).css("transform", "rotate(0deg)");
      girou = false;
    }
  });
});

$(document).ready(function() {
  $('#inputConfig').change(function() {
    if ($(this).is(':checked')) {
      $('.menu-engrenagem').removeClass('hide').addClass('show');
    } else {
      $('.menu-engrenagem').removeClass('show').addClass('hide');
    }
  });
});

$(document).ready(function() {
  // Verifica se a classe "ativo" está armazenada no localStorage
  var ativo = localStorage.getItem("ativo");
  if (ativo !== null) {
    $(".btn").addClass("ativo");
    $('body').addClass('darkTheme');
    $('.inputD').addClass('inputDDark');
    $('.testeDigita').addClass('testeDigitaDarktheme');
    $('.resumo').addClass('resumoDark');
    $('.pratique').addClass('pratiqueDark');
    $('.conPratique').addClass('conPratiqueDark');
    $('.aprendaS').addClass('aprendaSDark');
    $('.conta').addClass('contaDark');
  }

  // Manipulador de evento de clique
  $(".btn").on("click", function() {
    // Adiciona ou remove a classe "ativo"
    $(this).toggleClass("ativo");

    // Verifica se a classe "ativo" está presente na div
    if ($(this).hasClass("ativo")) {
      // Armazena a classe "ativo" no localStorage
      localStorage.setItem("ativo", "true");
      $('body').addClass('darkTheme');
      $('.inputD').addClass('inputDDark');
      $('.testeDigita').addClass('testeDigitaDarktheme');
      $('.resumo').addClass('resumoDark');
      $('.pratique').addClass('pratiqueDark');
      $('.conPratique').addClass('conPratiqueDark');
      $('.aprendaS').addClass('aprendaSDark');
      $('.conta').addClass('contaDark');
    } else {
      // Remove a classe "ativo" do localStorage
      localStorage.removeItem("ativo");
      $('body').removeClass('darkTheme');
      $('.inputD').removeClass('inputDDark');
      $('.testeDigita').removeClass('testeDigitaDarktheme');
      $('.resumo').removeClass('resumoDark');
      $('.pratique').removeClass('pratiqueDark');
      $('.conPratique').removeClass('conPratiqueDark');
      $('.aprendaS').removeClass('aprendaSDark');
      $('.conta').removeClass('contaDark');
    }
  });
});

// scrip digitação

const palavras = 'Maçã Casa Gato Sol Livro Água Amigo Felicidade Janela Montanha Música Chocolate Carro Flores Arco-íris Praia Estrela Aventura Pintura Dança Bicicleta Sorriso Piano Cachorro Chuva Amor Paz Coração Lua Feliz Sonho Beleza Rir Liberdade Maravilha Brilho Canção Serenidade Oceano Espiritualidade Inspiração Vida Esperança Calma Harmonia Viagem Silêncio Abraço Paixão Mistério Alegria Respiração Encanto Generosidade Agradecer Meditação União Sucesso Reflexão Sonhar Conexão Descoberta Fantasia Respeito Sabor Criança Imaginação Verdade Carinho Desafio Surpresa'.split(' ');
const quantidadePalavras = palavras.length;
const reset = document.querySelector('#reset')

reset.addEventListener('click', function() {
  digitacaoTexto()
});

function addClass(el, nome) {
  el.className += ' ' + nome;
}
function removeClass(el, nome) {
  el.className = el.className.replace(nome, '');
}

// Pegar palavras aleatoriamente 

function palavrasAleatorias() {
  const aleatorioIndex = Math.ceil(Math.random() * quantidadePalavras)
  return palavras[aleatorioIndex - 1]
}

// Formar palavras separadas por div e cada letra em um span

function formatarPalavras(palavra) {
  const letras = palavra.split('').map(letra => `<span class="letra">${letra}</span>`).join('');
  return `<div class="palavra">${letras}</div>`;
}

// mover cursor

function atualizarCursorContinuamente() {
  setInterval(() => {
    const proximaLetra = document.querySelector('.letra.atual');
    const proximaPalavra = document.querySelector('.palavra.atual');
    const cursor = document.getElementById('cursor');
    const digitacaoDoTexto = document.getElementById('digitacaoDoTexto');
    const parentRect = digitacaoDoTexto.getBoundingClientRect();
    const letraRect = proximaLetra?.getBoundingClientRect();
    const palavraRect = proximaPalavra.getBoundingClientRect();

    cursor.style.top = (letraRect || palavraRect).top - parentRect.top + 'px';
    cursor.style.left = (letraRect || palavraRect)[proximaLetra ? 'left' : 'right'] - parentRect.left + 'px';
  });
}

function digitacaoTexto() {
  document.getElementById('palavras').innerHTML = '';
  for (let i = 0; i < 200; i++) {
    document.getElementById('palavras').innerHTML += formatarPalavras(palavrasAleatorias(), i);
  }
  addClass(document.querySelector('.palavra'), 'atual');
  addClass(document.querySelector('.letra'), 'atual');

}

document.getElementById('digitandoTexto').addEventListener('keydown', ev => {
  const tecla = ev.key;
  const palavraAtual = document.querySelector('.palavra.atual');
  const letraAtual = document.querySelector('.letra.atual');
  const expected = letraAtual?.innerHTML || ' ';
  const letra = tecla.length === 1 && tecla !== ' ';
  const espaco = tecla === ' ';
  const deleteLetra = tecla === 'Backspace';
  const primeiraLetra = letraAtual === palavraAtual.firstChild;

  console.log({tecla, expected})

  // letra extras incorretas

  if (letra) {
    if (letraAtual) {
      addClass(letraAtual, tecla === expected ? 'correto' : 'incorreto');
      removeClass(letraAtual, 'atual');
      if (letraAtual.nextSibling) {
        addClass(letraAtual.nextSibling, 'atual');
      }
    } else {
      const letrasIncorretasAnteriores = palavraAtual.querySelectorAll('.letra.incorreto.extra');
      if (letrasIncorretasAnteriores.length > 5) {
        letrasIncorretasAnteriores.forEach((letra, index) => {
          if (index === letrasIncorretasAnteriores.length - 1) {
            letra.remove();
          }
        });
      }

      const letraIncorreta = document.createElement('span')
      letraIncorreta.innerHTML = tecla;
      letraIncorreta.className = 'letra incorreto extra'
      palavraAtual.appendChild(letraIncorreta)
      
    }
  }

  // Evento ao clicar espaço

  if (espaco) {
    if (expected !== ' ') {
      const invalidarLetras = [...document.querySelectorAll('.palavra.atual .letra:not(.correto)')]
      invalidarLetras.forEach(letra => {
        addClass(letra, 'incorreto');
      });
    }

    removeClass(palavraAtual, 'atual');
    addClass(palavraAtual.nextSibling, 'atual');

    if (letraAtual) {
      removeClass(letraAtual, 'atual');
    }
    addClass(palavraAtual.nextSibling.firstChild, 'atual');
  }

  // Evento ao clicar Backspace

  if (deleteLetra) {
    if (letraAtual && primeiraLetra) {
      if (palavraAtual.previousElementSibling) {
        removeClass(palavraAtual, 'atual');
        addClass(palavraAtual.previousSibling, 'atual');
        removeClass(letraAtual, 'atual');
        addClass(palavraAtual.previousSibling.lastChild, 'atual');
        removeClass(palavraAtual.previousSibling.lastChild, 'incorreto');
        removeClass(palavraAtual.previousSibling.lastChild, 'correto');
      }
    }
  
    if (letraAtual && !primeiraLetra) {
      removeClass(letraAtual, 'atual');
      addClass(letraAtual.previousSibling, 'atual');
      removeClass(letraAtual.previousSibling, 'correto');
      removeClass(letraAtual.previousSibling, 'incorreto');
    }

    if (!letraAtual) {
      addClass(palavraAtual.lastChild, 'atual')
      removeClass(palavraAtual.lastChild, 'correto');
      removeClass(palavraAtual.lastChild, 'incorreto');
    }

  }

  // mover linhas
  const digitacaoDoTexto = document.getElementById('digitacaoDoTexto');
  if (palavraAtual.getBoundingClientRect().top > digitacaoDoTexto.getBoundingClientRect().top + 25) {
    const palavras = document.getElementById('palavras');
    const margin = parseInt(palavras.style.marginTop || '0px');
    palavras.style.marginTop = (margin - 30) + 'px';
  }
})

document.addEventListener('DOMContentLoaded', () => {
  digitacaoTexto();
  atualizarCursorContinuamente();
});


$(document).ready(digitacaoTexto())
