import React, { useState, useEffect, useRef, useCallback } from 'react';
import { typingLevels } from '../data/typingData.js';
import { addXP } from '../utils/storage.js';

const TypingTutor = ({ onXP, onToast }) => {
  const [levelIdx, setLevelIdx] = useState(0);
  const [exIdx, setExIdx] = useState(0);
  const [typed, setTyped] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [finished, setFinished] = useState(false);
  const [sessionXP, setSessionXP] = useState(0);
  const inputRef = useRef(null);

  const level = typingLevels[levelIdx];
  const exercise = level.exercises[exIdx];
  const target = exercise.text;

  const calcStats = useCallback((input) => {
    if (!startTime) return;
    const elapsed = (Date.now() - startTime) / 1000 / 60;
    const words = input.trim().split(/\s+/).length;
    const calculatedWpm = elapsed > 0 ? Math.round(words / elapsed) : 0;
    setWpm(calculatedWpm);

    let correct = 0;
    for (let i = 0; i < input.length; i++) {
      if (input[i] === target[i]) correct++;
    }
    setAccuracy(input.length > 0 ? Math.round((correct / input.length) * 100) : 100);
  }, [startTime, target]);

  const handleInput = (e) => {
    const val = e.target.value;
    if (!startTime && val.length === 1) setStartTime(Date.now());
    setTyped(val);
    calcStats(val);

    if (val === target) {
      const xpEarned = Math.max(5, Math.round(target.length * level.xpPerChar * (accuracy / 100)));
      addXP(xpEarned);
      onXP && onXP(xpEarned);
      setSessionXP(s => s + xpEarned);
      onToast && onToast(`✨ Exercise complete! +${xpEarned} XP`, 'xp');
      setTimeout(() => {
        if (exIdx < level.exercises.length - 1) {
          setExIdx(i => i + 1);
          setTyped('');
          setStartTime(null);
          setWpm(0);
          setAccuracy(100);
        } else {
          setFinished(true);
        }
      }, 600);
    }
  };

  const reset = () => {
    setExIdx(0);
    setTyped('');
    setStartTime(null);
    setWpm(0);
    setAccuracy(100);
    setFinished(false);
    setSessionXP(0);
    inputRef.current?.focus();
  };

  useEffect(() => {
    inputRef.current?.focus();
    setTyped('');
    setStartTime(null);
    setWpm(0);
    setAccuracy(100);
    setFinished(false);
  }, [levelIdx, exIdx]);

  const renderTarget = () => {
    return target.split('').map((ch, i) => {
      let cls = 'char-pending';
      if (i < typed.length) cls = typed[i] === ch ? 'char-correct' : 'char-wrong';
      if (i === typed.length) cls = 'char-cursor';
      return <span key={i} className={cls}>{ch}</span>;
    });
  };

  const progress = Math.round((exIdx / level.exercises.length) * 100);

  return (
    <div className="learning-screen">
      <div className="page-header">
        <h2>⌨️ Kannada Typing Tutor</h2>
        <p>Practice Kannada script typing with live WPM and accuracy tracking!</p>
      </div>

      {/* Level Selector */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {typingLevels.map((lv, i) => (
          <button key={lv.id} onClick={() => { setLevelIdx(i); setExIdx(0); setFinished(false); setSessionXP(0); }}
            className={`section-tab${levelIdx === i ? ' active' : ''}`}>
            {lv.icon} {lv.name}
          </button>
        ))}
      </div>

      {/* Stats Bar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { label: 'WPM', value: wpm, icon: '⚡', color: '#4facfe' },
          { label: 'Accuracy', value: `${accuracy}%`, icon: '🎯', color: '#43e97b' },
          { label: 'Exercise', value: `${exIdx + 1}/${level.exercises.length}`, icon: '📝', color: '#f093fb' },
          { label: 'Session XP', value: `+${sessionXP}`, icon: '⭐', color: '#ffd200' },
        ].map(stat => (
          <div key={stat.label} className="glass-card" style={{ padding: '0.75rem 1.25rem', textAlign: 'center', flex: '1', minWidth: '80px' }}>
            <div style={{ fontSize: '1.4rem' }}>{stat.icon}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Progress */}
      <div className="quiz-progress-bar" style={{ marginBottom: '1.5rem' }}>
        <div className="quiz-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {finished ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '0.75rem' }}>🎉</div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Level Complete!</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            You finished all <strong>{level.name}</strong> exercises!
          </p>
          <div style={{ fontSize: '1.1rem', color: 'var(--gold)', fontWeight: 700, marginBottom: '1.5rem' }}>
            ⭐ +{sessionXP} XP earned this session
          </div>
          <button className="btn-primary" onClick={reset} style={{ width: 'auto', padding: '0.75rem 2rem' }}>
            🔄 Retry Level
          </button>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '2rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            💡 {exercise.hint}
          </div>

          {/* Target text display */}
          <div style={{
            fontFamily: 'Noto Sans Kannada, sans-serif',
            fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
            lineHeight: 2,
            padding: '1.5rem',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            letterSpacing: '0.05em',
            minHeight: '80px',
            wordBreak: 'break-all',
          }}>
            {renderTarget()}
          </div>

          {/* Input */}
          <textarea
            ref={inputRef}
            value={typed}
            onChange={handleInput}
            placeholder="Start typing in Kannada here..."
            spellCheck={false}
            autoComplete="off"
            style={{
              width: '100%',
              minHeight: '80px',
              fontFamily: 'Noto Sans Kannada, sans-serif',
              fontSize: '1.2rem',
              background: 'rgba(255,255,255,0.06)',
              border: '2px solid rgba(255,255,255,0.15)',
              borderRadius: '12px',
              color: 'var(--text-primary)',
              padding: '1rem',
              resize: 'none',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--sakura-pink)'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
          />

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
            <button className="glass-btn" onClick={() => { setTyped(''); setStartTime(null); inputRef.current?.focus(); }}>
              🔄 Clear
            </button>
            {exIdx < level.exercises.length - 1 && (
              <button className="glass-btn" onClick={() => { setExIdx(i => i + 1); setTyped(''); setStartTime(null); }}>
                ⏭ Skip
              </button>
            )}
          </div>
        </div>
      )}

      <style>{`
        .char-pending { color: var(--text-secondary); }
        .char-correct { color: #43e97b; }
        .char-wrong { color: #f5576c; text-decoration: underline; }
        .char-cursor { color: var(--text-primary); border-bottom: 2px solid var(--sakura-pink); animation: blink 1s infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
      `}</style>
    </div>
  );
};

export default TypingTutor;
