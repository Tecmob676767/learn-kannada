import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Zap, Trophy, Timer, RotateCcw, ArrowLeft, CheckCircle, Flag, Gauge, Sparkles } from 'lucide-react';

const RACE_TEXTS = [
  {
    kannada: 'ನಮಸ್ಕಾರ, ನೀವು ಹೇಗಿದ್ದೀರಿ?',
    translit: 'namaskara, neevu hegiddiri?',
    meaning: 'Hello, how are you?',
  },
  {
    kannada: 'ಕನ್ನಡ ನಮ್ಮ ಹೆಮ್ಮೆಯ ಸುಂದರ ಭಾಷೆ',
    translit: 'kannada namma hemmeya sundara bhashe',
    meaning: 'Kannada is our proud beautiful language',
  },
  {
    kannada: 'ನಮ್ಮ ಬೆಂಗಳೂರು ಹಸಿರು ಮತ್ತು ಸಿಲಿಕಾನ್ ನಗರ',
    translit: 'namma bengaluru hasiru mattu silicon nagara',
    meaning: 'Our Bengaluru is a green and silicon city',
  },
  {
    kannada: 'ಜ್ಞಾನವೇ ಬಲ, ಕಲಿಕೆಯೇ ಬೆಳಕು',
    translit: 'jnanave bala, kalikeye belaku',
    meaning: 'Knowledge is strength, learning is light',
  },
  {
    kannada: 'ಶುಭೋದಯ ಮಿತ್ರರೇ, ಎಲ್ಲರಿಗೂ ಶುಭವಾಗಲಿ',
    translit: 'shubhodaya mitrare, ellarigoo shubhavagali',
    meaning: 'Good morning friends, best wishes to everyone',
  },
];

const PHASE = { READY: 'ready', COUNTDOWN: 'countdown', RACING: 'racing', FINISHED: 'finished' };
const card = { background: 'var(--indigo-card)', border: '1px solid var(--glass-border)', borderRadius: '18px', padding: '1.4rem' };

export default function SpeedTypingRace({ user, onXP, onToast, onNavigate }) {
  const [phase, setPhase]             = useState(PHASE.READY);
  const [textIndex, setTextIndex]     = useState(0);
  const [inputVal, setInputVal]       = useState('');
  const [countdown, setCountdown]     = useState(3);
  const [startTime, setStartTime]     = useState(null);
  const [endTime, setEndTime]         = useState(null);
  const [opponentProgress, setOpponentProgress] = useState(0);
  const [myWpm, setMyWpm]             = useState(0);
  const [opponentWpm, setOpponentWpm] = useState(0);
  const [opponentName]                = useState('Speedy Chetan');
  const inputRef                      = useRef(null);
  const opponentIntervalRef           = useRef(null);

  const currentSnippet = RACE_TEXTS[textIndex];
  const targetText = currentSnippet.translit;

  // Start countdown
  const startCountdown = () => {
    setPhase(PHASE.COUNTDOWN);
    setInputVal('');
    setCountdown(3);
    setOpponentProgress(0);
    setStartTime(null);
    setEndTime(null);
    setMyWpm(0);
  };

  useEffect(() => {
    if (phase !== PHASE.COUNTDOWN) return;
    if (countdown > 1) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 1) {
      const timer = setTimeout(() => {
        setCountdown('GO!');
        setTimeout(() => {
          setPhase(PHASE.RACING);
          setStartTime(Date.now());
          // Randomize opponent speed between 25 and 45 WPM
          const oppSpeed = Math.floor(Math.random() * 20) + 25;
          setOpponentWpm(oppSpeed);
        }, 600);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [phase, countdown]);

  // Focus input automatically when racing starts
  useEffect(() => {
    if (phase === PHASE.RACING && inputRef.current) {
      inputRef.current.focus();
    }
  }, [phase]);

  // Opponent AI racer simulation
  useEffect(() => {
    if (phase !== PHASE.RACING) return;
    const intervalMs = 250;
    const totalChars = targetText.length;
    // chars per second based on opponentWpm
    const charsPerSec = (opponentWpm * 5) / 60;
    const increment = (charsPerSec * (intervalMs / 1000) / totalChars) * 100;

    opponentIntervalRef.current = setInterval(() => {
      setOpponentProgress(prev => {
        const next = prev + increment + (Math.random() * 0.4 - 0.2);
        if (next >= 100) {
          clearInterval(opponentIntervalRef.current);
          return 100;
        }
        return Math.min(next, 99.5);
      });
    }, intervalMs);

    return () => clearInterval(opponentIntervalRef.current);
  }, [phase, opponentWpm, targetText.length]);

  // Handle typing input
  const handleInputChange = (e) => {
    if (phase !== PHASE.RACING) return;
    const val = e.target.value;
    setInputVal(val);

    // Calculate current live WPM
    if (startTime) {
      const elapsedMins = (Date.now() - startTime) / 60000;
      if (elapsedMins > 0.01) {
        const words = val.length / 5;
        setMyWpm(Math.round(words / elapsedMins));
      }
    }

    // Check completion
    if (val === targetText) {
      const now = Date.now();
      setEndTime(now);
      clearInterval(opponentIntervalRef.current);
      setPhase(PHASE.FINISHED);
      const elapsedMins = (now - startTime) / 60000;
      const finalWpm = Math.max(1, Math.round((targetText.length / 5) / elapsedMins));
      setMyWpm(finalWpm);

      const isWin = opponentProgress < 100;
      const xpEarned = isWin ? 60 : 30;
      if (onXP) onXP(xpEarned);
      if (onToast) onToast(isWin ? `🏆 1st Place! +${xpEarned} XP earned!` : `🏁 Race Completed! +${xpEarned} XP`, isWin ? 'success' : 'info');
    }
  };

  const myProgress = Math.min(100, Math.round((inputVal.length / targetText.length) * 100));
  const isWinning = myProgress >= opponentProgress;
  const didIWin = phase === PHASE.FINISHED && (opponentProgress < 100 || myProgress === 100);

  // Render character by character highlighting
  const renderTextDisplay = () => {
    return targetText.split('').map((char, idx) => {
      let color = 'rgba(255,255,255,0.35)';
      let bg = 'transparent';
      let underline = false;

      if (idx < inputVal.length) {
        if (inputVal[idx] === char) {
          color = '#43e97b'; // Correct
        } else {
          color = '#ff5858'; // Wrong
          bg = 'rgba(255,88,88,0.2)';
        }
      } else if (idx === inputVal.length) {
        color = '#fff';
        bg = 'rgba(255,163,102,0.35)';
        underline = true;
      }

      return (
        <span
          key={idx}
          style={{
            color,
            background: bg,
            borderRadius: '2px',
            borderBottom: underline ? '2px solid var(--sakura-pink)' : 'none',
            fontFamily: 'monospace',
            fontSize: '1.25rem',
            letterSpacing: '0.05rem',
            transition: 'color 0.1s',
          }}
        >
          {char}
        </span>
      );
    });
  };

  const nextTrack = () => {
    setTextIndex((textIndex + 1) % RACE_TEXTS.length);
    setPhase(PHASE.READY);
    setInputVal('');
    setOpponentProgress(0);
  };

  return (
    <div className="learning-screen" style={{ maxWidth: 720, margin: '0 auto', padding: '1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', borderRadius: '14px', padding: '0.7rem', display: 'flex' }}>
          <Zap size={26} color="#fff" />
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>Speed Typing Race</h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'Noto Sans Kannada,sans-serif' }}>
            ತ್ವರಿತ ಟೈಪಿಂಗ್ ಓಟ · Track #{textIndex + 1}
          </p>
        </div>
        <button
          onClick={() => onNavigate('multiplayerarena')}
          style={{
            background: 'none', border: '1px solid var(--glass-border)', borderRadius: '10px',
            padding: '0.45rem 0.8rem', color: 'rgba(255,255,255,0.6)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem',
          }}
        >
          <ArrowLeft size={16} /> Arena
        </button>
      </div>

      {/* Racetrack Visual Box */}
      <div style={{ ...card, marginBottom: '1.2rem', padding: '1.2rem', position: 'relative', overflow: 'hidden' }}>
        {/* Finish Line Checkered Banner */}
        <div style={{
          position: 'absolute', right: '1.5rem', top: '1rem', bottom: '1rem', width: '12px',
          background: 'repeating-linear-gradient(45deg, #fff, #fff 4px, #000 4px, #000 8px)',
          opacity: 0.7, borderRadius: '4px', zIndex: 1,
        }} />

        {/* Lane 1: Player */}
        <div style={{ marginBottom: '1.2rem', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#fff', marginBottom: '0.3rem', fontWeight: 700 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--sakura-pink)' }}>
              🏎️ You ({user?.name || 'Racer'})
            </span>
            <span style={{ color: '#43e97b' }}>{myWpm} WPM · {myProgress}%</span>
          </div>
          <div style={{ height: '22px', background: 'rgba(255,255,255,0.08)', borderRadius: '11px', position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,163,102,0.3)' }}>
            <div style={{
              height: '100%', width: `${myProgress}%`,
              background: 'linear-gradient(90deg, #ff6b35, #ffa366)',
              borderRadius: '11px', transition: 'width 0.15s ease-out',
            }} />
          </div>
        </div>

        {/* Lane 2: Opponent */}
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#fff', marginBottom: '0.3rem', fontWeight: 700 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#4facfe' }}>
              🚗 {opponentName} (AI Rival)
            </span>
            <span style={{ color: '#4facfe' }}>{opponentWpm} WPM · {Math.round(opponentProgress)}%</span>
          </div>
          <div style={{ height: '22px', background: 'rgba(255,255,255,0.08)', borderRadius: '11px', position: 'relative', overflow: 'hidden', border: '1px solid rgba(79,172,254,0.3)' }}>
            <div style={{
              height: '100%', width: `${opponentProgress}%`,
              background: 'linear-gradient(90deg, #00c6fb, #005bea)',
              borderRadius: '11px', transition: 'width 0.25s linear',
            }} />
          </div>
        </div>
      </div>

      {/* READY STATE */}
      {phase === PHASE.READY && (
        <div style={{ ...card, textAlign: 'center', padding: '2rem 1.5rem' }}>
          <div style={{
            fontSize: '1.7rem', color: 'var(--sakura-pink)', fontWeight: 800,
            fontFamily: 'Noto Sans Kannada, sans-serif', marginBottom: '0.4rem',
          }}>
            {currentSnippet.kannada}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            "{currentSnippet.meaning}"
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1.8rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '0.6rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#fff' }}>
              <Gauge size={18} color="#43e97b" /> Real-time WPM
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '0.6rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#fff' }}>
              <Sparkles size={18} color="#ffd700" /> +60 XP Win
            </div>
          </div>

          <button
            onClick={startCountdown}
            style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              border: 'none', borderRadius: '14px', padding: '0.9rem 2.5rem',
              color: '#fff', fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
              boxShadow: '0 4px 20px rgba(102,126,234,0.4)',
              transition: 'transform 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <Flag size={20} /> Ready to Race!
          </button>
        </div>
      )}

      {/* COUNTDOWN STATE */}
      {phase === PHASE.COUNTDOWN && (
        <div style={{ ...card, textAlign: 'center', padding: '3.5rem 1rem' }}>
          <div style={{
            fontSize: '4.5rem', fontWeight: 900, color: 'var(--sakura-pink)',
            animation: 'pulse 0.6s infinite alternate',
          }}>
            {countdown}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.6)', marginTop: '0.5rem', fontSize: '1rem' }}>
            Get your fingers ready on the keyboard!
          </div>
        </div>
      )}

      {/* RACING STATE */}
      {phase === PHASE.RACING && (
        <div style={card}>
          {/* Target Kannada Display */}
          <div style={{
            fontSize: '1.4rem', color: 'var(--sakura-pink)', fontWeight: 800,
            fontFamily: 'Noto Sans Kannada, sans-serif', textAlign: 'center', marginBottom: '0.2rem',
          }}>
            {currentSnippet.kannada}
          </div>
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.45)', fontSize: '0.78rem', marginBottom: '1.2rem' }}>
            {currentSnippet.meaning}
          </div>

          {/* Interactive Text Display Box */}
          <div style={{
            background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)',
            borderRadius: '12px', padding: '1rem', marginBottom: '1rem',
            lineHeight: 1.8, userSelect: 'none',
          }}>
            {renderTextDisplay()}
          </div>

          {/* Hidden/Active input for mobile & desktop */}
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={handleInputChange}
            placeholder="Type the transliteration here..."
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            style={{
              width: '100%', boxSizing: 'border-box',
              background: 'rgba(255,255,255,0.08)',
              border: '2px solid var(--sakura-pink)',
              borderRadius: '12px', padding: '0.85rem 1rem',
              color: '#fff', fontSize: '1.1rem', fontFamily: 'monospace',
              outline: 'none', boxShadow: '0 0 16px rgba(255,163,102,0.2)',
            }}
          />
        </div>
      )}

      {/* FINISHED STATE */}
      {phase === PHASE.FINISHED && (
        <div style={{ ...card, textAlign: 'center', padding: '2rem 1.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            {didIWin ? (
              <Trophy size={64} color="#ffd700" style={{ filter: 'drop-shadow(0 0 20px gold)' }} />
            ) : (
              <Flag size={64} color="#4facfe" />
            )}
          </div>

          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', margin: '0 0 0.4rem' }}>
            {didIWin ? '🏆 1st Place Victory!' : '🏁 Race Complete!'}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', margin: '0 0 1.5rem' }}>
            {didIWin
              ? `You outpaced ${opponentName} with blazing speed!`
              : `Great effort! Keep practicing to beat ${opponentName}!`}
          </p>

          {/* Stats Comparison Card */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(255,163,102,0.12)', border: '1px solid rgba(255,163,102,0.3)', borderRadius: '14px', padding: '1rem' }}>
              <div style={{ color: 'var(--sakura-pink)', fontSize: '2rem', fontWeight: 900 }}>{myWpm}</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>Your WPM</div>
            </div>
            <div style={{ background: 'rgba(79,172,254,0.12)', border: '1px solid rgba(79,172,254,0.3)', borderRadius: '14px', padding: '1rem' }}>
              <div style={{ color: '#4facfe', fontSize: '2rem', fontWeight: 900 }}>{opponentWpm}</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>Rival WPM</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.8rem' }}>
            <button
              onClick={startCountdown}
              style={{
                flex: 1, background: 'linear-gradient(135deg,#667eea,#764ba2)',
                border: 'none', borderRadius: '12px', padding: '0.85rem',
                color: '#fff', fontWeight: 800, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              }}
            >
              <RotateCcw size={18} /> Rematch
            </button>
            <button
              onClick={nextTrack}
              style={{
                flex: 1, background: 'linear-gradient(135deg,#ff6b35,#ffa366)',
                border: 'none', borderRadius: '12px', padding: '0.85rem',
                color: '#fff', fontWeight: 800, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              }}
            >
              <Sparkles size={18} /> Next Track
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
