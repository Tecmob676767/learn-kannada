import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import CherryBlossomCanvas from './components/CherryBlossomCanvas.jsx';
import LoginPage from './components/LoginPage.jsx';
import Sidebar from './components/Sidebar.jsx';
import Dashboard from './components/Dashboard.jsx';
import BugReportButton from './components/BugReportButton.jsx';
import BroadcastBanner from './components/BroadcastBanner.jsx';
import AdSenseAdBreak from './components/AdSenseAdBreak.jsx';
import PWAInstallBanner from './components/PWAInstallBanner.jsx';

// ── Lazy-loaded modules for lightning-fast initial load ─────────────────────
const Leaderboard = lazy(() => import('./components/Leaderboard.jsx'));
const AlphabetVarnamale = lazy(() => import('./components/AlphabetVarnamale.jsx'));
const KagunitaBuilder = lazy(() => import('./components/KagunitaBuilder.jsx'));
const VocabFlashcards = lazy(() => import('./components/VocabFlashcards.jsx'));
const NumberStudio = lazy(() => import('./components/NumberStudio.jsx'));
const ScriptPractice = lazy(() => import('./components/ScriptPractice.jsx'));
const SentenceArchitect = lazy(() => import('./components/SentenceArchitect.jsx'));
const ConversationStudio = lazy(() => import('./components/ConversationStudio.jsx'));
const LiteratureMasterclass = lazy(() => import('./components/LiteratureMasterclass.jsx'));
const QuizDrills = lazy(() => import('./components/QuizDrills.jsx'));
const Achievements = lazy(() => import('./components/Achievements.jsx'));
const Dictionary = lazy(() => import('./components/Dictionary.jsx'));
const PronunciationStudio = lazy(() => import('./components/PronunciationStudio.jsx'));
const WordMatchGame = lazy(() => import('./components/WordMatchGame.jsx'));
const ProverbsStudio = lazy(() => import('./components/ProverbsStudio.jsx'));
const TypingTutor = lazy(() => import('./components/TypingTutor.jsx'));
const StoryMode = lazy(() => import('./components/StoryMode.jsx'));
const FillInTheBlanks = lazy(() => import('./components/FillInTheBlanks.jsx'));
const SongsRhymes = lazy(() => import('./components/SongsRhymes.jsx'));
const ProgressReport = lazy(() => import('./components/ProgressReport.jsx'));
const LearningRoadmap = lazy(() => import('./components/LearningRoadmap.jsx'));
const LessonPath = lazy(() => import('./components/LessonPath.jsx'));
const SobaguAI = lazy(() => import('./components/SobaguAI.jsx'));
const CertificateStudio = lazy(() => import('./components/CertificateStudio.jsx'));
const Leagues = lazy(() => import('./components/Leagues.jsx'));
const SpacedRepetition = lazy(() => import('./components/SpacedRepetition.jsx'));
const HandwritingPractice = lazy(() => import('./components/HandwritingPractice.jsx'));
const VoiceRecognition = lazy(() => import('./components/VoiceRecognition.jsx'));
const ScrambledWords = lazy(() => import('./components/ScrambledWords.jsx'));
const MemoryCardGame = lazy(() => import('./components/MemoryCardGame.jsx'));
const WordOfTheDay = lazy(() => import('./components/WordOfTheDay.jsx'));
const KannadaCrossword = lazy(() => import('./components/KannadaCrossword.jsx'));
const KarnatakaTour = lazy(() => import('./components/KarnatakaTour.jsx'));
const PhraseBook = lazy(() => import('./components/PhraseBook.jsx'));
const DailyChallenge = lazy(() => import('./components/DailyChallenge.jsx'));
const TransliterationTrainer = lazy(() => import('./components/TransliterationTrainer.jsx'));
const PhraseBuilder = lazy(() => import('./components/PhraseBuilder.jsx'));
const Settings = lazy(() => import('./components/Settings.jsx'));
const EmblemStudio = lazy(() => import('./components/EmblemStudio.jsx'));
const GrammarStudio = lazy(() => import('./components/GrammarStudio.jsx'));
const PromotionalHub = lazy(() => import('./components/PromotionalHub.jsx'));
const KannadaKeyboard = lazy(() => import('./components/KannadaKeyboard.jsx'));
const FlashcardDeck = lazy(() => import('./components/FlashcardDeck.jsx'));
const WritingChallenge = lazy(() => import('./components/WritingChallenge.jsx'));
const AudioLessons = lazy(() => import('./components/AudioLessons.jsx'));
const CulturalQuiz = lazy(() => import('./components/CulturalQuiz.jsx'));
const PhraseTranslator = lazy(() => import('./components/PhraseTranslator.jsx'));
const KannadaNumberGame = lazy(() => import('./components/KannadaNumberGame.jsx'));
const GrammarExplainer = lazy(() => import('./components/GrammarExplainer.jsx'));
const FestivalCalendar = lazy(() => import('./components/FestivalCalendar.jsx'));
const SpeedTyping = lazy(() => import('./components/SpeedTyping.jsx'));
const SobaguControlCenter = lazy(() => import('./components/SobaguControlCenter.jsx'));
const PlumineCSModal = lazy(() => import('./components/PlumineCSModal.jsx'));

// ── 20 Ultra-Advanced New Interactive Features ────────────────────────────────
const ColorStudio = lazy(() => import('./components/ColorStudio.jsx'));
const FamilyTree = lazy(() => import('./components/FamilyTree.jsx'));
const FoodMenu = lazy(() => import('./components/FoodMenu.jsx'));
const AnimalKingdom = lazy(() => import('./components/AnimalKingdom.jsx'));
const EmotionCards = lazy(() => import('./components/EmotionCards.jsx'));
const BodyParts = lazy(() => import('./components/BodyParts.jsx'));
const DaysAndMonths = lazy(() => import('./components/DaysAndMonths.jsx'));
const NatureAndWeather = lazy(() => import('./components/NatureAndWeather.jsx'));
const KannadaRiddles = lazy(() => import('./components/KannadaRiddles.jsx'));
const VerbConjugation = lazy(() => import('./components/VerbConjugation.jsx'));
const TimeAndClock = lazy(() => import('./components/TimeAndClock.jsx'));
const OppositesGame = lazy(() => import('./components/OppositesGame.jsx'));
const MarketBargain = lazy(() => import('./components/MarketBargain.jsx'));
const KannadaJokes = lazy(() => import('./components/KannadaJokes.jsx'));
const ProfessionStudio = lazy(() => import('./components/ProfessionStudio.jsx'));
const HouseAndHome = lazy(() => import('./components/HouseAndHome.jsx'));
const VehicleTransport = lazy(() => import('./components/VehicleTransport.jsx'));
const ShapesAndMath = lazy(() => import('./components/ShapesAndMath.jsx'));
const ClothingStudio = lazy(() => import('./components/ClothingStudio.jsx'));
const KitchenUtensils = lazy(() => import('./components/KitchenUtensils.jsx'));

// ── 20 Cutting-Edge AI, Multiplayer, Transit & Retention Features ───────────────
const AccentWaveformAnalyzer = lazy(() => import('./components/AccentWaveformAnalyzer.jsx'));
const ObjectScanner = lazy(() => import('./components/ObjectScanner.jsx'));
const StoryAdventure = lazy(() => import('./components/StoryAdventure.jsx'));
const AutoRickshawAI = lazy(() => import('./components/AutoRickshawAI.jsx'));
const TriviaDuel = lazy(() => import('./components/TriviaDuel.jsx'));
const MultiplayerArena = lazy(() => import('./components/MultiplayerArena.jsx'));
const StudyCircles = lazy(() => import('./components/StudyCircles.jsx'));
const VoiceDailyChallenge = lazy(() => import('./components/VoiceDailyChallenge.jsx'));
const KannadaWordle = lazy(() => import('./components/KannadaWordle.jsx'));
const TechParkKannada = lazy(() => import('./components/TechParkKannada.jsx'));
const SignboardDecoder = lazy(() => import('./components/SignboardDecoder.jsx'));
const MetroNavigator = lazy(() => import('./components/MetroNavigator.jsx'));
const DialectExplorer = lazy(() => import('./components/DialectExplorer.jsx'));
const AnimatedTracing = lazy(() => import('./components/AnimatedTracing.jsx'));
const ComicBuilder = lazy(() => import('./components/ComicBuilder.jsx'));
const SongSubtitleReader = lazy(() => import('./components/SongSubtitleReader.jsx'));
const OfflinePwaPack = lazy(() => import('./components/OfflinePwaPack.jsx'));
const CustomDeckCreator = lazy(() => import('./components/CustomDeckCreator.jsx'));
const YakshaganaTheater = lazy(() => import('./components/YakshaganaTheater.jsx'));
const MistakeBank = lazy(() => import('./components/MistakeBank.jsx'));
const KannadaNewsDigest = lazy(() => import('./components/KannadaNewsDigest.jsx'));
const AboutMission = lazy(() => import('./components/AboutMission.jsx'));
const BlogHub = lazy(() => import('./components/BlogHub.jsx'));
const GoogleTranslateWidget = lazy(() => import('./components/GoogleTranslateWidget.jsx'));
const OfflineScreen = lazy(() => import('./components/OfflineScreen.jsx'));

// ── Social Hub & Multiplayer Features ────────────────────────────────────────
const SocialHub       = lazy(() => import('./components/SocialHub.jsx'));
const AddFriend       = lazy(() => import('./components/AddFriend.jsx'));
const FriendsList     = lazy(() => import('./components/FriendsList.jsx'));
const CallScreen      = lazy(() => import('./components/CallScreen.jsx'));
const FriendChat      = lazy(() => import('./components/FriendChat.jsx'));
const LiveDuel        = lazy(() => import('./components/LiveDuel.jsx'));
const GroupQuizRoom   = lazy(() => import('./components/GroupQuizRoom.jsx'));
const CoopLessonRoom  = lazy(() => import('./components/CoopLessonRoom.jsx'));
const FriendLeaderboard = lazy(() => import('./components/FriendLeaderboard.jsx'));
const ChallengeSystem = lazy(() => import('./components/ChallengeSystem.jsx'));
const SpeedTypingRace = lazy(() => import('./components/SpeedTypingRace.jsx'));

import { getPageFromUrl, navigateToPage } from './utils/router.js';
import { getCurrentUser, logoutUser, unlockBadge, logModuleVisit, updateUser, isDoubleXPHappyHour, loginUser, importMagicSyncToken } from './utils/storage.js';
import { syncUserToCloud } from './utils/onlineLeaderboard.js';
import { playSuccess, playLevelUp, playFanfare, playClick } from './utils/soundEffects.js';

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

import { startOnlineHeartbeat, subscribeSocialEvents } from './utils/friendsStorage.js';
import { initPeer, registerCallHandlers, destroyPeer } from './utils/webrtcService.js';

// ── App ──────────────────────────────────────────────────────────────────────
function App() {
  const [user, setUser]         = useState(null);
  const [page, setPage]         = useState(() => getPageFromUrl());
  const [view, setView]         = useState('app'); // 'app' | 'controlcenter'
  const [toasts, setToasts]     = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showPlumineModal, setShowPlumineModal] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [overrideOffline, setOverrideOffline] = useState(false);

  // ── Call State ───────────────────────────────────────────────────────────
  const [callState, setCallState] = useState({
    active: false, incoming: false, type: 'voice',
    friendCode: null, friendName: null, incomingCallObj: null,
  });

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);

  const refreshUser = useCallback(() => {
    const updated = getCurrentUser();
    if (updated) setUser({ ...updated });
  }, []);

  // Network Online / Offline Detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setOverrideOffline(false);
      showToast('🟢 Back Online! Studio HD Voice Active', 'success');
    };
    const handleOffline = () => {
      setIsOnline(false);
      setOverrideOffline(false);
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showToast]);

  // Browser History Navigation (Back / Forward URL Sync)
  useEffect(() => {
    const handlePopState = () => {
      const targetPage = getPageFromUrl();
      setPage(targetPage);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Auto-login via Magic Sync Link or Query Code if opened on another device
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const syncData = params.get('sync_data');
    const directCode = params.get('code');

    if (syncData) {
      importMagicSyncToken(syncData).then((res) => {
        if (res?.success && res.user) {
          setUser(res.user);
          applyTheme(res.user.settings?.theme || 'standard');
          showToast(`⚡ Plumine CS+ Quantum Sync Active! Welcome ${res.user.name}! 🌸`, 'success');
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      });
    } else if (directCode && directCode.length === 6) {
      loginUser(directCode).then((u) => {
        if (u && !u.banned) {
          setUser(u);
          applyTheme(u.settings?.theme || 'standard');
          showToast(`⚡ Welcome back, ${u.name}! 🌸`, 'success');
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      });
    }
  }, [showToast]);

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
  }, [user?.streak, showToast]);

  // Multi-Tab Real-Time State Mesh (BroadcastChannel + Storage Event Listener)
  useEffect(() => {
    let channel = null;
    try {
      if ('BroadcastChannel' in window) {
        channel = new BroadcastChannel('sobagu_state_mesh');
        channel.onmessage = (event) => {
          if (event.data?.type === 'USER_STATE_UPDATE') {
            const updated = getCurrentUser();
            if (updated) setUser({ ...updated });
          }
        };
      }
    } catch (_e) {}

    const handleStorage = (e) => {
      if (e.key === 'sobagu_current_user' || e.key === 'sobagu_users') {
        const updated = getCurrentUser();
        if (updated) setUser({ ...updated });
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      if (channel) channel.close();
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // Global Secret Master Shortcut: Ctrl + Shift + O opens Founder / Admin Control Center without any UI clue
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'o' || e.key === 'O' || e.code === 'KeyO')) {
        e.preventDefault();
        setView('controlcenter');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Background Cloud Storage API sync (every 90s & on tab refocus)
  useEffect(() => {
    if (!user || !user.code) return;
    const sync = () => {
      const activeUser = getCurrentUser();
      if (activeUser) syncUserToCloud(activeUser);
    };

    const interval = setInterval(sync, 90000);
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

  // ── WebRTC Peer Init + Online Heartbeat ───────────────────────────────────
  useEffect(() => {
    if (!user?.code) return;
    // Start online heartbeat so friends can see us as "online"
    const stopHeartbeat = startOnlineHeartbeat(user.code);
    // Register call handlers
    registerCallHandlers({
      onIncoming: ({ call, callerCode }) => {
        try {
          const users = JSON.parse(localStorage.getItem('sobagu_users') || '{}');
          const callerName = users[callerCode]?.name || 'Unknown';
          setCallState({ active: false, incoming: true, type: 'video', friendCode: callerCode, friendName: callerName, incomingCallObj: call });
        } catch { /* ignore */ }
      },
      onEnded: () => setCallState({ active: false, incoming: false, type: 'voice', friendCode: null, friendName: null, incomingCallObj: null }),
      onRemote: () => {},
      onError: () => showToast('Call connection failed. Check your internet.', 'error'),
    });
    // Initialize peer (non-blocking)
    initPeer(user.code).catch(() => { /* ignore peer init failures */ });
    // Subscribe to social events
    const unsub = subscribeSocialEvents((event) => {
      if (event.type === 'FRIEND_REQUEST' && event.to === user.code) {
        showToast('You have a new friend request!', 'info');
      }
      if (event.type === 'FRIEND_ACCEPTED' && event.with === user.code) {
        showToast('Friend request accepted!', 'success');
      }
    });
    return () => {
      stopHeartbeat();
      unsub();
      destroyPeer();
    };
  }, [user?.code, showToast]);

  const handleStartCall = useCallback((type, friendCode, friendName) => {
    setCallState({ active: true, incoming: false, type, friendCode, friendName, incomingCallObj: null });
  }, []);

  const handleCallEnd = useCallback(() => {
    setCallState({ active: false, incoming: false, type: 'voice', friendCode: null, friendName: null, incomingCallObj: null });
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
    const isHappyHour = isDoubleXPHappyHour();
    const finalAmount = isHappyHour ? amount * 2 : amount;
    playSuccess();
    showToast(isHappyHour ? `🔥 2X HAPPY HOUR! +${finalAmount} XP earned!` : `+${finalAmount} XP earned! 🌸`, 'xp');
    refreshUser();
  };

  const handleNavigate = (p) => {
    playClick();
    if (p === 'controlcenter') {
      if (user && (user.role === 'admin' || user.role === 'founder')) {
        setPage(p);
        navigateToPage(p);
      } else {
        setView('controlcenter');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setPage(p);
    navigateToPage(p);
    logModuleVisit(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /** Called by Settings when theme changes */
  const handleThemeChange = (themeId) => {
    applyTheme(themeId);
    refreshUser();
  };

  const renderPage = () => {
    const props = { onXP: handleXP, onToast: showToast, user, onRefreshUser: refreshUser, onOpenPlumineModal: () => setShowPlumineModal(true) };
    switch (page) {
      case 'dashboard':      return <Dashboard user={user} onNavigate={handleNavigate} />;
      case 'ai':
      case 'sobaguai':
      case 'aicoach':        return <SobaguAI {...props} />;
      case 'lessons':
      case 'lessonpath':     return <LessonPath onNavigate={handleNavigate} onToast={showToast} onXP={handleXP} user={user} />;
      case 'leagues':        return <Leagues user={user} onToast={showToast} />;
      case 'certificates':
      case 'certificate':    return <CertificateStudio user={user} onToast={showToast} />;
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
      case 'rewards':
      case 'referral':
      case 'promo':          return <PromotionalHub {...props} />;
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
      // ── 20 Ultra-Advanced New Interactive Features ────────────────────
      case 'colorstudio':
      case 'colors':         return <ColorStudio {...props} />;
      case 'familytree':
      case 'family':         return <FamilyTree {...props} />;
      case 'foodmenu':
      case 'food':           return <FoodMenu {...props} />;
      case 'animalkingdom':
      case 'animals':        return <AnimalKingdom {...props} />;
      case 'emotioncards':
      case 'emotions':       return <EmotionCards {...props} />;
      case 'bodyparts':
      case 'body':           return <BodyParts {...props} />;
      case 'daysandmonths':
      case 'days':           return <DaysAndMonths {...props} />;
      case 'natureandweather':
      case 'nature':         return <NatureAndWeather {...props} />;
      case 'kannadariddles':
      case 'riddles':        return <KannadaRiddles {...props} />;
      case 'verbconjugation':
      case 'verbs':          return <VerbConjugation {...props} />;
      case 'timeandclock':
      case 'time':           return <TimeAndClock {...props} />;
      case 'oppositesgame':
      case 'opposites':      return <OppositesGame {...props} />;
      case 'marketbargain':
      case 'bargain':        return <MarketBargain {...props} />;
      case 'kannadajokes':
      case 'jokes':          return <KannadaJokes {...props} />;
      case 'professionstudio':
      case 'professions':    return <ProfessionStudio {...props} />;
      case 'houseandhome':
      case 'home':           return <HouseAndHome {...props} />;
      case 'vehicletransport':
      case 'transport':      return <VehicleTransport {...props} />;
      case 'shapesandmath':
      case 'shapes':         return <ShapesAndMath {...props} />;
      case 'clothingstudio':
      case 'clothing':       return <ClothingStudio {...props} />;
      case 'kitchenutensils':
      case 'kitchen':        return <KitchenUtensils {...props} />;
      // ── 20 Cutting-Edge AI, Multiplayer, Transit & Retention Features ────────
      case 'accentwaveform':
      case 'waveform':       return <AccentWaveformAnalyzer {...props} />;
      case 'objectscanner':
      case 'scanner':        return <ObjectScanner {...props} />;
      case 'storyadventure':
      case 'adventure':      return <StoryAdventure {...props} />;
      case 'autorickshawai':
      case 'autorickshaw':   return <AutoRickshawAI {...props} />;
      case 'triviaduel':     return <TriviaDuel {...props} />;
      case 'multiplayer':
      case 'arena':
      case 'voicecall':
      case 'videocall':
      case 'pvp':
      case 'duel':           return <MultiplayerArena {...props} onNavigate={handleNavigate} />;
      case 'studycircles':
      case 'circles':        return <StudyCircles {...props} />;
      case 'voicedailychallenge':
      case 'voicedaily':     return <VoiceDailyChallenge {...props} />;
      case 'kannadawordle':
      case 'wordle':         return <KannadaWordle {...props} />;
      case 'techparkkannada':
      case 'techpark':       return <TechParkKannada {...props} />;
      case 'signboarddecoder':
      case 'signboards':     return <SignboardDecoder {...props} />;
      case 'metronavigator':
      case 'metro':          return <MetroNavigator {...props} />;
      case 'dialectexplorer':
      case 'dialects':       return <DialectExplorer {...props} />;
      case 'animatedtracing':
      case 'tracing':        return <AnimatedTracing {...props} />;
      case 'comicbuilder':
      case 'comics':         return <ComicBuilder {...props} />;
      case 'songsubtitlereader':
      case 'subtitles':      return <SongSubtitleReader {...props} />;
      case 'offlinepwapack':
      case 'offlinepacks':   return <OfflinePwaPack {...props} />;
      case 'customdeckcreator':
      case 'customdeck':     return <CustomDeckCreator {...props} />;
      case 'yakshaganatheater':
      case 'yakshagana':     return <YakshaganaTheater {...props} />;
      case 'mistakebank':
      case 'mistakes':       return <MistakeBank {...props} />;
      case 'kannadanewsdigest':
      case 'news':           return <KannadaNewsDigest {...props} />;
      // ── Our Mission & Founder's Story ────────────────────────────────
      case 'about':
      case 'mission':
      case 'ourmission':
      case 'founder':        return <AboutMission onNavigate={handleNavigate} />;
      // ── Blog & Articles ──────────────────────────────────────────────
      case 'blog':
      case 'articles':
      case 'posts':          return <BlogHub onNavigate={handleNavigate} onToast={showToast} />;
      // ── settings (with theme change callback) ────────────────────────
      case 'settings':       return <Settings {...props} onThemeChange={handleThemeChange} onOpenPlumineModal={() => setShowPlumineModal(true)} />;
      case 'controlcenter':  return <SobaguControlCenter onExit={() => { setView('app'); setPage('dashboard'); navigateToPage('dashboard'); }} onToast={showToast} />;
      // ── Social Hub & Multiplayer Features ────────────────────────────
      case 'socialhub':
      case 'social':         return <SocialHub user={user} onNavigate={handleNavigate} onToast={showToast} />;
      case 'addfriend':
      case 'friends':        return <AddFriend user={user} onToast={showToast} />;
      case 'friendslist':    return <FriendsList user={user} onToast={showToast} onNavigate={handleNavigate} onStartCall={handleStartCall} />;
      case 'friendchat':
      case 'chat':           return <FriendChat user={user} onToast={showToast} onNavigate={handleNavigate} />;
      case 'liveduel':
      case 'duel1v1':        return <LiveDuel {...props} onNavigate={handleNavigate} />;
      case 'groupquiz':
      case 'quizroom':       return <GroupQuizRoom {...props} onNavigate={handleNavigate} />;
      case 'cooplesson':
      case 'coopstudy':      return <CoopLessonRoom {...props} onNavigate={handleNavigate} />;
      case 'friendleaderboard':
      case 'friendboard':    return <FriendLeaderboard user={user} onNavigate={handleNavigate} />;
      case 'challengesystem':
      case 'challenges':     return <ChallengeSystem {...props} onNavigate={handleNavigate} />;
      case 'speedtypingrace':
      case 'typingrace':
      case 'race':           return <SpeedTypingRace {...props} onNavigate={handleNavigate} />;
      default:               return <Dashboard user={user} onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="app-wrapper">
      <div className="app-bg-gradient" />
      <CherryBlossomCanvas />
      <PWAInstallBanner showToast={showToast} />
      <BroadcastBanner />
      <Toast toasts={toasts} />
      <AdSenseAdBreak onToast={showToast} />

      <Suspense fallback={<div className="learning-screen" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffa366', fontWeight: 700, fontSize: '1.1rem' }}>🌸 Loading...</div>}>
        {!isOnline && !overrideOffline ? (
          <OfflineScreen
            onRetry={() => setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : true)}
            onContinueOffline={() => setOverrideOffline(true)}
          />
        ) : !user ? (
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
                onOpenPlumineModal={() => setShowPlumineModal(true)}
                mobileOpen={mobileOpen}
                onCloseMobile={() => setMobileOpen(false)}
              />
              <main className="main-content" onClick={() => mobileOpen && setMobileOpen(false)}>
                {renderPage()}
              </main>
            </div>
            <GoogleTranslateWidget onToast={showToast} />
            <BugReportButton onToast={showToast} />
          </>
        )}

        {showPlumineModal && (
          <PlumineCSModal
            isOpen={showPlumineModal}
            onClose={() => setShowPlumineModal(false)}
            onToast={showToast}
            onRefreshUser={refreshUser}
          />
        )}

        <CallScreen
          user={user}
          callState={callState}
          onCallEnd={handleCallEnd}
        />
      </Suspense>
    </div>
  );
}

export default App;
