import React, { useState, useEffect } from 'react';
import { Gamepad2, Swords, Users, BookOpen, Trophy, Target, Zap, Lock } from 'lucide-react';
import { getFriendsWithProfiles } from '../utils/friendsStorage.js';

const card = { background: 'var(--indigo-card)', border: '1px solid var(--glass-border)', borderRadius: '18px' };

const MODES = [
  {
    icon: Swords, label: '1v1 Vocabulary Duel', sub: 'ಶಬ್ದ ಯುದ್ಧ', desc: 'Race against a friend to translate Kannada words fastest', page: 'liveduel',
    grad: 'linear-gradient(135deg,#f093fb,#f5576c)', players: '2 players',
  },
  {
    icon: Users, label: 'Group Quiz Room', sub: 'ಗುಂಪು ಪರೀಕ್ಷೆ', desc: 'Up to 6 friends compete in a live quiz showdown', page: 'groupquiz',
    grad: 'linear-gradient(135deg,#4facfe,#00f2fe)', players: '2-6 players',
  },
  {
    icon: BookOpen, label: 'Coop Study Room', sub: 'ಜಂಟಿ ಅಭ್ಯಾಸ', desc: 'Study Kannada together and earn XP as a team', page: 'cooplesson',
    grad: 'linear-gradient(135deg,#43e97b,#38f9d7)', players: '2 players',
  },
  {
    icon: Trophy, label: 'Friends Leaderboard', sub: 'ಶ್ರೇಣಿ ಪಟ್ಟಿ', desc: 'See how you rank among your friends this week', page: 'friendleaderboard',
    grad: 'linear-gradient(135deg,#ffd700,#ff923b)', players: 'All friends',
  },
  {
    icon: Target, label: 'Challenge Mode', sub: 'ಸ್ಪರ್ಧೆ', desc: 'Send beat-my-score challenges with expiry timers', page: 'challengesystem',
    grad: 'linear-gradient(135deg,#ff6b35,#ffa366)', players: '2 players',
  },
  {
    icon: Zap, label: 'Speed Typing Race', sub: 'ತ್ವರಿತ ಟೈಪಿಂಗ್', desc: 'Type Kannada words faster than your friend!', page: null,
    grad: 'linear-gradient(135deg,#667eea,#764ba2)', players: '2 players', soon: true,
  },
];

export default function MultiplayerArena({ user, onNavigate, onToast }) {
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    if (user?.code) setFriends(getFriendsWithProfiles(user.code));
  }, [user?.code]);

  const onlineFriends = friends.filter(f => f.online);

  return (
    <div className="learning-screen" style={{ maxWidth: 720, margin: '0 auto', padding: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'linear-gradient(135deg,#f093fb,#f5576c)', borderRadius: '14px', padding: '0.7rem', display: 'flex' }}>
          <Gamepad2 size={26} color="#fff" />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>Multiplayer Arena</h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'Noto Sans Kannada,sans-serif' }}>ಬಹು-ಆಟಗಾರರ ಅಖಾಡ</p>
        </div>
        <div style={{ marginLeft: 'auto', background: onlineFriends.length > 0 ? 'rgba(67,233,123,0.15)' : 'rgba(255,255,255,0.07)', border: `1px solid ${onlineFriends.length > 0 ? 'rgba(67,233,123,0.4)' : 'var(--glass-border)'}`, borderRadius: '20px', padding: '0.35rem 0.9rem', color: onlineFriends.length > 0 ? '#43e97b' : 'rgba(255,255,255,0.4)', fontSize: '0.8rem', fontWeight: 700 }}>
          {onlineFriends.length} online
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {MODES.map(({ icon: Icon, label, sub, desc, page, grad, players, soon }) => (
          <div key={label} style={{ ...card, padding: '1.2rem', position: 'relative', overflow: 'hidden', opacity: soon ? 0.65 : 1 }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, background: grad, opacity: 0.12, borderRadius: '0 18px 0 80px' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.7rem' }}>
              <div style={{ background: grad, borderRadius: '12px', padding: '0.55rem', display: 'flex', flexShrink: 0 }}>
                <Icon size={22} color="#fff" />
              </div>
              <div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>{label}</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem', fontFamily: 'Noto Sans Kannada,sans-serif' }}>{sub}</div>
              </div>
              {soon && (
                <div style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.2rem 0.5rem', fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Lock size={11} /> Soon
                </div>
              )}
            </div>
            <p style={{ margin: '0 0 0.8rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', lineHeight: 1.5 }}>{desc}</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Users size={12} /> {players}
              </span>
              <button disabled={soon} onClick={() => !soon && page && onNavigate(page)} style={{
                background: soon ? 'rgba(255,255,255,0.1)' : grad, border: 'none', borderRadius: '10px',
                padding: '0.45rem 1rem', color: '#fff', fontWeight: 700, fontSize: '0.8rem',
                cursor: soon ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}>
                <Swords size={14} /> {soon ? 'Coming Soon' : 'Play'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {onlineFriends.length > 0 && (
        <div style={{ ...card, padding: '1.2rem' }}>
          <h3 style={{ margin: '0 0 0.9rem', color: '#43e97b', fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={16} /> Online Friends
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.7rem' }}>
            {onlineFriends.map(f => (
              <div key={f.code} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '0.5rem 0.8rem' }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#43e97b,#38f9d7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#fff', fontSize: '0.85rem' }}>{f.avatar}</div>
                <span style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600 }}>{f.name.split(' ')[0]}</span>
                <button onClick={() => onNavigate('liveduel')} style={{ background: 'linear-gradient(135deg,#f093fb,#f5576c)', border: 'none', borderRadius: '8px', padding: '0.3rem 0.65rem', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Swords size={12} /> Invite
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {friends.length === 0 && (
        <div style={{ ...card, padding: '2rem', textAlign: 'center' }}>
          <Users size={40} color="rgba(255,255,255,0.2)" style={{ marginBottom: '0.8rem' }} />
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '1rem' }}>Add friends to play multiplayer games!</p>
          <button onClick={() => onNavigate('addfriend')} style={{ background: 'linear-gradient(135deg,#ff6b35,#ffa366)', border: 'none', borderRadius: '12px', padding: '0.6rem 1.4rem', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Add Friends</button>
        </div>
      )}
    </div>
  );
}
