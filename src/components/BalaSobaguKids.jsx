import React, { useState } from 'react';
import { speakKannada } from '../utils/tts.js';
import { playSuccess, playClick, playFanfare } from '../utils/soundEffects.js';

const SHISHU_GEETEGALU = [
  {
    id: 'nayi_mari',
    titleKn: 'ನಾಯಿಮರಿ ನಾಯಿಮರಿ',
    titleEn: 'Puppy Rhyme (Nayi Mari)',
    icon: '🐶',
    bg: 'linear-gradient(135deg, #ff9a9e, #fecfef)',
    lines: [
      { kn: 'ನಾಯಿಮರಿ ನಾಯಿಮರಿ ತಿಂಡಿ ಬೇಕೆ?', en: 'Puppy, puppy, do you want a snack?' },
      { kn: 'ತಿಂಡಿ ಬೇಕು, ತೀರ್ಥ ಬೇಕು, ಎಲ್ಲ ಬೇಕು!', en: 'Want snack, want water, want everything!' },
      { kn: 'ನಾಯಿಮರಿ ನಿನ್ನ ಮನೆಯು ಎಲ್ಲಿದೆ?', en: 'Puppy, where is your home?' },
      { kn: 'ಬೆಟ್ಟದ ಬುಡದಲ್ಲಿದೆ, ಬನ್ನಿ ನೋಡಿ!', en: 'It is at the foot of the hill, come see!' }
    ]
  },
  {
    id: 'ondu_eradu',
    titleKn: 'ಒಂದು ಎರಡು ಬಾಳೆಲೆ ಹರಡು',
    titleEn: 'Counting Rhyme (1 to 10)',
    icon: '🍌',
    bg: 'linear-gradient(135deg, #a1c4fd, #c2e9fb)',
    lines: [
      { kn: 'ಒಂದು ಎರಡು ಬಾಳೆಲೆ ಹರಡು', en: 'One, Two - spread the banana leaf' },
      { kn: 'ಮೂರು ನಾಲ್ಕು ಅನ್ನ ಹಾಕು', en: 'Three, Four - serve the hot rice' },
      { kn: 'ಐದು ಆರು ಬೇಳೆ ಸಾರು', en: 'Five, Six - pour the lentil saaru' },
      { kn: 'ಏಳು ಎಂಟು ಪಲ್ಯಕೆ ದಂಟು', en: 'Seven, Eight - vegetable stir fry' },
      { kn: 'ಒಂಬತ್ತು ಹತ್ತು ಎಲೆಯನು ಎತ್ತು', en: 'Nine, Ten - lift the clean leaf' }
    ]
  },
  {
    id: 'aane_bantu',
    titleKn: 'ಆನೆ ಬಂತೊಂದಾನೆ',
    titleEn: 'Elephant Song (Aane Bantu)',
    icon: '🐘',
    bg: 'linear-gradient(135deg, #fbc2eb, #a6c1ee)',
    lines: [
      { kn: 'ಆನೆ ಬಂತೊಂದಾನೆ, ದೊಡ್ಡ ಆನೆ ಬಂತು!', en: 'Elephant came, big elephant came!' },
      { kn: 'ಉದ್ದನೆಯ ಸೊಂಡಿಲಿನ ಕಪ್ಪು ಆನೆ ಬಂತು!', en: 'Long-trunked black elephant came!' },
      { kn: 'ದಪ್ಪ ಕಾಲಿನ, ಅಗಲ ಕಿವಿಯ ರಾಜ ಆನೆ ಬಂತು!', en: 'Thick-legged, wide-eared royal elephant came!' }
    ]
  }
];

const FUN_ANIMALS = [
  { nameKn: 'ನಾಯಿ', nameEn: 'Dog', soundKn: 'ಬೌ ಬೌ!', icon: '🐕' },
  { nameKn: 'ಬೆಕ್ಕು', nameEn: 'Cat', soundKn: 'ಮಿಯಾಂವ್!', icon: '🐈' },
  { nameKn: 'ಹಸು', nameEn: 'Cow', soundKn: 'ಅಂಬಾ!', icon: '🐄' },
  { nameKn: 'ಕೋಳಿ', nameEn: 'Rooster', soundKn: 'ಕೊಕ್ಕೊಕ್ಕೋ!', icon: '🐓' },
  { nameKn: 'ಆನೆ', nameEn: 'Elephant', soundKn: 'ಚಿನ್ನಾರಿ ಆನೆ!', icon: '🐘' },
  { nameKn: 'ಸಿಂಹ', nameEn: 'Lion', soundKn: 'ಘರ್ಜನೆ!', icon: '🦁' },
];

export default function BalaSobaguKids({ onXP, onToast }) {
  const [activeRhymeIdx, setActiveRhymeIdx] = useState(0);
  const [activeMode, setActiveMode] = useState('rhymes'); // 'rhymes' | 'animals'
  const [starsWon, setStarsWon] = useState(3);

  const curRhyme = SHISHU_GEETEGALU[activeRhymeIdx];

  const handleReciteRhyme = () => {
    playFanfare();
    const fullText = curRhyme.lines.map(l => l.kn).join('. ');
    speakKannada(fullText, 0.75); // slower for kids
    setStarsWon(s => s + 1);
    onXP && onXP(30);
    onToast && onToast(`⭐ Kids Rhyme Star Unlocked! +30 XP`, 'xp');
  };

  const handleAnimalClick = (anim) => {
    playSuccess();
    speakKannada(`${anim.nameKn}. ${anim.soundKn}`);
    onXP && onXP(10);
  };

  return (
    <div className="learning-screen" style={{ maxWidth: 860, margin: '0 auto', padding: '1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.8rem' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0, fontSize: '1.8rem', color: '#ff6b35' }}>
            🧸 ಬಾಲ ಸೊಬಗು (Kids & Heritage Mode)
          </h1>
          <p style={{ margin: '0.2rem 0 0', opacity: 0.85, fontSize: '0.95rem' }}>
            Playful Kannada nursery rhymes, fun animal sounds, and big touch buttons!
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button
            onClick={() => { playClick(); setActiveMode('rhymes'); }}
            style={{
              padding: '0.6rem 1.2rem',
              borderRadius: '14px',
              border: 'none',
              background: activeMode === 'rhymes' ? 'linear-gradient(135deg, #ff6b35, #ffa366)' : 'rgba(255,255,255,0.08)',
              color: '#fff',
              fontWeight: 800,
              cursor: 'pointer',
              fontSize: '0.95rem'
            }}
          >
            🎶 Shishu Geetegalu
          </button>
          <button
            onClick={() => { playClick(); setActiveMode('animals'); }}
            style={{
              padding: '0.6rem 1.2rem',
              borderRadius: '14px',
              border: 'none',
              background: activeMode === 'animals' ? 'linear-gradient(135deg, #4ade80, #22c55e)' : 'rgba(255,255,255,0.08)',
              color: '#fff',
              fontWeight: 800,
              cursor: 'pointer',
              fontSize: '0.95rem'
            }}
          >
            🦁 Animal Sounds
          </button>
        </div>
      </div>

      {activeMode === 'rhymes' ? (
        <div>
          {/* Rhyme Selector Carousel */}
          <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {SHISHU_GEETEGALU.map((r, i) => (
              <button
                key={r.id}
                onClick={() => { playClick(); setActiveRhymeIdx(i); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.8rem 1.2rem',
                  borderRadius: '16px',
                  border: activeRhymeIdx === i ? '3px solid #ff6b35' : '1px solid rgba(255,255,255,0.1)',
                  background: activeRhymeIdx === i ? 'rgba(255, 107, 53, 0.2)' : 'rgba(255,255,255,0.04)',
                  color: 'inherit',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                <span style={{ fontSize: '2rem' }}>{r.icon}</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontFamily: 'Noto Sans Kannada', fontWeight: 800, fontSize: '1rem', color: activeRhymeIdx === i ? '#ffa366' : 'inherit' }}>
                    {r.titleKn}
                  </div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{r.titleEn}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Big Interactive Rhyme Board */}
          <div className="glass-card" style={{ padding: '2rem', borderRadius: '24px', border: '2px solid rgba(255, 163, 102, 0.35)', background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.12), rgba(254, 207, 239, 0.08))' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <span style={{ fontSize: '3rem' }}>{curRhyme.icon}</span>
                <div>
                  <h2 style={{ margin: 0, fontFamily: 'Noto Sans Kannada', fontSize: '1.6rem', color: '#ffa366' }}>
                    {curRhyme.titleKn}
                  </h2>
                  <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>{curRhyme.titleEn}</div>
                </div>
              </div>

              <button
                onClick={handleReciteRhyme}
                style={{
                  background: 'linear-gradient(135deg, #ff6b35, #ffa366)',
                  border: 'none',
                  color: '#fff',
                  padding: '0.8rem 1.6rem',
                  borderRadius: '16px',
                  fontWeight: 900,
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                  boxShadow: '0 6px 16px rgba(255, 107, 53, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem'
                }}
              >
                🔊 Sing Rhyme
              </button>
            </div>

            {/* Rhyme Verses */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              {curRhyme.lines.map((line, idx) => (
                <div
                  key={idx}
                  onClick={() => speakKannada(line.kn, 0.75)}
                  style={{
                    padding: '1.1rem 1.4rem',
                    borderRadius: '16px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'transform 0.15s ease'
                  }}
                  title="Click to hear line"
                >
                  <div>
                    <div style={{ fontFamily: 'Noto Sans Kannada', fontSize: '1.35rem', fontWeight: 800, color: '#fff', marginBottom: '0.2rem' }}>
                      {line.kn}
                    </div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.8, color: '#fda4af' }}>
                      {line.en}
                    </div>
                  </div>
                  <span style={{ fontSize: '1.5rem', opacity: 0.8 }}>📢</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Animal Kingdom for Kids */
        <div>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: '#4ade80', marginBottom: '1rem' }}>
            Tap an animal to hear its Kannada name and sound!
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            {FUN_ANIMALS.map((anim, idx) => (
              <div
                key={idx}
                onClick={() => handleAnimalClick(anim)}
                style={{
                  padding: '1.5rem',
                  borderRadius: '20px',
                  background: 'rgba(74, 222, 128, 0.1)',
                  border: '2px solid rgba(74, 222, 128, 0.3)',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease'
                }}
              >
                <div style={{ fontSize: '3.5rem', marginBottom: '0.4rem' }}>{anim.icon}</div>
                <div style={{ fontFamily: 'Noto Sans Kannada', fontSize: '1.4rem', fontWeight: 900, color: '#4ade80' }}>
                  {anim.nameKn}
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.3rem' }}>{anim.nameEn}</div>
                <div style={{ fontSize: '0.85rem', color: '#facc15', fontStyle: 'italic' }}>"{anim.soundKn}"</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
