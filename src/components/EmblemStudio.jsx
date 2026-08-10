import React, { useState } from 'react';
import { addXP } from '../utils/storage.js';
import { speakKannada } from '../utils/tts.js';

const STATE_SYMBOLS = [
  {
    id: 'flag',
    name: 'Karnataka Flag (ಕನ್ನಡ ಧ್ವಜ)',
    icon: '🚩',
    kannada: 'ಕನ್ನಡ ಧ್ವಜ',
    meaning: 'Kannada Flag',
    translit: 'kannaḍa dhvaja',
    desc: 'The Karnataka Flag (or Kannada Flag) is a bi-colored flag divided horizontally into Yellow (top) and Red (bottom). The yellow represents gold and peace, while the red represents courage and revolution.',
    colors: ['#ffd700', '#e50914'],
  },
  {
    id: 'emblem',
    name: 'State Emblem (ರಾಜ್ಯ ಲಾಂಛನ)',
    icon: '🛡️',
    kannada: 'ರಾಜ್ಯ ಲಾಂಛನ',
    meaning: 'State Emblem',
    translit: 'rājya lāñchana',
    desc: 'The emblem features a red shield surrounded by two mythological creatures called "Ganda-Bherunda" (two-headed bird) and supported by two lions. The Lion Capital of Ashoka stands on top.',
  },
  {
    id: 'anthem',
    name: 'State Anthem (ನಾಡ ಗೀತೆ)',
    icon: '🎵',
    kannada: 'ಜಯ ಭಾರತ ಜನನಿಯ ತನುಜಾತೆ',
    meaning: 'Jaya Bharata Jananiya Tanujate',
    translit: 'jaya bhārata jananiya tanujāte',
    desc: 'Written by the famous national poet Kuvempu, the song pays tribute to Mother Karnataka and describes her rich natural beauty, history, and integration with India.',
  },
  {
    id: 'animal',
    name: 'State Animal (ರಾಜ್ಯ ಪ್ರಾಣಿ)',
    icon: '🐘',
    kannada: 'ಆನೆ',
    meaning: 'Asian Elephant',
    translit: 'āne',
    desc: 'Karnataka is home to the largest population of wild Asian elephants in India. They represent majestic strength, intelligence, and grace.',
  },
  {
    id: 'bird',
    name: 'State Bird (ರಾಜ್ಯ ಪಕ್ಷಿ)',
    icon: '🪶',
    kannada: 'ನೀಲಕಂಠ',
    meaning: 'Indian Roller',
    translit: 'nīlakaṇṭha',
    desc: 'Known locally as Neelakantha (blue-throated), the Indian Roller is celebrated for its striking blue wings and is considered a symbol of good fortune during Hindu festivals.',
  },
  {
    id: 'flower',
    name: 'State Flower (ರಾಜ್ಯ ಪುಷ್ಪ)',
    icon: '🪷',
    kannada: 'ಕಮಲ',
    meaning: 'Lotus',
    translit: 'kamala',
    desc: 'The sacred Lotus represents purity, spiritual growth, and prosperity. It is widely depicted in Karnataka\'s ancient architecture, sculptures, and poetry.',
  },
];

const EmblemStudio = ({ onXP, onToast }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [visited, setVisited] = useState(new Set());

  const current = STATE_SYMBOLS[activeIdx];

  const handleVisit = (index) => {
    setActiveIdx(index);
    if (!visited.has(STATE_SYMBOLS[index].id)) {
      const newVisited = new Set([...visited, STATE_SYMBOLS[index].id]);
      setVisited(newVisited);
      addXP(10);
      onXP && onXP(10);
      if (newVisited.size === STATE_SYMBOLS.length) {
        onToast && onToast('🏆 State Symbols Mastered! +30 XP Bonus', 'success');
        addXP(30);
        onXP && onXP(30);
      } else {
        onToast && onToast('✨ Symbol explored! +10 XP', 'xp');
      }
    }
  };

  return (
    <div className="learning-screen">
      <div className="page-header">
        <h2>🚩 Flag & State Symbols Studio</h2>
        <p>Learn about Karnataka's flag, cultural emblems, and national state symbols!</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Sidebar Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {STATE_SYMBOLS.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => handleVisit(idx)}
              className={`glass-card`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem',
                border: activeIdx === idx ? '2px solid var(--sakura-pink)' : '1px solid var(--glass-border)',
                background: activeIdx === idx ? 'rgba(255,163,102,0.15)' : 'var(--glass-bg)',
                cursor: 'pointer',
                textAlign: 'left',
                color: '#fff',
                borderRadius: '12px',
                transition: 'all 0.2s',
              }}
            >
              <span style={{ fontSize: '1.75rem' }}>{s.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{s.name}</div>
                {visited.has(s.id) && <span style={{ fontSize: '0.72rem', color: 'var(--green-success)' }}>✓ Learned</span>}
              </div>
            </button>
          ))}
        </div>

        {/* Display Card */}
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          {/* Header Banner */}
          {current.id === 'flag' ? (
            <div style={{ height: '140px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ flex: 1, background: '#ffd700' }} />
              <div style={{ flex: 1, background: '#e50914' }} />
            </div>
          ) : (
            <div style={{ height: '140px', background: 'linear-gradient(135deg, var(--indigo-mid), var(--indigo-deep))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '4.5rem', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}>{current.icon}</span>
            </div>
          )}

          <div style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{current.name}</span>
              <button
                className="audio-btn"
                onClick={() => speakKannada(current.kannada)}
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
              >
                🔊 Pronounce
              </button>
            </h3>

            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ fontFamily: 'Noto Sans Kannada', fontSize: '1.3rem', color: 'var(--sakura-pink)', marginBottom: '0.25rem' }}>
                {current.kannada}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                {current.translit} • {current.meaning}
              </div>
            </div>

            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              {current.desc}
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <span>XP earned: {visited.has(current.id) ? '10 XP' : '0 XP'}</span>
              <span>Overall progress: {visited.size}/{STATE_SYMBOLS.length} symbols</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmblemStudio;
