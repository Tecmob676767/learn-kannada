import React, { useState, useEffect } from 'react';
import { getLessonPathStatus, completeLesson, getCurrentLesson, getCurrentUser } from '../utils/storage.js';

const LessonPath = ({ onNavigate, onToast, onXP, user }) => {
  const [stages, setStages] = useState(() => getLessonPathStatus());
  const [selectedStage, setSelectedStage] = useState('all');
  const [activeModalLesson, setActiveModalLesson] = useState(null);

  useEffect(() => {
    setStages(getLessonPathStatus());
  }, [user]);

  const refreshStatus = () => {
    setStages(getLessonPathStatus());
  };

  const currentLesson = getCurrentLesson();
  const totalLessons = stages.reduce((acc, s) => acc + s.totalCount, 0);
  const completedLessonsCount = stages.reduce((acc, s) => acc + s.completedCount, 0);
  const overallPercentage = totalLessons > 0 ? Math.round((completedLessonsCount / totalLessons) * 100) : 0;

  const handleStartLesson = (lesson) => {
    if (!lesson.unlocked) {
      onToast && onToast('🔒 Please complete Lesson ' + (lesson.number - 1) + ' first!', 'info');
      return;
    }
    if (lesson.page) {
      onNavigate && onNavigate(lesson.page);
    }
  };

  const handleMarkComplete = (lesson, e) => {
    if (e) e.stopPropagation();
    if (!lesson.unlocked) return;
    const res = completeLesson(lesson.id);
    if (res && res.user) {
      if (!res.alreadyDone) {
        onToast && onToast('🎉 Lesson ' + lesson.number + ' Completed! +' + lesson.xpReward + ' XP!', 'xp');
        onXP && onXP(lesson.xpReward);
      } else {
        onToast && onToast('✅ Lesson ' + lesson.number + ' already completed!', 'info');
      }
      refreshStatus();
      setActiveModalLesson(null);
    }
  };

  const filteredStages = selectedStage === 'all'
    ? stages
    : stages.filter(s => s.id === selectedStage);

  return (
    <div className="learning-screen lesson-path-container">
      {/* Page Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.75rem', fontWeight: 900 }}>
              🗺️ <span className="gradient-text">Lesson Path</span> · ಪಾಠ ಮಾರ್ಗ
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.95rem' }}>
              Your structured 32-lesson curriculum from Beginner to Advanced Kannada mastery.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.06)', padding: '0.5rem 1rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <span style={{ fontSize: '1.25rem' }}>🏆</span>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Curriculum Progress</div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--gold)' }}>
                {completedLessonsCount} / {totalLessons} Lessons ({overallPercentage}%)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero: Current Up Next Lesson */}
      {currentLesson && (
        <div
          className="glass-card"
          style={{
            padding: '1.5rem 2rem',
            marginBottom: '2rem',
            background: 'linear-gradient(135deg, rgba(255,163,102,0.12), rgba(255,107,53,0.06))',
            border: '1.5px solid var(--sakura-pink)',
            boxShadow: '0 12px 36px rgba(255,107,53,0.2)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', right: '-20px', top: '-20px', fontSize: '7rem', opacity: 0.08, pointerEvents: 'none' }}>
            {currentLesson.icon}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
            <div style={{ flex: 1, minWidth: '240px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ background: currentLesson.stageColor, color: '#000', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 800 }}>
                  {currentLesson.stageName} · Lesson {currentLesson.number}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--gold)', fontWeight: 700 }}>
                  ⭐ +{currentLesson.xpReward} XP
                </span>
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#fff', margin: '0.25rem 0' }}>
                {currentLesson.title}
              </h3>
              <div style={{ fontSize: '0.95rem', color: 'var(--sakura-pink)', fontFamily: 'Noto Sans Kannada, sans-serif', fontWeight: 700, marginBottom: '0.35rem' }}>
                {currentLesson.titleKn}
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                {currentLesson.desc}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <button
                className="btn-primary"
                onClick={() => handleStartLesson(currentLesson)}
                style={{ width: 'auto', padding: '0.85rem 1.75rem', fontSize: '0.95rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 6px 20px rgba(255,107,53,0.4)' }}
              >
                <span>▶ Start Lesson {currentLesson.number}</span>
              </button>
            </div>
          </div>

          <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              <span>Overall Path Progress</span>
              <span>{overallPercentage}% Complete</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ width: overallPercentage + '%', height: '100%', background: 'linear-gradient(90deg, #43e97b, #38f9d7)', transition: 'width 0.4s ease' }} />
            </div>
          </div>
        </div>
      )}

      {/* Stage Selector Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {[
          { id: 'all', name: 'All 32 Lessons', icon: '🗺️' },
          { id: 'beginner', name: 'Stage 1: Beginner', icon: '🌱' },
          { id: 'elementary', name: 'Stage 2: Elementary', icon: '🌿' },
          { id: 'intermediate', name: 'Stage 3: Intermediate', icon: '🌳' },
          { id: 'advanced', name: 'Stage 4: Advanced', icon: '🏆' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedStage(tab.id)}
            style={{
              padding: '0.65rem 1rem',
              borderRadius: '20px',
              border: selectedStage === tab.id ? '2px solid var(--sakura-pink)' : '1px solid rgba(255,255,255,0.08)',
              background: selectedStage === tab.id ? 'rgba(255,163,102,0.15)' : 'rgba(255,255,255,0.03)',
              color: selectedStage === tab.id ? '#fff' : 'var(--text-secondary)',
              fontWeight: selectedStage === tab.id ? 800 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s',
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Stages and Lessons Flow */}
      <div className="stages-flow" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        {filteredStages.map((stage) => (
          <div key={stage.id} className="stage-section">
            <div
              className="stage-banner"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                padding: '1.25rem 1.75rem',
                borderRadius: '18px',
                background: 'linear-gradient(135deg, ' + stage.color + '15, rgba(255,255,255,0.02))',
                border: '1.5px solid ' + stage.color + '40',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '2.2rem', padding: '0.5rem', background: 'rgba(255,255,255,0.06)', borderRadius: '16px' }}>
                  {stage.icon}
                </span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: stage.color }}>
                    {stage.name} Level
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Reward Title: <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{stage.badge}</span>
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff' }}>
                  {stage.completedCount} / {stage.totalCount} Completed
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {stage.totalCount > 0 ? Math.round((stage.completedCount / stage.totalCount) * 100) : 0}% Mastered
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {stage.lessons.map((lesson) => {
                const isCurrent = currentLesson && currentLesson.id === lesson.id;
                return (
                  <div
                    key={lesson.id}
                    className="glass-card lesson-card"
                    onClick={() => {
                      if (lesson.unlocked) {
                        setActiveModalLesson(lesson);
                      } else {
                        onToast && onToast('🔒 Complete Lesson ' + (lesson.number - 1) + ' first!', 'info');
                      }
                    }}
                    style={{
                      padding: '1.5rem',
                      borderRadius: '16px',
                      cursor: lesson.unlocked ? 'pointer' : 'not-allowed',
                      opacity: lesson.unlocked ? 1 : 0.55,
                      background: lesson.complete
                        ? 'rgba(67,233,123,0.06)'
                        : isCurrent
                          ? 'rgba(255,163,102,0.1)'
                          : lesson.unlocked
                            ? 'rgba(255,255,255,0.04)'
                            : 'rgba(255,255,255,0.015)',
                      border: lesson.complete
                        ? '2px solid #43e97b'
                        : isCurrent
                          ? '2px solid var(--sakura-pink)'
                          : lesson.unlocked
                            ? '1px solid rgba(255,255,255,0.12)'
                            : '1px solid rgba(255,255,255,0.05)',
                      transform: isCurrent ? 'scale(1.02)' : 'none',
                      boxShadow: isCurrent ? '0 10px 30px rgba(255,107,53,0.2)' : 'none',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                        <div style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.1rem',
                          background: lesson.complete
                            ? '#43e97b'
                            : isCurrent
                              ? 'linear-gradient(135deg, var(--sakura-pink), var(--sakura-deep))'
                              : lesson.unlocked
                                ? 'rgba(255,255,255,0.08)'
                                : 'rgba(255,255,255,0.03)',
                          color: lesson.complete || isCurrent ? '#fff' : 'var(--text-muted)',
                          fontWeight: 800,
                        }}>
                          {lesson.complete ? '✓' : !lesson.unlocked ? '🔒' : lesson.number}
                        </div>

                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--gold)', background: 'rgba(255,215,0,0.1)', padding: '0.2rem 0.5rem', borderRadius: '10px' }}>
                            +{lesson.xpReward} XP
                          </span>
                          {lesson.complete && (
                            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#43e97b', background: 'rgba(67,233,123,0.12)', padding: '0.2rem 0.5rem', borderRadius: '10px' }}>
                              Completed
                            </span>
                          )}
                          {isCurrent && (
                            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--sakura-pink)', background: 'rgba(255,163,102,0.15)', padding: '0.2rem 0.5rem', borderRadius: '10px' }}>
                              Up Next
                            </span>
                          )}
                        </div>
                      </div>

                      <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', margin: '0.2rem 0 0.15rem 0' }}>
                        {lesson.title}
                      </h4>
                      <div style={{ fontSize: '0.85rem', color: stage.color, fontFamily: 'Noto Sans Kannada, sans-serif', fontWeight: 700, marginBottom: '0.6rem' }}>
                        {lesson.titleKn}
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: '0 0 1rem 0' }}>
                        {lesson.desc}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      {lesson.unlocked ? (
                        <>
                          <button
                            className="btn-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartLesson(lesson);
                            }}
                            style={{
                              flex: 1,
                              padding: '0.6rem 0.8rem',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              background: lesson.complete
                                ? 'rgba(255,255,255,0.08)'
                                : 'linear-gradient(135deg, var(--sakura-pink), var(--sakura-deep))',
                            }}
                          >
                            {lesson.complete ? '↺ Review Activity' : '▶ Start Lesson'}
                          </button>
                          {!lesson.complete && (
                            <button
                              className="glass-btn"
                              onClick={(e) => handleMarkComplete(lesson, e)}
                              title="Mark as completed"
                              style={{ padding: '0.6rem 0.75rem', fontSize: '0.8rem', color: '#43e97b' }}
                            >
                              ✓ Done
                            </button>
                          )}
                        </>
                      ) : (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span>🔒</span>
                          <span>Complete Lesson {lesson.number - 1} to unlock</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Lesson Details Modal */}
      {activeModalLesson && (
        <div
          className="modal-overlay"
          onClick={() => setActiveModalLesson(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
        >
          <div
            className="glass-card modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '520px',
              padding: '2rem',
              borderRadius: '24px',
              border: '2px solid ' + activeModalLesson.stageColor,
              background: 'var(--indigo-card)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ background: activeModalLesson.stageColor, color: '#000', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800 }}>
                  {activeModalLesson.stageName} · Lesson {activeModalLesson.number} of 32
                </span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff', margin: '0.5rem 0 0.2rem 0' }}>
                  {activeModalLesson.title}
                </h3>
                <div style={{ fontSize: '1.1rem', color: activeModalLesson.stageColor, fontFamily: 'Noto Sans Kannada, sans-serif', fontWeight: 700 }}>
                  {activeModalLesson.titleKn}
                </div>
              </div>
              <button
                onClick={() => setActiveModalLesson(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              {activeModalLesson.desc}
            </p>

            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '1rem', borderRadius: '14px', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Reward</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--gold)' }}>+{activeModalLesson.xpReward} XP</div>
              </div>
              <div style={{ borderLeft: '1px solid rgba(255,255,255,0.08)' }} />
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: activeModalLesson.complete ? '#43e97b' : '#4facfe' }}>
                  {activeModalLesson.complete ? '✓ Completed' : 'In Progress'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                className="btn-primary"
                onClick={() => {
                  handleStartLesson(activeModalLesson);
                  setActiveModalLesson(null);
                }}
                style={{ flex: 2, minWidth: '160px', padding: '0.85rem', fontWeight: 800 }}
              >
                {activeModalLesson.complete ? '↺ Replay Lesson' : '▶ Start Lesson Now'}
              </button>
              {!activeModalLesson.complete && (
                <button
                  className="glass-btn"
                  onClick={() => handleMarkComplete(activeModalLesson)}
                  style={{ flex: 1, padding: '0.85rem', color: '#43e97b', fontWeight: 700 }}
                >
                  ✓ Mark Done
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonPath;
