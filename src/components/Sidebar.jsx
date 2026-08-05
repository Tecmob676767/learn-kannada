import React from 'react';
import { getLevelTitle, getXPForNextLevel } from '../utils/storage.js';

const NAV_ITEMS = [
  { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
  { id: 'varnamale', icon: '🔡', label: 'Varnamale', labelKannada: 'ಅಕ್ಷರ ಮಾಲೆ' },
  { id: 'kagunita', icon: '📊', label: 'Kagunita', labelKannada: 'ಕಾಗುಣಿತ' },
  { id: 'vocabulary', icon: '📚', label: 'Vocabulary', labelKannada: 'ಶಬ್ದಕೋಶ' },
  { id: 'numbers', icon: '🔢', label: 'Numbers Studio', labelKannada: 'ಸಂಖ್ಯೆಗಳು' },
  { id: 'typing', icon: '⌨️', label: 'Script Trainer', labelKannada: 'ಲಿಪಿ ಅಭ್ಯಾಸ' },
  { id: 'grammar', icon: '✏️', label: 'Sentence Architect', labelKannada: 'ವ್ಯಾಕರಣ' },
  { id: 'conversations', icon: '🗣️', label: 'Conversation Studio', labelKannada: 'ಸಂಭಾಷಣೆ' },
  { id: 'pronunciation', icon: '🎙️', label: 'Pronunciation Practice', labelKannada: 'ಉಚ್ಚಾರಣೆ ಅಭ್ಯಾಸ' },
  { id: 'literature', icon: '📜', label: 'Literature', labelKannada: 'ಸಾಹಿತ್ಯ' },
  { id: 'quizzes', icon: '🎯', label: 'Quizzes', labelKannada: 'ಪರೀಕ್ಷೆ' },
  { id: 'achievements', icon: '🏅', label: 'Achievements' },
  { id: 'dictionary', icon: '📖', label: 'Dictionary' },
];

const Sidebar = ({ user, activePage, onNavigate, onLogout, mobileOpen, onCloseMobile }) => {
  const xpNext = getXPForNextLevel(user.xp || 0);
  const xpPct = Math.min(100, Math.round(((user.xp || 0) % 500) / 500 * 100));
  const levelTitle = getLevelTitle(user.level || 1);

  return (
    <>
      {mobileOpen && <div className="sidebar-overlay show" onClick={onCloseMobile} />}
      <aside className={`sidebar${mobileOpen ? ' mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">ಸೊ</div>
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

        <nav className="sidebar-nav">
          <p className="nav-section-label">Main</p>
          {NAV_ITEMS.slice(0, 1).map(item => (
            <button
              key={item.id}
              className={`nav-item${activePage === item.id ? ' active' : ''}`}
              onClick={() => { onNavigate(item.id); onCloseMobile(); }}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}

          <p className="nav-section-label" style={{ marginTop: '0.5rem' }}>Lessons</p>
          {NAV_ITEMS.slice(1, 11).map(item => (
            <button
              key={item.id}
              className={`nav-item${activePage === item.id ? ' active' : ''}`}
              onClick={() => { onNavigate(item.id); onCloseMobile(); }}
            >
              <span className="nav-icon">{item.icon}</span>
              <div>
                <div style={{ lineHeight: 1.2 }}>{item.label}</div>
                {item.labelKannada && (
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'Noto Sans Kannada, sans-serif' }}>
                    {item.labelKannada}
                  </div>
                )}
              </div>
            </button>
          ))}

          <p className="nav-section-label" style={{ marginTop: '0.5rem' }}>More</p>
          {NAV_ITEMS.slice(11).map(item => (
            <button
              key={item.id}
              className={`nav-item${activePage === item.id ? ' active' : ''}`}
              onClick={() => { onNavigate(item.id); onCloseMobile(); }}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
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
