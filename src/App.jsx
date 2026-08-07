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
import WordMatchGame from './components/WordMatchGame.jsx';
import ProverbsStudio from './components/ProverbsStudio.jsx';
import TypingTutor from './components/TypingTutor.jsx';
import StoryMode from './components/StoryMode.jsx';
import FillInTheBlanks from './components/FillInTheBlanks.jsx';
import SongsRhymes from './components/SongsRhymes.jsx';
import ProgressReport from './components/ProgressReport.jsx';
import LearningRoadmap from './components/LearningRoadmap.jsx';
import SpacedRepetition from './components/SpacedRepetition.jsx';
import HandwritingPractice from './components/HandwritingPractice.jsx';
import VoiceRecognition from './components/VoiceRecognition.jsx';
import ScrambledWords from './components/ScrambledWords.jsx';
import MemoryCardGame from './components/MemoryCardGame.jsx';
import WordOfTheDay from './components/WordOfTheDay.jsx';
import KannadaCrossword from './components/KannadaCrossword.jsx';
import KarnatakaTour from './components/KarnatakaTour.jsx';
import PhraseBook from './components/PhraseBook.jsx';
import DailyChallenge from './components/DailyChallenge.jsx';
import TransliterationTrainer from './components/TransliterationTrainer.jsx';
import PhraseBuilder from './components/PhraseBuilder.jsx';
import { getCurrentUser, logoutUser, unlockBadge, logModuleVisit } from './utils/storage.js';

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
    logModuleVisit(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPage = () => {
    const props = { onXP: handleXP, onToast: showToast, user };
    const navProps = { ...props, onNavigate: handleNavigate };
    switch (page) {
      case 'dashboard': return <Dashboard user={user} onNavigate={handleNavigate} />;
      case 'leaderboard': return <Leaderboard />;
      case 'roadmap': return <LearningRoadmap onNavigate={handleNavigate} onToast={showToast} />;
      case 'varnamale': return <AlphabetVarnamale {...props} />;
      case 'kagunita': return <KagunitaBuilder {...props} />;
      case 'vocabulary': return <VocabFlashcards {...props} />;
      case 'wordmatch': return <WordMatchGame {...props} />;
      case 'numbers': return <NumberStudio {...props} />;
      case 'typing': return <ScriptPractice {...props} />;
      case 'typingtutor': return <TypingTutor {...props} />;
      case 'grammar': return <SentenceArchitect {...props} />;
      case 'conversations': return <ConversationStudio {...props} />;
      case 'literature': return <LiteratureMasterclass {...props} />;
      case 'pronunciation': return <PronunciationStudio {...props} />;
      case 'proverbs': return <ProverbsStudio {...props} />;
      case 'storymode': return <StoryMode {...props} />;
      case 'fillblanks': return <FillInTheBlanks {...props} />;
      case 'songs': return <SongsRhymes {...props} />;
      case 'handwriting': return <HandwritingPractice {...props} />;
      case 'srs': return <SpacedRepetition {...props} />;
      case 'progress': return <ProgressReport user={user} />;
      case 'quizzes': return <QuizDrills {...props} />;
      case 'achievements': return <Achievements user={user} />;
      case 'dictionary': return <Dictionary />;
      case 'voicerecog': return <VoiceRecognition {...props} />;
      case 'scrambled': return <ScrambledWords {...props} />;
      case 'memorygame': return <MemoryCardGame {...props} />;
      case 'wordofday': return <WordOfTheDay {...props} />;
      case 'crossword': return <KannadaCrossword {...props} />;
      case 'tour': return <KarnatakaTour {...props} />;
      case 'phrasebook': return <PhraseBook {...props} />;
      case 'dailychallenge': return <DailyChallenge {...props} />;
      case 'translit': return <TransliterationTrainer {...props} />;
      case 'phrasebuilder': return <PhraseBuilder {...props} />;
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
