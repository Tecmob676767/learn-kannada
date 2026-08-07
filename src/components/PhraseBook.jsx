import React, { useState } from 'react';
import { addXP } from '../utils/storage.js';
import { speakKannada } from '../utils/tts.js';

const PHRASES = [
  { category: 'Greetings', icon: '🙏', color: 'linear-gradient(135deg, #667eea, #764ba2)',
    items: [
      { kannada: 'ನಮಸ್ಕಾರ', meaning: 'Hello / Greetings', situation: 'Any time of day' },
      { kannada: 'ಶುಭ ಮುಂಜಾನೆ', meaning: 'Good morning', situation: 'In the morning' },
      { kannada: 'ಶುಭ ಸಂಜೆ', meaning: 'Good evening', situation: 'In the evening' },
      { kannada: 'ಹೇಗಿದ್ದೀರಿ?', meaning: 'How are you? (formal)', situation: 'Formal greeting' },
      { kannada: 'ಹೇಗಿದ್ದಿಯಾ?', meaning: 'How are you? (informal)', situation: 'With friends' },
      { kannada: 'ಚೆನ್ನಾಗಿದ್ದೇನೆ', meaning: 'I am fine', situation: 'Answering a greeting' },
    ]},
  { category: 'Gratitude & Apology', icon: '🙏', color: 'linear-gradient(135deg, #f093fb, #f5576c)',
    items: [
      { kannada: 'ಧನ್ಯವಾದ', meaning: 'Thank you', situation: 'When someone helps you' },
      { kannada: 'ತುಂಬಾ ಧನ್ಯವಾದ', meaning: 'Thank you very much', situation: 'Deep gratitude' },
      { kannada: 'ಕ್ಷಮಿಸಿ', meaning: 'Excuse me / Sorry', situation: 'Apologizing or passing by' },
      { kannada: 'ಪರವಾಗಿಲ್ಲ', meaning: 'It\'s okay / No problem', situation: 'Accepting apology' },
    ]},
  { category: 'Getting Around', icon: '🗺️', color: 'linear-gradient(135deg, #4facfe, #00f2fe)',
    items: [
      { kannada: '...ಎಲ್ಲಿದೆ?', meaning: 'Where is ...?', situation: 'Asking for directions' },
      { kannada: 'ಎಷ್ಟು ದೂರ?', meaning: 'How far?', situation: 'Asking distance' },
      { kannada: 'ನನಗೆ ಅರ್ಥವಾಗಲಿಲ್ಲ', meaning: 'I did not understand', situation: 'If you are confused' },
      { kannada: 'ದಯಮಾಡಿ ನಿಧಾನ ಮಾತಾಡಿ', meaning: 'Please speak slowly', situation: 'When speaking too fast' },
      { kannada: 'ಬಸ್ ನಿಲ್ದಾಣ ಎಲ್ಲಿದೆ?', meaning: 'Where is the bus stop?', situation: 'Finding a bus stop' },
    ]},
  { category: 'Shopping', icon: '🛍️', color: 'linear-gradient(135deg, #43e97b, #38f9d7)',
    items: [
      { kannada: 'ಇದರ ಬೆಲೆ ಎಷ್ಟು?', meaning: 'What is the price of this?', situation: 'In a market' },
      { kannada: 'ತುಂಬಾ ದುಬಾರಿ', meaning: 'Too expensive', situation: 'Bargaining' },
      { kannada: 'ಕಡಿಮೆ ಮಾಡಿ', meaning: 'Please reduce the price', situation: 'Bargaining' },
      { kannada: 'ನನಗೆ ಇದು ಬೇಕು', meaning: 'I want this', situation: 'Buying something' },
      { kannada: 'ಚೀಲ ಕೊಡಿ', meaning: 'Give me a bag', situation: 'At the counter' },
    ]},
  { category: 'Food', icon: '🍽️', color: 'linear-gradient(135deg, #f7971e, #ffd200)',
    items: [
      { kannada: 'ಊಟ ರುಚಿಯಾಗಿದೆ', meaning: 'The food is delicious', situation: 'Complimenting food' },
      { kannada: 'ನೀರು ಕೊಡಿ', meaning: 'Please give me water', situation: 'At a restaurant' },
      { kannada: 'ಇನ್ನೂ ಸ್ವಲ್ಪ ಕೊಡಿ', meaning: 'Give me a little more', situation: 'Asking for more food' },
      { kannada: 'ಬಿಲ್ ತನ್ನಿ', meaning: 'Please bring the bill', situation: 'At a restaurant' },
      { kannada: 'ತುಂಬಾ ಖಾರ', meaning: 'Very spicy', situation: 'Describing food' },
    ]},
  { category: 'Emergency', icon: '🆘', color: 'linear-gradient(135deg, #f5576c, #f093fb)',
    items: [
      { kannada: 'ಸಹಾಯ ಮಾಡಿ!', meaning: 'Please help!', situation: 'Urgent help needed' },
      { kannada: 'ವೈದ್ಯರನ್ನು ಕರೆಯಿರಿ', meaning: 'Call a doctor', situation: 'Medical emergency' },
      { kannada: 'ಪೋಲೀಸ್ ಕರೆಯಿರಿ', meaning: 'Call the police', situation: 'Security emergency' },
      { kannada: 'ನನಗೆ ಹುಷಾರಿಲ್ಲ', meaning: 'I am not feeling well', situation: 'Feeling sick' },
    ]},
];

const PhraseBook = ({ onXP, onToast }) => {
  const [catIdx, setCatIdx] = useState(0);
  const [saved, setSaved] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  const cat = PHRASES[catIdx];

  const toggleSave = (key) => {
    setSaved(s => {
      const n = new Set(s);
      if (n.has(key)) n.delete(key); else { n.add(key); addXP(2); onXP && onXP(2); }
      return n;
    });
  };

  const allPhrases = PHRASES.flatMap(c => c.items.map(item => ({ ...item, category: c.category })));
  const filtered = searchTerm
    ? allPhrases.filter(p => p.meaning.toLowerCase().includes(searchTerm.toLowerCase()) || p.kannada.includes(searchTerm))
    : null;

  return (
    <div className="learning-screen">
      <div className="page-header">
        <h2>📱 Kannada Phrasebook</h2>
        <p>Essential everyday phrases for real-life Kannada conversations!</p>
      </div>

      {/* Search */}
      <input
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        placeholder="🔍 Search phrases in English or Kannada…"
        style={{
          width: '100%', padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.06)',
          border: '2px solid rgba(255,255,255,0.15)', borderRadius: '12px',
          color: 'var(--text-primary)', fontSize: '1rem', outline: 'none',
          boxSizing: 'border-box', marginBottom: '1.5rem',
          fontFamily: 'Noto Sans Kannada, sans-serif',
        }}
      />

      {searchTerm ? (
        /* Search results */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.length === 0 ? (
            <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No phrases found. Try a different search term.
            </div>
          ) : filtered.map((p, i) => (
            <PhraseCard key={i} phrase={p} saved={saved} onSave={toggleSave} label={p.category} />
          ))}
        </div>
      ) : (
        <>
          {/* Category tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            {PHRASES.map((c, i) => (
              <button key={c.category} onClick={() => setCatIdx(i)}
                className={`section-tab${catIdx === i ? ' active' : ''}`}
                style={{ fontSize: '0.8rem' }}>
                {c.icon} {c.category}
              </button>
            ))}
          </div>

          {/* Phrases */}
          <div className="glass-card" style={{ overflow: 'hidden', marginBottom: '1rem' }}>
            <div style={{ background: cat.color, padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.5rem' }}>{cat.icon}</span>
              <h3 style={{ fontWeight: 800, margin: 0 }}>{cat.category}</h3>
            </div>
            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {cat.items.map((p, i) => (
                <PhraseCard key={i} phrase={p} saved={saved} onSave={toggleSave} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const PhraseCard = ({ phrase, saved, onSave }) => {
  const key = phrase.kannada;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem',
      background: saved.has(key) ? 'rgba(67,233,123,0.06)' : 'rgba(255,255,255,0.04)',
      borderRadius: '10px', border: saved.has(key) ? '1px solid rgba(67,233,123,0.25)' : '1px solid transparent',
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: 'Noto Sans Kannada, sans-serif', fontSize: '1.1rem', color: 'var(--sakura-pink)', fontWeight: 600, marginBottom: '0.2rem' }}>
          {phrase.kannada}
        </div>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.15rem' }}>{phrase.meaning}</div>
        {phrase.situation && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>📍 {phrase.situation}</div>
        )}
      </div>
      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
        <button onClick={() => speakKannada(phrase.kannada)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: '0.3rem' }}>
          🔊
        </button>
        <button onClick={() => onSave(key)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: '0.3rem' }}>
          {saved.has(key) ? '⭐' : '☆'}
        </button>
      </div>
    </div>
  );
};

export default PhraseBook;
