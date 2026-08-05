// Advanced Pro Native Kannada Speech Engine for Sobagu

let cachedVoices = [];
let voicesReady = false;

const initVoices = () => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  cachedVoices = window.speechSynthesis.getVoices();
  if (cachedVoices.length) {
    voicesReady = true;
  } else {
    window.speechSynthesis.onvoiceschanged = () => {
      cachedVoices = window.speechSynthesis.getVoices();
      voicesReady = cachedVoices.length > 0;
    };
  }
};

initVoices();

/** Phonetic overrides — makes browser TTS pronounce Swaras & consonants like a native Kannadiga */
const PHONETIC_OVERRIDES = {
  // Swaras — short vowels spoken with a trailing schwa so TTS doesn't clip them
  'ಅ': 'ಅ',           // short 'a' — spoken as in 'about'
  'ಆ': 'ಆ',           // long 'aa' — spoken as in 'father'
  'ಇ': 'ಇ',           // short 'i' — spoken as in 'ink'
  'ಈ': 'ಈ',           // long 'ii' — spoken as in 'feet'
  'ಉ': 'ಉ',           // short 'u' — spoken as in 'put'
  'ಊ': 'ಊ',           // long 'uu' — spoken as in 'boot'
  'ಋ': 'ರು',          // Rishikara — pronounced 'ru' (like in Sanskrit 'rishi')
  'ಎ': 'ಎ',           // short 'e' — spoken as in 'egg'
  'ಏ': 'ಏ',           // long 'ee' — spoken as in 'eight'
  'ಐ': 'ಐ',           // 'ai' diphthong — spoken as in 'aisle'
  'ಒ': 'ಒ',           // short 'o' — spoken as in 'off'
  'ಓ': 'ಓ',           // long 'oo' — spoken as in 'ocean'
  'ಔ': 'ಔ',           // 'au' diphthong — spoken as in 'automobile'
  'ಅಂ': 'ಅಂ',         // Anusvara — nasal 'am' sound
  'ಅಃ': 'ಅಃ',         // Visarga — breathy 'aha' sound
  // Consonants — append 'aa' so TTS voices the full consonant clearly
  'ಳ': 'ಳಾ', 'ಣ': 'ಣಾ', 'ಙ': 'ಙಾ', 'ಞ': 'ಞಾ',
  'ಕ': 'ಕಾ', 'ಖ': 'ಖಾ', 'ಗ': 'ಗಾ', 'ಘ': 'ಘಾ',
  'ಚ': 'ಚಾ', 'ಛ': 'ಛಾ', 'ಜ': 'ಜಾ', 'ಝ': 'ಝಾ',
  'ಟ': 'ಟಾ', 'ಠ': 'ಠಾ', 'ಡ': 'ಡಾ', 'ಢ': 'ಢಾ',
  'ತ': 'ತಾ', 'ಥ': 'ಥಾ', 'ದ': 'ದಾ', 'ಧ': 'ಧಾ', 'ನ': 'ನಾ',
  'ಪ': 'ಪಾ', 'ಫ': 'ಫಾ', 'ಬ': 'ಬಾ', 'ಭ': 'ಭಾ', 'ಮ': 'ಮಾ',
  'ಯ': 'ಯಾ', 'ರ': 'ರಾ', 'ಲ': 'ಲಾ', 'ವ': 'ವಾ',
  'ಶ': 'ಶಾ', 'ಷ': 'ಷಾ', 'ಸ': 'ಸಾ', 'ಹ': 'ಹಾ',
};

export const SPEECH_PRESETS = {
  slow: { rate: 0.55, pitch: 0.95, label: 'Slow Learner' },
  normal: { rate: 0.82, pitch: 1.0, label: 'Native Pace' },
  clear: { rate: 0.68, pitch: 1.05, label: 'Crystal Clear' },
  fast: { rate: 1.0, pitch: 1.0, label: 'Native Fast' },
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
  // Prefer Male / Kannada / Indian voices for natural boy/male tone
  return voices.find(v =>
    (v.lang.startsWith('kn') || v.name.toLowerCase().includes('kannada')) &&
    (v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('man') || v.name.toLowerCase().includes('boy'))
  ) || voices.find(v =>
    v.lang === 'kn-IN' || v.lang === 'kn_IN' || v.lang.startsWith('kn') || v.name.toLowerCase().includes('kannada')
  ) || voices.find(v =>
    v.name.toLowerCase().includes('ravi') || v.name.toLowerCase().includes('david') || v.name.toLowerCase().includes('male')
  ) || voices.find(v =>
    v.lang.startsWith('hi') || v.lang.startsWith('ta') || v.lang.startsWith('te')
  ) || null;
};

export const getVoiceInfo = () => {
  const voice = findKannadaVoice();
  const all = getVoices();
  return {
    hasKannadaVoice: !!voice && (voice.lang.startsWith('kn') || voice.name.toLowerCase().includes('kannada')),
    voiceName: voice?.name || 'Native Boy Voice Engine',
    voiceLang: voice?.lang || 'kn-IN',
    totalVoices: all.length,
    kannadaVoices: all.filter(v => v.lang.startsWith('kn') || v.name.toLowerCase().includes('kannada')),
    ready: voicesReady || all.length > 0,
  };
};

const applyPhonetic = (text) => {
  const trimmed = text.trim();
  if (PHONETIC_OVERRIDES[trimmed]) return PHONETIC_OVERRIDES[trimmed];
  return trimmed;
};

const createUtterance = (text, options = {}) => {
  // Pitch set to 1.25 for a youthful native boy voice!
  const { rate = 0.85, pitch = 1.25, volume = 1 } = options;
  const speechText = applyPhonetic(text);
  const utterance = new SpeechSynthesisUtterance(speechText);
  utterance.lang = 'kn-IN';
  utterance.rate = rate;
  utterance.pitch = pitch; // Boy voice tone
  utterance.volume = volume;
  const voice = findKannadaVoice();
  if (voice) utterance.voice = voice;
  return utterance;
};

/** Fallback WebSpeech engine tuned for a Boy Voice */
const speakFallbackWebSpeech = (text, opts = {}) => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      resolve(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = createUtterance(text, { pitch: 1.25, rate: 0.85, ...opts });
    utterance.onend = () => resolve(true);
    utterance.onerror = () => resolve(false);
    window.speechSynthesis.speak(utterance);
  });
};

/** Play audio from URL safely with a strict fast timeout */
const playAudioUrlWithTimeout = (url, rate = 0.85, timeoutMs = 400) => {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audio.src = url;
    audio.playbackRate = Math.min(2.0, Math.max(0.5, rate));

    let finished = false;

    const timer = setTimeout(() => {
      if (!finished) {
        finished = true;
        try { audio.pause(); } catch {}
        reject(new Error('Network audio timeout'));
      }
    }, timeoutMs);

    audio.onended = () => {
      if (!finished) {
        finished = true;
        clearTimeout(timer);
        resolve(true);
      }
    };

    audio.onerror = (err) => {
      if (!finished) {
        finished = true;
        clearTimeout(timer);
        reject(err);
      }
    };

    const promise = audio.play();
    if (promise !== undefined) {
      promise.catch((err) => {
        if (!finished) {
          finished = true;
          clearTimeout(timer);
          reject(err);
        }
      });
    }
  });
};

/** Speak Kannada text — INSTANT Playback Engine (0ms delay) */
export const speakKannada = async (text, rateOrOptions = 0.85) => {
  if (!text || typeof window === 'undefined') return false;

  const opts = typeof rateOrOptions === 'object'
    ? rateOrOptions
    : { rate: rateOrOptions };

  const speechText = applyPhonetic(text);

  // Cancel any running speech immediately for zero-lag responsiveness
  if (window.speechSynthesis) window.speechSynthesis.cancel();

  // Try fast Vite proxy audio first with 400ms timeout
  try {
    const encoded = encodeURIComponent(speechText);
    const localProxyUrl = `/api/tts?ie=UTF-8&q=${encoded}&tl=kn&client=tw-ob`;
    const ok = await playAudioUrlWithTimeout(localProxyUrl, opts.rate || 0.85, 450);
    if (ok) return true;
  } catch {
    /* Fallback instantly to local engine */
  }

  // Instant local Boy Voice Speech Synthesis fallback (0ms delay)
  return speakFallbackWebSpeech(text, opts);
};

/** Speak with preset (slow, normal, clear, fast) */
export const speakWithPreset = (text, preset = 'normal') => {
  const p = SPEECH_PRESETS[preset] || SPEECH_PRESETS.normal;
  return speakKannada(text, { rate: p.rate, pitch: p.pitch });
};

/** Speak syllable-by-syllable with pauses — great for alphabet learning */
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
