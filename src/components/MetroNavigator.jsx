import React, { useState } from 'react';

const METRO_STATIONS = [
  { nameKn: 'ಮೆಜೆಸ್ಟಿಕ್ (ನಾಡಪ್ರಭು ಕೆಂಪೇಗೌಡ ನಿಲ್ದಾಣ)', nameEn: 'Majestic Inter-change', line: 'Purple & Green Line', announcementKn: 'ಮುಂದಿನ ನಿಲ್ದಾಣ: ನಾಡಪ್ರಭು ಕೆಂಪೇಗೌಡ ಮೆಜೆಸ್ಟಿಕ್ ನಿಲ್ದಾಣ. ಎಡಭಾಗದ ಬಾಗಿಲುಗಳು ತೆರೆಯುತ್ತವೆ.' },
  { nameKn: 'ಎಂ.ಜಿ. ರಸ್ತೆ (M.G. Road)', nameEn: 'Mahatma Gandhi Road', line: 'Purple Line', announcementKn: 'ಮುಂದಿನ ನಿಲ್ದಾಣ: ಎಂ.ಜಿ. ರಸ್ತೆ. ದಯವಿಟ್ಟು ಬಾಗಿಲ ಬಳಿ ನಿಲ್ಲಬೇಡಿ.' },
  { nameKn: 'ಇಂದಿರಾನಗರ (Indiranagar)', nameEn: 'Indiranagar Station', line: 'Purple Line', announcementKn: 'ಮುಂದಿನ ನಿಲ್ದಾಣ: ಇಂದಿರಾನಗರ. ಬಲಬದಿಯ ಬಾಗಿಲುಗಳು ತೆರೆಯುತ್ತವೆ.' },
  { nameKn: 'ಲಾಲ್‌ಬಾಗ್ (Lalbagh Botanical)', nameEn: 'Lalbagh Botanical Garden', line: 'Green Line', announcementKn: 'ಮುಂದಿನ ನಿಲ್ದಾಣ: ಲಾಲ್‌ಬಾಗ್. ಹಸಿರು ಉದ್ಯಾನವನದ ಪ್ರವೇಶದ್ವಾರ ಇಲ್ಲಿದೆ.' }
];

export default function MetroNavigator({ onXP, onToast }) {
  const [selectedStation, setSelectedStation] = useState(0);

  const cur = METRO_STATIONS[selectedStation];

  function speak(text) {
    if (!window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'kn-IN';
    u.rate = 0.85;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
    onXP && onXP(10);
    onToast && onToast('🚇 Metro transit listening XP! +10 XP', 'xp');
  }

  return (
    <div className="learning-screen">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
        <h1 className="page-title">🚇 ನಮ್ಮ ಮೆಟ್ರೋ · Namma Metro Navigator</h1>
        <span style={{ color: '#a855f7', fontWeight: 800 }}>Bengaluru Transit</span>
      </div>

      <div className="glass-card" style={{ maxWidth: 640, margin: '0 auto', padding: '2rem' }}>
        {/* Metro Token Simulation Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.06)', borderRadius: '12px', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#a855f7', fontWeight: 800 }}>TRANSIT LINE:</div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{cur.line}</div>
          </div>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', boxShadow: '0 0 15px rgba(168,85,247,0.5)' }}>
            🚇
          </div>
        </div>

        {/* Station Picker */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
          {METRO_STATIONS.map((s, idx) => (
            <button
              key={idx}
              className="btn-primary"
              onClick={() => setSelectedStation(idx)}
              style={{
                opacity: selectedStation === idx ? 1 : 0.6,
                whiteSpace: 'nowrap',
                fontSize: '0.82rem',
                padding: '0.5rem 0.9rem'
              }}
            >
              {s.nameEn.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Station Details */}
        <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: '14px', marginBottom: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '0.4rem' }}>CURRENT STATION</div>
          <div style={{ fontFamily: 'Noto Sans Kannada, sans-serif', fontSize: '1.6rem', fontWeight: 900, color: '#fef08a', marginBottom: '0.3rem' }}>
            {cur.nameKn}
          </div>
          <div style={{ fontSize: '0.95rem', opacity: 0.8 }}>{cur.nameEn}</div>
        </div>

        {/* Authentic In-Train Metro Announcement */}
        <div style={{ padding: '1.2rem', background: 'rgba(168, 85, 247, 0.15)', border: '1px solid rgba(168, 85, 247, 0.35)', borderRadius: '14px', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#c084fc', fontWeight: 800 }}>🔊 IN-TRAIN AUDIO ANNOUNCEMENT:</span>
            <button className="btn-primary" onClick={() => speak(cur.announcementKn)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
              ▶ Play Announcement
            </button>
          </div>
          <div style={{ fontFamily: 'Noto Sans Kannada, sans-serif', fontSize: '1.05rem', fontWeight: 700, lineHeight: 1.6 }}>
            "{cur.announcementKn}"
          </div>
        </div>

        {/* Useful Metro Phrases */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
          <div style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.04)', borderRadius: '8px' }}>
            <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#ffa366' }}>ಟೋಕನ್ ಎಲ್ಲಿ ಸಿಗುತ್ತೆ?</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Where do I get a token?</div>
          </div>
          <div style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.04)', borderRadius: '8px' }}>
            <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#ffa366' }}>ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ೨ ಎಲ್ಲಿದೆ?</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Where is platform 2?</div>
          </div>
        </div>
      </div>
    </div>
  );
}
