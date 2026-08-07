import React, { useState, useEffect } from 'react';
import { addXP, markExplored, getCurrentUser, updateUser } from '../utils/storage.js';
import { speakKannada } from '../utils/tts.js';

const WORDS_OF_DAY = [
  { kannada: 'ಮಿಂಚು', meaning: 'Lightning', transliteration: 'mincu', example: 'ಆಕಾಶದಲ್ಲಿ ಮಿಂಚು ಹೊಳೆಯಿತು.', exampleMeaning: 'Lightning flashed in the sky.' },
  { kannada: 'ಮಳೆ', meaning: 'Rain', transliteration: 'maḷe', example: 'ಮಳೆ ಬೀಳುತ್ತಿದೆ.', exampleMeaning: 'It is raining.' },
  { kannada: 'ಬೆಟ್ಟ', meaning: 'Mountain / Hill', transliteration: 'beṭṭa', example: 'ಬೆಟ್ಟ ತುಂಬಾ ಎತ್ತರವಿದೆ.', exampleMeaning: 'The hill is very tall.' },
  { kannada: 'ಕಡಲು', meaning: 'Sea / Ocean', transliteration: 'kaḍalu', example: 'ಕಡಲು ನೀಲಿ ಬಣ್ಣದ್ದಾಗಿದೆ.', exampleMeaning: 'The sea is blue.' },
  { kannada: 'ಬೆಳಕು', meaning: 'Light', transliteration: 'beḷaku', example: 'ಸೂರ್ಯ ಬೆಳಕು ನೀಡುತ್ತಾನೆ.', exampleMeaning: 'The sun gives light.' },
  { kannada: 'ಹೂವು', meaning: 'Flower', transliteration: 'hūvu', example: 'ಹೂವು ಸುಂದರವಾಗಿದೆ.', exampleMeaning: 'The flower is beautiful.' },
  { kannada: 'ಗಾಳಿ', meaning: 'Wind / Air', transliteration: 'gāḷi', example: 'ತಂಪಾದ ಗಾಳಿ ಬೀಸುತ್ತಿದೆ.', exampleMeaning: 'A cool breeze is blowing.' },
  { kannada: 'ಮರ', meaning: 'Tree', transliteration: 'mara', example: 'ಮರ ಹಸಿರಾಗಿದೆ.', exampleMeaning: 'The tree is green.' },
  { kannada: 'ನದಿ', meaning: 'River', transliteration: 'nadi', example: 'ನದಿ ಹರಿಯುತ್ತಿದೆ.', exampleMeaning: 'The river is flowing.' },
  { kannada: 'ಪಕ್ಷಿ', meaning: 'Bird', transliteration: 'pakṣi', example: 'ಪಕ್ಷಿ ಮರದ ಮೇಲೆ ಕುಳಿತಿದೆ.', exampleMeaning: 'The bird is sitting on the tree.' },
  { kannada: 'ಆಟ', meaning: 'Play / Game', transliteration: 'āṭa', example: 'ಮಕ್ಕಳು ಆಟ ಆಡುತ್ತಿದ್ದಾರೆ.', exampleMeaning: 'Children are playing a game.' },
  { kannada: 'ಕನಸು', meaning: 'Dream', transliteration: 'kanasu', example: 'ನಾನು ಒಳ್ಳೆಯ ಕನಸು ಕಂಡೆ.', exampleMeaning: 'I had a good dream.' },
  { kannada: 'ಪ್ರೀತಿ', meaning: 'Love', transliteration: 'prīti', example: 'ಅಮ್ಮನ ಪ್ರೀತಿ ಅಮೂಲ್ಯ.', exampleMeaning: 'A mother\'s love is precious.' },
  { kannada: 'ಶಕ್ತಿ', meaning: 'Power / Strength', transliteration: 'śakti', example: 'ಜ್ಞಾನ ಶಕ್ತಿ ನೀಡುತ್ತದೆ.', exampleMeaning: 'Knowledge gives power.' },
  { kannada: 'ಸ್ನೇಹ', meaning: 'Friendship', transliteration: 'snēha', example: 'ಸ್ನೇಹ ಬಾಳಿಗೆ ಆಧಾರ.', exampleMeaning: 'Friendship is the pillar of life.' },
  { kannada: 'ಸಂಗೀತ', meaning: 'Music', transliteration: 'saṃgīta', example: 'ಸಂಗೀತ ಮನಸ್ಸಿಗೆ ಸುಖ.', exampleMeaning: 'Music is a comfort to the mind.' },
  { kannada: 'ಪ್ರಕೃತಿ', meaning: 'Nature', transliteration: 'prakṛti', example: 'ಪ್ರಕೃತಿ ಮನೋಹರ.', exampleMeaning: 'Nature is beautiful.' },
  { kannada: 'ಭಾಷೆ', meaning: 'Language', transliteration: 'bhāṣe', example: 'ಕನ್ನಡ ನಮ್ಮ ಭಾಷೆ.', exampleMeaning: 'Kannada is our language.' },
  { kannada: 'ದಾರಿ', meaning: 'Path / Way', transliteration: 'dāri', example: 'ಮನೆಗೆ ದಾರಿ ಯಾವುದು?', exampleMeaning: 'Which is the way home?' },
  { kannada: 'ವಿಚಾರ', meaning: 'Thought / Idea', transliteration: 'vicāra', example: 'ಒಳ್ಳೆಯ ವಿಚಾರ ಮಾಡು.', exampleMeaning: 'Think good thoughts.' },
  { kannada: 'ಆಸ್ತಿ', meaning: 'Wealth / Property', transliteration: 'āsti', example: 'ಜ್ಞಾನ ಶ್ರೇಷ್ಠ ಆಸ್ತಿ.', exampleMeaning: 'Knowledge is the greatest wealth.' },
  { kannada: 'ಬಾಳು', meaning: 'Life / To live', transliteration: 'bāḷu', example: 'ಸರಿಯಾಗಿ ಬಾಳು.', exampleMeaning: 'Live life properly.' },
  { kannada: 'ತಿಳಿವು', meaning: 'Knowledge / Understanding', transliteration: 'tiḷivu', example: 'ತಿಳಿವು ಹೊಂದಿರು.', exampleMeaning: 'Possess knowledge.' },
  { kannada: 'ನಗು', meaning: 'Laughter / Smile', transliteration: 'nagu', example: 'ಮಕ್ಕಳ ನಗು ಸೊಗಸು.', exampleMeaning: 'The laughter of children is wonderful.' },
  { kannada: 'ಕೆಲಸ', meaning: 'Work / Job', transliteration: 'kelasa', example: 'ಕೆಲಸ ಮಾಡಿ ಸಂತೋಷ ಪಡು.', exampleMeaning: 'Work and be happy.' },
  { kannada: 'ಸ್ವಾತಂತ್ರ್ಯ', meaning: 'Freedom', transliteration: 'svātantryа', example: 'ಸ್ವಾತಂತ್ರ್ಯ ಬೆಲೆಯುಳ್ಳದ್ದು.', exampleMeaning: 'Freedom is precious.' },
  { kannada: 'ಗ್ರಾಮ', meaning: 'Village', transliteration: 'grāma', example: 'ನಮ್ಮ ಗ್ರಾಮ ಚಂದ.', exampleMeaning: 'Our village is beautiful.' },
  { kannada: 'ಶಾಲೆ', meaning: 'School', transliteration: 'śāle', example: 'ಶಾಲೆಗೆ ಹೋಗಿ ಕಲಿ.', exampleMeaning: 'Go to school and learn.' },
  { kannada: 'ಊಟ', meaning: 'Meal / Food', transliteration: 'ūṭa', example: 'ಊಟ ರುಚಿಯಾಗಿದೆ.', exampleMeaning: 'The meal is delicious.' },
  { kannada: 'ಉತ್ಸವ', meaning: 'Festival / Celebration', transliteration: 'utsava', example: 'ದಸರ ಉತ್ಸವ ಮೈಸೂರಿನಲ್ಲಿ.', exampleMeaning: 'Dasara festival is in Mysuru.' },
];

const WordOfTheDay = ({ onXP, onToast }) => {
  const [claimed, setClaimed] = useState(false);
  const [liked, setLiked] = useState(false);

  // Pick today's word based on day-of-year
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const word = WORDS_OF_DAY[dayOfYear % WORDS_OF_DAY.length];

  useEffect(() => {
    const todayKey = `wotd_${new Date().toDateString()}`;
    setClaimed(localStorage.getItem(todayKey) === '1');
  }, []);

  const claim = () => {
    const todayKey = `wotd_${new Date().toDateString()}`;
    if (claimed) return;
    localStorage.setItem(todayKey, '1');
    setClaimed(true);
    addXP(25); onXP && onXP(25);
    markExplored(`wotd_${word.kannada}`);
    onToast && onToast('📅 Word of the Day claimed! +25 XP', 'xp');
  };

  const yesterday = WORDS_OF_DAY[(dayOfYear - 1) % WORDS_OF_DAY.length];
  const tomorrow = WORDS_OF_DAY[(dayOfYear + 1) % WORDS_OF_DAY.length];

  return (
    <div className="learning-screen">
      <div className="page-header">
        <h2>📅 Word of the Day</h2>
        <p>A fresh Kannada word every day — claim your bonus XP!</p>
      </div>

      {/* Main word card */}
      <div className="glass-card" style={{ padding: '0', overflow: 'hidden', marginBottom: '1.5rem' }}>
        <div style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
          <div style={{ fontFamily: 'Noto Sans Kannada, sans-serif', fontSize: 'clamp(2.5rem, 8vw, 4rem)', fontWeight: 900, marginBottom: '0.25rem' }}>
            {word.kannada}
          </div>
          <div style={{ fontSize: '1.1rem', opacity: 0.85, fontStyle: 'italic' }}>{word.transliteration}</div>
        </div>

        <div style={{ padding: '2rem' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
            🌟 {word.meaning}
          </div>

          {/* Example sentence */}
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Example</div>
            <div style={{ fontFamily: 'Noto Sans Kannada, sans-serif', fontSize: '1.1rem', color: 'var(--sakura-pink)', marginBottom: '0.25rem' }}>
              {word.example}
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>{word.exampleMeaning}</div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className="audio-btn" onClick={() => { speakKannada(word.kannada); }}>
              🔊 Hear Word
            </button>
            <button className="audio-btn" onClick={() => { speakKannada(word.example); }}>
              🔊 Hear Example
            </button>
            <button
              onClick={() => setLiked(l => !l)}
              style={{ padding: '0.6rem 1rem', background: liked ? 'rgba(255,182,193,0.2)' : 'transparent', border: '1px solid rgba(255,182,193,0.4)', borderRadius: '8px', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '1rem' }}
            >
              {liked ? '❤️ Liked' : '🤍 Like'}
            </button>
          </div>

          {/* Claim XP */}
          <button
            onClick={claim}
            disabled={claimed}
            className="btn-primary"
            style={{ width: '100%', marginTop: '1.5rem', opacity: claimed ? 0.6 : 1 }}
          >
            {claimed ? '✅ XP Claimed Today!' : '🎁 Claim +25 XP for Today'}
          </button>
        </div>
      </div>

      {/* Yesterday / Tomorrow preview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {[
          { label: 'Yesterday was', word: yesterday, opacity: 0.6 },
          { label: 'Tomorrow will be', word: tomorrow, opacity: 0.4, blur: true },
        ].map(({ label, word: w, opacity, blur }) => (
          <div key={label} className="glass-card" style={{ padding: '1.25rem', opacity, position: 'relative', overflow: 'hidden' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</div>
            <div style={{ fontFamily: 'Noto Sans Kannada, sans-serif', fontSize: '1.5rem', fontWeight: 700, color: 'var(--sakura-pink)', filter: blur ? 'blur(4px)' : 'none' }}>
              {w.kannada}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', filter: blur ? 'blur(4px)' : 'none' }}>{w.meaning}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WordOfTheDay;
