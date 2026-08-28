import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Phone, PhoneCall, PhoneOff, Video, VideoOff, Mic, MicOff, X } from 'lucide-react';
import { answerCall, endCall, toggleMute, toggleCamera, callFriend } from '../utils/webrtcService.js';

const GRAD_COLORS = [
  'linear-gradient(135deg,#ff6b35,#ffa366)',
  'linear-gradient(135deg,#4facfe,#00f2fe)',
  'linear-gradient(135deg,#43e97b,#38f9d7)',
  'linear-gradient(135deg,#f093fb,#f5576c)',
];

function BigAvatar({ name, size = 110 }) {
  const idx = ((name || '?').charCodeAt(0)) % GRAD_COLORS.length;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: GRAD_COLORS[idx],
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 900, color: '#fff', fontSize: size * 0.38,
      boxShadow: `0 0 0 6px rgba(255,255,255,0.1), 0 0 0 12px rgba(255,255,255,0.05)`,
      animation: 'pulse-ring 2s infinite',
    }}>
      {(name || '?')[0].toUpperCase()}
    </div>
  );
}

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

export default function CallScreen({ user, callState, onCallEnd }) {
  const [muted, setMuted]       = useState(false);
  const [camOff, setCamOff]     = useState(false);
  const [duration, setDuration] = useState(0);
  const [callActive, setCallActive] = useState(false);
  const [remoteStream, setRemoteStream] = useState(null);
  const [localStream, setLocalStream]   = useState(null);

  const localVideoRef  = useRef(null);
  const remoteVideoRef = useRef(null);
  const timerRef       = useRef(null);

  const { active, incoming, type, friendName, incomingCallObj, friendCode } = callState || {};

  // Attach streams to video elements
  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Timer for active call
  useEffect(() => {
    if (callActive) {
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
    } else {
      clearInterval(timerRef.current);
      setDuration(0);
    }
    return () => clearInterval(timerRef.current);
  }, [callActive]);

  const handleAnswer = async () => {
    try {
      const { localStream: ls } = await answerCall(incomingCallObj, type === 'video');
      setLocalStream(ls);
      setCallActive(true);
      // Listen for remote stream
      incomingCallObj.on('stream', rs => setRemoteStream(rs));
    } catch (e) {
      onCallEnd?.();
    }
  };

  const handleDecline = () => {
    try { incomingCallObj?.close(); } catch { /* ignore */ }
    onCallEnd?.();
  };

  const handleEndCall = () => {
    endCall();
    setCallActive(false);
    setRemoteStream(null);
    setLocalStream(null);
    onCallEnd?.();
  };

  const handleMute = () => {
    const unmuted = toggleMute();
    setMuted(!unmuted);
  };

  const handleCamera = () => {
    const on = toggleCamera();
    setCamOff(!on);
  };

  if (!active && !incoming) return null;

  return (
    <>
      <style>{`
        @keyframes pulse-ring {
          0%   { box-shadow: 0 0 0 0 rgba(255,163,102,0.6), 0 0 0 6px rgba(255,163,102,0.2); }
          70%  { box-shadow: 0 0 0 20px rgba(255,163,102,0), 0 0 0 30px rgba(255,163,102,0); }
          100% { box-shadow: 0 0 0 0 rgba(255,163,102,0), 0 0 0 6px rgba(255,163,102,0.1); }
        }
        @keyframes ring-scale {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.08); }
        }
      `}</style>
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(20px)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        {/* INCOMING CALL */}
        {incoming && !callActive && (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.2rem' }}>
            <div style={{ animation: 'ring-scale 1.5s infinite' }}>
              <BigAvatar name={friendName} size={120} />
            </div>
            <div>
              <div style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 800 }}>{friendName}</div>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '1rem', marginTop: '0.3rem' }}>
                Incoming {type === 'video' ? 'Video' : 'Voice'} Call…
              </div>
            </div>
            <div style={{ display: 'flex', gap: '2.5rem', marginTop: '1rem' }}>
              <div style={{ textAlign: 'center' }}>
                <button onClick={handleDecline} style={{ width: 70, height: 70, borderRadius: '50%', background: 'linear-gradient(135deg,#ff5858,#ff1c1c)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 24px rgba(255,88,88,0.5)' }}>
                  <PhoneOff size={28} color="#fff" />
                </button>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', marginTop: '0.5rem' }}>Decline</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <button onClick={handleAnswer} style={{ width: 70, height: 70, borderRadius: '50%', background: 'linear-gradient(135deg,#43e97b,#38f9d7)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 24px rgba(67,233,123,0.5)' }}>
                  <PhoneCall size={28} color="#fff" />
                </button>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', marginTop: '0.5rem' }}>Answer</div>
              </div>
            </div>
          </div>
        )}

        {/* ACTIVE CALL */}
        {(active || callActive) && (
          <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Remote Video */}
            {type === 'video' && remoteStream ? (
              <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <BigAvatar name={friendName} size={120} />
                <div style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 700 }}>{friendName}</div>
                <div style={{ color: '#43e97b', fontSize: '1rem' }}>{formatDuration(duration)}</div>
              </div>
            )}

            {/* Local Video PiP */}
            {type === 'video' && localStream && (
              <video ref={localVideoRef} autoPlay playsInline muted style={{
                position: 'absolute', bottom: '5rem', right: '1rem',
                width: 130, height: 90, borderRadius: '12px', objectFit: 'cover',
                border: '2px solid rgba(255,255,255,0.3)', boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
              }} />
            )}

            {/* Timer overlay for video call */}
            {type === 'video' && (
              <div style={{ position: 'absolute', top: '1.5rem', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.55)', borderRadius: '20px', padding: '0.4rem 1.1rem', color: '#fff', fontWeight: 700, fontSize: '1rem' }}>
                {friendName} · {formatDuration(duration)}
              </div>
            )}

            {/* Controls */}
            <div style={{
              position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
              background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(12px)',
              borderRadius: '60px', padding: '0.7rem 1.8rem',
              display: 'flex', gap: '1.2rem', alignItems: 'center',
              border: '1px solid rgba(255,255,255,0.12)',
            }}>
              <button onClick={handleMute} title={muted ? 'Unmute' : 'Mute'} style={{ background: muted ? 'rgba(255,88,88,0.3)' : 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '50%', width: 52, height: 52, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: muted ? '#ff5858' : '#fff' }}>
                {muted ? <MicOff size={22} /> : <Mic size={22} />}
              </button>
              {type === 'video' && (
                <button onClick={handleCamera} title={camOff ? 'Turn on camera' : 'Turn off camera'} style={{ background: camOff ? 'rgba(255,88,88,0.3)' : 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '50%', width: 52, height: 52, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: camOff ? '#ff5858' : '#fff' }}>
                  {camOff ? <VideoOff size={22} /> : <Video size={22} />}
                </button>
              )}
              <button onClick={handleEndCall} title="End Call" style={{ background: 'linear-gradient(135deg,#ff5858,#ff1c1c)', border: 'none', borderRadius: '50%', width: 62, height: 62, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(255,88,88,0.5)' }}>
                <PhoneOff size={26} color="#fff" />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
