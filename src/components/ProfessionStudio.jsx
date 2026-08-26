import React, { useState } from 'react';

const PROFESSIONS = [
  { kn: 'ಶಿಕ್ಷಕ / ಶಿಕ್ಷಕಿ', en: 'Teacher', icon: '👨‍🏫', desc: 'ಪಾಠ ಹೇಳಿಕೊಡುವವರು' },
  { kn: 'ವೈದ್ಯ / ವೈದ್ಯೆ', en: 'Doctor', icon: '👩‍⚕️', desc: 'ರೋಗಿಗಳನ್ನು ಗುಣಪಡಿಸುವವರು' },
  { kn: 'ರೈತ', en: 'Farmer', icon: '👨‍🌾', desc: 'ಬೆಳೆ ಬೆಳೆಯುವ ದೇಶದ ಬೆನ್ನೆಲುಬು' },
  { kn: 'ಎಂಜಿನಿಯರ್', en: 'Engineer', icon: '👷‍♂️', desc: 'ತಂತ್ರಜ್ಞಾನ ರೂಪಿಸುವವರು' },
  { kn: 'ಪೊಲೀಸ್', en: 'Police Officer', icon: '👮', desc: 'ಕಾನೂನು ರಕ್ಷಕರು' },
  { kn: 'ವಕೀಲ', en: 'Lawyer', icon: '⚖️', desc: 'ನ್ಯಾಯಾಲಯದಲ್ಲಿ ವಾದಿಸುವವರು' },
  { kn: 'ಚಾಲಕ', en: 'Driver', icon: '🚗', desc: 'ವಾಹನ ಚಲಾಯಿಸುವವರು' },
  { kn: 'ಅಡುಗೆಯವರು', en: 'Chef / Cook', icon: '👨‍🍳', desc: 'ರುಚಿಕರ ಅಡುಗೆ ಮಾಡುವವರು' },
  { kn: 'ಲೇಖಕ', en: 'Writer / Author', icon: '✍️', desc: 'ಪುಸ್ತಕ ಬರೆಯುವವರು' },
  { kn: 'ಸೈನಿಕ', en: 'Soldier', icon: '🪖', desc: 'ದೇಶ ಕಾಯುವ ವೀರರು' },
  { kn: 'ಗಾಯಕ / ಗಾಯಕಿ', en: 'Singer', icon: '🎤', desc: 'ಹಾಡು ಹಾಡುವ ಕಲಾವಿದರು' },
  { kn: 'ವ್ಯಾಪಾರಿ', en: 'Merchant / Shopkeeper', icon: '🏪', desc: 'ವ್ಯಾಪಾರ ಮಾಡುವವರು' }
];

function speak(word) {
  if (!window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(word);
  u.lang = 'kn-IN';
  u.rate = 0.85;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

export default function ProfessionStudio({ onXP, onToast }) {
  const [mode, setMode] = useState('learn');
  const [qi, setQi] = useState(0);
  const [opts, setOpts] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);

  function startQuiz() {
    setMode('quiz');
    setQi(0);
    setScore(0);
    setFeedback(null);
    const wrong = shuffle(PROFESSIONS.filter((_, j) => j !== 0)).slice(0, 3);
    setOpts(shuffle([PROFESSIONS[0], ...wrong]));
  }

  function pick(p) {
    const correct = PROFESSIONS[qi];
    if (p.en === correct.en) {
      setScore(s => s + 1);
      setFeedback('correct');
      onXP && onXP(15);
      onToast && onToast(`+15 XP · ${correct.kn} = ${correct.en} 🎯`, 'xp');
    } else {
      setFeedback('wrong');
    }
    setTimeout(() => {
      const next = qi + 1;
      if (next >= PROFESSIONS.length) {
        setMode('done');
        return;
      }
      setQi(next);
      const wrong = shuffle(PROFESSIONS.filter((_, j) => j !== next)).slice(0, 3);
      setOpts(shuffle([PROFESSIONS[next], ...wrong]));
      setFeedback(null);
    }, 900);
  }

  return (
    <div className="learning-screen">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
        <h1 className="page-title">💼 ಉದ್ಯೋಗಗಳು · Professions</h1>
        {mode === 'learn' && <button className="btn-primary" onClick={startQuiz}>Quiz →</button>}
        {(mode === 'quiz' || mode === 'done') && <button className="btn-primary" onClick={() => setMode('learn')}>← Study</button>}
      </div>

      {mode === 'learn' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.85rem' }}>
          {PROFESSIONS.map(p => (
            <div key={p.en} className="glass-card" style={{ padding: '1.2rem 0.8rem', textAlign: 'center', cursor: 'pointer' }}
              onClick={() => speak(p.kn)}>
              <div style={{ fontSize: '2.8rem', marginBottom: '0.4rem' }}>{p.icon}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'Noto Sans Kannada, sans-serif' }}>{p.kn}</div>
              <div style={{ fontSize: '0.85rem', color: '#ffa366', fontWeight: 600, marginTop: 2 }}>{p.en}</div>
              <div style={{ fontSize: '0.72rem', opacity: 0.6, marginTop: 4 }}>{p.desc}</div>
            </div>
          ))}
        </div>
      )}

      {mode === 'quiz' && (
        <div className="glass-card" style={{ maxWidth: 420, margin: '2rem auto', padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.85rem', opacity: 0.6, marginBottom: '0.8rem' }}>Question {qi + 1} / {PROFESSIONS.length} · Score: {score}</div>
          <div style={{ fontSize: '4.5rem', margin: '0.5rem 0' }}>{PROFESSIONS[qi].icon}</div>
          <p style={{ fontWeight: 700, marginBottom: '1.2rem' }}>What is the Kannada word for <strong>{PROFESSIONS[qi].en}</strong>?</p>
          {feedback && (
            <div style={{
              padding: '0.4rem', borderRadius: 8, marginBottom: '0.8rem', fontWeight: 700,
              background: feedback === 'correct' ? 'rgba(72,199,116,0.2)' : 'rgba(253,92,99,0.2)',
              color: feedback === 'correct' ? '#48c774' : '#fd5c63'
            }}>
              {feedback === 'correct' ? '✅ Correct!' : `❌ ${PROFESSIONS[qi].kn}`}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
            {opts.map(o => (
              <button key={o.en} className="btn-primary" onClick={() => !feedback && pick(o)} style={{ fontFamily: 'Noto Sans Kannada, sans-serif', fontSize: '0.95rem' }}>
                {o.kn}
              </button>
            ))}
          </div>
        </div>
      )}

      {mode === 'done' && (
        <div className="glass-card" style={{ textAlign: 'center', padding: '2.5rem', maxWidth: 380, margin: '2rem auto' }}>
          <div style={{ fontSize: '3rem' }}>🏆</div>
          <h2>Well Done!</h2>
          <p>Score: <strong>{score} / {PROFESSIONS.length}</strong></p>
          <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={startQuiz}>Play Again</button>
        </div>
      )}
    </div>
  );
}
