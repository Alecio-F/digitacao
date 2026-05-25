export function createAudioManager() {
  let context = null;
  let enabled = true;

  function getContext() {
    if (!enabled) {
      return null;
    }
    if (!context) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) {
        enabled = false;
        return null;
      }
      context = new AudioContext();
    }
    if (context.state === "suspended") {
      context.resume();
    }
    return context;
  }

  function tone(frequency, duration = 0.08, type = "sine", volume = 0.08) {
    const ctx = getContext();
    if (!ctx) {
      return;
    }

    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + duration);
  }

  function miss() {
    const ctx = getContext();
    if (!ctx) {
      return;
    }

    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "sawtooth";
    oscillator.frequency.setValueAtTime(140, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(55, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.12);
  }

  return {
    unlock() {
      getContext();
    },
    hit(rating) {
      if (rating === "PERFECT") {
        tone(523.25, 0.1, "sine", 0.08);
      } else if (rating === "GOOD") {
        tone(440, 0.08, "triangle", 0.07);
      } else {
        tone(349.23, 0.08, "square", 0.045);
      }
    },
    miss,
    levelUp() {
      tone(523.25, 0.07, "triangle", 0.06);
      setTimeout(() => tone(659.25, 0.08, "triangle", 0.06), 70);
      setTimeout(() => tone(783.99, 0.1, "triangle", 0.06), 140);
    },
    gameOver() {
      tone(220, 0.12, "sawtooth", 0.06);
      setTimeout(() => tone(164.81, 0.14, "sawtooth", 0.06), 120);
      setTimeout(() => tone(110, 0.18, "sawtooth", 0.06), 260);
    },
  };
}
