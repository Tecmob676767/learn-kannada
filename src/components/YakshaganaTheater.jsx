import React, { useState } from 'react';

const FOLK_STORIES = [
  {
    title: 'ತೆನಾಲಿ ರಾಮ ಮತ್ತು ರಸಗುಲ್ಲಾ (Tenali Rama & The Sweet)',
    art: '🎭',
    duration: '2 min audio',
    storyKn: 'ವಿಜಯನಗರದ ರಾಜ ಕೃಷ್ಣದೇವರಾಯರ ಆಸ್ಥಾನದಲ್ಲಿ ತೆನಾಲಿ ರಾಮನು ತನ್ನ ಚತುರತೆಯಿಂದ ಎಲ್ಲರ ಮೆಚ್ಚುಗೆ ಗಳಿಸಿದನು. ಒಮ್ಮೆ ರಾಜರು ಕಠಿಣ ಪ್ರಶ್ನೆ ಕೇಳಿದಾಗ, ರಾಮನು ಹಾಸ್ಯಭರಿತ ಉತ್ತರ ನೀಡಿ ಮುತ್ತಿನ ಹಾರ ಬಹುಮಾನವಾಗಿ ಪಡೆದನು.',
    storyEn: 'In King Krishnadevaraya`s court at Vijayanagara, Tenali Rama won everyone`s admiration through wit. When challenged with an impossible question, Rama provided a humorous answer and received a pearl necklace as a reward.'
  },
  {
    title: 'ಬೇಡರ ಕಣ್ಣಪ್ಪನ ಭಕ್ತಿ (Bhakta Kannappa)',
    art: '🏹',
    duration: '3 min audio',
    storyKn: 'ಕಾಡಿನ ಬೇಡನಾಗಿದ್ದ ಕಣ್ಣಪ್ಪನು ಶಿವನ ಮೇಲೆ ಅಪಾರ ಭಕ್ತಿ ಹೊಂದಿದ್ದನು. ಭಕ್ತಿಯ ಪರಾಕಾಷ್ಠೆಯಲ್ಲಿ ತನ್ನ ಕಣ್ಣನ್ನೇ ಶಿವಲಿಂಗಕ್ಕೆ ಅರ್ಪಿಸಿ ಮುಕ್ತಿ ಪಡೆದನು.',
    storyEn: 'Kannappa, a simple forest hunter, harbored supreme devotion for Lord Shiva, offering his very eyes in deep unwavering surrender.'
  }
];

export default function YakshaganaTheater({ onXP, onToast }) {
  const [selectedStory, setSelectedStory] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const cur = FOLK_STORIES[selectedStory];

  function togglePlay() {
    if (!window.speechSynthesis) return;

    if (!isPlaying) {
      const u = new SpeechSynthesisUtterance(cur.storyKn);
      u.lang = 'kn-IN';
      u.rate = 0.8;
      u.onend = () => setIsPlaying(false);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
      setIsPlaying(true);
      onXP && onXP(25);
      onToast && onToast('🎭 Yakshagana story theater playing! +25 XP', 'xp');
    } else {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  }

  return (
    <div className="learning-screen">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
        <h1 className="page-title">🎭 ಯಕ್ಷಗಾನ ನಾಟಕ · Audio Drama Theater</h1>
        <span style={{ color: '#ec4899', fontWeight: 800 }}>Binaural Folk Stories</span>
      </div>

      {/* Story Selector */}
      <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.4rem' }}>
        {FOLK_STORIES.map((s, idx) => (
          <button
            key={idx}
            className="btn-primary"
            onClick={() => { window.speechSynthesis && window.speechSynthesis.cancel(); setIsPlaying(false); setSelectedStory(idx); }}
            style={{
              opacity: selectedStory === idx ? 1 : 0.6,
              whiteSpace: 'nowrap',
              fontSize: '0.85rem',
              padding: '0.6rem 1rem'
            }}
          >
            {s.art} {s.title.split('(')[0]}
          </button>
        ))}
      </div>

      <div className="glass-card" style={{ maxWidth: 640, margin: '0 auto', padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '4.5rem', marginBottom: '0.8rem' }}>{cur.art}</div>
        <h2 style={{ color: '#ffa366', marginBottom: '0.4rem' }}>{cur.title}</h2>
        <div style={{ fontSize: '0.8rem', opacity: 0.65, marginBottom: '1.5rem' }}>⏱️ {cur.duration}</div>

        <button
          className="btn-primary"
          onClick={togglePlay}
          style={{
            padding: '1rem 2.5rem',
            fontSize: '1.1rem',
            background: isPlaying ? '#ef4444' : 'linear-gradient(135deg, #ec4899, #8b5cf6)',
            marginBottom: '1.5rem'
          }}
        >
          {isPlaying ? '⏸️ Pause Narration' : '▶️ Play Dramatic Narration'}
        </button>

        <div style={{ padding: '1.4rem', background: 'rgba(255,255,255,0.06)', borderRadius: '14px', textAlign: 'left' }}>
          <div style={{ fontFamily: 'Noto Sans Kannada, sans-serif', fontSize: '1.15rem', lineHeight: 1.8, marginBottom: '1rem', color: '#ffedd5' }}>
            {cur.storyKn}
          </div>
          <div style={{ fontSize: '0.85rem', opacity: 0.75, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.8rem' }}>
            {cur.storyEn}
          </div>
        </div>
      </div>
    </div>
  );
}
