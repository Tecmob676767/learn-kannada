import React, { useState } from 'react';

const FAMILY = [
  { kn:'ಅಪ್ಪ',    en:'Father',           icon:'👨', roman:'Appa' },
  { kn:'ಅಮ್ಮ',    en:'Mother',           icon:'👩', roman:'Amma' },
  { kn:'ಅಣ್ಣ',    en:'Elder Brother',    icon:'👦', roman:'Anna' },
  { kn:'ತಮ್ಮ',    en:'Younger Brother',  icon:'👶', roman:'Tamma' },
  { kn:'ಅಕ್ಕ',    en:'Elder Sister',     icon:'👧', roman:'Akka' },
  { kn:'ತಂಗಿ',    en:'Younger Sister',   icon:'🧒', roman:'Tangi' },
  { kn:'ಅಜ್ಜ',    en:'Grandfather',      icon:'👴', roman:'Ajja' },
  { kn:'ಅಜ್ಜಿ',   en:'Grandmother',      icon:'👵', roman:'Ajji' },
  { kn:'ಮಾವ',     en:'Uncle',            icon:'🧔', roman:'Mava' },
  { kn:'ಅತ್ತೆ',   en:'Aunt',             icon:'💁', roman:'Atte' },
  { kn:'ಮಗ',      en:'Son',              icon:'👦', roman:'Maga' },
  { kn:'ಮಗಳು',   en:'Daughter',         icon:'👧', roman:'Magalu' },
  { kn:'ಗಂಡ',     en:'Husband',          icon:'🤵', roman:'Ganda' },
  { kn:'ಹೆಂಡತಿ',  en:'Wife',             icon:'👰', roman:'Hendati' },
  { kn:'ಸ್ನೇಹಿತ', en:'Friend',           icon:'🤝', roman:'Snehita' },
  { kn:'ಮಗು',     en:'Baby',             icon:'👶', roman:'Magu' },
];

function speak(word) {
  if (!window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(word);
  u.lang = 'kn-IN'; u.rate = 0.85;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

export default function FamilyTree({ onXP, onToast }) {
  const [mode, setMode] = useState('learn');
  const [qi, setQi] = useState(0);
  const [opts, setOpts] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);

  function startQuiz() {
    const q = shuffle(FAMILY);
    setMode('quiz'); setQi(0); setScore(0); setFeedback(null);
    const wrong = shuffle(FAMILY.filter((_, j) => j !== 0)).slice(0, 3);
    setOpts(shuffle([FAMILY[0], ...wrong]));
  }

  function pick(f) {
    const correct = FAMILY[qi];
    if (f.en === correct.en) {
      setScore(s => s+1);
      setFeedback('correct');
      onXP && onXP(10);
      onToast && onToast(`+10 XP · ${correct.kn} means ${correct.en} ✅`, 'xp');
    } else { setFeedback('wrong'); }
    setTimeout(() => {
      const next = qi+1;
      if (next >= FAMILY.length) { setMode('done'); return; }
      setQi(next);
      const wrong = shuffle(FAMILY.filter((_, j) => j !== next)).slice(0, 3);
      setOpts(shuffle([FAMILY[next], ...wrong]));
      setFeedback(null);
    }, 900);
  }

  return (
    <div className="learning-screen">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.2rem' }}>
        <h1 className="page-title">👨‍👩‍👧‍👦 ಕುಟುಂಬ · Family</h1>
        {mode==='learn' && <button className="btn-primary" onClick={startQuiz}>Quiz →</button>}
        {(mode==='quiz'||mode==='done') && <button className="btn-primary" onClick={()=>setMode('learn')}>← Study</button>}
      </div>

      {mode==='learn' && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:'0.8rem' }}>
          {FAMILY.map(f => (
            <div key={f.en} className="glass-card" style={{ textAlign:'center', padding:'1rem 0.5rem', cursor:'pointer' }}
              onClick={() => speak(f.kn)}>
              <div style={{ fontSize:'2.2rem', marginBottom:'0.3rem' }}>{f.icon}</div>
              <div style={{ fontSize:'1.2rem', fontWeight:800, fontFamily:'Noto Sans Kannada, sans-serif' }}>{f.kn}</div>
              <div style={{ fontSize:'0.8rem', opacity:0.7, marginTop:2 }}>{f.en}</div>
              <div style={{ fontSize:'0.68rem', opacity:0.45, marginTop:2 }}>{f.roman}</div>
            </div>
          ))}
        </div>
      )}

      {mode==='quiz' && (
        <div className="glass-card" style={{ maxWidth:400, margin:'2rem auto', padding:'2rem', textAlign:'center' }}>
          <div style={{ fontSize:'0.82rem', opacity:0.6, marginBottom:'1rem' }}>Q {qi+1}/{FAMILY.length} · Score: {score}</div>
          <div style={{ fontSize:'3.5rem', margin:'0.5rem 0 1rem' }}>{FAMILY[qi].icon}</div>
          <p style={{ fontWeight:700, fontSize:'1.1rem', marginBottom:'1.2rem' }}>Who is this?</p>
          {feedback && <div style={{ padding:'0.4rem', borderRadius:8, marginBottom:'0.8rem',
            background:feedback==='correct'?'rgba(72,199,116,0.2)':'rgba(253,92,99,0.2)',
            color:feedback==='correct'?'#48c774':'#fd5c63', fontWeight:700 }}>
            {feedback==='correct'?'✅ Correct!':'❌ '+FAMILY[qi].kn}</div>}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.6rem' }}>
            {opts.map(o => <button key={o.en} className="btn-primary" onClick={() => !feedback && pick(o)}
              style={{ fontFamily:'Noto Sans Kannada, sans-serif' }}>{o.kn}<br/><span style={{fontSize:'0.7rem',opacity:0.7}}>{o.roman}</span></button>)}
          </div>
        </div>
      )}

      {mode==='done' && (
        <div className="glass-card" style={{ textAlign:'center', padding:'2.5rem', maxWidth:380, margin:'2rem auto' }}>
          <div style={{ fontSize:'3rem' }}>🏆</div>
          <h2>Done! Score {score}/{FAMILY.length}</h2>
          <button className="btn-primary" style={{ marginTop:'1rem' }} onClick={startQuiz}>Again</button>
        </div>
      )}
    </div>
  );
}
