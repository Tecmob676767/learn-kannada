import React, { useState, useEffect } from 'react';

const NUMBERS = {
  1: { k: 'ಒಂದು', t: 'Ondu' },
  2: { k: 'ಎರಡು', t: 'Eradu' },
  3: { k: 'ಮೂರು', t: 'Mooru' },
  4: { k: 'ನಾಲ್ಕು', t: 'Naalku' },
  5: { k: 'ಐದು', t: 'Aidu' },
  6: { k: 'ಆರು', t: 'Aaru' },
  7: { k: 'ಏಳು', t: 'Eelu' },
  8: { k: 'ಎಂಟು', t: 'Entu' },
  9: { k: 'ಒಂಬತ್ತು', t: 'Ombattu' },
  10: { k: 'ಹತ್ತು', t: 'Hattu' },
  11: { k: 'ಹನ್ನೊಂದು', t: 'Hannondu' },
  12: { k: 'ಹನ್ನೆರಡು', t: 'Hanneradu' },
  15: { k: 'ಹದಿನೈದು', t: 'Hadinaidu' },
  20: { k: 'ಇಪ್ಪತ್ತು', t: 'Ippattu' },
  25: { k: 'ಇಪ್ಪತ್ತೈದು', t: 'Ippattaidu' },
  30: { k: 'ಮೂವತ್ತು', t: 'Moovattu' },
  40: { k: 'ನಲವತ್ತು', t: 'Nalavattu' },
  50: { k: 'ಐವತ್ತು', t: 'Aivattu' },
  60: { k: 'ಅರವತ್ತು', t: 'Aravattu' },
  70: { k: 'ಎಪ್ಪತ್ತು', t: 'Eppattu' },
  80: { k: 'ಎಂಭತ್ತು', t: 'Embhattu' },
  90: { k: 'ತೊಂಬತ್ತು', t: 'Tombattu' },
  100: { k: 'ನೂರು', t: 'Nooru' }
};

const MODES = {
  'basic': Object.keys(NUMBERS).filter(n => parseInt(n) <= 10).map(Number),
  'intermediate': Object.keys(NUMBERS).filter(n => parseInt(n) <= 50).map(Number),
  'advanced': Object.keys(NUMBERS).map(Number)
};

const KannadaNumberGame = ({ onXP, onToast }) => {
  const [mode, setMode] = useState(null);
  const [qCount, setQCount] = useState(0);
  const [score, setScore] = useState(0);
  const [currentQ, setCurrentQ] = useState(null);
  const [opts, setOpts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showRes, setShowRes] = useState(false);
  
  const generateQuestion = (selectedMode) => {
    const pool = MODES[selectedMode];
    const target = pool[Math.floor(Math.random() * pool.length)];
    
    // 50% chance to show digit and ask for word, or vice versa
    const type = Math.random() > 0.5 ? 'digit2word' : 'word2digit';
    
    const wOpts = new Set();
    wOpts.add(target);
    while(wOpts.size < 4) {
      wOpts.add(pool[Math.floor(Math.random() * pool.length)]);
    }
    
    const optsArr = Array.from(wOpts).sort(() => Math.random() - 0.5);
    
    setCurrentQ({ target, type });
    setOpts(optsArr);
  };

  const startGame = (m) => {
    setMode(m);
    setScore(0);
    setQCount(0);
    generateQuestion(m);
  };

  const handlePick = (val) => {
    if (showRes) return;
    setSelected(val);
    setShowRes(true);
    
    if (val === currentQ.target) {
      setScore(s => s + 1);
      if (onXP) onXP(5);
    }
    
    setTimeout(() => {
      setShowRes(false);
      setSelected(null);
      if (qCount + 1 < 10) {
        setQCount(c => c + 1);
        generateQuestion(mode);
      } else {
        setMode('done');
      }
    }, 1500);
  };

  if (!mode) {
    return (
      <div className="learning-screen">
        <div className="page-header">
          <h2>🔢 Number Game</h2>
          <p>Test your Kannada number recognition skills.</p>
        </div>
        <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3>Select Difficulty</h3>
          <button className="btn-primary" onClick={() => startGame('basic')}>Basic (1-10)</button>
          <button className="btn-primary" onClick={() => startGame('intermediate')}>Intermediate (1-50)</button>
          <button className="btn-primary" onClick={() => startGame('advanced')}>Advanced (1-100)</button>
        </div>
      </div>
    );
  }

  if (mode === 'done') {
    return (
      <div className="learning-screen">
        <div className="page-header"><h2>🔢 Game Over</h2></div>
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>{score >= 8 ? '🌟' : '👍'}</div>
          <h2>You scored {score} / 10!</h2>
          <button className="btn-primary" style={{ marginTop: '2rem', width: 'auto', padding: '1rem 2rem' }} onClick={() => setMode(null)}>
            Play Again
          </button>
        </div>
      </div>
    );
  }

  const { target, type } = currentQ;
  const questionText = type === 'digit2word' ? target.toString() : NUMBERS[target].k;
  const questionSub = type === 'digit2word' ? 'What is this number in Kannada?' : 'Which number is this?';

  return (
    <div className="learning-screen">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>🔢 Question {qCount + 1} / 10</h2>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--gold)' }}>Score: {score}</div>
        </div>
      </div>
      
      <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>{questionSub}</p>
        <div style={{ fontSize: '4rem', fontWeight: 900, color: 'var(--sakura-pink)', marginBottom: '2rem' }}>
          {questionText}
        </div>
        {type === 'word2digit' && <div style={{ fontStyle: 'italic', color: 'var(--text-muted)', marginTop: '-1.5rem', marginBottom: '2rem' }}>{NUMBERS[target].t}</div>}
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {opts.map((opt, i) => {
            const btnText = type === 'digit2word' ? `${NUMBERS[opt].k} (${NUMBERS[opt].t})` : opt.toString();
            
            let bg = 'rgba(255,255,255,0.05)';
            let br = '1px solid var(--glass-border)';
            if (showRes) {
              if (opt === target) {
                bg = 'rgba(74, 222, 128, 0.2)';
                br = '1px solid #4ade80';
              } else if (opt === selected) {
                bg = 'rgba(248, 113, 113, 0.2)';
                br = '1px solid #f87171';
              }
            } else if (selected === opt) {
              bg = 'rgba(255,255,255,0.15)';
            }
            
            return (
              <button
                key={i}
                onClick={() => handlePick(opt)}
                style={{
                  padding: '1.5rem',
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  background: bg,
                  border: br,
                  borderRadius: '12px',
                  color: 'var(--text-primary)',
                  cursor: showRes ? 'default' : 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {btnText}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default KannadaNumberGame;
