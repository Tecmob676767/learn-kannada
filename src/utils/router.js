// Sobagu Intelligent Multi-URL Deep Linking Router
// Provides 100% seamless URL navigation, browser history (back/forward), and deep link routing.

export const ROUTE_MAP = {
  // Main Hub
  '': 'dashboard',
  'dashboard': 'dashboard',
  'home': 'dashboard',
  
  // Script & Alphabet
  'varnamale': 'varnamale',
  'kagunita': 'kagunita',
  'script': 'script',
  'handwriting': 'handwriting',
  'keyboard': 'keyboard',
  'transliteration': 'transliteration',

  // Vocabulary & Words
  'vocabulary': 'vocabulary',
  'dictionary': 'dictionary',
  'flashcards': 'srs',
  'srs': 'srs',
  'custom-deck': 'deck',
  'word-of-the-day': 'wordoftheday',

  // Numbers & Math
  'numbers': 'numbers',
  'number-game': 'numbergame',

  // Grammar & Sentences
  'grammar': 'grammar',
  'grammar-explainer': 'grammarexplainer',
  'sentences': 'sentences',
  'phrase-builder': 'phrasebuilder',
  'phrases': 'phrases',
  'translator': 'translator',

  // Conversations & Culture
  'conversations': 'conversations',
  'stories': 'stories',
  'rhymes': 'rhymes',
  'proverbs': 'proverbs',
  'literature': 'literature',
  'karnataka-tour': 'tour',
  'calendar': 'calendar',
  'cultural-quiz': 'cultural',
  'audio-lessons': 'audio',

  // Speech & Voice
  'pronunciation': 'pronunciation',
  'voice': 'voice',

  // Typing & Speed
  'typing': 'typing',
  'speed-typing': 'speedtyping',

  // Games & Quizzes
  'quizzes': 'quizzes',
  'word-match': 'wordmatch',
  'scrambled': 'scrambled',
  'crossword': 'crossword',
  'memory': 'memory',
  'fill-blanks': 'blanks',
  'writing': 'writing',
  'daily-challenge': 'daily',

  // AI & Advanced
  'ai': 'ai',
  'sobagu-ai': 'ai',
  'tutor': 'ai',

  // Growth & Roadmap
  'roadmap': 'roadmap',
  'lessons': 'lessons',
  'leaderboard': 'leaderboard',
  'leagues': 'leagues',
  'achievements': 'achievements',
  'emblems': 'emblems',
  'certificates': 'certificates',
  'progress': 'progress',
  'promotions': 'promotions',

  // 20 Exciting New Features
  'colors': 'colorstudio',
  'family': 'familytree',
  'food': 'foodmenu',
  'animals': 'animalkingdom',
  'emotions': 'emotioncards',
  'body': 'bodyparts',
  'days': 'daysandmonths',
  'nature': 'natureandweather',
  'riddles': 'kannadariddles',
  'verbs': 'verbconjugation',
  'time': 'timeandclock',
  'opposites': 'oppositesgame',
  'bargain': 'marketbargain',
  'jokes': 'kannadajokes',
  'professions': 'professionstudio',
  'home': 'houseandhome',
  'transport': 'vehicletransport',
  'shapes': 'shapesandmath',
  'clothing': 'clothingstudio',
  'kitchen': 'kitchenutensils',

  // System
  'settings': 'settings',
  'controlcenter': 'controlcenter',
};

// Reverse map: Page ID -> URL Path
export const PAGE_TO_ROUTE = {
  dashboard: '',
  varnamale: 'varnamale',
  kagunita: 'kagunita',
  script: 'script',
  handwriting: 'handwriting',
  keyboard: 'keyboard',
  transliteration: 'transliteration',
  vocabulary: 'vocabulary',
  dictionary: 'dictionary',
  srs: 'flashcards',
  deck: 'custom-deck',
  wordoftheday: 'word-of-the-day',
  numbers: 'numbers',
  numbergame: 'number-game',
  grammar: 'grammar',
  grammarexplainer: 'grammar-explainer',
  sentences: 'sentences',
  phrasebuilder: 'phrase-builder',
  phrases: 'phrases',
  translator: 'translator',
  conversations: 'conversations',
  stories: 'stories',
  rhymes: 'rhymes',
  proverbs: 'proverbs',
  literature: 'literature',
  tour: 'karnataka-tour',
  calendar: 'calendar',
  cultural: 'cultural-quiz',
  audio: 'audio-lessons',
  pronunciation: 'pronunciation',
  voice: 'voice',
  typing: 'typing',
  speedtyping: 'speed-typing',
  quizzes: 'quizzes',
  wordmatch: 'word-match',
  scrambled: 'scrambled',
  crossword: 'crossword',
  memory: 'memory',
  blanks: 'fill-blanks',
  writing: 'writing',
  daily: 'daily-challenge',
  ai: 'ai',
  roadmap: 'roadmap',
  lessons: 'lessons',
  leaderboard: 'leaderboard',
  leagues: 'leagues',
  achievements: 'achievements',
  emblems: 'emblems',
  certificates: 'certificates',
  progress: 'progress',
  promotions: 'promotions',
  colorstudio: 'colors',
  familytree: 'family',
  foodmenu: 'food',
  animalkingdom: 'animals',
  emotioncards: 'emotions',
  bodyparts: 'body',
  daysandmonths: 'days',
  natureandweather: 'nature',
  kannadariddles: 'riddles',
  verbconjugation: 'verbs',
  timeandclock: 'time',
  oppositesgame: 'opposites',
  marketbargain: 'bargain',
  kannadajokes: 'jokes',
  professionstudio: 'professions',
  houseandhome: 'home',
  vehicletransport: 'transport',
  shapesandmath: 'shapes',
  clothingstudio: 'clothing',
  kitchenutensils: 'kitchen',
  settings: 'settings',
  controlcenter: 'controlcenter',
};

/**
 * Get current page ID from browser URL pathname
 */
export const getPageFromUrl = () => {
  if (typeof window === 'undefined') return 'dashboard';
  const path = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
  return ROUTE_MAP[path] || 'dashboard';
};

/**
 * Navigate to a new page and update browser URL without page reload
 */
export const navigateToPage = (pageId, replace = false) => {
  if (typeof window === 'undefined') return;
  const routeSegment = PAGE_TO_ROUTE[pageId] !== undefined ? PAGE_TO_ROUTE[pageId] : pageId;
  const newPath = routeSegment ? `/${routeSegment}` : '/';
  
  // Preserve existing query params if any (e.g., ?code=... or ?sync=...)
  const search = window.location.search;
  const fullUrl = `${newPath}${search}`;

  if (window.location.pathname !== newPath) {
    if (replace) {
      window.history.replaceState({ page: pageId }, '', fullUrl);
    } else {
      window.history.pushState({ page: pageId }, '', fullUrl);
    }
  }

  // Update document title dynamically
  const titleSegment = routeSegment ? routeSegment.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Dashboard';
  document.title = `Sobagu Kannada · ${titleSegment}`;
};
