export function calcularPrecisao(totalLetrasCorretas, totalLetrasIncorretas) {
  const totalDigitado = totalLetrasCorretas + totalLetrasIncorretas;
  if (totalDigitado > 0) {
    const precisao = (totalLetrasCorretas / totalDigitado) * 100;
    $("#precisao .numeros").text(precisao.toFixed(0) + "%");
    $("#erros .numeros").text(totalLetrasIncorretas);
    $("[data-live-precision]").text(precisao.toFixed(0) + "%");
    $("[data-live-errors]").text(totalLetrasIncorretas);
  } else {
    $("[data-live-precision]").text("0%");
    $("[data-live-errors]").text("0");
  }
}
