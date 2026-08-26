import React, { useState } from 'react';

const UTENSILS = [
  { kn: 'ತಟ್ಟೆ / ತಟ್ಟೆಗಳು', en: 'Plate', icon: '🍽️', desc: 'ಊಟ ಮಾಡುವ ಪಾತ್ರೆ' },
  { kn: 'ಲೋಟ', en: 'Glass / Tumbler', icon: '🥛', desc: 'ನೀರು ಅಥವಾ ಕಾಫಿ ಕುಡಿಯುವ ಪಾತ್ರೆ' },
  { kn: 'ಚಮಚ', en: 'Spoon', icon: '🥄', desc: 'ಊಟ ತಿನ್ನಲು ಬಳಸುವ ಸಾಧನ' },
  { kn: 'ಬಟ್ಟಲು / ಬೌಲ್', en: 'Bowl', icon: '🥣', desc: 'ಸಾಂಬಾರ್ ಅಥವಾ ಮೊಸರು ಹಾಕುವ ಬಟ್ಟಲು' },
  { kn: 'ಚಾಕು / ಕತ್ತಿ', en: 'Knife', icon: '🔪', desc: 'ತರಕಾರಿ ಕತ್ತರಿಸುವ ಚಾಕು' },
  { kn: 'ಬಾಣಲೆ', en: 'Frying Pan / Wok', icon: '🍳', desc: 'ಹುರಿಯಲು ಮತ್ತು ಒಗ್ಗರಣೆ ಹಾಕಲು' },
  { kn: 'ಕುಕ್ಕರ್', en: 'Pressure Cooker', icon: '🍲', desc: 'ಅನ್ನ ಮತ್ತು ಬೇಳೆ ಬೇಯಿಸಲು' },
  { kn: 'ಹಂಚು', en: 'Tawa / Griddle', icon: '🥞', desc: 'ದೋಸೆ ಮತ್ತು ರೊಟ್ಟಿ ಸುಡಲು' },
  { kn: 'ಪಾತ್ರೆ', en: 'Pot / Vessel', icon: '🫕', desc: 'ಅಡುಗೆ ಮಾಡುವ ದೊಡ್ಡ ಪಾತ್ರೆ' },
  { kn: 'ಕೊಳಗ / ಜಗ್ಗು', en: 'Jug / Pitcher', icon: '🫖', desc: 'ನೀರು ಶೇಖರಿಸುವ ಜಗ್' },
  { kn: 'ಕತ್ತರಿಸುವ ಮಣೆ', en: 'Cutting Board', icon: '🪵', desc: 'ತರಕಾರಿ ಕೊಯ್ಯುವ ಮಣೆ' },
  { kn: 'ಕೈಚೀಲ / ಚಹಾ ಜರಡಿ', en: 'Tea Strainer', icon: '🍵', desc: 'ಚಹಾ ಅಥವಾ ಕಾಫಿ ಸೋಸಲು' }
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

export default function KitchenUtensils({ onXP, onToast }) {
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
    const wrong = shuffle(UTENSILS.filter((_, j) => j !== 0)).slice(0, 3);
    setOpts(shuffle([UTENSILS[0], ...wrong]));
  }

  function pick(u) {
    const correct = UTENSILS[qi];
    if (u.en === correct.en) {
      setScore(sc => sc + 1);
      setFeedback('correct');
      onXP && onXP(10);
      onToast && onToast(`+10 XP · ${correct.kn} 🍳`, 'xp');
    } else {
      setFeedback('wrong');
    }
    setTimeout(() => {
      const next = qi + 1;
      if (next >= UTENSILS.length) {
        setMode('done');
        return;
      }
      setQi(next);
      const wrong = shuffle(UTENSILS.filter((_, j) => j !== next)).slice(0, 3);
      setOpts(shuffle([UTENSILS[next], ...wrong]));
      setFeedback(null);
    }, 900);
  }

  return (
    <div className="learning-screen">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
        <h1 className="page-title">🍳 ಅಡುಗೆ ಪಾತ್ರೆಗಳು · Kitchen Utensils</h1>
        {mode === 'learn' && <button className="btn-primary" onClick={startQuiz}>Quiz →</button>}
        {(mode === 'quiz' || mode === 'done') && <button className="btn-primary" onClick={() => setMode('learn')}>← Study</button>}
      </div>

      {mode === 'learn' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.85rem' }}>
          {UTENSILS.map(u => (
            <div key={u.en} className="glass-card" style={{ textAlign: 'center', padding: '1.2rem 0.6rem', cursor: 'pointer' }}
              onClick={() => speak(u.kn)}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.3rem' }}>{u.icon}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'Noto Sans Kannada, sans-serif' }}>{u.kn}</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: 2 }}>{u.en}</div>
              <div style={{ fontSize: '0.68rem', opacity: 0.5, marginTop: 4 }}>{u.desc}</div>
            </div>
          ))}
        </div>
      )}

      {mode === 'quiz' && (
        <div className="glass-card" style={{ maxWidth: 400, margin: '2rem auto', padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.82rem', opacity: 0.6, marginBottom: '0.8rem' }}>Question {qi + 1} / {UTENSILS.length} · Score: {score}</div>
          <div style={{ fontSize: '4.5rem', margin: '0.5rem 0' }}>{UTENSILS[qi].icon}</div>
          <p style={{ fontWeight: 700, marginBottom: '1.2rem' }}>What utensil is this in Kannada?</p>
          {feedback && (
            <div style={{
              padding: '0.4rem', borderRadius: 8, marginBottom: '0.8rem', fontWeight: 700,
              background: feedback === 'correct' ? 'rgba(72,199,116,0.2)' : 'rgba(253,92,99,0.2)',
              color: feedback === 'correct' ? '#48c774' : '#fd5c63'
            }}>
              {feedback === 'correct' ? '✅ Correct!' : `❌ ${UTENSILS[qi].kn}`}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
            {opts.map(o => (
              <button key={o.en} className="btn-primary" onClick={() => !feedback && pick(o)} style={{ fontFamily: 'Noto Sans Kannada, sans-serif' }}>
                {o.kn}
              </button>
            ))}
          </div>
        </div>
      )}

      {mode === 'done' && (
        <div className="glass-card" style={{ textAlign: 'center', padding: '2.5rem', maxWidth: 380, margin: '2rem auto' }}>
          <div style={{ fontSize: '3rem' }}>🏆</div>
          <h2>Score: {score} / {UTENSILS.length}</h2>
          <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={startQuiz}>Play Again</button>
        </div>
      )}
    </div>
  );
}
