import { pausar } from "./tempo.mjs";

export function eventos() {
  const minhaDiv = document.querySelector(".inputD");
  const meuLabel = document.querySelector(".label");

  minhaDiv.addEventListener("click", function () {
    meuLabel.click();
  });

  $("#reset").click(function () {
    location.reload();
  });

  // Pausar / retomar o timer
  $("#start").on("click", function () {
    const resultado = pausar();
    if (resultado === null) return; // timer ainda não iniciado

    if (resultado) {
      $(this).text("play_circle");
      $(".conteinerDigita").css("opacity", "0.45");
    } else {
      $(this).text("pause_circle");
      $(".conteinerDigita").css("opacity", "1");
    }
  });

  $(window).scroll(function () {
    const configIcon = $("#animaConfigOne");
    if ($(this).scrollTop() > 40) {
      configIcon.css("position", "");
      configIcon.addClass("fixed-icon");
    } else {
      configIcon.removeClass("fixed-icon");
    }
  });
}
