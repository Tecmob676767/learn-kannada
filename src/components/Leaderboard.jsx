import React, { useState } from 'react';
import { getAllUsers, getCurrentUserCode, getLevelTitle } from '../utils/storage.js';

const MEDALS = ['🥇', '🥈', '🥉'];

const Leaderboard = () => {
  const [tab, setTab] = useState('xp'); // 'xp' | 'streak' | 'badges'
  const allUsers = getAllUsers();
  const currentCode = getCurrentUserCode();

  const users = Object.entries(allUsers).map(([code, u]) => ({
    code,
    name: u.name || 'Learner',
    xp: u.xp || 0,
    level: u.level || 1,
    streak: u.streak || 0,
    badges: (u.badges || []).length,
    levelTitle: getLevelTitle(u.level || 1),
    isMe: code === currentCode,
  }));

  const sorted = [...users].sort((a, b) => {
    if (tab === 'xp') return b.xp - a.xp;
    if (tab === 'streak') return b.streak - a.streak;
    return b.badges - a.badges;
  });

  const myRank = sorted.findIndex(u => u.isMe) + 1;

  return (
    <div className="learning-screen">
      <div className="page-header">
        <h2>🏆 Leaderboard</h2>
        <p>See how you stack up against all Sobagu learners!</p>
      </div>

      {/* My rank banner */}
      <div className="glass-card" style={{
        padding: '1.25rem 1.5rem',
        marginBottom: '1.75rem',
        background: 'linear-gradient(135deg, rgba(255,215,0,0.1), rgba(232,130,154,0.08))',
        border: '1px solid rgba(255,215,0,0.25)',
        display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap'
      }}>
        <div style={{ fontSize: '2.5rem' }}>{myRank <= 3 ? MEDALS[myRank - 1] : `#${myRank}`}</div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>Your Rank</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {myRank === 1 ? "You're #1! Keep it up 🌸" :
             myRank <= 3 ? `Almost at the top! Only ${myRank - 1} ahead of you.` :
             `${myRank - 1} learner${myRank - 1 === 1 ? '' : 's'} ahead of you — keep going!`}
          </div>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--gold)' }}>
            {tab === 'xp' ? `${sorted.find(u => u.isMe)?.xp ?? 0} XP` :
             tab === 'streak' ? `${sorted.find(u => u.isMe)?.streak ?? 0} days` :
             `${sorted.find(u => u.isMe)?.badges ?? 0} badges`}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {tab === 'xp' ? 'Total XP' : tab === 'streak' ? 'Streak' : 'Badges'}
          </div>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="section-tabs" style={{ marginBottom: '1.5rem' }}>
        <button className={`section-tab${tab === 'xp' ? ' active' : ''}`} onClick={() => setTab('xp')}>⭐ XP</button>
        <button className={`section-tab${tab === 'streak' ? ' active' : ''}`} onClick={() => setTab('streak')}>🔥 Streak</button>
        <button className={`section-tab${tab === 'badges' ? ' active' : ''}`} onClick={() => setTab('badges')}>🏅 Badges</button>
      </div>

      {/* Leaderboard list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {sorted.length === 0 && (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No learners yet. You're the pioneer! 🌸
          </div>
        )}

        {sorted.map((u, i) => {
          const rank = i + 1;
          const isMedal = rank <= 3;
          return (
            <div
              key={u.code}
              className="glass-card"
              style={{
                padding: '1rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                border: u.isMe
                  ? '1px solid rgba(255,215,0,0.5)'
                  : isMedal
                    ? '1px solid rgba(255,183,197,0.25)'
                    : undefined,
                background: u.isMe
                  ? 'linear-gradient(135deg, rgba(255,215,0,0.08), rgba(232,130,154,0.06))'
                  : undefined,
                transition: 'transform 0.2s ease',
                transform: u.isMe ? 'scale(1.01)' : undefined,
              }}
            >
              {/* Rank */}
              <div style={{
                width: '40px',
                textAlign: 'center',
                fontSize: isMedal ? '1.5rem' : '1rem',
                fontWeight: 800,
                color: isMedal ? undefined : 'var(--text-muted)',
                flexShrink: 0,
              }}>
                {isMedal ? MEDALS[rank - 1] : `#${rank}`}
              </div>

              {/* Avatar */}
              <div style={{
                width: '40px', height: '40px',
                borderRadius: '50%',
                background: u.isMe
                  ? 'linear-gradient(135deg, var(--sakura-deep), #9b3a6e)'
                  : 'linear-gradient(135deg, #3b4a6b, #1a2a4a)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: '1rem', flexShrink: 0,
                boxShadow: u.isMe ? '0 0 12px rgba(232,130,154,0.4)' : undefined,
              }}>
                {u.name[0].toUpperCase()}
              </div>

              {/* Name & title */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  display: 'flex', alignItems: 'center', gap: '0.5rem'
                }}>
                  {u.name}
                  {u.isMe && <span className="pill pill-pink" style={{ fontSize: '0.65rem' }}>YOU</span>}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Lv.{u.level} · {u.levelTitle}
                </div>
              </div>

              {/* Score */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--gold)' }}>
                  {tab === 'xp' ? `${u.xp} XP` :
                   tab === 'streak' ? `${u.streak} 🔥` :
                   `${u.badges} 🏅`}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {tab === 'xp' ? 'experience' : tab === 'streak' ? 'days' : 'badges'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {users.length <= 1 && (
        <div style={{
          marginTop: '1.5rem',
          padding: '1.25rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(255,183,197,0.06)',
          border: '1px dashed rgba(255,183,197,0.25)',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.88rem',
        }}>
          🌸 Share Sobagu with friends — every new learner who signs up joins the leaderboard!
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
