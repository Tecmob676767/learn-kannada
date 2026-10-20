// Sobagu AI — Native Kannada Linguistic & Conversational AI Engine
// Powered by Sobagu AI API

const SOBAGU_API_KEY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SOBAGU_AI_API_KEY)
  ? import.meta.env.VITE_SOBAGU_AI_API_KEY
  : 'AQ.Ab8RN6JNvtFbEadv_24iA9A2GkjDlV0LBezC1xYhcewmqR2eZA';
const AI_MODEL_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export const getApiKey = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SOBAGU_AI_API_KEY) {
    return import.meta.env.VITE_SOBAGU_AI_API_KEY;
  }
  try {
    return localStorage.getItem('sobagu_ai_api_key') || SOBAGU_API_KEY;
  } catch {
    return SOBAGU_API_KEY;
  }
};

export const setApiKey = (key) => {
  try {
    localStorage.setItem('sobagu_ai_api_key', key.trim());
  } catch {}
};

export const hasAIEnabled = () => !!getApiKey();

const SYSTEM_PROMPT = `You are Sobagu AI (ಸೊಬಗು AI) — the exclusive native Kannada AI companion, linguistic tutor, and mentor built for the Sobagu Kannada Learning app (created by Plumine LTD).

STRICT IDENTITY RULES:
1. Who are you?:
   If asked "Who are you?", "ನೀವು ಯಾರು?", "What is your name?", or who made you:
   Always state proudly: "I am Sobagu AI (ನಾನು ಸೊಬಗು AI), your personal native Kannada AI companion and mentor created for the Sobagu Kannada Learning platform by Plumine LTD."
2. What API / Model do you use?:
   If asked "Which API do you use?", "Which model are you?", "What is powering you?", "Are you ChatGPT / Gemini / Claude?":
   Always answer firmly: "I am Sobagu AI, and I am powered exclusively by the Sobagu AI API (ನಾನು ಸೊಬಗು AI API ಬಳಸುತ್ತೇನೆ)."
   CRITICAL: NEVER mention any external model names or third-party company names (NEVER say Gemini, Google, OpenAI, ChatGPT, Claude, Anthropic, LLM, etc.). Your identity is 100% Sobagu AI.
3. Availability & Access:
   Sobagu AI is 100% FREE for EVERY user — free learners and Pro members alike! There are NO restrictions, NO paywalls, and NO limits on questions.
4. Answering Any Question:
   You answer ANY question the user asks:
   - General questions, life, technology, science, everyday topics.
   - Kannada vocabulary, sentence formation, spoken Kannada, slang, idioms, literature, poetry, Vachanas.
   - English to Kannada and Kannada to English translations.
   - Pronunciation & tongue placement (especially retroflex consonants like ಟ, ಠ, ಡ, ಢ, ಣ, ಳ).
   - Grammar breakdowns (SOV sentence patterns, 7 Vibhakti pratyayas, verb tenses, gender & honorifics).
5. Comprehensive Knowledge of the Sobagu App:
   If the user has any doubt, problem, or question about Sobagu:
   - Developer: Plumine LTD (Plumine Coders).
   - Key Features:
     • Varnamale (Alphabet): Interactive vowels (Swaras), consonants (Vyanjanas), and Yogavahakas with native voice audio.
     • Kagunita Builder: Systematic consonant-vowel combinations with real audio.
     • Vocabulary & Phrases: Filterable categories (Daily Basics, Travel, Food, Family, Shopping, Emergency).
     • Grammar Studio: Vibhakti Pratyayas (Prathama to Sambodhana), verb conjugations, and SOV structure.
     • Pronunciation Studio: Live microphone speech recognition and score analysis.
     • Conversation Studio & City Simulators: Bengaluru Auto Rickshaw bargaining, Darshini hotel ordering, Namma Metro navigator, KR Market vegetable shopping.
     • SRS Flashcards: Spaced repetition algorithm to remember difficult words long-term.
     • Interactive Games: Word Match, Kannada Crossword, Kannada Wordle, Typing Tutor, Live Duels.
     • Bangalore Slang Decoder: Street-smart Kannada ('Macha', 'Sakkath', 'Guru', 'Beda', 'Banni').
     • Universal Cloud Sync & Cross-Device Access: Every user has a unique 6-digit Multi-Device Code to sync their XP, streak, badges, and progress instantly across phones, tablets, and computers.
     • Multi-Platform: Runs on Android (APK & PWA), iOS (Web App), Windows, Mac, and Linux.
   Answer their Sobagu doubts accurately and guide them to the right tab or feature.

RESPONSE FORMATTING:
- Whenever responding with Kannada, include:
  1. The authentic Kannada script.
  2. The English transliteration in parentheses.
  3. The clear English translation or explanation.
- Keep responses friendly, warm, helpful, encouraging, and natural.`;

/** Call Sobagu AI via Sobagu AI API */
export const callSobaguAI = async (userMessage, context = {}) => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('No Sobagu AI API key configured');

  const contextBlock = context.expected
    ? `\nContext: Practicing Kannada phrase "${context.expected}" (${context.transliteration || ''}). Spoken input: "${context.spoken || '(none)'}". Score: ${context.score ?? 'N/A'}%.`
    : '';

  const body = {
    systemInstruction: {
      parts: [{ text: SYSTEM_PROMPT }]
    },
    contents: [
      {
        role: 'user',
        parts: [{ text: userMessage + contextBlock }]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 750,
    }
  };

  const response = await fetch(`${AI_MODEL_ENDPOINT}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Sobagu AI API error (${response.status})`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'ಖಂಡಿತಾ! ನಾನು ಸೊಬಗು AI, ನಿಮಗೆ ಸಹಾಯ ಮಾಡಲು ಸದಾ ಸಿದ್ಧ. (Khandita! I am Sobagu AI, always ready to help you.)';
};

/** Rule-based fallback when offline */
export const ruleBasedCoach = (message, context = {}) => {
  const lower = (message || '').toLowerCase();
  const { expected, transliteration, spoken, score } = context;

  // Identity questions
  if (lower.includes('who are you') || lower.includes('yaaru') || lower.includes('ನಿಮ್ಮ ಹೆಸರೇನು') || lower.includes('name')) {
    return `ನಾನು ಸೊಬಗು AI (Naanu Sobagu AI)! I am Sobagu AI, your personal native Kannada language mentor created by Plumine LTD. I am 100% free for everyone! You can ask me any question or doubt about Kannada or the Sobagu app.`;
  }

  if (lower.includes('which api') || lower.includes('what api') || lower.includes('api you use') || lower.includes('model')) {
    return `ನಾನು ಸೊಬಗು AI API ಬಳಸುತ್ತೇನೆ (Naanu Sobagu AI API balisuththene). I am powered exclusively by the official Sobagu AI API to provide authentic, native Kannada learning.`;
  }

  if (lower.includes('retroflex') || lower.includes('ಟ') || lower.includes('ಣ') || lower.includes('ಳ')) {
    return `Retroflex sounds ಟ (ta), ಠ (tha), ಡ (da), ಢ (dha), ಣ (na), ಳ (la) are Kannada's signature! Curl your tongue tip backward to touch the hard palate and snap it forward — like a deeper version of "t". Practice: say "ಟಟ್ಟ" (tat-ta) slowly and feel the tongue snap. Natives in Bengaluru use these in everyday words like "ಅಲ್ಲಿ" (alli - there) and "ಅವರು" (avaru - they).`;
  }

  if (lower.includes('vowel') || lower.includes('swara') || lower.includes('ಅ')) {
    return `Kannada has 16 Swaras (vowels). Short (Hrasva) vowels like ಅ (a) are quick — don't stretch them. Long (Deergha) vowels like ಆ (aa) are held twice as long. The word "ಹಲ" (hala - plow) vs "ಹಾಲು" (haalu - milk) shows how vowel length changes meaning.`;
  }

  if (lower.includes('aspirat') || lower.includes('ಖ') || lower.includes('ಘ')) {
    return `Aspirated (Mahaapraana) consonants ಖ (kha), ಘ (gha), ಛ (chha), ಫ (pha) need a puff of air. Hold your hand in front of your mouth — feel a burst of air on ಖ but not on ಕ.`;
  }

  if (expected && score !== undefined) {
    if (score >= 90) {
      return `Outstanding! You scored ${score}% on "${expected}" — that's near-native quality. To reach 100%, try using it in a full sentence. Real Bengaluru speakers say "${transliteration || expected}" naturally in conversation.`;
    }
    if (score >= 70) {
      return `Great progress on "${expected}" (${score}%)! You said "${spoken || '...'}" — very close to "${transliteration || expected}". Focus on the stressed syllable and exaggerate it slightly.`;
    }
    return `Let's break down "${expected}" (${transliteration || ''}). Your attempt "${spoken || '(no match)'}" scored ${score}%. Listen carefully and repeat each syllable separately.`;
  }

  return `ನಮಸ್ಕಾರ! ನಾನು ಸೊಬಗು AI (Namaskara! I am Sobagu AI). You can ask me ANY question — translations, grammar, doubts about Sobagu, or practice conversations!`;
};

/** Main coach interface */
export const askCoach = async (message, context = {}) => {
  try {
    return { text: await callSobaguAI(message, context), source: 'sobagu_ai' };
  } catch (err) {
    return {
      text: ruleBasedCoach(message, context),
      source: 'fallback',
    };
  }
};

/** Auto-generate coaching after a pronunciation attempt */
export const coachAfterAttempt = async (context) => {
  const prompt = context.score >= 85
    ? `The learner scored ${context.score}% on "${context.expected}" (${context.transliteration}). Give one advanced, specific native-Kannadiga tip to reach perfect fluency.`
    : `The learner scored ${context.score}% trying to say "${context.expected}" (${context.transliteration}). They were heard saying: "${context.spoken || 'nothing detected'}". Give precise tongue/mouth positioning tips to improve, like a native Kannadiga teacher would.`;

  return askCoach(prompt, context);
};

// ─── Interactive Dialogue Scenarios for Sobagu AI ─────────────────────────────

export const AI_SCENARIOS = {
  general: {
    id: 'general',
    name: 'General & Sobagu Doubts',
    nameKn: 'ಸಾಮಾನ್ಯ ಪ್ರಶ್ನೋತ್ತರ',
    icon: '🌸',
    location: 'Sobagu AI Learning Sanctuary',
    role: 'Sobagu AI Mentor',
    initialMessage: 'ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಸೊಬಗು AI (I am your Sobagu AI). I am 100% free for all learners! Ask me any question, grammar doubt, translation, or questions about the Sobagu app!',
    systemPrompt: `You are Sobagu AI, the official AI mentor for Sobagu. You answer any question the user has about Kannada learning, Karnataka, grammar, daily conversations, or doubts about the Sobagu app.`,
  },
  auto: {
    id: 'auto',
    name: 'Auto Rickshaw Ride',
    nameKn: 'ಆಟೋ ಪ್ರಯಾಣ',
    icon: '🛺',
    location: 'MG Road to Indiranagar, Bengaluru',
    role: 'Friendly Bengaluru Auto Driver',
    initialMessage: 'ನಮಸ್ಕಾರ ಸ್ವಾಮಿ! ಎಲ್ಲಿಗೆ ಹೋಗ್ಬೇಕು? (Namaskara swami! Ellige hogbeku? - Hello sir/madam! Where do you want to go?)',
    systemPrompt: `You are a cheerful native Bengaluru auto driver. You speak colloquial conversational Kannada with English transliteration in parentheses. Help the user practice asking for meter rates, bargaining politely, and giving road directions (e.g. "Left thagoli", "Straight hogi", "Meter haaki"). Keep replies short and friendly.`,
  },
  darshini: {
    id: 'darshini',
    name: 'Darshini Food Ordering',
    nameKn: 'ದರ್ಶಿನಿ ಹೋಟೆಲ್',
    icon: '☕',
    location: 'CTR Malleshwaram / Brahmin\'s Coffee Bar',
    role: 'Darshini Counter Master',
    initialMessage: 'ಬನ್ನಿ ಸರ್! ಏನು ಬೇಕು? ಬಿಸಿ ಬಿಸಿ ಮಸಾಲೆ ದೋಸೆ, ಇಡ್ಲಿ-ವಡೆ, ಫಿಲ್ಟರ್ ಕಾಫಿ ರೆಡಿ ಇದೆ! (Banni sir! Enu beku? Hot Masala Dosa, Idli-Vade, Filter Coffee ready!)',
    systemPrompt: `You are the master at a famous Bengaluru Darshini. Help the user practice ordering food, asking for chutney/sambar, and requesting the bill in conversational Kannada. Always provide Kannada script and transliteration.`,
  },
  market: {
    id: 'market',
    name: 'KR Market Vegetable Shopping',
    nameKn: 'ತರಕಾರಿ ಮಾರುಕಟ್ಟೆ',
    icon: '🛒',
    location: 'KR Market, Bengaluru',
    role: 'KR Market Vendor',
    initialMessage: 'ಬನ್ನಿ ಅಮ್ಮಾ/ಸ್ವಾಮಿ, ತಾಜಾ ತರಕಾರಿ ಇದೆ! ಟೊಮ್ಯಾಟೊ, ಈರುಳ್ಳಿ, ಕ್ಯಾರೆಟ್ ಬೇಕಾ? (Banni, fresh vegetables! Want tomatoes, onions, carrots?)',
    systemPrompt: `You are a vendor in KR Market. Teach the user how to ask vegetable names, negotiate quantities (ardha kilo, ondhu kilo), and ask prices ("Eshtu aaytu?").`,
  },
  metro: {
    id: 'metro',
    name: 'Namma Metro Commute',
    nameKn: 'ನಮ್ಮ ಮೆಟ್ರೋ',
    icon: '🚇',
    location: 'Nadaprabhu Kempegowda Station, Majestic',
    role: 'Metro Customer Guide',
    initialMessage: 'ನಮಸ್ಕಾರ! ಮೆಟ್ರೋ ಟಿಕೆಟ್ ಅಥವಾ ಕಾರ್ಡ್ ರೀಚಾರ್ಜ್ ಮಾಡ್ಬೇಕಾ? (Namaskara! Metro ticket or card recharge?)',
    systemPrompt: `You are a helpful Namma Metro staff member at Majestic. Guide the commuter on Green vs Purple lines, card top-ups, and platform directions in polite Kannada.`,
  },
  freechat: {
    id: 'freechat',
    name: 'Sobagu AI Kannada Mentor',
    nameKn: 'ಮುಕ್ತ ಸಂಭಾಷಣೆ ಗುರು',
    icon: '🌸',
    location: 'Sobagu AI Learning Sanctuary',
    role: 'Sobagu AI Living Mentor',
    initialMessage: 'ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಸೊಬಗು AI (I am your Sobagu AI). You can ask me ANY question or practice speaking in Kannada with me!',
    systemPrompt: `You are Sobagu AI — the world's premier native Kannada language mentor. You answer any question with clarity, warmth, and exact native Kannada phrasing with transliteration.`,
  },
};

/** Multi-turn chat with Sobagu AI */
export const chatWithSobaguAI = async (messages, scenarioId = 'general', currentMode = 'free_ask') => {
  const scenario = AI_SCENARIOS[scenarioId] || AI_SCENARIOS.general;
  const apiKey = getApiKey();

  if (apiKey) {
    try {
      // Build messages format
      const validMessages = messages.filter(m => m.text && m.text.trim());
      const contents = [];

      for (const m of validMessages) {
        const role = m.sender === 'user' ? 'user' : 'model';
        if (contents.length > 0 && contents[contents.length - 1].role === role) {
          contents[contents.length - 1].parts[0].text += `\n${m.text}`;
        } else {
          contents.push({
            role,
            parts: [{ text: m.text }]
          });
        }
      }

      // Ensure first message has role user
      if (contents.length > 0 && contents[0].role === 'model') {
        contents.shift();
      }

      if (contents.length === 0) {
        contents.push({ role: 'user', parts: [{ text: 'ನಮಸ್ಕಾರ (Namaskara)' }] });
      }

      const modeInstruction = currentMode === 'free_ask'
        ? 'Answer the user\'s question thoroughly, warmly, and accurately. If they ask about who you are, state: "I am Sobagu AI (ನಾನು ಸೊಬಗು AI)". If they ask which API or model you use, state: "I use the Sobagu AI API (ನಾನು ಸೊಬಗು AI API ಬಳಸುತ್ತೇನೆ)". If they ask doubts about Sobagu, guide them using your complete knowledge of the Sobagu app.'
        : currentMode === 'grammar_deconstruct'
        ? 'Deeply analyze and deconstruct the Kannada sentence grammar, case markers (Vibhakti), and SOV order in detail.'
        : currentMode === 'pronunciation'
        ? 'Focus on retroflex consonants (ಟ, ಣ, ಳ), aspiration (ಖ, ಘ), vowel lengths (ಹ್ರಸ್ವ vs ದೀರ್ಘ), and tongue placement instructions.'
        : currentMode === 'instant_quiz'
        ? 'Generate a fun 1-question interactive quiz testing the learner on Kannada.'
        : `Roleplay context: ${scenario.role || 'Sobagu AI Mentor'}. ${scenario.systemPrompt || ''}`;

      const body = {
        systemInstruction: {
          parts: [{
            text: `${SYSTEM_PROMPT}\n\nCURRENT MODE & OBJECTIVE:\n${modeInstruction}\n\nFormat your response clearly. When replying with Kannada, always provide the Kannada script, English transliteration, and English translation.`
          }]
        },
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 750,
        }
      };

      const response = await fetch(`${AI_MODEL_ENDPOINT}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        const data = await response.json();
        const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (replyText) {
          return { text: replyText, source: 'sobagu_ai' };
        }
      }
    } catch (err) {
      console.warn('[Sobagu AI] Live API request fallback:', err.message);
    }
  }

  // Conversational offline fallback
  const lastUserMsg = messages.filter(m => m.sender === 'user').slice(-1)[0]?.text || '';
  return { text: ruleBasedCoach(lastUserMsg, {}), source: 'builtin' };
};
