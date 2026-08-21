import React from 'react';
import { getLevelTitle, getCurrentLesson } from '../utils/storage.js';
import { comprehensiveDictionary } from '../data/dictionaryData.js';
import { speakKannada } from '../utils/tts.js';

const BADGES_ALL = [
  { id: 'first_login', icon: '🌱', name: 'First Step', desc: 'Logged in for the first time' },
  { id: 'alphabet_done', icon: '🔡', name: 'Akshara Scholar', desc: 'Completed Varnamale' },
  { id: 'kagunita_done', icon: '📊', name: 'Kagunita Master', desc: 'Explored full Kagunita grid' },
  { id: 'vocab_10', icon: '📚', name: 'Word Collector', desc: 'Learned 10 vocabulary words' },
  { id: 'streak_3', icon: '🔥', name: 'On Fire', desc: '3-day learning streak' },
  { id: 'streak_7', icon: '⚡', name: 'Lightning Learner', desc: '7-day streak' },
  { id: 'quiz_perfect', icon: '💯', name: 'Perfect Score', desc: 'Got 100% on a quiz' },
  { id: 'auto_convo', icon: '🛺', name: 'Auto Raja', desc: 'Completed Auto conversation' },
  { id: 'darshini_convo', icon: '🍛', name: 'Darshini Master', desc: 'Ordered food in Kannada' },
  { id: 'literature_done', icon: '📜', name: 'Basavanna\'s Legacy', desc: 'Read all Vachanas' },
  { id: 'level_5', icon: '⭐', name: 'Namma Local', desc: 'Reached Level 5' },
  { id: 'level_10', icon: '👑', name: 'Kannada Kovida', desc: 'Reached Level 10' },
];

const Dashboard = ({ user, onNavigate }) => {
  const levelTitle = getLevelTitle(user.level || 1);
  const xp = user.xp || 0;
  const streak = user.streak || 0;
  const badges = user.badges || [];
  const progress = user.progress || {};

  // Pick a dynamic Word of the Day based on day of year
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  const wordOfTheDay = comprehensiveDictionary[dayOfYear % comprehensiveDictionary.length];

  const LEVEL_CARDS = [
    { id: 'varnamale', icon: '🔡', kan: 'ಅಕ್ಷರ ಮಾಲೆ', title: 'Varnamale', desc: 'Master all 49 Kannada vowels, consonants & conjuncts with audio.', lessons: 3, pct: progress.varnamale || 0, color: '#f8a4b8' },
    { id: 'kagunita', icon: '📊', kan: 'ಕಾಗುಣಿತ', title: 'Kagunita Builder', desc: 'Interactive 16×14 consonant-vowel grid. Click any cell to hear it!', lessons: 1, pct: progress.kagunita || 0, color: '#93c5fd' },
    { id: 'vocabulary', icon: '📚', kan: 'ಶಬ್ದಕೋಶ', title: 'Vocabulary + SRS', desc: '50+ words across 5 decks with spaced repetition flashcards.', lessons: 5, pct: progress.vocabulary || 0, color: '#86efac' },
    { id: 'numbers', icon: '🔢', kan: 'ಸಂಖ್ಯೆಗಳು', title: 'Numbers Studio', desc: 'Master digits 1 to 1000 with Kannada numerals & money counter.', lessons: 2, pct: progress.numbers || 0, color: '#fcd34d' },
    { id: 'typing', icon: '⌨️', kan: 'ಲಿಪಿ ಅಭ್ಯಾಸ', title: 'Script & Keyboard Trainer', desc: 'Practice typing Kannada script on a built-in virtual keyboard.', lessons: 1, pct: progress.typing || 0, color: '#c4b5fd' },
    { id: 'grammar', icon: '✏️', kan: 'ವ್ಯಾಕರಣ', title: 'Sentence Architect', desc: 'Build Kannada sentences with drag-and-drop SOV structure.', lessons: 2, pct: progress.grammar || 0, color: '#fbbf24' },
    { id: 'conversations', icon: '🗣️', kan: 'ಸಂಭಾಷಣೆ', title: 'Conversation Studio', desc: '6 scenarios: Auto, Darshini, Veggies, Metro, Rent & Directions.', lessons: 6, pct: progress.conversations || 0, color: '#f87171' },
    { id: 'pronunciation', icon: '🎙️', kan: 'ಉಚ್ಚಾರಣೆ ಅಭ್ಯಾಸ', title: 'Pronunciation Practice', desc: 'Listen to native Kannada audio, speak into the mic, get scored & learn to sound like a real Kannadiga.', lessons: 4, pct: progress.pronunciation || 0, color: '#f43f5e' },
    { id: 'literature', icon: '📜', kan: 'ಸಾಹಿತ್ಯ', title: 'Literature Masterclass', desc: 'Basavanna\'s Vachanas, proverbs & Kannada movie quotes decoded.', lessons: 3, pct: progress.literature || 0, color: '#a78bfa' },
    { id: 'quizzes', icon: '🎯', kan: 'ಪರೀಕ್ಷೆ', title: 'Quiz Arena', desc: 'Speed rounds, audio match & vocabulary sprints. Earn XP!', lessons: 4, pct: progress.quizzes || 0, color: '#fb923c' },
  ];

  const totalPct = Math.round(LEVEL_CARDS.reduce((a, c) => a + (c.pct || 0), 0) / LEVEL_CARDS.length);

  return (
    <div className="learning-screen">
      <div className="page-header">
        <h2>ನಮಸ್ಕಾರ, {user.name}! 🌸</h2>
        <p>Your Kannada mastery journey — one step at a time.</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="glass-card stat-card">
          <div className="stat-icon">⭐</div>
          <span className="stat-value" style={{ color: '#ffd700' }}>{xp}</span>
          <span className="stat-label">Total XP</span>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon">🎓</div>
          <span className="stat-value" style={{ color: '#f8a4b8' }}>Lv.{user.level || 1}</span>
          <span className="stat-label">{levelTitle}</span>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon">🔥</div>
          <span className="stat-value" style={{ color: '#fb923c' }}>{streak}</span>
          <span className="stat-label">Day Streak</span>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon">🏅</div>
          <span className="stat-value" style={{ color: '#60a5fa' }}>{badges.length}</span>
          <span className="stat-label">Badges Earned</span>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon">📈</div>
          <span className="stat-value" style={{ color: '#4ade80' }}>{totalPct}%</span>
          <span className="stat-label">Overall Progress</span>
        </div>
      </div>

      {/* ── Structured Lesson Path Resume Banner ── */}
      {(() => {
        const nextL = getCurrentLesson();
        const doneCount = (user?.completedLessons || []).length;
        return nextL ? (
          <div 
            className="glass-card" 
            style={{
              padding: '1.5rem 1.75rem',
              marginBottom: '2rem',
              background: 'linear-gradient(135deg, rgba(255,107,53,0.15), rgba(255,163,102,0.06))',
              border: '1.5px solid var(--sakura-pink)',
              boxShadow: '0 8px 30px rgba(255,107,53,0.15)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1.5rem',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ flex: 1, minWidth: '220px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, background: nextL.stageColor, color: '#000', padding: '0.15rem 0.5rem', borderRadius: '10px' }}>
                  {nextL.stageName} · Lesson {nextL.number} of 32
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {doneCount}/32 Completed
                </span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff', margin: '0.2rem 0' }}>
                {nextL.title}
              </h3>
              <div style={{ fontSize: '0.9rem', color: 'var(--sakura-pink)', fontWeight: 700, fontFamily: 'Noto Sans Kannada, sans-serif' }}>
                {nextL.titleKn}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <button 
                className="btn-primary" 
                style={{ width: 'auto', padding: '0.75rem 1.5rem', fontWeight: 800 }}
                onClick={() => onNavigate('lessons')}
              >
                🗺️ View Full Lesson Path
              </button>
            </div>
          </div>
        ) : null;
      })()}

      {/* Daily Word of the Day Banner */}
      {wordOfTheDay && (
        <div className="glass-card" style={{
          padding: '1.5rem 1.75rem',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, rgba(255,215,0,0.12), rgba(232,130,154,0.08))',
          border: '1px solid rgba(255,215,0,0.3)',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          gap: '1.5rem',
          flexWrap: 'wrap'
        }}>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gold)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
              🌟 Word of the Day · ದಿನದ ಶಬ್ದ
            </div>
            <div style={{ fontFamily: 'Noto Sans Kannada, sans-serif', fontSize: '2.4rem', fontWeight: 900, color: 'var(--sakura-pink)', lineHeight: 1.1 }}>
              {wordOfTheDay.kannada}
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
              {wordOfTheDay.meaning}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              Transliteration: {wordOfTheDay.transliteration} ({wordOfTheDay.category})
            </div>
          </div>
          <button
            className="btn-primary"
            style={{ width: 'auto', padding: '0.75rem 1.5rem', borderRadius: '100px' }}
            onClick={() => speakKannada(wordOfTheDay.kannada)}
          >
            🔊 Hear Word
          </button>
        </div>
      )}

      {/* Recent Badges */}
      {badges.length > 0 && (
        <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
          <div className="flex-between mb-2">
            <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>🏅 Recent Badges</h3>
            <button onClick={() => onNavigate('achievements')} style={{ background: 'none', border: 'none', color: 'var(--sakura-pink)', cursor: 'pointer', fontSize: '0.85rem' }}>View All →</button>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {badges.slice(-5).map(bid => {
              const b = BADGES_ALL.find(x => x.id === bid);
              return b ? (
                <div key={bid} title={b.desc} style={{ fontSize: '1.8rem', cursor: 'default' }}>{b.icon}</div>
              ) : null;
            })}
          </div>
        </div>
      )}

      <h3 style={{ fontWeight: 700, fontSize: '1.15rem', marginBottom: '1.25rem', color: 'var(--text-secondary)' }}>
        📚 Your Learning Path
      </h3>

      <div className="curriculum-grid">
        {LEVEL_CARDS.map((card, i) => (
          <div
            key={card.id}
            className="glass-card level-card"
            onClick={() => onNavigate(card.id)}
          >
            <div className="level-number">LEVEL {i + 1}</div>
            <span className="level-icon">{card.icon}</span>
            <span className="level-title-kannada">{card.kan}</span>
            <div className="level-title">{card.title}</div>
            <div className="level-desc">{card.desc}</div>
            <div className="level-progress-bar">
              <div className="level-progress-fill" style={{ width: `${card.pct}%`, background: `linear-gradient(90deg, ${card.color}88, ${card.color})` }} />
            </div>
            <div className="level-meta">
              <span className="level-lessons">{card.lessons} sections · {card.pct}% done</span>
              <span className="level-arrow">→</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
