import React, { useState, useEffect, useCallback } from 'react';
import { addXP } from '../utils/storage.js';
import { speakKannada } from '../utils/tts.js';

const SCRAMBLE_WORDS = [
  { kannada: 'ನೀರು', meaning: 'Water', hint: 'You drink this' },
  { kannada: 'ಮನೆ', meaning: 'House', hint: 'You live here' },
  { kannada: 'ಅಮ್ಮ', meaning: 'Mother', hint: 'Loving parent' },
  { kannada: 'ಹಾಲು', meaning: 'Milk', hint: 'White drink from cows' },
  { kannada: 'ಕಾಡು', meaning: 'Forest', hint: 'Trees everywhere' },
  { kannada: 'ಹಣ್ಣು', meaning: 'Fruit', hint: 'Sweet and healthy' },
  { kannada: 'ಕಣ್ಣು', meaning: 'Eye', hint: 'You see with this' },
  { kannada: 'ಬಾಯಿ', meaning: 'Mouth', hint: 'You speak with this' },
  { kannada: 'ಕೈ', meaning: 'Hand', hint: 'You hold things with this' },
  { kannada: 'ಕಾಲು', meaning: 'Leg/Foot', hint: 'You walk with this' },
  { kannada: 'ಆಕಾಶ', meaning: 'Sky', hint: 'Above everything' },
  { kannada: 'ಸೂರ್ಯ', meaning: 'Sun', hint: 'Bright star in the sky' },
  { kannada: 'ಚಂದ್ರ', meaning: 'Moon', hint: 'Shines at night' },
  { kannada: 'ನಾಯಿ', meaning: 'Dog', hint: 'Loyal pet animal' },
  { kannada: 'ಹಕ್ಕಿ', meaning: 'Bird', hint: 'Flies in the sky' },
  { kannada: 'ಮೀನು', meaning: 'Fish', hint: 'Lives in water' },
];

const scramble = (word) => {
  const chars = word.split('');
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  // Ensure it's actually scrambled
  const result = chars.join('');
  return result === word && word.length > 1 ? scramble(word) : result;
};

const ScrambledWords = ({ onXP, onToast }) => {
  const [idx, setIdx] = useState(0);
  const [scrambled, setScrambled] = useState([]);
  const [selected, setSelected] = useState([]);
  const [result, setResult] = useState(null);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [showHint, setShowHint] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  const word = SCRAMBLE_WORDS[idx];

  const initRound = useCallback((i) => {
    const w = SCRAMBLE_WORDS[i];
    const sc = scramble(w.kannada).split('').map((ch, ci) => ({ ch, id: ci }));
    setScrambled(sc);
    setSelected([]);
    setResult(null);
    setShowHint(false);
    setTimeLeft(30);
  }, []);

  useEffect(() => { initRound(idx); }, [idx, initRound]);

  useEffect(() => {
    if (result) return;
    const t = setTimeout(() => {
      setTimeLeft(s => {
        if (s <= 1) { setResult('timeout'); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearTimeout(t);
  }, [timeLeft, result]);

  const handleSelect = (item) => {
    if (result) return;
    setSelected(s => [...s, item]);
    setScrambled(s => s.filter(x => x.id !== item.id));

    const newSelected = [...selected, item];
    if (newSelected.length === word.kannada.length) {
      const attempt = newSelected.map(x => x.ch).join('');
      if (attempt === word.kannada) {
        setResult('correct');
        const xp = showHint ? 8 : 15;
        addXP(xp); onXP && onXP(xp);
        setScore(s => ({ ...s, correct: s.correct + 1 }));
        onToast && onToast(`✅ Correct! +${xp} XP`, 'xp');
        speakKannada(word.kannada);
      } else {
        setResult('wrong');
        setScore(s => ({ ...s, wrong: s.wrong + 1 }));
      }
    }
  };

  const handleDeselect = (item) => {
    if (result) return;
    setSelected(s => s.filter(x => x.id !== item.id));
    setScrambled(s => [...s, item]);
  };

  const next = () => setIdx(i => (i + 1) % SCRAMBLE_WORDS.length);
  const reset = () => initRound(idx);

  const timerColor = timeLeft > 15 ? '#43e97b' : timeLeft > 8 ? '#ffd200' : '#f5576c';

  return (
    <div className="learning-screen">
      <div className="page-header">
        <h2>🎲 Scrambled Words</h2>
        <p>Tap the letters in the correct order to form the Kannada word!</p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { label: 'Correct', value: score.correct, icon: '✅', color: '#43e97b' },
          { label: 'Wrong', value: score.wrong, icon: '❌', color: '#f5576c' },
          { label: 'Time', value: `${timeLeft}s`, icon: '⏱', color: timerColor },
        ].map(s => (
          <div key={s.label} className="glass-card" style={{ padding: '0.75rem', textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: '1.2rem' }}>{s.icon}</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="glass-card" style={{ padding: '2rem', marginBottom: '1.5rem', textAlign: 'center' }}>
        {/* Timer bar */}
        <div style={{ width: '100%', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', height: '6px', marginBottom: '1.5rem', overflow: 'hidden' }}>
          <div style={{ width: `${(timeLeft / 30) * 100}%`, background: timerColor, height: '100%', transition: 'width 1s linear, background 0.5s' }} />
        </div>

        {/* Meaning & hint */}
        <div style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
          <strong style={{ color: 'var(--text-primary)' }}>Meaning:</strong> {word.meaning}
        </div>
        {showHint && (
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '1rem' }}>
            💡 Hint: {word.hint}
          </div>
        )}

        {/* Answer slots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap', minHeight: '60px' }}>
          {selected.map((item, i) => (
            <button key={`sel-${item.id}`} onClick={() => handleDeselect(item)}
              style={{
                width: '52px', height: '52px', borderRadius: '10px',
                background: result === 'correct' ? 'rgba(67,233,123,0.25)' : result === 'wrong' ? 'rgba(245,87,108,0.25)' : 'rgba(255,182,193,0.2)',
                border: `2px solid ${result === 'correct' ? '#43e97b' : result === 'wrong' ? '#f5576c' : 'var(--sakura-pink)'}`,
                fontFamily: 'Noto Sans Kannada, sans-serif', fontSize: '1.4rem',
                color: 'var(--text-primary)', cursor: result ? 'default' : 'pointer',
                transition: 'all 0.15s',
              }}>
              {item.ch}
            </button>
          ))}
          {Array.from({ length: word.kannada.length - selected.length }).map((_, i) => (
            <div key={`empty-${i}`} style={{ width: '52px', height: '52px', borderRadius: '10px', border: '2px dashed rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.03)' }} />
          ))}
        </div>

        {/* Scrambled letters */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {scrambled.map(item => (
            <button key={`sc-${item.id}`} onClick={() => handleSelect(item)}
              style={{
                width: '52px', height: '52px', borderRadius: '10px',
                background: 'rgba(255,255,255,0.08)', border: '2px solid rgba(255,255,255,0.2)',
                fontFamily: 'Noto Sans Kannada, sans-serif', fontSize: '1.4rem',
                color: 'var(--text-primary)', cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,182,193,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            >
              {item.ch}
            </button>
          ))}
        </div>

        {/* Result */}
        {result && (
          <div style={{ padding: '0.75rem', borderRadius: '10px', marginBottom: '1rem',
            background: result === 'correct' ? 'rgba(67,233,123,0.12)' : 'rgba(245,87,108,0.12)',
            color: result === 'correct' ? '#43e97b' : '#f5576c', fontWeight: 700 }}>
            {result === 'correct' ? `✅ Correct! "${word.kannada}" = ${word.meaning}` :
             result === 'timeout' ? `⏱ Time's up! The word was: ${word.kannada}` : `❌ Not quite! The word was: ${word.kannada}`}
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {!result && !showHint && (
            <button className="glass-btn" onClick={() => setShowHint(true)}>💡 Show Hint</button>
          )}
          <button className="glass-btn" onClick={reset}>🔄 Reshuffle</button>
          <button className="btn-primary" onClick={next} style={{ padding: '0.75rem 2rem' }}>Next Word →</button>
        </div>
      </div>
    </div>
  );
};

export default ScrambledWords;
