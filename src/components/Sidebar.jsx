import React from 'react';
import { getLevelTitle, getXPForNextLevel } from '../utils/storage.js';

const NAV_MAIN = [
  { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
  { id: 'leaderboard', icon: '🏆', label: 'Live Leaderboard' },
  { id: 'roadmap', icon: '🗺️', label: 'Learning Roadmap', labelKannada: 'ಅಧ್ಯಯನ ಮಾರ್ಗ' },
  { id: 'progress', icon: '📊', label: 'Progress Report', labelKannada: 'ಪ್ರಗತಿ ವರದಿ' },
  { id: 'dailychallenge', icon: '🌟', label: 'Daily Challenge', labelKannada: 'ದೈನಂದಿನ ಸವಾಲು' },
  { id: 'wordofday', icon: '📅', label: 'Word of the Day', labelKannada: 'ದಿನದ ಪದ' },
];

const NAV_GAMES = [
  { id: 'scrambled', icon: '🎲', label: 'Scrambled Words', labelKannada: 'ಪದ ಜೋಡಣೆ' },
  { id: 'memorygame', icon: '🃏', label: 'Memory Card Flip', labelKannada: 'ನೆನಪಿನ ಆಟ' },
  { id: 'wordmatch', icon: '🎮', label: 'Word Match Arena', labelKannada: 'ಪದ ಪಂದ್ಯ' },
  { id: 'crossword', icon: '🧩', label: 'Kannada Crossword', labelKannada: 'ಪದಬಂಧ' },
  { id: 'fillblanks', icon: '🧩', label: 'Fill in the Blanks', labelKannada: 'ಬಿಟ್ಟು ತುಂಬಿಸಿ' },
];

const NAV_LESSONS = [
  { id: 'varnamale', icon: '🔡', label: 'Varnamale', labelKannada: 'ಅಕ್ಷರ ಮಾಲೆ' },
  { id: 'kagunita', icon: '📊', label: 'Kagunita', labelKannada: 'ಕಾಗುಣಿತ' },
  { id: 'handwriting', icon: '✍️', label: 'Handwriting Practice', labelKannada: 'ಲಿಖಿತ ಅಭ್ಯಾಸ' },
  { id: 'vocabulary', icon: '📚', label: 'Vocabulary', labelKannada: 'ಶಬ್ದಕೋಶ' },
  { id: 'phrasebook', icon: '📱', label: 'Phrasebook', labelKannada: 'ವಾಕ್ಯ ಕೋಶ' },
  { id: 'phrasebuilder', icon: '🏗️', label: 'Phrase Builder', labelKannada: 'ವಾಕ್ಯ ರಚನೆ' },
  { id: 'numbers', icon: '🔢', label: 'Numbers Studio', labelKannada: 'ಸಂಖ್ಯೆಗಳು' },
  { id: 'typing', icon: '⌨️', label: 'Script Trainer', labelKannada: 'ಲಿಪಿ ಅಭ್ಯಾಸ' },
  { id: 'typingtutor', icon: '🎮', label: 'Typing Tutor', labelKannada: 'ಟೈಪಿಂಗ್ ಅಭ್ಯಾಸ' },
  { id: 'translit', icon: '🔠', label: 'Transliteration Trainer', labelKannada: 'ಲಿಪ್ಯಂತರ ಅಭ್ಯಾಸ' },
  { id: 'grammar', icon: '✏️', label: 'Sentence Architect', labelKannada: 'ವ್ಯಾಕರಣ' },
  { id: 'storymode', icon: '📖', label: 'Story Mode', labelKannada: 'ಕಥೆಗಳು' },
  { id: 'conversations', icon: '🗣️', label: 'Conversation Studio', labelKannada: 'ಸಂಭಾಷಣೆ' },
  { id: 'voicerecog', icon: '🎙️', label: 'Voice Quiz', labelKannada: 'ಧ್ವನಿ ಪರೀಕ್ಷೆ' },
  { id: 'pronunciation', icon: '🎙️', label: 'Pronunciation Practice', labelKannada: 'ಉಚ್ಚಾರಣೆ ಅಭ್ಯಾಸ' },
  { id: 'songs', icon: '🎵', label: 'Songs & Rhymes', labelKannada: 'ಹಾಡುಗಳು' },
  { id: 'tour', icon: '🗺️', label: 'Virtual Karnataka Tour', labelKannada: 'ಕರ್ನಾಟಕ ಪ್ರವಾಸ' },
  { id: 'proverbs', icon: '📜', label: 'Kannada Proverbs', labelKannada: 'ಗಾದೆ ಮಾತುಗಳು' },
  { id: 'literature', icon: '🎭', label: 'Literature', labelKannada: 'ಸಾಹಿತ್ಯ' },
  { id: 'quizzes', icon: '🎯', label: 'Quizzes', labelKannada: 'ಪರೀಕ್ಷೆ' },
  { id: 'srs', icon: '🔄', label: 'SRS Review', labelKannada: 'ಪುನರಾವರ್ತನೆ' },
];

const NAV_MORE = [
  { id: 'achievements', icon: '🏅', label: 'Achievements' },
  { id: 'dictionary', icon: '📖', label: 'Dictionary' },
];

const NavButton = ({ item, activePage, onNavigate, onCloseMobile }) => (
  <button
    key={item.id}
    className={`nav-item${activePage === item.id ? ' active' : ''}`}
    onClick={() => { onNavigate(item.id); onCloseMobile(); }}
  >
    <span className="nav-icon-badge">{item.icon}</span>
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

const Sidebar = ({ user, activePage, onNavigate, onLogout, mobileOpen, onCloseMobile }) => {
  const xpNext = getXPForNextLevel(user.xp || 0);
  const xpPct = Math.min(100, Math.round(((user.xp || 0) % 500) / 500 * 100));
  const levelTitle = getLevelTitle(user.level || 1);

  return (
    <>
      {mobileOpen && <div className="sidebar-overlay show" onClick={onCloseMobile} />}
      <aside className={`sidebar${mobileOpen ? ' mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 15 C42 5, 28 8, 30 25 C32 38, 50 48, 50 48 C50 48, 68 38, 70 25 C72 8, 58 5, 50 15 Z" fill="#ff4d6d" transform="rotate(0 50 50)" />
              <path d="M50 15 C42 5, 28 8, 30 25 C32 38, 50 48, 50 48 C50 48, 68 38, 70 25 C72 8, 58 5, 50 15 Z" fill="#ff4d6d" transform="rotate(72 50 50)" />
              <path d="M50 15 C42 5, 28 8, 30 25 C32 38, 50 48, 50 48 C50 48, 68 38, 70 25 C72 8, 58 5, 50 15 Z" fill="#ff4d6d" transform="rotate(144 50 50)" />
              <path d="M50 15 C42 5, 28 8, 30 25 C32 38, 50 48, 50 48 C50 48, 68 38, 70 25 C72 8, 58 5, 50 15 Z" fill="#ff4d6d" transform="rotate(216 50 50)" />
              <path d="M50 15 C42 5, 28 8, 30 25 C32 38, 50 48, 50 48 C50 48, 68 38, 70 25 C72 8, 58 5, 50 15 Z" fill="#ff4d6d" transform="rotate(288 50 50)" />
              <circle cx="50" cy="50" r="11" fill="#ffb703" />
            </svg>
            <span>ಸೊಬಗು</span>
          </div>
          <div className="sidebar-user">
            <div className="name">{user.name}</div>
            <div className="level">⭐ {levelTitle}</div>
          </div>
        </div>

        <div className="sidebar-xp">
          <div className="xp-bar-wrap">
            <span className="xp-label">XP</span>
            <span className="xp-value">{user.xp || 0} / {xpNext}</span>
          </div>
          <div className="xp-bar">
            <div className="xp-fill" style={{ width: `${xpPct}%` }} />
          </div>
          <div className="streak-badge">
            🔥 {user.streak || 0} day streak
          </div>
        </div>

        {/* YouTube Channel Banner */}
        <div style={{
          margin: '0.75rem 0.75rem 0.25rem',
          padding: '0.85rem',
          background: 'linear-gradient(135deg, rgba(255,0,0,0.18), rgba(200,0,0,0.1))',
          border: '1px solid rgba(255, 60, 60, 0.4)',
          borderRadius: '12px',
          textAlign: 'center',
          boxShadow: '0 4px 15px rgba(255,0,0,0.15)',
        }}>
          <div style={{ fontSize: '0.82rem', color: '#ff6666', fontWeight: 700, marginBottom: '0.3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
            <span>▶</span> YouTube Channel
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.3, marginBottom: '0.6rem' }}>
            Subscribe to get notified of the latest features!
          </p>
          <a
            href="https://www.youtube.com/@Sobaguteam"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              padding: '0.45rem 1rem',
              background: '#ff0000',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.8rem',
              borderRadius: '20px',
              textDecoration: 'none',
              boxShadow: '0 4px 12px rgba(255,0,0,0.4)',
              transition: 'transform 0.2s, background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <span>▶ Subscribe @Sobaguteam</span>
          </a>
        </div>

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
        </nav>

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
