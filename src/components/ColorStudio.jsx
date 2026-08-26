import React, { useState } from 'react';

const COLORS = [
  { kn: 'ಕೆಂಪು', en: 'Red',    hex: '#e53e3e', roman: 'Kempu' },
  { kn: 'ಹಸಿರು', en: 'Green',  hex: '#38a169', roman: 'Hasiru' },
  { kn: 'ನೀಲಿ',  en: 'Blue',   hex: '#3182ce', roman: 'Neeli' },
  { kn: 'ಹಳದಿ', en: 'Yellow', hex: '#d69e2e', roman: 'Haladi' },
  { kn: 'ಬಿಳಿ',  en: 'White',  hex: '#e2e8f0', roman: 'Bili' },
  { kn: 'ಕಪ್ಪು', en: 'Black',  hex: '#1a202c', roman: 'Kappu' },
  { kn: 'ಕಿತ್ತಳೆ', en: 'Orange', hex: '#dd6b20', roman: 'Kittale' },
  { kn: 'ಗುಲಾಬಿ', en: 'Pink',  hex: '#d53f8c', roman: 'Gulabi' },
  { kn: 'ಜಾಂಬಳ', en: 'Purple', hex: '#6b46c1', roman: 'Jambala' },
  { kn: 'ಕಂದು',  en: 'Brown',  hex: '#744210', roman: 'Kandu' },
  { kn: 'ಬೂದು',  en: 'Gray',   hex: '#718096', roman: 'Budu' },
  { kn: 'ಚಿನ್ನ', en: 'Gold',   hex: '#f6e05e', roman: 'Chinna' },
];

function speak(word) {
  if (!window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(word);
  u.lang = 'kn-IN'; u.rate = 0.85;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

export default function ColorStudio({ onXP, onToast }) {
  const [mode, setMode] = useState('learn');
  const [qi, setQi] = useState(0);
  const [opts, setOpts] = useState(() => makeOpts(0));
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);

  function makeOpts(i) {
    const wrong = shuffle(COLORS.filter((_, j) => j !== i)).slice(0, 3);
    return shuffle([COLORS[i], ...wrong]);
  }

  function startQuiz() { setMode('quiz'); setQi(0); setOpts(makeOpts(0)); setScore(0); setFeedback(null); }

  function pick(c) {
    const correct = COLORS[qi];
    if (c.en === correct.en) {
      setFeedback('correct');
      onXP && onXP(15);
      onToast && onToast('Correct! +15 XP 🎉', 'xp');
    } else {
      setFeedback('wrong');
    }
    setTimeout(() => {
      const next = qi + 1;
      if (next >= COLORS.length) { setMode('done'); return; }
      setQi(next); setOpts(makeOpts(next)); setFeedback(null);
    }, 900);
  }

  return (
    <div className="learning-screen">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.2rem' }}>
        <h1 className="page-title">🎨 ಬಣ್ಣಗಳು · Colors</h1>
        {mode === 'learn' && <button className="btn-primary" onClick={startQuiz}>Take Quiz →</button>}
        {(mode === 'quiz'||mode==='done') && <button className="btn-primary" onClick={()=>setMode('learn')}>← Study</button>}
      </div>

      {mode === 'learn' && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))', gap:'0.85rem' }}>
          {COLORS.map(c => (
            <div key={c.en} className="glass-card" style={{ textAlign:'center', padding:'1rem 0.5rem', cursor:'pointer', background: c.en==='White'?'rgba(200,200,200,0.2)':undefined }}
              onClick={() => speak(c.kn)}>
              <div style={{ width:56, height:56, borderRadius:'50%', background:c.hex, margin:'0 auto 0.6rem', border:'2px solid rgba(255,255,255,0.3)', boxShadow:`0 4px 16px ${c.hex}55` }} />
              <div style={{ fontSize:'1.2rem', fontWeight:800, fontFamily:'Noto Sans Kannada, sans-serif' }}>{c.kn}</div>
              <div style={{ fontSize:'0.78rem', opacity:0.7 }}>{c.en}</div>
              <div style={{ fontSize:'0.68rem', opacity:0.5, marginTop:2 }}>{c.roman}</div>
            </div>
          ))}
        </div>
      )}

      {mode === 'quiz' && (
        <div className="glass-card" style={{ maxWidth:420, margin:'2rem auto', padding:'2rem', textAlign:'center' }}>
          <div style={{ fontSize:'0.85rem', opacity:0.6, marginBottom:'1rem' }}>Question {qi+1} / {COLORS.length} · Score: {score}</div>
          <div style={{ width:100, height:100, borderRadius:'50%', background:COLORS[qi].hex, margin:'0 auto 1.5rem', border:'3px solid rgba(255,255,255,0.4)', boxShadow:`0 6px 24px ${COLORS[qi].hex}77` }} />
          <p style={{ marginBottom:'1.2rem', fontWeight:600 }}>What is this color in Kannada?</p>
          {feedback && <div style={{ padding:'0.4rem', borderRadius:8, marginBottom:'0.8rem', background: feedback==='correct'?'rgba(72,199,116,0.2)':'rgba(253,92,99,0.2)', color: feedback==='correct'?'#48c774':'#fd5c63', fontWeight:700 }}>
            {feedback==='correct'?'✅ Correct!':'❌ '+COLORS[qi].kn}
          </div>}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.6rem' }}>
            {opts.map(o => <button key={o.en} className="btn-primary" onClick={() => !feedback && pick(o)}
              style={{ fontFamily:'Noto Sans Kannada, sans-serif', fontSize:'1rem' }}>{o.kn}</button>)}
          </div>
        </div>
      )}

      {mode === 'done' && (
        <div className="glass-card" style={{ textAlign:'center', padding:'2.5rem', maxWidth:380, margin:'2rem auto' }}>
          <div style={{ fontSize:'3rem' }}>🎨</div>
          <h2>Quiz Complete!</h2>
          <p>You earned <strong style={{ color:'#ffa366' }}>{score * 15} XP</strong></p>
          <button className="btn-primary" style={{ marginTop:'1rem' }} onClick={startQuiz}>Play Again</button>
        </div>
      )}
    </div>
  );
}
