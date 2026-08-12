import React, { useEffect, useRef, useState } from 'react';

// ── Plumine Coders Logo SVG ────────────────────────────────────────────────
const PlumineLogo = ({ size = 80, animate = false }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ filter: animate ? 'drop-shadow(0 0 24px rgba(79,172,254,0.8))' : 'none', transition: 'filter 1s ease' }}
  >
    <defs>
      <linearGradient id="pl_bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%"   stopColor="#0f0c29" />
        <stop offset="50%"  stopColor="#302b63" />
        <stop offset="100%" stopColor="#24243e" />
      </linearGradient>
      <linearGradient id="pl_blue" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%"   stopColor="#4facfe" />
        <stop offset="100%" stopColor="#00f2fe" />
      </linearGradient>
      <linearGradient id="pl_gold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%"   stopColor="#ffd700" />
        <stop offset="100%" stopColor="#ff8c00" />
      </linearGradient>
      <linearGradient id="pl_purple" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%"   stopColor="#a18cd1" />
        <stop offset="100%" stopColor="#fbc2eb" />
      </linearGradient>
      <filter id="pl_glow">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
    </defs>

    {/* Outer ring */}
    <circle cx="60" cy="60" r="57" fill="url(#pl_bg)" stroke="url(#pl_blue)" strokeWidth="3" filter="url(#pl_glow)" />
    <circle cx="60" cy="60" r="50" stroke="rgba(79,172,254,0.3)" strokeWidth="1" strokeDasharray="6 3" />

    {/* Code brackets < > */}
    <text x="18" y="72" fill="url(#pl_blue)" fontSize="38" fontWeight="900" fontFamily="monospace" filter="url(#pl_glow)">&lt;</text>
    <text x="80" y="72" fill="url(#pl_blue)" fontSize="38" fontWeight="900" fontFamily="monospace" filter="url(#pl_glow)">&gt;</text>

    {/* Center P letter */}
    <text x="60" y="73" textAnchor="middle" fill="url(#pl_gold)" fontSize="30" fontWeight="900" fontFamily="sans-serif" filter="url(#pl_glow)">P</text>

    {/* Three dots bottom */}
    <circle cx="44" cy="96" r="3" fill="url(#pl_blue)" />
    <circle cx="60" cy="96" r="3" fill="url(#pl_purple)" />
    <circle cx="76" cy="96" r="3" fill="url(#pl_gold)" />

    {/* Top stars */}
    <circle cx="40" cy="22" r="2" fill="#4facfe" opacity="0.8" />
    <circle cx="60" cy="14" r="2.5" fill="#ffd700" opacity="0.9" />
    <circle cx="80" cy="22" r="2" fill="#4facfe" opacity="0.8" />
  </svg>
);

// ── Particle spawner ───────────────────────────────────────────────────────
const Particles = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 120 }, () => ({
      x:  Math.random() * canvas.width,
      y:  Math.random() * canvas.height,
      r:  Math.random() * 2.5 + 0.5,
      dx: (Math.random() - 0.5) * 0.6,
      dy: (Math.random() - 0.5) * 0.6,
      hue: Math.random() < 0.5 ? 210 : Math.random() < 0.5 ? 45 : 280,
      opacity: Math.random() * 0.7 + 0.3,
    }));

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 100%, 70%, ${p.opacity})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = `hsla(${p.hue}, 100%, 70%, 0.5)`;
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width)  p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }} />;
};

// ── Typewriter text ────────────────────────────────────────────────────────
const Typewriter = ({ text = '', delay = 60, onDone }) => {
  const [displayed, setDisplayed] = useState('');
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (idx >= text.length) { onDone?.(); return; }
    const t = setTimeout(() => {
      setDisplayed(prev => prev + text[idx]);
      setIdx(i => i + 1);
    }, delay);
    return () => clearTimeout(t);
  }, [idx, text, delay, onDone]);

  return (
    <span>
      {displayed}
      <span style={{ opacity: idx < text.length ? 1 : 0, animation: 'cursor-blink 0.8s steps(1) infinite' }}>|</span>
    </span>
  );
};

// ── Loading ring ───────────────────────────────────────────────────────────
const LoadingRing = ({ progress = 0 }) => {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - progress / 100);
  return (
    <svg width="130" height="130" viewBox="0 0 130 130">
      <circle cx="65" cy="65" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="6" />
      <circle
        cx="65" cy="65" r={r} fill="none"
        stroke="url(#ring_grad)" strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        style={{ transform: 'rotate(-90deg)', transformOrigin: '65px 65px', transition: 'stroke-dashoffset 0.1s linear' }}
      />
      <defs>
        <linearGradient id="ring_grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#4facfe" />
          <stop offset="50%"  stopColor="#a18cd1" />
          <stop offset="100%" stopColor="#ffd700" />
        </linearGradient>
      </defs>
      <text x="65" y="70" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="900" fontFamily="sans-serif">
        {Math.round(progress)}%
      </text>
    </svg>
  );
};

// ── Main Splash Screen ─────────────────────────────────────────────────────
const SplashScreen = ({ onDone }) => {
  const [phase, setPhase]       = useState(0);   // 0=logo, 1=name, 2=tagline, 3=bar, 4=done
  const [logoScale, setLogoScale] = useState(0);
  const [logoGlow, setLogoGlow]  = useState(false);
  const [progress, setProgress]  = useState(0);
  const [typeStarted, setTypeStarted] = useState(false);
  const [taglineStarted, setTaglineStarted] = useState(false);
  const [typeDone, setTypeDone]  = useState(false);
  const [taglineDone, setTaglineDone] = useState(false);
  const [fadeOut, setFadeOut]    = useState(false);

  // ── Play chime sound via Web Audio API ──────────────────────────────────
  const playChime = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6
      notes.forEach((freq, i) => {
        const osc   = ctx.createOscillator();
        const gain  = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type      = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
        gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.12);
        gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + i * 0.12 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.5);
        osc.start(ctx.currentTime + i * 0.12);
        osc.stop(ctx.currentTime  + i * 0.12 + 0.5);
      });
    } catch {}
  };

  const playWhoosh = () => {
    try {
      const ctx  = new (window.AudioContext || window.webkitAudioContext)();
      const src  = ctx.createOscillator();
      const gain = ctx.createGain();
      src.connect(gain);
      gain.connect(ctx.destination);
      src.type = 'sawtooth';
      src.frequency.setValueAtTime(80, ctx.currentTime);
      src.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      src.start(); src.stop(ctx.currentTime + 0.4);
    } catch {}
  };

  // ── Phase timeline ──────────────────────────────────────────────────────
  useEffect(() => {
    // Phase 0 → logo pops in
    const t1 = setTimeout(() => { setLogoScale(1); playWhoosh(); }, 300);
    const t2 = setTimeout(() => { setLogoGlow(true); playChime(); setPhase(1); setTypeStarted(true); }, 900);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // After name typed → start tagline
  useEffect(() => {
    if (typeDone) {
      const t = setTimeout(() => { setPhase(2); setTaglineStarted(true); }, 200);
      return () => clearTimeout(t);
    }
  }, [typeDone]);

  // After tagline → progress bar
  useEffect(() => {
    if (taglineDone) {
      const t = setTimeout(() => setPhase(3), 200);
      return () => clearTimeout(t);
    }
  }, [taglineDone]);

  // Progress bar ticks
  useEffect(() => {
    if (phase !== 3) return;
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(interval); return 100; }
        return p + 1.5;
      });
    }, 20);
    return () => clearInterval(interval);
  }, [phase]);

  // Progress done → fade out
  useEffect(() => {
    if (progress >= 100) {
      const t = setTimeout(() => { setFadeOut(true); }, 400);
      const t2 = setTimeout(() => { onDone?.(); }, 1100);
      return () => { clearTimeout(t); clearTimeout(t2); };
    }
  }, [progress, onDone]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column',
      background: 'radial-gradient(circle at 40% 30%, #0f0c29 0%, #1a0535 40%, #060212 100%)',
      overflow: 'hidden',
      opacity: fadeOut ? 0 : 1,
      transition: 'opacity 0.7s ease',
      fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif",
    }}>
      {/* Ambient particles */}
      <Particles />

      {/* Glow orbs */}
      <div style={{ position: 'absolute', top: '15%', left: '20%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,172,254,0.18) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '20%', right: '20%', width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(161,140,209,0.2) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />

      {/* Main card */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', textAlign: 'center', padding: '0 2rem', maxWidth: 500, width: '100%' }}>

        {/* Logo with scale-in animation */}
        <div style={{
          transform: `scale(${logoScale})`,
          transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
          filter: logoGlow ? 'drop-shadow(0 0 30px rgba(79,172,254,0.6))' : 'none',
        }}>
          <PlumineLogo size={110} animate={logoGlow} />
        </div>

        {/* Brand name typewriter */}
        <div style={{
          opacity: phase >= 1 ? 1 : 0, transition: 'opacity 0.4s ease',
          fontSize: 'clamp(2rem, 6vw, 3rem)', fontWeight: 900, letterSpacing: '-1px',
          background: 'linear-gradient(135deg, #4facfe 0%, #a18cd1 50%, #ffd700 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          lineHeight: 1.1,
        }}>
          {typeStarted && (
            <Typewriter text="Plumine LTD" delay={65} onDone={() => setTypeDone(true)} />
          )}
        </div>

        {/* Tagline typewriter */}
        <div style={{
          opacity: phase >= 2 ? 1 : 0, transition: 'opacity 0.4s ease',
          fontSize: 'clamp(0.95rem, 2.5vw, 1.15rem)', color: 'rgba(255,255,255,0.75)',
          fontWeight: 600, letterSpacing: '0.5px',
          minHeight: '1.6em',
        }}>
          {taglineStarted && (
            <Typewriter text="Created by Plumine Coder ✦" delay={45} onDone={() => setTaglineDone(true)} />
          )}
        </div>

        {/* Separator */}
        {phase >= 2 && (
          <div style={{
            width: 200, height: 2,
            background: 'linear-gradient(90deg, transparent, #4facfe, #ffd700, transparent)',
            borderRadius: 2, opacity: taglineDone ? 1 : 0,
            transition: 'opacity 0.5s ease',
            boxShadow: '0 0 10px rgba(79,172,254,0.5)',
          }} />
        )}

        {/* Loading ring */}
        {phase >= 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', animation: 'fadeInUp 0.5s ease forwards' }}>
            <LoadingRing progress={progress} />
            <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '2px', fontWeight: 700, textTransform: 'uppercase' }}>
              {progress < 40  ? 'Initializing Sobagu…'  :
               progress < 75  ? 'Loading your progress…' :
               progress < 100 ? 'Almost ready…'          :
                                'Welcome! 🌸'}
            </div>
          </div>
        )}

        {/* Bottom credit */}
        <div style={{
          position: 'absolute', bottom: -140,
          fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)',
          letterSpacing: '1px', fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: '0.5rem',
        }}>
          <span style={{ width: 20, height: 1, background: 'rgba(255,255,255,0.2)', display: 'inline-block' }} />
          Plumine LTD · All Rights Reserved
          <span style={{ width: 20, height: 1, background: 'rgba(255,255,255,0.2)', display: 'inline-block' }} />
        </div>
      </div>

      <style>{`
        @keyframes cursor-blink { 0%,49%{ opacity:1; } 50%,100%{ opacity:0; } }
        @keyframes fadeInUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  );
};

export default SplashScreen;
