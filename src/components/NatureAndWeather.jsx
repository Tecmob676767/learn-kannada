import React, { useState } from 'react';

const NATURE = [
  { kn:'ಮಳೆ',    en:'Rain',       icon:'🌧️', roman:'Male' },
  { kn:'ಬಿಸಿಲು',  en:'Sun/Heat',   icon:'☀️', roman:'Bisilu' },
  { kn:'ಗಾಳಿ',   en:'Wind',       icon:'🌬️', roman:'Gaali' },
  { kn:'ಮೀಘ',    en:'Cloud',      icon:'☁️', roman:'Megha' },
  { kn:'ಮಿಂಚು',  en:'Lightning',  icon:'⚡', roman:'Minchu' },
  { kn:'ಋತು',    en:'Season',     icon:'🍂', roman:'Ritu' },
  { kn:'ನದಿ',    en:'River',      icon:'🌊', roman:'Nadi' },
  { kn:'ಬೆಟ್ಟ',  en:'Mountain',   icon:'⛰️', roman:'Betta' },
  { kn:'ಕಾಡು',   en:'Forest',     icon:'🌲', roman:'Kaadu' },
  { kn:'ಕಡಲು',   en:'Sea',        icon:'🌊', roman:'Kadalu' },
  { kn:'ಜಲಪಾತ',  en:'Waterfall',  icon:'💦', roman:'Jalapata' },
  { kn:'ಹಿಮ',    en:'Snow',       icon:'❄️', roman:'Hima' },
  { kn:'ಬೀಚು',   en:'Beach',      icon:'🏖️', roman:'Beechu' },
  { kn:'ಯೆಂಡ',   en:'Heat Wave',  icon:'🔥', roman:'Yenda' },
  { kn:'ಜಾಲ್ವಾರಿ',en:'Drizzle',  icon:'🌦️', roman:'Jalvari' },
  { kn:'ಭೂಕಂಪ',  en:'Earthquake', icon:'🫨', roman:'Bhukampa' },
];

function speak(word) {
  if (!window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(word);
  u.lang = 'kn-IN'; u.rate = 0.85;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

export default function NatureAndWeather({ onXP, onToast }) {
  const [mode, setMode] = useState('learn');
  const [qi, setQi] = useState(0);
  const [opts, setOpts] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);

  function startQuiz() {
    const q = shuffle(NATURE);
    setMode('quiz'); setQi(0); setScore(0); setFeedback(null);
    const wrong = shuffle(NATURE.filter((_, j) => j !== 0)).slice(0, 3);
    setOpts(shuffle([NATURE[0], ...wrong]));
  }

  function pick(n) {
    const correct = NATURE[qi];
    if (n.en === correct.en) {
      setScore(s => s+1); setFeedback('correct');
      onXP && onXP(10);
      onToast && onToast('+10 XP ' + correct.kn, 'xp');
    } else { setFeedback('wrong'); }
    setTimeout(() => {
      const next = qi+1;
      if (next >= NATURE.length) { setMode('done'); return; }
      setQi(next);
      const wrong = shuffle(NATURE.filter((_, j) => j !== next)).slice(0, 3);
      setOpts(shuffle([NATURE[next], ...wrong]));
      setFeedback(null);
    }, 900);
  }

  return (
    <div className="learning-screen">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.2rem' }}>
        <h1 className="page-title">🌿 ಪ್ರಕೃತಿ · Nature & Weather</h1>
        {mode==='learn' && <button className="btn-primary" onClick={startQuiz}>Quiz →</button>}
        {(mode==='quiz'||mode==='done') && <button className="btn-primary" onClick={()=>setMode('learn')}>← Study</button>}
      </div>

      {mode==='learn' && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:'0.85rem' }}>
          {NATURE.map(n => (
            <div key={n.en} className="glass-card" style={{ textAlign:'center', padding:'1rem 0.5rem', cursor:'pointer' }}
              onClick={() => speak(n.kn)}>
              <div style={{ fontSize:'2.5rem', marginBottom:'0.3rem' }}>{n.icon}</div>
              <div style={{ fontSize:'1.1rem', fontWeight:800, fontFamily:'Noto Sans Kannada, sans-serif' }}>{n.kn}</div>
              <div style={{ fontSize:'0.75rem', opacity:0.65, marginTop:2 }}>{n.en}</div>
              <div style={{ fontSize:'0.65rem', opacity:0.45, marginTop:2 }}>{n.roman}</div>
            </div>
          ))}
        </div>
      )}

      {mode==='quiz' && (
        <div className="glass-card" style={{ maxWidth:400, margin:'2rem auto', padding:'2rem', textAlign:'center' }}>
          <div style={{ fontSize:'0.82rem', opacity:0.6, marginBottom:'0.8rem' }}>Q {qi+1}/{NATURE.length} · Score: {score}</div>
          <div style={{ fontSize:'5rem', margin:'0.5rem 0 0.8rem' }}>{NATURE[qi].icon}</div>
          <p style={{ fontWeight:700, marginBottom:'1.2rem' }}>Kannada for: <strong>{NATURE[qi].en}</strong>?</p>
          {feedback && <div style={{ padding:'0.4rem', borderRadius:8, marginBottom:'0.8rem',
            background:feedback==='correct'?'rgba(72,199,116,0.2)':'rgba(253,92,99,0.2)',
            color:feedback==='correct'?'#48c774':'#fd5c63', fontWeight:700 }}>
            {feedback==='correct'?'✅ Correct!':'❌ '+NATURE[qi].kn}</div>}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.6rem' }}>
            {opts.map(o => <button key={o.en} className="btn-primary" onClick={() => !feedback && pick(o)}
              style={{ fontFamily:'Noto Sans Kannada, sans-serif' }}>{o.icon} {o.kn}</button>)}
          </div>
        </div>
      )}

      {mode==='done' && (
        <div className="glass-card" style={{ textAlign:'center', padding:'2.5rem', maxWidth:380, margin:'2rem auto' }}>
          <div style={{ fontSize:'3rem' }}>🏆</div>
          <h2>Score {score}/{NATURE.length}</h2>
          <button className="btn-primary" style={{ marginTop:'1rem' }} onClick={startQuiz}>Again</button>
        </div>
      )}
    </div>
  );
}
