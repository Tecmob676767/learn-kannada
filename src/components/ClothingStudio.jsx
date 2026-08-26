import React, { useState } from 'react';

const CLOTHES = [
  { kn: 'ಸೀರೆ', en: 'Saree', icon: '🥻', desc: 'ಕರ್ನಾಟಕದ ಸಾಂಪ್ರದಾಯಿಕ ಉಡುಗೆ' },
  { kn: 'ಪಂಜೆ / ಧೋತಿ', en: 'Panche / Dhoti', icon: '👘', desc: 'ಪುರುಷರ ಸಾಂಪ್ರದಾಯಿಕ ಉಡುಪು' },
  { kn: 'ಶರ್ಟ್ / ಅಂಗಿ', en: 'Shirt', icon: '👔', desc: 'ಮೇಲಂಗಿ' },
  { kn: 'ಪ್ಯಾಂಟ್ / ಚಲ್ಲಣ', en: 'Pants / Trousers', icon: '👖', desc: 'ಕೆಳಭಾಗದ ಉಡುಪು' },
  { kn: 'ಕುರ್ತಾ', en: 'Kurta', icon: '🥼', desc: 'ಉದ್ದನೆಯ ಅಂಗಿ' },
  { kn: 'ಶಾಲು / ಶಲ್ಯ', en: 'Shawl', icon: '🧣', desc: 'ಹೆಗಲ ಮೇಲೆ ಹಾಕುವ ಶಾಲು' },
  { kn: 'ಟೋಪಿ', en: 'Cap / Hat', icon: '🧢', desc: 'ತಲೆಗೆ ಧರಿಸುವುದು' },
  { kn: 'ಪೇಟ', en: 'Mysore Peta (Turban)', icon: '👑', desc: 'ರಾಜ ವೈಭವದ ತಲೆಕಟ್ಟು' },
  { kn: 'ಚಪ್ಪಲಿ', en: 'Slippers / Sandals', icon: '🩴', desc: 'ಕಾಲಿನ ಪಾದರಕ್ಷೆ' },
  { kn: 'ಬೂಟು', en: 'Shoes', icon: '👞', desc: 'ಕಾಲು ಮುಚ್ಚುವ ಶೂ' },
  { kn: 'ಬಳೆಗಳು', en: 'Bangles', icon: '⭕', desc: 'ಕೈಗೆ ಹಾಕುವ ಆಭರಣ' },
  { kn: 'ಹಾರ / ಸರ', en: 'Necklace / Chain', icon: '📿', desc: 'ಕೊರಳಿನ ಆಭರಣ' }
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

export default function ClothingStudio({ onXP, onToast }) {
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
    const wrong = shuffle(CLOTHES.filter((_, j) => j !== 0)).slice(0, 3);
    setOpts(shuffle([CLOTHES[0], ...wrong]));
  }

  function pick(c) {
    const correct = CLOTHES[qi];
    if (c.en === correct.en) {
      setScore(sc => sc + 1);
      setFeedback('correct');
      onXP && onXP(10);
      onToast && onToast(`+10 XP · ${correct.kn} 🥻`, 'xp');
    } else {
      setFeedback('wrong');
    }
    setTimeout(() => {
      const next = qi + 1;
      if (next >= CLOTHES.length) {
        setMode('done');
        return;
      }
      setQi(next);
      const wrong = shuffle(CLOTHES.filter((_, j) => j !== next)).slice(0, 3);
      setOpts(shuffle([CLOTHES[next], ...wrong]));
      setFeedback(null);
    }, 900);
  }

  return (
    <div className="learning-screen">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
        <h1 className="page-title">🥻 ಉಡುಪುಗಳು · Clothes & Attire</h1>
        {mode === 'learn' && <button className="btn-primary" onClick={startQuiz}>Quiz →</button>}
        {(mode === 'quiz' || mode === 'done') && <button className="btn-primary" onClick={() => setMode('learn')}>← Study</button>}
      </div>

      {mode === 'learn' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.85rem' }}>
          {CLOTHES.map(c => (
            <div key={c.en} className="glass-card" style={{ textAlign: 'center', padding: '1.2rem 0.6rem', cursor: 'pointer' }}
              onClick={() => speak(c.kn)}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.3rem' }}>{c.icon}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'Noto Sans Kannada, sans-serif' }}>{c.kn}</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: 2 }}>{c.en}</div>
              <div style={{ fontSize: '0.68rem', opacity: 0.5, marginTop: 4 }}>{c.desc}</div>
            </div>
          ))}
        </div>
      )}

      {mode === 'quiz' && (
        <div className="glass-card" style={{ maxWidth: 400, margin: '2rem auto', padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.82rem', opacity: 0.6, marginBottom: '0.8rem' }}>Question {qi + 1} / {CLOTHES.length} · Score: {score}</div>
          <div style={{ fontSize: '4.5rem', margin: '0.5rem 0' }}>{CLOTHES[qi].icon}</div>
          <p style={{ fontWeight: 700, marginBottom: '1.2rem' }}>What is this attire in Kannada?</p>
          {feedback && (
            <div style={{
              padding: '0.4rem', borderRadius: 8, marginBottom: '0.8rem', fontWeight: 700,
              background: feedback === 'correct' ? 'rgba(72,199,116,0.2)' : 'rgba(253,92,99,0.2)',
              color: feedback === 'correct' ? '#48c774' : '#fd5c63'
            }}>
              {feedback === 'correct' ? '✅ Correct!' : `❌ ${CLOTHES[qi].kn}`}
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
          <h2>Score: {score} / {CLOTHES.length}</h2>
          <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={startQuiz}>Play Again</button>
        </div>
      )}
    </div>
  );
}
