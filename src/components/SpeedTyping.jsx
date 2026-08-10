import React, { useState, useEffect, useRef } from 'react';

const WORDS = [
  { k: 'ನಮಸ್ಕಾರ', t: 'namaskara' },
  { k: 'ಕನ್ನಡ', t: 'kannada' },
  { k: 'ಪುಸ್ತಕ', t: 'pustaka' },
  { k: 'ಮನೆ', t: 'mane' },
  { k: 'ಬೆಳಗ್ಗೆ', t: 'belagge' },
  { k: 'ಸಂಜೆ', t: 'sanje' },
  { k: 'ರಾತ್ರಿ', t: 'rathri' },
  { k: 'ಹೌದು', t: 'houdu' },
  { k: 'ಇಲ್ಲ', t: 'illa' },
  { k: 'ಊಟ', t: 'oota' },
  { k: 'ನೀರು', t: 'neeru' },
  { k: 'ಶಾಲೆ', t: 'shaale' },
  { k: 'ಹುಡುಗ', t: 'huduga' },
  { k: 'ಹುಡುಗಿ', t: 'hudugi' },
  { k: 'ನಾನು', t: 'naanu' }
];

const SpeedTyping = ({ onXP, onToast }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [wordIdx, setWordIdx] = useState(0);
  const [inputVal, setInputVal] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  
  const timerRef = useRef(null);
  
  const startGame = () => {
    // Shuffle words
    WORDS.sort(() => Math.random() - 0.5);
    setIsPlaying(true);
    setWordIdx(0);
    setScore(0);
    setGameOver(false);
    setInputVal('');
    setTimeLeft(10); // 10 seconds per word initially
  };
  
  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    } else if (isPlaying && timeLeft === 0) {
      handleTimeout();
    }
    return () => clearTimeout(timerRef.current);
  }, [isPlaying, timeLeft]);
  
  const handleTimeout = () => {
    if (onToast) onToast(`Time's up! The word was: ${WORDS[wordIdx].t}`, 'error');
    nextWord();
  };
  
  const nextWord = () => {
    if (wordIdx + 1 < 10) { // Play 10 words per round
      setWordIdx(i => i + 1);
      setInputVal('');
      setTimeLeft(10 - Math.floor((wordIdx + 1) / 2)); // Gets faster
    } else {
      setIsPlaying(false);
      setGameOver(true);
      if (onXP && score > 0) onXP(score * 2);
    }
  };
  
  const handleInput = (e) => {
    const val = e.target.value.toLowerCase().replace(/[^a-z]/g, '');
    setInputVal(val);
    
    if (val === WORDS[wordIdx].t) {
      clearTimeout(timerRef.current);
      setScore(s => s + 1);
      nextWord();
    }
  };

  if (gameOver) {
    return (
      <div className="learning-screen">
        <div className="page-header"><h2>⚡ Speed Typing Results</h2></div>
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
            {score > 7 ? '🚀' : score > 4 ? '👍' : '🐢'}
          </div>
          <h2>You typed {score} words correctly!</h2>
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
            XP Earned: {score * 2}
          </p>
          <button className="btn-primary" style={{ width: 'auto', marginTop: '2rem', padding: '1rem 2rem' }} onClick={startGame}>
            Play Again
          </button>
        </div>
      </div>
    );
  }

  if (!isPlaying) {
    return (
      <div className="learning-screen">
        <div className="page-header">
          <h2>⚡ Speed Typing</h2>
          <p>Type the transliteration of the Kannada word before time runs out!</p>
        </div>
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⌨️</div>
          <h3 style={{ marginBottom: '1rem' }}>Are you fast enough?</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            You will see a Kannada word. Type its English transliteration exactly. It gets faster as you go!
          </p>
          <button className="btn-primary" style={{ width: 'auto', padding: '1rem 3rem', fontSize: '1.2rem' }} onClick={startGame}>
            Start Game
          </button>
        </div>
      </div>
    );
  }

  const currentWord = WORDS[wordIdx];
  const timePct = (timeLeft / (10 - Math.floor(wordIdx / 2))) * 100;
  
  let barColor = '#4ade80';
  if (timePct < 50) barColor = '#fbbf24';
  if (timePct < 25) barColor = '#f87171';

  return (
    <div className="learning-screen">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>⚡ Word {wordIdx + 1} / 10</h2>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--gold)' }}>Score: {score}</div>
        </div>
      </div>
      
      {/* Timer Bar */}
      <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginBottom: '2rem', overflow: 'hidden' }}>
        <div style={{ width: `${timePct}%`, height: '100%', background: barColor, transition: 'width 1s linear, background 0.3s' }} />
      </div>
      
      <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '1rem', right: '1.5rem', fontSize: '2rem', fontWeight: 900, color: barColor }}>
          {timeLeft}s
        </div>
        
        <div style={{ fontSize: '5rem', fontWeight: 900, color: 'var(--sakura-pink)', marginBottom: '3rem', filter: 'drop-shadow(0 4px 10px rgba(255,163,102,0.3))' }}>
          {currentWord.k}
        </div>
        
        <input 
          type="text" 
          value={inputVal}
          onChange={handleInput}
          placeholder="Type here..."
          autoFocus
          className="form-input"
          style={{ width: '100%', maxWidth: '400px', margin: '0 auto', fontSize: '1.5rem', padding: '1rem', textAlign: 'center' }}
        />
        
        <div style={{ marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Hint length: {currentWord.t.length} letters
        </div>
      </div>
    </div>
  );
};

export default SpeedTyping;
