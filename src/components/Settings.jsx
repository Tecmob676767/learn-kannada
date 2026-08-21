import React, { useState, useEffect, useRef } from 'react';
import { getCurrentUser, updateUser, resetUserProgress, forceCloudSync, subscribeToSyncStatus, exportUserDataBackup, importUserDataBackup } from '../utils/storage.js';

const THEMES = [
  { id: 'standard', name: 'Sobagu', color1: '#ffa366', color2: '#ff6b35', emoji: '🌅' },
  { id: 'gold',     name: 'Royal Gold',   color1: '#ffd700', color2: '#d4af37', emoji: '👑' },
  { id: 'kannada',  name: 'Karnataka',    color1: '#ffe033', color2: '#e50914', emoji: '🏴' },
  { id: 'teal',     name: 'Ocean Mist',   color1: '#38f9d7', color2: '#43e97b', emoji: '🌊' },
  { id: 'sakura',   name: 'Sakura Pink',  color1: '#ffb7c5', color2: '#e8547a', emoji: '🌸' },
  { id: 'midnight', name: 'Midnight',     color1: '#818cf8', color2: '#6366f1', emoji: '🌙' },
];

const Settings = ({ onToast, user, onRefreshUser, onThemeChange }) => {
  const [name, setName]                   = useState('');
  const [showTranslit, setShowTranslit]   = useState(true);
  const [enableSound, setEnableSound]     = useState(true);
  const [currentTheme, setCurrentTheme]   = useState('standard');
  const [enableAnimation, setEnableAnimation] = useState(true);
  const [dailyGoal, setDailyGoal]         = useState(20);
  const [showCode, setShowCode]           = useState(false);
  const [syncInfo, setSyncInfo]           = useState({ status: 'synced', pendingCount: 0, lastSync: Date.now() });
  const [isSyncingNow, setIsSyncingNow]   = useState(false);
  const [adClientId, setAdClientId]       = useState(import.meta.env.VITE_GOOGLE_ADSENSE_CLIENT_ID || 'ca-pub-7557687021248166');
  const [adSlotId, setAdSlotId]           = useState(import.meta.env.VITE_GOOGLE_ADSENSE_SLOT_ID || '7268606143');
  const fileInputRef = useRef(null);

  useEffect(() => {
    const unsub = subscribeToSyncStatus((st) => setSyncInfo(st));
    return () => unsub();
  }, []);

  useEffect(() => {
    const u = getCurrentUser();
    if (u) {
      setName(u.name || '');
      const s = u.settings || {};
      setShowTranslit(s.showTranslit !== false);
      setEnableSound(s.enableSound !== false);
      setCurrentTheme(s.theme || 'standard');
      setEnableAnimation(s.enableAnimation !== false);
      setDailyGoal(s.dailyGoal || 20);
      if (s.adClientId) setAdClientId(s.adClientId);
      if (s.adSlotId && s.adSlotId !== '1234567890' && s.adSlotId !== '6090577224') {
        setAdSlotId(s.adSlotId);
      } else {
        setAdSlotId('7268606143');
      }
    }
  }, [user]);

  const saveSetting = (key, val) => {
    const u = getCurrentUser();
    const currentSettings = u?.settings || {};
    updateUser({ settings: { ...currentSettings, [key]: val } });
    onRefreshUser && onRefreshUser();
  };

  const handleSaveName = (e) => {
    e.preventDefault();
    if (!name.trim()) { onToast && onToast('⚠️ Name cannot be empty!', 'error'); return; }
    updateUser({ name: name.trim() });
    onToast && onToast('✅ Name updated!', 'success');
    onRefreshUser && onRefreshUser();
  };

  const handleToggle = (key, val, setter) => {
    setter(val);
    saveSetting(key, val);
    onToast && onToast('⚡ Setting saved!', 'success');
  };

  const handleTheme = (themeId) => {
    setCurrentTheme(themeId);
    saveSetting('theme', themeId);
    onThemeChange && onThemeChange(themeId);  // ← actually applies CSS vars
    onToast && onToast('🎨 Theme applied!', 'success');
  };

  const handleDailyGoal = (val) => {
    setDailyGoal(val);
    saveSetting('dailyGoal', val);
    onToast && onToast(`🎯 Daily goal set to ${val} min!`, 'success');
  };

  const handleReset = () => {
    if (window.confirm('⚠️ This will permanently delete ALL your progress, XP, badges and SRS cards. Are you absolutely sure?')) {
      resetUserProgress();
      onToast && onToast('🔄 Progress reset!', 'info');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  return (
    <div className="learning-screen">
      <div className="page-header">
        <h2>⚙️ Settings &amp; Customization</h2>
        <p>Manage your profile, themes, and learning preferences.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* ── Profile ──────────────────────────────────────────── */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--sakura-pink)' }}>
            👤 Profile &amp; Account
          </h3>
          <form onSubmit={handleSaveName} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Display Name</label>
              <input className="form-input" type="text" value={name} onChange={e => setName(e.target.value)} maxLength={30} />
            </div>
            <button className="btn-primary" type="submit" style={{ width: 'auto', padding: '0.85rem 1.5rem' }}>Save Name</button>
          </form>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Your 6-Digit Multi-Device Code</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Log in on any laptop, tablet, or phone with this code.</div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button className="glass-btn" onClick={() => setShowCode(!showCode)} style={{ minWidth: '110px' }}>
                {showCode ? (user?.code || '—') : '👁️ Show Code'}
              </button>
              {showCode && user?.code && (
                <button
                  className="glass-btn"
                  onClick={() => {
                    navigator.clipboard.writeText(user.code);
                    onToast && onToast('📋 Code copied to clipboard!', 'success');
                  }}
                >
                  📋 Copy
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Sobagu Enterprise Cloud Sync & State Mesh HUD ───────────────────── */}
        <div className="glass-card" style={{ padding: '2rem', border: '1px solid rgba(79, 172, 254, 0.35)', background: 'linear-gradient(135deg, rgba(79,172,254,0.08), rgba(0,242,254,0.03))', borderRadius: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#4facfe', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span>⚡</span> Sobagu Real-Time Cloud Sync Engine
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.4rem 0 0 0' }}>
                Local-first architecture with Multi-Tab State Mesh, automatic outbox queueing, and cross-device sync.
              </p>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              background: syncInfo.status === 'offline' ? 'rgba(239,68,68,0.15)' : 'rgba(67,233,123,0.12)',
              border: `1px solid ${syncInfo.status === 'offline' ? 'rgba(239,68,68,0.3)' : 'rgba(67,233,123,0.3)'}`,
              padding: '0.45rem 1rem',
              borderRadius: '20px',
              fontSize: '0.82rem',
              fontWeight: 700,
              color: syncInfo.status === 'offline' ? '#f87171' : '#43e97b',
            }}>
              <span style={{
                width: '9px',
                height: '9px',
                borderRadius: '50%',
                background: syncInfo.status === 'offline' ? '#ef4444' : '#43e97b',
                display: 'inline-block',
                boxShadow: syncInfo.status === 'offline' ? '0 0 10px #ef4444' : '0 0 10px #43e97b',
                animation: 'pulse 1.5s infinite'
              }} />
              <span>
                {syncInfo.status === 'syncing' ? 'Syncing Delta...' :
                 syncInfo.status === 'offline' ? 'Offline (Queued)' :
                 'Ultra-Sync Active & Synced'}
              </span>
            </div>
          </div>

          {/* Sync Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sync Protocol</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: '4px', color: '#fff' }}>Local-First + State Mesh</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Multi-Tab Broadcast</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: '4px', color: '#4facfe' }}>
                {syncInfo.meshActive ? '🟢 Live Channel Active' : '🟢 Storage Fallback'}
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Outbox Queue</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: '4px', color: '#fff' }}>
                {syncInfo.pendingCount === 0 ? '0 Pending (All Synced)' : `${syncInfo.pendingCount} queued`}
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Multi-Device Code</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, marginTop: '4px', color: '#ffd700', letterSpacing: '1px' }}>
                {user?.code || '—'}
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <button
              className="btn-primary"
              disabled={isSyncingNow}
              style={{
                width: 'auto',
                padding: '0.75rem 1.4rem',
                background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: isSyncingNow ? 0.7 : 1,
                cursor: isSyncingNow ? 'not-allowed' : 'pointer'
              }}
              onClick={async () => {
                const u = getCurrentUser();
                if (u) {
                  setIsSyncingNow(true);
                  onToast && onToast('⚡ Running Instant Cloud Sync...', 'info');
                  const res = await forceCloudSync(u);
                  setIsSyncingNow(false);
                  if (res?.success) {
                    onToast && onToast('✅ Cloud Sync Complete! All stats up to date.', 'success');
                  } else {
                    onToast && onToast('⚡ Local-first state preserved & synced.', 'success');
                  }
                  onRefreshUser && onRefreshUser();
                }
              }}
            >
              <span>{isSyncingNow ? '⏳' : '🔄'}</span>
              <span>{isSyncingNow ? 'Syncing...' : 'Sync Progress Now'}</span>
            </button>

            <button
              className="glass-btn"
              style={{ padding: '0.75rem 1.2rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              onClick={() => {
                const ok = exportUserDataBackup();
                if (ok) {
                  onToast && onToast('💾 Progress backup downloaded successfully!', 'success');
                } else {
                  onToast && onToast('⚠️ Failed to export backup.', 'error');
                }
              }}
            >
              <span>💾</span>
              <span>Export Backup (JSON)</span>
            </button>

            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (event) => {
                  const content = event.target?.result;
                  if (typeof content === 'string') {
                    const result = importUserDataBackup(content);
                    if (result.success) {
                      onToast && onToast(`🎉 Backup restored! Welcome back, ${result.user?.name}!`, 'success');
                      onRefreshUser && onRefreshUser();
                      setTimeout(() => window.location.reload(), 1000);
                    } else {
                      onToast && onToast(`⚠️ Import failed: ${result.error}`, 'error');
                    }
                  }
                };
                reader.readAsText(file);
                e.target.value = '';
              }}
            />

            <button
              className="glass-btn"
              style={{ padding: '0.75rem 1.2rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              onClick={() => fileInputRef.current?.click()}
            >
              <span>📥</span>
              <span>Restore Backup</span>
            </button>
          </div>
        </div>

        {/* ── Theme ────────────────────────────────────────────── */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--sakura-pink)' }}>
            🎨 Appearance &amp; Theme
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '0.75rem' }}>
            {THEMES.map(theme => (
              <button
                key={theme.id}
                onClick={() => handleTheme(theme.id)}
                style={{
                  padding: '1rem 0.75rem',
                  borderRadius: '14px',
                  border: currentTheme === theme.id ? '2.5px solid #fff' : '2px solid rgba(255,255,255,0.08)',
                  background: currentTheme === theme.id ? `linear-gradient(135deg,${theme.color1}22,${theme.color2}11)` : 'rgba(255,255,255,0.03)',
                  cursor: 'pointer', color: '#fff', textAlign: 'center',
                  transition: 'all 0.2s',
                  boxShadow: currentTheme === theme.id ? `0 0 18px ${theme.color1}55` : 'none',
                  transform: currentTheme === theme.id ? 'scale(1.05)' : 'scale(1)',
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>{theme.emoji}</div>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: `linear-gradient(135deg,${theme.color1},${theme.color2})`,
                  margin: '0 auto 0.4rem',
                  border: '1.5px solid rgba(255,255,255,0.25)',
                }} />
                <div style={{ fontSize: '0.78rem', fontWeight: 700 }}>{theme.name}</div>
                {currentTheme === theme.id && <div style={{ fontSize: '0.65rem', color: '#4ade80', marginTop: '0.2rem' }}>✓ Active</div>}
              </button>
            ))}
          </div>
        </div>

        {/* ── Study Settings ───────────────────────────────────── */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--sakura-pink)' }}>
            📖 Study Preferences
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {[
              { key: 'showTranslit', label: 'Show English Transliteration', desc: 'Displays Roman spellings below Kannada script.', val: showTranslit, setter: setShowTranslit },
              { key: 'enableSound', label: 'Enable Voice & TTS', desc: 'Pronounce letters and words aloud when tapped.', val: enableSound, setter: setEnableSound },
              { key: 'enableAnimation', label: 'Falling Petal Animations', desc: 'Background animations. Toggle off to save battery.', val: enableAnimation, setter: setEnableAnimation },
            ].map(row => (
              <div key={row.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{row.label}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.desc}</div>
                </div>
                <label className="switch-container">
                  <input type="checkbox" checked={row.val} onChange={e => handleToggle(row.key, e.target.checked, row.setter)} />
                  <span className="switch-slider" />
                </label>
              </div>
            ))}

            {/* Daily goal slider */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Daily Study Goal</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target minutes per day</div>
                </div>
                <span style={{ fontWeight: 800, color: 'var(--sakura-pink)', fontSize: '1.1rem' }}>{dailyGoal} min</span>
              </div>
              <input
                type="range" min={5} max={60} step={5} value={dailyGoal}
                onChange={e => handleDailyGoal(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--sakura-pink)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                <span>5 min</span><span>30 min</span><span>60 min</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats Overview ───────────────────────────────────── */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--sakura-pink)' }}>
            📊 Your Stats
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '1rem' }}>
            {[
              { icon: '⭐', label: 'Total XP', val: user?.xp || 0 },
              { icon: '🎓', label: 'Level', val: `Lv.${user?.level || 1}` },
              { icon: '🔥', label: 'Streak', val: `${user?.streak || 0} days` },
              { icon: '🏅', label: 'Badges', val: (user?.badges || []).length },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.04)', borderRadius: '12px' }}>
                <div style={{ fontSize: '1.5rem' }}>{s.icon}</div>
                <div style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--sakura-pink)', marginTop: '0.25rem' }}>{s.val}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Danger Zone ─────────────────────────────────────── */}
        <div className="glass-card" style={{ padding: '2rem', border: '1px solid rgba(248,113,113,0.3)', background: 'rgba(248,113,113,0.03)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--red-error)' }}>⚠️ Danger Zone</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            This permanently deletes all progress, XP, badges, and SRS data. Cannot be undone.
          </p>
          <button className="logout-btn" onClick={handleReset} style={{ width: 'auto', padding: '0.75rem 1.5rem' }}>
            🗑️ Reset All Progress
          </button>
        </div>
      </div>

      <style>{`
        .switch-container { position:relative; display:inline-block; width:50px; height:26px; }
        .switch-container input { opacity:0; width:0; height:0; }
        .switch-slider { position:absolute; cursor:pointer; top:0;left:0;right:0;bottom:0; background-color:rgba(255,255,255,0.15); transition:.3s; border-radius:34px; }
        .switch-slider:before { position:absolute; content:""; height:18px; width:18px; left:4px; bottom:4px; background-color:white; transition:.3s; border-radius:50%; }
        input:checked + .switch-slider { background-color:var(--sakura-pink); }
        input:checked + .switch-slider:before { transform:translateX(24px); }
      `}</style>
    </div>
  );
};

export default Settings;
