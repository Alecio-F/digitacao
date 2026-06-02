export function createAudioManager(initialEnabled = true) {
  let context: AudioContext | null = null;
  let enabled = initialEnabled;
  let unsupported = false;

  function getContext(): AudioContext | null {
    if (!enabled || unsupported) return null;
    if (!context) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) { unsupported = true; return null; }
      try {
        context = new AC();
      } catch {
        unsupported = true;
        return null;
      }
    }
    if (context.state === 'suspended') context.resume();
    return context;
  }

  function tone(frequency: number, duration = 0.08, type: OscillatorType = 'sine', volume = 0.08) {
    const ctx = getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }

  return {
    setEnabled(value: boolean) { enabled = value; },
    unlock() { getContext(); },
    hit(rating: string) {
      if (rating === 'PERFECT') tone(523.25, 0.1, 'sine', 0.08);
      else if (rating === 'GOOD') tone(440, 0.08, 'triangle', 0.07);
      else tone(349.23, 0.08, 'square', 0.045);
    },
    miss() {
      const ctx = getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(55, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    },
    levelUp() {
      tone(523.25, 0.07, 'triangle', 0.06);
      setTimeout(() => tone(659.25, 0.08, 'triangle', 0.06), 70);
      setTimeout(() => tone(783.99, 0.1, 'triangle', 0.06), 140);
    },
    gameOver() {
      tone(220, 0.12, 'sawtooth', 0.06);
      setTimeout(() => tone(164.81, 0.14, 'sawtooth', 0.06), 120);
      setTimeout(() => tone(110, 0.18, 'sawtooth', 0.06), 260);
    },
  };
}

export type AudioManager = ReturnType<typeof createAudioManager>;
