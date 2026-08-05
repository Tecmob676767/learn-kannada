// Advanced Pronunciation Scoring & Analysis Engine for Sobagu

/** Normalize text for comparison — strip diacritics, lowercase, collapse whitespace */
export const normalizeForCompare = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z\u0C80-\u0CFF\s]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
};

/** Levenshtein distance */
const levenshtein = (a, b) => {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
};

/** Similarity score 0–100 */
export const similarityScore = (expected, spoken) => {
  const a = normalizeForCompare(expected);
  const b = normalizeForCompare(spoken);
  if (!a && !b) return 100;
  if (!b) return 0;
  if (a === b) return 100;
  const maxLen = Math.max(a.length, b.length);
  const dist = levenshtein(a, b);
  return Math.round(Math.max(0, (1 - dist / maxLen) * 100));
};

/** Kannada Unicode range check */
export const hasKannadaScript = (text) => /[\u0C80-\u0CFF]/.test(text);

/** Score pronunciation against expected Kannada + transliteration */
export const scorePronunciation = (expected, transliteration, spoken) => {
  if (!spoken?.trim()) {
    return {
      score: 0,
      grade: 'F',
      stars: 0,
      kannadaMatch: 0,
      translitMatch: 0,
      feedback: 'No speech detected. Tap the mic and try speaking clearly.',
      tips: ['Hold the mic button and speak right after the beep.', 'Speak in a quiet room.', 'Try saying it slower, syllable by syllable.'],
    };
  }

  const kannadaMatch = similarityScore(expected, spoken);
  const translitMatch = transliteration ? similarityScore(transliteration, spoken) : 0;
  const spokenHasKannada = hasKannadaScript(spoken);

  let score;
  if (spokenHasKannada) {
    score = Math.round(kannadaMatch * 0.85 + translitMatch * 0.15);
  } else {
    score = Math.round(translitMatch * 0.9 + kannadaMatch * 0.1);
  }

  score = Math.min(100, Math.max(0, score));

  const { grade, stars } = scoreToGrade(score);
  const feedback = generateFeedback(score, expected, transliteration, spoken, spokenHasKannada);
  const tips = generateTips(score, expected, transliteration, spoken);

  return { score, grade, stars, kannadaMatch, translitMatch, feedback, tips, spokenHasKannada };
};

const scoreToGrade = (score) => {
  if (score >= 95) return { grade: 'A+', stars: 5 };
  if (score >= 85) return { grade: 'A', stars: 4 };
  if (score >= 75) return { grade: 'B', stars: 3 };
  if (score >= 60) return { grade: 'C', stars: 2 };
  if (score >= 40) return { grade: 'D', stars: 1 };
  return { grade: 'F', stars: 0 };
};

const generateFeedback = (score, expected, transliteration, spoken, spokenHasKannada) => {
  if (score >= 95) return `Perfect! "${expected}" sounded native-level. ನಿಮ್ಮ ಉಚ್ಚಾರಣೆ ಅದ್ಭುತ!`;
  if (score >= 85) return `Excellent! Very close to native pronunciation. Keep it up!`;
  if (score >= 75) return `Good effort! You're getting there — a little more practice on the retroflex sounds.`;
  if (score >= 60) return `Fair attempt. Listen again slowly, then mimic each syllable before speaking.`;
  if (score >= 40) return `Keep trying! You said "${spoken}" — aim for "${transliteration || expected}".`;
  if (!spokenHasKannada && transliteration) {
    return `Try speaking the romanized form: "${transliteration}". The mic works best with clear syllables.`;
  }
  return `Let's retry. Listen to the native audio first, then repeat immediately.`;
};

const RETROFLEX_LETTERS = ['ಟ', 'ಠ', 'ಡ', 'ಢ', 'ಣ', 'ಳ'];
const ASPIRATED_PAIRS = [
  ['ಕ', 'ಖ'], ['ಗ', 'ಘ'], ['ಚ', 'ಛ'], ['ಜ', 'ಝ'],
  ['ಟ', 'ಠ'], ['ಡ', 'ಢ'], ['ತ', 'ಥ'], ['ದ', 'ಧ'], ['ಪ', 'ಫ'], ['ಬ', 'ಭ'],
];

const generateTips = (score, expected, transliteration, spoken) => {
  const tips = [];
  const exp = expected || '';

  if (score < 80) {
    for (const letter of RETROFLEX_LETTERS) {
      if (exp.includes(letter)) {
        tips.push(`Focus on retroflex "${letter}" — curl your tongue back to the roof of your mouth.`);
        break;
      }
    }
  }

  if (score < 70 && transliteration) {
    tips.push(`Break it down: ${transliteration.split('').join(' · ')} — say each part slowly.`);
  }

  if (score < 60) {
    tips.push('Use "Slow Learner" mode to hear each syllable separately before you speak.');
  }

  if (score < 50) {
    tips.push('Watch your mouth shape in a mirror while mimicking the native audio.');
  }

  for (const [plain, aspirated] of ASPIRATED_PAIRS) {
    if (exp.includes(aspirated) && score < 85) {
      tips.push(`"${aspirated}" is aspirated — add a puff of air compared to "${plain}".`);
      break;
    }
  }

  if (tips.length === 0) {
    tips.push('Try the tongue twister mode to sharpen your fluency!');
  }

  return tips.slice(0, 3);
};

/** XP reward based on score */
export const getXPForScore = (score) => {
  if (score >= 95) return 15;
  if (score >= 85) return 12;
  if (score >= 75) return 10;
  if (score >= 60) return 7;
  if (score >= 40) return 4;
  return 2;
};
