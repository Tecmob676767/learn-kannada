import React, { useRef, useState, useEffect, useCallback } from 'react';
import { swaragalu, vyanjanagalu } from '../data/varnamaleData.js';
import { addXP, markExplored } from '../utils/storage.js';

const ALL_LETTERS = [...swaragalu, ...vyanjanagalu];

const HandwritingPractice = ({ onXP, onToast }) => {
  const canvasRef = useRef(null);
  const [letterIdx, setLetterIdx] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState([]);
  const [strokes, setStrokes] = useState([]);

  const letter = ALL_LETTERS[letterIdx];

  const getCtx = () => canvasRef.current?.getContext('2d');

  const drawGuide = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = getCtx();
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fillRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    for (let i = 0; i < w; i += 40) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke();
    }
    for (let i = 0; i < h; i += 40) {
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke();
    }

    // Guide letter
    ctx.font = `${Math.min(w, h) * 0.55}px "Noto Sans Kannada", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(255,182,193,0.18)';
    ctx.fillText(letter.kannada, w / 2, h / 2);

    // Redraw user strokes
    strokes.forEach(stroke => {
      if (stroke.length < 2) return;
      ctx.beginPath();
      ctx.strokeStyle = '#f8a4b8';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.moveTo(stroke[0].x, stroke[0].y);
      stroke.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
      ctx.stroke();
    });
  }, [letter, strokes]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = Math.min(rect.width - 32, 500);
      canvas.height = Math.min(rect.width - 32, 500);
      drawGuide();
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [drawGuide]);

  useEffect(() => { drawGuide(); }, [drawGuide]);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  };

  const startDraw = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    const pos = getPos(e);
    setStrokes(s => [...s, [pos]]);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const pos = getPos(e);
    setStrokes(s => {
      const updated = [...s];
      updated[updated.length - 1] = [...updated[updated.length - 1], pos];
      return updated;
    });
  };

  const endDraw = () => setIsDrawing(false);

  useEffect(() => { drawGuide(); }, [strokes, drawGuide]);

  const handleClear = () => {
    setHistory(h => [...h, strokes]);
    setStrokes([]);
  };

  const handleUndo = () => {
    if (strokes.length === 0 && history.length > 0) {
      setStrokes(history[history.length - 1]);
      setHistory(h => h.slice(0, -1));
    } else {
      setStrokes(s => s.slice(0, -1));
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `kannada-${letter.kannada}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    onToast && onToast('📥 Drawing saved!', 'success');
  };

  const nextLetter = () => {
    if (strokes.length > 0) {
      const key = `handwriting_${letter.kannada}`;
      if (markExplored(key)) {
        addXP(5);
        onXP && onXP(5);
      }
    }
    setStrokes([]);
    setHistory([]);
    setLetterIdx(i => (i + 1) % ALL_LETTERS.length);
  };

  const prevLetter = () => {
    setStrokes([]);
    setHistory([]);
    setLetterIdx(i => (i - 1 + ALL_LETTERS.length) % ALL_LETTERS.length);
  };

  return (
    <div className="learning-screen">
      <div className="page-header">
        <h2>✍️ Handwriting Practice</h2>
        <p>Trace Kannada letters over the guide — use mouse or touch!</p>
      </div>

      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Letter {letterIdx + 1} of {ALL_LETTERS.length}
            </div>
            <div style={{ fontFamily: 'Noto Sans Kannada', fontSize: '2rem', fontWeight: 800, color: 'var(--sakura-pink)' }}>
              {letter.kannada}
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {letter.transliteration}
              {letter.soundLike && ` — ${letter.soundLike}`}
              {letter.group && ` (${letter.group})`}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="glass-btn" onClick={prevLetter}>← Prev</button>
            <button className="glass-btn" onClick={nextLetter}>Next →</button>
          </div>
        </div>

        <div style={{
          display: 'flex', justifyContent: 'center',
          background: 'rgba(0,0,0,0.2)',
          borderRadius: '16px',
          padding: '1rem',
          border: '2px solid rgba(255,255,255,0.1)',
        }}>
          <canvas
            ref={canvasRef}
            style={{ cursor: 'crosshair', touchAction: 'none', borderRadius: '8px', maxWidth: '100%' }}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={endDraw}
            onMouseLeave={endDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={endDraw}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button className="glass-btn" onClick={handleUndo}>↩ Undo</button>
          <button className="glass-btn" onClick={handleClear}>🗑 Clear</button>
          <button className="glass-btn" onClick={handleDownload}>📥 Download</button>
        </div>
      </div>

      {/* Letter picker */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h4 style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Jump to letter</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {ALL_LETTERS.map((l, i) => (
            <button
              key={l.kannada + i}
              onClick={() => { setLetterIdx(i); setStrokes([]); setHistory([]); }}
              style={{
                width: '40px', height: '40px',
                fontFamily: 'Noto Sans Kannada, sans-serif',
                fontSize: '1.1rem',
                background: letterIdx === i ? 'var(--sakura-pink)' : 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '8px',
                color: letterIdx === i ? '#fff' : 'var(--text-primary)',
                cursor: 'pointer',
              }}
            >
              {l.kannada}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HandwritingPractice;
