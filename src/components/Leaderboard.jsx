import React, { useState, useEffect } from 'react';
import { getAllUsers, getCurrentUserCode, getLevelTitle, getCurrentUser } from '../utils/storage.js';
import { fetchGlobalUsers, syncUserToCloud } from '../utils/onlineLeaderboard.js';

const MEDALS = ['🥇', '🥈', '🥉'];

const Leaderboard = () => {
  const [tab, setTab] = useState('xp'); // 'xp' | 'streak' | 'badges'
  const [loading, setLoading] = useState(true);
  const [cloudUsers, setCloudUsers] = useState({});
  const [lastSyncTime, setLastSyncTime] = useState(null);

  const currentCode = getCurrentUserCode();
  const currentUser = getCurrentUser();

  // Load cloud users & auto sync current user on component load
  const loadLeaderboard = async () => {
    setLoading(true);
    // Ensure current user is synced
    if (currentUser) {
      await syncUserToCloud(currentUser);
    }
    const globalData = await fetchGlobalUsers();
    setCloudUsers(globalData);
    setLastSyncTime(new Date());
    setLoading(false);
  };

  useEffect(() => {
    loadLeaderboard();

    // Auto-refresh every 12 seconds for live updates
    const interval = setInterval(async () => {
      const globalData = await fetchGlobalUsers();
      setCloudUsers(globalData);
      setLastSyncTime(new Date());
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  // Combine cloud users & local storage users to ensure no local user is missed
  const localUsers = getAllUsers();
  const mergedUsersMap = { ...localUsers };

  // Overlay cloud user data
  Object.entries(cloudUsers).forEach(([code, u]) => {
    mergedUsersMap[code] = {
      ...(mergedUsersMap[code] || {}),
      code: u.code || code,
      name: u.name || 'Learner',
      xp: u.xp ?? mergedUsersMap[code]?.xp ?? 0,
      level: u.level ?? mergedUsersMap[code]?.level ?? 1,
      streak: u.streak ?? mergedUsersMap[code]?.streak ?? 0,
      badges: Array.isArray(u.badges) ? u.badges : new Array(u.badgesCount || 0).fill(true),
    };
  });

  const usersList = Object.entries(mergedUsersMap).map(([code, u]) => ({
    code,
    name: u.name || 'Learner',
    xp: u.xp || 0,
    level: u.level || 1,
    streak: u.streak || 0,
    badges: (u.badges || []).length || u.badgesCount || 0,
    levelTitle: getLevelTitle(u.level || 1),
    isMe: code === currentCode,
  }));

  const sorted = [...usersList].sort((a, b) => {
    if (tab === 'xp') return b.xp - a.xp;
    if (tab === 'streak') return b.streak - a.streak;
    return b.badges - a.badges;
  });

  const myRank = sorted.findIndex(u => u.isMe) + 1;

  return (
    <div className="learning-screen">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>🏆 Live Global Leaderboard</h2>
          <p>Real-time scores & rankings across all learners worldwide!</p>
        </div>

        {/* Live sync badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.6rem',
          background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
          padding: '0.5rem 1rem', borderRadius: '100px', fontSize: '0.82rem', color: '#4ade80'
        }}>
          <span style={{
            width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80',
            boxShadow: '0 0 10px #4ade80', animation: 'pulse 2s infinite'
          }} />
          <span>{loading ? 'Syncing...' : 'Live Connected'}</span>
          <button
            onClick={loadLeaderboard}
            style={{
              background: 'none', border: 'none', color: 'var(--text-muted)',
              cursor: 'pointer', fontSize: '0.9rem', marginLeft: '0.2rem', padding: 0
            }}
            title="Refresh Leaderboard"
          >
            🔄
          </button>
        </div>
      </div>

      {/* My rank banner */}
      <div className="glass-card" style={{
        padding: '1.25rem 1.5rem',
        marginBottom: '1.75rem',
        background: 'linear-gradient(135deg, rgba(255,215,0,0.12), rgba(232,130,154,0.08))',
        border: '1px solid rgba(255,215,0,0.3)',
        display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap'
      }}>
        <div style={{ fontSize: '2.5rem' }}>{myRank <= 3 && myRank > 0 ? MEDALS[myRank - 1] : myRank > 0 ? `#${myRank}` : '—'}</div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>Your Global Rank</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {myRank === 1 ? "🎉 You're #1 globally! Outstanding!" :
             myRank <= 3 && myRank > 0 ? `🔥 Top 3! Only ${myRank - 1} learner ahead of you.` :
             myRank > 0 ? `${myRank - 1} learner${myRank - 1 === 1 ? '' : 's'} ahead of you — keep practicing!` :
             "Start earning XP to enter the rankings!"}
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
        <button className={`section-tab${tab === 'xp' ? ' active' : ''}`} onClick={() => setTab('xp')}>⭐ Global XP</button>
        <button className={`section-tab${tab === 'streak' ? ' active' : ''}`} onClick={() => setTab('streak')}>🔥 Daily Streak</button>
        <button className={`section-tab${tab === 'badges' ? ' active' : ''}`} onClick={() => setTab('badges')}>🏅 Badges</button>
      </div>

      {/* Leaderboard list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        {sorted.length === 0 && !loading && (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No online learners yet. Be the first to earn XP! 🌸
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
                  ? '1px solid rgba(255,215,0,0.6)'
                  : isMedal
                    ? '1px solid rgba(255,183,197,0.3)'
                    : undefined,
                background: u.isMe
                  ? 'linear-gradient(135deg, rgba(255,215,0,0.12), rgba(232,130,154,0.08))'
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
                width: '42px', height: '42px',
                borderRadius: '50%',
                background: u.isMe
                  ? 'linear-gradient(135deg, var(--sakura-deep), #9b3a6e)'
                  : 'linear-gradient(135deg, #3b4a6b, #1a2a4a)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: '1.1rem', flexShrink: 0,
                boxShadow: u.isMe ? '0 0 14px rgba(232,130,154,0.5)' : undefined,
                border: '2px solid rgba(255,255,255,0.1)'
              }}>
                {u.name ? u.name[0].toUpperCase() : 'L'}
              </div>

              {/* Name & title */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontWeight: 700,
                  fontSize: '0.98rem',
                  display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap'
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
                <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--gold)' }}>
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

      <div style={{
        marginTop: '2rem',
        padding: '1.25rem',
        borderRadius: 'var(--radius-md)',
        background: 'rgba(255,183,197,0.06)',
        border: '1px dashed rgba(255,183,197,0.25)',
        textAlign: 'center',
        color: 'var(--text-secondary)',
        fontSize: '0.88rem',
      }}>
        🌍 <strong>Live Global Sync Active:</strong> Anyone using the app around the world appears on this real-time leaderboard! Complete lessons and quizzes to climb to #1! 🌸
      </div>
    </div>
  );
};

export default Leaderboard;
