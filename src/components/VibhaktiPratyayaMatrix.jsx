import React, { useState } from 'react';
import { speakKannada } from '../utils/tts.js';
import { playSuccess, playClick, playFanfare } from '../utils/soundEffects.js';

const VIBHAKTI_RULES = [
  {
    order: '೧',
    nameKn: 'ಪ್ರಥಮಾ ವಿಭಕ್ತಿ',
    nameEn: 'Prathama (Nominative)',
    markerKn: 'ವು / ಉ',
    markerEn: 'Vu / U',
    significance: 'Subject of the action (ಕರ್ತೃ)',
    suffixExample: 'ಮನೆ + ಉ = ಮನೆಯು (The house itself)'
  },
  {
    order: '೨',
    nameKn: 'ದ್ವಿತೀಯಾ ವಿಭಕ್ತಿ',
    nameEn: 'Dwitiya (Accusative)',
    markerKn: 'ಅನ್ನು',
    markerEn: 'Annu',
    significance: 'Direct Object of the action (ಕರ್ಮ)',
    suffixExample: 'ಮನೆ + ಅನ್ನು = ಮನೆಯನ್ನು (To/at the house / obj)'
  },
  {
    order: '೩',
    nameKn: 'ತೃತೀಯಾ ವಿಭಕ್ತಿ',
    nameEn: 'Tritiya (Instrumental / Ablative)',
    markerKn: 'ಇಂದ',
    markerEn: 'Inda',
    significance: 'By / From / Through (ಕರಣ / ಹೇತು)',
    suffixExample: 'ಮನೆ + ಇಂದ = ಮನೆಯಿಂದ (From the house / by means of)'
  },
  {
    order: '೪',
    nameKn: 'ಚತುರ್ಥೀ ವಿಭಕ್ತಿ',
    nameEn: 'Chaturthi (Dative)',
    markerKn: 'ಗೆ / ಇಗೆ / ಕ್ಕೆ',
    markerEn: 'Ge / Ige / Kke',
    significance: 'To / For the sake of (ಸಂಪ್ರದಾನ)',
    suffixExample: 'ಮನೆ + ಗೆ = ಮನೆಗೆ (To the house / for the house)'
  },
  {
    order: '೫',
    nameKn: 'ಪಂಚಮೀ ವಿಭಕ್ತಿ',
    nameEn: 'Panchami (Ablative Cause)',
    markerKn: 'ದೆಸೆಯಿಂದ',
    markerEn: 'Deseyinda',
    significance: 'On account of / Because of (ಅಪಾದಾನ)',
    suffixExample: 'ಮನೆಯ + ದೆಸೆಯಿಂದ = ಮನೆಯ ದೆಸೆಯಿಂದ (On account of the house)'
  },
  {
    order: '೬',
    nameKn: 'ಷಷ್ಠೀ ವಿಭಕ್ತಿ',
    nameEn: 'Shasthi (Genitive / Possessive)',
    markerKn: 'ಅ',
    markerEn: 'A',
    significance: 'Possession / Of / Belonging to (ಸಂಬಂಧ)',
    suffixExample: 'ಮನೆ + ಅ = ಮನೆಯ (Of the house / house\'s)'
  },
  {
    order: '೭',
    nameKn: 'ಸಪ್ತಮೀ ವಿಭಕ್ತಿ',
    nameEn: 'Sapthami (Locative)',
    markerKn: 'ಅಲ್ಲಿ',
    markerEn: 'Alli',
    significance: 'Location / In / Inside / At (ಅಧಿಕರಣ)',
    suffixExample: 'ಮನೆ + ಅಲ್ಲಿ = ಮನೆಯಲ್ಲಿ (In / at the house)'
  },
  {
    order: '೮',
    nameKn: 'ಸಂಬೋಧನಾ ವಿಭಕ್ತಿ',
    nameEn: 'Sambodhana (Vocative)',
    markerKn: 'ಏ / ಇರಾ',
    markerEn: 'E / Ira',
    significance: 'Addressing / Calling someone directly (ಕರೆ)',
    suffixExample: 'ಗೆಳೆಯ + ಏ = ಗೆಳೆಯನೇ! (O friend!)'
  }
];

const PRESET_NOUNS = [
  {
    rootKn: 'ಮನೆ',
    rootEn: 'House',
    forms: [
      { vib: '೧', formKn: 'ಮನೆಯು', formEn: 'The house (Subject)', translit: 'Maneyu' },
      { vib: '೨', formKn: 'ಮನೆಯನ್ನು', formEn: 'The house (Object)', translit: 'Maneyannu' },
      { vib: '೩', formKn: 'ಮನೆಯಿಂದ', formEn: 'From the house', translit: 'Maneyinda' },
      { vib: '೪', formKn: 'ಮನೆಗೆ', formEn: 'To the house', translit: 'Manege' },
      { vib: '೫', formKn: 'ಮನೆಯ ದೆಸೆಯಿಂದ', formEn: 'Due to the house', translit: 'Maneya deseyinda' },
      { vib: '೬', formKn: 'ಮನೆಯ', formEn: 'Of the house', translit: 'Maneya' },
      { vib: '೭', formKn: 'ಮನೆಯಲ್ಲಿ', formEn: 'In / inside the house', translit: 'Maneyalli' },
      { vib: '೮', formKn: 'ಮನೆಯೇ!', formEn: 'O House!', translit: 'Maneye!' }
    ]
  },
  {
    rootKn: 'ಶಾಲೆ',
    rootEn: 'School',
    forms: [
      { vib: '೧', formKn: 'ಶಾಲೆಯು', formEn: 'The school (Subject)', translit: 'Shaaleyu' },
      { vib: '೨', formKn: 'ಶಾಲೆಯನ್ನು', formEn: 'The school (Object)', translit: 'Shaaleyannu' },
      { vib: '೩', formKn: 'ಶಾಲೆಯಿಂದ', formEn: 'From school', translit: 'Shaaleyinda' },
      { vib: '೪', formKn: 'ಶಾಲೆಗೆ', formEn: 'To school', translit: 'Shaalege' },
      { vib: '೫', formKn: 'ಶಾಲೆಯ ದೆಸೆಯಿಂದ', formEn: 'Due to school', translit: 'Shaaleya deseyinda' },
      { vib: '೬', formKn: 'ಶಾಲೆಯ', formEn: 'School\'s / Of school', translit: 'Shaaleya' },
      { vib: '೭', formKn: 'ಶಾಲೆಯಲ್ಲಿ', formEn: 'In school', translit: 'Shaaleyalli' },
      { vib: '೮', formKn: 'ಶಾಲೆಯೇ!', formEn: 'O School!', translit: 'Shaaleye!' }
    ]
  },
  {
    rootKn: 'ಮರ',
    rootEn: 'Tree',
    forms: [
      { vib: '೧', formKn: 'ಮರವು', formEn: 'The tree (Subject)', translit: 'Maravu' },
      { vib: '೨', formKn: 'ಮರವನ್ನು', formEn: 'The tree (Object)', translit: 'Maravannu' },
      { vib: '೩', formKn: 'ಮರದಿಂದ', formEn: 'From the tree', translit: 'Maradinda' },
      { vib: '೪', formKn: 'ಮರಕ್ಕೆ', formEn: 'To the tree', translit: 'Marakke' },
      { vib: '೫', formKn: 'ಮರದ ದೆಸೆಯಿಂದ', formEn: 'On account of tree', translit: 'Marada deseyinda' },
      { vib: '೬', formKn: 'ಮರದ', formEn: 'Of the tree', translit: 'Marada' },
      { vib: '೭', formKn: 'ಮರದಲ್ಲಿ', formEn: 'On / in the tree', translit: 'Maradalli' },
      { vib: '೮', formKn: 'ಮರವೇ!', formEn: 'O Tree!', translit: 'Marave!' }
    ]
  },
  {
    rootKn: 'ಬೆಂಗಳೂರು',
    rootEn: 'Bengaluru',
    forms: [
      { vib: '೧', formKn: 'ಬೆಂಗಳೂರು', formEn: 'Bengaluru city', translit: 'Bengaluru' },
      { vib: '೨', formKn: 'ಬೆಂಗಳೂರನ್ನು', formEn: 'Bengaluru (Obj)', translit: 'Bengalurannu' },
      { vib: '೩', formKn: 'ಬೆಂಗಳೂರಿನಿಂದ', formEn: 'From Bengaluru', translit: 'Bengaloorininda' },
      { vib: '೪', formKn: 'ಬೆಂಗಳೂರಿಗೆ', formEn: 'To Bengaluru', translit: 'Bengaloorige' },
      { vib: '೫', formKn: 'ಬೆಂಗಳೂರಿನ ದೆಸೆಯಿಂದ', formEn: 'Because of Bengaluru', translit: 'Bengaloorina deseyinda' },
      { vib: '೬', formKn: 'ಬೆಂಗಳೂರಿನ', formEn: 'Of Bengaluru', translit: 'Bengaloorina' },
      { vib: '೭', formKn: 'ಬೆಂಗಳೂರಿನಲ್ಲಿ', formEn: 'In Bengaluru', translit: 'Bengaloorinalli' },
      { vib: '೮', formKn: 'ಬೆಂಗಳೂರೇ!', formEn: 'O Bengaluru!', translit: 'Bengaloore!' }
    ]
  }
];

export default function VibhaktiPratyayaMatrix({ onXP, onToast }) {
  const [selectedNounIdx, setSelectedNounIdx] = useState(0);
  const [activeVibhakti, setActiveVibhakti] = useState(VIBHAKTI_RULES[3]); // Default to Chaturthi (ಗೆ - To)

  const curNoun = PRESET_NOUNS[selectedNounIdx];

  const handleSelectNoun = (i) => {
    playClick();
    setSelectedNounIdx(i);
    onXP && onXP(15);
    onToast && onToast(`✨ Conjugated "${PRESET_NOUNS[i].rootKn}"! +15 XP`, 'xp');
  };

  return (
    <div className="learning-screen" style={{ maxWidth: 880, margin: '0 auto', padding: '1rem' }}>
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.8rem' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0, fontSize: '1.6rem' }}>
            📐 ವಿಭಕ್ತಿ ಪ್ರತ್ಯಯಗಳ ಕೋಷ್ಟಕ (Vibhakti Matrix)
          </h1>
          <p style={{ margin: '0.2rem 0 0', opacity: 0.8, fontSize: '0.9rem' }}>
            Master Kannada Case Endings · How Nouns Transform in Grammar
          </p>
        </div>
        <div style={{ background: 'rgba(255, 107, 53, 0.15)', border: '1px solid rgba(255, 107, 53, 0.35)', padding: '0.5rem 1rem', borderRadius: '12px', fontWeight: 800, color: '#ffa366' }}>
          ೮ ವಿಭಕ್ತಿಗಳು (8 Grammatical Cases)
        </div>
      </div>

      {/* Preset Noun Switcher */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffa366', marginBottom: '0.6rem' }}>
          Select Noun Root to Conjugate:
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          {PRESET_NOUNS.map((n, i) => (
            <button
              key={n.rootKn}
              onClick={() => handleSelectNoun(i)}
              style={{
                padding: '0.6rem 1.2rem',
                borderRadius: '12px',
                border: selectedNounIdx === i ? '2px solid #ffa366' : '1px solid rgba(255,255,255,0.1)',
                background: selectedNounIdx === i ? 'rgba(255, 107, 53, 0.22)' : 'rgba(255,255,255,0.04)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer'
              }}
            >
              <span style={{ fontFamily: 'Noto Sans Kannada', fontSize: '1.1rem' }}>{n.rootKn}</span> ({n.rootEn})
            </button>
          ))}
        </div>
      </div>

      {/* Full 8-Vibhakti Transformation Grid for Selected Noun */}
      <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255, 163, 102, 0.25)', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.8rem' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>
            Conjugations for: <span style={{ color: '#ffa366', fontFamily: 'Noto Sans Kannada' }}>{curNoun.rootKn}</span> ({curNoun.rootEn})
          </div>
          <button
            onClick={() => {
              const allKn = curNoun.forms.map(f => f.formKn).join(', ');
              speakKannada(allKn);
            }}
            style={{
              background: 'linear-gradient(135deg, #ff6b35, #ffa366)',
              border: 'none',
              color: '#fff',
              padding: '0.4rem 0.9rem',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer'
            }}
          >
            🔊 Read All Forms
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.8rem' }}>
          {curNoun.forms.map((item, idx) => {
            const rule = VIBHAKTI_RULES[idx];
            return (
              <div
                key={idx}
                onClick={() => {
                  playClick();
                  setActiveVibhakti(rule);
                  speakKannada(item.formKn);
                }}
                style={{
                  padding: '1rem',
                  borderRadius: '12px',
                  background: activeVibhakti === rule ? 'rgba(255, 107, 53, 0.18)' : 'rgba(255,255,255,0.03)',
                  border: activeVibhakti === rule ? '2px solid #ffa366' : '1px solid rgba(255,255,255,0.08)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.1)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 800 }}>
                    {rule.order}. {rule.nameKn}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#ffa366', fontWeight: 800 }}>
                    +{rule.markerKn}
                  </span>
                </div>
                <div style={{ fontFamily: 'Noto Sans Kannada', fontSize: '1.35rem', fontWeight: 800, color: '#fff', marginBottom: '0.2rem' }}>
                  {item.formKn}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#fda4af', fontWeight: 600 }}>
                  {item.translit}
                </div>
                <div style={{ fontSize: '0.78rem', opacity: 0.75, marginTop: '0.2rem' }}>
                  {item.formEn}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Vibhakti Deep-Dive Explanation Card */}
      {activeVibhakti && (
        <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255, 107, 53, 0.3)', background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.1), rgba(255, 163, 102, 0.05))' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
            <div>
              <span style={{ fontSize: '0.78rem', color: '#ffa366', fontWeight: 800, textTransform: 'uppercase' }}>
                Rule Spotlight · Case {activeVibhakti.order}
              </span>
              <h3 style={{ margin: '0.2rem 0', fontSize: '1.3rem', fontFamily: 'Noto Sans Kannada' }}>
                {activeVibhakti.nameKn} · {activeVibhakti.nameEn}
              </h3>
            </div>
            <button
              onClick={() => speakKannada(`${activeVibhakti.nameKn}. ಪ್ರತ್ಯಯ: ${activeVibhakti.markerKn}. ಉದಾಹರಣೆ: ${activeVibhakti.suffixExample}`)}
              style={{
                background: 'rgba(255, 107, 53, 0.25)',
                border: '1px solid rgba(255, 107, 53, 0.4)',
                borderRadius: '50%',
                width: 42,
                height: 42,
                cursor: 'pointer',
                fontSize: '1.2rem'
              }}
            >
              🔊
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '0.8rem' }}>
            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.9rem', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.2rem' }}>Pratyaya Marker (ಪ್ರತ್ಯಯ):</div>
              <div style={{ fontFamily: 'Noto Sans Kannada', fontSize: '1.2rem', fontWeight: 800, color: '#ffa366' }}>
                {activeVibhakti.markerKn} ({activeVibhakti.markerEn})
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.9rem', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.2rem' }}>Grammatical Function:</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                {activeVibhakti.significance}
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.9rem', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.2rem' }}>Example Breakdown:</div>
              <div style={{ fontFamily: 'Noto Sans Kannada', fontSize: '0.95rem', fontWeight: 700 }}>
                {activeVibhakti.suffixExample}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
