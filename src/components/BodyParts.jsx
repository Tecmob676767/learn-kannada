import React, { useState } from 'react';

const BODY = [
  { kn:'ಕೈ',       en:'Hand',    icon:'✋' }, { kn:'ಕಾಲು',    en:'Leg',     icon:'🦵' },
  { kn:'ತಲೆ',      en:'Head',    icon:'🗣️' }, { kn:'ಕಣ್ಮಿ',    en:'Eye',     icon:'👁' },
  { kn:'ಮೂಗು',     en:'Nose',    icon:'👃' }, { kn:'ಬಾಯಿ',    en:'Mouth',   icon:'👄' },
  { kn:'ಕಿವಿ',     en:'Ear',     icon:'👂' }, { kn:'ಮುಖ',     en:'Face',    icon:'😊' },
  { kn:'ಹೊಟ್ಟೆ',   en:'Stomach', icon:'🫃' }, { kn:'ಬೆನ್ನು',   en:'Back',    icon:'🚶' },
  { kn:'ಗಳಲು',     en:'Throat',  icon:'🗣️' }, { kn:'ಪಾದ',     en:'Foot',    icon:'🦶' },
  { kn:'ಬೆರಳು',    en:'Finger',  icon:'☝️' }, { kn:'ಹಲ್ಲು',   en:'Tooth',   icon:'🦷' },
  { kn:'ಹೃದಯ',     en:'Heart',   icon:'❤️' }, { kn:'ತಲೆಕೂದಲು',en:'Hair',    icon:'💇' },
];

function speak(word) {
  if (!window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(word);
  u.lang = 'kn-IN'; u.rate = 0.85;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

export default function BodyParts({ onXP, onToast }) {
  const [mode, setMode] = useState('learn');
  const [qi, setQi] = useState(0);
  const [opts, setOpts] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);

  function startQuiz() {
    setMode('quiz'); setQi(0); setScore(0); setFeedback(null);
    const wrong = shuffle(BODY.filter((_, j) => j !== 0)).slice(0, 3);
    setOpts(shuffle([BODY[0], ...wrong]));
  }

  function pick(b) {
    const correct = BODY[qi];
    if (b.en === correct.en) {
      setScore(s => s+1); setFeedback('correct');
      onXP && onXP(10);
      onToast && onToast('+10 XP ' + correct.kn, 'xp');
    } else { setFeedback('wrong'); }
    setTimeout(() => {
      const next = qi+1;
      if (next >= BODY.length) { setMode('done'); return; }
      setQi(next);
      const wrong = shuffle(BODY.filter((_, j) => j !== next)).slice(0, 3);
      setOpts(shuffle([BODY[next], ...wrong]));
      setFeedback(null);
    }, 900);
  }

  return (
    <div className="learning-screen">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.2rem' }}>
        <h1 className="page-title">🫀 ದೇಹದ ಭಾಗಗಳು · Body Parts</h1>
        {mode==='learn' && <button className="btn-primary" onClick={startQuiz}>Quiz →</button>}
        {(mode==='quiz'||mode==='done') && <button className="btn-primary" onClick={()=>setMode('learn')}>← Study</button>}
      </div>

      {mode==='learn' && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(120px,1fr))', gap:'0.8rem' }}>
          {BODY.map(b => (
            <div key={b.en} className="glass-card" style={{ textAlign:'center', padding:'1rem', cursor:'pointer' }}
              onClick={() => speak(b.kn)}>
              <div style={{ fontSize:'2.5rem', marginBottom:'0.3rem' }}>{b.icon}</div>
              <div style={{ fontSize:'1.05rem', fontWeight:800, fontFamily:'Noto Sans Kannada, sans-serif' }}>{b.kn}</div>
              <div style={{ fontSize:'0.75rem', opacity:0.65, marginTop:2 }}>{b.en}</div>
            </div>
          ))}
        </div>
      )}

      {mode==='quiz' && (
        <div className="glass-card" style={{ maxWidth:400, margin:'2rem auto', padding:'2rem', textAlign:'center' }}>
          <div style={{ fontSize:'0.82rem', opacity:0.6, marginBottom:'0.8rem' }}>Q {qi+1}/{BODY.length} · Score: {score}</div>
          <div style={{ fontSize:'5rem', margin:'0.5rem 0' }}>{BODY[qi].icon}</div>
          <p style={{ fontWeight:700, marginBottom:'1.2rem' }}>Kannada for: <strong>{BODY[qi].en}</strong>?</p>
          {feedback && <div style={{ padding:'0.4rem', borderRadius:8, marginBottom:'0.8rem',
            background:feedback==='correct'?'rgba(72,199,116,0.2)':'rgba(253,92,99,0.2)',
            color:feedback==='correct'?'#48c774':'#fd5c63', fontWeight:700 }}>
            {feedback==='correct'?'✅ Correct!':'❌ '+BODY[qi].kn}</div>}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.6rem' }}>
            {opts.map(o => <button key={o.en} className="btn-primary" onClick={() => !feedback && pick(o)}
              style={{ fontFamily:'Noto Sans Kannada, sans-serif' }}>{o.kn}</button>)}
          </div>
        </div>
      )}

      {mode==='done' && (
        <div className="glass-card" style={{ textAlign:'center', padding:'2.5rem', maxWidth:380, margin:'2rem auto' }}>
          <div style={{ fontSize:'3rem' }}>🏆</div>
          <h2>Score {score}/{BODY.length}</h2>
          <button className="btn-primary" style={{ marginTop:'1rem' }} onClick={startQuiz}>Again</button>
        </div>
      )}
    </div>
  );
}
