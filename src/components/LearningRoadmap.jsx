import React, { useState, useEffect } from 'react';
import { getRoadmapStatus, completeMilestone, getCurrentUser } from '../utils/storage.js';

const LearningRoadmap = ({ onNavigate, onToast }) => {
  const [stages, setStages] = useState(() => getRoadmapStatus());

  useEffect(() => {
    setStages(getRoadmapStatus());
  }, []);

  const refresh = () => setStages(getRoadmapStatus());

  const handleMilestoneClick = (m) => {
    if (!m.unlocked) {
      onToast && onToast('🔒 Complete the previous milestone first!', 'info');
      return;
    }
    if (m.complete && !getCurrentUser()?.roadmapCompleted?.includes(m.id)) {
      completeMilestone(m.id);
      refresh();
    }
    onNavigate && onNavigate(m.page);
  };

  const handleMarkComplete = (m, e) => {
    e.stopPropagation();
    if (!m.unlocked) return;
    completeMilestone(m.id);
    onToast && onToast('✅ Milestone marked complete!', 'success');
    refresh();
  };

  const totalMilestones = stages.reduce((a, s) => a + s.milestones.length, 0);
  const completedCount = stages.reduce((a, s) => a + s.milestones.filter(m => m.complete).length, 0);
  const overallPct = Math.round((completedCount / totalMilestones) * 100);

  return (
    <div className="learning-screen">
      <div className="page-header">
        <h2>🗺️ Learning Roadmap</h2>
        <p>Your step-by-step curriculum from Beginner to Advanced Kannada mastery.</p>
      </div>

      {/* Overall progress */}
      <div className="glass-card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontWeight: 700 }}>Curriculum Progress</span>
          <span style={{ color: 'var(--gold)', fontWeight: 800 }}>{completedCount}/{totalMilestones} ({overallPct}%)</span>
        </div>
        <div className="quiz-progress-bar">
          <div className="quiz-progress-fill" style={{ width: `${overallPct}%` }} />
        </div>
      </div>

      {/* Stages */}
      {stages.map((stage, si) => (
        <div key={stage.id} className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '1.8rem' }}>{stage.icon}</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: stage.color }}>{stage.name}</h3>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {stage.milestones.filter(m => m.complete).length}/{stage.milestones.length} complete
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {stage.milestones.map((m, mi) => (
              <div
                key={m.id}
                onClick={() => handleMilestoneClick(m)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem 1.25rem',
                  borderRadius: '12px',
                  cursor: m.unlocked ? 'pointer' : 'not-allowed',
                  background: m.complete ? 'rgba(67,233,123,0.1)' : m.unlocked ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
                  border: `2px solid ${m.complete ? '#43e97b' : m.unlocked ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)'}`,
                  opacity: m.unlocked ? 1 : 0.55,
                  transition: 'all 0.2s',
                }}
              >
                {/* Step number / status */}
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: m.complete ? '#43e97b' : m.unlocked ? stage.color : 'rgba(255,255,255,0.1)',
                  fontWeight: 800, fontSize: '0.9rem', color: m.complete || m.unlocked ? '#fff' : 'var(--text-muted)',
                }}>
                  {m.complete ? '✓' : !m.unlocked ? '🔒' : mi + 1}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{m.title}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    {m.complete ? 'Completed' : m.unlocked ? 'Click to start →' : 'Locked — finish prerequisite first'}
                  </div>
                </div>

                {m.unlocked && !m.complete && (
                  <button
                    className="glass-btn"
                    onClick={(e) => handleMarkComplete(m, e)}
                    style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', flexShrink: 0 }}
                  >
                    Mark ✓
                  </button>
                )}

                {si < stages.length - 1 || mi < stage.milestones.length - 1 ? null : null}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default LearningRoadmap;
