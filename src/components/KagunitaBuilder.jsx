import React, { useState } from 'react';
import { kagunitaRows, kagunitaVowelMarkers } from '../data/kagunitaData.js';
import { speakKannada } from '../utils/tts.js';
import { addXP, updateUser, getCurrentUser, markExplored } from '../utils/storage.js';

const KagunitaBuilder = ({ onXP }) => {
  const [highlighted, setHighlighted] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedCol, setSelectedCol] = useState(null);

  const handleCell = (rowIdx, colIdx, char) => {
    setHighlighted(`${rowIdx}-${colIdx}`);
    setSelectedRow(rowIdx);
    setSelectedCol(colIdx);
    speakKannada(char);

    const cellKey = `kagunita_${rowIdx}_${colIdx}`;
    const isNew = markExplored(cellKey);

    if (isNew) {
      addXP(1);
      onXP && onXP(1);
      const u = getCurrentUser();
      if (u) {
        updateUser({ progress: { ...(u.progress || {}), kagunita: Math.min(100, (u.progress?.kagunita || 0) + 2) } });
      }
    }
  };

  const selectedChar = selectedRow !== null && selectedCol !== null
    ? kagunitaRows[selectedRow]?.forms[selectedCol]
    : null;

  return (
    <div className="learning-screen">
      <div className="page-header">
        <h2>📊 ಕಾಗುಣಿತ — Kagunita Grid</h2>
        <p>Click any cell to hear the consonant + vowel combination!</p>
      </div>

      {selectedChar && (
        <div className="glass-card" style={{
          padding: '1.25rem 1.5rem', marginBottom: '1.5rem',
          background: 'linear-gradient(135deg, rgba(147,197,253,0.1), rgba(96,165,250,0.05))',
          border: '1px solid rgba(96,165,250,0.3)',
          display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap'
        }}>
          <span style={{ fontFamily: 'Noto Sans Kannada, sans-serif', fontSize: '4rem', fontWeight: 800, color: '#93c5fd', lineHeight: 1 }}>
            {selectedChar}
          </span>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {kagunitaRows[selectedRow]?.base} + {kagunitaVowelMarkers[selectedCol]?.label}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
              Click to hear pronunciation
            </div>
          </div>
          <button className="audio-btn" style={{ marginLeft: 'auto' }} onClick={() => speakKannada(selectedChar)}>
            🔊 Repeat
          </button>
        </div>
      )}

      <div className="kagunita-grid">
        <table className="kagunita-table">
          <thead>
            <tr>
              <th style={{ minWidth: '60px' }}>Cons.</th>
              {kagunitaVowelMarkers.map(v => (
                <th key={v.label}>{v.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {kagunitaRows.map((row, ri) => (
              <tr key={ri}>
                <td style={{
                  fontFamily: 'Noto Sans Kannada, sans-serif',
                  fontWeight: 700,
                  color: 'var(--sakura-pink)',
                  background: 'rgba(232,130,154,0.08)',
                  cursor: 'default',
                  fontSize: '1rem'
                }}>
                  {row.base}
                </td>
                {row.forms.map((char, ci) => (
                  <td
                    key={ci}
                    onClick={() => handleCell(ri, ci, char)}
                    style={{
                      cursor: 'pointer',
                      background: highlighted === `${ri}-${ci}` ? 'rgba(147,197,253,0.18)' : undefined,
                      color: highlighted === `${ri}-${ci}` ? '#93c5fd' : undefined,
                      fontWeight: highlighted === `${ri}-${ci}` ? 700 : undefined,
                    }}
                  >
                    {char}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.82rem', textAlign: 'center' }}>
        {kagunitaRows.length} consonants × {kagunitaVowelMarkers.length} vowel forms = {kagunitaRows.length * kagunitaVowelMarkers.length} combinations 🌸
      </p>
    </div>
  );
};

export default KagunitaBuilder;
