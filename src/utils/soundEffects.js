// Web Audio API Synthesized Sound Effects Engine for Sobagu AI
// 100% Zero external audio asset dependencies — pure synthesized crystal-clear audio!

let audioCtx = null;
let soundEnabled = true;

const getAudioContext = () => {
  if (!audioCtx && typeof window !== 'undefined') {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

export const isSoundEnabled = () => soundEnabled;

export const toggleSound = (enabled) => {
  soundEnabled = enabled !== undefined ? enabled : !soundEnabled;
  return soundEnabled;
};

/** Play a bright, cheerful success chime (Duolingo-style ding) */
export const playSuccess = () => {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';

    // Two-tone high chime (C6 -> G6)
    osc1.frequency.setValueAtTime(1046.50, now); // C6
    osc1.frequency.exponentialRampToValueAtTime(1567.98, now + 0.12); // G6

    osc2.frequency.setValueAtTime(1318.51, now); // E6
    osc2.frequency.exponentialRampToValueAtTime(2093.00, now + 0.12); // C7

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.5);
    osc2.stop(now + 0.5);
  } catch (err) {
    // Ignore audio failures silently
  }
};

/** Play a royal, triumphant victory fanfare arpeggio */
export const playFanfare = () => {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]; // C5, E5, G5, C6, E6, G6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = i === notes.length - 1 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);

      const noteStart = now + i * 0.08;
      const duration = i === notes.length - 1 ? 0.6 : 0.25;

      gain.gain.setValueAtTime(0, noteStart);
      gain.gain.linearRampToValueAtTime(0.25, noteStart + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, noteStart + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(noteStart);
      osc.stop(noteStart + duration);
    });
  } catch (err) {
    // Ignore
  }
};

/** Play an energetic streak fire sound effect */
export const playStreak = () => {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const chord = [440, 554.37, 659.25, 880]; // A major chord
    chord.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.35);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.6);
    });
  } catch (err) {
    // Ignore
  }
};

/** Play a royal brass level-up trumpet fanfare */
export const playLevelUp = () => {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Classic brass fanfare: C4 -> F4 -> G4 -> C5 sustained
    const melody = [
      { f: 523.25, t: 0, d: 0.12 },
      { f: 523.25, t: 0.14, d: 0.12 },
      { f: 523.25, t: 0.28, d: 0.12 },
      { f: 659.25, t: 0.42, d: 0.3 },
      { f: 783.99, t: 0.75, d: 0.6 },
    ];

    melody.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, now + note.t);

      const start = now + note.t;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.3, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + note.d);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + note.d);
    });
  } catch (err) {
    // Ignore
  }
};

/** Play a gentle soft click for buttons */
export const playClick = () => {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.04);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  } catch (err) {
    // Ignore
  }
};

/** Play a gentle error/try-again tone */
export const playError = () => {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.linearRampToValueAtTime(240, now + 0.15);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  } catch (err) {
    // Ignore
  }
};

let ringtoneInterval = null;

/** Plays a realistic gentle marimba-style incoming/outgoing call ringtone in a loop */
export const startCallRingtone = () => {
  if (!soundEnabled || ringtoneInterval) return;
  const playPulse = () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.12);
        gain.gain.setValueAtTime(0.12, now + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 0.28);
      });
    } catch (_e) {}
  };
  playPulse();
  ringtoneInterval = setInterval(playPulse, 2200);
};

export const stopCallRingtone = () => {
  if (ringtoneInterval) {
    clearInterval(ringtoneInterval);
    ringtoneInterval = null;
  }
};

export const playCallEndBeep = () => {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [480, 440].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.14);
      gain.gain.setValueAtTime(0.15, now + i * 0.14);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.14 + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.14);
      osc.stop(now + i * 0.14 + 0.13);
    });
  } catch (_e) {}
};
