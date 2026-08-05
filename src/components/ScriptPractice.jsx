import React, { useState } from 'react';
import { speakKannada } from '../utils/tts.js';
import { addXP } from '../utils/storage.js';

const KEYBOARD_SWARAS = ['ಅ','ಆ','ಇ','ಈ','ಉ','ಊ','ಋ','ಎ','ಏ','ಐ','ಒ','ಓ','ಔ','ಅಂ','ಅಃ'];
const KEYBOARD_VYANJANAS = [
  'ಕ','ಖ','ಗ','ಘ','ಙ',
  'ಚ','ಛ','ಜ','ಝ','ಞ',
  'ಟ','ಠ','ಡ','ಢ','ಣ',
  'ತ','ಥ','ದ','ಧ','ನ',
  'ಪ','ಫ','ಬ','ಭ','ಮ',
  'ಯ','ರ','ಲ','ವ','ಶ','ಷ','ಸ','ಹ','ಳ'
];
const KEYBOARD_MATRAS = ['ಾ','ಿ','ೀ','ು','ೂ','ೃ','ೆ','ೇ','ೈ','ೊ','ೋ','ೌ','ಂ','ಃ','್'];

const PRACTICE_WORDS = [
  { word: 'ನಮಸ್ಕಾರ', hint: 'Hello / Greetings' },
  { word: 'ಕನ್ನಡ', hint: 'Kannada Language' },
  { word: 'ಬೆಂಗಳೂರು', hint: 'Bengaluru City' },
  { word: 'ಸೊಬಗು', hint: 'Elegance / Grace' },
  { word: 'ಧನ್ಯವಾದ', hint: 'Thank You' },
];

const ScriptPractice = ({ onXP }) => {
  const [typedText, setTypedText] = useState('');
  const [targetIdx, setTargetIdx] = useState(0);

  const targetWord = PRACTICE_WORDS[targetIdx];

  const handleKeyPress = (char) => {
    const nextText = typedText + char;
    setTypedText(nextText);
    speakKannada(char);

    // Check target match
    if (nextText === targetWord.word) {
      addXP(15);
      onXP && onXP(15);
      speakKannada(nextText);
    }
  };

  const handleBackspace = () => {
    setTypedText(t => t.slice(0, -1));
  };

  const handleClear = () => {
    setTypedText('');
  };

  return (
    <div className="learning-screen">
      <div className="page-header">
        <h2>⌨️ ಲಿಪಿ ಅಭ್ಯಾಸ — Interactive Script & Keyboard Trainer</h2>
        <p>Compose words using the built-in Kannada virtual keyboard and practice typing!</p>
      </div>

      {/* Target Word Practice Banner */}
      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem', background: 'rgba(232,130,154,0.08)', border: '1px solid rgba(232,130,154,0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--gold)', fontWeight: 700 }}>🎯 TARGET WORD #{targetIdx + 1}</span>
          <button
            onClick={() => { setTargetIdx((targetIdx + 1) % PRACTICE_WORDS.length); setTypedText(''); }}
            style={{ background: 'none', border: 'none', color: 'var(--sakura-pink)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
          >
            Next Target →
          </button>
        </div>
        <div style={{ fontFamily: 'Noto Sans Kannada, sans-serif', fontSize: '2.5rem', fontWeight: 800, color: 'var(--sakura-pink)' }}>
          {targetWord.word}
        </div>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Meaning: {targetWord.hint}
        </div>

        {typedText === targetWord.word && (
          <div style={{ marginTop: '0.75rem', padding: '0.5rem 1rem', background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 'var(--radius-sm)', color: 'var(--green-success)', fontWeight: 700 }}>
            🎉 Perfect match! +15 XP earned!
          </div>
        )}
      </div>

      {/* Text Output Box */}
      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem', minHeight: '90px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: 'Noto Sans Kannada, sans-serif', fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', wordBreak: 'break-all' }}>
          {typedText || <span style={{ color: 'var(--text-muted)', fontSize: '1.2rem', fontFamily: 'Outfit, sans-serif' }}>Tap keys below to start typing...</span>}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="audio-btn" onClick={() => speakKannada(typedText)} disabled={!typedText}>
            🔊 Speak
          </button>
          <button onClick={handleBackspace} style={{ padding: '0.4rem 0.8rem', background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 'var(--radius-sm)', color: 'var(--red-error)', cursor: 'pointer', fontWeight: 600 }}>
            ⌫ Erase
          </button>
          <button onClick={handleClear} style={{ padding: '0.4rem 0.8rem', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', cursor: 'pointer' }}>
            Clear
          </button>
        </div>
      </div>

      {/* Virtual Keyboard */}
      <div className="glass-card" style={{ padding: '1.25rem' }}>
        <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--gold)', marginBottom: '0.75rem' }}>
          Swaragalu (Vowels)
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
          {KEYBOARD_SWARAS.map(k => (
            <button
              key={k}
              onClick={() => handleKeyPress(k)}
              style={{
                fontFamily: 'Noto Sans Kannada, sans-serif',
                fontSize: '1.3rem',
                fontWeight: 700,
                width: '42px',
                height: '42px',
                borderRadius: '8px',
                border: '1px solid var(--glass-border)',
                background: 'rgba(255,183,197,0.1)',
                color: 'var(--sakura-pink)',
                cursor: 'pointer',
                transition: 'var(--transition)'
              }}
            >
              {k}
            </button>
          ))}
        </div>

        <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#93c5fd', marginBottom: '0.75rem' }}>
          Vowel Markers / Matras (ಮಾತ್ರೆಗಳು)
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
          {KEYBOARD_MATRAS.map(m => (
            <button
              key={m}
              onClick={() => handleKeyPress(m)}
              style={{
                fontFamily: 'Noto Sans Kannada, sans-serif',
                fontSize: '1.3rem',
                fontWeight: 700,
                width: '42px',
                height: '42px',
                borderRadius: '8px',
                border: '1px solid rgba(147,197,253,0.3)',
                background: 'rgba(147,197,253,0.12)',
                color: '#93c5fd',
                cursor: 'pointer',
                transition: 'var(--transition)'
              }}
            >
              {m}
            </button>
          ))}
        </div>

        <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--green-success)', marginBottom: '0.75rem' }}>
          Vyanjanagalu (Consonants)
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {KEYBOARD_VYANJANAS.map(v => (
            <button
              key={v}
              onClick={() => handleKeyPress(v)}
              style={{
                fontFamily: 'Noto Sans Kannada, sans-serif',
                fontSize: '1.3rem',
                fontWeight: 700,
                width: '42px',
                height: '42px',
                borderRadius: '8px',
                border: '1px solid rgba(74,222,128,0.25)',
                background: 'rgba(74,222,128,0.08)',
                color: 'var(--green-success)',
                cursor: 'pointer',
                transition: 'var(--transition)'
              }}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScriptPractice;
