import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Crown, TrendingUp, UserX, Users } from 'lucide-react';
import { getFriendsWithProfiles } from '../utils/friendsStorage.js';

const MEDAL_COLORS = ['#ffd700', '#c0c0c0', '#cd7f32'];
const GRAD_COLORS  = [
  'linear-gradient(135deg,#ff6b35,#ffa366)',
  'linear-gradient(135deg,#4facfe,#00f2fe)',
  'linear-gradient(135deg,#43e97b,#38f9d7)',
  'linear-gradient(135deg,#f093fb,#f5576c)',
];

const card = { background: 'var(--indigo-card)', border: '1px solid var(--glass-border)', borderRadius: '18px', padding: '1.2rem' };

function Avatar({ name, size = 44 }) {
  const idx = ((name || '?').charCodeAt(0)) % GRAD_COLORS.length;
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: GRAD_COLORS[idx], display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#fff', fontSize: size * 0.38, flexShrink: 0 }}>
      {(name || '?')[0].toUpperCase()}
    </div>
  );
}

export default function FriendLeaderboard({ user, onNavigate }) {
  const [friends, setFriends] = useState([]);
  const [tab, setTab]         = useState('xp');

  useEffect(() => {
    if (!user?.code) return;
    const f = getFriendsWithProfiles(user.code);
    const me = { code: user.code, name: user.name || 'You', xp: user.xp || 0, level: user.level || 1, streak: user.streak || 0, online: true, avatar: (user.name || 'Y')[0].toUpperCase(), isMe: true };
    setFriends([me, ...f]);
  }, [user?.code]);

  const sorted = [...friends].sort((a, b) => {
    if (tab === 'xp')     return b.xp - a.xp;
    if (tab === 'streak') return b.streak - a.streak;
    return b.level - a.level;
  });

  const top3  = sorted.slice(0, 3);
  const rest  = sorted.slice(3);
  const myRank = sorted.findIndex(f => f.isMe) + 1;
  const maxXp  = sorted[0]?.xp || 1;

  return (
    <div className="learning-screen" style={{ maxWidth: 640, margin: '0 auto', padding: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'linear-gradient(135deg,#ffd700,#ff923b)', borderRadius: '14px', padding: '0.7rem', display: 'flex' }}>
          <Trophy size={26} color="#fff" />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>Friends Leaderboard</h1>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'Noto Sans Kannada,sans-serif' }}>ಸ್ನೇಹಿತರ ಶ್ರೇಣಿ</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.2rem' }}>
        {[['xp','XP Score'],['streak','Streak'],['level','Level']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{ flex: 1, background: tab === key ? 'linear-gradient(135deg,#ffd700,#ff923b)' : 'rgba(255,255,255,0.07)', border: 'none', borderRadius: '10px', padding: '0.55rem', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.82rem' }}>
            {label}
          </button>
        ))}
      </div>

      {friends.length <= 1 && (
        <div style={{ ...card, textAlign: 'center', padding: '3rem 1rem' }}>
          <UserX size={48} color="rgba(255,255,255,0.2)" style={{ marginBottom: '1rem' }} />
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '1rem' }}>Add friends to compare scores!</p>
          <button onClick={() => onNavigate('addfriend')} style={{ background: 'linear-gradient(135deg,#ff6b35,#ffa366)', border: 'none', borderRadius: '12px', padding: '0.6rem 1.4rem', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Add Friends</button>
        </div>
      )}

      {/* Podium */}
      {top3.length >= 2 && (
        <div style={{ ...card, marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
            {[top3[1], top3[0], top3[2]].filter(Boolean).map((f, i) => {
              const rankIdx = f === top3[0] ? 0 : f === top3[1] ? 1 : 2;
              const heights = [130, 100, 80];
              return (
                <div key={f.code} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                  {rankIdx === 0 && <Crown size={22} color="#ffd700" />}
                  <Avatar name={f.name} size={rankIdx === 0 ? 54 : 44} />
                  <div style={{ background: rankIdx === 0 ? 'linear-gradient(180deg,#ffd700,#ff923b)' : rankIdx === 1 ? 'linear-gradient(180deg,#c0c0c0,#888)' : 'linear-gradient(180deg,#cd7f32,#8b4513)', borderRadius: '8px 8px 0 0', height: heights[rankIdx], width: 70, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: '0.5rem' }}>
                    <Medal size={18} color="#fff" />
                    <div style={{ color: '#fff', fontWeight: 900, fontSize: '1rem', marginTop: '0.3rem' }}>#{rankIdx + 1}</div>
                  </div>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.8rem', textAlign: 'center', maxWidth: 70, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.name.split(' ')[0]}</div>
                  <div style={{ color: 'var(--sakura-pink)', fontWeight: 700, fontSize: '0.78rem' }}>{tab === 'xp' ? `${f.xp}xp` : tab === 'streak' ? `${f.streak}d` : `Lv${f.level}`}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Rest of list */}
      {rest.length > 0 && (
        <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1rem' }}>
          {rest.map((f, i) => {
            const barWidth = tab === 'xp' ? (f.xp / maxXp) * 100 : tab === 'streak' ? Math.min(100, f.streak * 5) : Math.min(100, f.level * 10);
            return (
              <div key={f.code} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.55rem 0.7rem', background: f.isMe ? 'rgba(255,107,53,0.12)' : 'rgba(255,255,255,0.04)', borderRadius: '12px', border: f.isMe ? '1px solid rgba(255,107,53,0.3)' : '1px solid transparent' }}>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 700, width: 24, textAlign: 'center', fontSize: '0.85rem' }}>#{i + 4}</div>
                <Avatar name={f.name} size={36} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#fff', fontWeight: f.isMe ? 700 : 400, fontSize: '0.85rem' }}>{f.name}</div>
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, marginTop: '0.3rem' }}>
                    <div style={{ height: '100%', width: `${barWidth}%`, background: 'linear-gradient(90deg,var(--sakura-deep),var(--sakura-pink))', borderRadius: 2 }} />
                  </div>
                </div>
                <div style={{ color: 'var(--sakura-pink)', fontWeight: 700, fontSize: '0.82rem', flexShrink: 0 }}>
                  {tab === 'xp' ? `${f.xp.toLocaleString()} XP` : tab === 'streak' ? `${f.streak}d` : `Lv ${f.level}`}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {myRank > 0 && (
        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
          <TrendingUp size={14} /> You are ranked #{myRank} among your friends
        </div>
      )}
    </div>
  );
}
