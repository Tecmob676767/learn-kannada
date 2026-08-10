import React, { useState, useEffect, useCallback } from 'react';
import { getAllUsers, getCurrentUserCode, getLevelTitle, getCurrentUser } from '../utils/storage.js';
import { fetchGlobalUsers, syncUserToCloud } from '../utils/onlineLeaderboard.js';

// ── Demo bots so the leaderboard is never empty ────────────────────────────
const DEMO_BOTS = [
  { code: 'bot_001', name: 'Priya Sharma',    xp: 3850, level: 8,  streak: 42, badgesCount: 14, isBot: true },
  { code: 'bot_002', name: 'Rahul Nair',      xp: 3100, level: 7,  streak: 31, badgesCount: 11, isBot: true },
  { code: 'bot_003', name: 'Ananya Rao',      xp: 2600, level: 6,  streak: 22, badgesCount: 9,  isBot: true },
  { code: 'bot_004', name: 'Kiran Patil',     xp: 2050, level: 5,  streak: 17, badgesCount: 7,  isBot: true },
  { code: 'bot_005', name: 'Deepika Reddy',   xp: 1600, level: 4,  streak: 12, badgesCount: 5,  isBot: true },
  { code: 'bot_006', name: 'Vikram Hegde',    xp: 1200, level: 3,  streak: 8,  badgesCount: 4,  isBot: true },
  { code: 'bot_007', name: 'Meera Joshi',     xp:  850, level: 2,  streak: 5,  badgesCount: 3,  isBot: true },
  { code: 'bot_008', name: 'Arjun Kumar',     xp:  500, level: 1,  streak: 3,  badgesCount: 1,  isBot: true },
];

const MEDALS   = ['🥇', '🥈', '🥉'];
const AVATARS   = ['🌸', '🌟', '🦋', '🌺', '🎯', '🔥', '⚡', '🌙', '🎪', '🏵️'];
const COLORS    = [
  'linear-gradient(135deg,#ff9a9e,#fecfef)',
  'linear-gradient(135deg,#a18cd1,#fbc2eb)',
  'linear-gradient(135deg,#fccb90,#d57eeb)',
  'linear-gradient(135deg,#43e97b,#38f9d7)',
  'linear-gradient(135deg,#4facfe,#00f2fe)',
  'linear-gradient(135deg,#f093fb,#f5576c)',
  'linear-gradient(135deg,#ffcf71,#ff923b)',
  'linear-gradient(135deg,#30cfd0,#330867)',
];

const hashCode = (str) => {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return Math.abs(h);
};

const UserAvatar = ({ user, size = 44 }) => {
  const h   = hashCode(user.code || user.name || 'x');
  const bg  = COLORS[h % COLORS.length];
  const ico = AVATARS[h % AVATARS.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: user.isMe ? 'linear-gradient(135deg,#e8547a,#ff8c42)' : bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.42, flexShrink: 0, boxShadow: user.isMe ? '0 0 16px rgba(232,84,122,0.55)' : '0 2px 8px rgba(0,0,0,0.25)',
      border: `2px solid ${user.isMe ? 'rgba(255,215,0,0.7)' : 'rgba(255,255,255,0.12)'}`,
    }}>
      {user.name ? user.name[0].toUpperCase() : ico}
    </div>
  );
};

// ── Podium card for top 3 ──────────────────────────────────────────────────
const PodiumCard = ({ user, rank, tab }) => {
  const heights = [140, 110, 90];
  const gradients = [
    'linear-gradient(180deg,#ffd700,#ff8c00)',
    'linear-gradient(180deg,#c0c0c0,#888)',
    'linear-gradient(180deg,#cd7f32,#8b4513)',
  ];
  const score = tab === 'xp' ? `${user.xp} XP` : tab === 'streak' ? `${user.streak}🔥` : `${user.badges}🏅`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
      <div style={{ fontSize: '1.8rem' }}>{MEDALS[rank - 1]}</div>
      <UserAvatar user={user} size={52} />
      <div style={{ fontWeight: 800, fontSize: '0.88rem', textAlign: 'center', maxWidth: '90px',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {user.name}
        {user.isMe && <span style={{ display: 'block', fontSize: '0.62rem', color: '#ffd700' }}>YOU</span>}
      </div>
      <div style={{ fontWeight: 900, fontSize: '1rem', color: '#ffd700' }}>{score}</div>
      <div style={{
        width: '80px', height: `${heights[rank - 1]}px`,
        background: gradients[rank - 1],
        borderRadius: '10px 10px 0 0',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        paddingTop: '0.6rem', fontSize: '1.2rem', fontWeight: 900, color: 'rgba(0,0,0,0.4)',
        boxShadow: `0 -4px 20px ${rank === 1 ? 'rgba(255,215,0,0.4)' : 'rgba(0,0,0,0.2)'}`,
      }}>
        #{rank}
      </div>
    </div>
  );
};

// ── XP bar mini ────────────────────────────────────────────────────────────
const MiniBar = ({ pct, color = '#ffd700' }) => (
  <div style={{ width: '80px', height: '5px', borderRadius: '3px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
    <div style={{ width: `${Math.min(100, pct)}%`, height: '100%', background: color, borderRadius: '3px',
      transition: 'width 0.6s ease' }} />
  </div>
);

// ── Main Component ─────────────────────────────────────────────────────────
const Leaderboard = () => {
  const [tab, setTab]           = useState('xp');
  const [loading, setLoading]   = useState(true);
  const [online, setOnline]     = useState(true);
  const [cloudUsers, setCloudUsers] = useState({});
  const [lastSync, setLastSync] = useState(null);

  const currentCode = getCurrentUserCode();
  const currentUser = getCurrentUser();

  const loadLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      if (currentUser) syncUserToCloud(currentUser); // fire-and-forget
      const global = await fetchGlobalUsers();
      setCloudUsers(global);
      setOnline(true);
    } catch {
      setOnline(false);
    }
    setLastSync(new Date());
    setLoading(false);
  }, [currentUser]);

  useEffect(() => {
    loadLeaderboard();
    const interval = setInterval(async () => {
      try {
        const global = await fetchGlobalUsers();
        setCloudUsers(global);
        setLastSync(new Date());
        setOnline(true);
      } catch {
        setOnline(false);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // ── Merge: local → cloud → bots ───────────────────────────────────────────
  const localUsers  = getAllUsers();
  const merged      = {};

  // 1. local users first
  Object.entries(localUsers).forEach(([code, u]) => {
    merged[code] = {
      code,
      name:        u.name || 'Learner',
      xp:          u.xp || 0,
      level:       u.level || 1,
      streak:      u.streak || 0,
      badges:      (u.badges || []).length,
      levelTitle:  getLevelTitle(u.level || 1),
      isMe:        code === currentCode,
      isBot:       false,
      isLocal:     true,
    };
  });

  // 2. overlay cloud data
  Object.entries(cloudUsers).forEach(([code, u]) => {
    merged[code] = {
      ...(merged[code] || {}),
      code,
      name:        u.name || merged[code]?.name || 'Learner',
      xp:          u.xp  ?? merged[code]?.xp  ?? 0,
      level:       u.level  ?? merged[code]?.level  ?? 1,
      streak:      u.streak ?? merged[code]?.streak ?? 0,
      badges:      u.badgesCount ?? merged[code]?.badges ?? 0,
      levelTitle:  getLevelTitle(u.level ?? merged[code]?.level ?? 1),
      isMe:        code === currentCode,
      isBot:       false,
    };
  });

  // 3. add demo bots only for slots not already filled by real learners
  DEMO_BOTS.forEach(bot => {
    if (!merged[bot.code]) {
      merged[bot.code] = {
        ...bot,
        badges:     bot.badgesCount,
        levelTitle: getLevelTitle(bot.level),
        isMe:       false,
      };
    }
  });

  const usersList = Object.values(merged);

  const sorted = [...usersList].sort((a, b) => {
    if (tab === 'xp')     return b.xp     - a.xp;
    if (tab === 'streak') return b.streak  - a.streak;
    return b.badges - a.badges;
  });

  const top3   = sorted.slice(0, 3);
  const rest   = sorted.slice(3);
  const myRank = sorted.findIndex(u => u.isMe) + 1;
  const me     = sorted.find(u => u.isMe);

  const maxScore = tab === 'xp' ? (sorted[0]?.xp || 1)
                 : tab === 'streak' ? (sorted[0]?.streak || 1)
                 : (sorted[0]?.badges || 1);

  const getScore = (u) =>
    tab === 'xp' ? u.xp : tab === 'streak' ? u.streak : u.badges;

  return (
    <div className="learning-screen">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>🏆 Live Global Leaderboard</h2>
          <p>Real-time rankings across all Kannada learners worldwide!</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Online status pill */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: online ? 'rgba(34,197,94,0.1)' : 'rgba(255,100,100,0.1)',
            border: `1px solid ${online ? 'rgba(34,197,94,0.35)' : 'rgba(255,100,100,0.35)'}`,
            padding: '0.4rem 0.9rem', borderRadius: '100px',
            fontSize: '0.78rem', color: online ? '#4ade80' : '#f87171',
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: online ? '#4ade80' : '#f87171',
              boxShadow: online ? '0 0 8px #4ade80' : 'none',
              animation: online ? 'pulse 2s infinite' : 'none',
            }} />
            {loading ? 'Syncing…' : online ? 'Live Connected' : 'Offline Mode'}
          </div>

          <button
            onClick={loadLeaderboard}
            disabled={loading}
            style={{
              background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '50%', width: 36, height: 36,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: loading ? 'default' : 'pointer', fontSize: '1rem',
              transition: 'background 0.2s', color: '#fff',
              animation: loading ? 'spin 1s linear infinite' : 'none',
            }}
            title="Refresh"
          >
            🔄
          </button>
        </div>
      </div>

      {/* ── My Rank Banner ─────────────────────────────────────────────── */}
      {me && (
        <div className="glass-card" style={{
          padding: '1.25rem 1.5rem', marginBottom: '1.75rem',
          background: 'linear-gradient(135deg,rgba(255,215,0,0.1),rgba(232,84,122,0.08))',
          border: '1px solid rgba(255,215,0,0.35)',
          display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap',
        }}>
          <div style={{ fontSize: '2.8rem', lineHeight: 1 }}>
            {myRank <= 3 && myRank > 0 ? MEDALS[myRank - 1] : myRank > 0 ? `#${myRank}` : '—'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>Your Global Rank</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', marginTop: '0.15rem' }}>
              {myRank === 1    ? '🎉 You\'re #1! You\'re crushing it!' :
               myRank <= 3    ? `🔥 Top 3! Keep pushing!` :
               myRank > 3     ? `${myRank - 1} learner${myRank - 1 !== 1 ? 's' : ''} ahead — keep studying!` :
                                'Start earning XP to enter the rankings!'}
            </div>
            <div style={{ marginTop: '0.65rem' }}>
              <MiniBar pct={maxScore > 0 ? (getScore(me) / maxScore) * 100 : 0} color="#ffd700" />
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ffd700', lineHeight: 1 }}>
              {tab === 'xp' ? `${me.xp} XP` : tab === 'streak' ? `${me.streak} days` : `${me.badges} badges`}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '0.2rem' }}>
              {tab === 'xp' ? 'Total XP' : tab === 'streak' ? 'Streak' : 'Badges Earned'}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab Switcher ──────────────────────────────────────────────── */}
      <div className="section-tabs" style={{ marginBottom: '2rem' }}>
        <button className={`section-tab${tab === 'xp'     ? ' active' : ''}`} onClick={() => setTab('xp')}>⭐ Global XP</button>
        <button className={`section-tab${tab === 'streak' ? ' active' : ''}`} onClick={() => setTab('streak')}>🔥 Streak</button>
        <button className={`section-tab${tab === 'badges' ? ' active' : ''}`} onClick={() => setTab('badges')}>🏅 Badges</button>
      </div>

      {/* ── Podium ────────────────────────────────────────────────────── */}
      {!loading && sorted.length >= 3 && (
        <div style={{
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          gap: '0.75rem', marginBottom: '2.5rem', padding: '1.5rem 1rem 0',
        }}>
          {/* Silver #2 left, Gold #1 center, Bronze #3 right */}
          <PodiumCard user={top3[1]} rank={2} tab={tab} />
          <PodiumCard user={top3[0]} rank={1} tab={tab} />
          <PodiumCard user={top3[2]} rank={3} tab={tab} />
        </div>
      )}

      {/* ── Rest of the list ──────────────────────────────────────────── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem', animation: 'spin 1.5s linear infinite' }}>⏳</div>
          <div>Loading leaderboard…</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
          {rest.map((u, i) => {
            const rank    = i + 4;
            const score   = getScore(u);
            const barPct  = maxScore > 0 ? (score / maxScore) * 100 : 0;
            const barColor = u.isMe ? '#ffd700' : u.isBot ? 'rgba(255,255,255,0.25)' : '#a78bfa';
            return (
              <div
                key={u.code}
                className="glass-card"
                style={{
                  padding: '0.85rem 1.25rem',
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  border: u.isMe ? '1px solid rgba(255,215,0,0.55)' : '1px solid rgba(255,255,255,0.05)',
                  background: u.isMe
                    ? 'linear-gradient(135deg,rgba(255,215,0,0.1),rgba(232,84,122,0.06))'
                    : 'rgba(255,255,255,0.03)',
                  transform: u.isMe ? 'scale(1.01)' : 'none',
                  transition: 'transform 0.2s, background 0.2s',
                  borderRadius: '14px',
                }}
              >
                {/* Rank */}
                <div style={{
                  width: 36, textAlign: 'center', fontWeight: 800, flexShrink: 0,
                  fontSize: '0.9rem', color: 'var(--text-muted)',
                }}>
                  #{rank}
                </div>

                <UserAvatar user={u} size={40} />

                {/* Name & level */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                    {u.name}
                    {u.isMe && (
                      <span style={{
                        background: 'linear-gradient(135deg,#ffd700,#ff8c42)',
                        color: '#000', fontSize: '0.6rem', fontWeight: 900,
                        padding: '0.1rem 0.45rem', borderRadius: '20px',
                      }}>YOU</span>
                    )}
                    {u.isBot && (
                      <span style={{
                        background: 'rgba(255,255,255,0.1)', color: 'var(--text-muted)',
                        fontSize: '0.6rem', padding: '0.1rem 0.4rem', borderRadius: '20px',
                      }}>demo</span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    Lv.{u.level} · {u.levelTitle}
                  </div>
                  <div style={{ marginTop: '0.4rem' }}>
                    <MiniBar pct={barPct} color={barColor} />
                  </div>
                </div>

                {/* Score */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', color: u.isMe ? '#ffd700' : 'var(--text-primary)' }}>
                    {tab === 'xp'     ? `${score} XP`   :
                     tab === 'streak' ? `${score} 🔥`   :
                     `${score} 🏅`}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {tab === 'xp' ? 'experience' : tab === 'streak' ? 'days' : 'badges'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Footer note ───────────────────────────────────────────────── */}
      <div style={{
        marginTop: '2rem', padding: '1.25rem',
        borderRadius: '14px',
        background: 'rgba(255,183,197,0.06)',
        border: '1px dashed rgba(255,183,197,0.22)',
        textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.84rem',
      }}>
        {lastSync
          ? `🕒 Last synced: ${lastSync.toLocaleTimeString()} · `
          : ''}
        🌍 <strong>Live Global Sync:</strong> Anyone using Sobagu appears here. Complete lessons to climb to #1! 🌸
        {!online && (
          <div style={{ marginTop: '0.5rem', color: '#f87171', fontSize: '0.78rem' }}>
            ⚠️ Cloud unavailable — showing local scores. You'll sync automatically when back online.
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
};

export default Leaderboard;
