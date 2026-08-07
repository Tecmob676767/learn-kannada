import React, { useState, useEffect } from 'react';
import { addXP, getCurrentUser, updateUser } from '../utils/storage.js';

// 5x5 crossword grid (0 = black cell)
const CROSSWORD = {
  grid: [
    ['ನ','ಮ','ಸ','್','ಕ'],
    ['0','ನ','0','0','ಾ'],
    ['ನ','ೀ','ರ','ು','ಡ'],
    ['0','0','0','0','ು'],
    ['ಹ','ಾ','ಲ','ು','0'],
  ],
  clues: {
    across: [
      { number: 1, row: 0, col: 0, answer: 'ನಮಸ್ಕ', hint: 'A Kannada greeting (ನಮ___ಾರ)', display: 'ನ-ಮ-ಸ-್-ಕ' },
      { number: 3, row: 2, col: 0, answer: 'ನೀರು', hint: 'Liquid you drink', display: 'ನ-ೀ-ರ-ು' },
      { number: 4, row: 4, col: 0, answer: 'ಹಾಲು', hint: 'White drink from cows', display: 'ಹ-ಾ-ಲ-ು' },
    ],
    down: [
      { number: 2, row: 0, col: 1, answer: 'ಮನ', hint: 'Mind / Heart (ಮ___)', display: 'ಮ-ನ' },
      { number: 5, row: 0, col: 4, answer: 'ಕಾಡು', hint: 'Forest', display: 'ಕ-ಾ-ಡ-ು' },
    ],
  },
};

const KannadaCrossword = ({ onXP, onToast }) => {
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState(false);
  const [solved, setSolved] = useState(false);

  const handleInput = (clueId, val) => {
    setAnswers(a => ({ ...a, [clueId]: val }));
    setChecked(false);
  };

  const checkAnswers = () => {
    setChecked(true);
    const allClues = [...CROSSWORD.clues.across, ...CROSSWORD.clues.down];
    const allCorrect = allClues.every(c => {
      const userAns = (answers[c.number] || '').replace(/\s/g, '');
      return userAns === c.answer;
    });
    if (allCorrect) {
      setSolved(true);
      addXP(50); onXP && onXP(50);
      onToast && onToast('🧩 Crossword solved! +50 XP', 'xp');
    }
  };

  const reset = () => { setAnswers({}); setChecked(false); setSolved(false); };

  const isCorrect = (clue) => {
    const userAns = (answers[clue.number] || '').replace(/\s/g, '');
    return userAns === clue.answer;
  };

  return (
    <div className="learning-screen">
      <div className="page-header">
        <h2>🧩 Kannada Crossword Puzzle</h2>
        <p>Fill in the Kannada words using the English clues!</p>
      </div>

      {solved && (
        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', marginBottom: '1.5rem', border: '2px solid #43e97b' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎉</div>
          <h3 style={{ fontWeight: 800, color: '#43e97b' }}>Crossword Solved! +50 XP</h3>
          <button className="btn-primary" onClick={reset} style={{ width: 'auto', marginTop: '1rem', padding: '0.75rem 2rem' }}>🔄 Play Again</button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Visual grid */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h4 style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Grid Preview</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '3px' }}>
            {CROSSWORD.grid.flat().map((cell, i) => (
              <div key={i} style={{
                aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: cell === '0' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.08)',
                borderRadius: '4px', fontSize: 'clamp(0.7rem, 1.5vw, 0.95rem)',
                fontFamily: 'Noto Sans Kannada, sans-serif', color: 'var(--sakura-pink)', fontWeight: 600,
              }}>
                {cell !== '0' ? cell : ''}
              </div>
            ))}
          </div>
          <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            💡 Fill answers in the right panel
          </div>
        </div>

        {/* Clues + inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Across */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <h4 style={{ marginBottom: '0.75rem', color: 'var(--text-muted)', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '1px' }}>→ Across</h4>
            {CROSSWORD.clues.across.map(clue => (
              <div key={clue.number} style={{ marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                  <strong style={{ color: 'var(--gold)' }}>{clue.number}.</strong> {clue.hint} <em style={{ color: 'var(--text-muted)' }}>({clue.display})</em>
                </label>
                <input
                  value={answers[clue.number] || ''}
                  onChange={e => handleInput(clue.number, e.target.value)}
                  placeholder="Type Kannada…"
                  style={{
                    width: '100%', padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.06)',
                    border: `2px solid ${checked ? (isCorrect(clue) ? '#43e97b' : '#f5576c') : 'rgba(255,255,255,0.15)'}`,
                    borderRadius: '8px', color: 'var(--text-primary)', fontFamily: 'Noto Sans Kannada, sans-serif',
                    fontSize: '1rem', outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>
            ))}
          </div>

          {/* Down */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <h4 style={{ marginBottom: '0.75rem', color: 'var(--text-muted)', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '1px' }}>↓ Down</h4>
            {CROSSWORD.clues.down.map(clue => (
              <div key={clue.number} style={{ marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                  <strong style={{ color: 'var(--gold)' }}>{clue.number}.</strong> {clue.hint} <em style={{ color: 'var(--text-muted)' }}>({clue.display})</em>
                </label>
                <input
                  value={answers[clue.number] || ''}
                  onChange={e => handleInput(clue.number, e.target.value)}
                  placeholder="Type Kannada…"
                  style={{
                    width: '100%', padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.06)',
                    border: `2px solid ${checked ? (isCorrect(clue) ? '#43e97b' : '#f5576c') : 'rgba(255,255,255,0.15)'}`,
                    borderRadius: '8px', color: 'var(--text-primary)', fontFamily: 'Noto Sans Kannada, sans-serif',
                    fontSize: '1rem', outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="glass-btn" onClick={reset} style={{ flex: 1 }}>🔄 Reset</button>
            <button className="btn-primary" onClick={checkAnswers} style={{ flex: 2 }}>✅ Check Answers</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KannadaCrossword;
