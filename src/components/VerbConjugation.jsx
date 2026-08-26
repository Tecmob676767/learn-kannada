import React, { useState } from 'react';

const VERBS = [
  { en:'Eat',   kn:'ತಿನ್ನು', forms:{ i:'ತಿನ್ನುತ್ತೇನೆ', you:'ತಿನ್ನುತ್ತೀಯ', he:'ತಿನ್ನುತ್ತಾನೆ', she:'ತಿನ್ನುತ್ತಾಳೆ', we:'ತಿನ್ನುತ್ತೇವೆ', they:'ತಿನ್ನುತ್ತಾರೆ' }},
  { en:'Drink', kn:'ಕುಡಿ',   forms:{ i:'ಕುಡಿಯುತ್ತೇನೆ', you:'ಕುಡಿಯುತ್ತೀಯ', he:'ಕುಡಿಯುತ್ತಾನೆ', she:'ಕುಡಿಯುತ್ತಾಳೆ', we:'ಕುಡಿಯುತ್ತೇವೆ', they:'ಕುಡಿಯುತ್ತಾರೆ' }},
  { en:'Go',    kn:'ಹೋಗು',   forms:{ i:'ಹೋಗುತ್ತೇನೆ', you:'ಹೋಗುತ್ತೀಯ', he:'ಹೋಗುತ್ತಾನೆ', she:'ಹೋಗುತ್ತಾಳೆ', we:'ಹೋಗುತ್ತೇವೆ', they:'ಹೋಗುತ್ತಾರೆ' }},
  { en:'Come',  kn:'ಬರು',    forms:{ i:'ಬರುತ್ತೇನೆ', you:'ಬರುತ್ತೀಯ', he:'ಬರುತ್ತಾನೆ', she:'ಬರುತ್ತಾಳೆ', we:'ಬರುತ್ತೇವೆ', they:'ಬರುತ್ತಾರೆ' }},
  { en:'Sit',   kn:'ಕುಳಿ',   forms:{ i:'ಕುಳಿಯುತ್ತೇನೆ', you:'ಕುಳಿಯುತ್ತೀಯ', he:'ಕುಳಿಯುತ್ತಾನೆ', she:'ಕುಳಿಯುತ್ತಾಳೆ', we:'ಕುಳಿಯುತ್ತೇವೆ', they:'ಕುಳಿಯುತ್ತಾರೆ' }},
  { en:'Stand', kn:'ನಿಲ್ಲು',  forms:{ i:'ನಿಲ್ಲುತ್ತೇನೆ', you:'ನಿಲ್ಲುತ್ತೀಯ', he:'ನಿಲ್ಲುತ್ತಾನೆ', she:'ನಿಲ್ಲುತ್ತಾಳೆ', we:'ನಿಲ್ಲುತ್ತೇವೆ', they:'ನಿಲ್ಲುತ್ತಾರೆ' }},
  { en:'Read',  kn:'ಓದು',    forms:{ i:'ಓದುತ್ತೇನೆ', you:'ಓದುತ್ತೀಯ', he:'ಓದುತ್ತಾನೆ', she:'ಓದುತ್ತಾಳೆ', we:'ಓದುತ್ತೇವೆ', they:'ಓದುತ್ತಾರೆ' }},
  { en:'Write', kn:'ಬರೆ',    forms:{ i:'ಬರೆಯುತ್ತೇನೆ', you:'ಬರೆಯುತ್ತೀಯ', he:'ಬರೆಯುತ್ತಾನೆ', she:'ಬರೆಯುತ್ತಾಳೆ', we:'ಬರೆಯುತ್ತೇವೆ', they:'ಬರೆಯುತ್ತಾರೆ' }},
];

const PRONOUNS = [
  { key:'i',   kn:'ನಾನು',  en:'I' },
  { key:'you', kn:'ನೀನು',  en:'You' },
  { key:'he',  kn:'ಅವನು',  en:'He' },
  { key:'she', kn:'ಅವಳು',  en:'She' },
  { key:'we',  kn:'ನಾವು',  en:'We' },
  { key:'they',kn:'ಅವರು',  en:'They' },
];

function speak(word) {
  if (!window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(word);
  u.lang = 'kn-IN'; u.rate = 0.85;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

export default function VerbConjugation({ onXP, onToast }) {
  const [selected, setSelected] = useState(0);
  const [quizPron, setQuizPron] = useState(null);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState(null);

  const verb = VERBS[selected];

  function startQuiz() {
    const p = PRONOUNS[Math.floor(Math.random() * PRONOUNS.length)];
    setQuizPron(p); setInput(''); setFeedback(null);
  }

  function checkAnswer() {
    const correct = verb.forms[quizPron.key];
    if (input.trim() === correct) {
      setFeedback('correct');
      onXP && onXP(10);
      onToast && onToast('+10 XP! Correct conjugation!', 'xp');
    } else { setFeedback({ wrong: true, correct }); }
  }

  return (
    <div className="learning-screen">
      <h1 className="page-title" style={{ marginBottom:'1rem' }}>🔤 ಕ್ರಿಯಾಪದ · Verb Conjugation</h1>

      <div style={{ display:'flex', flexWrap:'wrap', gap:'0.5rem', marginBottom:'1.5rem' }}>
        {VERBS.map((v, i) => (
          <button key={v.en} onClick={() => { setSelected(i); setQuizPron(null); setFeedback(null); }}
            className="btn-primary"
            style={{ opacity:selected===i?1:0.5, fontFamily:'Noto Sans Kannada, sans-serif' }}>
            {v.kn} <span style={{ fontSize:'0.7rem' }}>({v.en})</span>
          </button>
        ))}
      </div>

      <div className="glass-card" style={{ marginBottom:'1.5rem', padding:'1.5rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1.2rem' }}>
          <div style={{ fontFamily:'Noto Sans Kannada, sans-serif', fontSize:'2rem', fontWeight:900 }}>{verb.kn}</div>
          <div style={{ opacity:0.7 }}>= {verb.en}</div>
          <button onClick={() => speak(verb.kn)} style={{ marginLeft:'auto', background:'none', border:'1px solid rgba(255,255,255,0.2)', borderRadius:8, padding:'0.3rem 0.7rem', cursor:'pointer', color:'inherit' }}>🔊</button>
        </div>

        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontFamily:'Noto Sans Kannada, sans-serif' }}>
            <thead>
              <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.15)' }}>
                <th style={{ padding:'0.6rem', textAlign:'left', opacity:0.6, fontFamily:'system-ui', fontWeight:600 }}>Pronoun</th>
                <th style={{ padding:'0.6rem', textAlign:'left', opacity:0.6, fontFamily:'system-ui', fontWeight:600 }}>Kannada</th>
                <th style={{ padding:'0.6rem', textAlign:'left', opacity:0.6, fontFamily:'system-ui', fontWeight:600 }}>Conjugated Form</th>
              </tr>
            </thead>
            <tbody>
              {PRONOUNS.map(p => (
                <tr key={p.key} style={{ borderBottom:'1px solid rgba(255,255,255,0.07)', cursor:'pointer' }}
                  onClick={() => speak(p.kn + ' ' + verb.forms[p.key])}>
                  <td style={{ padding:'0.7rem' }}>{p.en}</td>
                  <td style={{ padding:'0.7rem', color:'#ffa366' }}>{p.kn}</td>
                  <td style={{ padding:'0.7rem', fontWeight:700 }}>{verb.forms[p.key]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass-card" style={{ padding:'1.5rem' }}>
        <h3 style={{ marginBottom:'1rem' }}>✍️ Practice Quiz</h3>
        {!quizPron && <button className="btn-primary" onClick={startQuiz}>Start Quiz</button>}
        {quizPron && (
          <div>
            <p style={{ marginBottom:'0.8rem', fontSize:'1.05rem' }}>
              How do you say <strong style={{ color:'#ffa366' }}>{quizPron.en} {verb.en.toLowerCase()}</strong> in Kannada?
              <br/><span style={{ opacity:0.5, fontSize:'0.8rem' }}>({quizPron.kn} + {verb.kn})</span>
            </p>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==='Enter' && checkAnswer()}
              placeholder="Type in Kannada script..." style={{ width:'100%', padding:'0.8rem', background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:8, color:'inherit', fontFamily:'Noto Sans Kannada, sans-serif', fontSize:'1.1rem', marginBottom:'0.8rem' }} />
            {feedback && (
              <div style={{ padding:'0.6rem 1rem', borderRadius:8, marginBottom:'0.8rem',
                background:feedback==='correct'?'rgba(72,199,116,0.2)':'rgba(253,92,99,0.2)',
                color:feedback==='correct'?'#48c774':'#fd5c63', fontWeight:700 }}>
                {feedback==='correct'?'✅ Correct!':('❌ Correct: ' + feedback.correct)}
              </div>
            )}
            <div style={{ display:'flex', gap:'0.8rem' }}>
              <button className="btn-primary" onClick={checkAnswer} style={{ flex:1 }}>Check ✓</button>
              <button className="btn-primary" onClick={startQuiz} style={{ flex:1, opacity:0.7 }}>Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
