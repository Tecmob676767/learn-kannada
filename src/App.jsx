import React, { useState, useEffect, useCallback } from 'react';
import CherryBlossomCanvas from './components/CherryBlossomCanvas.jsx';
import LoginPage from './components/LoginPage.jsx';
import Sidebar from './components/Sidebar.jsx';
import Dashboard from './components/Dashboard.jsx';
import Leaderboard from './components/Leaderboard.jsx';
import AlphabetVarnamale from './components/AlphabetVarnamale.jsx';
import KagunitaBuilder from './components/KagunitaBuilder.jsx';
import VocabFlashcards from './components/VocabFlashcards.jsx';
import NumberStudio from './components/NumberStudio.jsx';
import ScriptPractice from './components/ScriptPractice.jsx';
import SentenceArchitect from './components/SentenceArchitect.jsx';
import ConversationStudio from './components/ConversationStudio.jsx';
import LiteratureMasterclass from './components/LiteratureMasterclass.jsx';
import QuizDrills from './components/QuizDrills.jsx';
import Achievements from './components/Achievements.jsx';
import Dictionary from './components/Dictionary.jsx';
import PronunciationStudio from './components/PronunciationStudio.jsx';
import { getCurrentUser, logoutUser, unlockBadge } from './utils/storage.js';

const Toast = ({ toasts }) => (
  <div className="toast-container">
    {toasts.map(t => (
      <div key={t.id} className={`toast ${t.type || 'info'}`}>
        {t.message}
      </div>
    ))}
  </div>
);

function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('dashboard');
  const [toasts, setToasts] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Load persisted user on mount
  useEffect(() => {
    const u = getCurrentUser();
    if (u) {
      setUser(u);
      if (!u.badges?.includes('first_login')) {
        unlockBadge('first_login');
        showToast('🌱 Badge Unlocked: First Step!', 'xp');
      }
    }
  }, []);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);

  const handleLogin = (u) => {
    setUser(u);
    if (!u.badges?.includes('first_login')) {
      unlockBadge('first_login');
      setTimeout(() => showToast('🌱 Badge Unlocked: First Step!', 'xp'), 800);
    }
    showToast(`ನಮಸ್ಕಾರ ${u.name}! Welcome back! 🌸`, 'success');
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setPage('dashboard');
  };

  const handleXP = (amount) => {
    showToast(`+${amount} XP earned! 🌸`, 'xp');
    const updated = getCurrentUser();
    if (updated) setUser({ ...updated });
  };

  const handleNavigate = (p) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPage = () => {
    const props = { onXP: handleXP, onToast: showToast, user };
    switch (page) {
      case 'dashboard': return <Dashboard user={user} onNavigate={handleNavigate} />;
      case 'leaderboard': return <Leaderboard />;
      case 'varnamale': return <AlphabetVarnamale {...props} />;
      case 'kagunita': return <KagunitaBuilder {...props} />;
      case 'vocabulary': return <VocabFlashcards {...props} />;
      case 'numbers': return <NumberStudio {...props} />;
      case 'typing': return <ScriptPractice {...props} />;
      case 'grammar': return <SentenceArchitect {...props} />;
      case 'conversations': return <ConversationStudio {...props} />;
      case 'literature': return <LiteratureMasterclass {...props} />;
      case 'quizzes': return <QuizDrills {...props} />;
      case 'achievements': return <Achievements user={user} />;
      case 'dictionary': return <Dictionary />;
      case 'pronunciation': return <PronunciationStudio {...props} />;
      default: return <Dashboard user={user} onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="app-wrapper">
      <div className="app-bg-gradient" />
      <CherryBlossomCanvas />
      <Toast toasts={toasts} />

      {!user ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <>
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Open menu"
          >
            ☰
          </button>

          <div className="main-layout">
            <Sidebar
              user={user}
              activePage={page}
              onNavigate={handleNavigate}
              onLogout={handleLogout}
              mobileOpen={mobileOpen}
              onCloseMobile={() => setMobileOpen(false)}
            />
            <main className="main-content" onClick={() => mobileOpen && setMobileOpen(false)}>
              {renderPage()}
            </main>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
