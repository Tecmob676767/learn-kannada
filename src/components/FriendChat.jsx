import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MessageSquare, Send, Phone, Video, Trophy, ArrowLeft, Circle } from 'lucide-react';
import { getFriendsWithProfiles, isOnline } from '../utils/friendsStorage.js';

const QUICK_PHRASES = [
  { label: 'ನಮಸ್ಕಾರ', meaning: 'Hello' },
  { label: 'ಧನ್ಯವಾದ', meaning: 'Thanks' },
  { label: 'ಚೆನ್ನಾಗಿದ್ದೀರಾ?', meaning: 'How are you?' },
  { label: 'ಅದ್ಭುತ!', meaning: 'Amazing!' },
  { label: 'ಒಳ್ಳೆಯದು!', meaning: 'Good!' },
];

const CHAT_KEY = (a, b) => {
  const sorted = [a, b].sort();
  return `sobagu_chat_${sorted[0]}_${sorted[1]}`;
};

const loadMessages = (myCode, friendCode) => {
  try { return JSON.parse(localStorage.getItem(CHAT_KEY(myCode, friendCode)) || '[]'); }
  catch { return []; }
};

const saveMessages = (myCode, friendCode, msgs) => {
  localStorage.setItem(CHAT_KEY(myCode, friendCode), JSON.stringify(msgs.slice(-200)));
};

const GRAD_COLORS = [
  'linear-gradient(135deg,#ff6b35,#ffa366)',
  'linear-gradient(135deg,#4facfe,#00f2fe)',
  'linear-gradient(135deg,#43e97b,#38f9d7)',
  'linear-gradient(135deg,#f093fb,#f5576c)',
];

function Avatar({ name, size = 38, online }) {
  const idx = ((name || '?').charCodeAt(0)) % GRAD_COLORS.length;
  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <div style={{ width: size, height: size, borderRadius: '50%', background: GRAD_COLORS[idx], display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#fff', fontSize: size * 0.38 }}>
        {(name || '?')[0].toUpperCase()}
      </div>
      {online !== undefined && (
        <div style={{ position: 'absolute', bottom: 1, right: 1, width: 9, height: 9, borderRadius: '50%', background: online ? '#43e97b' : '#555', border: '2px solid var(--indigo-deep)' }} />
      )}
    </div>
  );
}

export default function FriendChat({ user, onToast, onNavigate, onStartCall }) {
  const [friends, setFriends]       = useState([]);
  const [active, setActive]         = useState(null); // friend object
  const [messages, setMessages]     = useState([]);
  const [input, setInput]           = useState('');
  const [isMobile, setIsMobile]     = useState(window.innerWidth < 640);
  const bottomRef                   = useRef(null);
  const channelRef                  = useRef(null);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  useEffect(() => {
    if (!user?.code) return;
    setFriends(getFriendsWithProfiles(user.code));
  }, [user?.code]);

  useEffect(() => {
    if (!active || !user?.code) return;
    setMessages(loadMessages(user.code, active.code));
    // BroadcastChannel for real-time sync
    try {
      channelRef.current?.close();
      channelRef.current = new BroadcastChannel('sobagu_chat');
      channelRef.current.onmessage = (e) => {
        if (e.data?.key === CHAT_KEY(user.code, active.code)) {
          setMessages(loadMessages(user.code, active.code));
        }
      };
    } catch { /* ignore */ }
    return () => { try { channelRef.current?.close(); } catch { /* ignore */ } };
  }, [active, user?.code]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMsg = useCallback((text) => {
    if (!text.trim() || !active) return;
    const msg = { id: Date.now(), from: user.code, text: text.trim(), ts: Date.now() };
    const updated = [...loadMessages(user.code, active.code), msg];
    saveMessages(user.code, active.code, updated);
    setMessages(updated);
    setInput('');
    try {
      const ch = new BroadcastChannel('sobagu_chat');
      ch.postMessage({ key: CHAT_KEY(user.code, active.code) });
      ch.close();
    } catch { /* ignore */ }
  }, [active, user?.code]);

  const shareScore = () => {
    const xp = user?.xp || 0;
    sendMsg(`🏆 I have ${xp.toLocaleString()} XP — can you beat me?`);
  };

  const fmtTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="learning-screen" style={{ maxWidth: 750, margin: '0 auto', padding: 0, height: '85vh', display: 'flex', overflow: 'hidden', borderRadius: '16px', background: 'var(--indigo-card)', border: '1px solid var(--glass-border)' }}>
      {/* Friends Sidebar */}
      {(!isMobile || !active) && (
        <div style={{ width: isMobile ? '100%' : 220, borderRight: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MessageSquare size={18} color="var(--sakura-pink)" />
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>Chats</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {friends.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'rgba(255,255,255,0.35)', fontSize: '0.83rem' }}>
                No friends yet.<br />
                <button onClick={() => onNavigate('addfriend')} style={{ marginTop: '0.8rem', background: 'var(--sakura-deep)', border: 'none', borderRadius: '8px', padding: '0.4rem 0.8rem', color: '#fff', cursor: 'pointer', fontSize: '0.8rem' }}>Add Friends</button>
              </div>
            )}
            {friends.map(f => {
              const msgs = loadMessages(user.code, f.code);
              const last = msgs[msgs.length - 1];
              return (
                <button key={f.code} onClick={() => setActive(f)} style={{
                  width: '100%', background: active?.code === f.code ? 'rgba(255,107,53,0.15)' : 'none',
                  border: 'none', borderLeft: active?.code === f.code ? '3px solid var(--sakura-pink)' : '3px solid transparent',
                  padding: '0.75rem 1rem', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.7rem',
                }}>
                  <Avatar name={f.name} size={38} online={f.online} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.name}</div>
                    {last && <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{last.from === user.code ? 'You: ' : ''}{last.text}</div>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Chat Window */}
      {(!isMobile || active) && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {active ? (
            <>
              {/* Chat Header */}
              <div style={{ padding: '0.8rem 1rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                {isMobile && (
                  <button onClick={() => setActive(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex', padding: '0.3rem' }}>
                    <ArrowLeft size={20} />
                  </button>
                )}
                <Avatar name={active.name} size={38} online={active.online} />
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>{active.name}</div>
                  <div style={{ color: active.online ? '#43e97b' : 'rgba(255,255,255,0.4)', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Circle size={7} fill={active.online ? '#43e97b' : 'rgba(255,255,255,0.3)'} strokeWidth={0} />
                    {active.online ? 'Online' : 'Offline'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    title="Voice Call"
                    onClick={() => {
                      if (onStartCall) onStartCall('voice', active.code, active.name);
                    }}
                    style={{ background: 'rgba(67,233,123,0.15)', border: '1px solid rgba(67,233,123,0.3)', borderRadius: '10px', padding: '0.45rem', cursor: 'pointer', color: '#43e97b', display: 'flex' }}
                  >
                    <Phone size={17} />
                  </button>
                  <button
                    title="Video Call"
                    onClick={() => {
                      if (onStartCall) onStartCall('video', active.code, active.name);
                    }}
                    style={{ background: 'rgba(79,172,254,0.15)', border: '1px solid rgba(79,172,254,0.3)', borderRadius: '10px', padding: '0.45rem', cursor: 'pointer', color: '#4facfe', display: 'flex' }}
                  >
                    <Video size={17} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {messages.length === 0 && (
                  <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', marginTop: '3rem' }}>
                    <MessageSquare size={36} style={{ marginBottom: '0.7rem', opacity: 0.3 }} />
                    <p>Say ನಮಸ್ಕಾರ to {active.name}!</p>
                  </div>
                )}
                {messages.map(msg => {
                  const isMe = msg.from === user.code;
                  return (
                    <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        maxWidth: '72%', padding: '0.55rem 0.9rem', borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                        background: isMe ? 'linear-gradient(135deg,var(--sakura-deep),var(--sakura-pink))' : 'rgba(255,255,255,0.09)',
                        color: '#fff', fontSize: '0.88rem', lineHeight: 1.4,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                      }}>
                        <div>{msg.text}</div>
                        <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', textAlign: 'right', marginTop: '0.2rem' }}>{fmtTime(msg.ts)}</div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Quick Phrases */}
              <div style={{ padding: '0.5rem 1rem', display: 'flex', gap: '0.4rem', overflowX: 'auto', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                {QUICK_PHRASES.map(({ label, meaning }) => (
                  <button key={label} onClick={() => sendMsg(label)} title={meaning} style={{
                    background: 'rgba(255,163,102,0.12)', border: '1px solid rgba(255,163,102,0.25)', borderRadius: '20px',
                    padding: '0.3rem 0.8rem', color: 'var(--sakura-pink)', cursor: 'pointer', fontFamily: 'Noto Sans Kannada,sans-serif', fontSize: '0.8rem', whiteSpace: 'nowrap',
                  }}>{label}</button>
                ))}
                <button onClick={shareScore} title="Share your XP score" style={{
                  background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.25)', borderRadius: '20px',
                  padding: '0.3rem 0.8rem', color: '#ffd700', cursor: 'pointer', fontSize: '0.8rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.3rem',
                }}><Trophy size={13} /> Share Score</button>
              </div>

              {/* Input */}
              <div style={{ padding: '0.7rem 1rem', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '0.6rem' }}>
                <input
                  value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMsg(input)}
                  placeholder="Type a message…"
                  style={{ flex: 1, background: 'rgba(255,255,255,0.07)', border: '1px solid var(--glass-border)', borderRadius: '24px', padding: '0.6rem 1rem', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
                />
                <button onClick={() => sendMsg(input)} style={{ background: 'linear-gradient(135deg,var(--sakura-deep),var(--sakura-pink))', border: 'none', borderRadius: '50%', width: 42, height: 42, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 12px rgba(255,107,53,0.4)' }}>
                  <Send size={18} color="#fff" />
                </button>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)' }}>
              <MessageSquare size={56} style={{ marginBottom: '1rem', opacity: 0.25 }} />
              <p>Select a friend to start chatting</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
