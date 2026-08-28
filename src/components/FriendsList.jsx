import React, { useState, useEffect, useCallback } from 'react';
import { Users, Phone, Video, MessageSquare, Swords, UserMinus, Shield, MoreVertical, UserX, Search, UserPlus } from 'lucide-react';
import { getFriendsWithProfiles, removeFriend, blockUser } from '../utils/friendsStorage.js';

const card = { background: 'var(--indigo-card)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '1.2rem' };
const GRAD_COLORS = [
  'linear-gradient(135deg,#ff6b35,#ffa366)',
  'linear-gradient(135deg,#4facfe,#00f2fe)',
  'linear-gradient(135deg,#43e97b,#38f9d7)',
  'linear-gradient(135deg,#f093fb,#f5576c)',
  'linear-gradient(135deg,#a18cd1,#fbc2eb)',
];

function Avatar({ name, size = 48, online }) {
  const idx = ((name || '?').charCodeAt(0)) % GRAD_COLORS.length;
  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: GRAD_COLORS[idx],
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 900, color: '#fff', fontSize: size * 0.38,
        boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
      }}>
        {(name || '?')[0].toUpperCase()}
      </div>
      <div style={{
        position: 'absolute', bottom: 2, right: 2,
        width: 12, height: 12, borderRadius: '50%',
        background: online ? '#43e97b' : 'rgba(255,255,255,0.2)',
        border: '2px solid var(--indigo-deep)',
      }} />
    </div>
  );
}

export default function FriendsList({ user, onToast, onNavigate, onStartCall }) {
  const [friends, setFriends]     = useState([]);
  const [query, setQuery]         = useState('');
  const [openMenu, setOpenMenu]   = useState(null);

  const load = useCallback(() => {
    if (!user?.code) return;
    setFriends(getFriendsWithProfiles(user.code));
  }, [user?.code]);

  useEffect(() => { load(); }, [load]);

  const filtered = friends.filter(f =>
    f.name.toLowerCase().includes(query.toLowerCase()) || f.code.includes(query)
  );

  const handleRemove = (friendCode) => {
    removeFriend(user.code, friendCode);
    onToast('Friend removed', 'info');
    load();
    setOpenMenu(null);
  };

  const handleBlock = (friendCode) => {
    blockUser(user.code, friendCode);
    onToast('User blocked', 'info');
    load();
    setOpenMenu(null);
  };

  const handleCall = (type, friend) => {
    if (onStartCall) onStartCall(type, friend.code, friend.name);
  };

  return (
    <div className="learning-screen" style={{ maxWidth: 650, margin: '0 auto', padding: '1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'linear-gradient(135deg,#4facfe,#00f2fe)', borderRadius: '14px', padding: '0.7rem', display: 'flex' }}>
          <Users size={26} color="#fff" />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>Friends List</h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'Noto Sans Kannada,sans-serif' }}>ಸ್ನೇಹಿತರ ಪಟ್ಟಿ · {friends.length} friends</p>
        </div>
        <button onClick={() => onNavigate('addfriend')} style={{ marginLeft: 'auto', background: 'linear-gradient(135deg,#ff6b35,#ffa366)', border: 'none', borderRadius: '12px', padding: '0.55rem 1rem', color: '#fff', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <UserPlus size={16} /> Add
        </button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '1rem' }}>
        <Search size={16} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
        <input
          value={query} onChange={e => setQuery(e.target.value)}
          placeholder="Search friends…"
          style={{ width: '100%', boxSizing: 'border-box', background: 'var(--indigo-card)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '0.65rem 0.9rem 0.65rem 2.5rem', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
        />
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div style={{ ...card, textAlign: 'center', padding: '3rem 1rem' }}>
          <UserX size={48} color="rgba(255,255,255,0.2)" style={{ marginBottom: '1rem' }} />
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '1rem' }}>
            {friends.length === 0 ? 'No friends yet. Start adding!' : 'No friends match your search.'}
          </p>
          {friends.length === 0 && (
            <button onClick={() => onNavigate('addfriend')} style={{ background: 'linear-gradient(135deg,#ff6b35,#ffa366)', border: 'none', borderRadius: '12px', padding: '0.6rem 1.4rem', color: '#fff', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserPlus size={16} /> Add Friends
            </button>
          )}
        </div>
      )}

      {/* Friends */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
        {filtered.map(friend => (
          <div key={friend.code} style={{ ...card, display: 'flex', alignItems: 'center', gap: '0.9rem', padding: '0.9rem 1rem', position: 'relative' }}
            onClick={() => openMenu === friend.code && setOpenMenu(null)}>
            <Avatar name={friend.name} size={50} online={friend.online} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>{friend.name}</div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.75rem', marginTop: '0.1rem' }}>
                Level {friend.level} · {friend.xp.toLocaleString()} XP
                {friend.streak > 0 && <span style={{ color: '#ffa366', marginLeft: '0.5rem' }}>· {friend.streak}d streak</span>}
              </div>
              <div style={{ marginTop: '0.1rem', fontSize: '0.72rem', color: friend.online ? '#43e97b' : 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: friend.online ? '#43e97b' : 'rgba(255,255,255,0.2)' }} />
                {friend.online ? 'Online' : 'Offline'}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
              <button title="Voice Call" onClick={() => handleCall('voice', friend)} style={{ background: 'rgba(67,233,123,0.18)', border: '1px solid rgba(67,233,123,0.3)', borderRadius: '10px', padding: '0.5rem', cursor: 'pointer', display: 'flex', color: '#43e97b' }}>
                <Phone size={17} />
              </button>
              <button title="Video Call" onClick={() => handleCall('video', friend)} style={{ background: 'rgba(79,172,254,0.18)', border: '1px solid rgba(79,172,254,0.3)', borderRadius: '10px', padding: '0.5rem', cursor: 'pointer', display: 'flex', color: '#4facfe' }}>
                <Video size={17} />
              </button>
              <button title="Chat" onClick={() => onNavigate('friendchat')} style={{ background: 'rgba(240,147,251,0.18)', border: '1px solid rgba(240,147,251,0.3)', borderRadius: '10px', padding: '0.5rem', cursor: 'pointer', display: 'flex', color: '#f093fb' }}>
                <MessageSquare size={17} />
              </button>
              <button title="Challenge" onClick={() => onNavigate('liveduel')} style={{ background: 'rgba(255,107,53,0.18)', border: '1px solid rgba(255,107,53,0.3)', borderRadius: '10px', padding: '0.5rem', cursor: 'pointer', display: 'flex', color: '#ffa366' }}>
                <Swords size={17} />
              </button>
              {/* More Menu */}
              <div style={{ position: 'relative' }}>
                <button onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === friend.code ? null : friend.code); }}
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid var(--glass-border)', borderRadius: '10px', padding: '0.5rem', cursor: 'pointer', display: 'flex', color: 'rgba(255,255,255,0.5)' }}>
                  <MoreVertical size={17} />
                </button>
                {openMenu === friend.code && (
                  <div style={{ position: 'absolute', right: 0, top: '110%', background: 'var(--indigo-mid)', border: '1px solid var(--glass-border)', borderRadius: '12px', zIndex: 100, minWidth: 150, boxShadow: '0 8px 32px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
                    <button onClick={() => handleRemove(friend.code)} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.7rem 1rem', background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', width: '100%', fontSize: '0.85rem', fontWeight: 600 }}>
                      <UserMinus size={15} /> Remove Friend
                    </button>
                    <button onClick={() => handleBlock(friend.code)} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.7rem 1rem', background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', width: '100%', fontSize: '0.85rem', fontWeight: 600 }}>
                      <Shield size={15} /> Block User
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
