import React, { useState } from 'react';
import { Users, Volume2, Send, MessageSquare, Radio, BookOpen, Laptop } from 'lucide-react';

const CHANNELS = [
  { id: 'general', name: 'ಬೆಂಗಳೂರು ಕನ್ನಡಿಗರು (Bengaluru Hub)', icon: Users, members: 1420 },
  { id: 'tech', name: 'Techies Learning Kannada', icon: Laptop, members: 890 },
  { id: 'grammar', name: 'ವ್ಯಾಕರಣ ಮತ್ತು ಕಾವ್ಯ (Grammar & Literature)', icon: BookOpen, members: 560 }
];

const INITIAL_MESSAGES = [
  {
    role: 'ಕಲಿಕಾರ್ಥಿ (Learner)',
    textKn: 'ಎಲ್ಲರಿಗೂ ಶುಭ ಮುಂಜಾನೆ! ಇವತ್ತು ಯಾವ ಪಾಠ ಕಲಿಯುತ್ತಿದ್ದೀರಿ?',
    textEn: 'Good morning everyone! What lesson are you learning today?',
    time: '09:15 AM'
  },
  {
    role: 'ಸಹಪಾಠಿ (Peer Learner)',
    textKn: 'ನಾನು ಇವತ್ತು ಆಟೋ ಚೌಕಾಶಿ ಪಾಠ ಮುಗಿಸಿದೆ, ತುಂಬಾ ಉಪಯುಕ್ತ!',
    textEn: 'I finished the auto bargain lesson today, very useful!',
    time: '09:22 AM'
  },
  {
    role: 'ಭಾಷಾ ಮಾರ್ಗದರ್ಶಿ (Community Guide)',
    textKn: 'ಸಿರಿಗನ್ನಡಂ ಗೆಲ್ಗೆ! ನಿಮ್ಮ ದೈನಂದಿನ ಅಭ್ಯಾಸವನ್ನು ಮುಂದುವರಿಸಿ.',
    textEn: 'Victory to rich Kannada! Maintain your daily learning streak.',
    time: '09:40 AM'
  }
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
      role: 'ನೀವು (You)',
      textKn: inputMsg.trim(),
      textEn: 'Your message shared with the community',
      time: 'Just now'
    };

    setMessages(m => [...m, newMsg]);
    setInputMsg('');
    if (onXP) onXP(10);
    if (onToast) onToast('Message posted in Study Circle! +10 XP', 'xp');
  }

  return (
    <div className="learning-screen">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ background: 'linear-gradient(135deg,#ff6b35,#ffa366)', borderRadius: '12px', padding: '0.6rem', display: 'flex' }}>
            <Users size={22} color="#fff" />
          </div>
          <div>
            <h1 className="page-title" style={{ margin: 0, fontSize: '1.4rem' }}>ಅಧ್ಯಯನ ಕೂಟ · Study Circles</h1>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>Community practice & language exchange</p>
          </div>
        </div>
        <span style={{ fontSize: '0.85rem', color: '#4ade80', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Radio size={14} /> Live Community
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 1fr) 2.5fr', gap: '1.2rem' }}>
        {/* Channel List */}
        <div className="glass-card" style={{ padding: '1.2rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.8rem', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <MessageSquare size={16} /> STUDY CHANNELS:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {CHANNELS.map(c => {
              const ChannelIcon = c.icon;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveChannel(c.id)}
                  style={{
                    padding: '0.8rem',
                    borderRadius: '10px',
                    border: activeChannel === c.id ? '1px solid var(--sakura-pink)' : '1px solid rgba(255,255,255,0.1)',
                    background: activeChannel === c.id ? 'rgba(255,163,102,0.15)' : 'rgba(255,255,255,0.03)',
                    color: 'inherit',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <ChannelIcon size={15} color="var(--sakura-pink)" /> {c.name}
                  </div>
                  <div style={{ fontSize: '0.72rem', opacity: 0.6, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Users size={12} /> {c.members} learners
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat Feed */}
        <div className="glass-card" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', height: '520px' }}>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.8rem', paddingRight: '0.5rem' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ padding: '0.9rem 1.1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.82rem', color: 'var(--sakura-pink)' }}>{m.role}</span>
                  <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>{m.time}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontFamily: 'Noto Sans Kannada, sans-serif', fontSize: '1.05rem', fontWeight: 700 }}>
                    {m.textKn}
                  </div>
                  <button onClick={() => speak(m.textKn)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sakura-pink)', padding: '0.2rem', display: 'flex' }} title="Listen audio">
                    <Volume2 size={18} />
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
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid var(--glass-border)',
                color: '#fff',
                fontFamily: 'Noto Sans Kannada, sans-serif',
                outline: 'none',
              }}
            />
            <button className="btn-primary" type="submit" style={{ padding: '0 1.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Send size={16} /> Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
