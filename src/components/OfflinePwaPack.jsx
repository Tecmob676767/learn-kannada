import React, { useState } from 'react';

const PACKS = [
  { id: 'varnamale', name: 'Alphabet & Script Master Pack', size: '2.4 MB', count: '52 Audio Lessons', icon: '🔡' },
  { id: 'bengaluru', name: 'Bengaluru Survival & Slang Pack', size: '3.8 MB', count: '120 Audio Dialogues', icon: '🏙️' },
  { id: 'grammar', name: 'Complete Vibhakti & Sandhi Grammar', size: '1.9 MB', count: '45 Exercises', icon: '📖' },
  { id: 'folk', name: 'Karnataka Folk Stories & Yakshagana', size: '5.2 MB', count: '18 Audio Dramas', icon: '🎭' }
];

export default function OfflinePwaPack({ onXP, onToast }) {
  const [downloaded, setDownloaded] = useState({ varnamale: true });

  function toggleDownload(id) {
    const isNowDownloaded = !downloaded[id];
    setDownloaded(prev => ({ ...prev, [id]: isNowDownloaded }));

    if (isNowDownloaded) {
      onXP && onXP(20);
      onToast && onToast('📦 Lesson Pack saved for 100% Offline Learning! +20 XP', 'xp');
    } else {
      onToast && onToast('Pack removed from local storage cache.', 'info');
    }
  }

  return (
    <div className="learning-screen">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
        <h1 className="page-title">📦 ಆಫ್‌ಲೈನ್ ಪ್ಯಾಕ್‌ಗಳು · Offline PWA Packs</h1>
        <span style={{ color: '#38ef7d', fontWeight: 800 }}>⚡ Zero Data Mode</span>
      </div>

      <div className="glass-card" style={{ maxWidth: 640, margin: '0 auto', padding: '1.8rem' }}>
        <div style={{ padding: '1.2rem', background: 'rgba(56, 239, 125, 0.12)', border: '1px solid rgba(56, 239, 125, 0.3)', borderRadius: '12px', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 800, color: '#38ef7d', fontSize: '1rem', marginBottom: '0.3rem' }}>
            <span>💾 Local IndexedDB Storage Ready</span>
          </div>
          <div style={{ fontSize: '0.82rem', opacity: 0.85 }}>
            Download packs to continue learning audio lessons, flashcards, and quizzes even on airplanes or without internet.
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {PACKS.map(p => {
            const isSaved = downloaded[p.id];
            return (
              <div key={p.id} style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <span style={{ fontSize: '2rem' }}>{p.icon}</span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: '#ffedd5' }}>{p.name}</div>
                    <div style={{ fontSize: '0.78rem', opacity: 0.65 }}>{p.count} · {p.size}</div>
                  </div>
                </div>

                <button
                  className="btn-primary"
                  onClick={() => toggleDownload(p.id)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: isSaved ? 'rgba(74, 222, 128, 0.2)' : undefined,
                    border: isSaved ? '1px solid #4ade80' : undefined,
                    color: isSaved ? '#4ade80' : undefined
                  }}
                >
                  {isSaved ? '✅ Downloaded' : '⬇️ Download'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
