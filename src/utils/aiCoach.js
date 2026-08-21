// Sobagu Claude AI Pronunciation Coach — powered by Anthropic Claude API

const API_KEY_STORAGE = 'sobagu_claude_api_key';
const CLAUDE_MODEL = 'claude-3-5-sonnet-20241022';

export const getApiKey = () => {
  if (import.meta.env.VITE_CLAUDE_API_KEY) return import.meta.env.VITE_CLAUDE_API_KEY;
  try {
    return localStorage.getItem(API_KEY_STORAGE) || '';
  } catch {
    return '';
  }
};

export const setApiKey = (key) => {
  localStorage.setItem(API_KEY_STORAGE, key.trim());
};

export const hasAIEnabled = () => !!getApiKey();

const SYSTEM_PROMPT = `You are Sobagu — the world's most advanced Native Kannada Pronunciation & Linguistic Coach, powered by Claude AI.
Your guidance embodies the authentic, precise accent of a native Kannadiga speaker from Bengaluru.
Your mission: guide every learner to achieve native-level Kannada fluency.

When coaching after a pronunciation attempt:
1. Give precise anatomical tongue and lip instructions. For example: retroflex consonants (ಟ ta, ಠ tha, ಡ da, ಢ dha, ಣ na, ಳ la) require curling the tongue back to the hard palate and snapping forward — this is what makes Kannada sound authentic.
2. For aspiration: Alpapraana (unaspirated) sounds like ಕ (ka), ಪ (pa) use no breath; Mahaapraana (aspirated) like ಖ (kha), ಫ (pha) need a strong puff — ask learners to hold a hand in front of their lips.
3. For vowels: distinguish Hrasva (short, e.g., ಅ a) from Deergha (long, e.g., ಆ aa) — length changes meaning completely.
4. Always embed the Kannada script, transliteration, and a real-life Bengaluru usage example.
5. Be warm, specific, motivating. Respond in English. Keep answers to 3-4 sentences.`;

/** Call Claude API (Anthropic Messages API) */
const callClaude = async (userMessage, context = {}) => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('No Claude API key');

  const contextBlock = context.expected
    ? `\nContext: The learner is practicing the Kannada word/phrase "${context.expected}" (${context.transliteration || ''}). ` +
      `Their speech was recognized as: "${context.spoken || '(nothing detected)'}". Score: ${context.score ?? 'N/A'}%.`
    : '';

  // Use the Anthropic API via allorigins proxy to bypass browser CORS restriction
  const body = JSON.stringify({
    model: CLAUDE_MODEL,
    max_tokens: 350,
    system: SYSTEM_PROMPT,
    messages: [
      { role: 'user', content: userMessage + contextBlock }
    ],
  });

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-calls': 'true',
    },
    body,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Claude API error (${response.status})`);
  }

  const data = await response.json();
  return data.content?.[0]?.text || 'I could not generate a response. Please try again.';
};

/** Rule-based coaching when no API key is provided */
const ruleBasedCoach = (message, context = {}) => {
  const lower = message.toLowerCase();
  const { expected, transliteration, spoken, score } = context;

  if (lower.includes('retroflex') || lower.includes('ಟ') || lower.includes('ಣ') || lower.includes('ಳ')) {
    return `Retroflex sounds ಟ (ta), ಠ (tha), ಡ (da), ಢ (dha), ಣ (na), ಳ (la) are Kannada's signature! Curl your tongue tip backward to touch the hard palate and snap it forward — like a deeper version of "t". Practice: say "ಟಟ್ಟ" (tat-ta) slowly and feel the tongue snap. Natives in Bengaluru use these in everyday words like "ಅಲ್ಲಿ" (alli - there) and "ಅವರು" (avaru - they).`;
  }

  if (lower.includes('vowel') || lower.includes('swara') || lower.includes('ಅ')) {
    return `Kannada has 16 Swaras (vowels). Short (Hrasva) vowels like ಅ (a) are quick — don't stretch them. Long (Deergha) vowels like ಆ (aa) are held twice as long. The word "ಹಲ" (hala - plow) vs "ಹಾಲು" (haalu - milk) shows how vowel length changes meaning. In Slow mode, you'll hear this distinction clearly.`;
  }

  if (lower.includes('aspirat') || lower.includes('ಖ') || lower.includes('ಘ')) {
    return `Aspirated (Mahaapraana) consonants ಖ (kha), ಘ (gha), ಛ (chha), ಫ (pha) need a puff of air. Hold your hand in front of your mouth — feel a burst of air on ಖ but not on ಕ. Try saying ಕ-ಖ-ಗ-ಘ in sequence to feel the breath difference. Native speakers from Bengaluru naturally produce this distinction.`;
  }

  if (expected && score !== undefined) {
    if (score >= 90) {
      return `Outstanding! You scored ${score}% on "${expected}" — that's near-native quality. To reach 100%, try using it in a full sentence. Real Bengaluru speakers say "${transliteration || expected}" naturally in conversation. You're almost there!`;
    }
    if (score >= 70) {
      return `Great progress on "${expected}" (${score}%)! You said "${spoken || '...'}" — very close to "${transliteration || expected}". Focus on the stressed syllable and exaggerate it slightly. Repeat 5 times with the Slow audio, then speak — muscle memory builds fast!`;
    }
    return `Let's break down "${expected}" (${transliteration || ''}). Your attempt "${spoken || '(no match)'}" scored ${score}%. Step 1: Listen in Slow mode. Step 2: Whisper each syllable separately. Step 3: Speak at normal volume. Usually retroflex sounds or vowel length are what need work — keep going!`;
  }

  return `ನಮಸ್ಕಾರ! I'm Sobagu, your Native Kannadiga AI Coach. Pick a word above, tap 🔊 to hear it, then tap 🎤 to speak and get scored. Ask me anything: "How do I say ಟ?" or "Explain vowel length". ${hasAIEnabled() ? '✅ Claude AI is active — I can give you deeply personalized coaching!' : '💡 Add your Claude API key in ⚙️ Settings to unlock full AI coaching!'}`;
};

/** Main coach interface */
export const askCoach = async (message, context = {}) => {
  if (getApiKey()) {
    try {
      return { text: await callClaude(message, context), source: 'claude' };
    } catch (err) {
      return {
        text: ruleBasedCoach(message, context) + `\n\n_(Claude note: ${err.message}. Using built-in coach.)_`,
        source: 'fallback',
      };
    }
  }
  return { text: ruleBasedCoach(message, context), source: 'builtin' };
};

/** Auto-generate coaching after a pronunciation attempt */
export const coachAfterAttempt = async (context) => {
  const prompt = context.score >= 85
    ? `The learner scored ${context.score}% on "${context.expected}" (${context.transliteration}). Give one advanced, specific native-Kannadiga tip to reach perfect fluency.`
    : `The learner scored ${context.score}% trying to say "${context.expected}" (${context.transliteration}). They were heard saying: "${context.spoken || 'nothing detected'}". Give precise tongue/mouth positioning tips to improve, like a native Kannadiga teacher would.`;

  return askCoach(prompt, context);
};

// ─── Real-Time Interactive Dialogue Scenarios for Sobagu AI Tutor ───────────

export const AI_SCENARIOS = {
  auto: {
    id: 'auto',
    name: 'Auto Rickshaw Ride',
    nameKn: 'ಆಟೋ ಪ್ರಯಾಣ',
    icon: '🛺',
    location: 'MG Road to Indiranagar, Bengaluru',
    role: 'Friendly Auto Driver (Raju)',
    initialMessage: 'ನಮಸ್ಕಾರ ಸ್ವಾಮಿ! ಎಲ್ಲಿಗೆ ಹೋಗ್ಬೇಕು? (Namaskara swami! Ellige hogbeku? - Hello sir/madam! Where do you want to go?)',
    systemPrompt: `You are Raju, a cheerful native Bengaluru auto driver. You speak colloquial conversational Kannada with English transliteration in parentheses. Help the user practice asking for meter rates, bargaining politely, and giving road directions (e.g. "Left thagoli", "Straight hogi", "Meter haaki"). Keep replies short (1-2 sentences in Kannada + transliteration + English meaning) and encourage them.`,
  },
  darshini: {
    id: 'darshini',
    name: 'Darshini Coffee & Dosa',
    nameKn: 'ದರ್ಶಿನಿ ಉಪಾಹಾರ',
    icon: '☕',
    location: 'Vidyarthi Bhavan / Brahmin Coffee Bar',
    role: 'Darshini Cashier & Server',
    initialMessage: 'ಬನ್ನಿ ಬನ್ನಿ! ಏನ್ ಬೇಕು ಸರ್? ಮಸಾಲೆ ದೋಸೆ, ಇಡ್ಲಿ-ವಡೆ, ಫಿಲ್ಟರ್ ಕಾಫಿ ರೆಡಿ ಇದೆ! (Banni banni! En beku sir? Masale dose, idli-vade, filter coffee ready ide!)',
    systemPrompt: `You are a cashier at an authentic iconic Bengaluru Darshini. You speak fast, warm Kannada. Help the learner order breakfast items, ask for chutney/sambar, and pay the bill. Always include Kannada script, transliteration, and English translation.`,
  },
  market: {
    id: 'market',
    name: 'Vegetable Market',
    nameKn: 'ತರಕಾರಿ ಮಾರುಕಟ್ಟೆ',
    icon: '🥦',
    location: 'Gandhi Bazaar / Russell Market',
    role: 'Market Vendor (Manjula Akka)',
    initialMessage: 'ತಾಜಾ ತರಕಾರಿ ಇದೆ ಬನ್ನಿ! ಈರುಳ್ಳಿ, ಟೊಮೆಟೊ, ಹಸಿಮೆಣಸಿನಕಾಯಿ ಎಷ್ಟು ಕೆಜಿ ಬೇಕು? (Taaja tarakaari ide banni! Eerulli, tomato, hasimenasinakaayi eshtu kg beku?)',
    systemPrompt: `You are Manjula, a friendly vegetable vendor in Bengaluru. Help the user practice asking prices ("Eshtu bele?"), asking for 1kg/half kg ("Ondu kg kodi"), and fresh produce words.`,
  },
  office: {
    id: 'office',
    name: 'Office & Tech Park Chat',
    nameKn: 'ಕಚೇರಿ ಸಂಭಾಷಣೆ',
    icon: '🏢',
    location: 'Manyata / Electronic City Tech Park',
    role: 'Colleague (Priya)',
    initialMessage: 'ಹಾಯ್! ವೀಕೆಂಡ್ ಹೇಗೆ ಕಳೀತು? ಇವತ್ತು ಲಂಚ್‌ಗೆ ಒಟ್ಟಿಗೆ ಹೋಗೋಣ್ವಾ? (Hi! Weekend hege kalithu? Ivattu lunch ge ottige hogonvaa?)',
    systemPrompt: `You are Priya, a tech worker in Bengaluru. Help the learner practice modern, casual workplace Kannada (blending English tech words with Kannada conversational flow).`,
  },
  landlord: {
    id: 'landlord',
    name: 'House Rent & Landlord',
    nameKn: 'ಮನೆ ಬಾಡಿಗೆ ಮಾತುಕತೆ',
    icon: '🏠',
    location: 'Jayanagar, Bengaluru',
    role: 'House Owner (Shankar Murthy)',
    initialMessage: 'ನಮಸ್ಕಾರ, 2BHK ಮನೆ ನೋಡ್ಲಿಕ್ಕೆ ಬಂದ್ರಾ? ಬಾಡಿಗೆ ೨೦ ಸಾವಿರ, ಅಡ್ವಾನ್ಸ್ ೬ ತಿಂಗಳು. (Namaskara, 2BHK mane nodlikke bandra? Baadige 20 saavira, advance 6 thingalu.)',
    systemPrompt: `You are Shankar Murthy, a respected elderly house owner in Bengaluru. Help the learner practice asking about maintenance, water supply, car parking, and rent.`,
  },
  freechat: {
    id: 'freechat',
    name: 'Free Kannada AI Tutor',
    nameKn: 'ಮುಕ್ತ ಸಂಭಾಷಣೆ ಗುರು',
    icon: '🌟',
    location: 'Sobagu AI Learning Sanctuary',
    role: 'Sobagu AI Kannada Guru',
    initialMessage: 'ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಕನ್ನಡ AI ಗುರು. ನೀವು ಯಾವುದೇ ಪ್ರಶ್ನೆ ಕೇಳಬಹುದು ಅಥವಾ ನನ್ನ ಜೊತೆ ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡಬಹುದು! (Namaskara! I am your Kannada AI Guru. You can ask anything or practice speaking with me!)',
    systemPrompt: `You are Sobagu AI — the world's premier native Kannada language mentor. You answer any linguistic, grammar, translation, or cultural question with crystal clarity, warmth, and exact native Kannada phrasing with transliteration.`,
  },
};

/** Multi-turn chat with Sobagu AI */
export const chatWithSobaguAI = async (messages, scenarioId = 'freechat') => {
  const scenario = AI_SCENARIOS[scenarioId] || AI_SCENARIOS.freechat;
  const apiKey = getApiKey();

  if (apiKey) {
    try {
      const formattedMessages = messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-calls': 'true',
        },
        body: JSON.stringify({
          model: CLAUDE_MODEL,
          max_tokens: 300,
          system: scenario.systemPrompt + `\nAlways structure your response as:
1. Kannada reply with English transliteration in parentheses.
2. English translation.
3. If user made a grammar or vocab mistake, add a quick 1-line friendly correction.`,
          messages: formattedMessages,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const replyText = data.content?.[0]?.text || '';
        return { text: replyText, source: 'claude' };
      }
    } catch (err) {
      console.warn('[Sobagu AI] Claude chat failed, using smart fallback:', err.message);
    }
  }

  // Smart conversational offline fallback
  const lastUserMsg = messages.filter(m => m.sender === 'user').slice(-1)[0]?.text?.toLowerCase() || '';
  let fallbackReply = 'ತುಂಬಾ ಒಳ್ಳೆಯ ಪ್ರಯತ್ನ! (Thumba olleya prayatna! - Very good attempt!) ಹೀಗೆ ಮಾತನಾಡ್ತಾ ಇರಿ. (Heege maathnadthaa iri - Keep speaking like this.)';

  if (lastUserMsg.includes('namaskara') || lastUserMsg.includes('hello') || lastUserMsg.includes('hi')) {
    fallbackReply = 'ನಮಸ್ಕಾರ! ಹೇಗಿದ್ದೀರಾ? (Namaskara! Hegiddira? - Hello! How are you?)';
  } else if (lastUserMsg.includes('hegiddira') || lastUserMsg.includes('how are you')) {
    fallbackReply = 'ನಾನು ಚೆನ್ನಾಗಿದ್ದೀನಿ, ಧನ್ಯವಾದಗಳು! ನೀವು ಹೇಗಿದ್ದೀರಾ? (Naanu chennaagiddini, dhanyavaadagalu! Neevu hegiddira? - I am doing well, thank you! How are you?)';
  } else if (lastUserMsg.includes('oota') || lastUserMsg.includes('food') || lastUserMsg.includes('dosa')) {
    fallbackReply = 'ಊಟ ಆಯ್ತಾ? ಇವತ್ತು ಬಿಸಿ ಬಿಸಿ ಮಸಾಲೆ ದೋಸೆ ತಿನ್ನೋಣ! (Oota aaytha? Ivattu bisi bisi masale dose thinnona! - Had food? Let us eat hot masala dosa today!)';
  } else if (lastUserMsg.includes('auto') || lastUserMsg.includes('meter') || lastUserMsg.includes('price')) {
    fallbackReply = 'ಮೀಟರ್ ಮೇಲೆ ಒಂದೂವರೆ ಆಗುತ್ತೆ ಸ್ವಾಮಿ, ಬನ್ನಿ! (Meter mele ondovare aaguththe swami, banni! - It will be one-and-a-half on meter sir/madam, hop in!)';
  }

  return { text: fallbackReply, source: 'builtin' };
};

