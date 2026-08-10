import React, { useState } from 'react';

const QUIZ_DATA = [
  { q: "What is the capital of Karnataka?", opts: ["Mysuru", "Hubballi", "Bengaluru", "Mangaluru"], ans: 2 },
  { q: "Which is the state flower of Karnataka?", opts: ["Lotus", "Jasmine", "Rose", "Hibiscus"], ans: 0 }, // It's actually Lotus (Kamala)
  { q: "Which festival is famously celebrated in Mysuru?", opts: ["Ugadi", "Dasara", "Karaga", "Deepavali"], ans: 1 },
  { q: "Who is known as the 'Rashtrakavi' of Karnataka?", opts: ["Pampa", "Kuvempu", "Bendre", "Ranna"], ans: 1 },
  { q: "Which river flows through Srirangapatna?", opts: ["Krishna", "Tungabhadra", "Kaveri", "Sharavathi"], ans: 2 },
  { q: "What is the official state song?", opts: ["Jaya Bharata Jananiya Tanujate", "Vande Mataram", "Hachchevu Kannadada Deepa", "Karunalu Baa Belake"], ans: 0 },
  { q: "Which of these is a famous traditional folk dance of Karnataka?", opts: ["Bharatanatyam", "Yakshagana", "Kathak", "Kuchipudi"], ans: 1 },
  { q: "Who built the famous Gol Gumbaz in Vijayapura?", opts: ["Tipu Sultan", "Hyder Ali", "Mohammed Adil Shah", "Kempe Gowda"], ans: 2 },
  { q: "Which city is known as the 'Silicon Valley of India'?", opts: ["Mysuru", "Bengaluru", "Mangaluru", "Belagavi"], ans: 1 },
  { q: "Which famous engineer's birthday is celebrated as Engineer's Day?", opts: ["Sir M. Visvesvaraya", "C.V. Raman", "Satish Dhawan", "U.R. Rao"], ans: 0 },
];

const CulturalQuiz = ({ onXP, onToast }) => {
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const handlePick = (i) => {
    if (showResult) return;
    setSelected(i);
    setShowResult(true);
    
    if (i === QUIZ_DATA[idx].ans) {
      setScore(s => s + 1);
      if (onXP) onXP(10);
    }
    
    setTimeout(() => {
      setShowResult(false);
      setSelected(null);
      if (idx + 1 < QUIZ_DATA.length) {
        setIdx(idx + 1);
      } else {
        setFinished(true);
        if (onToast) onToast('Quiz completed! Great job.', 'success');
      }
    }, 1500);
  };

  if (finished) {
    return (
      <div className="learning-screen">
        <div className="page-header"><h2>🏯 Cultural Quiz Results</h2></div>
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
            {score > 7 ? '🏆' : score > 4 ? '⭐' : '📚'}
          </div>
          <h2>You scored {score} out of {QUIZ_DATA.length}!</h2>
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
            {score > 7 ? 'Excellent knowledge of Karnataka!' : 'Keep exploring the rich culture of Karnataka!'}
          </p>
          <button className="btn-primary" style={{ width: 'auto', marginTop: '2rem', padding: '1rem 2rem' }} onClick={() => { setIdx(0); setScore(0); setFinished(false); }}>
            Play Again
          </button>
        </div>
      </div>
    );
  }

  const q = QUIZ_DATA[idx];

  return (
    <div className="learning-screen">
      <div className="page-header">
        <h2>🏯 Cultural Quiz</h2>
        <p>Test your knowledge about Karnataka.</p>
      </div>
      
      <div className="glass-card" style={{ padding: '2rem' }}>
        <div style={{ color: 'var(--sakura-pink)', fontWeight: 800, marginBottom: '1rem' }}>Question {idx + 1} of {QUIZ_DATA.length}</div>
        <h3 style={{ fontSize: '1.4rem', marginBottom: '2rem' }}>{q.q}</h3>
        
        <div style={{ display: 'grid', gap: '1rem' }}>
          {q.opts.map((opt, i) => {
            let bg = 'rgba(255,255,255,0.05)';
            let br = '1px solid var(--glass-border)';
            if (showResult) {
              if (i === q.ans) {
                bg = 'rgba(74, 222, 128, 0.2)'; // green
                br = '1px solid #4ade80';
              } else if (i === selected) {
                bg = 'rgba(248, 113, 113, 0.2)'; // red
                br = '1px solid #f87171';
              }
            } else if (selected === i) {
              bg = 'rgba(255,255,255,0.15)';
            }
            return (
              <button
                key={i}
                onClick={() => handlePick(i)}
                style={{
                  padding: '1.25rem',
                  background: bg,
                  border: br,
                  borderRadius: '12px',
                  color: 'var(--text-primary)',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  textAlign: 'left',
                  cursor: showResult ? 'default' : 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CulturalQuiz;
