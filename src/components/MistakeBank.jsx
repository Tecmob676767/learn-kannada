import React, { useState } from 'react';

const COMMON_MISTAKES = [
  {
    mistakeKn: 'ತಾಯಿ (Dental Tha)',
    commonError: 'Confusing with retroflex "ಟಾಯಿ"',
    remedy: 'Always touch upper front teeth with tongue tip, do not curl back.',
    exampleKn: 'ನನ್ನ ತಾಯಿ ನನಗೆ ಪ್ರೀತಿಯಿಂದ ಊಟ ಬಡಿಸಿದರು.'
  },
  {
    mistakeKn: 'ಹಾಲು vs ಹಣ್ಣು',
    commonError: 'Confusing Milk (ಹಾಲು) with Fruit (ಹಣ್ಣು)',
    remedy: '"ಹಾಲು" ends with ಲ (L), "ಹಣ್ಣು" has ಣ್ಣ (Nna).',
    exampleKn: 'ಬೆಳಗ್ಗೆ ಬಿಸಿ ಹಾಲು ಕುಡಿಯಿರಿ.'
  },
  {
    mistakeKn: 'ಹೋಗುತ್ತೇನೆ vs ಬರುತ್ತೇನೆ',
    commonError: 'Going (I go) vs Coming (I come)',
    remedy: 'ಹೋಗು = Go / Depart. ಬರು = Come / Arrive.',
    exampleKn: 'ನಾನು ಶಾಲೆಗೆ ಹೋಗುತ್ತೇನೆ, ಸಂಜೆ ಮನೆಗೆ ಬರುತ್ತೇನೆ.'
  }
];

export default function MistakeBank({ onXP, onToast }) {
  const [fixedList, setFixedList] = useState({});

  function speak(text) {
    if (!window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'kn-IN';
    u.rate = 0.85;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  function handleFix(idx) {
    setFixedList(f => ({ ...f, [idx]: true }));
    onXP && onXP(20);
    onToast && onToast('🎯 Weak concept mastered! +20 XP', 'xp');
  }

  return (
    <div className="learning-screen">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
        <h1 className="page-title">🧠 ತಪ್ಪುಗಳ ತಿದ್ದುವಿಕೆ · Mistake Bank</h1>
        <span style={{ color: '#38ef7d', fontWeight: 800 }}>Remedial Drills</span>
      </div>

      <div className="glass-card" style={{ maxWidth: 640, margin: '0 auto', padding: '1.8rem' }}>
        <div style={{ padding: '1rem', background: 'rgba(255,163,102,0.1)', border: '1px solid rgba(255,163,102,0.3)', borderRadius: '12px', marginBottom: '1.5rem' }}>
          <div style={{ fontWeight: 800, color: '#ffa366', fontSize: '0.95rem', marginBottom: '0.2rem' }}>
            💡 Smart Retention Engine
          </div>
          <div style={{ fontSize: '0.8rem', opacity: 0.85 }}>
            Concepts you previously struggled with in quizzes are gathered here for targeted practice until perfected.
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {COMMON_MISTAKES.map((m, idx) => {
            const isFixed = fixedList[idx];
            return (
              <div key={idx} style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontFamily: 'Noto Sans Kannada, sans-serif', fontSize: '1.3rem', fontWeight: 900, color: '#ffedd5' }}>
                    {m.mistakeKn}
                  </span>
                  <button onClick={() => speak(m.mistakeKn)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>
                    🔊
                  </button>
                </div>

                <div style={{ fontSize: '0.82rem', color: '#f87171', marginBottom: '0.3rem' }}>
                  ⚠️ Common Error: {m.commonError}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#4ade80', marginBottom: '0.8rem' }}>
                  ✅ Fix Rule: {m.remedy}
                </div>

                <div style={{ padding: '0.6rem 0.8rem', background: 'rgba(0,0,0,0.25)', borderRadius: '8px', marginBottom: '0.8rem', fontSize: '0.9rem', fontFamily: 'Noto Sans Kannada, sans-serif' }}>
                  "{m.exampleKn}"
                </div>

                <button
                  className="btn-primary"
                  onClick={() => handleFix(idx)}
                  disabled={isFixed}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    background: isFixed ? 'rgba(74, 222, 128, 0.2)' : undefined,
                    border: isFixed ? '1px solid #4ade80' : undefined,
                    color: isFixed ? '#4ade80' : undefined
                  }}
                >
                  {isFixed ? '✅ Mastered & Cleared!' : '🎯 Practice & Mark as Mastered (+20 XP)'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
