// Quiz Data

export const quizSets = [
  {
    id: 'alphabet',
    name: 'Alphabet Match',
    icon: '🔡',
    questions: [
      { question: 'ಕ', type: 'transliteration', options: ['ka', 'ga', 'cha', 'ta'], answer: 'ka' },
      { question: 'ಮ', type: 'transliteration', options: ['na', 'ma', 'pa', 'ba'], answer: 'ma' },
      { question: 'ಅ', type: 'transliteration', options: ['aa', 'i', 'a', 'u'], answer: 'a' },
      { question: 'ಆ', type: 'transliteration', options: ['a', 'aa', 'ai', 'au'], answer: 'aa' },
      { question: 'ಸ', type: 'transliteration', options: ['sha', 'sa', 'ha', 'ra'], answer: 'sa' },
      { question: 'ನ', type: 'transliteration', options: ['ma', 'na', 'va', 'la'], answer: 'na' },
      { question: 'ಹ', type: 'transliteration', options: ['ha', 'sa', 'sha', 'ka'], answer: 'ha' },
      { question: 'ಪ', type: 'transliteration', options: ['ba', 'ma', 'pa', 'fa'], answer: 'pa' },
    ]
  },
  {
    id: 'vocabulary',
    name: 'Vocabulary Quiz',
    icon: '📚',
    questions: [
      { question: 'ನಮಸ್ಕಾರ', type: 'meaning', options: ['Thank you', 'Hello', 'Goodbye', 'Sorry'], answer: 'Hello' },
      { question: 'ಧನ್ಯವಾದ', type: 'meaning', options: ['Yes', 'No', 'Thank you', 'Please'], answer: 'Thank you' },
      { question: 'ಎಷ್ಟು', type: 'meaning', options: ['Where', 'Who', 'How much', 'When'], answer: 'How much' },
      { question: 'ನೀರು', type: 'meaning', options: ['Milk', 'Water', 'Coffee', 'Rice'], answer: 'Water' },
      { question: 'ಊಟ', type: 'meaning', options: ['Drink', 'Meal', 'Rest', 'Walk'], answer: 'Meal' },
      { question: 'ಸಂತೋಷ', type: 'meaning', options: ['Sadness', 'Anger', 'Happiness', 'Fear'], answer: 'Happiness' },
      { question: 'ಹೌದು', type: 'meaning', options: ['Yes', 'No', 'Maybe', 'Never'], answer: 'Yes' },
      { question: 'ಬೇಡ', type: 'meaning', options: ['Come', 'Go', 'Don\'t want', 'Need'], answer: 'Don\'t want' },
    ]
  },
  {
    id: 'numbers',
    name: 'Number Sprint',
    icon: '🔢',
    questions: [
      { question: 'ಒಂದು', type: 'meaning', options: ['1', '2', '3', '4'], answer: '1' },
      { question: 'ಐದು', type: 'meaning', options: ['3', '4', '5', '6'], answer: '5' },
      { question: 'ಹತ್ತು', type: 'meaning', options: ['7', '8', '9', '10'], answer: '10' },
      { question: 'ಇಪ್ಪತ್ತು', type: 'meaning', options: ['10', '20', '30', '40'], answer: '20' },
      { question: 'ನೂರು', type: 'meaning', options: ['10', '50', '100', '1000'], answer: '100' },
      { question: 'ಮೂರು', type: 'meaning', options: ['1', '2', '3', '4'], answer: '3' },
    ]
  },
  {
    id: 'listening',
    name: 'Listen & Match',
    icon: '🎧',
    questions: [
      { question: 'Which word means "Where"?', type: 'choose_kannada', options: ['ಎಲ್ಲಿ', 'ಎಷ್ಟು', 'ಯಾವಾಗ', 'ಯಾರು'], answer: 'ಎಲ್ಲಿ', audioWord: 'ಎಲ್ಲಿ' },
      { question: 'Which word means "Come"?', type: 'choose_kannada', options: ['ಹೋಗು', 'ಬಾ', 'ನಿಲ್ಲು', 'ಓಡು'], answer: 'ಬಾ', audioWord: 'ಬಾ' },
      { question: 'Which word means "Tomorrow"?', type: 'choose_kannada', options: ['ಇಂದು', 'ನಿನ್ನೆ', 'ನಾಳೆ', 'ಮೊನ್ನೆ'], answer: 'ನಾಳೆ', audioWord: 'ನಾಳೆ' },
      { question: 'Which word means "Water"?', type: 'choose_kannada', options: ['ಹಾಲು', 'ನೀರು', 'ಕಾಫಿ', 'ಅನ್ನ'], answer: 'ನೀರು', audioWord: 'ನೀರು' },
    ]
  }
];
