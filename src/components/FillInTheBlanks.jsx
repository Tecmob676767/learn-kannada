import React, { useState, useEffect } from 'react';
import { fillBlanksLevels } from '../data/fillBlanksData.js';
import { addXP } from '../utils/storage.js';

const FillInTheBlanks = ({ onXP, onToast }) => {
  const [levelIdx, setLevelIdx] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [finished, setFinished] = useState(false);
  const [shake, setShake] = useState(false);

  const level = fillBlanksLevels[levelIdx];
  const q = level.questions[qIdx];
  const total = level.questions.length;

  const handleAnswer = (option) => {
    if (revealed) return;
    setSelected(option);
    setRevealed(true);
    if (option === q.answer) {
      const xp = levelIdx === 0 ? 8 : levelIdx === 1 ? 12 : 18;
      addXP(xp);
      onXP && onXP(xp);
      setScore(s => ({ ...s, correct: s.correct + 1 }));
      onToast && onToast(`✅ Correct! +${xp} XP`, 'xp');
    } else {
      setScore(s => ({ ...s, wrong: s.wrong + 1 }));
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const next = () => {
    if (qIdx < total - 1) {
      setQIdx(i => i + 1);
      setSelected(null);
      setRevealed(false);
    } else {
      setFinished(true);
    }
  };

  const reset = () => {
    setQIdx(0);
    setSelected(null);
    setRevealed(false);
    setScore({ correct: 0, wrong: 0 });
    setFinished(false);
  };

  const selectLevel = (i) => {
    setLevelIdx(i);
    reset();
  };

  // Render sentence with blank filled
  const renderSentence = (fill = null) => {
    const parts = q.sentence.split('___');
    return (
      <span style={{ fontFamily: 'Noto Sans Kannada, sans-serif', fontSize: 'clamp(1.1rem, 3vw, 1.6rem)', lineHeight: 1.8 }}>
        {parts[0]}
        <span style={{
          display: 'inline-block',
          minWidth: '120px',
          borderBottom: '3px solid var(--sakura-pink)',
          textAlign: 'center',
          color: fill ? (fill === q.answer ? '#43e97b' : '#f5576c') : 'transparent',
          padding: '0 0.5rem',
          fontWeight: 700,
        }}>
          {fill || '___'}
        </span>
        {parts[1]}
      </span>
    );
  };

  const percentage = total > 0 ? Math.round((score.correct / total) * 100) : 0;

  return (
    <div className="learning-screen">
      <div className="page-header">
        <h2>🧩 Fill in the Blanks</h2>
        <p>Complete Kannada sentences by choosing the right word!</p>
      </div>

      {/* Level Selector */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {fillBlanksLevels.map((lv, i) => (
          <button key={lv.id} onClick={() => selectLevel(i)}
            className={`section-tab${levelIdx === i ? ' active' : ''}`}>
            {lv.icon} {lv.name}
          </button>
        ))}
      </div>

      {/* Score bar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { label: 'Correct', value: score.correct, icon: '✅', color: '#43e97b' },
          { label: 'Wrong', value: score.wrong, icon: '❌', color: '#f5576c' },
          { label: 'Question', value: `${qIdx + 1}/${total}`, icon: '📝', color: '#4facfe' },
        ].map(stat => (
          <div key={stat.label} className="glass-card" style={{ padding: '0.75rem 1.25rem', textAlign: 'center', flex: '1', minWidth: '80px' }}>
            <div style={{ fontSize: '1.3rem' }}>{stat.icon}</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Progress */}
      <div className="quiz-progress-bar" style={{ marginBottom: '1.5rem' }}>
        <div className="quiz-progress-fill" style={{ width: `${(qIdx / total) * 100}%` }} />
      </div>

      {finished ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>{percentage >= 70 ? '🎉' : '💪'}</div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            {percentage >= 70 ? 'Well Done!' : 'Keep Practicing!'}
          </h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--gold)', margin: '1rem 0' }}>
            {percentage}%
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            {score.correct} correct out of {total} questions
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={reset} style={{ width: 'auto', padding: '0.75rem 2rem' }}>
              🔄 Try Again
            </button>
            {levelIdx < fillBlanksLevels.length - 1 && (
              <button className="glass-btn" onClick={() => selectLevel(levelIdx + 1)}>
                Next Level →
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className={`glass-card ${shake ? 'shake-anim' : ''}`} style={{ padding: '2rem' }}>
          {/* Hint */}
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            💡 Hint: {q.hint}
          </div>

          {/* Sentence with blank */}
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            textAlign: 'center',
          }}>
            {renderSentence(revealed ? selected : null)}
          </div>

          {/* Options */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {q.options.map((opt, i) => {
              let btnStyle = {};
              if (revealed) {
                if (opt === q.answer) btnStyle = { background: 'rgba(67,233,123,0.2)', borderColor: '#43e97b' };
                else if (opt === selected) btnStyle = { background: 'rgba(245,87,108,0.2)', borderColor: '#f5576c' };
              }
              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(opt)}
                  disabled={revealed}
                  style={{
                    padding: '0.9rem 1rem',
                    background: 'rgba(255,255,255,0.06)',
                    border: '2px solid rgba(255,255,255,0.12)',
                    borderRadius: '12px',
                    color: 'var(--text-primary)',
                    fontFamily: 'Noto Sans Kannada, sans-serif',
                    fontSize: '1.05rem',
                    cursor: revealed ? 'default' : 'pointer',
                    transition: 'all 0.2s',
                    ...btnStyle,
                  }}
                  onMouseEnter={e => !revealed && (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
                  onMouseLeave={e => !revealed && (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {revealed && (
            <div style={{
              padding: '1rem',
              background: selected === q.answer ? 'rgba(67,233,123,0.08)' : 'rgba(245,87,108,0.08)',
              borderRadius: '10px',
              marginBottom: '1rem',
              fontSize: '0.9rem',
              color: 'var(--text-secondary)',
              borderLeft: `3px solid ${selected === q.answer ? '#43e97b' : '#f5576c'}`,
            }}>
              📚 {q.explanation}
            </div>
          )}

          {revealed && (
            <button className="btn-primary" onClick={next} style={{ width: '100%' }}>
              {qIdx < total - 1 ? 'Next Question →' : '🏁 Finish'}
            </button>
          )}
        </div>
      )}

      <style>{`
        @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-8px)} 75%{transform:translateX(8px)} }
        .shake-anim { animation: shake 0.4s ease; }
      `}</style>
    </div>
  );
};

export default FillInTheBlanks;
