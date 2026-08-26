import React, { useState } from 'react';

const NEWS_BULLETINS = [
  {
    date: 'ಇಂದಿನ ಸಮಾಚಾರ (Today`s Bulletin)',
    headlineKn: 'ಬೆಂಗಳೂರಿನಲ್ಲಿ ಮೆಟ್ರೋ ಹೊಸ ಮಾರ್ಗ ಉದ್ಘಾಟನೆ: ಪ್ರಯಾಣಿಕರಿಗೆ ಸಂತಸ!',
    headlineEn: 'New Metro Line Inaugurated in Bengaluru: Passengers Rejoice!',
    storyKn: 'ಬೆಂಗಳೂರು ನಗರದಲ್ಲಿ ಹೊಸ ನಮ್ಮ ಮೆಟ್ರೋ ಮಾರ್ಗವನ್ನು ಸಾರ್ವಜನಿಕರಿಗೆ ತೆರೆಯಲಾಗಿದೆ. ಇದರಿಂದ ಟ್ರಾಫಿಕ್ ಸಮಸ್ಯೆ ಕಡಿಮೆಯಾಗಲಿದ್ದು, ಜನರು ತ್ವರಿತವಾಗಿ ಕಚೇರಿ ತಲುಪಬಹುದು.',
    storyEn: 'The new Namma Metro line has opened to the public in Bengaluru. This will reduce traffic bottlenecks, enabling citizens to reach offices quickly.',
    keywords: [
      { kn: 'ಉದ್ಘಾಟನೆ', en: 'Inauguration' },
      { kn: 'ಪ್ರಯಾಣಿಕರು', en: 'Passengers' },
      { kn: 'ಸಮಸ್ಯೆ', en: 'Problem' }
    ]
  },
  {
    date: 'ಹವಾಮಾನ ಸಮಾಚಾರ (Weather Update)',
    headlineKn: 'ಕರ್ನಾಟಕದಾದ್ಯಂತ ಉತ್ತಮ ಮಳೆ ನಿರೀಕ್ಷೆ: ಕರಾವಳಿ ಭಾಗದಲ್ಲಿ ಹಸಿರು ವೈಭವ!',
    headlineEn: 'Good Rainfall Expected Across Karnataka: Coastal Belt Turns Lush Green!',
    storyKn: 'ರಾಜ್ಯದ ಕರಾವಳಿ ಮತ್ತು ಮಲೆನಾಡು ಜಿಲ್ಲೆಗಳಲ್ಲಿ ಉತ್ತಮ ಮುಂಗಾರು ಮಳೆಯಾಗಿದೆ. ರೈತರು ಹರ್ಷ ವ್ಯಕ್ತಪಡಿಸಿದ್ದು, ಜಲಾಶಯಗಳು ಭರ್ತಿಯಾಗುತ್ತಿವೆ.',
    storyEn: 'Good monsoon rains lashed the coastal and Malnad districts of the state. Farmers expressed delight as reservoirs fill up rapidly.',
    keywords: [
      { kn: 'ಮಳೆ', en: 'Rain' },
      { kn: 'ರೈತರು', en: 'Farmers' },
      { kn: 'ಜಲಾಶಯ', en: 'Reservoir' }
    ]
  }
];

export default function KannadaNewsDigest({ onXP, onToast }) {
  const [selectedNews, setSelectedNews] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const cur = NEWS_BULLETINS[selectedNews];

  function toggleAudio() {
    if (!window.speechSynthesis) return;

    if (!isPlaying) {
      const u = new SpeechSynthesisUtterance(cur.headlineKn + '... ' + cur.storyKn);
      u.lang = 'kn-IN';
      u.rate = 0.82;
      u.onend = () => setIsPlaying(false);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
      setIsPlaying(true);
      onXP && onXP(20);
      onToast && onToast('📰 News Bulletin Audio listening! +20 XP', 'xp');
    } else {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  }

  return (
    <div className="learning-screen">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
        <h1 className="page-title">📰 ಕನ್ನಡ ಸಮಾಚಾರ · Daily News Digest</h1>
        <span style={{ color: '#38ef7d', fontWeight: 800 }}>Beginner-Friendly News</span>
      </div>

      {/* Bulletin Switcher */}
      <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.5rem' }}>
        {NEWS_BULLETINS.map((b, idx) => (
          <button
            key={idx}
            className="btn-primary"
            onClick={() => { window.speechSynthesis && window.speechSynthesis.cancel(); setIsPlaying(false); setSelectedNews(idx); }}
            style={{
              opacity: selectedNews === idx ? 1 : 0.6,
              fontSize: '0.85rem',
              padding: '0.6rem 1rem'
            }}
          >
            📰 Bulletin {idx + 1}
          </button>
        ))}
      </div>

      <div className="glass-card" style={{ maxWidth: 640, margin: '0 auto', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.85rem', color: '#ffa366', fontWeight: 800 }}>{cur.date}</span>
          <button
            className="btn-primary"
            onClick={toggleAudio}
            style={{
              padding: '0.4rem 1rem',
              fontSize: '0.85rem',
              background: isPlaying ? '#ef4444' : undefined
            }}
          >
            {isPlaying ? '⏸️ Pause News' : '▶️ Listen News Audio'}
          </button>
        </div>

        {/* Headline */}
        <div style={{ padding: '1.2rem', background: 'rgba(255,163,102,0.1)', border: '1px solid rgba(255,163,102,0.3)', borderRadius: '12px', marginBottom: '1.2rem' }}>
          <div style={{ fontFamily: 'Noto Sans Kannada, sans-serif', fontSize: '1.3rem', fontWeight: 900, color: '#ffedd5', marginBottom: '0.4rem' }}>
            {cur.headlineKn}
          </div>
          <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>{cur.headlineEn}</div>
        </div>

        {/* Story Body */}
        <div style={{ padding: '1.4rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '1.5rem' }}>
          <div style={{ fontFamily: 'Noto Sans Kannada, sans-serif', fontSize: '1.15rem', lineHeight: 1.8, marginBottom: '0.8rem' }}>
            {cur.storyKn}
          </div>
          <div style={{ fontSize: '0.85rem', opacity: 0.75, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.8rem' }}>
            {cur.storyEn}
          </div>
        </div>

        {/* Vocabulary Tooltip Glossary */}
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#38ef7d', marginBottom: '0.6rem' }}>
            💡 KEY VOCABULARY IN THIS BULLETIN:
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            {cur.keywords.map((k, i) => (
              <div key={i} style={{ padding: '0.5rem 0.9rem', background: 'rgba(56, 239, 125, 0.12)', border: '1px solid rgba(56, 239, 125, 0.3)', borderRadius: '8px', fontSize: '0.85rem' }}>
                <strong style={{ fontFamily: 'Noto Sans Kannada, sans-serif' }}>{k.kn}</strong>: {k.en}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
