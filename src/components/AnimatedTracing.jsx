import React, { useState, useRef, useEffect } from 'react';

const LETTERS = [
  { char: 'ಅ', phonics: 'A (as in Amma / Mother)', icon: '🌸', word: 'ಅಮ್ಮ (Mother)' },
  { char: 'ಆ', phonics: 'Aa (as in Aane / Elephant)', icon: '🐘', word: 'ಆನೆ (Elephant)' },
  { char: 'ಇ', phonics: 'I (as in Illi / Here)', icon: '🏠', word: 'ಇಲ್ಲಿ (Here)' },
  { char: 'ಈ', phonics: 'Ee (as in Eeja / Swim)', icon: '🏊', word: 'ಈಜು (Swim)' },
  { char: 'ಉ', phonics: 'U (as in Oota / Food)', icon: '🍽️', word: 'ಊಟ (Food)' },
  { char: 'ಕ', phonics: 'Ka (as in Kamala / Lotus)', icon: '🪷', word: 'ಕಮಲ (Lotus)' }
];

export default function AnimatedTracing({ onXP, onToast }) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef(null);

  const cur = LETTERS[selectedIdx];

  useEffect(() => {
    clearCanvas();
  }, [selectedIdx]);

  function speak(text) {
    if (!window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'kn-IN';
    u.rate = 0.8;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function startDraw(e) {
    setIsDrawing(true);
    draw(e);
  }

  function stopDraw() {
    setIsDrawing(false);
    onXP && onXP(15);
    onToast && onToast(`✨ Traced "${cur.char}"! +15 XP`, 'xp');
  }

  function draw(e) {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;

    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#ffa366';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ff6b35';

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  return (
    <div className="learning-screen">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
        <h1 className="page-title">✏️ ಅಕ್ಷರ ತರಬೇತಿ · Animated Kids Tracing</h1>
        <button className="btn-primary" onClick={() => speak(cur.word)}>
          🔊 {cur.word}
        </button>
      </div>

      {/* Letter Bar */}
      <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.2rem', overflowX: 'auto', paddingBottom: '0.4rem' }}>
        {LETTERS.map((l, i) => (
          <button
            key={i}
            className="btn-primary"
            onClick={() => setSelectedIdx(i)}
            style={{
              opacity: selectedIdx === i ? 1 : 0.6,
              fontFamily: 'Noto Sans Kannada, sans-serif',
              fontSize: '1.4rem',
              width: '48px',
              height: '48px',
              padding: 0
            }}
          >
            {l.char}
          </button>
        ))}
      </div>

      <div className="glass-card" style={{ maxWidth: 540, margin: '0 auto', padding: '1.8rem', textAlign: 'center' }}>
        <div style={{ fontSize: '0.9rem', color: '#ffa366', fontWeight: 700, marginBottom: '0.3rem' }}>
          {cur.icon} {cur.phonics}
        </div>

        {/* Tracing Canvas Box with Background Template */}
        <div style={{ position: 'relative', width: '280px', height: '280px', margin: '1rem auto', borderRadius: '16px', background: 'rgba(0,0,0,0.4)', border: '2px solid rgba(255,163,102,0.3)', overflow: 'hidden' }}>
          {/* Background Dotted Letter */}
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11rem',
            fontWeight: 900,
            fontFamily: 'Noto Sans Kannada, sans-serif',
            color: 'rgba(255,255,255,0.15)',
            userSelect: 'none',
            pointerEvents: 'none'
          }}>
            {cur.char}
          </div>

          <canvas
            ref={canvasRef}
            width={280}
            height={280}
            onMouseDown={startDraw}
            onMouseUp={stopDraw}
            onMouseMove={draw}
            onTouchStart={startDraw}
            onTouchEnd={stopDraw}
            onTouchMove={draw}
            style={{ position: 'absolute', inset: 0, cursor: 'crosshair', touchAction: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center' }}>
          <button onClick={clearCanvas} style={{ padding: '0.6rem 1.4rem', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'inherit', cursor: 'pointer' }}>
            🧹 Clear
          </button>
          <button className="btn-primary" onClick={() => setSelectedIdx(i => (i + 1) % LETTERS.length)} style={{ padding: '0.6rem 1.8rem' }}>
            Next Letter ➔
          </button>
        </div>
      </div>
    </div>
  );
}
