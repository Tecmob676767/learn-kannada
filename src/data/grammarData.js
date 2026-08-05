// Grammar - Sentence Architect Data

export const grammarLessons = [
  {
    id: 'intro',
    title: 'SOV Structure',
    titleKannada: 'ವಾಕ್ಯ ರಚನೆ',
    explanation: 'Kannada follows Subject–Object–Verb (SOV) order, unlike English (SVO). The verb always comes at the end!',
    exercises: [
      {
        english: 'I eat rice.',
        words: [
          { kannada: 'ನಾನು', transliteration: 'naanu', role: 'Subject (I)' },
          { kannada: 'ಅನ್ನ', transliteration: 'anna', role: 'Object (rice)' },
          { kannada: 'ತಿನ್ನುತ್ತೇನೆ', transliteration: 'tinnuttene', role: 'Verb (eat)' },
        ],
        correctOrder: [0, 1, 2],
      },
      {
        english: 'She drinks water.',
        words: [
          { kannada: 'ಅವಳು', transliteration: 'avalu', role: 'Subject (She)' },
          { kannada: 'ನೀರು', transliteration: 'neeru', role: 'Object (water)' },
          { kannada: 'ಕುಡಿಯುತ್ತಾಳೆ', transliteration: 'kudiyuttaale', role: 'Verb (drinks)' },
        ],
        correctOrder: [0, 1, 2],
      },
      {
        english: 'He reads a book.',
        words: [
          { kannada: 'ಅವನು', transliteration: 'avanu', role: 'Subject (He)' },
          { kannada: 'ಪುಸ್ತಕ', transliteration: 'pustaka', role: 'Object (book)' },
          { kannada: 'ಓದುತ್ತಾನೆ', transliteration: 'oduttaane', role: 'Verb (reads)' },
        ],
        correctOrder: [0, 1, 2],
      },
    ]
  },
  {
    id: 'negation',
    title: 'Negation in Kannada',
    titleKannada: 'ನಿರಾಕರಣ',
    explanation: 'Negation in Kannada uses the suffix "-illa" (ಇಲ್ಲ) or changing the verb form. "ಮಾಡಲ್ಲ" (maadalla) means "do not do".',
    exercises: [
      {
        english: 'I do not eat meat.',
        words: [
          { kannada: 'ನಾನು', transliteration: 'naanu', role: 'Subject' },
          { kannada: 'ಮಾಂಸ', transliteration: 'maansa', role: 'Object' },
          { kannada: 'ತಿನ್ನಲ್ಲ', transliteration: 'tinnalla', role: 'Neg. Verb' },
        ],
        correctOrder: [0, 1, 2],
      },
    ]
  },
];
