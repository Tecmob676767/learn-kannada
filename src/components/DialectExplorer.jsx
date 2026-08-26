import React, { useState } from 'react';

const DIALECTS = [
  {
    region: 'North Karnataka (ಉತ್ತರ ಕರ್ನಾಟಕ / Hubballi-Dharwad)',
    icon: '🌾',
    comparisons: [
      { standardKn: 'ಹೇಗಿದ್ದೀರಾ? (How are you?)', dialectKn: 'ಆರಾಮ್ ಅದೀರೇನು ರೀ?', note: '"ಆರಾಮ್" and "ರೀ" are widely used.' },
      { standardKn: 'ಏನು ಮಾಡುತ್ತಿದ್ದೀರಿ? (What are you doing?)', dialectKn: 'ಏನ್ ಮಾಡಾಕತ್ತೀರಿ?', note: 'Continuous suffix "-ಆಕತ್ತೀರಿ" is unique to North Karnataka.' },
      { standardKn: 'ಬಹಳ ಚೆನ್ನಾಗಿದೆ (Very nice)', dialectKn: 'ಬರೇ ಚೊಲೋ ಅದ!', note: '"ಚೊಲೋ" means great/good.' }
    ]
  },
  {
    region: 'Coastal Kundapura / Mangaluru (ಕರಾವಳಿ ಕನ್ನಡ)',
    icon: '🌊',
    comparisons: [
      { standardKn: 'ಎಲ್ಲಿಗೆ ಹೋಗುತ್ತಿದ್ದೀರಿ? (Where are you going?)', dialectKn: 'ಎಲ್ಲಿಗೆ ಪೋಪುದು ಮಾರಾಯ್ರೆ?', note: '"ಮಾರಾಯ್ರೆ" is an iconic affectionate coastal address.' },
      { standardKn: 'ಊಟ ಆಯ್ತಾ? (Had food?)', dialectKn: 'ಊಟ ಆಂಡಾ?', note: 'Tulu-influenced succinct verb endings.' }
    ]
  },
  {
    region: 'Old Mysuru / Bengaluru (ಹಳೆ ಮೈಸೂರು)',
    icon: '👑',
    comparisons: [
      { standardKn: 'ಬನ್ನಿ ಕುಳಿತುಕೊಳ್ಳಿ (Come and sit)', dialectKn: 'ಬನ್ನಿ ಕೂತ್ಕೊಳ್ಳಿ ಸ್ವಾಮಿ!', note: 'Polite and royal respectful tones.' },
      { standardKn: 'ಬೇಗ ಬನ್ನಿ (Come fast)', dialectKn: 'ಸ್ವಲ್ಪ ಜಲ್ದಿ ಬನ್ನಿ ಗುರೂ!', note: '"ಗುರೂ" is signature Bengaluru street bonding slang.' }
    ]
  }
];

export default function DialectExplorer({ onXP, onToast }) {
  const [selectedDialect, setSelectedDialect] = useState(0);

  const cur = DIALECTS[selectedDialect];

  function speak(text) {
    if (!window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'kn-IN';
    u.rate = 0.85;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
    onXP && onXP(10);
    onToast && onToast('Dialect speech drill! +10 XP 🌾', 'xp');
  }

  return (
    <div className="learning-screen">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
        <h1 className="page-title">🗣️ ಪ್ರಾದೇಶಿಕ ಕನ್ನಡ · Dialect Explorer</h1>
        <span style={{ color: '#38ef7d', fontWeight: 800 }}>Karnataka Slang</span>
      </div>

      {/* Region Selector */}
      <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.4rem' }}>
        {DIALECTS.map((d, idx) => (
          <button
            key={idx}
            className="btn-primary"
            onClick={() => setSelectedDialect(idx)}
            style={{
              opacity: selectedDialect === idx ? 1 : 0.6,
              whiteSpace: 'nowrap',
              fontSize: '0.85rem',
              padding: '0.6rem 1rem'
            }}
          >
            {d.icon} {d.region.split('(')[0]}
          </button>
        ))}
      </div>

      <div className="glass-card" style={{ maxWidth: 640, margin: '0 auto', padding: '1.8rem' }}>
        <h3 style={{ color: '#ffa366', marginBottom: '1.2rem' }}>{cur.region}</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {cur.comparisons.map((c, i) => (
            <div key={i} style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '0.3rem' }}>STANDARD KANNADA:</div>
              <div style={{ fontFamily: 'Noto Sans Kannada, sans-serif', fontSize: '1rem', marginBottom: '0.6rem' }}>
                {c.standardKn}
              </div>

              <div style={{ padding: '0.8rem', background: 'rgba(255,163,102,0.1)', borderRadius: '8px', borderLeft: '3px solid #ffa366' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#ffa366', fontWeight: 800 }}>REGIONAL SLANG:</div>
                    <div style={{ fontFamily: 'Noto Sans Kannada, sans-serif', fontSize: '1.2rem', fontWeight: 900, color: '#ffedd5' }}>
                      "{c.dialectKn}"
                    </div>
                  </div>
                  <button className="btn-primary" onClick={() => speak(c.dialectKn)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                    🔊 Listen
                  </button>
                </div>
                <div style={{ fontSize: '0.78rem', opacity: 0.75, marginTop: '0.4rem' }}>
                  💡 {c.note}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
