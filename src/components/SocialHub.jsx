import React, { useState, useEffect, useCallback } from 'react';
import { Users, UserPlus, Wifi, Bell, Swords, Trophy, Clock, UserCheck, TrendingUp } from 'lucide-react';
import { getFriendsWithProfiles, getReceivedRequests } from '../utils/friendsStorage.js';

const card = {
  background: 'var(--indigo-card)',
  border: '1px solid var(--glass-border)',
  borderRadius: '16px',
  padding: '1.2rem',
};

export default function SocialHub({ user, onNavigate, onToast }) {
  const [friends, setFriends] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!user?.code) return;
    setFriends(getFriendsWithProfiles(user.code));
    setPendingCount(getReceivedRequests(user.code).length);
  }, [user?.code]);

  const onlineFriends = friends.filter(f => f.online);
  const totalFriends  = friends.length;

  const QUICK_ACTIONS = [
    { icon: UserPlus,  label: 'Add Friend',      sub: 'ಸ್ನೇಹಿತರನ್ನು ಸೇರಿಸಿ', page: 'addfriend',         grad: 'linear-gradient(135deg,#ff6b35,#ffa366)' },
    { icon: Users,     label: 'Friends List',     sub: 'ಸ್ನೇಹಿತರ ಪಟ್ಟಿ',      page: 'friendslist',        grad: 'linear-gradient(135deg,#4facfe,#00f2fe)' },
    { icon: Swords,    label: 'Play Together',    sub: 'ಜೊತೆ ಆಡಿ',            page: 'multiplayerarena',   grad: 'linear-gradient(135deg,#f093fb,#f5576c)' },
    { icon: Trophy,    label: 'Friends Board',    sub: 'ಶ್ರೇಣಿ ಪಟ್ಟಿ',         page: 'friendleaderboard',  grad: 'linear-gradient(135deg,#43e97b,#38f9d7)' },
  ];

  const ACTIVITY = [
    { icon: UserCheck, text: 'A friend accepted your friend request', time: '2m ago' },
    { icon: Trophy,    text: 'A friend beat your quiz score — rematch?', time: '15m ago' },
    { icon: TrendingUp,text: 'A friend earned 500 XP today', time: '1h ago' },
  ];

  return (
    <div className="learning-screen" style={{ maxWidth: 700, margin: '0 auto', padding: '1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'linear-gradient(135deg,#ff6b35,#ffa366)', borderRadius: '14px', padding: '0.7rem', display: 'flex' }}>
          <Users size={26} color="#fff" />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>Social Hub</h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'Noto Sans Kannada,sans-serif' }}>ಸ್ನೇಹಿತರ ಕೇಂದ್ರ</p>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.8rem', marginBottom: '1.5rem' }}>
        {[
          { icon: Users,     value: totalFriends,  label: 'Friends',  color: '#4facfe' },
          { icon: Wifi,      value: onlineFriends.length, label: 'Online', color: '#43e97b' },
          { icon: Bell,      value: pendingCount,  label: 'Requests', color: '#ffa366' },
        ].map(({ icon: Icon, value, label, color }) => (
          <div key={label} style={{ ...card, textAlign: 'center' }}>
            <Icon size={22} color={color} style={{ marginBottom: '0.4rem' }} />
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff' }}>{value}</div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ ...card, marginBottom: '1.5rem' }}>
        <h3 style={{ margin: '0 0 1rem', color: '#fff', fontSize: '1rem', fontWeight: 700 }}>Quick Actions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '0.8rem' }}>
          {QUICK_ACTIONS.map(({ icon: Icon, label, sub, page, grad }) => (
            <button key={page} onClick={() => onNavigate(page)} style={{
              background: grad, border: 'none', borderRadius: '14px',
              padding: '1rem', cursor: 'pointer', textAlign: 'left',
              display: 'flex', alignItems: 'center', gap: '0.8rem',
              transition: 'transform 0.18s, box-shadow 0.18s',
              boxShadow: '0 4px 18px rgba(0,0,0,0.3)',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}>
              <Icon size={22} color="#fff" />
              <div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>{label}</div>
                <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.72rem', fontFamily: 'Noto Sans Kannada,sans-serif' }}>{sub}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Online Friends */}
      {onlineFriends.length > 0 && (
        <div style={{ ...card, marginBottom: '1.5rem' }}>
          <h3 style={{ margin: '0 0 0.8rem', color: '#43e97b', fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Wifi size={16} /> Online Now
          </h3>
          <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
            {onlineFriends.slice(0, 5).map(f => (
              <div key={f.code} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: 'linear-gradient(135deg,#4facfe,#00f2fe)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 900, color: '#fff', fontSize: '1rem',
                  }}>{f.avatar}</div>
                  <div style={{ position: 'absolute', bottom: 1, right: 1, width: 10, height: 10, borderRadius: '50%', background: '#43e97b', border: '2px solid var(--indigo-deep)' }} />
                </div>
                <span style={{ color: '#fff', fontSize: '0.82rem', fontWeight: 600 }}>{f.name.split(' ')[0]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activity Feed */}
      <div style={{ ...card }}>
        <h3 style={{ margin: '0 0 0.8rem', color: '#fff', fontSize: '0.95rem', fontWeight: 700 }}>Recent Activity</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
          {ACTIVITY.map(({ icon: Icon, text, time }, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.7rem' }}>
              <div style={{ background: 'var(--glass-bg)', borderRadius: '10px', padding: '0.45rem', flexShrink: 0 }}>
                <Icon size={16} color="var(--sakura-pink)" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.83rem' }}>{text}</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
                  <Clock size={11} /> {time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
