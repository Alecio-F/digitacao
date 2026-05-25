import { textodigitacao } from './typing.mjs';
import { config } from './config.mjs';
import { dicas } from './script.mjs';

$(document).ready(function () {
  config();

  const temTesteDigitacao = $("#digitandoTexto").length > 0;
  const controleDigitacao = temTesteDigitacao ? textodigitacao() : null;

  if ($(".dica").length > 0) {
    dicas();
  }

  // "Fazer Novamente" → recarrega (estado limpo garantido)
  $(document).on("click", "#proxima-acao .acao:nth-child(1)", function () {
    location.reload();
  });

  // "Próximo Texto" → reinicia sem recarregar a página
  $(document).on("click", "#proxima-acao .acao:nth-child(2)", function () {
    controleDigitacao?.reiniciar();
  });
});
