// Pronunciation Practice Data — Letters, Words, Phrases, Tongue Twisters

import { swaragalu, vyanjanagalu } from './varnamaleData.js';
import { comprehensiveDictionary } from './dictionaryData.js';

export const practiceModes = [
  { id: 'letters', label: 'Alphabet', icon: '🔡', desc: 'Master each Swara & Vyanjana' },
  { id: 'words', label: 'Words', icon: '📚', desc: 'Essential vocabulary pronunciation' },
  { id: 'phrases', label: 'Phrases', icon: '💬', desc: 'Real conversation phrases' },
  { id: 'twisters', label: 'Tongue Twisters', icon: '🌪️', desc: 'Advanced fluency challenge' },
];

export const letterExercises = [
  ...swaragalu.map(s => ({
    id: `swara_${s.kannada}`,
    kannada: s.kannada,
    transliteration: s.transliteration,
    hint: s.soundLike,
    difficulty: 'beginner',
    category: 'Swara',
  })),
  ...vyanjanagalu.map(v => ({
    id: `vyanjana_${v.kannada}`,
    kannada: v.kannada,
    transliteration: v.transliteration,
    hint: `${v.group} consonant`,
    difficulty: v.group === 'Ttavarga' ? 'intermediate' : 'beginner',
    category: 'Vyanjana',
  })),
];

export const wordExercises = comprehensiveDictionary.slice(0, 40).map((w, i) => ({
  id: `word_${i}`,
  kannada: w.kannada,
  transliteration: w.transliteration,
  hint: w.meaning,
  difficulty: w.kannada.length > 6 ? 'intermediate' : 'beginner',
  category: w.category,
}));

export const phraseExercises = [
  { id: 'p1', kannada: 'ನಮಸ್ಕಾರ, ಹೇಗಿದ್ದೀರಿ?', transliteration: 'Namaskara, hegiddiri?', hint: 'Hello, how are you? (respectful)', difficulty: 'beginner' },
  { id: 'p2', kannada: 'ನಾನು ಕನ್ನಡ ಕಲಿಯುತ್ತೇನೆ', transliteration: 'Naanu Kannada kaliyutteene', hint: 'I am learning Kannada', difficulty: 'intermediate' },
  { id: 'p3', kannada: 'ಎಷ್ಟು ಆಗುತ್ತೆ?', transliteration: 'Eshtu aagutte?', hint: 'How much does it cost?', difficulty: 'beginner' },
  { id: 'p4', kannada: 'ದಯವಿಟ್ಟು ನಿಧಾನವಾಗಿ ಮಾತನಾಡಿ', transliteration: 'Dayavittu nidhaanavaagi maathanaadi', hint: 'Please speak slowly', difficulty: 'advanced' },
  { id: 'p5', kannada: 'ನಾನು ಹೊಸವನು, ಕ್ಷಮಿಸಿ', transliteration: 'Naanu hosavanu, kshamisi', hint: 'I am new here, sorry/excuse me', difficulty: 'intermediate' },
  { id: 'p6', kannada: 'ಇದು ಎಷ್ಟು ದೂರ?', transliteration: 'Idu eshtu doora?', hint: 'How far is this?', difficulty: 'beginner' },
  { id: 'p7', kannada: 'ನನಗೆ ಕಾಫಿ ಬೇಕು', transliteration: 'Nanage kaafi beku', hint: 'I want coffee', difficulty: 'beginner' },
  { id: 'p8', kannada: 'ನಾಳೆ ಬರುತ್ತೇನೆ', transliteration: 'Naale barutteene', hint: 'I will come tomorrow', difficulty: 'intermediate' },
  { id: 'p9', kannada: 'ತುಂಬಾ ಧನ್ಯವಾದ', transliteration: 'Thumba dhanyavada', hint: 'Thank you very much', difficulty: 'beginner' },
  { id: 'p10', kannada: 'ನಿಮ್ಮ ಹೆಸರೇನು?', transliteration: 'Nimma hesarenu?', hint: 'What is your name?', difficulty: 'beginner' },
];

export const tongueTwisters = [
  {
    id: 'tt1',
    kannada: 'ಕಟ್ಟದ ಕಪ್ಪೆ ಕಪ್ಪ ಕಪ್ಪ',
    transliteration: 'Kattada kappe kappa kappa',
    hint: 'Frog on wall — classic retroflex drill',
    difficulty: 'advanced',
  },
  {
    id: 'tt2',
    kannada: 'ಬೆಲ್ಲ ಬೆಲ್ಲ ಬೆಲ್ಲ',
    transliteration: 'Bella bella bella',
    hint: 'Jaggery repetition — tests ಲ್ clarity',
    difficulty: 'intermediate',
  },
  {
    id: 'tt3',
    kannada: 'ತಟ್ಟ ತಟ್ಟ ತಟ್ಟ',
    transliteration: 'Thatta thatta thatta',
    hint: 'Retroflex ತ rapid fire',
    difficulty: 'advanced',
  },
  {
    id: 'tt4',
    kannada: 'ನನ್ನ ಅಮ್ಮ ಅನ್ನ ಮಾಡ್ತಾಳೆ',
    transliteration: 'Nanna amma anna maadtaale',
    hint: 'My mother cooks rice — nasal & double consonants',
    difficulty: 'intermediate',
  },
  {
    id: 'tt5',
    kannada: 'ಶಿವ ಶಿವ ಶಿವ',
    transliteration: 'Shiva shiva shiva',
    hint: 'Palatal ಶ vs retroflex ಷ awareness',
    difficulty: 'beginner',
  },
  {
    id: 'tt6',
    kannada: 'ದೊಡ್ಡ ದೊಡ್ಡ ದೋಣ',
    transliteration: 'Dodda dodda dona',
    hint: 'Big big boat — long vowels + retroflex',
    difficulty: 'advanced',
  },
];

export const getExercisesForMode = (mode) => {
  switch (mode) {
    case 'letters': return letterExercises;
    case 'words': return wordExercises;
    case 'phrases': return phraseExercises;
    case 'twisters': return tongueTwisters;
    default: return wordExercises;
  }
};
