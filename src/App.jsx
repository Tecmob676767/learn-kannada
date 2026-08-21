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
import Settings from './components/Settings.jsx';
import EmblemStudio from './components/EmblemStudio.jsx';
import GrammarStudio from './components/GrammarStudio.jsx';
import KannadaKeyboard from './components/KannadaKeyboard.jsx';
import FlashcardDeck from './components/FlashcardDeck.jsx';
import WritingChallenge from './components/WritingChallenge.jsx';
import AudioLessons from './components/AudioLessons.jsx';
import CulturalQuiz from './components/CulturalQuiz.jsx';
import PhraseTranslator from './components/PhraseTranslator.jsx';
import KannadaNumberGame from './components/KannadaNumberGame.jsx';
import GrammarExplainer from './components/GrammarExplainer.jsx';
import FestivalCalendar from './components/FestivalCalendar.jsx';
import SpeedTyping from './components/SpeedTyping.jsx';
import SobaguControlCenter from './components/SobaguControlCenter.jsx';
import BugReportButton from './components/BugReportButton.jsx';
import BroadcastBanner from './components/BroadcastBanner.jsx';
import SplashScreen from './components/SplashScreen.jsx';
import AdSenseAdBreak from './components/AdSenseAdBreak.jsx';
import { getCurrentUser, logoutUser, unlockBadge, logModuleVisit, updateUser } from './utils/storage.js';
import { syncUserToCloud } from './utils/onlineLeaderboard.js';

// ── Theme palette definitions ────────────────────────────────────────────────
const THEME_PALETTES = {
  standard: {
    '--sakura-pink':    '#ffa366',
    '--sakura-deep':    '#ff6b35',
    '--sakura-light':   '#fff3eb',
    '--sakura-blossom': '#ff8533',
    '--indigo-deep':    '#1c0c02',
    '--indigo-mid':     '#381e0f',
    '--indigo-card':    'rgba(45,22,10,0.72)',
    '--glass-bg':       'rgba(255,240,230,0.07)',
    '--glass-border':   'rgba(255,163,102,0.2)',
    '--glass-border-hover': 'rgba(255,163,102,0.5)',
  },
  gold: {
    '--sakura-pink':    '#ffd700',
    '--sakura-deep':    '#d4af37',
    '--sakura-light':   '#fffbea',
    '--sakura-blossom': '#ffd700',
    '--indigo-deep':    '#0d0a00',
    '--indigo-mid':     '#2a2200',
    '--indigo-card':    'rgba(30,24,0,0.8)',
    '--glass-bg':       'rgba(255,240,160,0.07)',
    '--glass-border':   'rgba(255,215,0,0.22)',
    '--glass-border-hover': 'rgba(255,215,0,0.5)',
  },
  kannada: {
    '--sakura-pink':    '#ffe033',
    '--sakura-deep':    '#e50914',
    '--sakura-light':   '#fff8e1',
    '--sakura-blossom': '#ff6b00',
    '--indigo-deep':    '#0a0000',
    '--indigo-mid':     '#2a0000',
    '--indigo-card':    'rgba(40,0,0,0.8)',
    '--glass-bg':       'rgba(255,100,0,0.07)',
    '--glass-border':   'rgba(229,9,20,0.25)',
    '--glass-border-hover': 'rgba(255,200,0,0.5)',
  },
  teal: {
    '--sakura-pink':    '#38f9d7',
    '--sakura-deep':    '#43e97b',
    '--sakura-light':   '#e8fff7',
    '--sakura-blossom': '#00d4aa',
    '--indigo-deep':    '#00100e',
    '--indigo-mid':     '#002a24',
    '--indigo-card':    'rgba(0,30,25,0.8)',
    '--glass-bg':       'rgba(56,249,215,0.07)',
    '--glass-border':   'rgba(56,249,215,0.2)',
    '--glass-border-hover': 'rgba(56,249,215,0.5)',
  },
  sakura: {
    '--sakura-pink':    '#ffb7c5',
    '--sakura-deep':    '#e8547a',
    '--sakura-light':   '#fff0f4',
    '--sakura-blossom': '#ff8fab',
    '--indigo-deep':    '#1a0010',
    '--indigo-mid':     '#3a0025',
    '--indigo-card':    'rgba(40,0,20,0.75)',
    '--glass-bg':       'rgba(255,183,197,0.07)',
    '--glass-border':   'rgba(232,84,122,0.22)',
    '--glass-border-hover': 'rgba(255,183,197,0.5)',
  },
  midnight: {
    '--sakura-pink':    '#818cf8',
    '--sakura-deep':    '#6366f1',
    '--sakura-light':   '#eef0ff',
    '--sakura-blossom': '#a5b4fc',
    '--indigo-deep':    '#02020f',
    '--indigo-mid':     '#0c0c2a',
    '--indigo-card':    'rgba(5,5,30,0.85)',
    '--glass-bg':       'rgba(99,102,241,0.07)',
    '--glass-border':   'rgba(129,140,248,0.2)',
    '--glass-border-hover': 'rgba(165,180,252,0.5)',
  },
};

/** Apply a theme palette to :root CSS custom properties */
export const applyTheme = (themeId) => {
  const palette = THEME_PALETTES[themeId] || THEME_PALETTES.standard;
  const root = document.documentElement;
  Object.entries(palette).forEach(([k, v]) => root.style.setProperty(k, v));
};

// ── Streak check: called once per session ────────────────────────────────────
const checkAndUpdateStreak = () => {
  const user = getCurrentUser();
  if (!user) return user;
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  let { streak = 0, lastLogin } = user;

  if (lastLogin === today) return user; // already checked today
  if (lastLogin === yesterday) {
    streak = streak + 1;
  } else if (lastLogin !== today) {
    streak = 1; // reset
  }
  const updated = updateUser({ streak, lastLogin: today });
  return updated || user;
};

// ── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ toasts }) => (
  <div className="toast-container">
    {toasts.map(t => (
      <div key={t.id} className={`toast ${t.type || 'info'}`}>{t.message}</div>
    ))}
  </div>
);

// ── App ──────────────────────────────────────────────────────────────────────
function App() {
  const [user, setUser]         = useState(null);
  const [page, setPage]         = useState('dashboard');
  const [view, setView]         = useState('app'); // 'app' | 'controlcenter'
  const [toasts, setToasts]     = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(() => !sessionStorage.getItem('sobagu_splash_shown'));

  // Load user + apply saved theme + check streak on mount
  useEffect(() => {
    let u = getCurrentUser();
    if (u) {
      if (u.banned) {
        logoutUser();
        setUser(null);
        return;
      }
      // Fix streak if needed
      u = checkAndUpdateStreak() || u;
      setUser(u);
      // Apply persisted theme
      const theme = u.settings?.theme || 'standard';
      applyTheme(theme);
      // Badge: first login
      if (!u.badges?.includes('first_login')) {
        unlockBadge('first_login');
      }
    }
  }, []);

  // Streak badge logic
  useEffect(() => {
    if (!user) return;
    if ((user.streak || 0) >= 3 && !user.badges?.includes('streak_3')) {
      unlockBadge('streak_3');
      showToast('🔥 Badge Unlocked: On Fire! (3-day streak)', 'xp');
      setUser(getCurrentUser());
    }
    if ((user.streak || 0) >= 7 && !user.badges?.includes('streak_7')) {
      unlockBadge('streak_7');
      showToast('⚡ Badge Unlocked: Lightning Learner! (7-day streak)', 'xp');
      setUser(getCurrentUser());
    }
  }, [user?.streak]);

  // Background Cloud Storage API sync (every 60s & on tab refocus)
  useEffect(() => {
    if (!user || !user.code) return;
    const sync = () => {
      const activeUser = getCurrentUser();
      if (activeUser) syncUserToCloud(activeUser);
    };

    const interval = setInterval(sync, 60000);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        sync();
      }
    };
    window.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user?.code]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);

  const refreshUser = useCallback(() => {
    const updated = getCurrentUser();
    if (updated) setUser({ ...updated });
  }, []);

  const handleLogin = (u) => {
    // Check streak on login too
    const withStreak = checkAndUpdateStreak() || u;
    setUser(withStreak);
    const theme = withStreak.settings?.theme || 'standard';
    applyTheme(theme);
    if (!withStreak.badges?.includes('first_login')) {
      unlockBadge('first_login');
      setTimeout(() => showToast('🌱 Badge Unlocked: First Step!', 'xp'), 800);
    }
    showToast(`ನಮಸ್ಕಾರ ${withStreak.name}! Welcome back! 🌸`, 'success');
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setPage('dashboard');
    applyTheme('standard'); // reset theme on logout
  };

  const handleXP = (amount) => {
    showToast(`+${amount} XP earned! 🌸`, 'xp');
    refreshUser();
  };

  const handleNavigate = (p) => {
    if (p === 'controlcenter') {
      if (user && (user.role === 'admin' || user.role === 'founder')) {
        setPage(p);
      } else {
        setView('controlcenter');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setPage(p);
    logModuleVisit(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /** Called by Settings when theme changes */
  const handleThemeChange = (themeId) => {
    applyTheme(themeId);
    refreshUser();
  };

  const renderPage = () => {
    const props = { onXP: handleXP, onToast: showToast, user, onRefreshUser: refreshUser };
    switch (page) {
      case 'dashboard':      return <Dashboard user={user} onNavigate={handleNavigate} />;
      case 'leaderboard':    return <Leaderboard />;
      case 'roadmap':        return <LearningRoadmap onNavigate={handleNavigate} onToast={showToast} />;
      case 'varnamale':      return <AlphabetVarnamale {...props} />;
      case 'kagunita':       return <KagunitaBuilder {...props} />;
      case 'vocabulary':     return <VocabFlashcards {...props} />;
      case 'wordmatch':      return <WordMatchGame {...props} />;
      case 'numbers':        return <NumberStudio {...props} />;
      case 'typing':         return <ScriptPractice {...props} />;
      case 'typingtutor':    return <TypingTutor {...props} />;
      case 'grammar':        return <SentenceArchitect {...props} />;
      case 'conversations':  return <ConversationStudio {...props} />;
      case 'literature':     return <LiteratureMasterclass {...props} />;
      case 'pronunciation':  return <PronunciationStudio {...props} />;
      case 'proverbs':       return <ProverbsStudio {...props} />;
      case 'storymode':      return <StoryMode {...props} />;
      case 'fillblanks':     return <FillInTheBlanks {...props} />;
      case 'songs':          return <SongsRhymes {...props} />;
      case 'handwriting':    return <HandwritingPractice {...props} />;
      case 'srs':            return <SpacedRepetition {...props} />;
      case 'progress':       return <ProgressReport user={user} />;
      case 'quizzes':        return <QuizDrills {...props} />;
      case 'achievements':   return <Achievements user={user} />;
      case 'dictionary':     return <Dictionary />;
      case 'voicerecog':     return <VoiceRecognition {...props} />;
      case 'scrambled':      return <ScrambledWords {...props} />;
      case 'memorygame':     return <MemoryCardGame {...props} />;
      case 'wordofday':      return <WordOfTheDay {...props} />;
      case 'crossword':      return <KannadaCrossword {...props} />;
      case 'tour':           return <KarnatakaTour {...props} />;
      case 'phrasebook':     return <PhraseBook {...props} />;
      case 'dailychallenge': return <DailyChallenge {...props} />;
      case 'translit':       return <TransliterationTrainer {...props} />;
      case 'phrasebuilder':  return <PhraseBuilder {...props} />;
      case 'emblem':         return <EmblemStudio {...props} />;
      case 'grammarstudio':  return <GrammarStudio {...props} />;
      // ── 10 new features ──────────────────────────────────────────────
      case 'keyboard':       return <KannadaKeyboard {...props} />;
      case 'flashcards':     return <FlashcardDeck {...props} />;
      case 'writing':        return <WritingChallenge {...props} />;
      case 'audiolessons':   return <AudioLessons {...props} />;
      case 'culturalquiz':   return <CulturalQuiz {...props} />;
      case 'translator':     return <PhraseTranslator {...props} />;
      case 'numbergame':     return <KannadaNumberGame {...props} />;
      case 'grammarhelp':    return <GrammarExplainer {...props} />;
      case 'festivals':      return <FestivalCalendar {...props} />;
      case 'speedtyping':    return <SpeedTyping {...props} />;
      // ── settings (with theme change callback) ────────────────────────
      case 'settings':       return <Settings {...props} onThemeChange={handleThemeChange} />;
      case 'controlcenter':  return <SobaguControlCenter onExit={() => { setView('app'); setPage('dashboard'); }} onToast={showToast} />;
      default:               return <Dashboard user={user} onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="app-wrapper">
      {showSplash && (
        <SplashScreen onDone={() => {
          sessionStorage.setItem('sobagu_splash_shown', '1');
          setShowSplash(false);
        }} />
      )}
      <div className="app-bg-gradient" />
      <CherryBlossomCanvas />
      <BroadcastBanner />
      <Toast toasts={toasts} />
      <AdSenseAdBreak onToast={showToast} />

      {!user ? (
        view === 'controlcenter' ? (
          <SobaguControlCenter onExit={() => setView('app')} onToast={showToast} />
        ) : (
          <LoginPage onLogin={handleLogin} onOpenControlCenter={() => setView('controlcenter')} />
        )
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
          <BugReportButton onToast={showToast} />
        </>
      )}
    </div>
  );
}

export default App;
