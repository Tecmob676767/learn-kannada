import React, { useState, useEffect } from 'react';
import { getCurrentUser, updateUser, resetUserProgress } from '../utils/storage.js';

const THEMES = [
  { id: 'standard', name: 'Sobagu Standard', color1: '#ffa366', color2: '#ff6b35' },
  { id: 'gold', name: 'Royal Gold', color1: '#ffd700', color2: '#d4af37' },
  { id: 'kannada', name: 'Karnataka Pride', color1: '#ffd700', color2: '#e50914' },
  { id: 'teal', name: 'Ocean Mist', color1: '#38f9d7', color2: '#43e97b' },
];

const Settings = ({ onToast, user, onXP }) => {
  const [name, setName] = useState('');
  const [showTranslit, setShowTranslit] = useState(true);
  const [enableSound, setEnableSound] = useState(true);
  const [currentTheme, setCurrentTheme] = useState('standard');
  const [enableAnimation, setEnableAnimation] = useState(true);
  const [showCode, setShowCode] = useState(false);

  useEffect(() => {
    const u = getCurrentUser();
    if (u) {
      setName(u.name || '');
      const s = u.settings || {};
      setShowTranslit(s.showTranslit !== false);
      setEnableSound(s.enableSound !== false);
      setCurrentTheme(s.theme || 'standard');
      setEnableAnimation(s.enableAnimation !== false);
    }
  }, [user]);

  const handleSaveName = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      onToast && onToast('⚠️ Name cannot be empty!', 'error');
      return;
    }
    updateUser({ name: name.trim() });
    onToast && onToast('✅ Name updated successfully!', 'success');
  };

  const handleToggleSetting = (key, val, setter) => {
    setter(val);
    const u = getCurrentUser();
    const currentSettings = u.settings || {};
    updateUser({
      settings: {
        ...currentSettings,
        [key]: val,
      },
    });
    onToast && onToast('⚡ Setting updated!', 'success');

    // If updating theme, apply global CSS custom properties
    if (key === 'theme') {
      applyTheme(val);
    }
  };

  const applyTheme = (themeId) => {
    const root = document.documentElement;
    if (themeId === 'gold') {
      root.style.setProperty('--sakura-pink', '#ffd700');
      root.style.setProperty('--sakura-deep', '#d4af37');
    } else if (themeId === 'kannada') {
      root.style.setProperty('--sakura-pink', '#ffd700');
      root.style.setProperty('--sakura-deep', '#e50914');
    } else if (themeId === 'teal') {
      root.style.setProperty('--sakura-pink', '#38f9d7');
      root.style.setProperty('--sakura-deep', '#43e97b');
    } else {
      // Standard
      root.style.setProperty('--sakura-pink', '#ffa366');
      root.style.setProperty('--sakura-deep', '#ff6b35');
    }
  };

  const handleReset = () => {
    if (window.confirm('⚠️ WARNING: This will permanently delete all your progress, XP, badges, and SRS cards. Are you sure you want to proceed?')) {
      resetUserProgress();
      onToast && onToast('🔄 Progress reset successfully!', 'info');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  return (
    <div className="learning-screen">
      <div className="page-header">
        <h2>⚙️ Settings & Customization</h2>
        <p>Manage your account preferences, themes, and learning modes.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Profile Card */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.2rem', color: 'var(--sakura-pink)' }}>
            👤 Profile & Account
          </h3>
          <form onSubmit={handleSaveName} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                Your Name
              </label>
              <input
                className="form-input"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                maxLength={30}
              />
            </div>
            <button className="btn-primary" type="submit" style={{ width: 'auto', padding: '0.85rem 1.5rem' }}>
              Save Name
            </button>
          </form>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>Your Login Access Code</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Keep this private. Use it to log in on any device.</div>
              </div>
              <button
                className="glass-btn"
                onClick={() => setShowCode(!showCode)}
                style={{ minWidth: '120px' }}
              >
                {showCode ? user?.code : '👁️ Show Code'}
              </button>
            </div>
          </div>
        </div>

        {/* Study Preferences */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.2rem', color: 'var(--sakura-pink)' }}>
            📖 Study & Voice Settings
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Transliteration */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>Show English Transliteration</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Displays Roman spelling guides below Kannada script.</div>
              </div>
              <label className="switch-container">
                <input
                  type="checkbox"
                  checked={showTranslit}
                  onChange={(e) => handleToggleSetting('showTranslit', e.target.checked, setShowTranslit)}
                />
                <span className="switch-slider"></span>
              </label>
            </div>

            {/* Sound FX */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>Enable Voice & TTS Pronunciation</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pronounce letters and words aloud when tapped.</div>
              </div>
              <label className="switch-container">
                <input
                  type="checkbox"
                  checked={enableSound}
                  onChange={(e) => handleToggleSetting('enableSound', e.target.checked, setEnableSound)}
                />
                <span className="switch-slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Themes & Visuals */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.2rem', color: 'var(--sakura-pink)' }}>
            🎨 Appearance & Themes
          </h3>
          
          {/* Visual Theme Selection */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.75rem' }}>
              Color Theme Accent
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
              {THEMES.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => handleToggleSetting('theme', theme.id, setCurrentTheme)}
                  style={{
                    padding: '1rem 0.75rem',
                    borderRadius: '12px',
                    border: currentTheme === theme.id ? '2px solid #fff' : '2px solid rgba(255,255,255,0.08)',
                    background: 'rgba(255,255,255,0.03)',
                    cursor: 'pointer',
                    color: '#fff',
                    textAlign: 'center',
                    transition: 'all 0.2s',
                    boxShadow: currentTheme === theme.id ? `0 0 15px ${theme.color1}40` : 'none',
                  }}
                >
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: `linear-gradient(135deg, ${theme.color1}, ${theme.color2})`,
                    margin: '0 auto 0.5rem',
                    border: '1.5px solid rgba(255,255,255,0.3)',
                  }} />
                  <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{theme.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Canvas Animation Toggle */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.25rem' }}>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>Enable Falling Leaf/Petal Animations</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Background particle animations. Toggle off to save battery.</div>
            </div>
            <label className="switch-container">
              <input
                type="checkbox"
                checked={enableAnimation}
                onChange={(e) => handleToggleSetting('enableAnimation', e.target.checked, setEnableAnimation)}
              />
              <span className="switch-slider"></span>
            </label>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="glass-card" style={{ padding: '2rem', border: '1px solid rgba(248,113,113,0.3)', background: 'rgba(248,113,113,0.03)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--red-error)' }}>
            ⚠️ Danger Zone
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Once you reset your progress or delete data, it cannot be undone. Please be careful.
          </p>
          <button className="logout-btn" onClick={handleReset} style={{ width: 'auto', padding: '0.75rem 1.5rem' }}>
            Reset All Learning Progress
          </button>
        </div>
      </div>

      <style>{`
        .switch-container {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 26px;
        }
        .switch-container input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .switch-slider {
          position: absolute;
          cursor: pointer;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: rgba(255,255,255,0.15);
          transition: .3s;
          border-radius: 34px;
        }
        .switch-slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          transition: .3s;
          border-radius: 50%;
        }
        input:checked + .switch-slider {
          background-color: var(--sakura-pink);
        }
        input:checked + .switch-slider:before {
          transform: translateX(24px);
        }
      `}</style>
    </div>
  );
};

export default Settings;
