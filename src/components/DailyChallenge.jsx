import React, { useState, useEffect, useRef } from 'react';
import { addXP } from '../utils/storage.js';
import { speakKannada } from '../utils/tts.js';

const CHALLENGES = [
  {
    id: 'c1', title: 'Speed Speller', icon: '⚡', duration: 60,
    desc: 'Hear a Kannada word and type it as fast as you can!',
    words: [
      { kannada: 'ನೀರು', english: 'Water' }, { kannada: 'ಮನೆ', english: 'House' },
      { kannada: 'ಅಮ್ಮ', english: 'Mother' }, { kannada: 'ಹಾಲು', english: 'Milk' },
      { kannada: 'ಕಾಡು', english: 'Forest' }, { kannada: 'ಹಣ್ಣು', english: 'Fruit' },
      { kannada: 'ಕಣ್ಣು', english: 'Eye' }, { kannada: 'ಬಾಯಿ', english: 'Mouth' },
    ],
  },
  {
    id: 'c2', title: 'Translation Blitz', icon: '🌐', duration: 45,
    desc: 'Pick the correct English translation of each Kannada word!',
    questions: [
      { kannada: 'ನೀರು', options: ['Water', 'Fire', 'Air', 'Earth'], answer: 'Water' },
      { kannada: 'ಸೂರ್ಯ', options: ['Moon', 'Sun', 'Star', 'Sky'], answer: 'Sun' },
      { kannada: 'ಮರ', options: ['River', 'Mountain', 'Tree', 'Cloud'], answer: 'Tree' },
      { kannada: 'ಹಕ್ಕಿ', options: ['Fish', 'Bird', 'Dog', 'Cat'], answer: 'Bird' },
      { kannada: 'ಹೂವು', options: ['Fruit', 'Leaf', 'Flower', 'Root'], answer: 'Flower' },
      { kannada: 'ಬೆಟ್ಟ', options: ['Valley', 'Hill', 'Lake', 'Desert'], answer: 'Hill' },
      { kannada: 'ಪ್ರೀತಿ', options: ['Hate', 'Fear', 'Love', 'Anger'], answer: 'Love' },
    ],
  },
  {
    id: 'c3', title: 'Memory Sprint', icon: '🧠', duration: 30,
    desc: 'Remember as many word pairs as you can in 30 seconds!',
    pairs: [
      { kannada: 'ಅಮ್ಮ', english: 'Mother' }, { kannada: 'ಅಪ್ಪ', english: 'Father' },
      { kannada: 'ನೀರು', english: 'Water' }, { kannada: 'ಬೆಂಕಿ', english: 'Fire' },
      { kannada: 'ಗಾಳಿ', english: 'Wind' }, { kannada: 'ಮಣ್ಣು', english: 'Soil' },
    ],
  },
];

const DailyChallenge = ({ onXP, onToast }) => {
  const dayKey = `daily_challenge_${new Date().toDateString()}`;
  const todayChallenge = CHALLENGES[new Date().getDay() % CHALLENGES.length];
  const [phase, setPhase] = useState('intro'); // intro | playing | result
  const [timeLeft, setTimeLeft] = useState(todayChallenge.duration);
  const [score, setScore] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [typed, setTyped] = useState('');
  const [claimed, setClaimed] = useState(() => localStorage.getItem(dayKey) === '1');
  const [wordVisible, setWordVisible] = useState(true);
  const inputRef = useRef(null);

  // Timer
  useEffect(() => {
    if (phase !== 'playing') return;
    if (timeLeft <= 0) { setPhase('result'); return; }
    const t = setTimeout(() => setTimeLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, timeLeft]);

  const challenge = todayChallenge;

  const start = () => {
    setPhase('playing');
    setScore(0);
    setQIdx(0);
    setTimeLeft(challenge.duration);
    setTyped('');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // Speed Speller logic
  const handleType = (e) => {
    const val = e.target.value;
    setTyped(val);
    if (challenge.id === 'c1') {
      const word = challenge.words[qIdx % challenge.words.length];
      if (val.trim() === word.kannada) {
        setScore(s => s + 10);
        setQIdx(i => i + 1);
        setTyped('');
        speakKannada(word.kannada);
      }
    }
  };

  // Translation Blitz logic
  const handleOption = (opt) => {
    if (challenge.id !== 'c2') return;
    const q = challenge.questions[qIdx % challenge.questions.length];
    if (opt === q.answer) {
      setScore(s => s + 15);
      speakKannada(q.kannada);
    }
    setQIdx(i => i + 1);
  };

  // Memory Sprint — just show pairs then quiz
  const [memPhase, setMemPhase] = useState('study');
  useEffect(() => {
    if (challenge.id === 'c3' && phase === 'playing') {
      setMemPhase('study');
      setTimeout(() => setMemPhase('quiz'), 15000);
    }
  }, [phase, challenge.id]);

  const claimReward = () => {
    if (claimed) return;
    localStorage.setItem(dayKey, '1');
    setClaimed(true);
    const xp = Math.min(100, score + 30);
    addXP(xp); onXP && onXP(xp);
    onToast && onToast(`🌟 Daily challenge complete! +${xp} XP`, 'xp');
  };

  const timerPct = (timeLeft / challenge.duration) * 100;
  const timerColor = timeLeft > 15 ? '#43e97b' : timeLeft > 8 ? '#ffd200' : '#f5576c';

  return (
    <div className="learning-screen">
      <div className="page-header">
        <h2>🌟 Daily Challenge</h2>
        <p>A fresh challenge every day to keep your streak and earn bonus XP!</p>
      </div>

      {phase === 'intro' && (
        <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>{challenge.icon}</div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Today's Challenge</h3>
          <div style={{ fontSize: '1.2rem', color: 'var(--sakura-pink)', fontWeight: 700, marginBottom: '0.75rem' }}>
            {challenge.title}
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{challenge.desc}</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '2rem' }}>
            ⏱ {challenge.duration} seconds • 🎯 Score as high as you can!
          </p>
          {claimed ? (
            <div style={{ color: '#43e97b', fontWeight: 700, fontSize: '1.1rem' }}>
              ✅ You already completed today's challenge! Come back tomorrow.
            </div>
          ) : (
            <button className="btn-primary" onClick={start} style={{ width: 'auto', padding: '1rem 3rem', fontSize: '1.1rem' }}>
              ▶ Start Challenge
            </button>
          )}
        </div>
      )}

      {phase === 'playing' && (
        <div className="glass-card" style={{ padding: '2rem' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{challenge.icon} {challenge.title}</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: timerColor }}>⏱ {timeLeft}s</div>
          </div>
          <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', marginBottom: '1.5rem', overflow: 'hidden' }}>
            <div style={{ width: `${timerPct}%`, height: '100%', background: timerColor, transition: 'width 1s linear, background 0.5s' }} />
          </div>
          <div style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '1.4rem', fontWeight: 800, color: 'var(--gold)' }}>
            Score: {score}
          </div>

          {/* Challenge-specific content */}
          {challenge.id === 'c1' && (() => {
            const word = challenge.words[qIdx % challenge.words.length];
            return (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Type this word:</div>
                <div style={{ fontFamily: 'Noto Sans Kannada, sans-serif', fontSize: '3rem', fontWeight: 800, color: 'var(--sakura-pink)', marginBottom: '0.5rem' }}>{word.kannada}</div>
                <div style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{word.english}</div>
                <input ref={inputRef} value={typed} onChange={handleType} autoFocus placeholder="Type in Kannada..."
                  style={{ width: '80%', padding: '0.85rem', background: 'rgba(255,255,255,0.06)', border: '2px solid rgba(255,255,255,0.2)', borderRadius: '10px', color: 'var(--text-primary)', fontFamily: 'Noto Sans Kannada, sans-serif', fontSize: '1.2rem', outline: 'none', textAlign: 'center', boxSizing: 'border-box' }} />
              </div>
            );
          })()}

          {challenge.id === 'c2' && (() => {
            const q = challenge.questions[qIdx % challenge.questions.length];
            return (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Noto Sans Kannada, sans-serif', fontSize: '3rem', fontWeight: 800, color: 'var(--sakura-pink)', marginBottom: '1.5rem' }}>{q.kannada}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  {q.options.map(opt => (
                    <button key={opt} onClick={() => handleOption(opt)}
                      style={{ padding: '0.9rem', background: 'rgba(255,255,255,0.08)', border: '2px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '1rem', cursor: 'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,182,193,0.2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                    >{opt}</button>
                  ))}
                </div>
              </div>
            );
          })()}

          {challenge.id === 'c3' && (
            <div style={{ textAlign: 'center' }}>
              {memPhase === 'study' ? (
                <>
                  <div style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>📚 Memorize these pairs! (15s)</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    {challenge.pairs.map((p, i) => (
                      <div key={i} style={{ padding: '0.6rem', background: 'rgba(255,255,255,0.06)', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontFamily: 'Noto Sans Kannada', fontSize: '1.1rem', color: 'var(--sakura-pink)' }}>{p.kannada}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{p.english}</div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div>
                  <div style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>🧠 Quick! What does this mean?</div>
                  <div style={{ fontFamily: 'Noto Sans Kannada', fontSize: '2.5rem', color: 'var(--sakura-pink)', fontWeight: 800, marginBottom: '1rem' }}>
                    {challenge.pairs[qIdx % challenge.pairs.length].kannada}
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {challenge.pairs.map((p, i) => (
                      <button key={i} onClick={() => {
                        if (p.kannada === challenge.pairs[qIdx % challenge.pairs.length].kannada) {
                          setScore(s => s + 20);
                        }
                        setQIdx(j => j + 1);
                      }}
                        style={{ padding: '0.75rem 1.25rem', background: 'rgba(255,255,255,0.08)', border: '2px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: 'var(--text-primary)', cursor: 'pointer' }}>
                        {p.english}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {phase === 'result' && (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>
            {score >= 50 ? '🏆' : score >= 30 ? '🌟' : '💪'}
          </div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Challenge Complete!</h3>
          <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--gold)', margin: '1rem 0' }}>{score}</div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>points earned</p>
          <button onClick={claimReward} disabled={claimed} className="btn-primary"
            style={{ width: 'auto', padding: '0.85rem 2.5rem', opacity: claimed ? 0.6 : 1 }}>
            {claimed ? '✅ XP Claimed!' : `🎁 Claim +${Math.min(100, score + 30)} XP`}
          </button>
        </div>
      )}
    </div>
  );
};

export default DailyChallenge;
