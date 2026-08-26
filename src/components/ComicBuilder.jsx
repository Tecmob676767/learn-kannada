import React, { useState } from 'react';

const COMIC_TEMPLATES = [
  {
    title: 'ದರ್ಶಿನಿ ಹೋಟೆಲ್ ಸಂಭಾಷಣೆ (Darshini Coffee Moment)',
    panels: [
      { character: '🧔 Customer', options: ['ಒಂದು ಮಸಾಲೆ ದೋಸೆ ಕೊಡಿ!', 'ಇಲ್ಲಿ ಮೆಟ್ರೋ ಎಲ್ಲಿದೆ?', 'ಮನೆಗೆ ಹೋಗ್ತೀನಿ.'], correct: 0 },
      { character: '👨‍🍳 Chef / Waiter', options: ['ಬಿಸಿ ಬಿಸಿ ಕಾಫಿ ಜೊತೆಗೆ ಸಾಂಬಾರ್ ತರ್ತೀನಿ!', 'ಕಾರು ನಿಲ್ಲಿಸಬೇಡಿ.', 'ಮಳೆ ಬರ್ತಿದೆ.'], correct: 0 },
      { character: '🧔 Customer', options: ['ತುಂಬಾ ರುಚಿಯಾಗಿದೆ, ಧನ್ಯವಾದಗಳು!', 'ನನಗೆ ಗೊತ್ತಿಲ್ಲ.', 'ಸುಮ್ಮನಿರಿ.'], correct: 0 }
    ]
  }
];

export default function ComicBuilder({ onXP, onToast }) {
  const [selectedChoices, setSelectedChoices] = useState({});
  const [completed, setCompleted] = useState(false);

  const comic = COMIC_TEMPLATES[0];

  function speak(text) {
    if (!window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'kn-IN';
    u.rate = 0.85;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  function handleSelect(panelIdx, optIdx) {
    const updated = { ...selectedChoices, [panelIdx]: optIdx };
    setSelectedChoices(updated);

    if (Object.keys(updated).length === comic.panels.length) {
      setCompleted(true);
      onXP && onXP(30);
      onToast && onToast('🎨 Comic Strip Story Created! +30 XP', 'xp');
    }
  }

  return (
    <div className="learning-screen">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
        <h1 className="page-title">💬 ಕಾಮಿಕ್ಸ್ ರಚನೆ · Comic Strip Builder</h1>
        <span style={{ color: '#ffa366', fontWeight: 800 }}>Story Studio</span>
      </div>

      <div className="glass-card" style={{ maxWidth: 640, margin: '0 auto', padding: '1.8rem' }}>
        <h3 style={{ color: '#ffa366', marginBottom: '1.2rem', textAlign: 'center' }}>{comic.title}</h3>

        {/* 3 Comic Panels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {comic.panels.map((panel, idx) => {
            const chosen = selectedChoices[idx];
            return (
              <div key={idx} style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '1rem', color: '#ffedd5' }}>Panel {idx + 1}: {panel.character}</span>
                  {chosen !== undefined && (
                    <button onClick={() => speak(panel.options[chosen])} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}>
                      🔊
                    </button>
                  )}
                </div>

                {/* Speech Bubble Box */}
                <div style={{
                  padding: '1rem',
                  background: chosen !== undefined ? 'rgba(74, 222, 128, 0.15)' : 'rgba(0,0,0,0.3)',
                  borderRadius: '12px',
                  marginBottom: '0.8rem',
                  border: chosen !== undefined ? '1px solid #4ade80' : '1px dashed rgba(255,255,255,0.2)',
                  textAlign: 'center'
                }}>
                  {chosen !== undefined ? (
                    <div style={{ fontFamily: 'Noto Sans Kannada, sans-serif', fontSize: '1.15rem', fontWeight: 800, color: '#4ade80' }}>
                      💭 "{panel.options[chosen]}"
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.82rem', opacity: 0.5 }}>Select dialogue for speech bubble...</div>
                  )}
                </div>

                {/* Choice Options */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.4rem' }}>
                  {panel.options.map((opt, optIdx) => (
                    <button
                      key={optIdx}
                      className="btn-primary"
                      onClick={() => handleSelect(idx, optIdx)}
                      style={{
                        padding: '0.6rem 0.8rem',
                        fontSize: '0.88rem',
                        fontFamily: 'Noto Sans Kannada, sans-serif',
                        background: chosen === optIdx ? 'rgba(255,163,102,0.3)' : 'rgba(255,255,255,0.06)',
                        border: chosen === optIdx ? '1px solid #ffa366' : '1px solid rgba(255,255,255,0.1)'
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
