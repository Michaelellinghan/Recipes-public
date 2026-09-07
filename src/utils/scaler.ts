export function formatAmount(amount?: number): string {
  if (amount === undefined || amount === null || isNaN(amount) || amount === 0) {
    return "";
  }

  // Handle common fractional display
  const whole = Math.floor(amount);
  const frac = amount - whole;

  const getFracStr = (f: number): string => {
    if (Math.abs(f - 0.25) < 0.05) return "¼";
    if (Math.abs(f - 0.333) < 0.05) return "⅓";
    if (Math.abs(f - 0.5) < 0.05) return "½";
    if (Math.abs(f - 0.666) < 0.05) return "⅔";
    if (Math.abs(f - 0.75) < 0.05) return "¾";
    if (Math.abs(f - 0.125) < 0.03) return "⅛";
    return "";
  };

  const fracStr = getFracStr(frac);
  if (fracStr) {
    return whole > 0 ? `${whole} ${fracStr}` : fracStr;
  }

  // Rounded decimal if not a clean common fraction
  if (amount % 1 === 0) {
    return amount.toString();
  }

  return amount.toFixed(1).replace(/\.0$/, "");
}

export function scaleAmount(baseAmount?: number, baseServings: number = 4, targetServings: number = 4): number | undefined {
  if (baseAmount === undefined || baseAmount === null) return undefined;
  if (!baseServings || baseServings <= 0) return baseAmount;
  const ratio = targetServings / baseServings;
  return Math.round(baseAmount * ratio * 100) / 100;
}

// Kitchen Audio Alarm synthesizer using Web Audio API
export function playKitchenChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Play a sequence of pleasant culinary chime tones (E5 -> G#5 -> B5 -> E6)
    const notes = [659.25, 830.61, 987.77, 1318.51];
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.14);

      gain.gain.setValueAtTime(0, ctx.currentTime + index * 0.14);
      gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + index * 0.14 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.14 + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + index * 0.14);
      osc.stop(ctx.currentTime + index * 0.14 + 0.7);
    });
  } catch (e) {
    console.warn("Audio chime could not play:", e);
  }
}
