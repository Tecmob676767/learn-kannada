import React, { useState, useEffect } from 'react';
import { getCurrentUser, updateUser, resetUserProgress } from '../utils/storage.js';

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
  const [adClientId, setAdClientId]       = useState(import.meta.env.VITE_GOOGLE_ADSENSE_CLIENT_ID || 'ca-pub-7557687021248166');
  const [adSlotId, setAdSlotId]           = useState(import.meta.env.VITE_GOOGLE_ADSENSE_SLOT_ID || '1234567890');

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
      if (s.adSlotId) setAdSlotId(s.adSlotId);
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
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Your Login Code</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Keep this private. Use it on any device.</div>
            </div>
            <button className="glass-btn" onClick={() => setShowCode(!showCode)} style={{ minWidth: '120px' }}>
              {showCode ? (user?.code || '—') : '👁️ Show Code'}
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

        {/* ── Google AdSense & 5-Min Ad Break Settings ───────────────── */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.4rem', color: 'var(--sakura-pink)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📢 Google AdSense Integration</span>
            <span style={{ fontSize: '0.7rem', padding: '2px 8px', background: 'rgba(255,163,102,0.2)', border: '1px solid rgba(255,163,102,0.4)', borderRadius: '10px' }}>
              5-Min Interstitial
            </span>
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Google AdSense is configured to trigger an ad break modal every 5 minutes during study sessions.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                Publisher / Client ID
              </label>
              <input
                className="form-input"
                type="text"
                value={adClientId}
                onChange={e => {
                  setAdClientId(e.target.value);
                  saveSetting('adClientId', e.target.value);
                }}
                placeholder="vcp_... or ca-pub-..."
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                Ad Slot ID
              </label>
              <input
                className="form-input"
                type="text"
                value={adSlotId}
                onChange={e => {
                  setAdSlotId(e.target.value);
                  saveSetting('adSlotId', e.target.value);
                }}
                placeholder="1234567890"
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn-primary"
              type="button"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('trigger-adsense-break'));
                onToast && onToast('📢 Triggering 5-minute Ad Break test modal!', 'info');
              }}
              style={{ width: 'auto', padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, #ff6b35, #ff8533)' }}
            >
              ⚡ Test 5-Min Ad Break Now
            </button>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Test how the interstitial ad break looks and behaves
            </span>
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
