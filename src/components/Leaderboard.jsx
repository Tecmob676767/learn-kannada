import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getAllUsers, getCurrentUserCode, getLevelTitle, getCurrentUser } from '../utils/storage.js';
import { fetchGlobalUsers, syncUserToCloud } from '../utils/onlineLeaderboard.js';

const MEDALS  = ['🥇', '🥈', '🥉'];
const COLORS  = [
  'linear-gradient(135deg,#ff9a9e,#fecfef)',
  'linear-gradient(135deg,#a18cd1,#fbc2eb)',
  'linear-gradient(135deg,#fccb90,#d57eeb)',
  'linear-gradient(135deg,#43e97b,#38f9d7)',
  'linear-gradient(135deg,#4facfe,#00f2fe)',
  'linear-gradient(135deg,#f093fb,#f5576c)',
  'linear-gradient(135deg,#ffcf71,#ff923b)',
  'linear-gradient(135deg,#30cfd0,#330867)',
];

const safeHash = (str) => {
  try {
    let h = 0;
    const s = String(str || 'x');
    for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
    return Math.abs(h);
  } catch { return 0; }
};

const UserAvatar = ({ user = {}, size = 44 }) => {
  const h  = safeHash(user.code || user.name || 'x');
  const bg = user.isMe ? 'linear-gradient(135deg,#e8547a,#ff8c42)' : COLORS[h % COLORS.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.42, flexShrink: 0,
      boxShadow: user.isMe ? '0 0 16px rgba(232,84,122,0.55)' : '0 2px 8px rgba(0,0,0,0.25)',
      border: `2px solid ${user.isMe ? 'rgba(255,215,0,0.7)' : 'rgba(255,255,255,0.12)'}`,
      fontWeight: 900, color: '#fff',
    }}>
      {user.name ? user.name[0].toUpperCase() : '?'}
    </div>
  );
};

const PodiumCard = ({ user, rank, tab }) => {
  if (!user) return null;
  const heights  = [140, 110, 90];
  const grads    = [
    'linear-gradient(180deg,#ffd700,#ff8c00)',
    'linear-gradient(180deg,#c0c0c0,#888)',
    'linear-gradient(180deg,#cd7f32,#8b4513)',
  ];
  const score = tab === 'xp' ? `${user.xp ?? 0} XP`
              : tab === 'streak' ? `${user.streak ?? 0}🔥`
              : `${user.badges ?? 0}🏅`;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
      <div style={{ fontSize: '1.8rem' }}>{MEDALS[rank - 1]}</div>
      <UserAvatar user={user} size={52} />
      <div style={{ fontWeight: 800, fontSize: '0.88rem', textAlign: 'center', maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {user.name || 'Learner'}
        {user.isMe && <span style={{ display: 'block', fontSize: '0.62rem', color: '#ffd700', fontWeight: 900 }}>YOU</span>}
      </div>
      <div style={{ fontWeight: 900, fontSize: '1rem', color: '#ffd700' }}>{score}</div>
      <div style={{
        width: 85, height: heights[rank - 1], background: grads[rank - 1],
        borderRadius: '10px 10px 0 0',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        paddingTop: '0.6rem', fontSize: '1.2rem', fontWeight: 900,
        color: 'rgba(0,0,0,0.5)',
        boxShadow: `0 -4px 20px ${rank === 1 ? 'rgba(255,215,0,0.4)' : 'rgba(0,0,0,0.2)'}`,
      }}>
        #{rank}
      </div>
    </div>
  );
};

const MiniBar = ({ pct = 0, color = '#ffd700' }) => (
  <div style={{ width: 80, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
    <div style={{ width: `${Math.min(100, Math.max(0, pct))}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.6s ease' }} />
  </div>
);

// ── Helper: is this an admin or founder hidden account? ──────────────────────
const isAdminOrFounderUser = (u, code) => {
  try {
    if (!u || typeof u !== 'object') return false;
    // Exclude admins and founders from showing on the public leaderboard
    if (u.role === 'admin' || u.role === 'founder') return true;
    const c = String(code || '');
    if (c === '901213271080' || c === '000001') return true;
    const n = (u.name || '').toLowerCase();
    if (n.includes('founder') || n === 'sujay' || n.includes('admin')) return true;
    return false;
  } catch { return false; }
};

// ── Main Component ─────────────────────────────────────────────────────────
const Leaderboard = () => {
  const [tab, setTab]           = useState('xp');
  const [loading, setLoading]   = useState(true);
  const [online, setOnline]     = useState(true);
  const [cloudUsers, setCloudUsers] = useState({});
  const [lastSync, setLastSync] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Safe reads — never crash if storage is corrupt
  const currentCode = useMemo(() => { try { return getCurrentUserCode(); } catch { return null; } }, []);
  const currentUser = useMemo(() => { try { return getCurrentUser(); } catch { return null; } }, []);

  const loadLeaderboard = useCallback(async (bypassCache = true) => {
    setLoading(true);
    try {
      if (currentUser) {
        await syncUserToCloud(currentUser).catch(() => {});
      }
      const global = await fetchGlobalUsers(bypassCache);
      setCloudUsers(global && typeof global === 'object' ? global : {});
      setOnline(true);
    } catch (err) {
      console.warn('[Leaderboard] load failed:', err);
      setCloudUsers({});
      setOnline(false);
    } finally {
      setLastSync(new Date());
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadLeaderboard(true);

    // Cleanup old bot keys from localStorage
    try {
      const raw = JSON.parse(localStorage.getItem('sobagu_users') || '{}');
      let changed = false;
      Object.keys(raw).forEach(code => {
        if (code.startsWith('bot_') || raw[code]?.isBot) { delete raw[code]; changed = true; }
      });
      if (changed) localStorage.setItem('sobagu_users', JSON.stringify(raw));
    } catch {}

    const interval = setInterval(() => {
      fetchGlobalUsers(true)
        .then(g => { if (g && typeof g === 'object') { setCloudUsers(g); setOnline(true); setLastSync(new Date()); } })
        .catch(() => setOnline(false));
    }, 10000);
    return () => clearInterval(interval);
  }, [loadLeaderboard]);

  // ── Merge local + cloud safely ────────────────────────────────────────────
  const merged = useMemo(() => {
    const out = {};
    try {
      const local = getAllUsers();
      if (local && typeof local === 'object') {
        Object.entries(local).forEach(([code, u]) => {
          try {
            if (!u || u.isBot || String(code).startsWith('bot_') || isAdminOrFounderUser(u, code)) return;
            const cleanCode = String(code).replace(/\D/g, '');
            if (!cleanCode) return;
            out[cleanCode] = {
              code: cleanCode,
              name:       u.name || 'Learner',
              xp:         Number(u.xp) || 0,
              level:      Number(u.level) || 1,
              streak:     Number(u.streak) || 0,
              badges:     Array.isArray(u.badges) ? u.badges.length : 0,
              levelTitle: getLevelTitle(u.level || 1),
              isMe:       cleanCode === currentCode,
              isBot:      false,
            };
          } catch {}
        });
      }
    } catch {}

    try {
      if (cloudUsers && typeof cloudUsers === 'object') {
        Object.entries(cloudUsers).forEach(([code, u]) => {
          try {
            if (!u || u.isBot || String(code).startsWith('bot_') || isAdminOrFounderUser(u, code)) return;
            // Skip banned users from showing on cloud leaderboard
            if (u.banned) return;
            const cleanCode = String(code).replace(/\D/g, '');
            if (!cleanCode) return;
            out[cleanCode] = {
              ...(out[cleanCode] || {}),
              code: cleanCode,
              name:       u.name || out[cleanCode]?.name || 'Learner',
              xp:         Number(u.xp ?? out[cleanCode]?.xp ?? 0),
              level:      Number(u.level ?? out[cleanCode]?.level ?? 1),
              streak:     Number(u.streak ?? out[cleanCode]?.streak ?? 0),
              badges:     Number(u.badgesCount ?? out[cleanCode]?.badges ?? 0),
              levelTitle: getLevelTitle(u.level ?? out[cleanCode]?.level ?? 1),
              isMe:       cleanCode === currentCode,
              isBot:      false,
            };
          } catch {}
        });
      }
    } catch {}

    return out;
  }, [cloudUsers, currentCode]);

  const sorted = useMemo(() => {
    try {
      return Object.values(merged).sort((a, b) => {
        if (tab === 'xp')     return (b.xp     || 0) - (a.xp     || 0);
        if (tab === 'streak') return (b.streak  || 0) - (a.streak  || 0);
        return (b.badges || 0) - (a.badges || 0);
      });
    } catch { return []; }
  }, [merged, tab]);

  const top3   = sorted.slice(0, 3);
  const rest   = sorted.slice(3);
  const me     = sorted.find(u => u.isMe) || null;
  const myRank = me ? sorted.findIndex(u => u.isMe) + 1 : 0;

  const maxScore = (() => {
    try {
      if (tab === 'xp')     return sorted[0]?.xp     || 1;
      if (tab === 'streak') return sorted[0]?.streak  || 1;
      return sorted[0]?.badges || 1;
    } catch { return 1; }
  })();

  const getScore = (u) => {
    try {
      if (tab === 'xp')     return u.xp     || 0;
      if (tab === 'streak') return u.streak  || 0;
      return u.badges || 0;
    } catch { return 0; }
  };

  const handleCopyCode = () => {
    if (!currentCode) return;
    navigator.clipboard?.writeText(currentCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="learning-screen">
      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>🏆 Live Global Leaderboard</h2>
          <p>Real-time rankings across all Kannada learners worldwide ({sorted.length} Active {sorted.length === 1 ? 'Learner' : 'Learners'})</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {currentCode && (
            <button 
              onClick={handleCopyCode} 
              style={{
                background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)',
                padding: '0.4rem 0.85rem', borderRadius: '100px',
                fontSize: '0.78rem', color: '#ffd700', cursor: 'pointer',
                fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem'
              }}
            >
              📋 {copiedCode ? 'Copied!' : `My ID: ${currentCode}`}
            </button>
          )}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: online ? 'rgba(34,197,94,0.1)' : 'rgba(255,100,100,0.1)',
            border: `1px solid ${online ? 'rgba(34,197,94,0.35)' : 'rgba(255,100,100,0.35)'}`,
            padding: '0.4rem 0.9rem', borderRadius: '100px',
            fontSize: '0.78rem', color: online ? '#4ade80' : '#f87171',
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: online ? '#4ade80' : '#f87171', boxShadow: online ? '0 0 8px #4ade80' : 'none' }} />
            {loading ? 'Syncing…' : online ? 'Live Connected' : 'Offline Mode'}
          </div>
          <button onClick={() => loadLeaderboard(true)} disabled={loading} style={{
            background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '50%', width: 36, height: 36,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: loading ? 'default' : 'pointer', fontSize: '1rem', color: '#fff',
            animation: loading ? 'spin 1s linear infinite' : 'none',
          }} title="Refresh Live Data">🔄</button>
        </div>
      </div>

      {/* ── My Rank Banner ──────────────────────────────────────── */}
      {me && (
        <div className="glass-card" style={{
          padding: '1.25rem 1.5rem', marginBottom: '1.75rem',
          background: 'linear-gradient(135deg,rgba(255,215,0,0.12),rgba(232,84,122,0.08))',
          border: '1px solid rgba(255,215,0,0.4)',
          display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap',
          borderRadius: 16,
        }}>
          <div style={{ fontSize: '2.8rem', lineHeight: 1 }}>
            {myRank <= 3 && myRank > 0 ? MEDALS[myRank - 1] : myRank > 0 ? `#${myRank}` : '—'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>Your Global Rank</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', marginTop: '0.15rem' }}>
              {myRank === 1 ? '🎉 You\'re #1! Crushing it!' :
               myRank <= 3 ? '🔥 Top 3! Keep pushing!' :
               myRank > 3  ? `${myRank - 1} learner${myRank - 1 !== 1 ? 's' : ''} ahead — keep studying!` :
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

      {/* ── Tabs ────────────────────────────────────────────────── */}
      <div className="section-tabs" style={{ marginBottom: '2rem' }}>
        <button className={`section-tab${tab === 'xp'     ? ' active' : ''}`} onClick={() => setTab('xp')}>⭐ Global XP</button>
        <button className={`section-tab${tab === 'streak' ? ' active' : ''}`} onClick={() => setTab('streak')}>🔥 Streak</button>
        <button className={`section-tab${tab === 'badges' ? ' active' : ''}`} onClick={() => setTab('badges')}>🏅 Badges</button>
      </div>

      {/* ── Podium Cards (Renders for 1, 2, or 3+ learners) ─────── */}
      {!loading && sorted.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          gap: '0.75rem', marginBottom: '2.5rem', padding: '1.5rem 1rem 0',
        }}>
          {top3[1] && <PodiumCard user={top3[1]} rank={2} tab={tab} />}
          {top3[0] && <PodiumCard user={top3[0]} rank={1} tab={tab} />}
          {top3[2] && <PodiumCard user={top3[2]} rank={3} tab={tab} />}
        </div>
      )}

      {/* ── List / Loading / Empty ───────────────────────────────── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem', animation: 'spin 1.5s linear infinite' }}>⏳</div>
          <div>Syncing live global rankings…</div>
        </div>
      ) : sorted.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌸</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>No learners yet!</div>
          <div style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Be the first to earn XP and appear here.</div>
        </div>
      ) : rest.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
          {rest.map((u, i) => {
            const rank = i + 4;
            const score = getScore(u);
            const barPct = maxScore > 0 ? (score / maxScore) * 100 : 0;
            return (
              <div key={u.code || i} className="glass-card" style={{
                padding: '0.85rem 1.25rem',
                display: 'flex', alignItems: 'center', gap: '1rem',
                border: u.isMe ? '1px solid rgba(255,215,0,0.55)' : '1px solid rgba(255,255,255,0.05)',
                background: u.isMe
                  ? 'linear-gradient(135deg,rgba(255,215,0,0.1),rgba(232,84,122,0.06))'
                  : 'rgba(255,255,255,0.03)',
                transform: u.isMe ? 'scale(1.01)' : 'none',
                transition: 'transform 0.2s, background 0.2s',
                borderRadius: 14,
              }}>
                <div style={{ width: 36, textAlign: 'center', fontWeight: 800, flexShrink: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  #{rank}
                </div>
                <UserAvatar user={u} size={40} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                    {u.name}
                    {u.isMe && (
                      <span style={{ background: 'linear-gradient(135deg,#ffd700,#ff8c42)', color: '#000', fontSize: '0.6rem', fontWeight: 900, padding: '0.1rem 0.45rem', borderRadius: 20 }}>YOU</span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    Lv.{u.level} · {u.levelTitle}
                  </div>
                  <div style={{ marginTop: '0.4rem' }}>
                    <MiniBar pct={barPct} color={u.isMe ? '#ffd700' : '#a78bfa'} />
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', color: u.isMe ? '#ffd700' : 'var(--text-primary)' }}>
                    {tab === 'xp' ? `${score} XP` : tab === 'streak' ? `${score} 🔥` : `${score} 🏅`}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {tab === 'xp' ? 'experience' : tab === 'streak' ? 'days' : 'badges'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {/* ── Footer ──────────────────────────────────────────────── */}
      <div style={{
        marginTop: '2rem', padding: '1.25rem', borderRadius: 14,
        background: 'rgba(255,183,197,0.06)', border: '1px dashed rgba(255,183,197,0.22)',
        textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.84rem',
      }}>
        {lastSync ? `🕒 Last synced: ${lastSync.toLocaleTimeString()} · ` : ''}
        🌍 <strong>Live Global Sync:</strong> Complete lessons to climb to #1! 🌸
        {!online && (
          <div style={{ marginTop: '0.5rem', color: '#f87171', fontSize: '0.78rem' }}>
            ⚠️ Cloud unavailable — showing local scores. Auto-syncs when back online.
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
      `}</style>
    </div>
  );
};

export default Leaderboard;
