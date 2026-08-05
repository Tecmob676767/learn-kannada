import React from 'react';

const ALL_BADGES = [
  { id: 'first_login', icon: '🌱', name: 'First Step', desc: 'Logged in for the first time' },
  { id: 'alphabet_done', icon: '🔡', name: 'Akshara Scholar', desc: 'Explored Varnamale alphabets' },
  { id: 'kagunita_done', icon: '📊', name: 'Kagunita Master', desc: 'Explored the full Kagunita grid' },
  { id: 'vocab_10', icon: '📚', name: 'Word Collector', desc: 'Studied 10+ vocabulary cards' },
  { id: 'streak_3', icon: '🔥', name: 'On Fire', desc: '3-day learning streak' },
  { id: 'streak_7', icon: '⚡', name: 'Lightning Learner', desc: '7-day learning streak' },
  { id: 'quiz_perfect', icon: '💯', name: 'Perfect Score', desc: 'Got 100% on any quiz' },
  { id: 'auto_convo', icon: '🛺', name: 'Auto Raja', desc: 'Completed Auto-rickshaw conversation' },
  { id: 'darshini_convo', icon: '🍛', name: 'Darshini Master', desc: 'Ordered food in Kannada' },
  { id: 'literature_done', icon: '📜', name: 'Basavanna\'s Legacy', desc: 'Read all Vachanas' },
  { id: 'level_5', icon: '⭐', name: 'Namma Local', desc: 'Reached Level 5' },
  { id: 'level_10', icon: '👑', name: 'Kannada Kovida', desc: 'Reached Level 10 — Mastery!' },
];

const Achievements = ({ user }) => {
  const earned = user?.badges || [];
  const unlocked = ALL_BADGES.filter(b => earned.includes(b.id));
  const locked = ALL_BADGES.filter(b => !earned.includes(b.id));

  return (
    <div className="learning-screen">
      <div className="page-header">
        <h2>🏅 Achievements</h2>
        <p>{earned.length} / {ALL_BADGES.length} badges earned. Keep learning to unlock more!</p>
      </div>

      {unlocked.length > 0 && (
        <>
          <h3 style={{ fontWeight: 700, color: 'var(--gold)', marginBottom: '1rem', fontSize: '1rem' }}>
            ✨ Unlocked ({unlocked.length})
          </h3>
          <div className="badges-grid" style={{ marginBottom: '2rem' }}>
            {unlocked.map(b => (
              <div key={b.id} className="badge-card unlocked">
                <span className="badge-icon">{b.icon}</span>
                <div className="badge-name">{b.name}</div>
                <div className="badge-desc">{b.desc}</div>
              </div>
            ))}
          </div>
        </>
      )}

      <h3 style={{ fontWeight: 700, color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '1rem' }}>
        🔒 Locked ({locked.length})
      </h3>
      <div className="badges-grid">
        {locked.map(b => (
          <div key={b.id} className="badge-card locked">
            <span className="badge-icon">{b.icon}</span>
            <div className="badge-name">{b.name}</div>
            <div className="badge-desc">{b.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Achievements;
