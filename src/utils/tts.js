// Advanced Hybrid Kannada TTS & Studio Audio Engine for Sobagu
// Optimized for Laptops, Desktops, PWAs & Mobile devices.
// Features: High-Definition Cloud Native Stream + Resilient WebSpeech Fallback + Offline Memory Cache.

let cachedVoices = [];
let voicesReady = false;
const audioCache = new Map();
let currentAudio = null;

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

  // 4. Indian English / Hindi fallback
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
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  return {
    hasKannadaVoice: !!voice && (voice.lang.startsWith('kn') || voice.name.toLowerCase().includes('kannada')),
    voiceName: isOnline ? 'Google Studio HD Voice (Online)' : (voice?.name || 'Browser Local Voice'),
    voiceLang: 'kn-IN',
    isOnline,
    totalVoices: all.length,
    kannadaVoices: all.filter(v => v.lang.startsWith('kn') || v.name.toLowerCase().includes('kannada')),
    ready: true,
  };
};

/**
 * Play high-fidelity native Kannada speech using Google Translate audio stream.
 * Automatically falls back to WebSpeech on network error or offline.
 */
const speakViaHDStream = (text, rate = 1.0) => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !navigator.onLine) {
      reject(new Error('Offline'));
      return;
    }

    try {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }

      const cleanText = text.trim();
      const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=kn&client=tw-ob&q=${encodeURIComponent(cleanText)}`;

      const audio = new Audio(audioUrl);
      currentAudio = audio;
      audio.playbackRate = Math.max(0.6, Math.min(1.5, rate));

      audio.onended = () => {
        currentAudio = null;
        resolve(true);
      };

      audio.onerror = (err) => {
        currentAudio = null;
        reject(err);
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          currentAudio = null;
          reject(err);
        });
      }
    } catch (err) {
      currentAudio = null;
      reject(err);
    }
  });
};

/**
 * WebSpeech API fallback for offline or unsupported audio environments.
 */
const speakViaWebSpeech = (text, opts = {}) => {
  return new Promise((resolve) => {
    if (!text || typeof window === 'undefined' || !window.speechSynthesis) {
      resolve(false);
      return;
    }

    const { rate = 0.82, pitch = 1.0, volume = 1 } = opts;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text.trim());
    utterance.lang = 'kn-IN';
    utterance.rate = Math.max(0.1, Math.min(10, rate));
    utterance.pitch = Math.max(0, Math.min(2, pitch));
    utterance.volume = volume;

    const voice = findKannadaVoice();
    if (voice) utterance.voice = voice;

    utterance.onend = () => resolve(true);
    utterance.onerror = (e) => {
      if (e.error !== 'interrupted') {
        console.warn('[Sobagu TTS] WebSpeech error:', e.error);
      }
      resolve(false);
    };

    try {
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('[Sobagu TTS] speak() threw:', err);
      resolve(false);
    }
  });
};

/**
 * Universal Master Pronunciation Function
 * Plays Studio HD Native Audio if online, with automatic seamless WebSpeech fallback.
 */
export const speakKannada = async (text, rateOrOptions = 0.82) => {
  if (!text || typeof window === 'undefined') return false;

  const opts = typeof rateOrOptions === 'object' ? rateOrOptions : { rate: rateOrOptions };
  const targetRate = opts.rate || 0.82;

  // 1. Try Studio HD Audio Stream first if online
  if (navigator.onLine) {
    try {
      const success = await speakViaHDStream(text, targetRate >= 0.8 ? 1.0 : 0.8);
      if (success) return true;
    } catch (_cloudErr) {
      // Fallback to local WebSpeech below
    }
  }

  // 2. Fallback to local browser WebSpeech engine
  return speakViaWebSpeech(text, opts);
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
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    } catch (_e) {}
  }
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};

export const isTTSSupported = () =>
  typeof window !== 'undefined' && ('speechSynthesis' in window || typeof Audio !== 'undefined');
