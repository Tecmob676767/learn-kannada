import React, { useState } from 'react';

const OPPOSITES = [
  { a:'ದೊಡ್ಡ', aEn:'Big',   b:'ಚಿಕ್ಕ', bEn:'Small' },
  { a:'ಬಿಳಿ',  aEn:'White', b:'ಕಪ್ಪು', bEn:'Black' },
  { a:'ಹಗಲು', aEn:'Day',   b:'ರಾತ್ರಿ', bEn:'Night' },
  { a:'ಬಿಸಿ',  aEn:'Hot',   b:'ತಣ್ಣನೆ', bEn:'Cold' },
  { a:'ಒಳ್ಳೆಯ',aEn:'Good',  b:'ಕೆಟ್ಟ',  bEn:'Bad' },
  { a:'ಬೇಗ',  aEn:'Fast',  b:'ನಿಧಾನ', bEn:'Slow' },
  { a:'ಎತ್ತರ', aEn:'Tall',  b:'ಮೊಟ್ಟ',  bEn:'Short' },
  { a:'ಹೊಸ',   aEn:'New',   b:'ಹಳೆ',   bEn:'Old' },
  { a:'ಬಡ',    aEn:'Poor',  b:'ಶ್ರೀಮಂತ',bEn:'Rich' },
  { a:'ಭಾರ',  aEn:'Heavy', b:'ಹಗುರ',  bEn:'Light' },
  { a:'ಬಲ',    aEn:'Right', b:'ಎಡ',    bEn:'Left' },
  { a:'ಮೇಲೆ', aEn:'Up',    b:'ಕೆಳಗೆ', bEn:'Down' },
];

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

function speak(word) {
  if (!window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(word);
  u.lang = 'kn-IN'; u.rate = 0.85;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

export default function OppositesGame({ onXP, onToast }) {
  const [mode, setMode] = useState('learn');
  const [qi, setQi] = useState(0);
  const [opts, setOpts] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);

  function startQuiz() {
    setMode('quiz'); setQi(0); setScore(0); setFeedback(null);
    const wrong = shuffle(OPPOSITES.filter((_, j) => j !== 0)).slice(0, 3).map(o => o.b);
    setOpts(shuffle([OPPOSITES[0].b, ...wrong]));
  }

  function pick(word) {
    const correct = OPPOSITES[qi].b;
    if (word === correct) {
      setScore(s => s+1); setFeedback('correct');
      onXP && onXP(12);
      onToast && onToast('+12 XP! ' + OPPOSITES[qi].a + ' = ' + OPPOSITES[qi].aEn, 'xp');
    } else { setFeedback('wrong'); }
    setTimeout(() => {
      const next = qi+1;
      if (next >= OPPOSITES.length) { setMode('done'); return; }
      setQi(next);
      const wrong = shuffle(OPPOSITES.filter((_, j) => j !== next)).slice(0, 3).map(o => o.b);
      setOpts(shuffle([OPPOSITES[next].b, ...wrong]));
      setFeedback(null);
    }, 900);
  }

  return (
    <div className="learning-screen">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.2rem' }}>
        <h1 className="page-title">↔️ ವಿರುದ್ಧಾರ್ಥ · Opposites</h1>
        {mode==='learn' && <button className="btn-primary" onClick={startQuiz}>Quiz →</button>}
        {(mode==='quiz'||mode==='done') && <button className="btn-primary" onClick={()=>setMode('learn')}>← Study</button>}
      </div>

      {mode==='learn' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'0.7rem' }}>
          {OPPOSITES.map(o => (
            <div key={o.a} className="glass-card" style={{ display:'flex', alignItems:'center', padding:'0.9rem 1.2rem', gap:'1rem' }}>
              <button onClick={() => speak(o.a)} style={{ fontFamily:'Noto Sans Kannada, sans-serif', fontWeight:800, fontSize:'1.2rem', background:'rgba(255,163,102,0.2)', border:'none', color:'#ffa366', padding:'0.4rem 0.8rem', borderRadius:8, cursor:'pointer', minWidth:80 }}>{o.a}</button>
              <div style={{ opacity:0.5, fontSize:'0.8rem', flex:1 }}>{o.aEn} ↔️ {o.bEn}</div>
              <button onClick={() => speak(o.b)} style={{ fontFamily:'Noto Sans Kannada, sans-serif', fontWeight:800, fontSize:'1.2rem', background:'rgba(100,200,255,0.2)', border:'none', color:'#63b3ed', padding:'0.4rem 0.8rem', borderRadius:8, cursor:'pointer', minWidth:80 }}>{o.b}</button>
            </div>
          ))}
        </div>
      )}

      {mode==='quiz' && (
        <div className="glass-card" style={{ maxWidth:400, margin:'2rem auto', padding:'2rem', textAlign:'center' }}>
          <div style={{ fontSize:'0.82rem', opacity:0.6, marginBottom:'0.8rem' }}>Q {qi+1}/{OPPOSITES.length} · Score: {score}</div>
          <div style={{ fontFamily:'Noto Sans Kannada, sans-serif', fontSize:'2.5rem', fontWeight:900, color:'#ffa366', margin:'0.5rem 0 0.5rem' }}>{OPPOSITES[qi].a}</div>
          <div style={{ opacity:0.6, marginBottom:'1.2rem' }}>({OPPOSITES[qi].aEn})</div>
          <p style={{ fontWeight:700, marginBottom:'1.2rem' }}>Pick the <strong>opposite</strong> in Kannada:</p>
          {feedback && <div style={{ padding:'0.4rem', borderRadius:8, marginBottom:'0.8rem',
            background:feedback==='correct'?'rgba(72,199,116,0.2)':'rgba(253,92,99,0.2)',
            color:feedback==='correct'?'#48c774':'#fd5c63', fontWeight:700 }}>
            {feedback==='correct'?'✅ Correct!':'❌ '+OPPOSITES[qi].b+' ('+OPPOSITES[qi].bEn+')'}</div>}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.6rem' }}>
            {opts.map(o => <button key={o} className="btn-primary" onClick={() => !feedback && pick(o)}
              style={{ fontFamily:'Noto Sans Kannada, sans-serif', fontSize:'1.1rem' }}>{o}</button>)}
          </div>
        </div>
      )}

      {mode==='done' && (
        <div className="glass-card" style={{ textAlign:'center', padding:'2.5rem', maxWidth:380, margin:'2rem auto' }}>
          <div style={{ fontSize:'3rem' }}>🏆</div>
          <h2>Score {score}/{OPPOSITES.length}</h2>
          <button className="btn-primary" style={{ marginTop:'1rem' }} onClick={startQuiz}>Again</button>
        </div>
      )}
    </div>
  );
}
