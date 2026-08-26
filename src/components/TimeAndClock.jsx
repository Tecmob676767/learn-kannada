import React, { useState } from 'react';

const TIMES = [
  { time:'1:00',  kn:'ಒಂದು ಗಂಟೆ',       roman:'Ondu gante' },
  { time:'2:00',  kn:'ಎರಡು ಗಂಟೆ',       roman:'Eradu gante' },
  { time:'3:00',  kn:'ಮೂರು ಗಂಟೆ',       roman:'Mooru gante' },
  { time:'4:00',  kn:'ನಾಲ್ಕು ಗಂಟೆ',      roman:'Naalku gante' },
  { time:'5:00',  kn:'ಐದು ಗಂಟೆ',        roman:'Aidu gante' },
  { time:'6:00',  kn:'ಆರು ಗಂಟೆ',        roman:'Aaru gante' },
  { time:'7:00',  kn:'ಏಳು ಗಂಟೆ',        roman:'Elu gante' },
  { time:'8:00',  kn:'ಎಂಟು ಗಂಟೆ',       roman:'Entu gante' },
  { time:'9:00',  kn:'ಒಂಬತ್ತು ಗಂಟೆ',    roman:'Ombattu gante' },
  { time:'10:00', kn:'ಹತ್ತು ಗಂಟೆ',      roman:'Hattu gante' },
  { time:'11:00', kn:'ಹನ್ನೊಂದು ಗಂಟೆ',  roman:'Hannomdu gante' },
  { time:'12:00', kn:'ಹನ್ನೆರಡು ಗಂಟೆ',  roman:'Hanneradu gante' },
  { time:'6:30',  kn:'ಆರೂವರೆ ಗಂಟೆ',   roman:'Aaroovare gante' },
  { time:'3:15',  kn:'ಮೂರು ಗಂಟೆ ಹದಿನೈದು', roman:'Mooru gante hadinaydu' },
];

function speak(word) {
  if (!window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(word);
  u.lang = 'kn-IN'; u.rate = 0.85;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

export default function TimeAndClock({ onXP, onToast }) {
  const [mode, setMode] = useState('learn');
  const [qi, setQi] = useState(0);
  const [opts, setOpts] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const now = new Date();
  const currentTime = now.getHours() + ':' + String(now.getMinutes()).padStart(2,'0');

  function startQuiz() {
    setMode('quiz'); setQi(0); setScore(0); setFeedback(null);
    const wrong = shuffle(TIMES.filter((_, j) => j !== 0)).slice(0, 3);
    setOpts(shuffle([TIMES[0], ...wrong]));
  }

  function pick(t) {
    const correct = TIMES[qi];
    if (t.time === correct.time) {
      setScore(s => s+1); setFeedback('correct');
      onXP && onXP(10);
      onToast && onToast('+10 XP! ' + correct.kn, 'xp');
    } else { setFeedback('wrong'); }
    setTimeout(() => {
      const next = qi+1;
      if (next >= TIMES.length) { setMode('done'); return; }
      setQi(next);
      const wrong = shuffle(TIMES.filter((_, j) => j !== next)).slice(0, 3);
      setOpts(shuffle([TIMES[next], ...wrong]));
      setFeedback(null);
    }, 900);
  }

  return (
    <div className="learning-screen">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.2rem' }}>
        <h1 className="page-title">⏰ ಗಂಟೆ · Telling Time</h1>
        {mode==='learn' && <button className="btn-primary" onClick={startQuiz}>Quiz →</button>}
        {(mode==='quiz'||mode==='done') && <button className="btn-primary" onClick={()=>setMode('learn')}>← Study</button>}
      </div>

      {mode==='learn' && (
        <>
          <div className="glass-card" style={{ padding:'1.2rem', marginBottom:'1.5rem', textAlign:'center', background:'rgba(255,163,102,0.1)', border:'1px solid rgba(255,163,102,0.3)' }}>
            <div style={{ fontSize:'0.8rem', opacity:0.6, marginBottom:4 }}>Current Time</div>
            <div style={{ fontSize:'2rem', fontWeight:900 }}>{currentTime}</div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:'0.8rem' }}>
            {TIMES.map(t => (
              <div key={t.time} className="glass-card" style={{ padding:'1rem', cursor:'pointer', display:'flex', gap:'1rem', alignItems:'center' }}
                onClick={() => speak(t.kn)}>
                <div style={{ fontSize:'1.4rem', fontWeight:900, minWidth:55, color:'#ffa366' }}>{t.time}</div>
                <div>
                  <div style={{ fontFamily:'Noto Sans Kannada, sans-serif', fontWeight:800 }}>{t.kn}</div>
                  <div style={{ fontSize:'0.72rem', opacity:0.5, marginTop:2 }}>{t.roman}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {mode==='quiz' && (
        <div className="glass-card" style={{ maxWidth:400, margin:'2rem auto', padding:'2rem', textAlign:'center' }}>
          <div style={{ fontSize:'0.82rem', opacity:0.6, marginBottom:'0.8rem' }}>Q {qi+1}/{TIMES.length} · Score: {score}</div>
          <div style={{ fontSize:'3rem', fontWeight:900, color:'#ffa366', margin:'0.5rem 0 1rem' }}>{TIMES[qi].time}</div>
          <p style={{ fontWeight:700, marginBottom:'1.2rem' }}>How do you say this time in Kannada?</p>
          {feedback && <div style={{ padding:'0.4rem', borderRadius:8, marginBottom:'0.8rem',
            background:feedback==='correct'?'rgba(72,199,116,0.2)':'rgba(253,92,99,0.2)',
            color:feedback==='correct'?'#48c774':'#fd5c63', fontWeight:700 }}>
            {feedback==='correct'?'✅ Correct!':'❌ '+TIMES[qi].kn}</div>}
          <div style={{ display:'flex', flexDirection:'column', gap:'0.6rem' }}>
            {opts.map(o => <button key={o.time} className="btn-primary" onClick={() => !feedback && pick(o)}
              style={{ fontFamily:'Noto Sans Kannada, sans-serif' }}>{o.kn}</button>)}
          </div>
        </div>
      )}

      {mode==='done' && (
        <div className="glass-card" style={{ textAlign:'center', padding:'2.5rem', maxWidth:380, margin:'2rem auto' }}>
          <div style={{ fontSize:'3rem' }}>🏆</div>
          <h2>Score {score}/{TIMES.length}</h2>
          <button className="btn-primary" style={{ marginTop:'1rem' }} onClick={startQuiz}>Again</button>
        </div>
      )}
    </div>
  );
}
