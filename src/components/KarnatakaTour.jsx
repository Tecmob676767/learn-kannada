import React, { useState } from 'react';
import { addXP } from '../utils/storage.js';
import { speakKannada } from '../utils/tts.js';

const LANDMARKS = [
  {
    id: 'mysuru',
    city: 'Mysuru (Mysore)',
    icon: '🏯',
    image: '🏯',
    color: 'linear-gradient(135deg, #f7971e, #ffd200)',
    words: [
      { kannada: 'ಮೈಸೂರು', english: 'Mysuru', transliteration: 'maisūru' },
      { kannada: 'ಅರಮನೆ', english: 'Palace', transliteration: 'aramane' },
      { kannada: 'ದಸರ', english: 'Dasara (Festival)', transliteration: 'dasara' },
      { kannada: 'ಚಾಮುಂಡಿ', english: 'Chamundi (Goddess)', transliteration: 'cāmuṇḍi' },
      { kannada: 'ಸಿಲ್ಕ್', english: 'Silk', transliteration: 'silk' },
    ],
    fact: 'Mysuru is famous for its grand Dasara festival and magnificent Amba Vilas Palace. It is also known as the "City of Palaces".',
  },
  {
    id: 'bengaluru',
    city: 'Bengaluru',
    icon: '🌆',
    color: 'linear-gradient(135deg, #4facfe, #00f2fe)',
    words: [
      { kannada: 'ಬೆಂಗಳೂರು', english: 'Bengaluru', transliteration: 'beṃgaḷūru' },
      { kannada: 'ಉದ್ಯಾನ', english: 'Garden', transliteration: 'udyāna' },
      { kannada: 'ತಂತ್ರಜ್ಞಾನ', english: 'Technology', transliteration: 'tantrajñāna' },
      { kannada: 'ಮಳೆ', english: 'Rain', transliteration: 'maḷe' },
      { kannada: 'ಕಾವೇರಿ', english: 'Kaveri River', transliteration: 'kāvēri' },
    ],
    fact: 'Bengaluru is the capital of Karnataka and is known as the "Garden City" and the "Silicon Valley of India" due to its thriving IT industry.',
  },
  {
    id: 'hampi',
    city: 'Hampi',
    icon: '🏛️',
    color: 'linear-gradient(135deg, #f093fb, #f5576c)',
    words: [
      { kannada: 'ಹಂಪಿ', english: 'Hampi', transliteration: 'hampi' },
      { kannada: 'ವಿಜಯನಗರ', english: 'Vijayanagara', transliteration: 'vijayanagara' },
      { kannada: 'ಶಿಲ್ಪ', english: 'Sculpture', transliteration: 'śilpa' },
      { kannada: 'ದೇವಸ್ಥಾನ', english: 'Temple', transliteration: 'dēvasthāna' },
      { kannada: 'ಇತಿಹಾಸ', english: 'History', transliteration: 'itihāsa' },
    ],
    fact: 'Hampi is a UNESCO World Heritage Site and was the capital of the mighty Vijayanagara Empire. It is famous for its ancient temples and ruins.',
  },
  {
    id: 'coorg',
    city: 'Kodagu (Coorg)',
    icon: '☕',
    color: 'linear-gradient(135deg, #43e97b, #38f9d7)',
    words: [
      { kannada: 'ಕೊಡಗು', english: 'Kodagu', transliteration: 'koḍagu' },
      { kannada: 'ಕಾಫಿ', english: 'Coffee', transliteration: 'kāphi' },
      { kannada: 'ಮಳೆ', english: 'Rain', transliteration: 'maḷe' },
      { kannada: 'ಕಾಡು', english: 'Forest', transliteration: 'kāḍu' },
      { kannada: 'ಬೆಟ್ಟ', english: 'Hill', transliteration: 'beṭṭa' },
    ],
    fact: 'Kodagu (Coorg) is known as the "Scotland of India" and produces some of India\'s finest coffee. It is blessed with lush hills, rivers and dense forests.',
  },
  {
    id: 'mangaluru',
    city: 'Mangaluru',
    icon: '🌊',
    color: 'linear-gradient(135deg, #667eea, #764ba2)',
    words: [
      { kannada: 'ಮಂಗಳೂರು', english: 'Mangaluru', transliteration: 'maṃgaḷūru' },
      { kannada: 'ಸಮುದ್ರ', english: 'Sea', transliteration: 'samudra' },
      { kannada: 'ಮೀನು', english: 'Fish', transliteration: 'mīnu' },
      { kannada: 'ಬಂದರು', english: 'Port / Harbour', transliteration: 'bandaru' },
      { kannada: 'ತೆಂಗಿನಕಾಯಿ', english: 'Coconut', transliteration: 'teṃginakāyi' },
    ],
    fact: 'Mangaluru is a major port city on the Arabian Sea coast of Karnataka. It is famous for its beautiful beaches, seafood and Tulu culture.',
  },
];

const KarnatakaTour = ({ onXP, onToast }) => {
  const [placeIdx, setPlaceIdx] = useState(0);
  const [visitedWords, setVisitedWords] = useState(new Set());
  const [visitedPlaces, setVisitedPlaces] = useState(new Set());

  const place = LANDMARKS[placeIdx];

  const handleWordClick = (word) => {
    speakKannada(word.kannada);
    if (!visitedWords.has(`${place.id}-${word.kannada}`)) {
      setVisitedWords(v => new Set([...v, `${place.id}-${word.kannada}`]));
      addXP(3); onXP && onXP(3);
    }
  };

  const visitPlace = (i) => {
    if (!visitedPlaces.has(LANDMARKS[i].id)) {
      setVisitedPlaces(v => new Set([...v, LANDMARKS[i].id]));
      addXP(10); onXP && onXP(10);
      onToast && onToast(`🗺️ Visited ${LANDMARKS[i].city}! +10 XP`, 'xp');
    }
    setPlaceIdx(i);
  };

  return (
    <div className="learning-screen">
      <div className="page-header">
        <h2>🗺️ Virtual Karnataka Tour</h2>
        <p>Explore Karnataka's famous cities and learn their Kannada words!</p>
      </div>

      {/* Place selector */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {LANDMARKS.map((p, i) => (
          <button key={p.id} onClick={() => visitPlace(i)}
            className={`section-tab${placeIdx === i ? ' active' : ''}`}>
            {p.icon} {p.city}
            {visitedPlaces.has(p.id) && <span style={{ marginLeft: '0.3rem', color: '#43e97b' }}>✓</span>}
          </button>
        ))}
      </div>

      {/* Place card */}
      <div className="glass-card" style={{ overflow: 'hidden', marginBottom: '1.5rem' }}>
        <div style={{ background: place.color, padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>{place.icon}</div>
          <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>{place.city}</h3>
        </div>
        <div style={{ padding: '1.75rem' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            📍 {place.fact}
          </p>

          <h4 style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            🔤 Key Words — Tap to hear pronunciation
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {place.words.map((word, i) => (
              <div key={i}
                onClick={() => handleWordClick(word)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.85rem 1rem',
                  background: visitedWords.has(`${place.id}-${word.kannada}`) ? 'rgba(67,233,123,0.08)' : 'rgba(255,255,255,0.04)',
                  borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s',
                  border: visitedWords.has(`${place.id}-${word.kannada}`) ? '1px solid rgba(67,233,123,0.3)' : '1px solid transparent',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,182,193,0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = visitedWords.has(`${place.id}-${word.kannada}`) ? 'rgba(67,233,123,0.08)' : 'rgba(255,255,255,0.04)'}
              >
                <span style={{ fontFamily: 'Noto Sans Kannada, sans-serif', fontSize: '1.3rem', fontWeight: 700, color: 'var(--sakura-pink)', minWidth: '100px' }}>
                  {word.kannada}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{word.english}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>{word.transliteration}</div>
                </div>
                <span style={{ fontSize: '1.2rem' }}>
                  {visitedWords.has(`${place.id}-${word.kannada}`) ? '✅' : '🔊'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--gold)' }}>{visitedPlaces.size}/{LANDMARKS.length}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Places visited</div>
        </div>
        <div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#43e97b' }}>{visitedWords.size}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Words learned</div>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>💡 Click any word to hear it</div>
        </div>
      </div>
    </div>
  );
};

export default KarnatakaTour;
