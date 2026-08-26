import React, { useState } from 'react';

export default function CustomDeckCreator({ onXP, onToast }) {
  const [cards, setCards] = useState([
    { kn: 'ಮಲ್ಲಿಗೆ ಹೂವು', en: 'Jasmine Flower', tag: 'Nature' },
    { kn: 'ಬೆಣ್ಣೆ ದೋಸೆ', en: 'Butter Dosa', tag: 'Food' }
  ]);
  const [kannadaInput, setKannadaInput] = useState('');
  const [englishInput, setEnglishInput] = useState('');
  const [tagInput, setTagInput] = useState('General');

  function speak(text) {
    if (!window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'kn-IN';
    u.rate = 0.85;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  function handleAddCard(e) {
    e.preventDefault();
    if (!kannadaInput.trim() || !englishInput.trim()) {
      onToast && onToast('ದಯವಿಟ್ಟು ಎರಡೂ ಪದಗಳನ್ನು ನಮೂದಿಸಿ (Fill both fields)!', 'warning');
      return;
    }

    const newCard = { kn: kannadaInput.trim(), en: englishInput.trim(), tag: tagInput.trim() };
    setCards(c => [newCard, ...c]);
    setKannadaInput('');
    setEnglishInput('');
    onXP && onXP(15);
    onToast && onToast('🃏 Custom Flashcard Added to SRS Deck! +15 XP', 'xp');
  }

  return (
    <div className="learning-screen">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
        <h1 className="page-title">🗂️ ಸ್ವಂತ ಶಬ್ದಕೋಶ · Custom Deck Creator</h1>
        <span style={{ color: '#ffa366', fontWeight: 800 }}>Cards: {cards.length}</span>
      </div>

      <div className="glass-card" style={{ maxWidth: 640, margin: '0 auto', padding: '1.8rem', marginBottom: '1.5rem' }}>
        <h3 style={{ color: '#ffa366', marginBottom: '1rem' }}>➕ Add New Vocabulary Flashcard</h3>
        <form onSubmit={handleAddCard} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', opacity: 0.8, display: 'block', marginBottom: '4px' }}>Kannada Word / Phrase</label>
            <input
              type="text"
              placeholder="e.g. ಸೂರ್ಯಕಾಂತಿ"
              value={kannadaInput}
              onChange={e => setKannadaInput(e.target.value)}
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: 'inherit', fontFamily: 'Noto Sans Kannada, sans-serif' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', opacity: 0.8, display: 'block', marginBottom: '4px' }}>English Meaning</label>
            <input
              type="text"
              placeholder="e.g. Sunflower"
              value={englishInput}
              onChange={e => setEnglishInput(e.target.value)}
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: 'inherit' }}
            />
          </div>

          <button className="btn-primary" type="submit" style={{ padding: '0.8rem', marginTop: '0.4rem' }}>
            Save to Spaced Repetition Deck 💾
          </button>
        </form>
      </div>

      {/* Existing Cards List */}
      <div className="glass-card" style={{ maxWidth: 640, margin: '0 auto', padding: '1.8rem' }}>
        <div style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '1rem' }}>🗂️ Your Saved Custom Cards:</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.8rem' }}>
          {cards.map((c, idx) => (
            <div key={idx} style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: 'Noto Sans Kannada, sans-serif', fontSize: '1.15rem', fontWeight: 800, color: '#ffa366' }}>{c.kn}</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>{c.en}</div>
              </div>
              <button onClick={() => speak(c.kn)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>
                🔊
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
