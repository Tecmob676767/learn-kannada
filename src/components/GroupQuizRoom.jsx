import React, { useState, useEffect, useRef } from 'react';
import { Users, Trophy, Timer, Play, Copy, Crown, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

const QUESTIONS = [
  { q: 'How do you say "Water"?', options: ['ನೀರು', 'ಬೆಂಕಿ', 'ಗಾಳಿ', 'ಮಣ್ಣು'], ans: 'ನೀರು' },
  { q: 'What is "School"?', options: ['ಮನೆ', 'ಶಾಲೆ', 'ಅಂಗಡಿ', 'ದೇವಾಲಯ'], ans: 'ಶಾಲೆ' },
  { q: 'What is "Mother"?', options: ['ಅಪ್ಪ', 'ಅಕ್ಕ', 'ಅಮ್ಮ', 'ಅಣ್ಣ'], ans: 'ಅಮ್ಮ' },
  { q: '"Sun" in Kannada is?', options: ['ಚಂದ್ರ', 'ನಕ್ಷತ್ರ', 'ಸೂರ್ಯ', 'ಆಕಾಶ'], ans: 'ಸೂರ್ಯ' },
  { q: 'What is "Food"?', options: ['ಊಟ', 'ನೀರು', 'ಹಾಲು', 'ಹಣ್ಣು'], ans: 'ಊಟ' },
  { q: '"Happy" in Kannada?', options: ['ದುಃಖ', 'ಸಂತೋಷ', 'ಕೋಪ', 'ಭಯ'], ans: 'ಸಂತೋಷ' },
  { q: 'What is "Book"?', options: ['ಪೆನ್', 'ಮೇಜು', 'ಪುಸ್ತಕ', 'ಚೀಲ'], ans: 'ಪುಸ್ತಕ' },
  { q: '"Dog" in Kannada?', options: ['ಬೆಕ್ಕು', 'ನಾಯಿ', 'ಆಡು', 'ಹಸು'], ans: 'ನಾಯಿ' },
  { q: 'What is "Flower"?', options: ['ಹಣ್ಣು', 'ಮರ', 'ಹೂವು', 'ಎಲೆ'], ans: 'ಹೂವು' },
  { q: '"One" in Kannada?', options: ['ಎರಡು', 'ಮೂರು', 'ಒಂದು', 'ನಾಲ್ಕು'], ans: 'ಒಂದು' },
];

const PHASE = { LOBBY: 'lobby', PLAYING: 'playing', RESULTS: 'results' };
const card = { background: 'var(--indigo-card)', border: '1px solid var(--glass-border)', borderRadius: '18px', padding: '1.4rem' };

const FAKE_PLAYERS = ['Priya', 'Arun', 'Meena', 'Raj', 'Suma'];

export default function GroupQuizRoom({ user, onXP, onToast, onNavigate }) {
  const [phase, setPhase]     = useState(PHASE.LOBBY);
  const [roomCode, setRoomCode] = useState(() => Math.floor(1000 + Math.random() * 9000).toString());
  const [players, setPlayers] = useState([{ name: user?.name || 'You', score: 0, isMe: true }]);
  const [qIdx, setQIdx]       = useState(0);
  const [selected, setSelected] = useState(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [scores, setScores]   = useState({});
  const timerRef              = useRef(null);

  // Simulate friends joining
  useEffect(() => {
    if (phase !== PHASE.LOBBY) return;
    const t1 = setTimeout(() => setPlayers(p => [...p, { name: FAKE_PLAYERS[0], score: 0, isMe: false }]), 3000);
    const t2 = setTimeout(() => setPlayers(p => [...p, { name: FAKE_PLAYERS[1], score: 0, isMe: false }]), 5500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [phase]);

  const startGame = () => {
    setPhase(PHASE.PLAYING);
    setQIdx(0);
    setSelected(null);
    setTimeLeft(15);
    const init = {};
    players.forEach(p => { init[p.name] = 0; });
    setScores(init);
  };

  const nextQ = () => {
    clearInterval(timerRef.current);
    setSelected(null);
    setTimeLeft(15);
    if (qIdx + 1 >= QUESTIONS.length) { setPhase(PHASE.RESULTS); return; }
    setQIdx(q => q + 1);
    // AI players answer
    setScores(s => {
      const updated = { ...s };
      players.filter(p => !p.isMe).forEach(p => {
        if (Math.random() > 0.4) updated[p.name] = (updated[p.name] || 0) + Math.floor(Math.random() * 12) + 5;
      });
      return updated;
    });
  };

  useEffect(() => {
    if (phase !== PHASE.PLAYING) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => { if (t <= 1) { nextQ(); return 15; } return t - 1; });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, qIdx]);

  const handleAnswer = (opt) => {
    if (selected) return;
    clearInterval(timerRef.current);
    setSelected(opt);
    const correct = opt === QUESTIONS[qIdx].ans;
    if (correct) setScores(s => ({ ...s, [user?.name || 'You']: (s[user?.name || 'You'] || 0) + Math.max(5, timeLeft) }));
    setTimeout(nextQ, 1000);
  };

  const sorted = players.map(p => ({ ...p, score: scores[p.name] || 0 })).sort((a, b) => b.score - a.score);
  const myRank = sorted.findIndex(p => p.isMe) + 1;
  const medalColor = ['#ffd700', '#c0c0c0', '#cd7f32'];

  return (
    <div className="learning-screen" style={{ maxWidth: 640, margin: '0 auto', padding: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'linear-gradient(135deg,#4facfe,#00f2fe)', borderRadius: '14px', padding: '0.7rem', display: 'flex' }}>
          <Users size={26} color="#fff" />
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>Group Quiz Room</h1>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'Noto Sans Kannada,sans-serif' }}>ಗುಂಪು ಪರೀಕ್ಷೆ ಕೊಠಡಿ</p>
        </div>
        <button onClick={() => onNavigate('multiplayerarena')} style={{ background: 'none', border: '1px solid var(--glass-border)', borderRadius: '10px', padding: '0.45rem 0.8rem', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}>
          <ArrowLeft size={15} /> Back
        </button>
      </div>

      {phase === PHASE.LOBBY && (
        <div style={{ ...card }}>
          <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
            <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.82rem', marginBottom: '0.4rem' }}>Your Room Code</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--sakura-pink)', letterSpacing: '0.4rem' }}>{roomCode}</div>
            <button onClick={() => { navigator.clipboard?.writeText(roomCode); onToast('Room code copied!', 'success'); }} style={{ marginTop: '0.5rem', background: 'none', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '0.35rem 0.9rem', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <Copy size={13} /> Copy Code
            </button>
          </div>
          <div style={{ marginBottom: '1.2rem' }}>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem', marginBottom: '0.6rem' }}>Players Joined ({players.length}/6)</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {players.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '0.55rem 0.9rem' }}>
                  {p.isMe && <Crown size={14} color="#ffd700" />}
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#4facfe,#00f2fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#fff', fontSize: '0.85rem' }}>{p.name[0]}</div>
                  <span style={{ color: '#fff', fontSize: '0.88rem', fontWeight: p.isMe ? 700 : 400 }}>{p.name} {p.isMe && <span style={{ color: '#ffd700', fontSize: '0.72rem' }}>(Host)</span>}</span>
                  <div style={{ marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%', background: '#43e97b' }} />
                </div>
              ))}
            </div>
          </div>
          <button onClick={startGame} style={{ width: '100%', background: 'linear-gradient(135deg,#4facfe,#00f2fe)', border: 'none', borderRadius: '14px', padding: '0.85rem', color: '#fff', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Play size={20} /> Start Quiz
          </button>
        </div>
      )}

      {phase === PHASE.PLAYING && (
        <>
          {/* Live Scores */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', overflowX: 'auto' }}>
            {sorted.map((p, i) => (
              <div key={p.name} style={{ background: p.isMe ? 'rgba(79,172,254,0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${p.isMe ? 'rgba(79,172,254,0.4)' : 'var(--glass-border)'}`, borderRadius: '12px', padding: '0.5rem 0.8rem', textAlign: 'center', minWidth: 70, flexShrink: 0 }}>
                {i < 3 && <div style={{ width: 12, height: 12, borderRadius: '50%', background: medalColor[i], margin: '0 auto 0.2rem' }} />}
                <div style={{ color: '#fff', fontWeight: 900, fontSize: '1.1rem' }}>{p.score}</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 60 }}>{p.name.split(' ')[0]}</div>
              </div>
            ))}
          </div>

          <div style={{ height: 5, background: 'rgba(255,255,255,0.1)', borderRadius: 3, marginBottom: '1rem' }}>
            <div style={{ height: '100%', width: `${(timeLeft / 15) * 100}%`, background: timeLeft > 8 ? '#43e97b' : timeLeft > 4 ? '#ffd700' : '#ff5858', borderRadius: 3, transition: 'width 1s linear' }} />
          </div>

          <div style={card}>
            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', marginBottom: '0.5rem' }}>Q{qIdx + 1}/{QUESTIONS.length}</div>
            <div style={{ textAlign: 'center', fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginBottom: '1.2rem' }}>{QUESTIONS[qIdx].q}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.7rem' }}>
              {QUESTIONS[qIdx].options.map(opt => {
                let bg = 'rgba(255,255,255,0.07)'; let border = '1px solid var(--glass-border)';
                if (selected) {
                  if (opt === QUESTIONS[qIdx].ans) { bg = 'rgba(67,233,123,0.2)'; border = '1px solid #43e97b'; }
                  else if (selected === opt) { bg = 'rgba(255,88,88,0.2)'; border = '1px solid #ff5858'; }
                }
                return (
                  <button key={opt} onClick={() => handleAnswer(opt)} style={{ background: bg, border, borderRadius: '12px', padding: '0.85rem', color: '#fff', fontWeight: 700, cursor: selected ? 'default' : 'pointer', fontSize: '0.95rem', fontFamily: 'Noto Sans Kannada,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                    {selected && opt === QUESTIONS[qIdx].ans && <CheckCircle size={15} color="#43e97b" />}
                    {selected && selected === opt && opt !== QUESTIONS[qIdx].ans && <XCircle size={15} color="#ff5858" />}
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {phase === PHASE.RESULTS && (
        <div style={card}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <Trophy size={56} color="#ffd700" style={{ filter: 'drop-shadow(0 0 16px gold)', marginBottom: '0.5rem' }} />
            <div style={{ color: '#fff', fontWeight: 900, fontSize: '1.4rem' }}>
              {myRank === 1 ? 'You Won the Room!' : `You finished #${myRank}!`}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.2rem' }}>
            {sorted.map((p, i) => (
              <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.6rem 0.9rem', background: p.isMe ? 'rgba(79,172,254,0.15)' : 'rgba(255,255,255,0.05)', borderRadius: '12px', border: p.isMe ? '1px solid rgba(79,172,254,0.3)' : '1px solid transparent' }}>
                <div style={{ fontWeight: 900, color: i < 3 ? medalColor[i] : 'rgba(255,255,255,0.4)', fontSize: '1rem', width: 24, textAlign: 'center' }}>#{i + 1}</div>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#4facfe,#00f2fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#fff', fontSize: '0.85rem' }}>{p.name[0]}</div>
                <span style={{ flex: 1, color: '#fff', fontWeight: p.isMe ? 700 : 400, fontSize: '0.9rem' }}>{p.name}</span>
                <span style={{ color: 'var(--sakura-pink)', fontWeight: 700 }}>{p.score} pts</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.7rem' }}>
            <button onClick={() => { setPhase(PHASE.LOBBY); setPlayers([{ name: user?.name || 'You', score: 0, isMe: true }]); }} style={{ flex: 1, background: 'linear-gradient(135deg,#4facfe,#00f2fe)', border: 'none', borderRadius: '12px', padding: '0.7rem', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Play Again</button>
            <button onClick={() => onNavigate('multiplayerarena')} style={{ flex: 1, background: 'rgba(255,255,255,0.1)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '0.7rem', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Arena</button>
          </div>
        </div>
      )}
    </div>
  );
}
