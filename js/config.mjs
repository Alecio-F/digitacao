export function config() {
  // animação rotação da img config
  $("body").css("display", "block");

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

  $('#inputConfig').change(function() {
    if ($(this).is(':checked')) {
      $('.menu-engrenagem').removeClass('hide').addClass('show');
    } else {
      $('.menu-engrenagem').removeClass('show').addClass('hide');
    }
  });

  // mudar tema dark e light
  var ativo = localStorage.getItem("ativo");
  if (ativo !== null) {
    $("#btn").addClass("ativo");
    $('body').addClass('darkTheme');
    $('.inputD').addClass('inputDDark');
    $('.testeDigita').addClass('testeDigitaDarktheme');
    $('.resumo').addClass('resumoDark');
    $('.pratique').addClass('pratiqueDark');
    $('.conPratique').addClass('conPratiqueDark');
    $('.aprendaS').addClass('aprendaSDark');
    $('.conta').addClass('contaDark');
  }

  $("#btn").on("click", function() {
    $(this).toggleClass("ativo");

    if ($(this).hasClass("ativo")) {
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
};


