import React, { useState } from 'react';

const EMOTIONS = [
  { kn:'ಸಂತೋಷ', en:'Happy',    icon:'😊', color:'#f6e05e' },
  { kn:'ದುಃಖ',   en:'Sad',      icon:'😢', color:'#63b3ed' },
  { kn:'ಕೋಪ',   en:'Angry',    icon:'😠', color:'#fc8181' },
  { kn:'ಭಯ',    en:'Fear',     icon:'😨', color:'#9f7aea' },
  { kn:'ಆಶ್ಚರ್ಯ',en:'Surprise', icon:'😲', color:'#fbb6ce' },
  { kn:'ಪ್ರೀತಿ',  en:'Love',     icon:'🥰', color:'#f687b3' },
  { kn:'ಆಸೆ',   en:'Hope',     icon:'🌟', color:'#68d391' },
  { kn:'ಆಯಾಸ',  en:'Tired',    icon:'😴', color:'#a0aec0' },
  { kn:'ನಾಚಿಕೆ', en:'Shy',      icon:'😳', color:'#fc8181' },
  { kn:'ಹೆಮ್ಮೆ',  en:'Pride',    icon:'😤', color:'#f6ad55' },
  { kn:'ಸಿಟ್ಟು',  en:'Irritated',icon:'😤', color:'#fc8181' },
  { kn:'ಖುಷಿ',   en:'Joy',      icon:'🎉', color:'#fbd38d' },
];

function speak(word) {
  if (!window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(word);
  u.lang = 'kn-IN'; u.rate = 0.85;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

export default function EmotionCards({ onXP, onToast }) {
  const [bouncing, setBouncing] = useState(null);
  const [mode, setMode] = useState('learn');
  const [qi, setQi] = useState(0);
  const [opts, setOpts] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);

  function handleClick(e) {
    speak(e.kn);
    setBouncing(e.en);
    setTimeout(() => setBouncing(null), 600);
  }

  function startQuiz() {
    setMode('quiz'); setQi(0); setScore(0); setFeedback(null);
    const wrong = shuffle(EMOTIONS.filter((_, j) => j !== 0)).slice(0, 3);
    setOpts(shuffle([EMOTIONS[0], ...wrong]));
  }

  function pick(e) {
    const correct = EMOTIONS[qi];
    if (e.en === correct.en) {
      setScore(s => s+1); setFeedback('correct');
      onXP && onXP(15);
      onToast && onToast('+15 XP · ' + correct.kn + ' = ' + correct.en, 'xp');
    } else { setFeedback('wrong'); }
    setTimeout(() => {
      const next = qi+1;
      if (next >= EMOTIONS.length) { setMode('done'); return; }
      setQi(next);
      const wrong = shuffle(EMOTIONS.filter((_, j) => j !== next)).slice(0, 3);
      setOpts(shuffle([EMOTIONS[next], ...wrong]));
      setFeedback(null);
    }, 900);
  }

  return (
    <div className="learning-screen">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.2rem' }}>
        <h1 className="page-title">💭 ಭಾವನೆಗಳು · Emotions</h1>
        {mode==='learn' && <button className="btn-primary" onClick={startQuiz}>Quiz →</button>}
        {(mode==='quiz'||mode==='done') && <button className="btn-primary" onClick={()=>setMode('learn')}>← Study</button>}
      </div>

      {mode==='learn' && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))', gap:'0.85rem' }}>
          {EMOTIONS.map(e => (
            <div key={e.en} className="glass-card" style={{
              textAlign:'center', padding:'1.2rem 0.5rem', cursor:'pointer',
              border:`1px solid ${e.color}44`,
              transform: bouncing===e.en ? 'scale(1.15)' : 'scale(1)',
              transition:'transform 0.2s',
            }} onClick={() => handleClick(e)}>
              <div style={{ fontSize:'3rem', marginBottom:'0.3rem' }}>{e.icon}</div>
              <div style={{ fontSize:'1.1rem', fontWeight:800, fontFamily:'Noto Sans Kannada, sans-serif', color:e.color }}>{e.kn}</div>
              <div style={{ fontSize:'0.78rem', opacity:0.7, marginTop:2 }}>{e.en}</div>
            </div>
          ))}
        </div>
      )}

      {mode==='quiz' && (
        <div className="glass-card" style={{ maxWidth:400, margin:'2rem auto', padding:'2rem', textAlign:'center' }}>
          <div style={{ fontSize:'0.82rem', opacity:0.6, marginBottom:'0.8rem' }}>Q {qi+1}/{EMOTIONS.length} · Score: {score}</div>
          <div style={{ fontSize:'5rem', margin:'0.5rem 0 1rem' }}>{EMOTIONS[qi].icon}</div>
          <p style={{ fontWeight:700, marginBottom:'1.2rem' }}>What emotion is this?</p>
          {feedback && <div style={{ padding:'0.4rem', borderRadius:8, marginBottom:'0.8rem',
            background:feedback==='correct'?'rgba(72,199,116,0.2)':'rgba(253,92,99,0.2)',
            color:feedback==='correct'?'#48c774':'#fd5c63', fontWeight:700 }}>
            {feedback==='correct'?'✅ Correct!':'❌ '+EMOTIONS[qi].kn}</div>}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.6rem' }}>
            {opts.map(o => <button key={o.en} className="btn-primary" onClick={() => !feedback && pick(o)}
              style={{ fontFamily:'Noto Sans Kannada, sans-serif' }}>{o.kn}</button>)}
          </div>
        </div>
      )}

      {mode==='done' && (
        <div className="glass-card" style={{ textAlign:'center', padding:'2.5rem', maxWidth:380, margin:'2rem auto' }}>
          <div style={{ fontSize:'3rem' }}>🏆</div>
          <h2>Score {score}/{EMOTIONS.length}</h2>
          <button className="btn-primary" style={{ marginTop:'1rem' }} onClick={startQuiz}>Play Again</button>
        </div>
      )}
    </div>
  );
}
