import React, { useState } from 'react';

const RIDDLES = [
  { riddle:'ಕೆಂಪಗಿದೆ, ಸಿಹಿಯಾಗಿದೆ, ಮರದ ಮೇಲಿದೆ', roman:'Kempagide, sihiyagide, marada melide', hint:'It grows on trees', answer:'ಹಣ್ಣು (Fruit)' },
  { riddle:'ನೀರಲ್ಲಿ ಹುಟ್ಟಿ, ನೀರಲ್ಲಿ ಬೆಳೆದು, ಈಜುತ್ತದೆ', roman:'Neeralli hutti, neeralli beladu, eejuttade', hint:'Lives in water', answer:'ಮೀನು (Fish)' },
  { riddle:'ಹಗಲಲ್ಲಿ ಹೊಳೆಯುತ್ತದೆ, ರಾತ್ರಿ ಮರೆಯಾಗುತ್ತದೆ', roman:'Hagalalli holeyuttade, raatri mareyaguttade', hint:'In the sky', answer:'ಸೂರ್ಯ (Sun)' },
  { riddle:'ರಾತ್ರಿ ಕಾಣಿಸುತ್ತದೆ, ಹಗಲಲ್ಲಿ ಇಲ್ಲ', roman:'Raatri kaanisuttade, hagalalli illa', hint:'Shines at night', answer:'ಚಂದ್ರ (Moon)' },
  { riddle:'ಓದಲು ಬಳಸುತ್ತೇವೆ, ಕಾಗದದ ಮೇಲಿದೆ', roman:'Odalu balasutteve, kagadadmela hide', hint:'You are using it right now', answer:'ಪುಸ್ತಕ (Book)' },
  { riddle:'ಬೆಂಕಿ ಇಲ್ಲದೆ ಬೆಳಕು ಕೊಡುತ್ತದೆ', roman:'Benki illade belaku koduttade', hint:'Uses electricity', answer:'ದೀಪ (Light/Lamp)' },
  { riddle:'ಎಲ್ಲರೂ ಕುಡಿಯುತ್ತಾರೆ, ಬಣ್ಣ ಇಲ್ಲ', roman:'Ellaru kudiyuttare, banna illa', hint:'Essential for life', answer:'ನೀರು (Water)' },
  { riddle:'ಗೋಡೆಯ ಮೇಲೆ ನಡೆಯುತ್ತದೆ', roman:'Godeya mele nadeyuttade', hint:'Has four legs', answer:'ಚಿಕ್ಕ ಜೀವಿ (Lizard)' },
  { riddle:'ಬಾಯಿ ಇದೆ ಆದರೆ ಮಾತಾಡಲ್ಲ, ಕಣ್ಣು ಇದೆ ಆದರೆ ನೋಡಲ್ಲ', roman:'Bayi ide adare maataadalla, kannu ide adare nodalla', hint:'You read it', answer:'ಪ್ರತಿಮೆ / ಚಿತ್ರ (Statue/Picture)' },
  { riddle:'ಹಾಲು ಕೊಡುತ್ತದೆ, ಹೊಲದಲ್ಲಿ ನಡೆಯುತ್ತದೆ', roman:'Haalu koduttade, holadalli nadeyuttade', hint:'A farm animal', answer:'ಹಸು (Cow)' },
];

export default function KannadaRiddles({ onXP, onToast }) {
  const [current, setCurrent] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [solved, setSolved] = useState([]);

  const r = RIDDLES[current];

  function reveal() {
    setShowAnswer(true);
    if (!solved.includes(current)) {
      setSolved(prev => [...prev, current]);
      onXP && onXP(20);
      onToast && onToast('Riddle solved! +20 XP 🎭', 'xp');
    }
  }

  function next() {
    setCurrent(c => (c+1) % RIDDLES.length);
    setShowHint(false); setShowAnswer(false);
  }

  function prev() {
    setCurrent(c => (c-1+RIDDLES.length) % RIDDLES.length);
    setShowHint(false); setShowAnswer(false);
  }

  return (
    <div className="learning-screen">
      <h1 className="page-title" style={{ marginBottom:'0.5rem' }}>🎭 ಒಗಟು · Kannada Riddles</h1>
      <p style={{ opacity:0.6, marginBottom:'1.5rem', fontSize:'0.85rem' }}>Solved: {solved.length}/{RIDDLES.length} · Each worth 20 XP</p>

      <div className="glass-card" style={{ maxWidth:520, margin:'0 auto', padding:'2rem' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.2rem' }}>
          <button onClick={prev} style={{ background:'none', border:'1px solid rgba(255,255,255,0.2)', color:'inherit', borderRadius:8, padding:'0.4rem 0.8rem', cursor:'pointer' }}>←</button>
          <span style={{ opacity:0.6, fontSize:'0.85rem' }}>{current+1} / {RIDDLES.length}</span>
          <button onClick={next} style={{ background:'none', border:'1px solid rgba(255,255,255,0.2)', color:'inherit', borderRadius:8, padding:'0.4rem 0.8rem', cursor:'pointer' }}>→</button>
        </div>

        {solved.includes(current) && <div style={{ background:'rgba(72,199,116,0.15)', border:'1px solid rgba(72,199,116,0.3)', borderRadius:8, padding:'0.4rem 0.8rem', marginBottom:'0.8rem', color:'#48c774', fontSize:'0.82rem', fontWeight:700 }}>✅ Solved!</div>}

        <div style={{ padding:'1.2rem', background:'rgba(255,255,255,0.05)', borderRadius:12, marginBottom:'1.2rem', textAlign:'center' }}>
          <div style={{ fontFamily:'Noto Sans Kannada, sans-serif', fontSize:'1.2rem', fontWeight:700, lineHeight:1.6, marginBottom:'0.8rem' }}>{r.riddle}</div>
          <div style={{ fontSize:'0.78rem', opacity:0.5, fontStyle:'italic' }}>{r.roman}</div>
        </div>

        {showHint && <div style={{ background:'rgba(246,173,85,0.15)', border:'1px solid rgba(246,173,85,0.3)', borderRadius:8, padding:'0.6rem 1rem', marginBottom:'1rem', color:'#f6ad55' }}>💡 Hint: {r.hint}</div>}

        {showAnswer && <div style={{ background:'rgba(72,199,116,0.15)', border:'1px solid rgba(72,199,116,0.3)', borderRadius:8, padding:'0.8rem 1rem', marginBottom:'1rem' }}>
          <div style={{ fontSize:'0.8rem', opacity:0.6, marginBottom:4 }}>Answer:</div>
          <div style={{ fontFamily:'Noto Sans Kannada, sans-serif', fontWeight:800, fontSize:'1.2rem', color:'#48c774' }}>{r.answer}</div>
        </div>}

        <div style={{ display:'flex', gap:'0.8rem' }}>
          {!showHint && !showAnswer && <button className="btn-primary" style={{ flex:1, background:'rgba(246,173,85,0.2)', border:'1px solid rgba(246,173,85,0.4)' }} onClick={() => setShowHint(true)}>💡 Hint</button>}
          {!showAnswer && <button className="btn-primary" style={{ flex:1 }} onClick={reveal}>🔓 Reveal Answer</button>}
          {showAnswer && <button className="btn-primary" style={{ flex:1 }} onClick={next}>Next Riddle →</button>}
        </div>
      </div>

      <div style={{ display:'flex', flexWrap:'wrap', gap:'0.4rem', marginTop:'1.5rem', justifyContent:'center' }}>
        {RIDDLES.map((_, i) => (
          <button key={i} onClick={() => { setCurrent(i); setShowHint(false); setShowAnswer(false); }}
            style={{ width:32, height:32, borderRadius:'50%', border:'none', cursor:'pointer',
              background: solved.includes(i)?'#48c774':i===current?'rgba(255,163,102,0.5)':'rgba(255,255,255,0.1)',
              color:'white', fontWeight:700 }}>{i+1}</button>
        ))}
      </div>
    </div>
  );
}
