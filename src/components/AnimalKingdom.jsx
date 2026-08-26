import React, { useState } from 'react';

const ANIMALS = [
  { kn:'ಆನೆ',   en:'Elephant',  icon:'🐘' }, { kn:'ಹುಲಿ',  en:'Tiger',    icon:'🐯' },
  { kn:'ಸಿಂಹ',  en:'Lion',      icon:'🦁' }, { kn:'ಕೋತಿ',  en:'Monkey',   icon:'🐒' },
  { kn:'ಹಾವು',  en:'Snake',     icon:'🐍' }, { kn:'ಮೊಲ',   en:'Rabbit',   icon:'🐰' },
  { kn:'ನಾಯಿ',  en:'Dog',       icon:'🐕' }, { kn:'ಬೆಕ್ಕು', en:'Cat',      icon:'🐱' },
  { kn:'ಹಸು',   en:'Cow',       icon:'🐄' }, { kn:'ಕೋಳಿ',  en:'Hen',      icon:'🐔' },
  { kn:'ಗಿಳಿ',  en:'Parrot',    icon:'🦜' }, { kn:'ಕಾಗೆ',  en:'Crow',     icon:'🐦' },
  { kn:'ಮೀನು',  en:'Fish',      icon:'🐟' }, { kn:'ಚಿಟ್ಟೆ', en:'Butterfly', icon:'🦋' },
  { kn:'ನವಿಲು', en:'Peacock',   icon:'🦚' }, { kn:'ಕಪ್ಪೆ',  en:'Frog',     icon:'🐸' },
];

function speak(word) {
  if (!window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(word);
  u.lang = 'kn-IN'; u.rate = 0.85;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

export default function AnimalKingdom({ onXP, onToast }) {
  const [mode, setMode] = useState('learn');
  const [qi, setQi] = useState(0);
  const [opts, setOpts] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);

  function startQuiz() {
    setMode('quiz'); setQi(0); setScore(0); setFeedback(null);
    const wrong = shuffle(ANIMALS.filter((_, j) => j !== 0)).slice(0, 3);
    setOpts(shuffle([ANIMALS[0], ...wrong]));
  }

  function pick(a) {
    const correct = ANIMALS[qi];
    if (a.en === correct.en) {
      setScore(s => s+1); setFeedback('correct');
      onXP && onXP(10);
      onToast && onToast(correct.kn + ' (' + correct.en + ') +10 XP!', 'xp');
    } else { setFeedback('wrong'); }
    setTimeout(() => {
      const next = qi+1;
      if (next >= ANIMALS.length) { setMode('done'); return; }
      setQi(next);
      const wrong = shuffle(ANIMALS.filter((_, j) => j !== next)).slice(0, 3);
      setOpts(shuffle([ANIMALS[next], ...wrong]));
      setFeedback(null);
    }, 900);
  }

  return (
    <div className="learning-screen">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.2rem' }}>
        <h1 className="page-title">🦁 ಪ್ರಾಣಿಗಳು · Animals</h1>
        {mode==='learn' && <button className="btn-primary" onClick={startQuiz}>Quiz →</button>}
        {(mode==='quiz'||mode==='done') && <button className="btn-primary" onClick={()=>setMode('learn')}>← Study</button>}
      </div>

      {mode==='learn' && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(120px,1fr))', gap:'0.8rem' }}>
          {ANIMALS.map(a => (
            <div key={a.en} className="glass-card" style={{ textAlign:'center', padding:'1rem 0.5rem', cursor:'pointer' }}
              onClick={() => speak(a.kn)}>
              <div style={{ fontSize:'2.8rem', marginBottom:'0.4rem' }}>{a.icon}</div>
              <div style={{ fontSize:'1.1rem', fontWeight:800, fontFamily:'Noto Sans Kannada, sans-serif' }}>{a.kn}</div>
              <div style={{ fontSize:'0.78rem', opacity:0.65, marginTop:2 }}>{a.en}</div>
            </div>
          ))}
        </div>
      )}

      {mode==='quiz' && (
        <div className="glass-card" style={{ maxWidth:400, margin:'2rem auto', padding:'2rem', textAlign:'center' }}>
          <div style={{ fontSize:'0.82rem', opacity:0.6, marginBottom:'0.8rem' }}>Q {qi+1}/{ANIMALS.length} · Score: {score}</div>
          <div style={{ fontSize:'5rem', margin:'0.5rem 0 1rem' }}>{ANIMALS[qi].icon}</div>
          <p style={{ fontWeight:700, marginBottom:'1.2rem' }}>Select Kannada for: <strong>{ANIMALS[qi].en}</strong></p>
          {feedback && <div style={{ padding:'0.4rem', borderRadius:8, marginBottom:'0.8rem',
            background:feedback==='correct'?'rgba(72,199,116,0.2)':'rgba(253,92,99,0.2)',
            color:feedback==='correct'?'#48c774':'#fd5c63', fontWeight:700 }}>
            {feedback==='correct'?'✅ Correct!':'❌ '+ANIMALS[qi].kn}</div>}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.6rem' }}>
            {opts.map(o => <button key={o.en} className="btn-primary" onClick={() => !feedback && pick(o)}
              style={{ fontFamily:'Noto Sans Kannada, sans-serif', fontSize:'1rem' }}>{o.icon} {o.kn}</button>)}
          </div>
        </div>
      )}

      {mode==='done' && (
        <div className="glass-card" style={{ textAlign:'center', padding:'2.5rem', maxWidth:380, margin:'2rem auto' }}>
          <div style={{ fontSize:'3rem' }}>🏆</div>
          <h2>Score {score}/{ANIMALS.length}</h2>
          <button className="btn-primary" style={{ marginTop:'1rem' }} onClick={startQuiz}>Play Again</button>
        </div>
      )}
    </div>
  );
}
