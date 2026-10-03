import React, { useState, useEffect } from 'react';

// Seeded random for consistent per-user weak area scores
const seededRand = (seed, i) => {
  const x = Math.sin(seed * 1000 + i) * 10000;
  return Math.abs(x - Math.floor(x));
};

const MODULES = [
  { key: 'quiz', label: '⚡ Quiz Drills', icon: '📝' },
  { key: 'pronunciation', label: '🗣️ Pronunciation', icon: '🎙️' },
  { key: 'grammar', label: '🧩 Grammar', icon: '📚' },
  { key: 'vocabulary', label: '💬 Vocabulary', icon: '🔤' },
  { key: 'script', label: '✍️ Script Writing', icon: '✏️' },
];

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const BADGE_DESC = {
  first_login: { label: '🌱 First Step', desc: 'Logged in for the first time' },
  streak_3: { label: '🔥 On Fire', desc: '3-day learning streak' },
  streak_7: { label: '⚡ Lightning Learner', desc: '7-day learning streak' },
};

const AnalyticsDashboard = ({ user }) => {
  const xp = user?.xp || 0;
  const level = user?.level || Math.floor(xp / 500) + 1;
  const streak = user?.streak || 0;
  const badges = user?.badges || [];
  const xpInLevel = xp % 500;
  const xpProgress = (xpInLevel / 500) * 100;

  // Seed for consistent per-user scores
  const seed = user?.code ? parseInt(user.code, 10) : 12345;

  const moduleScores = MODULES.map((m, i) => ({
    ...m,
    score: Math.round(40 + seededRand(seed, i) * 60), // 40-100%
  }));

  // Weekly activity bars: last 7 days, estimate from streak
  const today = new Date();
  const weekBars = DAYS.map((d, i) => {
    const daysAgo = 6 - i; // i=0 is 6 days ago, i=6 is today
    const active = daysAgo < streak || daysAgo === 0;
    const height = active ? 40 + seededRand(seed, i + 10) * 60 : seededRand(seed, i + 20) * 20;
    return { day: d, height: Math.round(height), active };
  });

  // Calendar: current month
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0=Sun
  const todayDate = today.getDate();
  const calendarDays = Array.from({ length: firstDayOfMonth }, () => null)
    .concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));

  const getCalendarDayColor = (d) => {
    if (!d) return 'transparent';
    if (d === todayDate) return '#ffa366';
    if (d > todayDate) return 'rgba(255,255,255,0.04)';
    const daysAgo = todayDate - d;
    if (daysAgo < streak) return '#22c55e';
    return 'rgba(255,255,255,0.06)';
  };

  // SVG ring
  const r = 52;
  const circ = 2 * Math.PI * r;
  const offset = circ - (xpProgress / 100) * circ;

  return (
    <div className="learning-screen" style={{ maxWidth: 900, margin: '0 auto', paddingBottom: '2rem' }}>
      {/* Header */}
      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
        <h1 style={{ margin: 0, fontSize: 'clamp(1.2rem, 4vw, 1.6rem)', fontWeight: 900 }}>
          ಕಲಿಕೆ ವಿಶ್ಲೇಷಣೆ 📊
        </h1>
        <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Your personal Kannada learning analytics — keep growing! 🌸
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {[
          { icon: '⭐', label: 'Total XP', value: xp.toLocaleString(), color: '#ffd700' },
          { icon: '🔥', label: 'Streak', value: `${streak} days`, color: '#ff7b54' },
          { icon: '🏆', label: 'Level', value: `Lv. ${level}`, color: '#a855f7' },
          { icon: '🎖️', label: 'Badges', value: badges.length, color: '#38bdf8' },
        ].map(s => (
          <div key={s.label} className="glass-card" style={{ padding: '1rem', textAlign: 'center', border: `1px solid ${s.color}33` }}>
            <div style={{ fontSize: '1.75rem' }}>{s.icon}</div>
            <div style={{ fontSize: 'clamp(1.1rem, 3vw, 1.5rem)', fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* XP Ring + Weekly Chart - 2 column grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
        {/* XP Progress Ring */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>XP Progress to Level {level + 1}</div>
          <svg width="130" height="130" viewBox="0 0 130 130">
            <circle cx="65" cy="65" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" />
            <circle
              cx="65" cy="65" r={r} fill="none"
              stroke="url(#xpGrad)" strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={offset}
              transform="rotate(-90 65 65)"
              style={{ transition: 'stroke-dashoffset 1s ease' }}
            />
            <defs>
              <linearGradient id="xpGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ffa366" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
            <text x="65" y="60" textAnchor="middle" fill="#fff" fontSize="22" fontWeight="900">Lv.{level}</text>
            <text x="65" y="80" textAnchor="middle" fill="#ffa366" fontSize="12">{xpInLevel}/500</text>
          </svg>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{Math.round(xpProgress)}% to next level</div>
        </div>

        {/* Weekly Bar Chart */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' }}>Weekly Activity</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: '100px', paddingBottom: '0.5rem' }}>
            {weekBars.map((b, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div
                  style={{
                    width: '100%', maxWidth: '32px', height: `${b.height}%`,
                    background: b.active
                      ? b.height > 70 ? 'linear-gradient(to top, #22c55e, #4ade80)'
                      : 'linear-gradient(to top, #ffa366, #ffb7c5)'
                      : 'rgba(255,255,255,0.1)',
                    borderRadius: '4px 4px 0 0',
                    minHeight: '4px',
                    transition: 'height 0.5s ease',
                  }}
                />
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{b.day}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Module Weakness Bars */}
      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
        <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '1rem' }}>⚠️ Areas to Strengthen</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {moduleScores.map(m => (
            <div key={m.key}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.85rem' }}>
                <span>{m.icon} {m.label.replace(m.icon + ' ', '')}</span>
                <span style={{ color: m.score < 60 ? '#ef4444' : m.score < 80 ? '#ffa366' : '#22c55e', fontWeight: 700 }}>
                  {m.score}% {m.score < 60 ? '⚠️ Needs Practice' : m.score < 80 ? '📈 Good' : '✨ Strong'}
                </span>
              </div>
              <div style={{ height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${m.score}%`,
                  background: m.score < 60 ? 'linear-gradient(90deg,#ef4444,#ff6b6b)'
                    : m.score < 80 ? 'linear-gradient(90deg,#ffa366,#ffb7c5)'
                    : 'linear-gradient(90deg,#22c55e,#4ade80)',
                  borderRadius: '4px', transition: 'width 1s ease',
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Streak Calendar + Badge Timeline - 2 col */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
        {/* Calendar */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem' }}>
            {today.toLocaleString('default', { month: 'long', year: 'numeric' })} Streak
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
            {['S','M','T','W','T','F','S'].map((d, i) => (
              <div key={i} style={{ fontSize: '0.6rem', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 700, paddingBottom: '2px' }}>{d}</div>
            ))}
            {calendarDays.map((d, i) => (
              <div
                key={i}
                style={{
                  aspectRatio: '1', borderRadius: '6px',
                  background: getCalendarDayColor(d),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.65rem', fontWeight: d === todayDate ? 900 : 600,
                  color: d === todayDate ? '#000' : d && getCalendarDayColor(d) === '#22c55e' ? '#fff' : 'rgba(255,255,255,0.6)',
                  border: d === todayDate ? '2px solid #ffa366' : 'none',
                }}
              >
                {d || ''}
              </div>
            ))}
          </div>
        </div>

        {/* Badge Timeline */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem' }}>🎖️ Your Badges</div>
          {badges.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', paddingTop: '1rem' }}>
              Complete lessons to earn your first badge! 🌸
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {badges.map((b, i) => {
                const info = BADGE_DESC[b] || { label: b, desc: 'Achievement unlocked' };
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem', borderRadius: '10px', background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.2)' }}>
                    <div style={{ fontSize: '1.3rem', flexShrink: 0 }}>⭐</div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#ffd700' }}>{info.label}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{info.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Smart Suggestions */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.75rem' }}>🧠 Smart Study Suggestions</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {moduleScores.filter(m => m.score < 70).map(m => (
            <div
              key={m.key}
              style={{
                padding: '0.5rem 1rem', borderRadius: '20px',
                background: 'rgba(255,107,53,0.15)', border: '1px solid rgba(255,107,53,0.3)',
                color: '#ffa366', fontSize: '0.82rem', fontWeight: 700,
              }}
            >
              📚 Practice {m.label.split(' ').slice(1).join(' ')} — only {m.score}%!
            </div>
          ))}
          {moduleScores.filter(m => m.score < 70).length === 0 && (
            <div style={{ color: '#22c55e', fontWeight: 700, fontSize: '0.85rem' }}>✨ All areas looking strong! Keep it up!</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
