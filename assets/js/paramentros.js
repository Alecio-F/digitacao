export function paramentros() {
    function calcularPrecisao() {
        const letras = $(".letra");
        let totalLetrasCorretas = 0;
        let totalLetrasIncorretas = 0;
    
        letras.each(function () {
          const letra = $(this);
    
          if (letra.hasClass("correto")) {
            totalLetrasCorretas++;
          } else if (letra.hasClass("incorreto")) {
            totalLetrasIncorretas++;
          }
        });
    
        const totalLetrasDigitadas = totalLetrasCorretas + totalLetrasIncorretas;
    
        if (totalLetrasDigitadas > 0) {
          const precisao = (totalLetrasCorretas / totalLetrasDigitadas) * 100;
          $("#precisao .numeros").text(precisao.toFixed(0) + "%");
          $("#erros .numeros").text(totalLetrasIncorretas);
        }
      }
    }
    export {calcularPrecisao};