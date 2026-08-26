import React, { useState } from 'react';

const HOME_ITEMS = [
  { kn: 'ಮನೆ', en: 'House / Home', icon: '🏠', roman: 'Mane' },
  { kn: 'ಬಾಗಿಲು', en: 'Door', icon: '🚪', roman: 'Baagilu' },
  { kn: 'ಕಿಟಕಿ', en: 'Window', icon: '🪟', roman: 'Kitaki' },
  { kn: 'ಕೋಣೆ', en: 'Room', icon: '🛋️', roman: 'Kone' },
  { kn: 'ಅಡುಗೆಮನೆ', en: 'Kitchen', icon: '🍳', roman: 'Adugemane' },
  { kn: 'ಮಲಗುವ ಕೋಣೆ', en: 'Bedroom', icon: '🛏️', roman: 'Malaguva Kone' },
  { kn: 'ಸ್ನಾನದ ಕೋಣೆ', en: 'Bathroom', icon: '🚿', roman: 'Snaanada Kone' },
  { kn: 'ಮೇಜು', en: 'Table', icon: '🪑', roman: 'Meju' },
  { kn: 'ಕುರ್ಚಿ', en: 'Chair', icon: '🪑', roman: 'Kurchi' },
  { kn: 'ಹಾಸಿಗೆ', en: 'Bed / Mattress', icon: '🛌', roman: 'Haasige' },
  { kn: 'ದೀಪ', en: 'Lamp / Light', icon: '💡', roman: 'Deepa' },
  { kn: 'ಕನ್ನಡಿ', en: 'Mirror', icon: '🪞', roman: 'Kannadi' },
  { kn: 'ಗಡಿಯಾರ', en: 'Clock', icon: '⏰', roman: 'Gadiyaara' },
  { kn: 'ತೋಟ', en: 'Garden / Yard', icon: '🌳', roman: 'Thota' }
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

export default function HouseAndHome({ onXP, onToast }) {
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
    const wrong = shuffle(HOME_ITEMS.filter((_, j) => j !== 0)).slice(0, 3);
    setOpts(shuffle([HOME_ITEMS[0], ...wrong]));
  }

  function pick(item) {
    const correct = HOME_ITEMS[qi];
    if (item.en === correct.en) {
      setScore(s => s + 1);
      setFeedback('correct');
      onXP && onXP(10);
      onToast && onToast(`+10 XP · ${correct.kn} = ${correct.en} 🏡`, 'xp');
    } else {
      setFeedback('wrong');
    }
    setTimeout(() => {
      const next = qi + 1;
      if (next >= HOME_ITEMS.length) {
        setMode('done');
        return;
      }
      setQi(next);
      const wrong = shuffle(HOME_ITEMS.filter((_, j) => j !== next)).slice(0, 3);
      setOpts(shuffle([HOME_ITEMS[next], ...wrong]));
      setFeedback(null);
    }, 900);
  }

  return (
    <div className="learning-screen">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
        <h1 className="page-title">🏡 ಮನೆ ಮತ್ತು ವಸ್ತುಗಳು · House & Home</h1>
        {mode === 'learn' && <button className="btn-primary" onClick={startQuiz}>Quiz →</button>}
        {(mode === 'quiz' || mode === 'done') && <button className="btn-primary" onClick={() => setMode('learn')}>← Study</button>}
      </div>

      {mode === 'learn' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.85rem' }}>
          {HOME_ITEMS.map(h => (
            <div key={h.en} className="glass-card" style={{ textAlign: 'center', padding: '1.2rem 0.6rem', cursor: 'pointer' }}
              onClick={() => speak(h.kn)}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.3rem' }}>{h.icon}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'Noto Sans Kannada, sans-serif' }}>{h.kn}</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: 2 }}>{h.en}</div>
              <div style={{ fontSize: '0.68rem', opacity: 0.45, marginTop: 2 }}>{h.roman}</div>
            </div>
          ))}
        </div>
      )}

      {mode === 'quiz' && (
        <div className="glass-card" style={{ maxWidth: 400, margin: '2rem auto', padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.82rem', opacity: 0.6, marginBottom: '0.8rem' }}>Question {qi + 1} / {HOME_ITEMS.length} · Score: {score}</div>
          <div style={{ fontSize: '4.5rem', margin: '0.5rem 0' }}>{HOME_ITEMS[qi].icon}</div>
          <p style={{ fontWeight: 700, marginBottom: '1.2rem' }}>What is this in Kannada?</p>
          {feedback && (
            <div style={{
              padding: '0.4rem', borderRadius: 8, marginBottom: '0.8rem', fontWeight: 700,
              background: feedback === 'correct' ? 'rgba(72,199,116,0.2)' : 'rgba(253,92,99,0.2)',
              color: feedback === 'correct' ? '#48c774' : '#fd5c63'
            }}>
              {feedback === 'correct' ? '✅ Correct!' : `❌ ${HOME_ITEMS[qi].kn}`}
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
          <h2>Score: {score} / {HOME_ITEMS.length}</h2>
          <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={startQuiz}>Play Again</button>
        </div>
      )}
    </div>
  );
}
