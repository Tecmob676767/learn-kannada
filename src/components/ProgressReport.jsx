import React, { useMemo } from 'react';
import { getActivityStats, getLevelTitle } from '../utils/storage.js';

const ProgressReport = ({ user }) => {
  const stats = useMemo(() => getActivityStats(), [user]);

  if (!stats) {
    return (
      <div className="learning-screen">
        <div className="page-header"><h2>📊 Progress Report</h2><p>Log in to view your stats.</p></div>
      </div>
    );
  }

  const maxDaily = Math.max(1, ...stats.dailyActivity.map(d => d.count));
  const maxModule = Math.max(1, ...stats.moduleBreakdown.map(m => m.count));
  const progressEntries = Object.entries(stats.progress).filter(([, v]) => v > 0);

  return (
    <div className="learning-screen">
      <div className="page-header">
        <h2>📊 Progress Report</h2>
        <p>Your learning journey at a glance — XP, streaks, sessions & more!</p>
      </div>

      {/* Summary cards */}
      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        {[
          { icon: '⭐', label: 'Total XP', value: stats.totalXP, color: '#ffd700' },
          { icon: '🔥', label: 'Day Streak', value: stats.streak, color: '#fb923c' },
          { icon: '📅', label: 'Weekly Sessions', value: stats.weeklySessions, color: '#4facfe' },
          { icon: '⏱', label: 'Weekly Time (min)', value: stats.weeklyTimeMin, color: '#86efac' },
          { icon: '✨', label: 'Weekly XP', value: stats.weeklyXP, color: '#f093fb' },
          { icon: '🏅', label: 'Badges', value: stats.badges, color: '#60a5fa' },
        ].map(s => (
          <div key={s.label} className="glass-card stat-card">
            <div className="stat-icon">{s.icon}</div>
            <span className="stat-value" style={{ color: s.color }}>{s.value}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {/* Weekly activity chart */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>📈 Weekly Activity</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: '140px' }}>
            {stats.dailyActivity.map(d => (
              <div key={d.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
                <div style={{
                  width: '100%',
                  height: `${Math.max(4, (d.count / maxDaily) * 100)}px`,
                  background: d.count > 0 ? 'linear-gradient(180deg, var(--sakura-pink), #f093fb)' : 'rgba(255,255,255,0.08)',
                  borderRadius: '6px 6px 0 0',
                  transition: 'height 0.4s ease',
                }} />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{d.label}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: d.count > 0 ? 'var(--gold)' : 'var(--text-muted)' }}>{d.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Module visits chart */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '0.5rem', fontSize: '1rem' }}>🎯 Most Practiced</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Top topic: <strong style={{ color: 'var(--sakura-pink)' }}>{stats.topModuleLabel}</strong>
          </p>
          {stats.moduleBreakdown.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Start exploring modules to see stats here!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {stats.moduleBreakdown.map(m => (
                <div key={m.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.82rem' }}>
                    <span>{m.label}</span>
                    <span style={{ color: 'var(--gold)', fontWeight: 700 }}>{m.count}</span>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${(m.count / maxModule) * 100}%`,
                      background: 'linear-gradient(90deg, #4facfe, #43e97b)',
                      borderRadius: '4px',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Module progress bars */}
      <div className="glass-card" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>📚 Module Progress</h3>
        {progressEntries.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>Complete lessons to track module progress.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {progressEntries.map(([key, pct]) => (
              <div key={key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.85rem', textTransform: 'capitalize' }}>
                  <span>{key}</span>
                  <span style={{ color: 'var(--gold)', fontWeight: 700 }}>{pct}%</span>
                </div>
                <div className="quiz-progress-bar">
                  <div className="quiz-progress-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Level summary */}
      <div className="glass-card" style={{ padding: '1.5rem', marginTop: '1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎓</div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
          Level {stats.level} — {getLevelTitle(stats.level)}
        </h3>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
          Keep learning daily to maintain your {stats.streak}-day streak!
        </p>
      </div>
    </div>
  );
};

export default ProgressReport;
