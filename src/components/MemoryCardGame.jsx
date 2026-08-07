import React, { useState, useEffect } from 'react';
import { addXP } from '../utils/storage.js';
import { speakKannada } from '../utils/tts.js';

const PAIRS = [
  { id: 1, kannada: 'ನೀರು', english: 'Water' },
  { id: 2, kannada: 'ಮನೆ', english: 'House' },
  { id: 3, kannada: 'ಅಮ್ಮ', english: 'Mother' },
  { id: 4, kannada: 'ಅಪ್ಪ', english: 'Father' },
  { id: 5, kannada: 'ಹಾಲು', english: 'Milk' },
  { id: 6, kannada: 'ಕಾಡು', english: 'Forest' },
  { id: 7, kannada: 'ಹಣ್ಣು', english: 'Fruit' },
  { id: 8, kannada: 'ಕಣ್ಣು', english: 'Eye' },
];

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

const buildCards = () => {
  const cards = [];
  PAIRS.forEach(p => {
    cards.push({ uid: `k-${p.id}`, pairId: p.id, text: p.kannada, type: 'kannada' });
    cards.push({ uid: `e-${p.id}`, pairId: p.id, text: p.english, type: 'english' });
  });
  return shuffle(cards);
};

const MemoryCardGame = ({ onXP, onToast }) => {
  const [cards, setCards] = useState(buildCards);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState(new Set());
  const [moves, setMoves] = useState(0);
  const [startTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [finished, setFinished] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (finished) return;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(t);
  }, [finished, startTime]);

  const handleFlip = (card) => {
    if (checking || flipped.length >= 2 || matched.has(card.uid) || flipped.find(c => c.uid === card.uid)) return;
    const newFlipped = [...flipped, card];
    setFlipped(newFlipped);
    if (newFlipped.length === 2) {
      setChecking(true);
      setMoves(m => m + 1);
      speakKannada(newFlipped.find(c => c.type === 'kannada')?.text || '');
      setTimeout(() => {
        if (newFlipped[0].pairId === newFlipped[1].pairId) {
          const newMatched = new Set([...matched, newFlipped[0].uid, newFlipped[1].uid]);
          setMatched(newMatched);
          if (newMatched.size === cards.length) {
            setFinished(true);
            const xp = Math.max(20, 100 - moves * 2);
            addXP(xp); onXP && onXP(xp);
            onToast && onToast(`🎴 All matched! +${xp} XP`, 'xp');
          }
        }
        setFlipped([]);
        setChecking(false);
      }, 900);
    }
  };

  const restart = () => {
    setCards(buildCards());
    setFlipped([]);
    setMatched(new Set());
    setMoves(0);
    setFinished(false);
  };

  const isFlipped = (card) => flipped.find(c => c.uid === card.uid) || matched.has(card.uid);
  const isMatched = (card) => matched.has(card.uid);

  const mm = Math.floor(elapsed / 60);
  const ss = elapsed % 60;

  return (
    <div className="learning-screen">
      <div className="page-header">
        <h2>🃏 Memory Card Flip Game</h2>
        <p>Match each Kannada word with its English meaning!</p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { label: 'Moves', value: moves, icon: '♟️', color: '#4facfe' },
          { label: 'Matched', value: `${matched.size / 2}/${PAIRS.length}`, icon: '✅', color: '#43e97b' },
          { label: 'Time', value: `${mm}:${ss.toString().padStart(2, '0')}`, icon: '⏱', color: '#ffd200' },
        ].map(s => (
          <div key={s.label} className="glass-card" style={{ padding: '0.75rem', textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: '1.2rem' }}>{s.icon}</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {finished ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🎉</div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>All Pairs Matched!</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Completed in <strong>{moves} moves</strong> and <strong>{mm}:{ss.toString().padStart(2, '0')}</strong>
          </p>
          <button className="btn-primary" onClick={restart} style={{ width: 'auto', padding: '0.75rem 2rem' }}>🔄 Play Again</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
          {cards.map(card => {
            const isUp = isFlipped(card);
            const done = isMatched(card);
            return (
              <button
                key={card.uid}
                onClick={() => handleFlip(card)}
                style={{
                  aspectRatio: '3/4', borderRadius: '12px', border: 'none', cursor: isUp ? 'default' : 'pointer',
                  background: done ? 'rgba(67,233,123,0.15)' : isUp
                    ? (card.type === 'kannada' ? 'linear-gradient(135deg, rgba(255,182,193,0.2), rgba(255,182,193,0.1))' : 'linear-gradient(135deg, rgba(79,172,254,0.2), rgba(0,242,254,0.1))')
                    : 'rgba(255,255,255,0.06)',
                  border: done ? '2px solid #43e97b' : isUp ? '2px solid rgba(255,182,193,0.4)' : '2px solid rgba(255,255,255,0.1)',
                  transition: 'all 0.3s', transform: done ? 'scale(0.97)' : 'scale(1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem',
                  fontFamily: card.type === 'kannada' ? 'Noto Sans Kannada, sans-serif' : 'inherit',
                  fontSize: card.type === 'kannada' ? 'clamp(1rem, 2.5vw, 1.3rem)' : 'clamp(0.75rem, 2vw, 0.95rem)',
                  fontWeight: 600, color: done ? '#43e97b' : 'var(--text-primary)',
                  textAlign: 'center',
                }}
              >
                {isUp ? card.text : '🌸'}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MemoryCardGame;
