import React, { useState } from 'react';

const TECH_MODULES = [
  {
    category: '🏢 Office & Coworker Chat',
    dialogues: [
      { kn: 'ಬನ್ನಿ ಕಾಫಿ ಕುಡಿಯೋಣ!', en: 'Come, let us have coffee!', roman: 'Banni coffee kudiyona!' },
      { kn: 'ಇವತ್ತು ಮೀಟಿಂಗ್ ಎಷ್ಟೊತ್ತಿಗೆ?', en: 'What time is the meeting today?', roman: 'Ivattu meeting eshtottige?' },
      { kn: 'ಊಟ ಆಯ್ತಾ ನಿಮ್ಮದು?', en: 'Did you have lunch?', roman: 'Oota aayta nimmadu?' }
    ]
  },
  {
    category: '🏠 Apartment & House Renting',
    dialogues: [
      { kn: 'ಬಾಡಿಗೆ ಎಷ್ಟು ಸಾರ್?', en: 'How much is the rent sir?', roman: 'Baadige eshtu sir?' },
      { kn: 'ಅಡ್ವಾನ್ಸ್ ಎಷ್ಟು ಕೊಡಬೇಕು?', en: 'How much advance deposit to pay?', roman: 'Advance eshtu kodabeku?' },
      { kn: 'ನೀರಿನ ಸಮಸ್ಯೆ ಏನಾದರೂ ಇದೆಯಾ?', en: 'Is there any water problem?', roman: 'Neerina samasye enadaru ideya?' }
    ]
  },
  {
    category: '👮 Security Guard & Maid Queries',
    dialogues: [
      { kn: 'ಪಾರ್ಸೆಲ್ ಬಂದಿದೆಯಾ?', en: 'Did any parcel/courier arrive?', roman: 'Parcel bandideya?' },
      { kn: 'ನಾಳೆ ಬೆಳಗ್ಗೆ ೯ ಗಂಟೆಗೆ ಬನ್ನಿ.', en: 'Come tomorrow morning at 9 o`clock.', roman: 'Naale belagge 9 gantege banni.' },
      { kn: 'ಕಸದ ಗಾಡಿ ಬಂದಿದೆಯಾ?', en: 'Did the garbage vehicle come?', roman: 'Kasada gaadi bandideya?' }
    ]
  }
];

export default function TechParkKannada({ onXP, onToast }) {
  const [selectedMod, setSelectedMod] = useState(0);

  function speak(text) {
    if (!window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'kn-IN';
    u.rate = 0.85;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
    onXP && onXP(5);
    onToast && onToast('+5 XP Audio drill completed!', 'xp');
  }

  return (
    <div className="learning-screen">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
        <h1 className="page-title">🏢 ಟೆಕ್ ಪಾರ್ಕ್ ಕನ್ನಡ · Tech-Park Survival Kit</h1>
        <span style={{ fontSize: '0.85rem', color: '#ffa366', fontWeight: 700 }}>Bengaluru Relocation</span>
      </div>

      {/* Module Selector */}
      <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.4rem' }}>
        {TECH_MODULES.map((m, idx) => (
          <button
            key={idx}
            className="btn-primary"
            onClick={() => setSelectedMod(idx)}
            style={{
              opacity: selectedMod === idx ? 1 : 0.6,
              whiteSpace: 'nowrap',
              fontSize: '0.85rem',
              padding: '0.6rem 1rem'
            }}
          >
            {m.category}
          </button>
        ))}
      </div>

      {/* Dialogues Card */}
      <div className="glass-card" style={{ maxWidth: 640, margin: '0 auto', padding: '1.8rem' }}>
        <h3 style={{ marginBottom: '1.2rem', color: '#ffa366' }}>{TECH_MODULES[selectedMod].category}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {TECH_MODULES[selectedMod].dialogues.map((d, i) => (
            <div key={i} style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: 'Noto Sans Kannada, sans-serif', fontSize: '1.2rem', fontWeight: 800, color: '#ffedd5', marginBottom: '0.2rem' }}>
                  {d.kn}
                </div>
                <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>{d.en}</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.5, fontStyle: 'italic', marginTop: '2px' }}>{d.roman}</div>
              </div>
              <button
                className="btn-primary"
                onClick={() => speak(d.kn)}
                style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
              >
                🔊 Speak
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
