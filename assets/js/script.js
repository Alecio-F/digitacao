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

function addClass(el, nome) {
  el.className += ' ' + nome;
}
function removeClass(el, nome) {
  el.className = el.className.replace(nome, '');
}

function palavrasAleatorias() {
  const aleatorioIndex = Math.ceil(Math.random() * quantidadePalavras)
  return palavras[aleatorioIndex - 1]
}

function formatarPalavras(palavra=' ') {
  return `<div class="palavra">
    <span class="letra">${palavra.split('').join('</span><span class="letra">')}</span>
  </div>`
}

function digitacaoTexto() {
  document.getElementById('palavras').innerHTML = '';
  for (let i = 0; i < 200; i++) {
    document.getElementById('palavras').innerHTML += formatarPalavras(palavrasAleatorias());
  }
  addClass(document.querySelector('.palavra'), 'atual');
  addClass(document.querySelector('.letra'), 'atual');
  addClass(document)
}


document.getElementById('digitandoTexto').addEventListener('keyup', ev => {
  
  const tecla = ev.target.value;
  ev.target.value = '';
  const palavraAtual = document.querySelector('.palavra.atual');
  const letraAtual = document.querySelector('.letra.atual');
  const expected = letraAtual?.innerHTML;
  const letra = tecla.length === 1 &&  tecla !== ' ';
  const espaco = tecla === ' ';

  console.log({tecla, expected})

  if (letra) {
    if (letraAtual) {
      addClass(letraAtual, tecla === expected ? 'correto' : 'incorreto');
      removeClass(letraAtual, 'atual');
      if (letraAtual.nextSibling) {
        addClass(letraAtual.nextSibling, 'atual');
      }
    }
  }

  if (espaco) {
    if (expected !== ' ') {
      const invalidarLetras = [...document.querySelectorAll('.palavra.atual .letra:not(.correto)')]
      invalidarLetras.forEach(letra => {
        addClass(letra, 'incorreto');
      });
    }

    removeClass(palavraAtual, 'atual')
    addClass(palavraAtual.nextSibling, 'atual')

    if (letraAtual) {
      removeClass(letraAtual, 'atual')
    }
    addClass(palavraAtual.nextSibling.firstChild, 'atual');
  }
})

$(document).ready(digitacaoTexto())

