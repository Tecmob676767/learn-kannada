import React, { useState } from 'react';

const PHRASES = [
  { k: 'ನಮಸ್ಕಾರ', t: 'Namaskara', e: 'Hello / Greetings', cat: 'Greetings' },
  { k: 'ಹೇಗಿದ್ದೀರಾ?', t: 'Hegiddira?', e: 'How are you?', cat: 'Greetings' },
  { k: 'ನಾನು ಚೆನ್ನಾಗಿದ್ದೀನಿ', t: 'Naanu chennagiddini', e: 'I am fine', cat: 'Greetings' },
  { k: 'ನಿಮ್ಮ ಹೆಸರೇನು?', t: 'Nimma hesarenu?', e: 'What is your name?', cat: 'Greetings' },
  { k: 'ಊಟ ಆಯ್ತಾ?', t: 'Oota aytha?', e: 'Had your meal?', cat: 'Food' },
  { k: 'ತುಂಬಾ ರುಚಿಯಾಗಿದೆ', t: 'Thumba ruchiyagide', e: 'Very tasty', cat: 'Food' },
  { k: 'ನೀರು ಬೇಕು', t: 'Neeru beku', e: 'I want water', cat: 'Food' },
  { k: 'ಬಸ್ ನಿಲ್ದಾಣ ಎಲ್ಲಿದೆ?', t: 'Bus nildana ellide?', e: 'Where is the bus stand?', cat: 'Travel' },
  { k: 'ಎಷ್ಟು ಹಣ?', t: 'Eshtu hana?', e: 'How much money?', cat: 'Shopping' },
  { k: 'ಇದು ತುಂಬಾ ದುಬಾರಿ', t: 'Idu thumba dubari', e: 'This is very expensive', cat: 'Shopping' },
  { k: 'ದಯವಿಟ್ಟು ಸಹಾಯ ಮಾಡಿ', t: 'Dayavittu sahaya maadi', e: 'Please help me', cat: 'Emergency' },
  { k: 'ಶುಭೋದಯ', t: 'Shubhodaya', e: 'Good morning', cat: 'Greetings' },
  { k: 'ಶುಭ ರಾತ್ರಿ', t: 'Shubha rathri', e: 'Good night', cat: 'Greetings' },
  { k: 'ಮತ್ತೆ ಸಿಗೋಣ', t: 'Matthe sigona', e: 'See you later', cat: 'Greetings' },
  { k: 'ನನಗೆ ಕನ್ನಡ ಸ್ವಲ್ಪ ಬರುತ್ತೆ', t: 'Nanage Kannada swalpa baruthe', e: 'I know a little Kannada', cat: 'Greetings' },
];

const CATEGORIES = ['All', 'Greetings', 'Food', 'Travel', 'Shopping', 'Emergency'];

const AudioLessons = ({ onXP, onToast }) => {
  const [cat, setCat] = useState('All');
  const [played, setPlayed] = useState(new Set());

  const handleSpeak = (k) => {
    const u = new SpeechSynthesisUtterance(k);
    u.lang = 'kn-IN';
    window.speechSynthesis.speak(u);
    if (!played.has(k)) {
      const p = new Set(played);
      p.add(k);
      setPlayed(p);
      if (onXP) onXP(5);
    }
  };

  const filtered = cat === 'All' ? PHRASES : PHRASES.filter(p => p.cat === cat);

  return (
    <div className="learning-screen">
      <div className="page-header">
        <h2>🎧 Audio Lessons</h2>
        <p>Learn common phrases with native pronunciation.</p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {CATEGORIES.map(c => (
          <button
            key={c}
            className={`btn-primary`}
            style={{ 
              padding: '0.5rem 1rem', 
              background: cat === c ? 'var(--sakura-deep)' : 'rgba(255,255,255,0.1)',
              width: 'auto'
            }}
            onClick={() => setCat(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {filtered.map((p, i) => (
          <div key={i} className="glass-card" style={{ padding: '1.5rem', position: 'relative' }}>
            <div style={{ color: 'var(--sakura-pink)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase' }}>
              {p.cat}
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>{p.k}</div>
            <div style={{ fontStyle: 'italic', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{p.t}</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{p.e}</div>
            
            <button
              onClick={() => handleSpeak(p.k)}
              style={{
                position: 'absolute', top: '1.5rem', right: '1.5rem',
                width: 40, height: 40, borderRadius: '50%',
                background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                color: 'var(--text-primary)', cursor: 'pointer', fontSize: '1.2rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              🔊
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AudioLessons;
