import React, { useState, useEffect } from 'react';

const TRIVIA_QUESTIONS = [
  {
    qKn: 'ಕರ್ನಾಟಕದ ರಾಜ್ಯ ಪ್ರಾಣಿ ಯಾವುದು?',
    qEn: 'What is the state animal of Karnataka?',
    options: ['ಆನೆ (Elephant)', 'ಹುಲಿ (Tiger)', 'ಸಿಂಹ (Lion)', 'ಜಿಂಕೆ (Deer)'],
    correct: 0
  },
  {
    qKn: '"ಕನ್ನಡ" ಭಾಷೆಗೆ ಸಿಕ್ಕಿದ ಜ್ಞಾನಪೀಠ ಪ್ರಶಸ್ತಿಗಳ ಸಂಖ್ಯೆ ಎಷ್ಟು?',
    qEn: 'How many Jnanpith awards has Kannada received?',
    options: ['೮ (8)', '೬ (6)', '೭ (7)', '೯ (9)'],
    correct: 0
  },
  {
    qKn: 'ಮೈಸೂರು ದಸರಾ ಉತ್ಸವದ ಮುಖ್ಯ ಆಕರ್ಷಣೆ ಯಾವುದು?',
    qEn: 'What is the main attraction of Mysore Dasara?',
    options: ['ಜಂಬೂ ಸವಾರಿ (Jamboo Savari)', 'ದೋಣಿ ಸ್ಪರ್ಧೆ (Boat Race)', 'ಕಂಬಳ (Kambala)', 'ಬುಲ್ ಫೈಟ್ (Bull Fight)'],
    correct: 0
  },
  {
    qKn: 'ಕವಿರಾಜಮಾರ್ಗ ಕೃತಿಯನ್ನು ರಚಿಸಿದವರು ಯಾರು?',
    qEn: 'Who authored Kavirajamarga?',
    options: ['ಶ್ರೀವಿಜಯ / ಅಮೋಘವರ್ಷ', 'ಪಂಪ', 'ರನ್ನ', 'ಕುಮಾರವ್ಯಾಸ'],
    correct: 0
  }
];

export default function TriviaDuel({ onXP, onToast }) {
  const [qIndex, setQIndex] = useState(0);
  const [userScore, setUserScore] = useState(0);
  const [botScore, setBotScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [matchDone, setMatchDone] = useState(false);
  const [selectedOpt, setSelectedOpt] = useState(null);

  const curQ = TRIVIA_QUESTIONS[qIndex];

  useEffect(() => {
    if (matchDone || selectedOpt !== null) return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          handleAnswer(-1); // Timeout
          return 10;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [qIndex, matchDone, selectedOpt]);

  function handleAnswer(idx) {
    setSelectedOpt(idx);
    const isCorrect = idx === curQ.correct;

    if (isCorrect) {
      setUserScore(s => s + (timeLeft * 10));
      onXP && onXP(20);
      onToast && onToast('🎯 Speed correct! +20 XP', 'xp');
    }

    // Bot logic: 75% chance correct
    const botCorrect = Math.random() < 0.75;
    if (botCorrect) {
      setBotScore(s => s + Math.floor(Math.random() * 50) + 40);
    }

    setTimeout(() => {
      setSelectedOpt(null);
      setTimeLeft(10);
      if (qIndex + 1 < TRIVIA_QUESTIONS.length) {
        setQIndex(i => i + 1);
      } else {
        setMatchDone(true);
      }
    }, 1500);
  }

  function restart() {
    setQIndex(0);
    setUserScore(0);
    setBotScore(0);
    setTimeLeft(10);
    setMatchDone(false);
    setSelectedOpt(null);
  }

  return (
    <div className="learning-screen">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
        <h1 className="page-title">⚔️ ರಣರಂಗ · Multiplayer Trivia Duel</h1>
        <span style={{ color: '#ffa366', fontWeight: 800 }}>⚡ 1v1 Arena</span>
      </div>

      <div className="glass-card" style={{ maxWidth: 640, margin: '0 auto', padding: '1.8rem' }}>
        {/* Match Header / Live Scoreboard */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '14px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem' }}>🤠</div>
            <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>You</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#38ef7d' }}>{userScore}</div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: timeLeft <= 3 ? '#ff416c' : '#ffa366' }}>
              ⏱️ {timeLeft}s
            </div>
            <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>Q {qIndex + 1}/{TRIVIA_QUESTIONS.length}</div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem' }}>🤖</div>
            <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>Challenger Bot</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ff6b35' }}>{botScore}</div>
          </div>
        </div>

        {!matchDone ? (
          <div>
            {/* Question Box */}
            <div style={{ padding: '1.4rem', background: 'rgba(255,255,255,0.06)', borderRadius: '14px', marginBottom: '1.2rem', textAlign: 'center' }}>
              <div style={{ fontFamily: 'Noto Sans Kannada, sans-serif', fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.4rem', color: '#ffedd5' }}>
                {curQ.qKn}
              </div>
              <div style={{ fontSize: '0.85rem', opacity: 0.75 }}>
                {curQ.qEn}
              </div>
            </div>

            {/* Options */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              {curQ.options.map((opt, i) => {
                let btnBg = 'rgba(255,255,255,0.06)';
                if (selectedOpt !== null) {
                  if (i === curQ.correct) btnBg = 'rgba(74, 222, 128, 0.35)';
                  else if (i === selectedOpt) btnBg = 'rgba(248, 113, 113, 0.35)';
                }
                return (
                  <button
                    key={i}
                    className="btn-primary"
                    onClick={() => selectedOpt === null && handleAnswer(i)}
                    style={{
                      background: btnBg,
                      padding: '1rem',
                      fontFamily: 'Noto Sans Kannada, sans-serif',
                      fontSize: '0.95rem',
                      fontWeight: 700
                    }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>
              {userScore >= botScore ? '🏆👑' : '🥈💪'}
            </div>
            <h2>{userScore >= botScore ? 'ವಿಜಯಶಾಲಿ! (Victory!)' : 'ಉತ್ತಮ ಸ್ಪರ್ಧೆ! (Good Match!)'}</h2>
            <p style={{ opacity: 0.8, margin: '0.8rem 0 1.5rem' }}>
              Your Score: <strong>{userScore}</strong> vs Bot: <strong>{botScore}</strong>
            </p>
            <button className="btn-primary" onClick={restart} style={{ padding: '0.8rem 2rem' }}>
              Rematch ⚔️
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
