import React, { useState } from 'react';

const TARGET_WORD = ['ಕ', 'ನ್ನ', 'ಡ']; // Example 3-akshara word for accessible fun

const SAMPLE_LETTERS = [
  'ಕ', 'ರ', 'ನ', 'ಲ', 'ಮ', 'ಪ', 'ಸ', 'ತ', 'ಬ', 'ದ', 'ನ್ನ', 'ಡ', 'ಹ', 'ಗ', 'ಜ', 'ವ'
];

export default function KannadaWordle({ onXP, onToast }) {
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState([]);
  const [gameStatus, setGameStatus] = useState('playing'); // 'playing', 'won', 'lost'

  function addLetter(letter) {
    if (currentGuess.length < 3 && gameStatus === 'playing') {
      setCurrentGuess(g => [...g, letter]);
    }
  }

  function backspace() {
    setCurrentGuess(g => g.slice(0, -1));
  }

  function submitGuess() {
    if (currentGuess.length !== 3) {
      onToast && onToast('ದಯವಿಟ್ಟು ೩ ಅಕ್ಷರಗಳನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ (Pick 3 letters)!', 'warning');
      return;
    }

    const newGuesses = [...guesses, currentGuess];
    setGuesses(newGuesses);
    setCurrentGuess([]);

    const isMatch = currentGuess.every((l, idx) => l === TARGET_WORD[idx]);
    if (isMatch) {
      setGameStatus('won');
      onXP && onXP(50);
      onToast && onToast('🎉 ಪದ-ಜಾಲ ವಿಜೇತರು! Wordle Master! +50 XP', 'xp');
    } else if (newGuesses.length >= 5) {
      setGameStatus('lost');
    }
  }

  function restart() {
    setGuesses([]);
    setCurrentGuess([]);
    setGameStatus('playing');
  }

  return (
    <div className="learning-screen">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
        <h1 className="page-title">🟩 ಪದ-ಜಾಲ · Kannada Wordle</h1>
        <span style={{ color: '#4ade80', fontWeight: 800 }}>Daily Puzzle</span>
      </div>

      <div className="glass-card" style={{ maxWidth: 440, margin: '0 auto', padding: '1.8rem', textAlign: 'center' }}>
        {/* Word Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.5rem', alignItems: 'center' }}>
          {Array.from({ length: 5 }).map((_, rowIdx) => {
            const guess = guesses[rowIdx] || (rowIdx === guesses.length ? currentGuess : []);
            return (
              <div key={rowIdx} style={{ display: 'flex', gap: '8px' }}>
                {Array.from({ length: 3 }).map((_, colIdx) => {
                  const char = guess[colIdx] || '';
                  let bgColor = 'rgba(255,255,255,0.06)';
                  let borderColor = 'rgba(255,255,255,0.2)';

                  if (rowIdx < guesses.length) {
                    if (char === TARGET_WORD[colIdx]) {
                      bgColor = '#22c55e'; // Green
                      borderColor = '#22c55e';
                    } else if (TARGET_WORD.includes(char)) {
                      bgColor = '#eab308'; // Yellow
                      borderColor = '#eab308';
                    } else {
                      bgColor = '#374151'; // Gray
                      borderColor = '#374151';
                    }
                  }

                  return (
                    <div
                      key={colIdx}
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.8rem',
                        fontWeight: 900,
                        fontFamily: 'Noto Sans Kannada, sans-serif',
                        background: bgColor,
                        border: `2px solid ${borderColor}`,
                        color: '#ffffff'
                      }}
                    >
                      {char}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Action / Keyboard Controls */}
        {gameStatus === 'playing' ? (
          <div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center', marginBottom: '1.2rem' }}>
              {SAMPLE_LETTERS.map((l, i) => (
                <button
                  key={i}
                  onClick={() => addLetter(l)}
                  style={{
                    padding: '0.6rem 0.9rem',
                    fontSize: '1.1rem',
                    fontFamily: 'Noto Sans Kannada, sans-serif',
                    fontWeight: 800,
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: 'rgba(255,255,255,0.08)',
                    color: 'inherit',
                    cursor: 'pointer'
                  }}
                >
                  {l}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center' }}>
              <button onClick={backspace} style={{ padding: '0.7rem 1.2rem', borderRadius: '8px', background: '#ef4444', border: 'none', color: 'white', fontWeight: 800, cursor: 'pointer' }}>
                ⌫ Delete
              </button>
              <button className="btn-primary" onClick={submitGuess} style={{ padding: '0.7rem 1.8rem' }}>
                Submit ↵
              </button>
            </div>
          </div>
        ) : (
          <div style={{ marginTop: '1rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.4rem' }}>
              {gameStatus === 'won' ? '🎉🏆' : '💡'}
            </div>
            <h2>{gameStatus === 'won' ? 'ಅದ್ಭುತ ಜಯ!' : 'ಉತ್ತರ: ಕನ್ನಡ (Kannada)'}</h2>
            <button className="btn-primary" onClick={restart} style={{ marginTop: '1rem', padding: '0.7rem 2rem' }}>
              Play Again 🔄
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
