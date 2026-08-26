import React, { useState } from 'react';

const BOARDS = [
  {
    type: '🚌 BMTC Bus Destination Board',
    boardTextKn: 'ಮೆಜೆಸ್ಟಿಕ್ - ಕೆಂಪೇಗೌಡ ಬಸ್ ನಿಲ್ದಾಣ',
    boardImageMock: '🚌 [ ಮೆಜೆಸ್ಟಿಕ್ ] ➔ [ ಎಲೆಕ್ಟ್ರಾನಿಕ್ ಸಿಟಿ ]',
    question: 'Where is this BMTC bus heading?',
    options: ['Majestic / Kempegowda Station', 'Whitefield', 'Kengeri', 'Yelahanka'],
    correct: 0
  },
  {
    type: '☕ Darshini Restaurant Menu',
    boardTextKn: 'ಬಿಸಿ ಬೇಳೆ ಬಾತ್ ಮತ್ತು ತುಪ್ಪ',
    boardImageMock: '🍽️ [ ಬಿಸಿ ಬೇಳೆ ಬಾತ್ ] - ₹೪೫',
    question: 'What dish is listed on this hotel board?',
    options: ['Bisi Bele Bath with Ghee', 'Curd Rice', 'Masala Dosa', 'Idli Vada'],
    correct: 0
  },
  {
    type: '🛑 Karnataka Traffic Signboard',
    boardTextKn: 'ನಿಧಾನವಾಗಿ ಚಲಿಸಿ - ಶಾಲೆ ಮುಂಭಾಗದಲ್ಲಿದೆ',
    boardImageMock: '🚸 [ ನಿಧಾನವಾಗಿ ಚಲಿಸಿ - ಶಾಲೆ ಇದೆ ]',
    question: 'What does this traffic warning sign say?',
    options: ['Go Slow - School Ahead', 'No Parking', 'Speed Limit 80', 'One Way Ahead'],
    correct: 0
  }
];

export default function SignboardDecoder({ onXP, onToast }) {
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);

  const cur = BOARDS[index];

  function speak(text) {
    if (!window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'kn-IN';
    u.rate = 0.85;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  function handlePick(optIdx) {
    const isCorrect = optIdx === cur.correct;
    if (isCorrect) {
      setScore(s => s + 1);
      setFeedback('correct');
      onXP && onXP(15);
      onToast && onToast('🎯 Signboard Decoded! +15 XP', 'xp');
    } else {
      setFeedback('wrong');
    }

    setTimeout(() => {
      setFeedback(null);
      setIndex(i => (i + 1) % BOARDS.length);
    }, 1200);
  }

  return (
    <div className="learning-screen">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
        <h1 className="page-title">🚏 ಫಲಕ ವಾಚಕ · Signboard Decoder</h1>
        <span style={{ color: '#ffa366', fontWeight: 800 }}>Score: {score}</span>
      </div>

      <div className="glass-card" style={{ maxWidth: 600, margin: '0 auto', padding: '2rem' }}>
        <div style={{ fontSize: '0.85rem', color: '#ffa366', fontWeight: 800, marginBottom: '0.6rem' }}>{cur.type}</div>

        {/* Mock Signboard Display */}
        <div style={{
          padding: '2rem 1.5rem',
          background: 'linear-gradient(135deg, #1e293b, #0f172a)',
          border: '3px solid #f59e0b',
          borderRadius: '14px',
          textAlign: 'center',
          marginBottom: '1.5rem',
          boxShadow: '0 8px 25px rgba(245, 158, 11, 0.2)'
        }}>
          <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem', opacity: 0.8 }}>{cur.boardImageMock}</div>
          <div style={{ fontFamily: 'Noto Sans Kannada, sans-serif', fontSize: '1.6rem', fontWeight: 900, color: '#fef08a' }}>
            {cur.boardTextKn}
          </div>
          <button onClick={() => speak(cur.boardTextKn)} style={{ marginTop: '0.8rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '8px', cursor: 'pointer' }}>
            🔊 Listen
          </button>
        </div>

        <p style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '1rem', textAlign: 'center' }}>
          {cur.question}
        </p>

        {feedback && (
          <div style={{
            padding: '0.6rem',
            borderRadius: '8px',
            textAlign: 'center',
            marginBottom: '1rem',
            fontWeight: 800,
            background: feedback === 'correct' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(248, 113, 113, 0.2)',
            color: feedback === 'correct' ? '#4ade80' : '#f87171'
          }}>
            {feedback === 'correct' ? '✅ Correct Translation!' : '❌ Try again!'}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
          {cur.options.map((opt, idx) => (
            <button
              key={idx}
              className="btn-primary"
              onClick={() => handlePick(idx)}
              style={{ padding: '0.9rem', fontSize: '0.95rem' }}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
