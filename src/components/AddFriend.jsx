import React, { useState, useEffect, useCallback } from 'react';
import { UserPlus, Search, Copy, Check, X, Users, Clock, Share2, XCircle, HeartHandshake } from 'lucide-react';
import {
  searchUserByCode, sendFriendRequest, acceptFriendRequest,
  rejectFriendRequest, cancelSentRequest, getSentRequests,
  getReceivedRequests, subscribeSocialEvents, getFriends
} from '../utils/friendsStorage.js';

const card = { background: 'var(--indigo-card)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '1.2rem', marginBottom: '1rem' };
const btn = (grad, disabled) => ({
  background: disabled ? 'rgba(255,255,255,0.1)' : grad,
  border: 'none', borderRadius: '10px', padding: '0.5rem 1rem',
  cursor: disabled ? 'not-allowed' : 'pointer', color: '#fff',
  fontWeight: 700, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem',
  opacity: disabled ? 0.5 : 1, transition: 'opacity 0.2s',
});

function Avatar({ name, size = 40, online }) {
  const colors = ['linear-gradient(135deg,#ff6b35,#ffa366)','linear-gradient(135deg,#4facfe,#00f2fe)','linear-gradient(135deg,#43e97b,#38f9d7)','linear-gradient(135deg,#f093fb,#f5576c)'];
  const idx = (name || '?').charCodeAt(0) % colors.length;
  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <div style={{ width: size, height: size, borderRadius: '50%', background: colors[idx], display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#fff', fontSize: size * 0.4 }}>
        {(name || '?')[0].toUpperCase()}
      </div>
      {online !== undefined && (
        <div style={{ position: 'absolute', bottom: 1, right: 1, width: 10, height: 10, borderRadius: '50%', background: online ? '#43e97b' : '#666', border: '2px solid var(--indigo-deep)' }} />
      )}
    </div>
  );
}

export default function AddFriend({ user, onToast }) {
  const [query, setQuery]         = useState('');
  const [found, setFound]         = useState(null);
  const [searching, setSearching] = useState(false);
  const [copied, setCopied]       = useState(false);
  const [received, setReceived]   = useState([]);
  const [sent, setSent]           = useState([]);
  const [myFriends, setMyFriends] = useState([]);

  const refresh = useCallback(() => {
    if (!user?.code) return;
    setReceived(getReceivedRequests(user.code));
    setSent(getSentRequests(user.code));
    setMyFriends(getFriends(user.code));
  }, [user?.code]);

  useEffect(() => {
    refresh();
    const unsub = subscribeSocialEvents(refresh);
    return unsub;
  }, [refresh]);

  const handleSearch = async () => {
    const clean = query.replace(/\D/g, '').slice(0, 6);
    if (clean.length !== 6) {
      onToast?.('Please enter a valid 6-digit code', 'error');
      return;
    }
    if (clean === user?.code) {
      onToast?.('That is your own friend code!', 'info');
      return;
    }
    setSearching(true);
    try {
      const profile = await searchUserByCode(clean);
      setFound(profile || { notFound: true, code: clean });
    } catch {
      setFound({ notFound: true, code: clean });
    }
    setSearching(false);
  };

  const handleSend = (toCode) => {
    if (!user?.code) {
      onToast?.('Please login to add friends', 'error');
      return;
    }
    const res = sendFriendRequest(user.code, toCode);
    if (res.success) {
      onToast?.('Friend request sent!', 'success');
      refresh();
    } else if (res.reason === 'already_friends') {
      onToast?.('Already in your friends list!', 'info');
    } else if (res.reason === 'already_sent') {
      onToast?.('Request already sent', 'info');
    } else if (res.reason === 'blocked') {
      onToast?.('Cannot send request to this user', 'error');
    } else {
      onToast?.('Could not send request', 'error');
    }
  };

  const handleAccept = (fromCode) => {
    acceptFriendRequest(user.code, fromCode);
    onToast?.('Friend added successfully!', 'success');
    refresh();
  };

  const handleReject = (fromCode) => {
    rejectFriendRequest(user.code, fromCode);
    onToast?.('Request declined', 'info');
    refresh();
  };

  const handleCancel = (toCode) => {
    cancelSentRequest(user.code, toCode);
    onToast?.('Request cancelled', 'info');
    refresh();
  };

  const copyCode = () => {
    const codeToCopy = user?.code || '';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(codeToCopy).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        onToast?.('Friend code copied to clipboard!', 'success');
      }).catch(() => {
        onToast?.(`Your code is: ${codeToCopy}`, 'info');
      });
    } else {
      onToast?.(`Your code is: ${codeToCopy}`, 'info');
    }
  };

  const handleShareInvite = () => {
    const codeToCopy = user?.code || '';
    const shareText = `🌸 Learn Kannada with me on Sobagu! Add me using my Friend Code: *${codeToCopy}* at https://sobagukannadaedu.vercel.app`;
    if (navigator.share) {
      navigator.share({
        title: 'Learn Kannada on Sobagu',
        text: shareText,
        url: 'https://sobagukannadaedu.vercel.app',
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(shareText);
      onToast?.('Invite message copied to clipboard!', 'success');
    }
  };

  const users_db = (() => { try { return JSON.parse(localStorage.getItem('sobagu_users') || '{}'); } catch { return {}; } })();
  const getName = (code) => users_db[code]?.name || `#${code}`;

  return (
    <div className="learning-screen" style={{ maxWidth: 650, margin: '0 auto', padding: '1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'linear-gradient(135deg,#ff6b35,#ffa366)', borderRadius: '14px', padding: '0.7rem', display: 'flex' }}>
          <UserPlus size={26} color="#fff" />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>Add Friend</h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'Noto Sans Kannada,sans-serif' }}>
            ಸ್ನೇಹಿತರನ್ನು ಸೇರಿಸಿ · Connect with real learners across the world
          </p>
        </div>
      </div>

      {/* My Code */}
      <div style={card}>
        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Users size={14} /> Your Unique Friend Code
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--sakura-pink)', letterSpacing: '0.35rem', flex: 1, minWidth: '160px' }}>
            {user?.code || '------'}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={copyCode} style={btn('linear-gradient(135deg,#4facfe,#00f2fe)', false)}>
              {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Copied!' : 'Copy Code'}
            </button>
            <button onClick={handleShareInvite} style={btn('linear-gradient(135deg,#43e97b,#38f9d7)', false)}>
              <Share2 size={16} /> Share Invite
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div style={card}>
        <div style={{ color: '#fff', fontWeight: 700, marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Search size={16} color="var(--sakura-pink)" /> Find a Friend by 6-Digit Code
        </div>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            maxLength={6}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Enter friend's 6-digit code..."
            style={{
              flex: 1, background: 'rgba(255,255,255,0.08)',
              border: '1px solid var(--glass-border)', borderRadius: '10px',
              padding: '0.7rem 1rem', color: '#fff', fontSize: '1rem', outline: 'none',
            }}
          />
          <button onClick={handleSearch} disabled={searching} style={btn('linear-gradient(135deg,#ff6b35,#ffa366)', searching)}>
            <Search size={16} /> {searching ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Search Result */}
        {found && (
          <div style={{ marginTop: '1rem', padding: '0.9rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            {found.notFound ? (
              <div style={{ color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <XCircle size={18} color="#ff5858" /> No registered user found with code #{found.code}
              </div>
            ) : (
              <>
                <Avatar name={found.name} size={46} online={found.online} />
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#fff', fontWeight: 700 }}>{found.name}</div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem' }}>
                    Level {found.level} · {found.xp} XP · #{found.code}
                  </div>
                </div>
                {myFriends.includes(found.code) ? (
                  <span style={{ color: '#43e97b', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Check size={15} /> Friends
                  </span>
                ) : sent.includes(found.code) ? (
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem' }}>Request sent</span>
                ) : (
                  <button onClick={() => handleSend(found.code)} style={btn('linear-gradient(135deg,#ff6b35,#ffa366)', false)}>
                    <UserPlus size={15} /> Add Friend
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Received Requests */}
      {received.length > 0 && (
        <div style={card}>
          <div style={{ color: '#fff', fontWeight: 700, marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={16} color="#ffa366" /> Pending Friend Requests ({received.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
            {received.map(code => (
              <div key={code} style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', padding: '0.7rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                <Avatar name={getName(code)} size={42} />
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>{getName(code)}</div>
                  <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.75rem' }}>#{code}</div>
                </div>
                <button onClick={() => handleAccept(code)} style={{ ...btn('linear-gradient(135deg,#43e97b,#38f9d7)', false), padding: '0.45rem 0.8rem' }}>
                  <Check size={15} /> Accept
                </button>
                <button onClick={() => handleReject(code)} style={{ ...btn('linear-gradient(135deg,#ff5858,#ff3333)', false), padding: '0.45rem 0.8rem' }}>
                  <X size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sent Requests */}
      {sent.length > 0 && (
        <div style={card}>
          <div style={{ color: '#fff', fontWeight: 700, marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={16} color="rgba(255,255,255,0.5)" /> Sent Requests
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
            {sent.map(code => (
              <div key={code} style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', padding: '0.7rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                <Avatar name={getName(code)} size={42} />
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>{getName(code)}</div>
                  <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.75rem' }}>#{code} · Pending</div>
                </div>
                <button onClick={() => handleCancel(code)} style={{ ...btn('rgba(255,255,255,0.12)', false), padding: '0.45rem 0.8rem' }}>
                  <X size={15} /> Cancel
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Connection Guide Banner */}
      <div style={{
        ...card,
        background: 'linear-gradient(135deg, rgba(255,107,53,0.1), rgba(79,172,254,0.1))',
        border: '1px solid rgba(255,255,255,0.15)',
        display: 'flex', alignItems: 'center', gap: '1rem',
      }}>
        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.7rem', borderRadius: '12px', display: 'flex' }}>
          <HeartHandshake size={28} color="var(--sakura-pink)" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.92rem' }}>How to connect with friends:</div>
          <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.8rem', marginTop: '0.2rem', lineHeight: 1.4 }}>
            Share your 6-digit code with classmates and friends. Once both of you connect, you can make private video & voice calls and challenge each other in live games!
          </div>
        </div>
      </div>
    </div>
  );
}
