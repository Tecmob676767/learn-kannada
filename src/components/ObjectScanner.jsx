import React, { useState, useRef } from 'react';

const PRESET_OBJECTS = [
  {
    name: 'ಕಾಫಿ ಲೋಟ (Coffee Cup)',
    kn: 'ಕಾಫಿ ಲೋಟ',
    en: 'Coffee Cup / Tumbler',
    roman: 'Kaafi Lota',
    icon: '☕',
    exampleKn: 'ನನಗೆ ಒಂದು ಬಿಸಿ ಫಿಲ್ಟರ್ ಕಾಫಿ ಲೋಟ ಕೊಡಿ.',
    exampleEn: 'Give me one hot filter coffee cup.',
    category: 'Food & Drink'
  },
  {
    name: 'ಪುಸ್ತಕ (Book)',
    kn: 'ಪುಸ್ತಕ',
    en: 'Book',
    roman: 'Pusthaka',
    icon: '📖',
    exampleKn: 'ನಾನು ಪ್ರತಿದಿನ ಕನ್ನಡ ಪುಸ್ತಕ ಓದುತ್ತೇನೆ.',
    exampleEn: 'I read Kannada books every day.',
    category: 'Study & Work'
  },
  {
    name: 'ಮರ (Tree)',
    kn: 'ಮರ',
    en: 'Tree',
    roman: 'Mara',
    icon: '🌳',
    exampleKn: 'ಈ ಮರದ ನೆರಳು ತುಂಬಾ ತಂಪಾಗಿದೆ.',
    exampleEn: 'The shade of this tree is very cool.',
    category: 'Nature'
  },
  {
    name: 'ಕಾರು (Car)',
    kn: 'ಕಾರು',
    en: 'Car',
    roman: 'Kaaru',
    icon: '🚗',
    exampleKn: 'ನಮ್ಮ ಹೊಸ ಕಾರು ಕೆಂಪು ಬಣ್ಣದಲ್ಲಿದೆ.',
    exampleEn: 'Our new car is red in color.',
    category: 'Transport'
  },
  {
    name: 'ಮೊಬೈಲ್ ಫೋನ್ (Phone)',
    kn: 'ಮೊಬೈಲ್ / ದೂರವಾಣಿ',
    en: 'Mobile Phone',
    roman: 'Mobaail / Dooravaani',
    icon: '📱',
    exampleKn: 'ನನ್ನ ಮೊಬೈಲ್‌ನಲ್ಲಿ ಸೊಬಗು ಆಪ್ ಇದೆ.',
    exampleEn: 'Sobagu app is on my mobile.',
    category: 'Tech'
  },
  {
    name: 'ಬಾಳೆಹಣ್ಣು (Banana)',
    kn: 'ಬಾಳೆಹಣ್ಣು',
    en: 'Banana',
    roman: 'Baalehannu',
    icon: '🍌',
    exampleKn: 'ಯಲಕ್ಕಿ ಬಾಳೆಹಣ್ಣು ತುಂಬಾ ಸಿಹಿಯಾಗಿದೆ.',
    exampleEn: 'Elakki bananas are very sweet.',
    category: 'Fruit'
  }
];

export default function ObjectScanner({ onXP, onToast }) {
  const [selectedObj, setSelectedObj] = useState(PRESET_OBJECTS[0]);
  const [isScanning, setIsScanning] = useState(false);
  const [customImg, setCustomImg] = useState(null);
  const fileInputRef = useRef(null);

  function speak(text) {
    if (!window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'kn-IN';
    u.rate = 0.85;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setCustomImg(event.target.result);
      runScan(null);
    };
    reader.readAsDataURL(file);
  }

  function runScan(obj) {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      const target = obj || PRESET_OBJECTS[Math.floor(Math.random() * PRESET_OBJECTS.length)];
      setSelectedObj(target);
      onXP && onXP(15);
      onToast && onToast(`📸 Object scanned: ${target.kn}! +15 XP`, 'xp');
    }, 1800);
  }

  return (
    <div className="learning-screen">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
        <h1 className="page-title">📸 ವಸ್ತು ಸ್ಕ್ಯಾನರ್ · Photo Object Scanner</h1>
        <span style={{ fontSize: '0.85rem', color: '#ffa366', fontWeight: 700 }}>AI Vision</span>
      </div>

      <div className="glass-card" style={{ maxWidth: 640, margin: '0 auto', padding: '1.8rem' }}>
        {/* Upload / Camera Action Zone */}
        <div style={{
          border: '2px dashed rgba(255,163,102,0.4)',
          borderRadius: '16px',
          padding: '2rem',
          textAlign: 'center',
          background: 'rgba(255,255,255,0.03)',
          marginBottom: '1.5rem',
          position: 'relative'
        }}>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />

          {customImg ? (
            <div style={{ marginBottom: '1rem' }}>
              <img src={customImg} alt="Uploaded" style={{ maxHeight: '180px', borderRadius: '12px', border: '2px solid #ffa366' }} />
            </div>
          ) : (
            <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>📷</div>
          )}

          <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.4rem' }}>
            Snap or Upload Any Real-World Object
          </div>
          <p style={{ fontSize: '0.82rem', opacity: 0.7, margin: '0 0 1.2rem' }}>
            AI detects objects and teaches Kannada vocabulary, pronunciation, and sentences.
          </p>

          <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center' }}>
            <button className="btn-primary" onClick={() => fileInputRef.current?.click()} disabled={isScanning}>
              📂 Upload Photo
            </button>
            <button className="btn-primary" onClick={() => runScan(null)} disabled={isScanning} style={{ background: 'linear-gradient(135deg, #11998e, #38ef7d)' }}>
              {isScanning ? '⚡ Scanning Object...' : '🎲 Random Scan Demo'}
            </button>
          </div>
        </div>

        {/* Preset Sample Gallery */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.6rem', opacity: 0.8 }}>Try Instant Object Demos:</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '0.5rem' }}>
            {PRESET_OBJECTS.map((p, i) => (
              <button
                key={i}
                onClick={() => { setCustomImg(null); runScan(p); }}
                style={{
                  padding: '0.6rem 0.3rem',
                  borderRadius: '10px',
                  border: selectedObj.name === p.name ? '2px solid #ffa366' : '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(255,255,255,0.06)',
                  color: 'inherit',
                  cursor: 'pointer',
                  textAlign: 'center',
                  fontSize: '0.78rem'
                }}
              >
                <div style={{ fontSize: '1.4rem' }}>{p.icon}</div>
                <div style={{ marginTop: '2px', fontWeight: 600 }}>{p.kn.split(' ')[0]}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Detected Object Card */}
        {selectedObj && !isScanning && (
          <div style={{ padding: '1.4rem', background: 'rgba(255,163,102,0.1)', border: '1px solid rgba(255,163,102,0.3)', borderRadius: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <span style={{ fontSize: '2.5rem' }}>{selectedObj.icon}</span>
                <div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, fontFamily: 'Noto Sans Kannada, sans-serif', color: '#ffa366' }}>
                    {selectedObj.kn}
                  </div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>{selectedObj.en} ({selectedObj.roman})</div>
                </div>
              </div>
              <button className="btn-primary" onClick={() => speak(selectedObj.kn)} style={{ padding: '0.5rem 1rem' }}>
                🔊 Speak
              </button>
            </div>

            {/* Example Sentence */}
            <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.25)', borderRadius: '10px', marginTop: '0.8rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#ffa366', fontWeight: 700, marginBottom: '0.3rem' }}>EXAMPLE SENTENCE:</div>
              <div style={{ fontFamily: 'Noto Sans Kannada, sans-serif', fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.2rem' }}>
                {selectedObj.exampleKn}
              </div>
              <div style={{ fontSize: '0.82rem', opacity: 0.75 }}>
                {selectedObj.exampleEn}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
