import React, { useState } from 'react';
import { speakKannada } from '../utils/tts.js';
import { playSuccess, playClick, playFanfare } from '../utils/soundEffects.js';

const ANTAKSHARI_SONGS = [
  {
    id: 1,
    title: 'ಹುಟ್ಟಿದರೆ ಕನ್ನಡ ನಾಡಲ್ ಹುಟ್ಟಬೇಕು',
    film: 'ಆಕಸ್ಮಿಕ (Aakasmika)',
    singer: 'ಡಾ. ರಾಜ್‌ಕುಮಾರ್',
    lineKn: 'ಹುಟ್ಟಿದರೆ ಕನ್ನಡ ನಾಡಲ್ ಹುಟ್ಟಬೇಕು, ಮೆಟ್ಟಿದರೆ ಕನ್ನಡ ಮಣ್ಣ ಮೆಟ್ಟಬೇಕು!',
    translit: 'Huttidare Kannada naadal huttabeku, mettidare Kannada manna mettabeku!',
    endsLetter: 'ಕು (Ku)',
    nextLetter: 'ಕ / ಕು (Ka / Ku)'
  },
  {
    id: 2,
    title: 'ಕುರುಬನ ರಾಣಿ ಬಾರವ್ವಾ',
    film: 'ಕ್ರಾಂತಿವೀರ ಸಂಗೊಳ್ಳಿ ರಾಯಣ್ಣ',
    singer: 'ಕೆ. ಎಸ್. ಚಿತ್ರಾ',
    lineKn: 'ಕುರುಬನ ರಾಣಿ ಬಾರವ್ವಾ, ನಿನ್ನ ಚೆಲುವನು ನೋಡಿ ನಾ ಬೆರಗಾದೆನವ್ವಾ!',
    translit: 'Kurubana raani baaravva, ninna cheluvanu nodi naa beragaadenavva!',
    endsLetter: 'ವ್ವಾ (Vva)',
    nextLetter: 'ವ / ವಾ (Va / Vaa)'
  },
  {
    id: 3,
    title: 'ಬಾನಲ್ಲೂ ನೀನೆ ಭುವಿಯಲ್ಲೂ ನೀನೆ',
    film: 'ಬಯಲು ದಾರಿ',
    singer: 'ಎಸ್. ಜಾನಕಿ',
    lineKn: 'ಬಾನಲ್ಲೂ ನೀನೆ, ಭುವಿಯಲ್ಲೂ ನೀನೆ, ಎಲ್ಲೆಲ್ಲೂ ನೀನೆ ಓ ನನ್ನ ಜೀವ!',
    translit: 'Baanalloo neene, bhuviyalloo neene, yellelloo neene o nanna jeeva!',
    endsLetter: 'ವ (Va)',
    nextLetter: 'ವ / ವೀ (Va / Vee)'
  },
  {
    id: 4,
    title: 'ಅನಿಸುತಿದೆ ಯಾಕೋ ಇಂದು',
    film: 'ಮುಂಗಾರು ಮಳೆ (Mungaru Male)',
    singer: 'ಸೋನು ನಿಗಮ್',
    lineKn: 'ಅನಿಸುತಿದೆ ಯಾಕೋ ಇಂದು, ನೀನೆನೆಂದು ನನ್ನವಳೆಂದು!',
    translit: 'Anisutide yaako indu, neenenedu nannavalendu!',
    endsLetter: 'ದು (Du)',
    nextLetter: 'ದ / ದು (Da / Du)'
  },
  {
    id: 5,
    title: 'ಬೆಳಗೆದ್ದು ಯಾರ ಮುಖವ ನಾನು ನೋಡಿದೆ',
    film: 'ಕಿರಿಕ್ ಪಾರ್ಟಿ (Kirik Party)',
    singer: 'ವಿಜಯ್ ಪ್ರಕಾಶ್',
    lineKn: 'ಬೆಳಗೆದ್ದು ಯಾರ ಮುಖವ ನಾನು ನೋಡಿದೆ, ಅರೆ ಕಣ್ಣಲ್ಲೇ ಪ್ರೀತಿಯ ಸುರಿಮಳೆ!',
    translit: 'Belageddu yaara mukhava naanu nodide, are kannalle preetiya surimale!',
    endsLetter: 'ಳೆ (Le)',
    nextLetter: 'ಲ / ಳ (La / La)'
  },
  {
    id: 6,
    title: 'ಬೊಂಬೆ ಹೇಳುತೈತೆ ಮತ್ತೆ ಹೇಳುತೈತೆ',
    film: 'ರಾಜಕುಮಾರ (Raajakumara)',
    singer: 'ವಿಜಯ್ ಪ್ರಕಾಶ್',
    lineKn: 'ಬೊಂಬೆ ಹೇಳುತೈತೆ ಮತ್ತೆ ಹೇಳುತೈತೆ, ನೀನೆ ರಾಜಕುಮಾರ!',
    translit: 'Bombe helutaite matte helutaite, neene Raajakumara!',
    endsLetter: 'ರ (Ra)',
    nextLetter: 'ರ / ರಿ (Ra / Ri)'
  }
];

export default function KannadaAntakshari({ onXP, onToast }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [answered, setAnswered] = useState(false);

  const curSong = ANTAKSHARI_SONGS[currentIdx];

  // Generate 3 choices for next song, where one starts with the correct letter
  const generateChoices = () => {
    const nextIdx = (currentIdx + 1) % ANTAKSHARI_SONGS.length;
    const dummy1 = (currentIdx + 2) % ANTAKSHARI_SONGS.length;
    const dummy2 = (currentIdx + 3) % ANTAKSHARI_SONGS.length;

    const options = [
      { ...ANTAKSHARI_SONGS[nextIdx], isCorrect: true },
      { ...ANTAKSHARI_SONGS[dummy1], isCorrect: false },
      { ...ANTAKSHARI_SONGS[dummy2], isCorrect: false },
    ];
    // deterministic shuffle based on current index
    return options.sort(() => ((currentIdx % 2 === 0) ? 0.5 - Math.random() : -0.5 + Math.random()));
  };

  const [choices, setChoices] = useState(generateChoices());

  const handlePickChoice = (choice) => {
    if (answered) return;
    playClick();
    setAnswered(true);

    if (choice.isCorrect) {
      playFanfare();
      const newStreak = streak + 1;
      const pts = 30 + (newStreak * 5);
      setScore(s => s + pts);
      setStreak(newStreak);
      onXP && onXP(pts);
      onToast && onToast(`🎵 Perfect Match! +${pts} XP (Streak: ${newStreak})`, 'xp');
    } else {
      setStreak(0);
      onToast && onToast(`Letter mismatch! Check ending letter.`, 'info');
    }
  };

  const handleNextRound = () => {
    playClick();
    setAnswered(false);
    const nextRoundIdx = (currentIdx + 1) % ANTAKSHARI_SONGS.length;
    setCurrentIdx(nextRoundIdx);
    // regenerate choices
    const nextIdx = (nextRoundIdx + 1) % ANTAKSHARI_SONGS.length;
    const dummy1 = (nextRoundIdx + 2) % ANTAKSHARI_SONGS.length;
    const dummy2 = (nextRoundIdx + 3) % ANTAKSHARI_SONGS.length;
    setChoices([
      { ...ANTAKSHARI_SONGS[nextIdx], isCorrect: true },
      { ...ANTAKSHARI_SONGS[dummy1], isCorrect: false },
      { ...ANTAKSHARI_SONGS[dummy2], isCorrect: false },
    ].sort(() => 0.5 - Math.random()));
  };

  return (
    <div className="learning-screen" style={{ maxWidth: 840, margin: '0 auto', padding: '1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.8rem' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0, fontSize: '1.6rem' }}>
            🎶 ಕನ್ನಡ ಅಂತಾಕ್ಷರಿ ಅಖಾಡ (Antakshari Arena)
          </h1>
          <p style={{ margin: '0.2rem 0 0', opacity: 0.8, fontSize: '0.9rem' }}>
            Kannada Musical Antakshari · Match the ending syllable with legendary hits!
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.8rem' }}>
          <div style={{ background: 'rgba(255, 107, 53, 0.15)', border: '1px solid rgba(255, 107, 53, 0.35)', padding: '0.4rem 0.8rem', borderRadius: '10px', fontWeight: 800, color: '#ffa366' }}>
            🔥 Streak: {streak}
          </div>
          <div style={{ background: 'rgba(74, 222, 128, 0.15)', border: '1px solid rgba(74, 222, 128, 0.35)', padding: '0.4rem 0.8rem', borderRadius: '10px', fontWeight: 800, color: '#4ade80' }}>
            ⭐ Score: {score}
          </div>
        </div>
      </div>

      {/* AI Turn / Current Song Card */}
      <div className="glass-card" style={{ padding: '1.8rem', borderRadius: '16px', border: '1px solid rgba(255, 163, 102, 0.25)', marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.12), rgba(255, 87, 87, 0.08))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <span style={{ background: '#ffa366', color: '#1c0c02', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', marginRight: '0.6rem' }}>
              SOBAGU AI SINGS:
            </span>
            <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>
              Movie: <strong>{curSong.film}</strong> · Singer: <strong>{curSong.singer}</strong>
            </span>
          </div>
          <button
            onClick={() => speakKannada(curSong.lineKn)}
            style={{
              background: 'linear-gradient(135deg, #ff6b35, #ffa366)',
              border: 'none',
              color: '#fff',
              padding: '0.5rem 1rem',
              borderRadius: '10px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            🔊 Sing Line
          </button>
        </div>

        <div style={{ fontFamily: 'Noto Sans Kannada', fontSize: '1.35rem', fontWeight: 800, lineHeight: 1.5, marginBottom: '0.5rem' }}>
          "{curSong.lineKn}"
        </div>
        <div style={{ fontSize: '0.88rem', color: '#fda4af', fontStyle: 'italic', marginBottom: '1.2rem' }}>
          "{curSong.translit}"
        </div>

        {/* Ending Syllable Target */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.8rem',
          background: 'rgba(0,0,0,0.3)',
          padding: '0.7rem 1.2rem',
          borderRadius: '12px',
          border: '1px solid rgba(255, 163, 102, 0.3)'
        }}>
          <span style={{ fontSize: '0.85rem', opacity: 0.85 }}>Ending Letter:</span>
          <span style={{ fontFamily: 'Noto Sans Kannada', fontSize: '1.3rem', fontWeight: 900, color: '#facc15' }}>
            {curSong.endsLetter}
          </span>
          <span style={{ fontSize: '0.85rem', color: '#4ade80', fontWeight: 700 }}>
            ➔ Next song must begin with: {curSong.nextLetter}
          </span>
        </div>
      </div>

      {/* Player Challenge Choices */}
      <div>
        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffa366', marginBottom: '0.8rem' }}>
          ನಿಮ್ಮ ಸರದಿ (Your Turn · Choose the Next Matching Song):
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.5rem' }}>
          {choices.map((c, i) => {
            const isPicked = answered && c.isCorrect;
            return (
              <div
                key={i}
                onClick={() => handlePickChoice(c)}
                style={{
                  padding: '1.1rem',
                  borderRadius: '14px',
                  border: answered
                    ? c.isCorrect ? '2px solid #4ade80' : '1px solid rgba(255,255,255,0.1)'
                    : '1px solid rgba(255,255,255,0.12)',
                  background: answered
                    ? c.isCorrect ? 'rgba(74, 222, 128, 0.18)' : 'rgba(255,255,255,0.02)'
                    : 'rgba(255,255,255,0.04)',
                  cursor: answered ? 'default' : 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                  <div style={{ fontFamily: 'Noto Sans Kannada', fontSize: '1.1rem', fontWeight: 800 }}>
                    {c.lineKn}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); speakKannada(c.lineKn); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}
                  >
                    🔊
                  </button>
                </div>
                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                  Movie: {c.film} · {c.singer}
                </div>
              </div>
            );
          })}
        </div>

        {answered && (
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={handleNextRound}
              style={{
                background: 'linear-gradient(135deg, #ff6b35, #ffa366)',
                border: 'none',
                color: '#fff',
                padding: '0.75rem 2rem',
                borderRadius: '12px',
                fontWeight: 900,
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              Next Song Round ➔
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
