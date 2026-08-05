import React, { useState } from 'react';
import { speakKannada } from '../utils/tts.js';
import { addXP, getCurrentUser, markExplored } from '../utils/storage.js';

const KANNADA_DIGITS = ['೦', '೧', '೨', '೩', '೪', '೫', '೬', '೭', '೮', '೯'];

const KANNADA_NUMBERS_DATA = [
  { num: 1, kanNum: '೧', kannada: 'ಒಂದು', transliteration: 'Ondu' },
  { num: 2, kanNum: '೨', kannada: 'ಎರಡು', transliteration: 'Eradu' },
  { num: 3, kanNum: '೩', kannada: 'ಮೂರು', transliteration: 'Mooru' },
  { num: 4, kanNum: '೪', kannada: 'ನಾಲ್ಕು', transliteration: 'Naalku' },
  { num: 5, kanNum: '೫', kannada: 'ಐದು', transliteration: 'Aidu' },
  { num: 6, kanNum: '೬', kannada: 'ಆರು', transliteration: 'Aaru' },
  { num: 7, kanNum: '೭', kannada: 'ಏಳು', transliteration: 'Eelu' },
  { num: 8, kanNum: '೮', kannada: 'ಎಂಟು', transliteration: 'Emtu' },
  { num: 9, kanNum: '೯', kannada: 'ಒಂಬತ್ತು', transliteration: 'Ombattu' },
  { num: 10, kanNum: '೧೦', kannada: 'ಹತ್ತು', transliteration: 'Hattu' },
  { num: 15, kanNum: '೧೫', kannada: 'ಹದಿನೈದು', transliteration: 'Hadinaaidu' },
  { num: 20, kanNum: '೨೦', kannada: 'ಇಪ್ಪತ್ತು', transliteration: 'Ippattu' },
  { num: 25, kanNum: '೨೫', kannada: 'ಇಪ್ಪತ್ತೈದು', transliteration: 'Ippattaidu' },
  { num: 30, kanNum: '೩೦', kannada: 'ಮೂವತ್ತು', transliteration: 'Moovattu' },
  { num: 40, kanNum: '೪೦', kannada: 'ನಾಲ್ವತ್ತು', transliteration: 'Naalvattu' },
  { num: 50, kanNum: '೫೦', kannada: 'ಐವತ್ತು', transliteration: 'Aivattu' },
  { num: 60, kanNum: '೬೦', kannada: 'ಅರಾವತ್ತು', transliteration: 'Araavattu' },
  { num: 70, kanNum: '೭೦', kannada: 'ಎಪ್ಪತ್ತು', transliteration: 'Eppattu' },
  { num: 80, kanNum: '೮೦', kannada: 'ಎಂಭತ್ತು', transliteration: 'Embhattu' },
  { num: 90, kanNum: '೯೦', kannada: 'ತೊಂಬತ್ತು', transliteration: 'Tombattu' },
  { num: 100, kanNum: '೧೦೦', kannada: 'ನೂರು', transliteration: 'Nooru' },
  { num: 500, kanNum: '೫೦೦', kannada: 'ಐನೂರು', transliteration: 'Ainooru' },
  { num: 1000, kanNum: '೧೦೦೦', kannada: 'ಸಾಲಿ (ಸಾtop/ಸಾfram / ಒಂದು ಸಾವಿರ)', transliteration: 'Ondu Saavira' },
];

const NumberStudio = ({ onXP }) => {
  const [activeNum, setActiveNum] = useState(KANNADA_NUMBERS_DATA[0]);
  const [customVal, setCustomVal] = useState(1);

  const handleSelect = (item) => {
    setActiveNum(item);
    speakKannada(item.kannada);
    const isNew = markExplored(`num_${item.num}`);
    if (isNew) {
      addXP(2);
      onXP && onXP(2);
    }
  };

  const getKannadaDigits = (n) => {
    return n.toString().split('').map(d => KANNADA_DIGITS[parseInt(d, 10)] || d).join('');
  };

  return (
    <div className="learning-screen">
      <div className="page-header">
        <h2>🔢 ಸಂಖ್ಯೆಗಳು — Kannada Numbers Studio</h2>
        <p>Master Kannada digits, counting & money expressions with audio!</p>
      </div>

      {/* Featured Number Card */}
      <div className="glass-card" style={{
        padding: '2rem',
        marginBottom: '2rem',
        background: 'linear-gradient(135deg, rgba(251,191,36,0.12), rgba(232,130,154,0.08))',
        border: '1px solid rgba(251,191,36,0.3)',
        display: 'flex',
        alignItems: 'center',
        gap: '2rem',
        flexWrap: 'wrap'
      }}>
        <div style={{
          fontSize: '4.5rem',
          fontWeight: 900,
          color: 'var(--gold)',
          fontFamily: 'Noto Sans Kannada, sans-serif',
          lineHeight: 1
        }}>
          {activeNum.kanNum}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Arabic Digit: {activeNum.num}</div>
          <div style={{ fontFamily: 'Noto Sans Kannada, sans-serif', fontSize: '2.2rem', fontWeight: 800, color: 'var(--sakura-pink)' }}>
            {activeNum.kannada}
          </div>
          <div style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
            Transliteration: {activeNum.transliteration}
          </div>
        </div>
        <button className="btn-primary" style={{ width: 'auto', padding: '0.8rem 2rem' }} onClick={() => speakKannada(activeNum.kannada)}>
          🔊 Listen Pronunciation
        </button>
      </div>

      {/* Interactive Number Picker Grid */}
      <h3 style={{ fontWeight: 700, marginBottom: '1rem', color: 'var(--text-secondary)' }}>Select a Number to Learn</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '0.75rem', marginBottom: '2rem' }}>
        {KANNADA_NUMBERS_DATA.map((item, i) => (
          <div
            key={i}
            className={`glass-card${activeNum.num === item.num ? ' active' : ''}`}
            onClick={() => handleSelect(item)}
            style={{
              padding: '0.85rem',
              textAlign: 'center',
              cursor: 'pointer',
              border: activeNum.num === item.num ? '2px solid var(--gold)' : undefined,
              background: activeNum.num === item.num ? 'rgba(255,215,0,0.12)' : undefined,
            }}
          >
            <div style={{ fontFamily: 'Noto Sans Kannada, sans-serif', fontSize: '1.8rem', fontWeight: 800, color: 'var(--sakura-pink)' }}>
              {item.kanNum}
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>{item.kannada}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{item.num}</div>
          </div>
        ))}
      </div>

      {/* Dynamic Digit Converter */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h4 style={{ fontWeight: 700, color: 'var(--gold)', marginBottom: '0.5rem' }}>💡 Dynamic Kannada Digit Converter</h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Type any number (e.g. 1 to 9999) to see it rendered in native Kannada numerals!
        </p>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="number"
            className="form-input"
            style={{ width: '140px', fontSize: '1.2rem', fontWeight: 700 }}
            value={customVal}
            onChange={e => setCustomVal(Math.max(0, parseInt(e.target.value || '0', 10)))}
          />
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--gold)', fontFamily: 'Noto Sans Kannada, sans-serif' }}>
            {getKannadaDigits(customVal)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NumberStudio;
