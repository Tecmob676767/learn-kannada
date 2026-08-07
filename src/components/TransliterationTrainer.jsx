import React, { useState } from 'react';
import { addXP } from '../utils/storage.js';
import { speakKannada } from '../utils/tts.js';

// Transliteration → Kannada mapping
const TRANSLIT_WORDS = [
  { kannada: 'ನಮಸ್ಕಾರ', translit: 'namaskara', hint: 'A greeting' },
  { kannada: 'ಧನ್ಯವಾದ', translit: 'dhanyavada', hint: 'Thank you' },
  { kannada: 'ನೀರು', translit: 'niru', hint: 'Water' },
  { kannada: 'ಮನೆ', translit: 'mane', hint: 'House' },
  { kannada: 'ಕನ್ನಡ', translit: 'kannada', hint: 'Our language' },
  { kannada: 'ಹಾಲು', translit: 'halu', hint: 'Milk' },
  { kannada: 'ಕಾಡು', translit: 'kadu', hint: 'Forest' },
  { kannada: 'ಸೂರ್ಯ', translit: 'surya', hint: 'Sun' },
  { kannada: 'ಚಂದ್ರ', translit: 'chandra', hint: 'Moon' },
  { kannada: 'ಪ್ರೀತಿ', translit: 'priti', hint: 'Love' },
  { kannada: 'ಭಾಷೆ', translit: 'bhashe', hint: 'Language' },
  { kannada: 'ಶಾಲೆ', translit: 'shale', hint: 'School' },
  { kannada: 'ಊಟ', translit: 'oota', hint: 'Meal/food' },
  { kannada: 'ಗಾಳಿ', translit: 'gali', hint: 'Wind' },
  { kannada: 'ಮಳೆ', translit: 'male', hint: 'Rain' },
  { kannada: 'ನದಿ', translit: 'nadi', hint: 'River' },
  { kannada: 'ಬೆಟ್ಟ', translit: 'betta', hint: 'Hill' },
  { kannada: 'ಮರ', translit: 'mara', hint: 'Tree' },
  { kannada: 'ಅಮ್ಮ', translit: 'amma', hint: 'Mother' },
  { kannada: 'ಅಪ್ಪ', translit: 'appa', hint: 'Father' },
];

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

const TransliterationTrainer = ({ onXP, onToast }) => {
  const [mode, setMode] = useState('translit-to-select'); // 'translit-to-select' | 'kannada-to-type'
  const [words, setWords] = useState(() => shuffle(TRANSLIT_WORDS));
  const [idx, setIdx] = useState(0);
  const [options, setOptions] = useState(() => makeOptions(TRANSLIT_WORDS, 0));
  const [selected, setSelected] = useState(null);
  const [typed, setTyped] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [showHint, setShowHint] = useState(false);

  function makeOptions(pool, currentIdx) {
    const correct = pool[currentIdx];
    const others = shuffle(pool.filter((_, i) => i !== currentIdx)).slice(0, 3);
    return shuffle([correct, ...others]);
  }

  const word = words[idx];

  const handleSelect = (opt) => {
    if (revealed) return;
    setSelected(opt);
    setRevealed(true);
    if (opt.kannada === word.kannada) {
      addXP(10); onXP && onXP(10);
      setScore(s => ({ ...s, correct: s.correct + 1 }));
      onToast && onToast('✅ Correct! +10 XP', 'xp');
      speakKannada(word.kannada);
    } else {
      setScore(s => ({ ...s, wrong: s.wrong + 1 }));
    }
  };

  const handleType = () => {
    setRevealed(true);
    const clean = (s) => s.toLowerCase().replace(/[^a-z]/g, '');
    const correct = clean(typed) === clean(word.translit) || typed.trim() === word.kannada;
    if (correct) {
      addXP(15); onXP && onXP(15);
      setScore(s => ({ ...s, correct: s.correct + 1 }));
      onToast && onToast('✅ Correct! +15 XP', 'xp');
      speakKannada(word.kannada);
    } else {
      setScore(s => ({ ...s, wrong: s.wrong + 1 }));
    }
  };

  const next = () => {
    const newIdx = (idx + 1) % words.length;
    setIdx(newIdx);
    setOptions(makeOptions(words, newIdx));
    setSelected(null);
    setRevealed(false);
    setTyped('');
    setShowHint(false);
  };

  const resetGame = () => {
    const shuffled = shuffle(TRANSLIT_WORDS);
    setWords(shuffled);
    setIdx(0);
    setOptions(makeOptions(shuffled, 0));
    setSelected(null);
    setRevealed(false);
    setTyped('');
    setShowHint(false);
    setScore({ correct: 0, wrong: 0 });
  };

  return (
    <div className="learning-screen">
      <div className="page-header">
        <h2>🔤 Transliteration Trainer</h2>
        <p>Match Roman transliterations to Kannada script or type the transliteration!</p>
      </div>

      {/* Mode & score */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={() => { setMode('translit-to-select'); resetGame(); }}
          className={`section-tab${mode === 'translit-to-select' ? ' active' : ''}`}>
          📋 Pick the Kannada Script
        </button>
        <button onClick={() => { setMode('kannada-to-type'); resetGame(); }}
          className={`section-tab${mode === 'kannada-to-type' ? ' active' : ''}`}>
          ✍️ Type the Transliteration
        </button>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '1rem' }}>
          <span style={{ color: '#43e97b', fontWeight: 700 }}>✅ {score.correct}</span>
          <span style={{ color: '#f5576c', fontWeight: 700 }}>❌ {score.wrong}</span>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '2rem' }}>
        {/* Question */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          {mode === 'translit-to-select' ? (
            <>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Which Kannada script matches this transliteration?</div>
              <div style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)', fontWeight: 800, color: 'var(--sakura-pink)', letterSpacing: '2px' }}>{word.translit}</div>
            </>
          ) : (
            <>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Type the Roman transliteration of this Kannada word</div>
              <div style={{ fontFamily: 'Noto Sans Kannada, sans-serif', fontSize: 'clamp(2rem, 6vw, 3.5rem)', fontWeight: 800, color: 'var(--sakura-pink)' }}>{word.kannada}</div>
            </>
          )}
          {showHint && (
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '0.5rem' }}>
              💡 Hint: {word.hint}
            </div>
          )}
          <button className="audio-btn" style={{ marginTop: '0.75rem' }} onClick={() => speakKannada(word.kannada)}>
            🔊 Listen
          </button>
        </div>

        {/* Mode-specific answer area */}
        {mode === 'translit-to-select' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {options.map((opt, i) => {
              let bg = 'rgba(255,255,255,0.06)';
              let border = 'rgba(255,255,255,0.12)';
              if (revealed) {
                if (opt.kannada === word.kannada) { bg = 'rgba(67,233,123,0.15)'; border = '#43e97b'; }
                else if (opt.kannada === selected?.kannada) { bg = 'rgba(245,87,108,0.15)'; border = '#f5576c'; }
              }
              return (
                <button key={i} onClick={() => handleSelect(opt)} disabled={revealed}
                  style={{ padding: '1rem', background: bg, border: `2px solid ${border}`, borderRadius: '12px', fontFamily: 'Noto Sans Kannada, sans-serif', fontSize: '1.3rem', color: 'var(--text-primary)', cursor: revealed ? 'default' : 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => !revealed && (e.currentTarget.style.background = 'rgba(255,182,193,0.15)')}
                  onMouseLeave={e => !revealed && (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                >
                  {opt.kannada}
                </button>
              );
            })}
          </div>
        ) : (
          <div style={{ marginBottom: '1.5rem' }}>
            <input
              value={typed}
              onChange={e => setTyped(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !revealed && handleType()}
              disabled={revealed}
              placeholder="Type transliteration here (e.g. namaskara)…"
              style={{
                width: '100%', padding: '0.9rem 1rem', background: 'rgba(255,255,255,0.06)',
                border: `2px solid ${revealed ? (typed.toLowerCase().replace(/[^a-z]/g,'') === word.translit.replace(/[^a-z]/g,'') ? '#43e97b' : '#f5576c') : 'rgba(255,255,255,0.2)'}`,
                borderRadius: '12px', color: 'var(--text-primary)', fontSize: '1.1rem',
                outline: 'none', boxSizing: 'border-box',
              }}
            />
            {!revealed && (
              <button className="btn-primary" onClick={handleType} style={{ width: '100%', marginTop: '0.75rem' }}>
                ✅ Check
              </button>
            )}
            {revealed && (
              <div style={{ marginTop: '0.75rem', padding: '0.75rem', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', fontSize: '0.9rem' }}>
                Correct: <strong style={{ color: '#43e97b' }}>{word.translit}</strong>
                <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>→</span>
                <strong style={{ fontFamily: 'Noto Sans Kannada', color: 'var(--sakura-pink)', marginLeft: '0.5rem' }}>{word.kannada}</strong>
              </div>
            )}
          </div>
        )}

        {/* Controls */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {!showHint && !revealed && (
            <button className="glass-btn" onClick={() => setShowHint(true)}>💡 Hint</button>
          )}
          <button className="btn-primary" onClick={next} style={{ flex: 1 }}>
            {revealed ? 'Next Word →' : 'Skip'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransliterationTrainer;
