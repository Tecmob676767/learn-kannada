import React, { useState } from 'react';

const CHANNELS = [
  { id: 'general', name: '🌸 ಬೆಂಗಳೂರು ಕನ್ನಡಿಗರು (Bengaluru Hub)', members: 1420 },
  { id: 'tech', name: '💻 Techies Learning Kannada', members: 890 },
  { id: 'grammar', name: '📚 ವ್ಯಾಕರಣ ಮತ್ತು ಕಾವ್ಯ (Grammar & Literature)', members: 560 }
];

const INITIAL_MESSAGES = [
  { user: 'Deepa (Mysuru)', textKn: 'ಎಲ್ಲರಿಗೂ ಶುಭ ಮುಂಜಾನೆ! ಇವತ್ತು ಯಾವ ಪಾಠ ಕಲಿಯುತ್ತಿದ್ದೀರಿ?', textEn: 'Good morning everyone! What lesson are you learning today?', time: '09:15 AM' },
  { user: 'Arjun (Whitefield)', textKn: 'ನಾನು ಇವತ್ತು ಆಟೋ ಚೌಕಾಶಿ ಪಾಠ ಮುಗಿಸಿದೆ, ತುಂಬಾ ಉಪಯುಕ್ತ!', textEn: 'I finished the auto bargain lesson today, very useful!', time: '09:22 AM' },
  { user: 'Sujay (Founder)', textKn: 'ಸಿರಿಗನ್ನಡಂ ಗೆಲ್ಗೆ! ನಿಮ್ಮ ಸ್ಟ್ರೀಕ್ ಕಾಪಾಡಿಕೊಳ್ಳಿ 🔥', textEn: 'Victory to rich Kannada! Maintain your daily streak 🔥', time: '09:40 AM' }
];

export default function StudyCircles({ onXP, onToast }) {
  const [activeChannel, setActiveChannel] = useState(CHANNELS[0].id);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputMsg, setInputMsg] = useState('');

  function speak(text) {
    if (!window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'kn-IN';
    u.rate = 0.85;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  function handleSend(e) {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const newMsg = {
      user: 'You (ಕಲಿಕಾರ್ಥಿ)',
      textKn: inputMsg,
      textEn: 'Your message shared with the community',
      time: 'Just now'
    };

    setMessages(m => [...m, newMsg]);
    setInputMsg('');
    onXP && onXP(10);
    onToast && onToast('💬 Message posted in Study Circle! +10 XP', 'xp');
  }

  return (
    <div className="learning-screen">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
        <h1 className="page-title">👥 ಅಧ್ಯಯನ ಕೂಟ · Language Circles</h1>
        <span style={{ fontSize: '0.85rem', color: '#4ade80', fontWeight: 700 }}>🟢 Live Community</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 2.5fr', gap: '1.2rem' }}>
        {/* Channel List */}
        <div className="glass-card" style={{ padding: '1.2rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.8rem', opacity: 0.8 }}>STUDY CHANNELS:</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {CHANNELS.map(c => (
              <button
                key={c.id}
                onClick={() => setActiveChannel(c.id)}
                style={{
                  padding: '0.8rem',
                  borderRadius: '10px',
                  border: activeChannel === c.id ? '1px solid #ffa366' : '1px solid rgba(255,255,255,0.1)',
                  background: activeChannel === c.id ? 'rgba(255,163,102,0.15)' : 'rgba(255,255,255,0.03)',
                  color: 'inherit',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{c.name}</div>
                <div style={{ fontSize: '0.72rem', opacity: 0.6, marginTop: '2px' }}>👥 {c.members} learners</div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Feed */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '520px' }}>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.8rem', paddingRight: '0.5rem' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ padding: '0.9rem 1.1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#ffa366' }}>{m.user}</span>
                  <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>{m.time}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontFamily: 'Noto Sans Kannada, sans-serif', fontSize: '1.05rem', fontWeight: 700 }}>
                    {m.textKn}
                  </div>
                  <button onClick={() => speak(m.textKn)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}>
                    🔊
                  </button>
                </div>
                <div style={{ fontSize: '0.75rem', opacity: 0.65, marginTop: '2px' }}>{m.textEn}</div>
              </div>
            ))}
          </div>

          {/* Message Input Box */}
          <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.6rem', marginTop: '1rem' }}>
            <input
              type="text"
              placeholder="Type in Kannada or English..."
              value={inputMsg}
              onChange={e => setInputMsg(e.target.value)}
              style={{
                flex: 1,
                padding: '0.8rem 1rem',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'inherit',
                fontFamily: 'Noto Sans Kannada, sans-serif'
              }}
            />
            <button className="btn-primary" type="submit" style={{ padding: '0 1.5rem' }}>
              Send 🚀
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
