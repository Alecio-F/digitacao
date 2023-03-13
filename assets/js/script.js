const quotes = [
  "A vida é como andar de bicicleta. Para manter o equilíbrio, você deve continuar pedalando.",
  "Não existe um caminho para a felicidade. A felicidade é o caminho.",
  "Se você quer ir rápido, vá sozinho. Se você quer ir longe, vá acompanhado.",
  "O sucesso não é o resultado de um jogo, mas sim o resultado de um trabalho árduo e perseverança.",
  "O fracasso é apenas a oportunidade de começar novamente, desta vez de forma mais inteligente."
];


let quoteIndex = 0;
let numCharsTyped = 0;
let numMistakes = 0;
const quoteElem = $("#quote");
const inputElem = $("#input");
const startButton = $("#start");
const resetButton = $("#reset");
const wpmElem = $("#wpm");
const accuracyElem = $("#accuracy");

function displayQuote() {
  quoteElem.text(quotes[quoteIndex]);
}

function startTimer() {
  startTime = Date.now();
  timerInterval = setInterval(updateTimer, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function updateTimer() {
  const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
  wpmElem.text(`${Math.floor(numCharsTyped / 5 / (elapsedSeconds / 60))} WPM`);
}

function updateAccuracy() {
  const accuracy = 100 - ((numMistakes / numCharsTyped) * 100);
  accuracyElem.text(`${accuracy.toFixed(2)}% precisão`);
}

function handleInput() {
  const quote = quotes[quoteIndex];
  const input = inputElem.val();
  let newQuote = '';
  numMistakes = 0;
  for (let i = 0; i < quote.length; i++) {
    if (i < input.length) {
      if (input[i] !== quote[i]) {
        numMistakes++;
        newQuote += '<span class="mistake">' + quote[i] + '</span>';
      } else {
        newQuote += quote[i];
      }
    } else {
      newQuote += quote[i];
    }
  }
  quoteElem.html(newQuote);
  numCharsTyped = input.length;
  updateAccuracy();
  if (input === quote) {
    stopTimer();
    startButton.prop("disabled", false);
    quoteIndex++;
    if (quoteIndex === quotes.length) {
      quoteIndex = 0;
    }
    displayQuote();
    inputElem.val("");
  }
}

function reset() {
  quoteIndex = 0;
  numCharsTyped = 0;
  numMistakes = 0;
  displayQuote();
  inputElem.val("");
  inputElem.prop("disabled", true);
  wpmElem.text("");
  accuracyElem.text("");
}

startButton.click(function() {
  startButton.prop("disabled", true);
  resetButton.prop("disabled", false);
  inputElem.prop("disabled", false);
  inputElem.focus();
  startTimer();
});

resetButton.click(function() {
  startButton.prop("disabled", false);
  resetButton.prop("disabled", true);
  stopTimer();
  reset();
});

inputElem.on("input", handleInput);

reset();
