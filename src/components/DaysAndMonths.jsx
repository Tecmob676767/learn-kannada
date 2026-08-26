import React, { useState, useEffect } from 'react';

const DAYS = [
  { kn:'ಆದಿತ್ಯವಾರ', en:'Sunday',    short:'Sun', idx:0 },
  { kn:'ಸೋಮವಾರ',    en:'Monday',   short:'Mon', idx:1 },
  { kn:'ಮಂಗಳವಾರ',   en:'Tuesday',  short:'Tue', idx:2 },
  { kn:'ಬುಧವಾರ',    en:'Wednesday',short:'Wed', idx:3 },
  { kn:'ಗುರುವಾರ',   en:'Thursday', short:'Thu', idx:4 },
  { kn:'ಶುಕ್ರವಾರ',  en:'Friday',   short:'Fri', idx:5 },
  { kn:'ಶನಿವಾರ',    en:'Saturday', short:'Sat', idx:6 },
];

const MONTHS = [
  { kn:'ಚೈತ್ರ',    en:'March-April' },   { kn:'ವೈಶಾಖ',   en:'April-May' },
  { kn:'ಜ್ಯೇಷ್ಠ',  en:'May-June' },      { kn:'ಆಷಾಡ',    en:'June-July' },
  { kn:'ಶ್ರಾವಣ',   en:'July-August' },   { kn:'ಭಾದ್ರಪದ', en:'August-Sept' },
  { kn:'ಆಶ್ವಿಜ',   en:'Sept-Oct' },      { kn:'ಕಾರ್ತಿಕ', en:'Oct-Nov' },
  { kn:'ಮಾರ್ಗಶಿರ', en:'Nov-Dec' },       { kn:'ಪುಷ್ಯ',   en:'Dec-Jan' },
  { kn:'ಮಾಘ',      en:'Jan-Feb' },        { kn:'ಫಾಲ್ಗುಣ', en:'Feb-March' },
];

function speak(word) {
  if (!window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(word);
  u.lang = 'kn-IN'; u.rate = 0.85;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

export default function DaysAndMonths({ onXP, onToast }) {
  const todayIdx = new Date().getDay();
  const [tab, setTab] = useState('days');
  const [mode, setMode] = useState('learn');
  const [qi, setQi] = useState(0);
  const [opts, setOpts] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);

  function startQuiz() {
    setMode('quiz'); setQi(0); setScore(0); setFeedback(null);
    const wrong = shuffle(DAYS.filter((_, j) => j !== 0)).slice(0, 3);
    setOpts(shuffle([DAYS[0], ...wrong]));
  }

  function pick(d) {
    const correct = DAYS[qi];
    if (d.en === correct.en) {
      setScore(s => s+1); setFeedback('correct');
      onXP && onXP(10);
      onToast && onToast('+10 XP! ' + correct.kn, 'xp');
    } else { setFeedback('wrong'); }
    setTimeout(() => {
      const next = qi+1;
      if (next >= DAYS.length) { setMode('done'); return; }
      setQi(next);
      const wrong = shuffle(DAYS.filter((_, j) => j !== next)).slice(0, 3);
      setOpts(shuffle([DAYS[next], ...wrong]));
      setFeedback(null);
    }, 900);
  }

  const dayColors = ['#f6ad55','#68d391','#63b3ed','#b794f4','#fc8181','#f6e05e','#4fd1c5'];

  return (
    <div className="learning-screen">
      <h1 className="page-title" style={{ marginBottom:'1rem' }}>📅 ದಿನಗಳು · Days & Months</h1>
      <div style={{ display:'flex', gap:'0.5rem', marginBottom:'1.2rem' }}>
        {['days','months'].map(t => (
          <button key={t} className="btn-primary" onClick={() => { setTab(t); setMode('learn'); }}
            style={{ opacity: tab===t?1:0.5, textTransform:'capitalize' }}>{t}</button>
        ))}
        {tab==='days' && mode==='learn' && <button className="btn-primary" style={{ marginLeft:'auto' }} onClick={startQuiz}>Quiz →</button>}
        {mode!=='learn' && <button className="btn-primary" style={{ marginLeft:'auto' }} onClick={()=>setMode('learn')}>← Back</button>}
      </div>

      {tab==='days' && mode==='learn' && (
        <>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:'0.4rem', marginBottom:'1.5rem' }}>
            {DAYS.map(d => (
              <div key={d.en} className="glass-card" style={{
                textAlign:'center', padding:'0.8rem 0.3rem', cursor:'pointer',
                border: d.idx===todayIdx?`2px solid ${dayColors[d.idx]}`:'1px solid transparent',
                background: d.idx===todayIdx?`${dayColors[d.idx]}22`:'',
              }} onClick={() => speak(d.kn)}>
                <div style={{ fontSize:'0.7rem', opacity:0.6 }}>{d.short}</div>
                <div style={{ fontSize:'0.85rem', fontWeight:800, fontFamily:'Noto Sans Kannada, sans-serif', marginTop:2, lineHeight:1.3 }}>{d.kn}</div>
              </div>
            ))}
          </div>
          <p style={{ opacity:0.5, fontSize:'0.8rem', marginBottom:'0.8rem' }}>Today: <strong style={{ color:'#ffa366' }}>{DAYS[todayIdx].kn}</strong></p>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.6rem' }}>
            {DAYS.map((d, i) => (
              <div key={d.en} className="glass-card" style={{ display:'flex', alignItems:'center', gap:'1rem', padding:'0.8rem 1.2rem', cursor:'pointer', borderLeft:`4px solid ${dayColors[i]}` }}
                onClick={() => speak(d.kn)}>
                <div style={{ fontFamily:'Noto Sans Kannada, sans-serif', fontWeight:800, fontSize:'1.2rem', minWidth:120 }}>{d.kn}</div>
                <div style={{ opacity:0.7 }}>{d.en}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab==='months' && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:'0.8rem' }}>
          {MONTHS.map((m, i) => (
            <div key={m.kn} className="glass-card" style={{ padding:'1rem', cursor:'pointer' }} onClick={() => speak(m.kn)}>
              <div style={{ fontSize:'0.8rem', opacity:0.5, marginBottom:4 }}>Month {i+1}</div>
              <div style={{ fontFamily:'Noto Sans Kannada, sans-serif', fontWeight:800, fontSize:'1.15rem' }}>{m.kn}</div>
              <div style={{ fontSize:'0.8rem', opacity:0.7, marginTop:2 }}>{m.en}</div>
            </div>
          ))}
        </div>
      )}

      {mode==='quiz' && (
        <div className="glass-card" style={{ maxWidth:400, margin:'2rem auto', padding:'2rem', textAlign:'center' }}>
          <div style={{ fontSize:'0.82rem', opacity:0.6, marginBottom:'0.8rem' }}>Q {qi+1}/{DAYS.length} · Score: {score}</div>
          <p style={{ fontWeight:700, fontSize:'1.3rem', marginBottom:'1.2rem' }}>{DAYS[qi].en}</p>
          {feedback && <div style={{ padding:'0.4rem', borderRadius:8, marginBottom:'0.8rem',
            background:feedback==='correct'?'rgba(72,199,116,0.2)':'rgba(253,92,99,0.2)',
            color:feedback==='correct'?'#48c774':'#fd5c63', fontWeight:700 }}>
            {feedback==='correct'?'✅ Correct!':'❌ '+DAYS[qi].kn}</div>}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.6rem' }}>
            {opts.map(o => <button key={o.en} className="btn-primary" onClick={() => !feedback && pick(o)}
              style={{ fontFamily:'Noto Sans Kannada, sans-serif' }}>{o.kn}</button>)}
          </div>
        </div>
      )}

      {mode==='done' && (
        <div className="glass-card" style={{ textAlign:'center', padding:'2.5rem', maxWidth:380, margin:'2rem auto' }}>
          <div style={{ fontSize:'3rem' }}>🏆</div>
          <h2>Score {score}/{DAYS.length}</h2>
          <button className="btn-primary" style={{ marginTop:'1rem' }} onClick={startQuiz}>Again</button>
        </div>
      )}
    </div>
  );
}
