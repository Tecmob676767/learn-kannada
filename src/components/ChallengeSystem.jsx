import React, { useState, useEffect } from 'react';
import { Target, Send, Zap, Clock, X, CheckCircle, Trophy, Swords } from 'lucide-react';

const KEY = 'sobagu_challenges';

const loadChallenges = () => {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
  catch { return []; }
};
const saveChallenges = (arr) => localStorage.setItem(KEY, JSON.stringify(arr.slice(-100)));

const card = { background: 'var(--indigo-card)', border: '1px solid var(--glass-border)', borderRadius: '18px', padding: '1.2rem', marginBottom: '1rem' };

const EXPIRY_OPTIONS = [
  { label: '24 hours', ms: 86400000 },
  { label: '48 hours', ms: 172800000 },
  { label: '7 days',   ms: 604800000 },
];
const CHALLENGE_TYPES = ['Beat my XP score', 'Beat my Quiz score', 'Complete a lesson first'];

function timeLeft(expiresAt) {
  const diff = expiresAt - Date.now();
  if (diff <= 0) return 'Expired';
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d left`;
  return `${h}h left`;
}

export default function ChallengeSystem({ user, onXP, onToast, onNavigate }) {
  const [challenges, setChallenges] = useState([]);
  const [toCode, setToCode]         = useState('');
  const [type, setType]             = useState(CHALLENGE_TYPES[0]);
  const [expiry, setExpiry]         = useState(EXPIRY_OPTIONS[0]);
  const [message, setMessage]       = useState('');

  const refresh = () => setChallenges(loadChallenges());

  useEffect(() => { refresh(); }, []);

  const sendChallenge = () => {
    const clean = toCode.replace(/\D/g, '').slice(0, 6);
    if (clean.length !== 6) { onToast('Enter a valid 6-digit code', 'error'); return; }
    if (clean === user?.code) { onToast('Cannot challenge yourself!', 'error'); return; }

    const users_db = (() => { try { return JSON.parse(localStorage.getItem('sobagu_users') || '{}'); } catch { return {}; } })();
    const toName = users_db[clean]?.name || `User #${clean}`;

    const c = {
      id: Date.now(),
      from: user.code, fromName: user.name,
      to: clean, toName,
      type, message: message.trim(),
      expiresAt: Date.now() + expiry.ms,
      status: 'pending', // pending / accepted / beaten / declined
      myXP: user?.xp || 0,
      sentAt: Date.now(),
    };
    const all = [...loadChallenges(), c];
    saveChallenges(all);
    setChallenges(all);
    setToCode(''); setMessage('');
    onToast(`Challenge sent to ${toName}!`, 'success');
  };

  const handleAccept = (id) => {
    const updated = challenges.map(c => c.id === id ? { ...c, status: 'accepted' } : c);
    saveChallenges(updated);
    setChallenges(updated);
    onToast('Challenge accepted! Go for it!', 'success');
    if (onXP) onXP(10);
  };

  const handleDecline = (id) => {
    const updated = challenges.map(c => c.id === id ? { ...c, status: 'declined' } : c);
    saveChallenges(updated);
    setChallenges(updated);
    onToast('Challenge declined', 'info');
  };

  const myCode  = user?.code;
  const sent     = challenges.filter(c => c.from === myCode);
  const received = challenges.filter(c => c.to   === myCode && c.status === 'pending');

  const statusColor = { pending: '#ffa366', accepted: '#4facfe', beaten: '#43e97b', declined: 'rgba(255,255,255,0.3)' };

  return (
    <div className="learning-screen" style={{ maxWidth: 640, margin: '0 auto', padding: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'linear-gradient(135deg,#ff6b35,#ffa366)', borderRadius: '14px', padding: '0.7rem', display: 'flex' }}>
          <Target size={26} color="#fff" />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>Challenge System</h1>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'Noto Sans Kannada,sans-serif' }}>ಸ್ಪರ್ಧೆ ವ್ಯವಸ್ಥೆ</p>
        </div>
      </div>

      {/* Send Challenge */}
      <div style={card}>
        <h3 style={{ margin: '0 0 1rem', color: '#fff', fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Swords size={16} color="var(--sakura-pink)" /> Send a Challenge
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
          <input value={toCode} onChange={e => setToCode(e.target.value)} maxLength={6} placeholder="Friend's 6-digit code"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid var(--glass-border)', borderRadius: '10px', padding: '0.6rem 0.9rem', color: '#fff', fontSize: '0.9rem', outline: 'none' }} />
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {CHALLENGE_TYPES.map(t => (
              <button key={t} onClick={() => setType(t)} style={{ background: type === t ? 'linear-gradient(135deg,#ff6b35,#ffa366)' : 'rgba(255,255,255,0.07)', border: 'none', borderRadius: '8px', padding: '0.4rem 0.8rem', color: '#fff', cursor: 'pointer', fontSize: '0.78rem', fontWeight: type === t ? 700 : 400 }}>
                {t}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {EXPIRY_OPTIONS.map(e => (
              <button key={e.label} onClick={() => setExpiry(e)} style={{ flex: 1, background: expiry.label === e.label ? 'rgba(255,107,53,0.2)' : 'rgba(255,255,255,0.07)', border: `1px solid ${expiry.label === e.label ? 'rgba(255,107,53,0.5)' : 'var(--glass-border)'}`, borderRadius: '8px', padding: '0.4rem', color: '#fff', cursor: 'pointer', fontSize: '0.75rem', fontWeight: expiry.label === e.label ? 700 : 400 }}>
                {e.label}
              </button>
            ))}
          </div>
          <input value={message} onChange={e => setMessage(e.target.value)} placeholder="Optional message (e.g. 'Try to beat this!')"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid var(--glass-border)', borderRadius: '10px', padding: '0.6rem 0.9rem', color: '#fff', fontSize: '0.85rem', outline: 'none' }} />
          <button onClick={sendChallenge} style={{ background: 'linear-gradient(135deg,#ff6b35,#ffa366)', border: 'none', borderRadius: '12px', padding: '0.75rem', color: '#fff', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Send size={18} /> Send Challenge
          </button>
        </div>
      </div>

      {/* Received Challenges */}
      {received.length > 0 && (
        <div style={card}>
          <h3 style={{ margin: '0 0 0.8rem', color: '#ffa366', fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap size={16} /> Received Challenges ({received.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
            {received.map(c => (
              <div key={c.id} style={{ background: 'rgba(255,163,102,0.08)', border: '1px solid rgba(255,163,102,0.2)', borderRadius: '14px', padding: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>{c.fromName}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem' }}>
                    <Clock size={11} /> {timeLeft(c.expiresAt)}
                  </div>
                </div>
                <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.83rem', marginBottom: '0.3rem' }}>{c.type}</div>
                {c.message && <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.78rem', fontStyle: 'italic', marginBottom: '0.6rem' }}>"{c.message}"</div>}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleAccept(c.id)} style={{ flex: 1, background: 'linear-gradient(135deg,#43e97b,#38f9d7)', border: 'none', borderRadius: '10px', padding: '0.5rem', color: '#fff', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.82rem' }}>
                    <CheckCircle size={15} /> Accept
                  </button>
                  <button onClick={() => handleDecline(c.id)} style={{ flex: 1, background: 'rgba(255,255,255,0.08)', border: '1px solid var(--glass-border)', borderRadius: '10px', padding: '0.5rem', color: 'rgba(255,255,255,0.55)', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.82rem' }}>
                    <X size={15} /> Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sent Challenges */}
      {sent.length > 0 && (
        <div style={card}>
          <h3 style={{ margin: '0 0 0.8rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Trophy size={16} /> My Challenges
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {sent.map(c => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '0.7rem 0.9rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.85rem' }}>To: {c.toName}</div>
                  <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.72rem' }}>{c.type}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>
                  <Clock size={11} /> {timeLeft(c.expiresAt)}
                </div>
                <div style={{ background: `${statusColor[c.status]}22`, border: `1px solid ${statusColor[c.status]}44`, borderRadius: '8px', padding: '0.2rem 0.6rem', color: statusColor[c.status], fontSize: '0.7rem', fontWeight: 700, textTransform: 'capitalize' }}>
                  {c.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
