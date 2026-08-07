import React, { useState, useEffect } from 'react';
import { vocabDecks } from '../data/vocabularyData.js';
import { quizSets } from '../data/quizData.js';
import { speakKannada } from '../utils/tts.js';
import { getDueSRSCards, getAllSRSCards, updateSRSCard, addXP, getCurrentUser, updateUser } from '../utils/storage.js';

const seedCardsFromData = () => {
  const cards = {};
  vocabDecks.forEach(deck => {
    deck.cards.forEach((card, i) => {
      const id = `vocab_${deck.id}_${i}`;
      cards[id] = {
        id, kannada: card.kannada, meaning: card.meaning,
        transliteration: card.transliteration, source: 'vocabulary',
        interval: 0, ease: 2.5, repetitions: 0, nextReview: Date.now(),
      };
    });
  });
  quizSets.forEach(set => {
    set.questions.slice(0, 5).forEach((q, i) => {
      const id = `quiz_${set.id}_${i}`;
      cards[id] = {
        id, kannada: q.question, meaning: q.answer,
        transliteration: '', source: 'quiz',
        interval: 0, ease: 2.5, repetitions: 0, nextReview: Date.now(),
      };
    });
  });
  return cards;
};

const SpacedRepetition = ({ onXP, onToast }) => {
  const [dueCards, setDueCards] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState(0);

  const loadCards = () => {
    const user = getCurrentUser();
    if (user && Object.keys(user.srsCards || {}).length === 0) {
      updateUser({ srsCards: seedCardsFromData() });
    }
    let due = getDueSRSCards();
    if (due.length === 0) {
      const all = getAllSRSCards();
      due = all.sort((a, b) => (a.nextReview || 0) - (b.nextReview || 0)).slice(0, 20);
    }
    setDueCards(due);
    setCurrentIdx(0);
    setFlipped(false);
  };

  useEffect(() => { loadCards(); }, []);

  const card = dueCards[currentIdx];
  const totalDue = dueCards.length;

  const handleReview = (knowIt) => {
    if (!card) return;
    updateSRSCard(card.id, card, knowIt);
    const xp = knowIt ? 8 : 3;
    addXP(xp);
    onXP && onXP(xp);
    setReviewed(r => r + 1);
    onToast && onToast(knowIt ? `✅ Know it! +${xp} XP` : `🔄 Review again +${xp} XP`, 'xp');

    setFlipped(false);
    if (currentIdx < totalDue - 1) {
      setTimeout(() => setCurrentIdx(i => i + 1), 300);
    } else {
      onToast && onToast('🎉 All due cards reviewed!', 'success');
      setTimeout(loadCards, 800);
    }
  };

  if (!card) {
    return (
      <div className="learning-screen">
        <div className="page-header">
          <h2>🔄 Spaced Repetition Review</h2>
          <p>SM-2 algorithm surfaces words you need to review today.</p>
        </div>
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
          <h3 style={{ fontWeight: 800 }}>All caught up!</h3>
          <p style={{ color: 'var(--text-secondary)', margin: '0.75rem 0 1.5rem' }}>
            No cards due for review right now. Come back tomorrow!
          </p>
          <button className="btn-primary" onClick={loadCards} style={{ width: 'auto', padding: '0.75rem 2rem' }}>
            🔄 Check Again
          </button>
        </div>
      </div>
    );
  }

  const daysUntil = Math.max(0, Math.ceil(((card.nextReview || Date.now()) - Date.now()) / 86400000));

  return (
    <div className="learning-screen">
      <div className="page-header">
        <h2>🔄 Spaced Repetition Review</h2>
        <p>Cards due today are surfaced first — rate each word to schedule your next review.</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { label: 'Due Today', value: totalDue, icon: '📋', color: '#f5576c' },
          { label: 'Reviewed', value: reviewed, icon: '✅', color: '#43e97b' },
          { label: 'Remaining', value: totalDue - currentIdx, icon: '⏳', color: '#4facfe' },
        ].map(s => (
          <div key={s.label} className="glass-card" style={{ padding: '0.75rem 1.25rem', textAlign: 'center', flex: 1, minWidth: '90px' }}>
            <div style={{ fontSize: '1.3rem' }}>{s.icon}</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="quiz-progress-bar" style={{ marginBottom: '1.5rem' }}>
        <div className="quiz-progress-fill" style={{ width: `${((currentIdx) / totalDue) * 100}%` }} />
      </div>

      <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Card {currentIdx + 1} of {totalDue} • Source: {card.source}
          {card.repetitions > 0 && ` • Interval: ${card.interval || 1} day(s)`}
        </div>

        <div
          onClick={() => { if (!flipped) speakKannada(card.kannada); setFlipped(f => !f); }}
          style={{
            cursor: 'pointer',
            padding: '2.5rem',
            borderRadius: '16px',
            background: flipped ? 'rgba(67,233,123,0.08)' : 'rgba(255,182,193,0.08)',
            border: `2px solid ${flipped ? '#43e97b' : 'rgba(255,182,193,0.3)'}`,
            marginBottom: '1.5rem',
            transition: 'all 0.3s',
          }}
        >
          <div style={{
            fontFamily: 'Noto Sans Kannada, sans-serif',
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 800,
            color: 'var(--sakura-pink)',
            marginBottom: flipped ? '0.75rem' : 0,
          }}>
            {card.kannada}
          </div>
          {flipped ? (
            <div style={{ fontSize: '1.2rem', color: 'var(--text-primary)', fontWeight: 600 }}>
              {card.meaning}
              {card.transliteration && (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.35rem', fontStyle: 'italic' }}>
                  {card.transliteration}
                </div>
              )}
            </div>
          ) : (
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Tap to reveal meaning
            </div>
          )}
        </div>

        {flipped ? (
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="srs-btn hard"
              onClick={() => handleReview(false)}
              style={{ flex: 1, maxWidth: '200px', padding: '0.9rem' }}
            >
              🔄 Review Again
            </button>
            <button
              className="srs-btn easy"
              onClick={() => handleReview(true)}
              style={{ flex: 1, maxWidth: '200px', padding: '0.9rem' }}
            >
              ✅ Know It
            </button>
          </div>
        ) : (
          <button className="audio-btn" onClick={() => speakKannada(card.kannada)}>
            🔊 Hear Pronunciation
          </button>
        )}

        {daysUntil === 0 && card.repetitions > 0 && (
          <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            SM-2: "Know it" increases interval; "Review again" resets to 1 day
          </p>
        )}
      </div>
    </div>
  );
};

export default SpacedRepetition;
