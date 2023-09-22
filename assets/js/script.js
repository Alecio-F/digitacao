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

$(document).ready(function() {
  const palavras = 'Olá! Hoje é um dia especial, o aniversário de 30 anos da Maria. Ela nasceu em 15 de setembro de 1993. Para celebrar essa ocasião, planejamos uma festa incrível com muitas surpresas. O cardápio inclui pratos como Espaguete à carbonara, Frango xadrez, Torta de maçã. Também teremos música ao vivo com a banda Os Amigos do Rock. Esperamos que você possa se juntar a nós nesta festa emocionante. Por favor, confirme sua presença até sexta-feira. Atenciosamente, Equipe de organização da festa.'.split(' ');
  const quantidadePalavras = palavras.length;
  
  $('#reset').click(function() {
    digitacaoTexto();
    atualizarCursorContinuamente();
    $('#palavras').css('margin-top', '0px');
  });

  function addClass(el, nome) {
    el.addClass(nome);
  }

  function removeClass(el, nome) {
    el.removeClass(nome);
  }
  
  function palavrasAleatorias() {
    const aleatorioIndex = Math.ceil(Math.random() * quantidadePalavras);
    return palavras[aleatorioIndex - 1];
  }

  function formatarPalavras(palavra) {
    const letras = palavra.split('').map(letra => `<span class="letra">${letra}</span>`).join('');
    return `<div class="palavra">${letras}</div>`;
  }
  

  function atualizarCursorContinuamente() {
    setInterval(function() {
      const proximaLetra = $('.letra.atual');
      const proximaPalavra = $('.palavra.atual');
      const cursor = $('#cursor');
      const digitacaoDoTexto = $('#digitacaoDoTexto');
      const parentRect = digitacaoDoTexto[0].getBoundingClientRect();
      const letraRect = proximaLetra[0]?.getBoundingClientRect();
      const palavraRect = proximaPalavra[0].getBoundingClientRect();

      cursor.css('top', (letraRect || palavraRect).top - parentRect.top + -2 + 'px');
      cursor.css('left', (letraRect || palavraRect)[proximaLetra[0] ? 'left' : 'right'] - parentRect.left + -2 + 'px');
    });
  }

  const cursor = $('#cursor');
  const inputElement = $('#digitandoTexto');
  let isTyping = false;
  let cursorAnimationTimeout;

  inputElement.on('input', function() {
    if (!isTyping) {
      cursor.css('animation', 'none');
      isTyping = true;
    }

    clearTimeout(cursorAnimationTimeout);
    cursorAnimationTimeout = setTimeout(function() {
      cursor.css('animation', 'blink 0.8s infinite');
      isTyping = false;
    }, 700);
  });

  function digitacaoTexto() {
    $('#palavras').html('');
    for (let i = 0; i < 200; i++) {
      $('#palavras').append(formatarPalavras(palavrasAleatorias(), i));
    }
    addClass($('.palavra').first(), 'atual');
    addClass($('.letra').first(), 'atual');
  }

  $('#digitandoTexto').keydown(function(ev) {
    const tecla = ev.key;
    const palavraAtual = $('.palavra.atual');
    const letraAtual = $('.letra.atual');
    const expected = letraAtual[0]?.innerHTML || ' ';
    const letra = tecla.length === 1 && tecla !== ' ';
    const espaco = tecla === ' ';
    const deleteLetra = tecla === 'Backspace';
    const primeiraLetra = letraAtual[0] === palavraAtual.find('.letra').first()[0];

    console.log({tecla, expected})

    // letra extras incorretas
    const letraIncorreta = $('<span class="letra incorreto extra"></span>').html(tecla);
    if (letra) {
      if (letraAtual[0]) {
        addClass(letraAtual, tecla === expected ? 'correto' : 'incorreto');
        removeClass(letraAtual, 'atual');
        if (letraAtual.next()[0]) {
          addClass(letraAtual.next(), 'atual');
        }
      } else {
        const letrasIncorretasAnteriores = palavraAtual.find('.letra.incorreto.extra');
        if (letrasIncorretasAnteriores.length > 5) {
          letrasIncorretasAnteriores.each(function(index, letra) {
            if (index === letrasIncorretasAnteriores.length - 1) {
              letra.remove();
            }
          });
        }
        palavraAtual.append(letraIncorreta);
      }
    }

    // Condicional ao digitar espaço
    if (espaco) {
      if (letraAtual.length > 0) {
        addClass(letraAtual, 'incorreto')
        removeClass(letraAtual, 'atual')
        if (letraAtual.next()[0]) {
          addClass(letraAtual.next(), 'atual');
        }
      } else {
        removeClass(palavraAtual, 'atual')
        addClass(palavraAtual.next(), 'atual')
        addClass(palavraAtual.next().find('.letra').first(), 'atual');
      }
    }

    // Condicional ao digitar Backspace
    if (deleteLetra) {
      const letrasDaPalavra = palavraAtual.find('.letra');

      for (let i = letrasDaPalavra.length - 1; i >= 0; i--) {
        const letra = letrasDaPalavra[i];
        if ($(letra).hasClass('incorreto') && $(letra).hasClass('extra')) {
          $(letra).remove();
          return;
        }
      }

      if (letraAtual[0] && primeiraLetra) {
        if (palavraAtual.prev()[0]) {
          removeClass(palavraAtual, 'atual');
          addClass(palavraAtual.prev(), 'atual');
          removeClass(letraAtual, 'atual');
        }
      }

      if (letraAtual[0] && !primeiraLetra) {
        removeClass(letraAtual, 'atual');
        addClass(letraAtual.prev(), 'atual');
        removeClass(letraAtual.prev(), 'correto');
        removeClass(letraAtual.prev(), 'incorreto');
      }

      if (!letraAtual[0]) {
        addClass(palavraAtual.find('.letra').last(), 'atual');
        removeClass(palavraAtual.find('.letra').last(), 'correto');
        removeClass(palavraAtual.find('.letra').last(), 'incorreto');
      }
    }

    // mover linhas
    const digitacaoDoTexto = $('#digitacaoDoTexto');
    if (palavraAtual[0].getBoundingClientRect().top > digitacaoDoTexto[0].getBoundingClientRect().top + 35) {
      const palavras = $('#palavras');
      const margin = parseInt(palavras.css('margin-top') || '0px');
      palavras.css('margin-top', (margin - 26) + 'px');
    }
  });

  digitacaoTexto();
  atualizarCursorContinuamente();
});
