import React, { useState } from 'react';

const DICTIONARY = [
  { e: "Hello", k: "ನಮಸ್ಕಾರ", t: "Namaskara", c: "Greetings" },
  { e: "How are you?", k: "ಹೇಗಿದ್ದೀರಾ?", t: "Hegiddira?", c: "Greetings" },
  { e: "I am fine", k: "ನಾನು ಚೆನ್ನಾಗಿದ್ದೀನಿ", t: "Naanu chennagiddini", c: "Greetings" },
  { e: "What is your name?", k: "ನಿಮ್ಮ ಹೆಸರೇನು?", t: "Nimma hesarenu?", c: "Greetings" },
  { e: "My name is...", k: "ನನ್ನ ಹೆಸರು...", t: "Nanna hesaru...", c: "Greetings" },
  { e: "Thank you", k: "ಧನ್ಯವಾದಗಳು", t: "Dhanyavadagalu", c: "Greetings" },
  { e: "Sorry / Excuse me", k: "ಕ್ಷಮಿಸಿ", t: "Kshamisi", c: "Greetings" },
  { e: "Yes", k: "ಹೌದು", t: "Houdu", c: "Basic" },
  { e: "No", k: "ಇಲ್ಲ", t: "Illa", c: "Basic" },
  { e: "Please", k: "ದಯವಿಟ್ಟು", t: "Dayavittu", c: "Basic" },
  { e: "I don't know", k: "ನನಗೆ ಗೊತ್ತಿಲ್ಲ", t: "Nanage gottilla", c: "Basic" },
  { e: "Do you know English?", k: "ನಿಮಗೆ ಇಂಗ್ಲಿಷ್ ಬರುತ್ತಾ?", t: "Nimage English baruttha?", c: "Basic" },
  { e: "I want water", k: "ನನಗೆ ನೀರು ಬೇಕು", t: "Nanage neeru beku", c: "Food" },
  { e: "Have you had food?", k: "ಊಟ ಆಯ್ತಾ?", t: "Oota aytha?", c: "Food" },
  { e: "It is very tasty", k: "ತುಂಬಾ ರುಚಿಯಾಗಿದೆ", t: "Thumba ruchiyagide", c: "Food" },
  { e: "How much is this?", k: "ಇದಕ್ಕೆ ಎಷ್ಟು?", t: "Idakke eshtu?", c: "Shopping" },
  { e: "It is too expensive", k: "ಇದು ತುಂಬಾ ದುಬಾರಿ", t: "Idu thumba dubari", c: "Shopping" },
  { e: "Give me discount", k: "ಸ್ವಲ್ಪ ಕಡಿಮೆ ಮಾಡಿ", t: "Swalpa kadime maadi", c: "Shopping" },
  { e: "Where is the bus stand?", k: "ಬಸ್ ನಿಲ್ದಾಣ ಎಲ್ಲಿದೆ?", t: "Bus nildana ellide?", c: "Travel" },
  { e: "Stop here", k: "ಇಲ್ಲಿ ನಿಲ್ಲಿಸಿ", t: "Illi nillisi", c: "Travel" },
  { e: "Go straight", k: "ನೇರವಾಗಿ ಹೋಗಿ", t: "Neravagi hogi", c: "Travel" },
  { e: "Turn left", k: "ಎಡಕ್ಕೆ ತಿರುಗಿ", t: "Edakke thirugi", c: "Travel" },
  { e: "Turn right", k: "ಬಲಕ್ಕೆ ತಿರುಗಿ", t: "Balakke thirugi", c: "Travel" },
  { e: "Help me", k: "ಸಹಾಯ ಮಾಡಿ", t: "Sahaya maadi", c: "Emergency" },
  { e: "Call the police", k: "ಪೊಲೀಸ್ ಕರೆಯಿರಿ", t: "Police kareyiri", c: "Emergency" },
  { e: "I am lost", k: "ನಾನು ದಾರಿ ತಪ್ಪಿದ್ದೇನೆ", t: "Naanu daari thappiddeene", c: "Emergency" }
];

const PhraseTranslator = ({ onToast }) => {
  const [q, setQ] = useState('');

  const handleCopy = (txt) => {
    navigator.clipboard.writeText(txt);
    if (onToast) onToast('Copied to clipboard!', 'success');
  };

  const handleSpeak = (txt) => {
    const u = new SpeechSynthesisUtterance(txt);
    u.lang = 'kn-IN';
    window.speechSynthesis.speak(u);
  };

  const results = DICTIONARY.filter(item => 
    item.e.toLowerCase().includes(q.toLowerCase()) || 
    item.k.includes(q) || 
    item.t.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="learning-screen">
      <div className="page-header">
        <h2>🌐 Phrase Translator</h2>
        <p>Search for common English phrases to find their Kannada equivalent.</p>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <input 
          type="text" 
          placeholder="Search in English, Kannada or Transliteration..." 
          value={q}
          onChange={e => setQ(e.target.value)}
          className="form-input"
          style={{ width: '100%', padding: '1.25rem', fontSize: '1.1rem' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {results.length > 0 ? results.map((item, i) => (
          <div key={i} className="glass-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--sakura-pink)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>{item.c}</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.25rem' }}>{item.e}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gold)', marginBottom: '0.25rem' }}>{item.k}</div>
              <div style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>{item.t}</div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={() => handleSpeak(item.k)}
                style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                title="Hear Pronunciation"
              >
                🔊
              </button>
              <button 
                onClick={() => handleCopy(item.k)}
                style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                title="Copy Kannada Script"
              >
                📋
              </button>
            </div>
          </div>
        )) : (
          <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No phrases found for "{q}".
          </div>
        )}
      </div>
    </div>
  );
};

export default PhraseTranslator;
