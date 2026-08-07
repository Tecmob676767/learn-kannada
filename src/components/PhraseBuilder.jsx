import React, { useState } from 'react';
import { addXP } from '../utils/storage.js';
import { speakKannada } from '../utils/tts.js';

const EXERCISES = [
  {
    id: 'pb1',
    english: 'I am learning Kannada.',
    words: ['ನಾನು', 'ಕನ್ನಡ', 'ಕಲಿಯುತ್ತಿದ್ದೇನೆ', '.'],
    answer: ['ನಾನು', 'ಕನ್ನಡ', 'ಕಲಿಯುತ್ತಿದ್ದೇನೆ', '.'],
    translation: 'nānu kannaḍa kaliyuttiddēne.',
  },
  {
    id: 'pb2',
    english: 'He goes to school.',
    words: ['ಶಾಲೆಗೆ', 'ಅವನು', '.', 'ಹೋಗುತ್ತಾನೆ'],
    answer: ['ಅವನು', 'ಶಾಲೆಗೆ', 'ಹೋಗುತ್ತಾನೆ', '.'],
    translation: 'avanu śālege hōguttāne.',
  },
  {
    id: 'pb3',
    english: 'The flower is beautiful.',
    words: ['ಸುಂದರವಾಗಿದೆ', '.', 'ಹೂವು'],
    answer: ['ಹೂವು', 'ಸುಂದರವಾಗಿದೆ', '.'],
    translation: 'hūvu sundaravāgide.',
  },
  {
    id: 'pb4',
    english: 'Water is essential for life.',
    words: ['ಜೀವನಕ್ಕೆ', 'ನೀರು', 'ಅಗತ್ಯ', '.'],
    answer: ['ನೀರು', 'ಜೀವನಕ್ಕೆ', 'ಅಗತ್ಯ', '.'],
    translation: 'nīru jīvanakke agatsya.',
  },
  {
    id: 'pb5',
    english: 'The children are playing in the garden.',
    words: ['ತೋಟದಲ್ಲಿ', 'ಮಕ್ಕಳು', 'ಆಡುತ್ತಿದ್ದಾರೆ', '.'],
    answer: ['ಮಕ್ಕಳು', 'ತೋಟದಲ್ಲಿ', 'ಆಡುತ್ತಿದ್ದಾರೆ', '.'],
    translation: 'makkaḷu tōṭadalli āḍuttiddāre.',
  },
  {
    id: 'pb6',
    english: 'Kannada is our mother tongue.',
    words: ['ನಮ್ಮ', 'ಕನ್ನಡ', 'ಭಾಷೆ', 'ಮಾತೃ', '.'],
    answer: ['ಕನ್ನಡ', 'ನಮ್ಮ', 'ಮಾತೃ', 'ಭಾಷೆ', '.'],
    translation: 'kannaḍa namma mātṛ bhāṣe.',
  },
];

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

const PhraseBuilder = ({ onXP, onToast }) => {
  const [exIdx, setExIdx] = useState(0);
  const [bank, setBank] = useState(() => shuffle([...EXERCISES[0].words]));
  const [slots, setSlots] = useState([]);
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });

  const ex = EXERCISES[exIdx];

  const addToSlot = (word, bankIdx) => {
    if (checked) return;
    setSlots(s => [...s, { word, bankIdx }]);
    setBank(b => b.filter((_, i) => i !== bankIdx));
  };

  const removeFromSlot = (slotIdx) => {
    if (checked) return;
    const item = slots[slotIdx];
    setBank(b => [...b, item.word]);
    setSlots(s => s.filter((_, i) => i !== slotIdx));
  };

  const check = () => {
    const attempt = slots.map(s => s.word);
    const isCorrect = JSON.stringify(attempt) === JSON.stringify(ex.answer);
    setChecked(true);
    setCorrect(isCorrect);
    if (isCorrect) {
      addXP(20); onXP && onXP(20);
      setScore(s => ({ ...s, correct: s.correct + 1 }));
      onToast && onToast('🏗️ Perfect sentence! +20 XP', 'xp');
      speakKannada(ex.answer.join(' ').replace(' .', '.'));
    } else {
      addXP(5); onXP && onXP(5);
      setScore(s => ({ ...s, wrong: s.wrong + 1 }));
    }
  };

  const reset = () => {
    setBank(shuffle([...ex.words]));
    setSlots([]);
    setChecked(false);
    setCorrect(false);
  };

  const next = () => {
    const newIdx = (exIdx + 1) % EXERCISES.length;
    setExIdx(newIdx);
    setBank(shuffle([...EXERCISES[newIdx].words]));
    setSlots([]);
    setChecked(false);
    setCorrect(false);
  };

  return (
    <div className="learning-screen">
      <div className="page-header">
        <h2>📝 Phrase Builder</h2>
        <p>Tap words in the correct order to build a Kannada sentence!</p>
      </div>

      {/* Score */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Correct', value: score.correct, icon: '✅', color: '#43e97b' },
          { label: 'Wrong', value: score.wrong, icon: '❌', color: '#f5576c' },
          { label: 'Exercise', value: `${exIdx + 1}/${EXERCISES.length}`, icon: '📝', color: '#4facfe' },
        ].map(s => (
          <div key={s.label} className="glass-card" style={{ padding: '0.75rem', textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: '1.2rem' }}>{s.icon}</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="glass-card" style={{ padding: '2rem' }}>
        {/* English sentence to translate */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Build this sentence in Kannada:</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>"{ex.english}"</div>
        </div>

        {/* Answer slots */}
        <div style={{ minHeight: '60px', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: `2px dashed ${checked ? (correct ? '#43e97b' : '#f5576c') : 'rgba(255,255,255,0.15)'}`, marginBottom: '1.5rem', transition: 'border-color 0.3s' }}>
          {slots.length === 0 && (
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', alignSelf: 'center' }}>Tap words below to build the sentence…</span>
          )}
          {slots.map((item, i) => (
            <button key={i} onClick={() => removeFromSlot(i)}
              style={{
                padding: '0.5rem 0.9rem', borderRadius: '8px', border: 'none', cursor: checked ? 'default' : 'pointer',
                background: checked ? (correct ? 'rgba(67,233,123,0.2)' : 'rgba(245,87,108,0.2)') : 'rgba(255,182,193,0.2)',
                fontFamily: 'Noto Sans Kannada, sans-serif', fontSize: '1.1rem', color: 'var(--text-primary)',
                fontWeight: 600, transition: 'all 0.15s',
              }}>
              {item.word}
            </button>
          ))}
        </div>

        {/* Word bank */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
          {bank.map((word, i) => (
            <button key={i} onClick={() => addToSlot(word, i)}
              style={{
                padding: '0.55rem 0.9rem', borderRadius: '8px', cursor: 'pointer',
                background: 'rgba(255,255,255,0.08)', border: '2px solid rgba(255,255,255,0.2)',
                fontFamily: 'Noto Sans Kannada, sans-serif', fontSize: '1.1rem', color: 'var(--text-primary)',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,182,193,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            >
              {word}
            </button>
          ))}
        </div>

        {/* Feedback */}
        {checked && (
          <div style={{ padding: '1rem', borderRadius: '10px', marginBottom: '1rem', textAlign: 'center',
            background: correct ? 'rgba(67,233,123,0.1)' : 'rgba(245,87,108,0.1)',
            border: `1px solid ${correct ? '#43e97b' : '#f5576c'}` }}>
            {correct ? (
              <div>
                <div style={{ color: '#43e97b', fontWeight: 700, fontSize: '1.1rem' }}>✅ Perfect!</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem', fontStyle: 'italic' }}>{ex.translation}</div>
              </div>
            ) : (
              <div>
                <div style={{ color: '#f5576c', fontWeight: 700 }}>❌ Not quite right</div>
                <div style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                  Correct: <span style={{ fontFamily: 'Noto Sans Kannada', color: 'var(--sakura-pink)' }}>{ex.answer.join(' ')}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Controls */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="glass-btn" onClick={reset}>🔄 Reset</button>
          {!checked && slots.length > 0 && (
            <button className="btn-primary" onClick={check} style={{ flex: 2 }}>✅ Check Answer</button>
          )}
          {checked && (
            <button className="btn-primary" onClick={next} style={{ flex: 2 }}>Next Exercise →</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhraseBuilder;
