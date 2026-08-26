import React, { useState } from 'react';

const VEHICLES = [
  { kn: 'ಕಾರು', en: 'Car', icon: '🚗', roman: 'Kaaru' },
  { kn: 'ಬಸ್ಸು', en: 'Bus', icon: '🚌', roman: 'Bassu' },
  { kn: 'ಆಟೋ', en: 'Auto Rickshaw', icon: '🛺', roman: 'Auto' },
  { kn: 'ರೈಲು', en: 'Train', icon: '🚆', roman: 'Railu' },
  { kn: 'ವಿಮಾನ', en: 'Airplane', icon: '✈️', roman: 'Vimaana' },
  { kn: 'ದೋಣಿ / ಹಡಗು', en: 'Boat / Ship', icon: '🚢', roman: 'Doni / Hadagu' },
  { kn: 'ದ್ವಿಚಕ್ರ ವಾಹನ / ಬೈಕ್', en: 'Motorcycle / Bike', icon: '🏍️', roman: 'Bike' },
  { kn: 'ಸೈಕಲ್', en: 'Bicycle', icon: '🚲', roman: 'Cycle' },
  { kn: 'ರಸ್ತೆ', en: 'Road', icon: '🛣️', roman: 'Raste' },
  { kn: 'ನಿಲ್ದಾಣ', en: 'Station / Stop', icon: '🚏', roman: 'Nildaana' },
  { kn: 'ವಿಮಾನ ನಿಲ್ದಾಣ', en: 'Airport', icon: '🛫', roman: 'Vimaana Nildaana' },
  { kn: 'ಟಿಕೆಟ್', en: 'Ticket', icon: '🎫', roman: 'Ticket' }
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

export default function VehicleTransport({ onXP, onToast }) {
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
    const wrong = shuffle(VEHICLES.filter((_, j) => j !== 0)).slice(0, 3);
    setOpts(shuffle([VEHICLES[0], ...wrong]));
  }

  function pick(v) {
    const correct = VEHICLES[qi];
    if (v.en === correct.en) {
      setScore(s => s + 1);
      setFeedback('correct');
      onXP && onXP(10);
      onToast && onToast(`+10 XP · ${correct.kn} 🛺`, 'xp');
    } else {
      setFeedback('wrong');
    }
    setTimeout(() => {
      const next = qi + 1;
      if (next >= VEHICLES.length) {
        setMode('done');
        return;
      }
      setQi(next);
      const wrong = shuffle(VEHICLES.filter((_, j) => j !== next)).slice(0, 3);
      setOpts(shuffle([VEHICLES[next], ...wrong]));
      setFeedback(null);
    }, 900);
  }

  return (
    <div className="learning-screen">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
        <h1 className="page-title">🛺 ವಾಹನಗಳು · Vehicles & Transport</h1>
        {mode === 'learn' && <button className="btn-primary" onClick={startQuiz}>Quiz →</button>}
        {(mode === 'quiz' || mode === 'done') && <button className="btn-primary" onClick={() => setMode('learn')}>← Study</button>}
      </div>

      {mode === 'learn' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.85rem' }}>
          {VEHICLES.map(v => (
            <div key={v.en} className="glass-card" style={{ textAlign: 'center', padding: '1.2rem 0.6rem', cursor: 'pointer' }}
              onClick={() => speak(v.kn)}>
              <div style={{ fontSize: '2.6rem', marginBottom: '0.3rem' }}>{v.icon}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'Noto Sans Kannada, sans-serif' }}>{v.kn}</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: 2 }}>{v.en}</div>
              <div style={{ fontSize: '0.68rem', opacity: 0.45, marginTop: 2 }}>{v.roman}</div>
            </div>
          ))}
        </div>
      )}

      {mode === 'quiz' && (
        <div className="glass-card" style={{ maxWidth: 400, margin: '2rem auto', padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.82rem', opacity: 0.6, marginBottom: '0.8rem' }}>Question {qi + 1} / {VEHICLES.length} · Score: {score}</div>
          <div style={{ fontSize: '5rem', margin: '0.5rem 0' }}>{VEHICLES[qi].icon}</div>
          <p style={{ fontWeight: 700, marginBottom: '1.2rem' }}>Kannada for: <strong>{VEHICLES[qi].en}</strong>?</p>
          {feedback && (
            <div style={{
              padding: '0.4rem', borderRadius: 8, marginBottom: '0.8rem', fontWeight: 700,
              background: feedback === 'correct' ? 'rgba(72,199,116,0.2)' : 'rgba(253,92,99,0.2)',
              color: feedback === 'correct' ? '#48c774' : '#fd5c63'
            }}>
              {feedback === 'correct' ? '✅ Correct!' : `❌ ${VEHICLES[qi].kn}`}
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
          <h2>Score: {score} / {VEHICLES.length}</h2>
          <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={startQuiz}>Play Again</button>
        </div>
      )}
    </div>
  );
}
