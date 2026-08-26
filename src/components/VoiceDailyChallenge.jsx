import React, { useState } from 'react';

const DAILY_PROMPTS = [
  {
    wordKn: 'ಕೃತಜ್ಞತೆ (Krutajnate)',
    meaning: 'Gratitude / Thankfulness',
    sentenceKn: 'ನಿಮ್ಮ ಸಹಾಯಕ್ಕೆ ನನ್ನ ಹೃತ್ಪೂರ್ವಕ ಕೃತಜ್ಞತೆಗಳು.',
    sentenceEn: 'My heartfelt gratitude for your help.',
    streakBonus: '+50 XP'
  },
  {
    wordKn: 'ಸ್ನೇಹ (Sneha)',
    meaning: 'Friendship',
    sentenceKn: 'ನಿಜವಾದ ಸ್ನೇಹ ಜೀವನದ ದೊಡ್ಡ ಸಂಪತ್ತು.',
    sentenceEn: 'True friendship is life`s greatest wealth.',
    streakBonus: '+50 XP'
  }
];

export default function VoiceDailyChallenge({ onXP, onToast }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const [peerClips, setPeerClips] = useState([
    { name: 'Pooja (Bengaluru)', time: '10m ago', likes: 14 },
    { name: 'Kiran (Mangaluru)', time: '25m ago', likes: 9 },
    { name: 'Ananya (Mysuru)', time: '1h ago', likes: 23 }
  ]);

  const prompt = DAILY_PROMPTS[0];

  function speak(text) {
    if (!window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'kn-IN';
    u.rate = 0.85;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  function handleRecord() {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      setRecorded(true);
      onXP && onXP(50);
      onToast && onToast('🎙️ Daily Voice Note published! +50 XP 🌟', 'xp');
    }, 3000);
  }

  return (
    <div className="learning-screen">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
        <h1 className="page-title">🎙️ ದೈನಂದಿನ ಧ್ವನಿ ಸವಾಲು · Voice Daily Challenge</h1>
        <span style={{ color: '#f59e0b', fontWeight: 800 }}>🔥 Daily Streak</span>
      </div>

      <div className="glass-card" style={{ maxWidth: 640, margin: '0 auto', padding: '2rem', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.8rem', color: '#ffa366', fontWeight: 800, marginBottom: '0.4rem' }}>TODAY`S VOICE PROMPT:</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <div style={{ fontFamily: 'Noto Sans Kannada, sans-serif', fontSize: '1.8rem', fontWeight: 900, color: '#ffedd5' }}>
              {prompt.wordKn}
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>{prompt.meaning}</div>
          </div>
          <button className="btn-primary" onClick={() => speak(prompt.sentenceKn)} style={{ padding: '0.5rem 1rem' }}>
            🔊 Hear Native
          </button>
        </div>

        <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.06)', borderRadius: '12px', marginBottom: '1.5rem' }}>
          <div style={{ fontFamily: 'Noto Sans Kannada, sans-serif', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.2rem' }}>
            "{prompt.sentenceKn}"
          </div>
          <div style={{ fontSize: '0.82rem', opacity: 0.75 }}>
            "{prompt.sentenceEn}"
          </div>
        </div>

        {/* Record Zone */}
        <div style={{ textAlign: 'center' }}>
          {!recorded ? (
            <button
              className="btn-primary"
              onClick={handleRecord}
              disabled={isRecording}
              style={{
                padding: '1rem 2.5rem',
                fontSize: '1.05rem',
                background: isRecording ? '#ef4444' : 'linear-gradient(135deg, #f59e0b, #ef4444)'
              }}
            >
              {isRecording ? '🔴 Recording (3s)...' : '🎙️ Record Daily Voice Note (+50 XP)'}
            </button>
          ) : (
            <div style={{ padding: '1rem', background: 'rgba(74, 222, 128, 0.15)', border: '1px solid rgba(74, 222, 128, 0.35)', borderRadius: '12px' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>🎉✅</div>
              <div style={{ fontWeight: 800, color: '#4ade80' }}>Your voice note is shared with the community!</div>
            </div>
          )}
        </div>
      </div>

      {/* Community Voice Feed */}
      <div className="glass-card" style={{ maxWidth: 640, margin: '0 auto', padding: '1.5rem' }}>
        <div style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.8rem' }}>👥 Community Submissions:</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {peerClips.map((c, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.04)', borderRadius: '10px' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{c.name}</div>
                <div style={{ fontSize: '0.72rem', opacity: 0.5 }}>{c.time}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <button onClick={() => speak(prompt.sentenceKn)} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: 'inherit', borderRadius: '8px', padding: '0.3rem 0.6rem', cursor: 'pointer' }}>
                  ▶ Play
                </button>
                <span style={{ fontSize: '0.85rem' }}>❤️ {c.likes}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
