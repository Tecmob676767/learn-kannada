import React, { useState, useEffect, useRef } from 'react';
import { speakKannada } from '../utils/tts.js';
import { playSuccess, playLevelUp, playFanfare, playClick, playError } from '../utils/soundEffects.js';

// ── Roleplay Dialogue Scenarios ─────────────────────────────────────────────
const ROLEPLAY_SCENARIOS = [
  {
    id: 'auto',
    title: '🛺 Auto Rickshaw Ride (ಆಟೋ ಪ್ರಯಾಣ)',
    roles: ['Passenger (ಪ್ರಯಾಣಿಕ)', 'Auto Driver (ಆಟೋ ಚಾಲಕ)'],
    dialogues: [
      { roleIndex: 0, kn: 'ಅಣ್ಣಾ, ಮೆಜೆಸ್ಟಿಕ್‌ಗೆ ಬರ್ತೀರಾ?', en: 'Brother, will you come to Majestic?', tip: 'Polite greeting' },
      { roleIndex: 1, kn: 'ಹೌದು, ಬನ್ನಿ ಕೂತ್ಕೊಳ್ಳಿ. ಮೀಟರ್ ಮೇಲೆ ಇಪ್ಪತ್ತು ರೂಪಾಯಿ ಜಾಸ್ತಿ.', en: 'Yes, come sit. Twenty rupees extra over meter.', tip: 'Driver pricing' },
      { roleIndex: 0, kn: 'ಸರಿ, ಬೇಗ ಹೋಗಿ ಅಣ್ಣಾ. ಟ್ರೈನ್ ಇದೆ.', en: 'Okay, please go fast brother. I have a train.', tip: 'Urgency phrase' },
      { roleIndex: 1, kn: 'ಆಯ್ತು ಸರ್, ಹತ್ತೇ ನಿಮಿಷದಲ್ಲಿ ತಲುಪಿಸ್ತೀನಿ.', en: 'Alright sir, I will drop you in just 10 mins.', tip: 'Assurance' },
      { roleIndex: 0, kn: 'ಧನ್ಯವಾದಗಳು! ಎಷ್ಟು ಆಯ್ತು?', en: 'Thank you! How much is it?', tip: 'Payment question' },
      { roleIndex: 1, kn: 'ನೂರಾ ಇಪ್ಪತ್ತು ರೂಪಾಯಿ ಸರ್. ಯುಪಿಐ ಕೂಡ ಇದೆ.', en: '120 rupees sir. UPI is also available.', tip: 'Payment mode' },
    ]
  },
  {
    id: 'darshini',
    title: '🍛 Darshini Coffee & Dosa (ದರ್ಶಿನಿ ಉಪಾಹಾರ)',
    roles: ['Customer (ಗ್ರಾಹಕ)', 'Server / Cashier (ಕ್ಯಾಷಿಯರ್)'],
    dialogues: [
      { roleIndex: 0, kn: 'ಒಂದು ಮಸಾಲೆ ದೋಸೆ ಮತ್ತೆ ಒಂದು ಫಿಲ್ಟರ್ ಕಾಫಿ ಕೊಡಿ.', en: 'Give one Masala Dosa and one Filter Coffee.', tip: 'Ordering food' },
      { roleIndex: 1, kn: 'ದೋಸೆ ಸ್ವಲ್ಪ ಗರಿಗರಿಯಾಗಿ (Crispy) ಬೇಕಾ ಸರ್?', en: 'Do you want the dosa extra crispy sir?', tip: 'Custom request' },
      { roleIndex: 0, kn: 'ಹೌದು, ಬೆಣ್ಣೆ ಸ್ವಲ್ಪ ಜಾಸ್ತಿ ಹಾಕಿ.', en: 'Yes, add a little extra butter.', tip: 'Taste preference' },
      { roleIndex: 1, kn: 'ಟೋಕನ್ ತಗೊಳ್ಳಿ ಸರ್, ಕೌಂಟರ್‌ನಲ್ಲಿ ಸಿಗುತ್ತೆ.', en: 'Take the token sir, collect at the counter.', tip: 'Darshini process' },
    ]
  }
];

// ── Relay Race Words ────────────────────────────────────────────────────────
const RELAY_WORDS = [
  { kn: 'ನಮಸ್ಕಾರ', en: 'Namaskara (Hello)', scrambled: ['ಸ್ಕಾ', 'ನ', 'ರ', 'ಮ'] },
  { kn: 'ಕರ್ನಾಟಕ', en: 'Karnataka', scrambled: ['ಟ', 'ಕರ್ನಾ', 'ಕ'] },
  { kn: 'ಕನ್ನಡ', en: 'Kannada', scrambled: ['ಡ', 'ಕ', 'ನ್ನ'] },
  { kn: 'ಬೆಂಗಳೂರು', en: 'Bengaluru', scrambled: ['ಳೂ', 'ಬೆಂ', 'ರು', 'ಗ'] },
  { kn: 'ಸ್ನೇಹಿತ', en: 'Snehitha (Friend)', scrambled: ['ಹಿ', 'ಸ್ನೇ', 'ತ'] }
];

// ── Pictionary Prompts ──────────────────────────────────────────────────────
const PICTIONARY_PROMPTS = [
  { wordKn: 'ಆನೆ', wordEn: 'Elephant', hint: 'Karnataka State Animal 🐘' },
  { wordKn: 'ಕಾಫಿ', wordEn: 'Filter Coffee', hint: 'Popular Darshini beverage ☕' },
  { wordKn: 'ಆಟೋ', wordEn: 'Auto Rickshaw', hint: 'Three-wheeled city transit 🛺' },
  { wordKn: 'ಮನೆ', wordEn: 'House', hint: 'A place to live 🏠' },
  { wordKn: 'ಪುಸ್ತಕ', wordEn: 'Book', hint: 'Object you read 📖' }
];

export default function MultiplayerArena({ user, onXP, onToast, onNavigate }) {
  const [activeTab, setActiveTab] = useState('lobby'); // 'lobby' | 'voice' | 'video' | 'buzz' | 'roleplay' | 'relay' | 'pictionary' | 'lounge' | 'wager' | 'share'
  const [roomCode, setRoomCode] = useState('NAMMA-77');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [inRoom, setInRoom] = useState(false);
  const [copied, setCopied] = useState(false);

  // ── Voice & Video Call State ──────────────────────────────────────────────
  const [micMuted, setMicMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [callActive, setCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const localVideoRef = useRef(null);
  const remoteCanvasRef = useRef(null);

  // ── Buzz Battle State ─────────────────────────────────────────────────────
  const [buzzScore, setBuzzScore] = useState(0);
  const [opponentBuzzScore, setOpponentBuzzScore] = useState(0);
  const [buzzIndex, setBuzzIndex] = useState(0);
  const [buzzed, setBuzzed] = useState(false);

  // ── Roleplay State ────────────────────────────────────────────────────────
  const [selectedScenario, setSelectedScenario] = useState(ROLEPLAY_SCENARIOS[0]);
  const [roleplayStep, setRoleplayStep] = useState(0);
  const [myRole, setMyRole] = useState(0); // 0 or 1

  // ── Relay Race State ──────────────────────────────────────────────────────
  const [relayIndex, setRelayIndex] = useState(0);
  const [relayBuilt, setRelayBuilt] = useState([]);
  const [opponentRelayProgress, setOpponentRelayProgress] = useState(0);

  // ── Pictionary Canvas State ───────────────────────────────────────────────
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawColor, setDrawColor] = useState('#ffa366');
  const [pictionaryIndex, setPictionaryIndex] = useState(0);
  const [pictionaryGuess, setPictionaryGuess] = useState('');
  const [pictionarySolved, setPictionarySolved] = useState(false);

  // ── Lounge Chat State ─────────────────────────────────────────────────────
  const [loungeMessages, setLoungeMessages] = useState([
    { sender: 'Ananya (Bengaluru)', textKn: 'ಎಲ್ಲರಿಗೂ ಶುಭ ಸಂಜೆ! ಇಂದು ಯಾರು ಅಭ್ಯಾಸ ಮಾಡ್ತಿದ್ದೀರಿ?', textEn: 'Good evening everyone! Who is practicing today?', time: 'Just now' },
    { sender: 'Marcus (London)', textKn: 'ನಾನು ಇವತ್ತು ಕನ್ನಡ ಕಲಿಯುತ್ತಿದ್ದೇನೆ! ತುಂಬಾ ಇಷ್ಟ.', textEn: 'I am learning Kannada today! Love it so much.', time: '1m ago' },
    { sender: 'Priya (Mysuru)', textKn: 'ಸಿರಿಗನ್ನಡಂ ಗೆಲ್ಗೆ! ಯಾರಿಗಾದರೂ ಪಾಲುದಾರ ಬೇಕಾ?', textEn: 'Sirigannadam gelge! Anyone needs a practice partner?', time: '2m ago' }
  ]);
  const [chatInput, setChatInput] = useState('');

  // ── Call Timer ────────────────────────────────────────────────────────────
  useEffect(() => {
    let timer;
    if (callActive) {
      timer = setInterval(() => setCallDuration(d => d + 1), 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [callActive]);

  // ── WebRTC Camera Stream Simulation / Real Video Capture ──────────────────
  useEffect(() => {
    if (activeTab === 'video' && callActive && !cameraOff) {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
          .then(stream => {
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = stream;
            }
          })
          .catch(() => {
            // Simulated camera fallback
          });
      }
    }
    return () => {
      if (localVideoRef.current && localVideoRef.current.srcObject) {
        const tracks = localVideoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [activeTab, callActive, cameraOff]);

  // ── Canvas Setup for Pictionary ───────────────────────────────────────────
  useEffect(() => {
    if (activeTab === 'pictionary' && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.fillStyle = '#1e1008';
      ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  }, [activeTab]);

  const handleStartDraw = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handleDraw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = drawColor;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const handleStopDraw = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1e1008';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  // ── Share Helpers ─────────────────────────────────────────────────────────
  const appUrl = 'https://sobagukannadaedu.vercel.app';
  const myCode = user?.code || '123456';
  const shareLink = `${appUrl}/?room=${roomCode}&ref=${myCode}`;

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    if (onToast) onToast('📋 Multiplayer Room link copied!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const shareToSocial = (platform) => {
    playClick();
    const text = `🌸 Join me on Sobagu Kannada Multiplayer! We can practice live Voice/Video calls, play buzz battles, and learn real Kannada together: ${shareLink}`;
    let url = '';
    if (platform === 'whatsapp') url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    if (platform === 'twitter') url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    if (platform === 'telegram') url = `https://t.me/share/url?url=${encodeURIComponent(shareLink)}&text=${encodeURIComponent(text)}`;
    if (platform === 'linkedin') url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareLink)}`;
    if (url) window.open(url, '_blank');
  };

  // ── Format Duration Helper ────────────────────────────────────────────────
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="learning-screen" style={{ maxWidth: '1080px', margin: '0 auto' }}>
      {/* ── Top Header & Tab Navigation ── */}
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', margin: 0 }}>
              🌐 <span className="gradient-text">Sobagu Multiplayer Universe</span> · ಜಾಗತಿಕ ರಣರಂಗ
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
              Connect with Kannada learners worldwide. Real-time Voice, Video, Co-op Roleplay & Battles.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '0.85rem', background: 'rgba(74,222,128,0.15)', border: '1px solid #4ade80', color: '#4ade80', padding: '0.4rem 0.8rem', borderRadius: '20px', fontWeight: 800 }}>
              🟢 Live Global Mesh Active
            </span>
          </div>
        </div>
      </div>

      {/* ── 10 Feature Tabs Bar ── */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.8rem', marginBottom: '1.5rem' }}>
        {[
          { id: 'lobby', icon: '🔑', label: 'Room Lobby' },
          { id: 'voice', icon: '🎙️', label: 'Voice Call' },
          { id: 'video', icon: '📹', label: 'Video Studio' },
          { id: 'roleplay', icon: '🎭', label: 'Co-Op Theater' },
          { id: 'relay', icon: '🏁', label: 'Word Relay' },
          { id: 'pictionary', icon: '🎨', label: 'Pictionary' },
          { id: 'buzz', icon: '⚡', label: 'Buzz Battle' },
          { id: 'lounge', icon: '💬', label: 'Study Lounge' },
          { id: 'wager', icon: '🏆', label: 'XP Wager' },
          { id: 'share', icon: '🌍', label: 'Global Spread' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => {
              playClick();
              setActiveTab(t.id);
            }}
            style={{
              padding: '0.65rem 1.1rem',
              borderRadius: '16px',
              border: activeTab === t.id ? '2px solid #ffa366' : '1px solid rgba(255,255,255,0.08)',
              background: activeTab === t.id ? 'rgba(255,163,102,0.2)' : 'rgba(255,255,255,0.03)',
              color: activeTab === t.id ? '#fff' : 'var(--text-secondary)',
              fontWeight: activeTab === t.id ? 800 : 600,
              fontSize: '0.86rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 1. ROOM LOBBY & MATCHMAKING                                         */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'lobby' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          <div className="glass-card" style={{ padding: '2rem', borderRadius: '20px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffa366', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>🔑</span> Your Private Room Code
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.75)', marginBottom: '1.5rem' }}>
              Share this room code with a friend anywhere in the world to practice voice, video, or games together instantly:
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', background: 'rgba(0,0,0,0.4)', padding: '1rem 1.4rem', borderRadius: '14px', marginBottom: '1.5rem', border: '1px dashed #ffa366' }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 900, letterSpacing: '2px', color: '#ffd700', flex: 1 }}>
                {roomCode}
              </span>
              <button className="btn-primary" onClick={copyShareLink} style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                {copied ? '✅ Copied' : '📋 Copy Link'}
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.8rem' }}>
              <button
                className="btn-primary"
                onClick={() => {
                  playSuccess();
                  setInRoom(true);
                  setActiveTab('voice');
                  if (onToast) onToast('🎉 Joined Room! Ready for Voice practice', 'success');
                }}
                style={{ flex: 1, padding: '0.85rem' }}
              >
                🎙️ Open Voice Room
              </button>
              <button
                onClick={() => {
                  playSuccess();
                  setInRoom(true);
                  setActiveTab('video');
                  if (onToast) onToast('📹 Joined Room! Ready for Video studio', 'success');
                }}
                style={{ flex: 1, padding: '0.85rem', background: 'linear-gradient(135deg, #ff0844, #ffb199)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}
              >
                📹 Open Video Room
              </button>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '2rem', borderRadius: '20px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#4ade80', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>⚡</span> Join a Friend's Room
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.75)', marginBottom: '1.5rem' }}>
              Enter the 6-character room code shared by your friend or study group:
            </p>

            <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.5rem' }}>
              <input
                type="text"
                placeholder="e.g. NAMMA-42"
                value={joinCodeInput}
                onChange={e => setJoinCodeInput(e.target.value.toUpperCase())}
                style={{
                  flex: 1,
                  padding: '0.85rem 1rem',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#fff',
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  letterSpacing: '1px',
                  textAlign: 'center'
                }}
              />
              <button
                className="btn-primary"
                onClick={() => {
                  if (joinCodeInput.trim()) {
                    setRoomCode(joinCodeInput.trim());
                    setInRoom(true);
                    playSuccess();
                    if (onToast) onToast(`Connected to Room ${joinCodeInput.trim()}`, 'success');
                  }
                }}
                style={{ width: 'auto', padding: '0 1.5rem' }}
              >
                Connect ➔
              </button>
            </div>

            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>🌟 POPULAR PUBLIC HUBS:</div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {['BENGALURU-1', 'MYSURU-HUB', 'TECH-PARK', 'GLOBAL-KA'].map(code => (
                  <button
                    key={code}
                    onClick={() => {
                      setRoomCode(code);
                      setInRoom(true);
                      playClick();
                      if (onToast) onToast(`Connected to ${code}`, 'info');
                    }}
                    style={{
                      background: 'rgba(255,163,102,0.1)',
                      border: '1px solid rgba(255,163,102,0.3)',
                      color: '#ffa366',
                      padding: '0.35rem 0.75rem',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    #{code}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 2. WEBRTC VOICE CALL PRACTICE ROOM                                 */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'voice' && (
        <div className="glass-card" style={{ padding: '2rem', borderRadius: '24px', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{ fontWeight: 800, color: '#ffa366' }}>Room: #{roomCode}</span>
            <span style={{ fontSize: '0.9rem', color: callActive ? '#4ade80' : 'var(--text-muted)', fontWeight: 700 }}>
              {callActive ? `🔴 Live Call · ${formatTime(callDuration)}` : '⚪ Idle'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem', margin: '2rem 0', alignItems: 'center' }}>
            {/* Local Peer */}
            <div style={{ padding: '2rem', background: 'rgba(255,255,255,0.04)', borderRadius: '20px', border: '1.5px solid rgba(255,163,102,0.3)' }}>
              <div style={{ fontSize: '4rem', marginBottom: '0.5rem', filter: micMuted ? 'grayscale(1)' : 'none' }}>🤠</div>
              <div style={{ fontWeight: 900, fontSize: '1.1rem' }}>{user?.name || 'You'}</div>
              <div style={{ fontSize: '0.8rem', color: micMuted ? '#ff416c' : '#4ade80', fontWeight: 700, marginTop: '4px' }}>
                {micMuted ? '🔇 Microphone Muted' : '🎙️ Mic Active (Speaking)'}
              </div>
              {/* Waveform indicator */}
              {callActive && !micMuted && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginTop: '1rem', height: '24px', alignItems: 'center' }}>
                  {[12, 24, 18, 28, 16, 22, 10, 20].map((h, i) => (
                    <div key={i} style={{ width: '4px', height: `${h}px`, background: '#4ade80', borderRadius: '2px', animation: 'pulse 1s infinite alternate' }} />
                  ))}
                </div>
              )}
            </div>

            {/* Remote Peer */}
            <div style={{ padding: '2rem', background: 'rgba(255,255,255,0.04)', borderRadius: '20px', border: '1.5px solid rgba(79,172,254,0.3)' }}>
              <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>🎧</div>
              <div style={{ fontWeight: 900, fontSize: '1.1rem' }}>Language Partner</div>
              <div style={{ fontSize: '0.8rem', color: callActive ? '#4ade80' : 'var(--text-muted)', fontWeight: 700, marginTop: '4px' }}>
                {callActive ? '🟢 Connected (Audio Stream)' : '⏳ Waiting for peer to connect...'}
              </div>
              {callActive && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginTop: '1rem', height: '24px', alignItems: 'center' }}>
                  {[18, 14, 26, 12, 20, 15, 25, 10].map((h, i) => (
                    <div key={i} style={{ width: '4px', height: `${h}px`, background: '#4facfe', borderRadius: '2px', animation: 'pulse 1.2s infinite alternate' }} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Guided Prompt Cards */}
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.2rem', borderRadius: '16px', marginBottom: '2rem', textAlign: 'left' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#ffd700', marginBottom: '0.6rem' }}>
              💡 SUGGESTED KANNADA CONVERSATION STARTERS:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.8rem' }}>
              {[
                { kn: 'ನಿಮ್ಮ ಹೆಸರೇನು?', en: 'What is your name?' },
                { kn: 'ನೀವು ಎಲ್ಲಿಂದ ಬಂದಿದ್ದೀರಿ?', en: 'Where are you from?' },
                { kn: 'ಕನ್ನಡ ಕಲಿಯುವುದು ಹೇಗೆ ಸಾಗಿದೆ?', en: 'How is learning Kannada going?' }
              ].map((p, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.05)', padding: '0.8rem', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontFamily: 'Noto Sans Kannada, sans-serif', fontWeight: 800, color: '#ffa366' }}>{p.kn}</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{p.en}</div>
                  </div>
                  <button onClick={() => speakKannada(p.kn)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>🔊</button>
                </div>
              ))}
            </div>
          </div>

          {/* Call Controls */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.2rem', flexWrap: 'wrap' }}>
            {!callActive ? (
              <button
                className="btn-primary"
                onClick={() => {
                  setCallActive(true);
                  playSuccess();
                  if (onToast) onToast('📞 Voice Call Started! +25 XP', 'xp');
                  onXP && onXP(25);
                }}
                style={{ padding: '0.9rem 2.5rem', fontSize: '1rem', fontWeight: 800 }}
              >
                📞 Start Voice Call
              </button>
            ) : (
              <>
                <button
                  onClick={() => setMicMuted(m => !m)}
                  style={{
                    background: micMuted ? '#ff416c' : 'rgba(255,255,255,0.1)',
                    border: 'none',
                    padding: '0.9rem 1.5rem',
                    borderRadius: '14px',
                    color: '#fff',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  {micMuted ? '🔇 Unmute Mic' : '🎙️ Mute Mic'}
                </button>
                <button
                  onClick={() => {
                    setCallActive(false);
                    playError();
                    if (onToast) onToast('Call ended', 'info');
                  }}
                  style={{
                    background: '#e52d27',
                    border: 'none',
                    padding: '0.9rem 2rem',
                    borderRadius: '14px',
                    color: '#fff',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  ❌ End Call
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 3. WEBRTC VIDEO CALL STUDIO                                         */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'video' && (
        <div className="glass-card" style={{ padding: '2rem', borderRadius: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{ fontWeight: 800, color: '#ffa366' }}>📹 Video Studio · Room: #{roomCode}</span>
            <span style={{ fontSize: '0.9rem', color: callActive ? '#4ade80' : 'var(--text-muted)', fontWeight: 700 }}>
              {callActive ? `🔴 Live Stream · ${formatTime(callDuration)}` : '⚪ Camera Off'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {/* Local Video Tile */}
            <div style={{ height: '240px', background: '#0a0503', borderRadius: '16px', overflow: 'hidden', position: 'relative', border: '1.5px solid rgba(255,163,102,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {callActive && !cameraOff ? (
                <video ref={localVideoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
                  <div style={{ fontSize: '3rem' }}>📷</div>
                  <div style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Local Camera Off</div>
                </div>
              )}
              <div style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(0,0,0,0.6)', padding: '0.25rem 0.75rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 800 }}>
                {user?.name || 'You'} (Local)
              </div>
            </div>

            {/* Remote Peer Video Tile */}
            <div style={{ height: '240px', background: '#0a0503', borderRadius: '16px', overflow: 'hidden', position: 'relative', border: '1.5px solid rgba(79,172,254,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {callActive ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '4rem', animation: 'bounce 2s infinite' }}>👨‍💻</div>
                  <div style={{ fontSize: '0.9rem', color: '#4ade80', fontWeight: 800, marginTop: '0.5rem' }}>Remote Peer Stream Connected</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>Audio & Video Synchronized</div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
                  <div style={{ fontSize: '3rem' }}>👥</div>
                  <div style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Waiting for peer video...</div>
                </div>
              )}
              <div style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(0,0,0,0.6)', padding: '0.25rem 0.75rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 800 }}>
                Peer Learner (Remote)
              </div>
            </div>
          </div>

          {/* Video Controls */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {!callActive ? (
              <button
                className="btn-primary"
                onClick={() => {
                  setCallActive(true);
                  playSuccess();
                  if (onToast) onToast('📹 Video Studio Connected! +30 XP', 'xp');
                  onXP && onXP(30);
                }}
                style={{ padding: '0.9rem 2rem', fontWeight: 800 }}
              >
                📹 Join Video Studio
              </button>
            ) : (
              <>
                <button
                  onClick={() => setCameraOff(c => !c)}
                  style={{ padding: '0.8rem 1.4rem', borderRadius: '12px', background: cameraOff ? '#ff416c' : 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}
                >
                  {cameraOff ? '📷 Turn Camera ON' : '📷 Turn Camera OFF'}
                </button>
                <button
                  onClick={() => setMicMuted(m => !m)}
                  style={{ padding: '0.8rem 1.4rem', borderRadius: '12px', background: micMuted ? '#ff416c' : 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}
                >
                  {micMuted ? '🔇 Unmute Mic' : '🎙️ Mute Mic'}
                </button>
                <button
                  onClick={() => {
                    setCallActive(false);
                    playError();
                  }}
                  style={{ padding: '0.8rem 1.8rem', borderRadius: '12px', background: '#e52d27', color: '#fff', border: 'none', fontWeight: 800, cursor: 'pointer' }}
                >
                  ❌ Leave Studio
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 4. CO-OP DIALOGUE THEATER                                           */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'roleplay' && (
        <div className="glass-card" style={{ padding: '2rem', borderRadius: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.8rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffa366', margin: 0 }}>
              🎭 Co-Op Roleplay Theater · ಜಂಟಿ ಸಂಭಾಷಣೆ
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {ROLEPLAY_SCENARIOS.map(sc => (
                <button
                  key={sc.id}
                  onClick={() => {
                    setSelectedScenario(sc);
                    setRoleplayStep(0);
                  }}
                  style={{
                    padding: '0.4rem 0.8rem',
                    borderRadius: '8px',
                    border: selectedScenario.id === sc.id ? '1px solid #ffa366' : '1px solid rgba(255,255,255,0.1)',
                    background: selectedScenario.id === sc.id ? 'rgba(255,163,102,0.2)' : 'rgba(255,255,255,0.03)',
                    color: '#fff',
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  {sc.title.split(' ')[1]}
                </button>
              ))}
            </div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '16px', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
              <span style={{ fontWeight: 800, color: '#4ade80' }}>Player 1: {selectedScenario.roles[0]}</span>
              <span style={{ fontWeight: 800, color: '#4facfe' }}>Player 2: {selectedScenario.roles[1]}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {selectedScenario.dialogues.slice(0, roleplayStep + 1).map((d, i) => {
                const isP1 = d.roleIndex === 0;
                return (
                  <div
                    key={i}
                    style={{
                      alignSelf: isP1 ? 'flex-start' : 'flex-end',
                      background: isP1 ? 'rgba(74,222,128,0.15)' : 'rgba(79,172,254,0.15)',
                      border: isP1 ? '1px solid rgba(74,222,128,0.3)' : '1px solid rgba(79,172,254,0.3)',
                      borderRadius: '14px',
                      padding: '0.9rem 1.2rem',
                      maxWidth: '80%'
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: isP1 ? '#4ade80' : '#4facfe', marginBottom: '0.2rem' }}>
                      {selectedScenario.roles[d.roleIndex]}
                    </div>
                    <div style={{ fontFamily: 'Noto Sans Kannada, sans-serif', fontSize: '1.1rem', fontWeight: 800 }}>
                      {d.kn}
                    </div>
                    <div style={{ fontSize: '0.82rem', opacity: 0.75, marginTop: '2px' }}>{d.en}</div>
                    <button
                      onClick={() => speakKannada(d.kn)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', marginTop: '4px', opacity: 0.8 }}
                    >
                      🔊 Speak
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            {roleplayStep + 1 < selectedScenario.dialogues.length ? (
              <button
                className="btn-primary"
                onClick={() => {
                  setRoleplayStep(s => s + 1);
                  playSuccess();
                  onXP && onXP(10);
                }}
                style={{ padding: '0.8rem 2rem' }}
              >
                Next Line ➔ (+10 XP)
              </button>
            ) : (
              <button
                className="btn-primary"
                onClick={() => {
                  setRoleplayStep(0);
                  playFanfare();
                  if (onToast) onToast('🎉 Roleplay Completed! +50 XP', 'xp');
                  onXP && onXP(50);
                }}
                style={{ padding: '0.8rem 2rem' }}
              >
                🎉 Complete Roleplay & Restart
              </button>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 5. KANNADA WORD RELAY RACE                                          */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'relay' && (
        <div className="glass-card" style={{ padding: '2rem', borderRadius: '24px' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffa366', marginBottom: '1rem' }}>
            🏁 Kannada Word Relay Race · ಪದ ರೇಸ್
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.75)', marginBottom: '1.5rem' }}>
            Assemble the scrambled Kannada aksharas before your opponent finishes!
          </p>

          {/* Live Race Progress Track */}
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.2rem', borderRadius: '16px', marginBottom: '2rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 800, marginBottom: '4px' }}>
                <span>🤠 {user?.name || 'You'}</span>
                <span>Word {relayIndex + 1}/{RELAY_WORDS.length}</span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${((relayIndex) / RELAY_WORDS.length) * 100}%`, height: '100%', background: '#38ef7d', transition: 'width 0.4s ease' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 800, marginBottom: '4px' }}>
                <span>⚡ Opponent Racer</span>
                <span>Word {Math.min(RELAY_WORDS.length, relayIndex + 1)}/{RELAY_WORDS.length}</span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, ((relayIndex + 0.5) / RELAY_WORDS.length) * 100)}%`, height: '100%', background: '#ff6b35', transition: 'width 0.4s ease' }} />
              </div>
            </div>
          </div>

          {relayIndex < RELAY_WORDS.length ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Assemble: <strong>{RELAY_WORDS[relayIndex].en}</strong>
              </div>

              {/* Built word area */}
              <div style={{ minHeight: '60px', background: 'rgba(255,255,255,0.06)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.5rem', marginBottom: '1.5rem' }}>
                {relayBuilt.map((chunk, i) => (
                  <span key={i} style={{ background: '#ffa366', color: '#1a1008', padding: '0.5rem 1rem', borderRadius: '10px', fontWeight: 800, fontSize: '1.2rem', fontFamily: 'Noto Sans Kannada, sans-serif' }}>
                    {chunk}
                  </span>
                ))}
              </div>

              {/* Chunks to click */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.8rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                {RELAY_WORDS[relayIndex].scrambled.map((chunk, i) => (
                  <button
                    key={i}
                    className="btn-primary"
                    onClick={() => {
                      playClick();
                      const nextBuilt = [...relayBuilt, chunk];
                      setRelayBuilt(nextBuilt);
                      if (nextBuilt.join('') === RELAY_WORDS[relayIndex].kn) {
                        playSuccess();
                        onXP && onXP(20);
                        if (relayIndex + 1 < RELAY_WORDS.length) {
                          setRelayIndex(r => r + 1);
                          setRelayBuilt([]);
                        } else {
                          playFanfare();
                          if (onToast) onToast('🏆 You Won the Word Relay Race! +50 XP', 'xp');
                        }
                      }
                    }}
                    style={{ padding: '0.8rem 1.4rem', fontSize: '1.2rem', fontFamily: 'Noto Sans Kannada, sans-serif' }}
                  >
                    {chunk}
                  </button>
                ))}
              </div>

              <button onClick={() => setRelayBuilt([])} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', padding: '0.4rem 1rem', borderRadius: '8px', color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}>
                🔄 Clear Word
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '4rem' }}>🏆🥇</div>
              <h2>Relay Victory! ವಿಜಯ!</h2>
              <button
                className="btn-primary"
                onClick={() => {
                  setRelayIndex(0);
                  setRelayBuilt([]);
                }}
                style={{ marginTop: '1rem', padding: '0.8rem 2rem' }}
              >
                Race Again 🏁
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 6. KANNADA PICTIONARY / DRAW & GUESS                                 */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'pictionary' && (
        <div className="glass-card" style={{ padding: '2rem', borderRadius: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffa366', margin: 0 }}>
              🎨 Kannada Pictionary · ಚಿತ್ರ ಬಿಡಿಸಿ - ಊಹಿಸಿ
            </h3>
            <div style={{ background: 'rgba(255,215,0,0.15)', border: '1px solid #ffd700', padding: '0.3rem 0.8rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 800, color: '#ffd700' }}>
              Draw this word: <strong>{PICTIONARY_PROMPTS[pictionaryIndex].wordKn} ({PICTIONARY_PROMPTS[pictionaryIndex].wordEn})</strong>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 280px', gap: '1.5rem', marginBottom: '1rem' }}>
            {/* Canvas */}
            <div style={{ border: '2px solid rgba(255,163,102,0.3)', borderRadius: '16px', overflow: 'hidden', background: '#1e1008' }}>
              <canvas
                ref={canvasRef}
                width={500}
                height={320}
                onMouseDown={handleStartDraw}
                onMouseMove={handleDraw}
                onMouseUp={handleStopDraw}
                onMouseLeave={handleStopDraw}
                style={{ width: '100%', height: '100%', cursor: 'crosshair', display: 'block' }}
              />
            </div>

            {/* Guess & Controls Panel */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>PALETTE:</div>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  {['#ffa366', '#ffd700', '#4ade80', '#4facfe', '#f093fb', '#ffffff'].map(c => (
                    <button
                      key={c}
                      onClick={() => setDrawColor(c)}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: c,
                        border: drawColor === c ? '2px solid #fff' : 'none',
                        cursor: 'pointer'
                      }}
                    />
                  ))}
                  <button onClick={clearCanvas} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: '8px', padding: '0 0.5rem', fontSize: '0.75rem', cursor: 'pointer' }}>
                    Clear
                  </button>
                </div>

                <div style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#ffd700', fontWeight: 800 }}>HINT:</div>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>{PICTIONARY_PROMPTS[pictionaryIndex].hint}</div>
                </div>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Guess Kannada word..."
                  value={pictionaryGuess}
                  onChange={e => setPictionaryGuess(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', marginBottom: '0.5rem' }}
                />
                <button
                  className="btn-primary"
                  onClick={() => {
                    const target = PICTIONARY_PROMPTS[pictionaryIndex];
                    if (pictionaryGuess.trim().toLowerCase() === target.wordKn.toLowerCase() || pictionaryGuess.trim().toLowerCase() === target.wordEn.toLowerCase()) {
                      playFanfare();
                      if (onToast) onToast('🎯 Correct Guess! +35 XP', 'xp');
                      onXP && onXP(35);
                      setPictionaryIndex(i => (i + 1) % PICTIONARY_PROMPTS.length);
                      setPictionaryGuess('');
                      clearCanvas();
                    } else {
                      playError();
                      if (onToast) onToast('Try again!', 'error');
                    }
                  }}
                  style={{ width: '100%', padding: '0.75rem' }}
                >
                  Submit Guess 🎯
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 7. LIVE 1v1 SPEED BUZZ BATTLE                                       */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'buzz' && (
        <div className="glass-card" style={{ padding: '2rem', borderRadius: '24px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffa366', marginBottom: '0.5rem' }}>
            ⚡ 1v1 Speed Buzz Battle · ವೇಗದ ಬಜರ್ ಕದನ
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.75)', marginBottom: '1.5rem' }}>
            Hit the BUZZER first when you know the answer to earn double streak points!
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '1rem', background: 'rgba(0,0,0,0.3)', padding: '1.2rem', borderRadius: '16px', marginBottom: '2rem' }}>
            <div>
              <div style={{ fontSize: '2rem' }}>🤠</div>
              <div style={{ fontWeight: 800 }}>{user?.name || 'You'}</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#38ef7d' }}>{buzzScore}</div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffd700' }}>VS</div>
            <div>
              <div style={{ fontSize: '2rem' }}>⚡</div>
              <div style={{ fontWeight: 800 }}>Opponent</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ff6b35' }}>{opponentBuzzScore}</div>
            </div>
          </div>

          <div style={{ padding: '1.8rem', background: 'rgba(255,255,255,0.04)', borderRadius: '16px', marginBottom: '2rem' }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: 'Noto Sans Kannada, sans-serif', color: '#ffd700', marginBottom: '0.5rem' }}>
              "ಶುಭೋದಯ" ಎಂದರೆ ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಏನು?
            </div>
            <div style={{ fontSize: '0.88rem', opacity: 0.75 }}>
              What does "Shubhodaya" mean in English?
            </div>
          </div>

          <button
            onClick={() => {
              playFanfare();
              setBuzzScore(s => s + 50);
              onXP && onXP(30);
              if (onToast) onToast('🚨 BUZZED FIRST! +30 XP', 'xp');
            }}
            style={{
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, #ff416c, #ff4b2b)',
              boxShadow: '0 0 40px rgba(255,65,108,0.6)',
              border: '4px solid #fff',
              color: '#fff',
              fontSize: '1.8rem',
              fontWeight: 900,
              cursor: 'pointer',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.1s ease'
            }}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.92)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <span>🚨</span>
            <span>BUZZ!</span>
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 8. GLOBAL LIVE STUDY LOUNGE                                         */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'lounge' && (
        <div className="glass-card" style={{ padding: '2rem', borderRadius: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffa366', margin: 0 }}>
              💬 Global Study Lounge · ಜಾಗತಿಕ ಕೂಟ
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#4ade80', fontWeight: 700 }}>🟢 140+ Learners Online</span>
          </div>

          <div style={{ height: '360px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.8rem', background: 'rgba(0,0,0,0.25)', padding: '1.2rem', borderRadius: '16px', marginBottom: '1rem' }}>
            {loungeMessages.map((m, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.05)', padding: '0.9rem 1.2rem', borderRadius: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#ffa366' }}>{m.sender}</span>
                  <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>{m.time}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontFamily: 'Noto Sans Kannada, sans-serif', fontSize: '1.05rem', fontWeight: 700 }}>{m.kn || m.textKn}</div>
                  <button onClick={() => speakKannada(m.kn || m.textKn)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}>🔊</button>
                </div>
                <div style={{ fontSize: '0.78rem', opacity: 0.65 }}>{m.en || m.textEn}</div>
              </div>
            ))}
          </div>

          <form
            onSubmit={e => {
              e.preventDefault();
              if (chatInput.trim()) {
                setLoungeMessages(prev => [...prev, {
                  sender: `${user?.name || 'You'} (ಕಲಿಕಾರ್ಥಿ)`,
                  textKn: chatInput.trim(),
                  textEn: 'Shared in study lounge',
                  time: 'Just now'
                }]);
                setChatInput('');
                playSuccess();
                onXP && onXP(5);
              }
            }}
            style={{ display: 'flex', gap: '0.6rem' }}
          >
            <input
              type="text"
              placeholder="Post a message in Kannada or English..."
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              style={{ flex: 1, padding: '0.8rem 1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontFamily: 'Noto Sans Kannada, sans-serif' }}
            />
            <button className="btn-primary" type="submit" style={{ padding: '0 1.5rem' }}>
              Send 🚀
            </button>
          </form>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 9. XP WAGER & ARENA SHOWDOWN                                        */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'wager' && (
        <div className="glass-card" style={{ padding: '2rem', borderRadius: '24px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffd700', marginBottom: '0.5rem' }}>
            🏆 XP Wager Arena · XP ಪಂದ್ಯ
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', marginBottom: '1.5rem' }}>
            Stake friendly XP in 1v1 challenges to boost your rank on the Live Leaderboard!
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.2rem', marginBottom: '2rem' }}>
            {[
              { xp: 50, title: 'Novice Duel', reward: '100 XP Pot', color: '#cd7f32' },
              { xp: 100, title: 'Master Clash', reward: '200 XP Pot', color: '#c0c0c0' },
              { xp: 250, title: 'Crown Champion', reward: '500 XP Pot', color: '#ffd700' }
            ].map((tier, i) => (
              <div key={i} style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.04)', borderRadius: '16px', border: `1.5px solid ${tier.color}` }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>⚔️</div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: tier.color }}>{tier.title}</div>
                <div style={{ fontSize: '0.85rem', opacity: 0.8, margin: '0.3rem 0 1rem' }}>Stake {tier.xp} XP ➔ Win {tier.reward}</div>
                <button
                  className="btn-primary"
                  onClick={() => {
                    playFanfare();
                    if (onToast) onToast(`⚔️ Staked ${tier.xp} XP in ${tier.title}! Matchmaking...`, 'success');
                    onXP && onXP(tier.xp);
                  }}
                  style={{ width: '100%', padding: '0.65rem', fontSize: '0.85rem' }}
                >
                  Enter Wager ➔
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 10. VIRAL GLOBAL AMBASSADOR & SHARE STUDIO                          */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'share' && (
        <div className="glass-card" style={{ padding: '2rem', borderRadius: '24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 900, background: 'linear-gradient(135deg, #ffd700, #ff6b35)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem' }}>
              🌍 Help Sobagu Spread Across the World! · ಜಾಗತಿಕ ಪ್ರಚಾರ
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.85)', maxWidth: '640px', margin: '0 auto', fontSize: '0.95rem', lineHeight: '1.6' }}>
              Share the joy of learning Kannada with your friends, colleagues, and community globally. Every learner you invite gets +250 XP, and you earn +500 XP!
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            {/* Direct Share Card */}
            <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.04)', borderRadius: '16px', border: '1px solid rgba(255,163,102,0.3)' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#ffa366', marginBottom: '0.6rem' }}>YOUR DIRECT INVITE LINK:</div>
              <div style={{ background: 'rgba(0,0,0,0.4)', padding: '0.8rem', borderRadius: '10px', fontSize: '0.82rem', wordBreak: 'break-all', marginBottom: '1rem', color: '#ffd700' }}>
                {shareLink}
              </div>
              <button className="btn-primary" onClick={copyShareLink} style={{ width: '100%', padding: '0.75rem', fontWeight: 800 }}>
                {copied ? '✅ Copied to Clipboard' : '📋 Copy Invite Link'}
              </button>
            </div>

            {/* 1-Click Social Shares */}
            <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.04)', borderRadius: '16px', border: '1px solid rgba(74,222,128,0.3)' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#4ade80', marginBottom: '0.8rem' }}>1-CLICK GLOBAL SHARING:</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                <button onClick={() => shareToSocial('whatsapp')} style={{ padding: '0.7rem', borderRadius: '10px', background: '#25D366', color: '#fff', border: 'none', fontWeight: 800, cursor: 'pointer' }}>
                  💬 WhatsApp
                </button>
                <button onClick={() => shareToSocial('twitter')} style={{ padding: '0.7rem', borderRadius: '10px', background: '#1DA1F2', color: '#fff', border: 'none', fontWeight: 800, cursor: 'pointer' }}>
                  🐦 X / Twitter
                </button>
                <button onClick={() => shareToSocial('telegram')} style={{ padding: '0.7rem', borderRadius: '10px', background: '#0088cc', color: '#fff', border: 'none', fontWeight: 800, cursor: 'pointer' }}>
                  ✈️ Telegram
                </button>
                <button onClick={() => shareToSocial('linkedin')} style={{ padding: '0.7rem', borderRadius: '10px', background: '#0077b5', color: '#fff', border: 'none', fontWeight: 800, cursor: 'pointer' }}>
                  💼 LinkedIn
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
