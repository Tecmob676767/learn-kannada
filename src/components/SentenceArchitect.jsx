import React, { useState, useCallback } from 'react';
import { grammarLessons } from '../data/grammarData.js';
import { speakKannada } from '../utils/tts.js';
import { addXP, updateUser, getCurrentUser } from '../utils/storage.js';

const SentenceArchitect = ({ onXP }) => {
  const [lessonIdx, setLessonIdx] = useState(0);
  const [exIdx, setExIdx] = useState(0);
  const [placed, setPlaced] = useState([]);
  const [result, setResult] = useState(null); // 'correct' | 'wrong'

  const lesson = grammarLessons[lessonIdx];
  const exercise = lesson?.exercises[exIdx];

  const addWord = (wi) => {
    if (placed.includes(wi)) return;
    setPlaced(p => [...p, wi]);
    setResult(null);
  };

  const removeWord = (wi) => {
    setPlaced(p => p.filter(x => x !== wi));
    setResult(null);
  };

  const checkAnswer = () => {
    if (!exercise) return;
    const correct = JSON.stringify(placed) === JSON.stringify(exercise.correctOrder);
    setResult(correct ? 'correct' : 'wrong');
    if (correct) {
      addXP(20);
      onXP && onXP(20);
      speakKannada(exercise.words.map(w => w.kannada).join(' '));
      const u = getCurrentUser();
      if (u) updateUser({ progress: { ...(u.progress || {}), grammar: Math.min(100, (u.progress?.grammar || 0) + 20) } });
    }
  };

  const nextExercise = () => {
    setPlaced([]);
    setResult(null);
    if (exIdx < lesson.exercises.length - 1) {
      setExIdx(i => i + 1);
    } else if (lessonIdx < grammarLessons.length - 1) {
      setLessonIdx(i => i + 1);
      setExIdx(0);
    }
  };

  const reset = () => { setPlaced([]); setResult(null); };

  return (
    <div className="learning-screen">
      <div className="page-header">
        <h2>✏️ ವ್ಯಾಕರಣ — Sentence Architect</h2>
        <p>Tap words in the correct Kannada (SOV) order!</p>
      </div>

      <div className="section-tabs">
        {grammarLessons.map((l, i) => (
          <button key={l.id} className={`section-tab${lessonIdx === i ? ' active' : ''}`}
            onClick={() => { setLessonIdx(i); setExIdx(0); setPlaced([]); setResult(null); }}>
            {l.titleKannada}
          </button>
        ))}
      </div>

      <div className="glass-card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem', background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.2)' }}>
        <div style={{ fontWeight: 700, color: 'var(--gold)', marginBottom: '0.4rem' }}>💡 {lesson.title}</div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6 }}>{lesson.explanation}</p>
      </div>

      {exercise && (
        <>
          <div style={{ marginBottom: '1rem' }}>
            <span className="pill pill-pink" style={{ marginBottom: '0.75rem', display: 'inline-block' }}>
              Exercise {exIdx + 1} / {lesson.exercises.length}
            </span>
            <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1rem' }}>
              Translate: <span style={{ color: 'var(--sakura-pink)' }}>"{exercise.english}"</span>
            </p>
          </div>

          {/* Drop zone */}
          <div className={`sentence-drop-zone${placed.length > 0 ? ' has-words' : ''}`} style={{ marginBottom: '1rem' }}>
            {placed.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Tap words below to place them here...</span>}
            {placed.map(wi => {
              const w = exercise.words[wi];
              return (
                <div key={wi} className="sentence-word placed" onClick={() => removeWord(wi)} title={`${w.transliteration} — ${w.role}`}>
                  {w.kannada}
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', textAlign: 'center' }}>{w.transliteration}</span>
                </div>
              );
            })}
          </div>

          {/* Word bank */}
          <div className="sentence-word-bank">
            {exercise.words.map((w, wi) => (
              <div
                key={wi}
                className={`sentence-word${placed.includes(wi) ? ' placed' : ''}`}
                onClick={() => placed.includes(wi) ? removeWord(wi) : addWord(wi)}
                title={w.role}
              >
                {w.kannada}
                <span style={{ fontSize: '0.65rem', color: placed.includes(wi) ? 'var(--green-success)' : 'var(--text-muted)', display: 'block', textAlign: 'center' }}>
                  {w.transliteration}
                </span>
              </div>
            ))}
          </div>

          {result === 'correct' && (
            <div style={{ padding: '1rem', background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 'var(--radius-md)', marginTop: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>✅ Correct! +20 XP</div>
              <button className="btn-primary" style={{ width: 'auto', padding: '0.6rem 2rem', marginTop: '0.5rem' }} onClick={nextExercise}>
                Next Exercise →
              </button>
            </div>
          )}
          {result === 'wrong' && (
            <div style={{ padding: '1rem', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 'var(--radius-md)', marginTop: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--red-error)' }}>❌ Not quite! Try again.</div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Hint: In Kannada, Subject → Object → Verb</p>
              <button onClick={reset} style={{ marginTop: '0.75rem', background: 'none', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', padding: '0.5rem 1rem', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>
                🔄 Reset
              </button>
            </div>
          )}

          {!result && placed.length === exercise.words.length && (
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <button className="btn-primary" style={{ width: 'auto', padding: '0.75rem 2.5rem' }} onClick={checkAnswer}>
                ✅ Check Answer
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SentenceArchitect;
