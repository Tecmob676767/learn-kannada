import React, { useState } from 'react';
import {
  Home, BookOpen, Bot, Users, Sparkles, Mic,
  Swords, PhoneCall, Gift, Trophy, X, Zap, ArrowRight,
  Flame, Volume2
} from 'lucide-react';
import { playClick, playSuccess, speakKannada } from '../utils/soundEffects.js';

const QUICK_SPRINT_PHRASES = [
  { kn: 'ನೀವು ಹೇಗಿದ್ದೀರಾ?', tr: 'Neevu hegiddheera?', en: 'How are you?' },
  { kn: 'ಊಟ ಆಯ್ತಾ?', tr: 'Oota aaytha?', en: 'Had your meal?' },
  { kn: 'ಬೆಂಗಳೂರು ತುಂಬಾ ಸುಂದರವಾಗಿದೆ.', tr: 'Bengaluru thumba sundaravaagide.', en: 'Bengaluru is very beautiful.' },
  { kn: 'ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡಿ.', tr: 'Kannadadalli maathanaadi.', en: 'Speak in Kannada.' },
  { kn: 'ಧನ್ಯವಾದಗಳು, ಮತ್ತೆ ಸಿಗೋಣ!', tr: 'Dhanyavaadagalu, matte sigona!', en: 'Thank you, see you again!' },
];

export default function MobileQuickDock({ activeTab, onNavigate, user, onOpenPlumineModal, onToast, onXP }) {
  const [isOpenSheet, setIsOpenSheet] = useState(false);
  const [sprintIndex, setSprintIndex] = useState(0);
  const [sprintDone, setSprintDone] = useState(false);

  const currentSprint = QUICK_SPRINT_PHRASES[sprintIndex];

  const handleNav = (tab) => {
    playClick();
    onNavigate(tab);
    setIsOpenSheet(false);
  };

  const handlePlayAudio = (phrase) => {
    speakKannada(phrase.kn);
  };

  const handleNextSprint = () => {
    playSuccess();
    if (sprintIndex < QUICK_SPRINT_PHRASES.length - 1) {
      setSprintIndex(s => s + 1);
    } else {
      setSprintDone(true);
      if (onXP) onXP(30);
      if (onToast) onToast('⚡ Daily Spoken Sprint Completed! +30 XP', 'success');
    }
  };

  return (
    <>
      {/* ── Floating Mobile Dock Pill ────────────────────────────────────────── */}
      <div className="mobile-dock-container">
        <div className="mobile-dock-pill">
          {/* Home */}
          <button
            className={`dock-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleNav('dashboard')}
            aria-label="Dashboard"
          >
            <Home size={20} />
            <span>Home</span>
          </button>

          {/* Lessons */}
          <button
            className={`dock-btn ${activeTab === 'lessons' ? 'active' : ''}`}
            onClick={() => handleNav('lessons')}
            aria-label="Lessons"
          >
            <BookOpen size={20} />
            <span>Lessons</span>
          </button>

          {/* Center Glowing Action Hub */}
          <div className="dock-center-wrap">
            <button
              className={`dock-center-pulse ${isOpenSheet ? 'active-pulse' : ''}`}
              onClick={() => {
                playClick();
                setIsOpenSheet(!isOpenSheet);
              }}
              aria-label="Quick Actions"
            >
              <Sparkles size={24} color="#fff" />
            </button>
          </div>

          {/* Living AI Tutor */}
          <button
            className={`dock-btn ${activeTab === 'sobaguai' ? 'active' : ''}`}
            onClick={() => handleNav('sobaguai')}
            aria-label="Living AI"
          >
            <Bot size={20} />
            <span>Living AI</span>
          </button>

          {/* Friends */}
          <button
            className={`dock-btn ${activeTab === 'friendslist' || activeTab === 'socialhub' ? 'active' : ''}`}
            onClick={() => handleNav('friendslist')}
            aria-label="Friends"
          >
            <Users size={20} />
            <span>Friends</span>
          </button>
        </div>
      </div>

      {/* ── Slide-up Quick Action Drawer ────────────────────────────────────── */}
      {isOpenSheet && (
        <div className="mobile-sheet-overlay" onClick={() => setIsOpenSheet(false)}>
          <div className="mobile-sheet-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
            
            {/* Sheet Header */}
            <div className="sheet-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ background: 'linear-gradient(135deg, #ff6b35, #ffa366)', width: 34, height: 34, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={18} color="#fff" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>Quick Learning Hub</h3>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>ವೇಗದ ಕನ್ನಡ ಕ್ರಿಯೆಗಳು · Fast Actions</p>
                </div>
              </div>
              <button className="sheet-close-btn" onClick={() => setIsOpenSheet(false)}>
                <X size={18} />
              </button>
            </div>

            {/* 1-Minute Spoken Sprint Card */}
            <div className="sheet-sprint-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--sakura-pink)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Mic size={14} /> 1-Minute Spoken Sprint ({sprintIndex + 1}/{QUICK_SPRINT_PHRASES.length})
                </span>
                <span style={{ fontSize: '0.7rem', color: '#43e97b', fontWeight: 800 }}>+30 XP</span>
              </div>

              {!sprintDone ? (
                <>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', fontFamily: 'Noto Sans Kannada, sans-serif' }}>
                    {currentSprint.kn}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', fontStyle: 'italic', margin: '0.2rem 0' }}>
                    "{currentSprint.tr}"
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.8rem' }}>
                    {currentSprint.en}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handlePlayAudio(currentSprint)}
                      style={{
                        flex: 1, background: 'rgba(255,255,255,0.12)', border: '1px solid var(--glass-border)',
                        borderRadius: '10px', padding: '0.5rem', color: '#fff', fontWeight: 700, fontSize: '0.8rem',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                      }}
                    >
                      <Volume2 size={16} color="#4facfe" /> Listen Audio
                    </button>
                    <button
                      onClick={handleNextSprint}
                      style={{
                        flex: 1, background: 'linear-gradient(135deg,#ff6b35,#ffa366)', border: 'none',
                        borderRadius: '10px', padding: '0.5rem', color: '#fff', fontWeight: 700, fontSize: '0.8rem',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                      }}
                    >
                      Next Phrase <ArrowRight size={15} />
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
                  <div style={{ fontSize: '1.8rem', marginBottom: '0.2rem' }}>🎉</div>
                  <div style={{ color: '#fff', fontWeight: 800, fontSize: '1rem' }}>Spoken Sprint Completed!</div>
                  <div style={{ color: '#43e97b', fontSize: '0.8rem', fontWeight: 700 }}>+30 XP added to your daily progress</div>
                </div>
              )}
            </div>

            {/* Quick Action Grid */}
            <div className="sheet-grid">
              <button className="sheet-grid-btn" onClick={() => handleNav('sobaguai')}>
                <div className="sheet-icon-circle" style={{ background: 'linear-gradient(135deg, #ff0844, #ffb199)' }}>
                  <Bot size={18} color="#fff" />
                </div>
                <span>Living AI Tutor</span>
              </button>

              <button className="sheet-grid-btn" onClick={() => handleNav('liveduel')}>
                <div className="sheet-icon-circle" style={{ background: 'linear-gradient(135deg, #ff9a9e, #fecfef)' }}>
                  <Swords size={18} color="#fff" />
                </div>
                <span>1v1 Duel</span>
              </button>

              <button className="sheet-grid-btn" onClick={() => handleNav('friendslist')}>
                <div className="sheet-icon-circle" style={{ background: 'linear-gradient(135deg, #43e97b, #38f9d7)' }}>
                  <PhoneCall size={18} color="#fff" />
                </div>
                <span>Call Friend</span>
              </button>

              <button className="sheet-grid-btn" onClick={() => handleNav('rewards')}>
                <div className="sheet-icon-circle" style={{ background: 'linear-gradient(135deg, #4facfe, #00f2fe)' }}>
                  <Gift size={18} color="#fff" />
                </div>
                <span>Daily Chest</span>
              </button>

              <button className="sheet-grid-btn" onClick={() => handleNav('leaderboard')}>
                <div className="sheet-icon-circle" style={{ background: 'linear-gradient(135deg, #f093fb, #f5576c)' }}>
                  <Trophy size={18} color="#fff" />
                </div>
                <span>Rankings</span>
              </button>

              <button className="sheet-grid-btn" onClick={() => { setIsOpenSheet(false); onOpenPlumineModal && onOpenPlumineModal(); }}>
                <div className="sheet-icon-circle" style={{ background: 'linear-gradient(135deg, #c084fc, #6366f1)' }}>
                  <Zap size={18} color="#fff" />
                </div>
                <span>Plumine Sync</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
