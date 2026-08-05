import React, { useState } from 'react';
import { quizSets } from '../data/quizData.js';
import { speakKannada } from '../utils/tts.js';
import { addXP, updateUser, getCurrentUser, unlockBadge } from '../utils/storage.js';

const QuizDrills = ({ onXP, onToast }) => {
  const [quizIdx, setQuizIdx] = useState(null);
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const startQuiz = (i) => {
    setQuizIdx(i);
    setQIdx(0);
    setSelected(null);
    setScore(0);
    setDone(false);
  };

  const quiz = quizIdx !== null ? quizSets[quizIdx] : null;
  const question = quiz ? quiz.questions[qIdx] : null;

  const handleAnswer = (opt) => {
    if (selected) return;
    setSelected(opt);
    const correct = opt === question.answer;
    if (correct) {
      setScore(s => s + 1);
      addXP(15);
      onXP && onXP(15);
    }
    speakKannada(question.question);
    setTimeout(() => {
      if (qIdx < quiz.questions.length - 1) {
        setQIdx(i => i + 1);
        setSelected(null);
      } else {
        setDone(true);
        const pct = Math.round(((score + (correct ? 1 : 0)) / quiz.questions.length) * 100);
        const u = getCurrentUser();
        if (u) {
          updateUser({ progress: { ...(u.progress || {}), quizzes: Math.min(100, (u.progress?.quizzes || 0) + 15) } });
          if (pct === 100) {
            unlockBadge('quiz_perfect');
            onToast && onToast('🏅 Badge Unlocked: Perfect Score!', 'xp');
          }
        }
      }
    }, 1200);
  };

  if (quizIdx === null) {
    return (
      <div className="learning-screen">
        <div className="page-header">
          <h2>🎯 ಪರೀಕ್ಷೆ — Quiz Arena</h2>
          <p>Choose a quiz set and test your Kannada knowledge!</p>
        </div>
        <div className="curriculum-grid">
          {quizSets.map((q, i) => (
            <div key={q.id} className="glass-card level-card" onClick={() => startQuiz(i)}>
              <span className="level-icon">{q.icon}</span>
              <div className="level-title">{q.name}</div>
              <div className="level-desc">{q.questions.length} questions · +15 XP each</div>
              <div className="level-meta" style={{ marginTop: '1rem' }}>
                <span className="level-lessons">Tap to start</span>
                <span className="level-arrow">→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const total = quiz.questions.length;
  const pct = Math.round((qIdx / total) * 100);
  const finalPct = Math.round((score / total) * 100);

  return (
    <div className="learning-screen">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={() => setQuizIdx(null)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', padding: '0.4rem 0.8rem', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontSize: '0.85rem' }}>
          ← Back
        </button>
        <div>
          <h2 style={{ fontSize: '1.4rem' }}>{quiz.icon} {quiz.name}</h2>
        </div>
      </div>

      <div className="quiz-progress-bar" style={{ marginBottom: '2rem' }}>
        <div className="quiz-progress-fill" style={{ width: `${pct}%` }} />
      </div>

      {!done && question && (
        <div className="quiz-card glass-card" style={{ padding: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Question {qIdx + 1} of {total}
          </div>
          <div className="quiz-question">{question.question}</div>
          <div className="quiz-question-sub">
            {question.type === 'meaning' ? 'What does this mean in English?' :
             question.type === 'transliteration' ? 'What is the transliteration?' :
             'Which Kannada word matches?'}
          </div>

          <div className="quiz-options">
            {question.options.map((opt, i) => (
              <button
                key={i}
                className={`quiz-option${selected === opt ? (opt === question.answer ? ' correct' : ' wrong') : selected && opt === question.answer ? ' correct' : ''}`}
                onClick={() => handleAnswer(opt)}
                disabled={!!selected}
              >
                {opt}
              </button>
            ))}
          </div>

          {question.audioWord && (
            <div style={{ textAlign: 'center' }}>
              <button className="audio-btn" onClick={() => speakKannada(question.audioWord)}>
                🔊 Hear the Word
              </button>
            </div>
          )}
        </div>
      )}

      {done && (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>
            {finalPct === 100 ? '🎉' : finalPct >= 70 ? '😊' : '📖'}
          </div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '0.5rem' }}>
            {score}/{total} Correct
          </h3>
          <div style={{ fontSize: '1.2rem', color: finalPct === 100 ? 'var(--gold)' : finalPct >= 70 ? 'var(--green-success)' : 'var(--red-error)', marginBottom: '1.5rem', fontWeight: 700 }}>
            {finalPct}% Accuracy
          </div>
          {finalPct === 100 && <p style={{ color: 'var(--gold)', marginBottom: '1rem' }}>🏅 Perfect score! Badge unlocked!</p>}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-primary" style={{ width: 'auto', padding: '0.75rem 2rem' }} onClick={() => startQuiz(quizIdx)}>
              🔄 Retry
            </button>
            <button onClick={() => setQuizIdx(null)} style={{ padding: '0.75rem 2rem', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
              Choose Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizDrills;
