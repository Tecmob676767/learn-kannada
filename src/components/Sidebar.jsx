import React, { useState } from 'react';
import { getLevelTitle, getXPForNextLevel } from '../utils/storage.js';

const NAV_MAIN = [
  { id: 'dashboard',     icon: '🏠', label: 'Dashboard',         bg: 'linear-gradient(135deg, #ff9a9e, #fecfef)' },
  { id: 'leaderboard',  icon: '🏆', label: 'Live Leaderboard',   bg: 'linear-gradient(135deg, #ffcf71, #ff923b)' },
  { id: 'roadmap',      icon: '🗺️', label: 'Learning Roadmap',   labelKannada: 'ಅಧ್ಯಯನ ಮಾರ್ಗ',   bg: 'linear-gradient(135deg, #43e97b, #38f9d7)' },
  { id: 'progress',     icon: '📊', label: 'Progress Report',     labelKannada: 'ಪ್ರಗತಿ ವರದಿ',    bg: 'linear-gradient(135deg, #4facfe, #00f2fe)' },
  { id: 'dailychallenge',icon:'🌟', label: 'Daily Challenge',     labelKannada: 'ದೈನಂದಿನ ಸವಾಲು', bg: 'linear-gradient(135deg, #f39c12, #f1c40f)' },
  { id: 'wordofday',    icon: '📅', label: 'Word of the Day',     labelKannada: 'ದಿನದ ಪದ',       bg: 'linear-gradient(135deg, #a18cd1, #fbc2eb)' },
];

const NAV_GAMES = [
  { id: 'scrambled',  icon: '🎲', label: 'Scrambled Words',    labelKannada: 'ಪದ ಜೋಡಣೆ',  bg: 'linear-gradient(135deg, #ff5858, #f09819)' },
  { id: 'memorygame', icon: '🃏', label: 'Memory Card Flip',   labelKannada: 'ನೆನಪಿನ ಆಟ',  bg: 'linear-gradient(135deg, #e14efa, #b400ff)' },
  { id: 'wordmatch',  icon: '🎮', label: 'Word Match Arena',   labelKannada: 'ಪದ ಪಂದ್ಯ',   bg: 'linear-gradient(135deg, #7f00ff, #e100ff)' },
  { id: 'crossword',  icon: '🧩', label: 'Kannada Crossword',  labelKannada: 'ಪದಬಂಧ',      bg: 'linear-gradient(135deg, #11998e, #38ef7d)' },
  { id: 'fillblanks', icon: '✍️', label: 'Fill in the Blanks', labelKannada: 'ಬಿಟ್ಟು ತುಂಬಿಸಿ', bg: 'linear-gradient(135deg, #fc4a1a, #f7b733)' },
];

const NAV_LESSONS = [
  { id: 'varnamale',   icon: '🔡', label: 'Varnamale',              labelKannada: 'ಅಕ್ಷರ ಮಾಲೆ',        bg: 'linear-gradient(135deg, #30cfd0, #330867)' },
  { id: 'kagunita',   icon: '📊', label: 'Kagunita',               labelKannada: 'ಕಾಗುಣಿತ',            bg: 'linear-gradient(135deg, #00c6fb, #005bea)' },
  { id: 'handwriting',icon: '✍️', label: 'Handwriting Practice',   labelKannada: 'ಲಿಖಿತ ಅಭ್ಯಾಸ',       bg: 'linear-gradient(135deg, #f857a6, #ff5858)' },
  { id: 'vocabulary', icon: '📚', label: 'Vocabulary',              labelKannada: 'ಶಬ್ದಕೋಶ',            bg: 'linear-gradient(135deg, #00c9ff, #92fe9d)' },
  { id: 'phrasebook', icon: '📱', label: 'Phrasebook',              labelKannada: 'ವಾಕ್ಯ ಕೋಶ',          bg: 'linear-gradient(135deg, #f77062, #fe5196)' },
  { id: 'phrasebuilder',icon:'🏗️',label: 'Phrase Builder',          labelKannada: 'ವಾಕ್ಯ ರಚನೆ',         bg: 'linear-gradient(135deg, #f6d365, #fda085)' },
  { id: 'numbers',    icon: '🔢', label: 'Numbers Studio',          labelKannada: 'ಸಂಖ್ಯೆಗಳು',          bg: 'linear-gradient(135deg, #43e97b, #38f9d7)' },
  { id: 'typing',     icon: '⌨️', label: 'Script Trainer',          labelKannada: 'ಲಿಪಿ ಅಭ್ಯಾಸ',        bg: 'linear-gradient(135deg, #667eea, #764ba2)' },
  { id: 'typingtutor',icon: '🎮', label: 'Typing Tutor',            labelKannada: 'ಟೈಪಿಂಗ್ ಅಭ್ಯಾಸ',    bg: 'linear-gradient(135deg, #b224ef, #7579ff)' },
  { id: 'translit',   icon: '🔠', label: 'Transliteration Trainer', labelKannada: 'ಲಿಪ್ಯಂತರ ಅಭ್ಯಾಸ',   bg: 'linear-gradient(135deg, #ff758c, #ff7eb3)' },
  { id: 'grammar',    icon: '✏️', label: 'Sentence Architect',      labelKannada: 'ವ್ಯಾಕರಣ',            bg: 'linear-gradient(135deg, #f83600, #fe8c00)' },
  { id: 'storymode',  icon: '📖', label: 'Story Mode',              labelKannada: 'ಕಥೆಗಳು',             bg: 'linear-gradient(135deg, #ff9a9e, #fecfef)' },
  { id: 'conversations',icon:'🗣️',label: 'Conversation Studio',     labelKannada: 'ಸಂಭಾಷಣೆ',           bg: 'linear-gradient(135deg, #ff0844, #ffb199)' },
  { id: 'voicerecog', icon: '🎙️', label: 'Voice Quiz',              labelKannada: 'ಧ್ವನಿ ಪರೀಕ್ಷೆ',       bg: 'linear-gradient(135deg, #e52d27, #b31217)' },
  { id: 'pronunciation',icon:'🔊',label: 'Pronunciation Practice',  labelKannada: 'ಉಚ್ಚಾರಣೆ ಅಭ್ಯಾಸ',    bg: 'linear-gradient(135deg, #f000ff, #00e7ff)' },
  { id: 'songs',      icon: '🎵', label: 'Songs & Rhymes',          labelKannada: 'ಹಾಡುಗಳು',            bg: 'linear-gradient(135deg, #f355da, #7000ff)' },
  { id: 'tour',       icon: '🗺️', label: 'Virtual Karnataka Tour',  labelKannada: 'ಕರ್ನಾಟಕ ಪ್ರವಾಸ',     bg: 'linear-gradient(135deg, #13547a, #80d0c7)' },
  { id: 'proverbs',   icon: '📜', label: 'Kannada Proverbs',        labelKannada: 'ಗಾದೆ ಮಾತುಗಳು',      bg: 'linear-gradient(135deg, #ffe000, #799f0c)' },
  { id: 'literature', icon: '🎭', label: 'Literature',              labelKannada: 'ಸಾಹಿತ್ಯ',            bg: 'linear-gradient(135deg, #b06ab3, #4568dc)' },
  { id: 'quizzes',    icon: '🎯', label: 'Quizzes',                 labelKannada: 'ಪರೀಕ್ಷೆ',            bg: 'linear-gradient(135deg, #ff416c, #ff4b2b)' },
  { id: 'srs',        icon: '🔄', label: 'SRS Review',              labelKannada: 'ಪುನರಾವರ್ತನೆ',       bg: 'linear-gradient(135deg, #00b09b, #96c93d)' },
];

const NAV_MORE = [
  { id: 'achievements',  icon: '🏅', label: 'Achievements',         bg: 'linear-gradient(135deg,#f8b500,#fce043)' },
  { id: 'dictionary',    icon: '📖', label: 'Dictionary',           bg: 'linear-gradient(135deg,#0ba360,#3cba92)' },
  { id: 'emblem',        icon: '🌺', label: 'Emblem Studio',        bg: 'linear-gradient(135deg,#ff9a9e,#ff6b6b)' },
  { id: 'grammarstudio', icon: '🖊️', label: 'Grammar Studio',       bg: 'linear-gradient(135deg,#a18cd1,#fbc2eb)' },
  { id: 'settings',      icon: '⚙️', label: 'Settings',             bg: 'linear-gradient(135deg,#485563,#29323c)' },
];

const NAV_NEW = [
  { id: 'keyboard',      icon: '⌨️', label: 'Kannada Keyboard',     labelKannada: 'ಕೀಬೋರ್ಡ್',         bg: 'linear-gradient(135deg,#667eea,#764ba2)' },
  { id: 'flashcards',    icon: '🃏', label: 'Flashcard Deck',       labelKannada: 'ಫ್ಲಾಶ್‌ಕಾರ್ಡ್',      bg: 'linear-gradient(135deg,#f093fb,#f5576c)' },
  { id: 'writing',       icon: '✍️', label: 'Writing Challenge',    labelKannada: 'ಬರಹ ಸವಾಲು',         bg: 'linear-gradient(135deg,#4facfe,#00f2fe)' },
  { id: 'audiolessons',  icon: '🎧', label: 'Audio Lessons',        labelKannada: 'ಶ್ರವ್ಯ ಪಾಠ',         bg: 'linear-gradient(135deg,#43e97b,#38f9d7)' },
  { id: 'culturalquiz',  icon: '🏯', label: 'Cultural Quiz',        labelKannada: 'ಸಾಂಸ್ಕೃತಿಕ ಪರೀಕ್ಷೆ',  bg: 'linear-gradient(135deg,#ff9a9e,#fecfef)' },
  { id: 'translator',    icon: '🌐', label: 'Phrase Translator',    labelKannada: 'ಅನುವಾದಕ',           bg: 'linear-gradient(135deg,#30cfd0,#330867)' },
  { id: 'numbergame',    icon: '🔢', label: 'Number Game',          labelKannada: 'ಸಂಖ್ಯೆ ಆಟ',          bg: 'linear-gradient(135deg,#ffcf71,#ff923b)' },
  { id: 'grammarhelp',   icon: '📝', label: 'Grammar Explainer',    labelKannada: 'ವ್ಯಾಕರಣ ಮಾರ್ಗದರ್ಶಿ',  bg: 'linear-gradient(135deg,#f83600,#fe8c00)' },
  { id: 'festivals',     icon: '🎉', label: 'Festival Calendar',    labelKannada: 'ಹಬ್ಬ ಕ್ಯಾಲೆಂಡರ್',      bg: 'linear-gradient(135deg,#b06ab3,#4568dc)' },
  { id: 'speedtyping',   icon: '⚡', label: 'Speed Typing',         labelKannada: 'ತ್ವರಿತ ಟೈಪಿಂಗ್',      bg: 'linear-gradient(135deg,#f39c12,#f1c40f)' },
];

const NavButton = ({ item, activePage, onNavigate, onCloseMobile }) => (
  <button
    className={`nav-item${activePage === item.id ? ' active' : ''}`}
    onClick={() => { onNavigate(item.id); onCloseMobile(); }}
  >
    <span className="nav-icon-badge" style={{ background: item.bg || 'var(--sakura-deep)' }}>
      {item.icon}
    </span>
    {item.labelKannada ? (
      <div>
        <div style={{ lineHeight: 1.2 }}>{item.label}</div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'Noto Sans Kannada, sans-serif' }}>
          {item.labelKannada}
        </div>
      </div>
    ) : (
      <span>{item.label}</span>
    )}
  </button>
);

/* ── Royal Crown Sobagu Logo ─────────────────────────────────────────── */
const SobaguLogo = () => (
  <svg width="42" height="42" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="logoBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#d90429" />
        <stop offset="50%" stopColor="#ef233c" />
        <stop offset="100%" stopColor="#8d0801" />
      </linearGradient>
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fff3b0" />
        <stop offset="50%" stopColor="#ffb703" />
        <stop offset="100%" stopColor="#fb8500" />
      </linearGradient>
      <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    {/* Outer Golden Ring */}
    <circle cx="50" cy="50" r="46" fill="url(#logoBg)" stroke="url(#goldGrad)" strokeWidth="4" filter="url(#logoGlow)" />
    <circle cx="50" cy="50" r="40" stroke="url(#goldGrad)" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.8" />
    
    {/* Royal Crown Top */}
    <path d="M35 34 L42 42 L50 28 L58 42 L65 34 L62 50 L38 50 Z" fill="url(#goldGrad)" />
    <circle cx="35" cy="32" r="2.5" fill="#fff" />
    <circle cx="50" cy="26" r="3" fill="#fff" />
    <circle cx="65" cy="32" r="2.5" fill="#fff" />

    {/* Kannada Character "ಸೊ" */}
    <text x="50" y="74" textAnchor="middle" fill="url(#goldGrad)" fontSize="28" fontWeight="900" fontFamily="Noto Sans Kannada, sans-serif" filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.5))">
      ಸೊ
    </text>
  </svg>
);

/* ── YouTube Subscribe Banner ────────────────────────────────────────────── */
const SUBSCRIBED_KEY = 'sobagu_yt_subscribed';

const YTBanner = () => {
  const [hidden, setHidden] = useState(() => localStorage.getItem(SUBSCRIBED_KEY) === 'true');

  const handleSubscribeClick = () => {
    // Open channel in new tab
    window.open('https://www.youtube.com/@Sobaguteam', '_blank', 'noopener,noreferrer');
    // After a short delay show a "I've subscribed" confirmation prompt
    setTimeout(() => {
      const confirmed = window.confirm('Have you subscribed to @Sobaguteam? Click OK to hide this banner.');
      if (confirmed) {
        localStorage.setItem(SUBSCRIBED_KEY, 'true');
        setHidden(true);
      }
    }, 800);
  };

  if (hidden) return null;

  return (
    <div style={{
      margin: '0.75rem 0.75rem 0.25rem',
      padding: '0.85rem',
      background: 'linear-gradient(135deg, rgba(255,0,0,0.18), rgba(180,0,0,0.1))',
      border: '1px solid rgba(255, 60, 60, 0.4)',
      borderRadius: '14px',
      textAlign: 'center',
      boxShadow: '0 4px 18px rgba(255,0,0,0.12)',
      position: 'relative',
    }}>
      {/* Close / "already subscribed" shortcut */}
      <button
        title="I'm already subscribed"
        onClick={() => {
          localStorage.setItem(SUBSCRIBED_KEY, 'true');
          setHidden(true);
        }}
        style={{
          position: 'absolute', top: '6px', right: '8px',
          background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)',
          fontSize: '0.8rem', cursor: 'pointer', lineHeight: 1,
        }}
      >
        ✕
      </button>

      <div style={{
        fontSize: '0.82rem', color: '#ff6666', fontWeight: 700,
        marginBottom: '0.3rem', display: 'flex', alignItems: 'center',
        justifyContent: 'center', gap: '0.4rem',
      }}>
        <svg width="16" height="12" viewBox="0 0 24 17" fill="#ff3333">
          <path d="M23.5 2.5a3 3 0 0 0-2.1-2.1C19.5 0 12 0 12 0S4.5 0 2.6.4A3 3 0 0 0 .5 2.5C0 4.4 0 8.5 0 8.5s0 4.1.5 6a3 3 0 0 0 2.1 2.1C4.5 17 12 17 12 17s7.5 0 9.4-.4a3 3 0 0 0 2.1-2.1C24 12.6 24 8.5 24 8.5s0-4.1-.5-6Z" />
          <polygon points="9.6,12.1 15.8,8.5 9.6,4.9" fill="white" />
        </svg>
        YouTube Channel
      </div>

      <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: 1.35, marginBottom: '0.65rem' }}>
        Subscribe to <strong style={{ color: '#ff9999' }}>@Sobaguteam</strong> to get notified of the latest features!
      </p>

      <button
        onClick={handleSubscribeClick}
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          gap: '0.4rem', padding: '0.45rem 1.1rem',
          background: 'linear-gradient(135deg, #ff0000, #cc0000)',
          color: '#ffffff', fontWeight: 800, fontSize: '0.8rem',
          borderRadius: '20px', border: 'none', cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(255,0,0,0.4)',
          transition: 'transform 0.18s, box-shadow 0.18s',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.06)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(255,0,0,0.55)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)';   e.currentTarget.style.boxShadow = '0 4px 14px rgba(255,0,0,0.4)'; }}
      >
        ▶ Subscribe @Sobaguteam
      </button>
    </div>
  );
};

/* ── Sidebar ─────────────────────────────────────────────────────────────── */
const Sidebar = ({ user, activePage, onNavigate, onLogout, mobileOpen, onCloseMobile }) => {
  const xpNext  = getXPForNextLevel(user.xp || 0);
  const xpPct   = Math.min(100, Math.round(((user.xp || 0) % 500) / 500 * 100));
  const levelTitle = getLevelTitle(user.level || 1);

  return (
    <>
      {mobileOpen && <div className="sidebar-overlay show" onClick={onCloseMobile} />}
      <aside className={`sidebar${mobileOpen ? ' mobile-open' : ''}`}>

        {/* ── Logo Header ────────────────────────────────────────────── */}
        <div className="sidebar-header">
          <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <SobaguLogo />
            <span style={{
              fontSize: '1.45rem', fontWeight: 900,
              background: 'linear-gradient(135deg, #ffb7c5, #e8547a, #ffd700)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
            }}>
              ಸೊಬಗು
            </span>
          </div>
          <div className="sidebar-user">
            <div className="name">{user.name}</div>
            <div className="level">⭐ {levelTitle}</div>
          </div>
        </div>

        {/* ── XP Bar ──────────────────────────────────────────────────── */}
        <div className="sidebar-xp">
          <div className="xp-bar-wrap">
            <span className="xp-label">XP</span>
            <span className="xp-value">{user.xp || 0} / {xpNext}</span>
          </div>
          <div className="xp-bar">
            <div className="xp-fill" style={{ width: `${xpPct}%` }} />
          </div>
          <div className="streak-badge">🔥 {user.streak || 0} day streak</div>
        </div>

        {/* ── YouTube Banner ───────────────────────────────────────────── */}
        <YTBanner />

        {/* ── Navigation ──────────────────────────────────────────────── */}
        <nav className="sidebar-nav">
          <p className="nav-section-label">Main</p>
          {NAV_MAIN.map(item => (
            <NavButton key={item.id} item={item} activePage={activePage} onNavigate={onNavigate} onCloseMobile={onCloseMobile} />
          ))}

          <p className="nav-section-label" style={{ marginTop: '0.5rem' }}>Games & Quizzes</p>
          {NAV_GAMES.map(item => (
            <NavButton key={item.id} item={item} activePage={activePage} onNavigate={onNavigate} onCloseMobile={onCloseMobile} />
          ))}

          <p className="nav-section-label" style={{ marginTop: '0.5rem' }}>Lessons & Practice</p>
          {NAV_LESSONS.map(item => (
            <NavButton key={item.id} item={item} activePage={activePage} onNavigate={onNavigate} onCloseMobile={onCloseMobile} />
          ))}

          <p className="nav-section-label" style={{ marginTop: '0.5rem' }}>More</p>
          {NAV_MORE.map(item => (
            <NavButton key={item.id} item={item} activePage={activePage} onNavigate={onNavigate} onCloseMobile={onCloseMobile} />
          ))}

          {(user?.role === 'admin' || user?.role === 'founder') && (
            <>
              <p className="nav-section-label" style={{ marginTop: '0.5rem' }}>🛡️ Admin</p>
              <NavButton
                item={{ id: 'controlcenter', icon: '🛡️', label: 'Control Center', bg: 'linear-gradient(135deg,#ffd700,#ff6b35)' }}
                activePage={activePage}
                onNavigate={onNavigate}
                onCloseMobile={onCloseMobile}
              />
            </>
          )}

          <p className="nav-section-label" style={{ marginTop: '0.5rem' }}>🆕 New Features</p>
          {NAV_NEW.map(item => (
            <NavButton key={item.id} item={item} activePage={activePage} onNavigate={onNavigate} onCloseMobile={onCloseMobile} />
          ))}
        </nav>

        {/* ── Footer ──────────────────────────────────────────────────── */}
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={onLogout}>
            🚪 <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
