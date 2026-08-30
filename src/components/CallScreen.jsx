import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Phone, PhoneCall, PhoneOff, Video, VideoOff, Mic, MicOff,
  SwitchCamera, Volume2, Sparkles, MessageCircle, ShieldCheck,
  Minimize2, Maximize2
} from 'lucide-react';
import {
  answerCall, endCall, toggleMute, toggleCamera,
  callFriend, switchCamera
} from '../utils/webrtcService.js';
import {
  startCallRingtone, stopCallRingtone, playCallEndBeep
} from '../utils/soundEffects.js';

const GRAD_COLORS = [
  'linear-gradient(135deg,#ff6b35,#ffa366)',
  'linear-gradient(135deg,#4facfe,#00f2fe)',
  'linear-gradient(135deg,#43e97b,#38f9d7)',
  'linear-gradient(135deg,#f093fb,#f5576c)',
];

const KANNADA_CALL_PHRASES = [
  { kn: 'ನಮಸ್ಕಾರ! ನೀವು ಹೇಗಿದ್ದೀರಿ?', en: 'Hello! How are you?' },
  { kn: 'ನಾನು ಚೆನ್ನಾಗಿದ್ದೀನಿ, ಧನ್ಯವಾದ!', en: "I am doing well, thank you!" },
  { kn: 'ನಿಮ್ಮ ಊಟ ಆಯ್ತಾ?', en: 'Did you have your meal?' },
  { kn: 'ಇವತ್ತು ಯಾವ ಪಾಠ ಕಲಿಯೋಣ?', en: 'Which lesson shall we learn today?' },
  { kn: 'ಕನ್ನಡ ಮಾತಾಡುವುದು ತುಂಬಾ ಖುಷಿ!', en: 'Speaking Kannada is so joyful!' },
];

function CallAvatar({ name, size = 110, isRinging = false }) {
  const idx = ((name || '?').charCodeAt(0)) % GRAD_COLORS.length;
  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      {isRinging && (
        <>
          <div className="call-ring-wave wave-1" />
          <div className="call-ring-wave wave-2" />
        </>
      )}
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: GRAD_COLORS[idx],
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 900, color: '#fff', fontSize: size * 0.38,
        boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 4px rgba(255,255,255,0.15)',
        zIndex: 2,
      }}>
        {(name || '?')[0].toUpperCase()}
      </div>
    </div>
  );
}

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function CallScreen({ user, callState, onCallEnd }) {
  const [muted, setMuted]             = useState(false);
  const [camOff, setCamOff]           = useState(false);
  const [duration, setDuration]       = useState(0);
  const [callStatus, setCallStatus]   = useState('connecting'); // 'ringing' | 'connected'
  const [remoteStream, setRemoteStream] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [showPhrases, setShowPhrases] = useState(false);
  const [pipMinimized, setPipMinimized] = useState(false);

  const localVideoRef  = useRef(null);
  const remoteVideoRef = useRef(null);
  const timerRef       = useRef(null);

  const { active, incoming, type = 'video', friendName = 'Friend', friendCode, incomingCallObj } = callState || {};
  const isVideo = type === 'video';

  // Play spoken audio during call
  const speakKannada = (text) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'kn-IN';
      u.rate = 0.9;
      window.speechSynthesis.speak(u);
    }
  };

  // Initialize outgoing or incoming call
  useEffect(() => {
    if (!active && !incoming) return;

    if (incoming) {
      // Incoming call: play ringtone
      startCallRingtone();
      setCallStatus('ringing');
    } else if (active) {
      // Outgoing call: request local stream & ring
      startCallRingtone();
      setCallStatus('ringing');

      callFriend(friendCode, user?.code, user?.name, isVideo).then(({ localStream: ls }) => {
        if (ls) setLocalStream(ls);
      });

      // Auto-connect simulation after 2.5s for seamless interactive experience
      const connectTimer = setTimeout(() => {
        stopCallRingtone();
        setCallStatus('connected');
      }, 2500);

      return () => clearTimeout(connectTimer);
    }

    return () => {
      stopCallRingtone();
    };
  }, [active, incoming, friendCode, user?.code, user?.name, isVideo]);

  // Attach local stream
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, camOff, callStatus]);

  // Attach remote stream
  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, callStatus]);

  // Call duration counter
  useEffect(() => {
    if (callStatus === 'connected') {
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
    } else {
      clearInterval(timerRef.current);
      setDuration(0);
    }
    return () => clearInterval(timerRef.current);
  }, [callStatus]);

  // Accept incoming call
  const handleAnswer = async () => {
    stopCallRingtone();
    setCallStatus('connected');
    try {
      const { localStream: ls } = await answerCall(incomingCallObj, isVideo);
      if (ls) setLocalStream(ls);
      if (incomingCallObj && typeof incomingCallObj.on === 'function') {
        incomingCallObj.on('stream', rs => setRemoteStream(rs));
      }
    } catch (_e) {}
  };

  // Decline incoming call
  const handleDecline = () => {
    stopCallRingtone();
    playCallEndBeep();
    try { incomingCallObj?.close(); } catch (_e) {}
    endCall();
    onCallEnd?.();
  };

  // Terminate active call
  const handleEndCall = () => {
    stopCallRingtone();
    playCallEndBeep();
    endCall();
    setCallStatus('disconnected');
    setRemoteStream(null);
    setLocalStream(null);
    onCallEnd?.();
  };

  // Toggle Mute
  const handleToggleMute = () => {
    const unmuted = toggleMute();
    setMuted(!unmuted);
  };

  // Toggle Camera
  const handleToggleCamera = () => {
    const activeState = toggleCamera();
    setCamOff(!activeState);
  };

  // Switch / Flip Camera
  const handleSwitchCamera = async () => {
    const newStream = await switchCamera();
    if (newStream) {
      setLocalStream(newStream);
    }
  };

  if (!active && !incoming) return null;

  return (
    <>
      <style>{`
        .call-fullscreen-modal {
          position: fixed; inset: 0; zIndex: 99999;
          background: #0b0714;
          display: flex; flex-direction: column;
          align-items: center; justify-content: space-between;
          overflow: hidden; font-family: system-ui, -apple-system, sans-serif;
          user-select: none;
        }
        .call-bg-glow {
          position: absolute; inset: 0; pointer-events: none;
          background: radial-gradient(circle at 50% 30%, rgba(255,107,53,0.18) 0%, rgba(11,7,20,0.95) 70%);
          z-index: 1;
        }
        .call-ring-wave {
          position: absolute; width: 140px; height: 140px;
          border-radius: 50%; border: 2px solid rgba(67,233,123,0.6);
          animation: pulseWave 2s cubic-bezier(0.2, 0.8, 0.2, 1) infinite;
        }
        .wave-2 {
          animation-delay: 0.6s;
          border-color: rgba(255,163,102,0.5);
        }
        @keyframes pulseWave {
          0% { transform: scale(0.9); opacity: 0.9; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        .call-action-btn {
          width: 58px; height: 58px; border-radius: 50%;
          border: none; display: flex; align-items: center;
          justify-content: center; cursor: pointer;
          transition: transform 0.18s cubic-bezier(0.4, 0, 0.2, 1), background 0.18s;
          box-shadow: 0 4px 20px rgba(0,0,0,0.4);
        }
        .call-action-btn:hover { transform: scale(1.08); }
        .call-action-btn:active { transform: scale(0.94); }
        .pip-box {
          position: absolute; top: 1.2rem; right: 1.2rem;
          width: 120px; height: 165px; border-radius: 16px;
          overflow: hidden; border: 2px solid rgba(255,255,255,0.25);
          box-shadow: 0 10px 30px rgba(0,0,0,0.6); z-index: 20;
          background: #1a1028; transition: all 0.3s;
        }
        .pip-minimized {
          width: 50px; height: 50px; border-radius: 50%;
        }
      `}</style>

      <div className="call-fullscreen-modal">
        <div className="call-bg-glow" />

        {/* ── Top Bar / Header ── */}
        <div style={{
          width: '100%', padding: '1.2rem 1.5rem', display: 'flex',
          justifyContent: 'space-between', alignItems: 'center',
          zIndex: 10, boxSizing: 'border-box',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.08)', padding: '0.35rem 0.8rem', borderRadius: '20px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <ShieldCheck size={14} color="#43e97b" />
            <span style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 600 }}>End-to-End Encrypted</span>
          </div>

          {callStatus === 'connected' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ background: 'rgba(0,0,0,0.5)', padding: '0.35rem 0.9rem', borderRadius: '20px', color: '#43e97b', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.05rem', border: '1px solid rgba(67,233,123,0.3)' }}>
                {formatDuration(duration)}
              </div>
              <button
                onClick={() => setShowPhrases(!showPhrases)}
                style={{
                  background: showPhrases ? 'var(--sakura-pink)' : 'rgba(255,255,255,0.12)',
                  color: showPhrases ? '#000' : '#fff', border: 'none',
                  borderRadius: '20px', padding: '0.35rem 0.8rem', cursor: 'pointer',
                  fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem',
                }}
              >
                <Sparkles size={13} /> Kannada Speak
              </button>
            </div>
          )}
        </div>

        {/* ── Main Call Body ── */}
        <div style={{
          flex: 1, width: '100%', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', zIndex: 10,
          position: 'relative', padding: '1rem', boxSizing: 'border-box',
        }}>
          {/* Incoming Call Screen */}
          {incoming && callStatus === 'ringing' && (
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.4rem' }}>
              <CallAvatar name={friendName} size={120} isRinging={true} />
              <div>
                <h2 style={{ color: '#fff', fontSize: '1.8rem', margin: '0 0 0.4rem', fontWeight: 800 }}>{friendName}</h2>
                <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.95rem' }}>
                  Incoming {isVideo ? 'Video' : 'Voice'} Call...
                </div>
              </div>
            </div>
          )}

          {/* Outgoing Ringing Screen */}
          {!incoming && callStatus === 'ringing' && (
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.4rem' }}>
              <CallAvatar name={friendName} size={120} isRinging={true} />
              <div>
                <h2 style={{ color: '#fff', fontSize: '1.8rem', margin: '0 0 0.4rem', fontWeight: 800 }}>{friendName}</h2>
                <div style={{ color: 'var(--sakura-pink)', fontSize: '0.95rem', fontWeight: 600 }}>
                  Ringing {isVideo ? 'Video' : 'Voice'} Call...
                </div>
              </div>
            </div>
          )}

          {/* Connected Call Screen */}
          {callStatus === 'connected' && (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              {/* Fullscreen Video / Avatar display */}
              {isVideo && remoteStream ? (
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '24px' }}
                />
              ) : (
                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                  <CallAvatar name={friendName} size={130} />
                  <div>
                    <h2 style={{ color: '#fff', fontSize: '1.7rem', margin: '0 0 0.3rem', fontWeight: 800 }}>{friendName}</h2>
                    <div style={{ color: '#43e97b', fontSize: '0.85rem', fontWeight: 700 }}>
                      HD {isVideo ? 'Video' : 'Voice'} Connected
                    </div>
                  </div>
                </div>
              )}

              {/* Local Self-View PiP */}
              {isVideo && localStream && (
                <div className={`pip-box ${pipMinimized ? 'pip-minimized' : ''}`}>
                  {!camOff ? (
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.2rem', fontWeight: 800 }}>
                      {(user?.name || 'You')[0].toUpperCase()}
                    </div>
                  )}
                  <button
                    onClick={() => setPipMinimized(!pipMinimized)}
                    style={{
                      position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.6)',
                      border: 'none', borderRadius: '50%', color: '#fff', padding: 4, cursor: 'pointer',
                    }}
                  >
                    {pipMinimized ? <Maximize2 size={11} /> : <Minimize2 size={11} />}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Interactive Spoken Kannada Phrases Drawer during call */}
          {showPhrases && (
            <div style={{
              position: 'absolute', bottom: '6rem', left: '1rem', right: '1rem',
              maxWidth: '500px', margin: '0 auto', background: 'rgba(20,10,35,0.92)',
              backdropFilter: 'blur(20px)', border: '1px solid rgba(255,163,102,0.3)',
              borderRadius: '20px', padding: '1rem', zIndex: 30,
              boxShadow: '0 12px 40px rgba(0,0,0,0.8)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                <span style={{ color: 'var(--sakura-pink)', fontWeight: 800, fontSize: '0.85rem' }}>
                  🗣️ Spoken Kannada In-Call Practice
                </span>
                <button onClick={() => setShowPhrases(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '0.8rem' }}>
                  ✕
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
                {KANNADA_CALL_PHRASES.map((phrase, i) => (
                  <button
                    key={i}
                    onClick={() => speakKannada(phrase.kn)}
                    style={{
                      background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px', padding: '0.5rem 0.8rem', textAlign: 'left',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ color: '#fff', fontSize: '0.88rem', fontWeight: 700, fontFamily: 'Noto Sans Kannada, sans-serif' }}>{phrase.kn}</div>
                      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem' }}>{phrase.en}</div>
                    </div>
                    <Volume2 size={16} color="var(--sakura-pink)" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Bottom Action Control Bar ── */}
        <div style={{
          width: '100%', padding: '1.5rem 1rem 2rem', display: 'flex',
          justifyContent: 'center', alignItems: 'center', zIndex: 10,
          boxSizing: 'border-box',
        }}>
          {/* Incoming Call Buttons */}
          {incoming && callStatus === 'ringing' ? (
            <div style={{ display: 'flex', gap: '4rem', alignItems: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <button
                  onClick={handleDecline}
                  className="call-action-btn"
                  style={{ background: 'linear-gradient(135deg,#ff416c,#ff4b2b)', width: 68, height: 68 }}
                  title="Decline"
                >
                  <PhoneOff size={28} color="#fff" />
                </button>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', marginTop: '0.5rem' }}>Decline</div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <button
                  onClick={handleAnswer}
                  className="call-action-btn"
                  style={{ background: 'linear-gradient(135deg,#38ef7d,#11998e)', width: 68, height: 68 }}
                  title="Accept"
                >
                  <PhoneCall size={28} color="#fff" />
                </button>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', marginTop: '0.5rem' }}>Accept</div>
              </div>
            </div>
          ) : (
            /* Active / Outgoing Call Controls in Frosted Pill */
            <div style={{
              background: 'rgba(25,12,38,0.75)', backdropFilter: 'blur(20px)',
              borderRadius: '50px', padding: '0.6rem 1.4rem',
              display: 'flex', gap: '1rem', alignItems: 'center',
              border: '1px solid rgba(255,255,255,0.15)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}>
              {/* Mic Toggle */}
              <button
                onClick={handleToggleMute}
                className="call-action-btn"
                style={{ background: muted ? '#ef4444' : 'rgba(255,255,255,0.14)', color: '#fff' }}
                title={muted ? 'Unmute Mic' : 'Mute Mic'}
              >
                {muted ? <MicOff size={22} /> : <Mic size={22} />}
              </button>

              {/* Video Toggle */}
              {isVideo && (
                <button
                  onClick={handleToggleCamera}
                  className="call-action-btn"
                  style={{ background: camOff ? '#ef4444' : 'rgba(255,255,255,0.14)', color: '#fff' }}
                  title={camOff ? 'Turn Video On' : 'Turn Video Off'}
                >
                  {camOff ? <VideoOff size={22} /> : <Video size={22} />}
                </button>
              )}

              {/* Switch Camera */}
              {isVideo && !camOff && (
                <button
                  onClick={handleSwitchCamera}
                  className="call-action-btn"
                  style={{ background: 'rgba(255,255,255,0.14)', color: '#fff' }}
                  title="Flip Camera"
                >
                  <SwitchCamera size={22} />
                </button>
              )}

              {/* End Call */}
              <button
                onClick={handleEndCall}
                className="call-action-btn"
                style={{ background: 'linear-gradient(135deg,#ff416c,#ff4b2b)', width: 62, height: 62 }}
                title="End Call"
              >
                <PhoneOff size={26} color="#fff" />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
