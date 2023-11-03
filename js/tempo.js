
const tempoPraticaSelecionado = localStorage.getItem("tempoPratica") || "1";

$("#tempoPratica").val(tempoPraticaSelecionado);
const tempoSelecionado = $("#tempoPratica").val();

$("#tempoPratica").change(function () {
  const novoTempoSelecionado = $(this).val();
  localStorage.setItem("tempoPratica", novoTempoSelecionado);
});

function formatarTempo(segundos) {
  const minutos = Math.floor(segundos / 60);
  const segundosRestantes = segundos % 60;

  const minutosFormatados = minutos.toString().padStart(2);
  const segundosFormatados = segundosRestantes.toString().padStart(2, "0");

  return `${minutosFormatados}:${segundosFormatados}`;
}

$("#tempoS").text(formatarTempo(tempoSelecionado * 60));
$(".tempo-desempenho .numeros").text(formatarTempo(tempoSelecionado * 60));
let contagemIntervalo;
let contagemIniciada = false;
let digitando = false;
let ppm = 0;

// Função para iniciar a contagem regressiva
export function iniciouContagem() {
  if (!contagemIniciada) {
    contagemIniciada = true;
    let tempoRestante = tempoSelecionado * 60; // Converter para segundos

    contagemIntervalo = setInterval(function () {
      if (tempoRestante > 0) {
        tempoRestante--;
        $("#tempoS").text(formatarTempo(tempoRestante));

        // Calcule o PPM em tempo real
        const palavrasDigitadasNoIntervalo = $("#digitandoTexto")
          .val()
          .split(" ").length;

        if (tempoRestante > 0) {
          ppm = Math.round(
            (palavrasDigitadasNoIntervalo /
              (tempoSelecionado * 60 - tempoRestante)) *
              60
          );
        }
        $("#ppm .numeros").text(ppm);
        const textoDigitado = $("#digitandoTexto").val();
        const caracteresDigitados = textoDigitado.length;
        const minutosDecorridos = (tempoSelecionado * 60 - tempoRestante) / 60;

        // Verifica se minutosDecorridos é maior que zero para evitar divisão por zero
        const cpm =
          minutosDecorridos > 0
            ? Math.round(caracteresDigitados / minutosDecorridos)
            : 0;
        $("#cpm .numeros").text(cpm);
      } else {
        clearInterval(contagemIntervalo);
        $(".parametros").fadeOut(195).hide();
        $(".conteinerDigita").fadeOut(200).hide();
        $("#desempenhoTexto").fadeIn(200).show();
      }
    }, 1000);
  }
}
