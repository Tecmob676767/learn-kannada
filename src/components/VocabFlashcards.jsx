import React, { useState } from 'react';
import { vocabDecks } from '../data/vocabularyData.js';
import { speakKannada } from '../utils/tts.js';
import { addXP, updateUser, getCurrentUser } from '../utils/storage.js';

const VocabFlashcards = ({ onXP }) => {
  const [deckIdx, setDeckIdx] = useState(0);
  const [cardIdx, setCardIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState([]);

  const deck = vocabDecks[deckIdx];
  const card = deck.cards[cardIdx];
  const total = deck.cards.length;

  const handleFlip = () => {
    if (!flipped) speakKannada(card.kannada);
    setFlipped(f => !f);
  };

  const handleSRS = (rating) => {
    const u = getCurrentUser();
    const xpMap = { easy: 10, good: 6, hard: 3 };
    const xp = xpMap[rating] || 5;
    addXP(xp);
    onXP && onXP(xp);
    if (u) updateUser({ progress: { ...(u.progress || {}), vocabulary: Math.min(100, (u.progress?.vocabulary || 0) + 3) } });

    setDone(d => [...d, cardIdx]);
    setFlipped(false);
    if (cardIdx < total - 1) {
      setTimeout(() => setCardIdx(i => i + 1), 200);
    }
  };

  const resetDeck = () => { setCardIdx(0); setFlipped(false); setDone([]); };
  const isLastCard = cardIdx >= total - 1 && done.includes(cardIdx);
  const progress = Math.round((done.length / total) * 100);

  return (
    <div className="learning-screen">
      <div className="page-header">
        <h2>📚 ಶಬ್ದಕೋಶ — Vocabulary + SRS</h2>
        <p>Tap the card to flip it, then rate how well you knew it!</p>
      </div>

      {/* Deck selector */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {vocabDecks.map((d, i) => (
          <button
            key={d.id}
            onClick={() => { setDeckIdx(i); setCardIdx(0); setFlipped(false); setDone([]); }}
            className={`section-tab${deckIdx === i ? ' active' : ''}`}
          >
            {d.icon} {d.name}
          </button>
        ))}
      </div>

      {/* Progress */}
      <div style={{ marginBottom: '1rem' }}>
        <div className="flex-between" style={{ marginBottom: '0.4rem' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Card {Math.min(cardIdx + 1, total)} of {total}</span>
          <span style={{ fontSize: '0.82rem', color: 'var(--gold)', fontWeight: 700 }}>{done.length} done</span>
        </div>
        <div className="quiz-progress-bar">
          <div className="quiz-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {done.length === total ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>Deck Complete!</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            You finished <strong>{deck.name}</strong>!
          </p>
          <button className="btn-primary" onClick={resetDeck} style={{ width: 'auto', padding: '0.75rem 2rem' }}>
            🔄 Review Again
          </button>
        </div>
      ) : (
        <>
          <div className="flashcard-container">
            <div className={`flashcard${flipped ? ' flipped' : ''}`} onClick={handleFlip}>
              <div className="flashcard-front" style={{ background: deck.color }}>
                <span className="flashcard-word">{card.kannada}</span>
                <span className="flashcard-hint">{card.transliteration}</span>
                <span style={{ marginTop: '1rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>Tap to reveal →</span>
              </div>
              <div className="flashcard-back">
                <span className="flashcard-translation">{card.meaning}</span>
                <span className="flashcard-transliteration">{card.transliteration}</span>
                {card.example && (
                  <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', maxWidth: '90%' }}>
                    <span style={{ fontFamily: 'Noto Sans Kannada, sans-serif', color: 'var(--sakura-pink)', fontSize: '0.9rem', display: 'block' }}>{card.example}</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{card.exampleMeaning}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            {flipped ? 'How well did you know this?' : 'Tap the card to see the answer'}
          </div>

          {flipped && (
            <div className="srs-buttons">
              <button className="srs-btn hard" onClick={() => handleSRS('hard')}>😓 Hard +3XP</button>
              <button className="srs-btn good" onClick={() => handleSRS('good')}>🙂 Good +6XP</button>
              <button className="srs-btn easy" onClick={() => handleSRS('easy')}>😄 Easy +10XP</button>
            </div>
          )}

          {!flipped && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
              <button className="audio-btn" onClick={() => speakKannada(card.kannada)}>
                🔊 Hear Kannada
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VocabFlashcards;
