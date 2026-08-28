import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Swords, Timer, Trophy, ChevronRight, CheckCircle, XCircle, RotateCcw, ArrowLeft } from 'lucide-react';

const QUESTIONS = [
  { en: 'Apple', options: ['ಸೇಬು', 'ಮಾವು', 'ಬಾಳೆ', 'ದ್ರಾಕ್ಷಿ'], ans: 'ಸೇಬು' },
  { en: 'Mango', options: ['ಸೇಬು', 'ಮಾವು', 'ಬಾಳೆ', 'ದ್ರಾಕ್ಷಿ'], ans: 'ಮಾವು' },
  { en: 'Banana', options: ['ಸೇಬು', 'ಬಾಳೆ', 'ಕಿತ್ತಳೆ', 'ದ್ರಾಕ್ಷಿ'], ans: 'ಬಾಳೆ' },
  { en: 'Dog', options: ['ಬೆಕ್ಕು', 'ನಾಯಿ', 'ಆಡು', 'ಹಸು'], ans: 'ನಾಯಿ' },
  { en: 'Cat', options: ['ಬೆಕ್ಕು', 'ನಾಯಿ', 'ಆಡು', 'ಹಸು'], ans: 'ಬೆಕ್ಕು' },
  { en: 'Water', options: ['ಬೆಂಕಿ', 'ನೀರು', 'ಗಾಳಿ', 'ಮಣ್ಣು'], ans: 'ನೀರು' },
  { en: 'Fire', options: ['ಬೆಂಕಿ', 'ನೀರು', 'ಗಾಳಿ', 'ಮಣ್ಣು'], ans: 'ಬೆಂಕಿ' },
  { en: 'Sky', options: ['ಭೂಮಿ', 'ಆಕಾಶ', 'ಸಮುದ್ರ', 'ನದಿ'], ans: 'ಆಕಾಶ' },
  { en: 'Book', options: ['ಪೆನ್', 'ಪುಸ್ತಕ', 'ಮೇಜು', 'ಕುರ್ಚಿ'], ans: 'ಪುಸ್ತಕ' },
  { en: 'School', options: ['ಮನೆ', 'ಅಂಗಡಿ', 'ಶಾಲೆ', 'ಆಸ್ಪತ್ರೆ'], ans: 'ಶಾಲೆ' },
];

const PHASE = { SETUP: 'setup', PLAYING: 'playing', RESULTS: 'results' };
const TIMER_DEFAULT = 15;

const card = { background: 'var(--indigo-card)', border: '1px solid var(--glass-border)', borderRadius: '18px', padding: '1.4rem' };

export default function LiveDuel({ user, onXP, onToast, onNavigate }) {
  const [phase, setPhase]         = useState(PHASE.SETUP);
  const [qIdx, setQIdx]           = useState(0);
  const [myScore, setMyScore]     = useState(0);
  const [theirScore, setTheirScore] = useState(0);
  const [selected, setSelected]   = useState(null);
  const [timeLeft, setTimeLeft]   = useState(TIMER_DEFAULT);
  const [answers, setAnswers]     = useState([]);
  const timerRef                  = useRef(null);

  const question = QUESTIONS[qIdx];

  const startGame = () => {
    setPhase(PHASE.PLAYING);
    setQIdx(0);
    setMyScore(0);
    setTheirScore(0);
    setAnswers([]);
    setSelected(null);
    setTimeLeft(TIMER_DEFAULT);
  };

  const nextQuestion = useCallback(() => {
    clearInterval(timerRef.current);
    setSelected(null);
    setTimeLeft(TIMER_DEFAULT);
    if (qIdx + 1 >= QUESTIONS.length) {
      setPhase(PHASE.RESULTS);
    } else {
      setQIdx(q => q + 1);
    }
  }, [qIdx]);

  useEffect(() => {
    if (phase !== PHASE.PLAYING) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          // Time up — AI opponent always gets some right
          const aiGotIt = Math.random() > 0.35;
          if (aiGotIt) setTheirScore(s => s + 10);
          setAnswers(a => [...a, { en: QUESTIONS[qIdx].en, correct: false, timeout: true }]);
          nextQuestion();
          return TIMER_DEFAULT;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, qIdx, nextQuestion]);

  const handleAnswer = (opt) => {
    if (selected) return;
    clearInterval(timerRef.current);
    setSelected(opt);
    const correct = opt === question.ans;
    if (correct) {
      setMyScore(s => s + Math.max(5, timeLeft));
    }
    // Simulate opponent
    const opponentCorrect = Math.random() > 0.45;
    if (opponentCorrect) setTheirScore(s => s + Math.floor(Math.random() * 12) + 5);
    setAnswers(a => [...a, { en: question.en, correct }]);
    setTimeout(nextQuestion, 1000);
  };

  const iWon = myScore > theirScore;

  useEffect(() => {
    if (phase === PHASE.RESULTS) {
      const xpEarned = iWon ? 50 : 20;
      if (onXP) onXP(xpEarned);
      onToast(iWon ? `You won! +${xpEarned} XP` : `Good game! +${xpEarned} XP`, iWon ? 'success' : 'info');
    }
  }, [phase]);

  return (
    <div className="learning-screen" style={{ maxWidth: 620, margin: '0 auto', padding: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'linear-gradient(135deg,#f093fb,#f5576c)', borderRadius: '14px', padding: '0.7rem', display: 'flex' }}>
          <Swords size={26} color="#fff" />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>1v1 Vocabulary Duel</h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'Noto Sans Kannada,sans-serif' }}>ಶಬ್ದ ಯುದ್ಧ</p>
        </div>
      </div>

      {/* SETUP */}
      {phase === PHASE.SETUP && (
        <div style={card}>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            Answer 10 Kannada vocabulary questions as fast as possible. You earn points based on speed. Beat your friend's AI score to win!
          </p>
          <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
            {[
              { icon: Swords, label: '10 Questions', sub: 'English to Kannada' },
              { icon: Timer,  label: '15 Seconds', sub: 'per question' },
              { icon: Trophy, label: 'XP Reward', sub: '+50 win / +20 loss' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '0.7rem 1rem' }}>
                <Icon size={20} color="var(--sakura-pink)" />
                <div>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>{label}</div>
                  <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.75rem' }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>
          <button onClick={startGame} style={{ width: '100%', background: 'linear-gradient(135deg,#f093fb,#f5576c)', border: 'none', borderRadius: '14px', padding: '0.9rem', color: '#fff', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 4px 20px rgba(240,147,251,0.4)' }}>
            <Swords size={20} /> Start Duel!
          </button>
        </div>
      )}

      {/* PLAYING */}
      {phase === PHASE.PLAYING && question && (
        <>
          {/* Score Banner */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <div style={{ flex: 1, background: 'rgba(240,147,251,0.15)', borderRadius: '12px', padding: '0.6rem 1rem', textAlign: 'center', border: '1px solid rgba(240,147,251,0.3)' }}>
              <div style={{ color: '#f093fb', fontWeight: 900, fontSize: '1.4rem' }}>{myScore}</div>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.72rem' }}>You</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '10px', padding: '0.4rem 0.7rem', fontWeight: 900, color: '#fff', fontSize: '0.85rem' }}>VS</div>
            <div style={{ flex: 1, background: 'rgba(79,172,254,0.15)', borderRadius: '12px', padding: '0.6rem 1rem', textAlign: 'center', border: '1px solid rgba(79,172,254,0.3)' }}>
              <div style={{ color: '#4facfe', fontWeight: 900, fontSize: '1.4rem' }}>{theirScore}</div>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.72rem' }}>Opponent</div>
            </div>
          </div>

          {/* Timer Bar */}
          <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, marginBottom: '1rem', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(timeLeft / TIMER_DEFAULT) * 100}%`, background: timeLeft > 8 ? '#43e97b' : timeLeft > 4 ? '#ffd700' : '#ff5858', borderRadius: 3, transition: 'width 1s linear, background 0.3s' }} />
          </div>

          <div style={card}>
            <div style={{ textAlign: 'center', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>Q{qIdx + 1} of {QUESTIONS.length}</div>
            <div style={{ textAlign: 'center', fontSize: '1.7rem', fontWeight: 900, color: '#fff', marginBottom: '0.5rem' }}>{question.en}</div>
            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.45)', fontSize: '0.8rem', marginBottom: '1.2rem' }}>Select the Kannada translation</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.7rem' }}>
              {question.options.map(opt => {
                const isCorrect = opt === question.ans;
                const isSelected = selected === opt;
                let bg = 'rgba(255,255,255,0.07)';
                let border = '1px solid var(--glass-border)';
                if (selected) {
                  if (isCorrect) { bg = 'rgba(67,233,123,0.2)'; border = '1px solid #43e97b'; }
                  else if (isSelected && !isCorrect) { bg = 'rgba(255,88,88,0.2)'; border = '1px solid #ff5858'; }
                }
                return (
                  <button key={opt} onClick={() => handleAnswer(opt)} style={{ background: bg, border, borderRadius: '12px', padding: '0.9rem', color: '#fff', fontWeight: 700, cursor: selected ? 'default' : 'pointer', fontSize: '1rem', fontFamily: 'Noto Sans Kannada,sans-serif', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                    {selected && isCorrect && <CheckCircle size={16} color="#43e97b" />}
                    {selected && isSelected && !isCorrect && <XCircle size={16} color="#ff5858" />}
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* RESULTS */}
      {phase === PHASE.RESULTS && (
        <div style={card}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
              {iWon ? <Trophy size={60} color="#ffd700" style={{ filter: 'drop-shadow(0 0 16px gold)' }} /> : <Swords size={60} color="rgba(255,255,255,0.4)" />}
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', marginBottom: '0.3rem' }}>
              {iWon ? 'You Won!' : 'Good Game!'}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem' }}>
              {iWon ? 'Excellent vocabulary!' : 'Keep practicing — you will get there!'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ flex: 1, background: 'rgba(240,147,251,0.15)', borderRadius: '14px', padding: '1rem', textAlign: 'center', border: '1px solid rgba(240,147,251,0.3)' }}>
              <div style={{ color: '#f093fb', fontWeight: 900, fontSize: '2rem' }}>{myScore}</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>Your Score</div>
            </div>
            <div style={{ flex: 1, background: 'rgba(79,172,254,0.15)', borderRadius: '14px', padding: '1rem', textAlign: 'center', border: '1px solid rgba(79,172,254,0.3)' }}>
              <div style={{ color: '#4facfe', fontWeight: 900, fontSize: '2rem' }}>{theirScore}</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>Opponent</div>
            </div>
          </div>
          <div style={{ color: '#ffd700', textAlign: 'center', fontWeight: 700, marginBottom: '1.2rem' }}>
            +{iWon ? 50 : 20} XP earned!
          </div>
          <div style={{ display: 'flex', gap: '0.7rem' }}>
            <button onClick={startGame} style={{ flex: 1, background: 'linear-gradient(135deg,#f093fb,#f5576c)', border: 'none', borderRadius: '12px', padding: '0.75rem', color: '#fff', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <RotateCcw size={16} /> Play Again
            </button>
            <button onClick={() => onNavigate('multiplayerarena')} style={{ flex: 1, background: 'rgba(255,255,255,0.1)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '0.75rem', color: '#fff', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <ArrowLeft size={16} /> Arena
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
