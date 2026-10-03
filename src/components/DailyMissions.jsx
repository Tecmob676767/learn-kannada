import React, { useState, useEffect, useCallback } from 'react';

const MISSIONS_KEY = (date) => `sobagu_missions_${date}`;
const PUSH_PREFS_KEY = 'sobagu_push_prefs';
const LAST_REMINDER_KEY = 'sobagu_last_reminder_date';

const getTodayKey = () => new Date().toDateString();

const MISSION_DEFS = [
  {
    id: 'speak',
    icon: '\ud83d\udde3\ufe0f',
    title: 'Speak 5 Kannada Words',
    desc: 'Practice saying 5 Kannada words out loud',
    xp: 30,
    action: null,
    actionLabel: null,
  },
  {
    id: 'quiz',
    icon: '\u26a1',
    title: 'Complete a Quiz',
    desc: 'Score at least 5 questions in Quiz Drills',
    xp: 50,
    action: 'quizzes',
    actionLabel: '\ud83d\udcdd Go Practice',
  },
  {
    id: 'ai',
    icon: '\ud83e\udd16',
    title: 'Chat with Sobagu AI',
    desc: 'Have a 5-message conversation with your AI tutor',
    xp: 30,
    action: 'sobaguai',
    actionLabel: '\ud83c\udf38 Open AI Tutor',
  },
];

export const checkAndShowDailyReminder = (showToast) => {
  try {
    const prefs = JSON.parse(localStorage.getItem(PUSH_PREFS_KEY) || 'null');
    if (!prefs?.enabled || !prefs?.time) return;
    const [remHour, remMin] = prefs.time.split(':').map(Number);
    const now = new Date();
    const today = now.toDateString();
    const lastShown = localStorage.getItem(LAST_REMINDER_KEY);
    if (lastShown === today) return;
    if (now.getHours() >= remHour && (now.getHours() > remHour || now.getMinutes() >= remMin)) {
      showToast('\ud83d\udd14 \u0ca8\u0cbf\u0cae\u0ccd\u0cae \u0c95\u0ca8\u0ccd\u0ca8\u0ca1 \u0caa\u0ccd\u0cb0\u0caf\u0cbe\u0ca3 \u0c95\u0cbe\u0caf\u0cc1\u0ca4\u0ccd\u0ca4\u0cbf\u0ca6\u0cc6! Keep your streak alive! \ud83d\udd25', 'info');
      localStorage.setItem(LAST_REMINDER_KEY, today);
    }
  } catch (_) {}
};

const DailyMissions = ({ user, onXP, onToast, onNavigate }) => {
  const [missions, setMissions] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(MISSIONS_KEY(getTodayKey())) || '{}');
      return MISSION_DEFS.map(m => ({ ...m, done: !!saved[m.id], bonusClaimed: !!saved.bonusClaimed }));
    } catch {
      return MISSION_DEFS.map(m => ({ ...m, done: false }));
    }
  });
  const [bonusClaimed, setBonusClaimed] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(MISSIONS_KEY(getTodayKey())) || '{}');
      return !!saved.bonusClaimed;
    } catch { return false; }
  });
  const [pushGranted, setPushGranted] = useState(() => typeof Notification !== 'undefined' && Notification.permission === 'granted');
  const [pushPrefs, setPushPrefs] = useState(() => {
    try { return JSON.parse(localStorage.getItem(PUSH_PREFS_KEY) || 'null'); } catch { return null; }
  });
  const [reminderTime, setReminderTime] = useState('20:00');

  const completedCount = missions.filter(m => m.done).length;
  const allDone = completedCount === 3;

  const saveMissions = (updated, bonus) => {
    const toSave = {};
    updated.forEach(m => { toSave[m.id] = m.done; });
    if (bonus !== undefined) toSave.bonusClaimed = bonus;
    localStorage.setItem(MISSIONS_KEY(getTodayKey()), JSON.stringify(toSave));
  };

  const handleComplete = (id, xp) => {
    const updated = missions.map(m => m.id === id ? { ...m, done: true } : m);
    setMissions(updated);
    saveMissions(updated, bonusClaimed);
    onXP && onXP(xp);
    onToast && onToast(`+${xp} XP! Mission completed! \ud83c\udf38`, 'xp');
    const nowAllDone = updated.every(m => m.done);
    if (nowAllDone && !bonusClaimed) {
      setTimeout(() => {
        setBonusClaimed(true);
        saveMissions(updated, true);
        onXP && onXP(50);
        onToast && onToast('\ud83c\udf89 All missions complete! Bonus +50 XP!', 'xp');
      }, 600);
    }
  };

  const handleEnablePush = async () => {
    if (!('Notification' in window)) {
      onToast && onToast('Notifications not supported in this browser.', 'error');
      return;
    }
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      const prefs = { enabled: true, time: reminderTime };
      localStorage.setItem(PUSH_PREFS_KEY, JSON.stringify(prefs));
      setPushPrefs(prefs);
      setPushGranted(true);
      onToast && onToast(`\ud83d\udd14 Streak reminders active at ${reminderTime}! \ud83c\udf38`, 'success');
    } else {
      onToast && onToast('Notifications blocked. Enable in browser settings.', 'error');
    }
  };

  const handleDisablePush = () => {
    localStorage.removeItem(PUSH_PREFS_KEY);
    setPushPrefs(null);
    onToast && onToast('\ud83d\udd07 Reminders disabled.', 'info');
  };

  // Time until midnight
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const midnight = new Date(now); midnight.setHours(24, 0, 0, 0);
      const diff = midnight - now;
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(`${h}h ${m}m`);
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="learning-screen" style={{ maxWidth: 720, margin: '0 auto', paddingBottom: '2rem' }}>
      {/* Header */}
      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 'clamp(1.1rem, 4vw, 1.5rem)', fontWeight: 900 }}>
              \ud83c\udfaf Daily Missions
            </h1>
            <p style={{ margin: '0.2rem 0 0', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
              Complete all 3 to earn a bonus! Resets in {timeLeft}
            </p>
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#ffa366' }}>{completedCount}/3</div>
        </div>
        {/* Progress Bar */}
        <div style={{ marginTop: '0.75rem', height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(completedCount / 3) * 100}%`, background: 'linear-gradient(90deg, #ffa366, #a855f7)', borderRadius: '4px', transition: 'width 0.5s ease' }} />
        </div>
      </div>

      {/* Bonus Banner */}
      {allDone && (
        <div style={{ marginBottom: '1.25rem', padding: '1rem 1.5rem', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(255,215,0,0.2), rgba(255,107,53,0.2))', border: '1px solid rgba(255,215,0,0.4)', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem' }}>\ud83c\udf89</div>
          <div style={{ fontWeight: 900, fontSize: '1.1rem', color: '#ffd700' }}>All missions complete!</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{bonusClaimed ? 'Bonus +50 XP claimed!' : '+50 Bonus XP incoming!'}</div>
        </div>
      )}

      {/* Mission Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {missions.map(m => (
          <div key={m.id} className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', border: m.done ? '1px solid rgba(34,197,94,0.4)' : '1px solid rgba(255,255,255,0.08)', background: m.done ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.03)' }}>
            <div style={{ fontSize: '2rem', flexShrink: 0 }}>{m.icon}</div>
            <div style={{ flex: 1, minWidth: '140px' }}>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', textDecoration: m.done ? 'line-through' : 'none', color: m.done ? 'var(--text-muted)' : 'var(--text-primary)' }}>{m.title}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>{m.desc}</div>
              <div style={{ fontSize: '0.72rem', color: '#ffd700', marginTop: '4px', fontWeight: 700 }}>+{m.xp} XP</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
              {m.done ? (
                <span style={{ padding: '0.35rem 0.75rem', borderRadius: '20px', background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.4)', color: '#4ade80', fontSize: '0.8rem', fontWeight: 800 }}>\u2713 Done</span>
              ) : (
                <>
                  {m.action && onNavigate && (
                    <button
                      onClick={() => onNavigate(m.action)}
                      style={{ padding: '0.4rem 0.8rem', borderRadius: '10px', background: 'rgba(255,163,102,0.15)', border: '1px solid rgba(255,163,102,0.3)', color: '#ffa366', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      {m.actionLabel}
                    </button>
                  )}
                  <button
                    onClick={() => handleComplete(m.id, m.xp)}
                    className="btn-primary"
                    style={{ padding: '0.4rem 0.9rem', borderRadius: '10px', fontSize: '0.8rem' }}
                  >
                    \u2713 Mark Done
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Push Notification Setup */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '0.75rem' }}>\ud83d\udd14 Streak Reminders</div>
        {pushPrefs?.enabled ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
              <span style={{ color: '#4ade80', fontWeight: 700 }}>Reminders active at {pushPrefs.time}</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Change time:</label>
                <input type="time" value={pushPrefs.time} onChange={e => { const p = { ...pushPrefs, time: e.target.value }; localStorage.setItem(PUSH_PREFS_KEY, JSON.stringify(p)); setPushPrefs(p); }} className="form-input" style={{ padding: '0.35rem 0.6rem', fontSize: '0.85rem', borderRadius: '8px', width: 'auto' }} />
              </div>
              <button onClick={handleDisablePush} style={{ padding: '0.4rem 0.9rem', borderRadius: '10px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>Disable</button>
            </div>
          </div>
        ) : (
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Get a daily reminder so you never miss a streak day! \ud83d\udd25
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Remind me at:</label>
                <input type="time" value={reminderTime} onChange={e => setReminderTime(e.target.value)} className="form-input" style={{ padding: '0.35rem 0.6rem', fontSize: '0.85rem', borderRadius: '8px', width: 'auto' }} />
              </div>
              <button onClick={handleEnablePush} className="btn-primary" style={{ padding: '0.5rem 1.2rem', borderRadius: '10px', fontSize: '0.85rem' }}>
                \ud83d\udd14 Enable Reminders
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyMissions;
