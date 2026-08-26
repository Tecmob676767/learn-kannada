import React, { useState } from 'react';

const SONGS = [
  {
    title: 'ಹುಟ್ಟಿದರೆ ಕನ್ನಡ ನಾಡಲ್ಲಿ ಹುಟ್ಟಬೇಕು (Iconic Classic Anthem)',
    movie: 'ಆಕಸ್ಮಿಕ (Akasmika - Dr. Rajkumar)',
    lines: [
      { kn: 'ಹುಟ್ಟಿದರೆ ಕನ್ನಡ ನಾಡಲ್ಲಿ ಹುಟ್ಟಬೇಕು', roman: 'Huttidare Kannada naadalli huttabeku', en: 'If one is born, one should be born in the land of Kannada' },
      { kn: 'ಮೆಟ್ಟಿದರೆ ಕನ್ನಡ ಮಣ್ಣನ್ನು ಮೆಟ್ಟಬೇಕು', roman: 'Mettidare Kannada mannannu mettabeku', en: 'If one steps foot, it must be upon the soil of Kannada' },
      { kn: 'ಬದುಕಿದು ಜಟಕಾ ಬಂಡಿ, ಇದು ವಿಧಿ ಓಡಿಸೋ ಬಂಡಿ', roman: 'Badukidu jataka bandi, idu vidhi oodiso bandi', en: 'This life is a horse cart driven by destiny' }
    ]
  },
  {
    title: 'ಭಾಗ್ಯದ ಲಕ್ಷ್ಮಿ ಬಾರಮ್ಮ (Traditional Purandara Dasa Devotional)',
    movie: 'ಶಾಸ್ತ್ರೀಯ ಕೃತಿ (Classical Keerthana)',
    lines: [
      { kn: 'ಭಾಗ್ಯದ ಲಕ್ಷ್ಮಿ ಬಾರಮ್ಮ ನಮ್ಮಮ್ಮ ನೀ ಸೌಭಾಗ್ಯದ ಲಕ್ಷ್ಮಿ ಬಾರಮ್ಮ', roman: 'Bhaagyada Lakshmi baaramma nammamma nee', en: 'O auspicious Goddess Lakshmi, please grace our home with prosperity' },
      { kn: 'ಹೆಜ್ಜೆಯ ಮೇಲೆ ಹೆಜ್ಜೆಯನಿಕ್ಕುತ ಗೆಜ್ಜೆ ಕಾಲ್ಗಳ ಧ್ವನಿಯನು ತೋರುತ', roman: 'Hejjeya mele hejjeyanikkuta gejje kaalugala', en: 'Stepping softly with tinkling anklet bells echoing grace' }
    ]
  }
];

export default function SongSubtitleReader({ onXP, onToast }) {
  const [songIdx, setSongIdx] = useState(0);
  const [activeLine, setActiveLine] = useState(0);

  const curSong = SONGS[songIdx];

  function speak(text, lineIdx) {
    setActiveLine(lineIdx);
    if (!window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'kn-IN';
    u.rate = 0.8;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
    onXP && onXP(5);
    onToast && onToast('🎵 Subtitle line practiced! +5 XP', 'xp');
  }

  return (
    <div className="learning-screen">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
        <h1 className="page-title">🎬 ಹಾಡು & ಸಿನೆಮಾ ಸಾಹಿತ್ಯ · Subtitle Reader</h1>
        <span style={{ color: '#ec4899', fontWeight: 800 }}>Karaoke Studio</span>
      </div>

      {/* Song Selector */}
      <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.4rem' }}>
        {SONGS.map((s, idx) => (
          <button
            key={idx}
            className="btn-primary"
            onClick={() => { setSongIdx(idx); setActiveLine(0); }}
            style={{
              opacity: songIdx === idx ? 1 : 0.6,
              whiteSpace: 'nowrap',
              fontSize: '0.85rem',
              padding: '0.6rem 1rem'
            }}
          >
            🎵 {s.title.split('(')[0]}
          </button>
        ))}
      </div>

      <div className="glass-card" style={{ maxWidth: 640, margin: '0 auto', padding: '1.8rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffa366' }}>{curSong.title}</div>
          <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>{curSong.movie}</div>
        </div>

        {/* Synchronized Lyric Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {curSong.lines.map((line, idx) => {
            const isPlaying = activeLine === idx;
            return (
              <div
                key={idx}
                onClick={() => speak(line.kn, idx)}
                style={{
                  padding: '1.2rem',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  background: isPlaying ? 'rgba(236, 72, 153, 0.15)' : 'rgba(255,255,255,0.04)',
                  border: isPlaying ? '2px solid #ec4899' : '1px solid rgba(255,255,255,0.1)',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <div style={{ fontFamily: 'Noto Sans Kannada, sans-serif', fontSize: '1.25rem', fontWeight: 900, color: isPlaying ? '#f472b6' : '#ffedd5' }}>
                    {line.kn}
                  </div>
                  <span style={{ fontSize: '1.2rem' }}>{isPlaying ? '▶️' : '🔊'}</span>
                </div>
                <div style={{ fontSize: '0.82rem', opacity: 0.65, fontStyle: 'italic', marginBottom: '0.2rem' }}>
                  {line.roman}
                </div>
                <div style={{ fontSize: '0.85rem', opacity: 0.9, color: '#ffa366' }}>
                  {line.en}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
