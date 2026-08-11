// Advanced Kannada TTS Engine for Sobagu
// Fixed for laptop compatibility — pure WebSpeech with smart voice selection

let cachedVoices = [];
let voicesReady = false;

const initVoices = () => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  const load = () => {
    cachedVoices = window.speechSynthesis.getVoices();
    voicesReady = cachedVoices.length > 0;
  };
  load();
  if (!voicesReady) {
    window.speechSynthesis.onvoiceschanged = load;
  }
};

initVoices();

export const SPEECH_PRESETS = {
  slow:   { rate: 0.55, pitch: 0.95, label: 'Slow Learner' },
  normal: { rate: 0.82, pitch: 1.0,  label: 'Native Pace' },
  clear:  { rate: 0.68, pitch: 1.05, label: 'Crystal Clear' },
  fast:   { rate: 1.0,  pitch: 1.0,  label: 'Native Fast' },
};

const getVoices = () => {
  if (cachedVoices.length) return cachedVoices;
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    cachedVoices = window.speechSynthesis.getVoices();
  }
  return cachedVoices;
};

export const findKannadaVoice = () => {
  const voices = getVoices();

  // 1. Exact Kannada voice
  const exactKn = voices.find(v => v.lang === 'kn-IN' || v.lang === 'kn_IN');
  if (exactKn) return exactKn;

  // 2. Any voice starting with 'kn'
  const anyKn = voices.find(v => v.lang.startsWith('kn'));
  if (anyKn) return anyKn;

  // 3. Voice name contains 'kannada'
  const nameKn = voices.find(v => v.name.toLowerCase().includes('kannada'));
  if (nameKn) return nameKn;

  // 4. Indian English / Hindi fallback (better than default for Kannada script)
  const indian = voices.find(v =>
    v.lang === 'hi-IN' || v.lang === 'ta-IN' || v.lang === 'te-IN' ||
    v.lang === 'en-IN' || v.name.toLowerCase().includes('india')
  );
  if (indian) return indian;

  // 5. Any available voice
  return voices[0] || null;
};

export const getVoiceInfo = () => {
  const voice = findKannadaVoice();
  const all = getVoices();
  return {
    hasKannadaVoice: !!voice && (voice.lang.startsWith('kn') || voice.name.toLowerCase().includes('kannada')),
    voiceName: voice?.name || 'Default Voice',
    voiceLang: voice?.lang || 'kn-IN',
    totalVoices: all.length,
    kannadaVoices: all.filter(v => v.lang.startsWith('kn') || v.name.toLowerCase().includes('kannada')),
    ready: voicesReady || all.length > 0,
  };
};

/**
 * Core speak function — pure WebSpeech, works on all laptops and desktops.
 * Cancels any existing speech first for instant response.
 */
export const speakKannada = (text, rateOrOptions = 0.82) => {
  return new Promise((resolve) => {
    if (!text || typeof window === 'undefined' || !window.speechSynthesis) {
      resolve(false);
      return;
    }

    const opts = typeof rateOrOptions === 'object' ? rateOrOptions : { rate: rateOrOptions };
    const { rate = 0.82, pitch = 1.0, volume = 1 } = opts;

    // Cancel any in-progress speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text.trim());
    utterance.lang = 'kn-IN';
    utterance.rate = Math.max(0.1, Math.min(10, rate));
    utterance.pitch = Math.max(0, Math.min(2, pitch));
    utterance.volume = volume;

    // Try to find a Kannada voice; if found assign it
    const doSpeak = () => {
      const voice = findKannadaVoice();
      if (voice) utterance.voice = voice;

      utterance.onend = () => resolve(true);
      utterance.onerror = (e) => {
        // 'interrupted' is harmless (user triggered cancel), don't warn
        if (e.error !== 'interrupted') {
          console.warn('[Sobagu TTS] Speech error:', e.error);
        }
        resolve(false);
      };

      // Chrome laptop bug: sometimes voices load asynchronously. Retry once.
      try {
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('[Sobagu TTS] speak() threw:', err);
        resolve(false);
      }
    };

    // If voices aren't loaded yet, wait up to 1 second for them
    if (getVoices().length === 0) {
      const t = setTimeout(doSpeak, 200);
      window.speechSynthesis.onvoiceschanged = () => {
        clearTimeout(t);
        cachedVoices = window.speechSynthesis.getVoices();
        doSpeak();
      };
    } else {
      doSpeak();
    }
  });
};

/** Speak with a preset */
export const speakWithPreset = (text, preset = 'normal') => {
  const p = SPEECH_PRESETS[preset] || SPEECH_PRESETS.normal;
  return speakKannada(text, { rate: p.rate, pitch: p.pitch });
};

/** Speak syllable-by-syllable with pauses */
export const speakSyllableBreakdown = async (text, gapMs = 600) => {
  if (!text) return;
  const chars = [...text.trim()];
  for (let i = 0; i < chars.length; i++) {
    await speakKannada(chars[i], SPEECH_PRESETS.slow.rate);
    if (i < chars.length - 1) {
      await new Promise(r => setTimeout(r, gapMs));
    }
  }
};

/** Speak word slowly, then at normal speed */
export const speakCompareSpeeds = async (text) => {
  await speakWithPreset(text, 'slow');
  await new Promise(r => setTimeout(r, 400));
  await speakWithPreset(text, 'normal');
};

export const cancelSpeech = () => {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};

export const isTTSSupported = () =>
  typeof window !== 'undefined' && 'speechSynthesis' in window;
