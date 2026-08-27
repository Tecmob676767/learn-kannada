import React, { useState } from 'react';
import { speakKannada } from '../utils/tts.js';
import { playClick, playSuccess } from '../utils/soundEffects.js';

const OFFLINE_VOCAB = [
  { kn: 'ನಮಸ್ಕಾರ', en: 'Hello / Greetings', roman: 'Namaskara' },
  { kn: 'ಧನ್ಯವಾದ', en: 'Thank you', roman: 'Dhanyavada' },
  { kn: 'ಹೌದು', en: 'Yes', roman: 'Haudu' },
  { kn: 'ಇಲ್ಲ', en: 'No', roman: 'Illa' },
  { kn: 'ದಯವಿಟ್ಟು', en: 'Please', roman: 'Dayavittu' },
  { kn: 'ನೀರು', en: 'Water', roman: 'Neeru' },
  { kn: 'ಊಟ', en: 'Meal / Food', roman: 'Oota' },
  { kn: 'ಮನೆ', en: 'House', roman: 'Mane' },
  { kn: 'ಸ್ನೇಹಿತ', en: 'Friend', roman: 'Snehitha' },
  { kn: 'ಶುಭೋದಯ', en: 'Good morning', roman: 'Shubhodaya' },
];

export default function OfflineScreen({ onRetry, onContinueOffline }) {
  const [checking, setChecking] = useState(false);
  const [selectedWord, setSelectedWord] = useState(null);

  const handleCheckConnection = async () => {
    setChecking(true);
    playClick();
    try {
      // Test small fetch to verify real internet connectivity
      await fetch('https://www.google.com/favicon.ico', { mode: 'no-cors', cache: 'no-store' });
      playSuccess();
      if (onRetry) onRetry();
    } catch (_e) {
      setTimeout(() => {
        setChecking(false);
      }, 1000);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        background: 'radial-gradient(circle at top, #2b1104, #0f0502)',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
        boxSizing: 'border-box'
      }}
    >
      <div
        className="glass-card"
        style={{
          maxWidth: '680px',
          width: '100%',
          padding: '2.5rem 2rem',
          borderRadius: '24px',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1.5px solid rgba(255, 107, 53, 0.35)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
          textAlign: 'center'
        }}
      >
        {/* Offline Icon */}
        <div style={{ fontSize: '4rem', marginBottom: '1rem', animation: 'pulse 2s infinite' }}>
          📡❌
        </div>

        {/* Offline Title */}
        <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '0.4rem', color: '#ffa366' }}>
          You Are Currently Offline
        </h2>
        <div style={{ fontFamily: 'Noto Sans Kannada, sans-serif', fontSize: '1.15rem', fontWeight: 700, color: '#ffd700', marginBottom: '1.5rem' }}>
          ನೀವು ಪ್ರಸ್ತುತ ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿದ್ದೀರಿ
        </div>

        {/* Pronunciation & Quality Notice */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(255, 65, 108, 0.2), rgba(255, 75, 43, 0.12))',
            border: '1.5px solid rgba(255, 65, 108, 0.5)',
            borderRadius: '16px',
            padding: '1.2rem 1.4rem',
            marginBottom: '2rem',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}
        >
          <span style={{ fontSize: '2.2rem' }}>🎙️</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.98rem', color: '#fff', marginBottom: '0.25rem' }}>
              💡 Be online for better pronunciation of words & studio audio!
            </div>
            <div style={{ fontSize: '0.84rem', color: 'rgba(255,255,255,0.82)', lineHeight: '1.4' }}>
              High-definition native Kannada voice streams, live multiplayer, and AI speech recognition require an active internet connection.
            </div>
          </div>
        </div>

        {/* Offline Quick Practice Deck */}
        <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            📚 OFFLINE STUDY PACK (SAVED IN LOCAL STORAGE):
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.6rem' }}>
            {OFFLINE_VOCAB.map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setSelectedWord(item);
                  speakKannada(item.kn);
                }}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  padding: '0.75rem 1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,163,102,0.15)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              >
                <div>
                  <div style={{ fontFamily: 'Noto Sans Kannada, sans-serif', fontWeight: 800, color: '#ffd700', fontSize: '1.05rem' }}>
                    {item.kn}
                  </div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{item.en}</div>
                </div>
                <span style={{ fontSize: '1rem', opacity: 0.8 }}>🔊</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            className="btn-primary"
            onClick={handleCheckConnection}
            disabled={checking}
            style={{ padding: '0.85rem 2rem', fontSize: '0.95rem', fontWeight: 800 }}
          >
            {checking ? '🔄 Checking Connection...' : '🔄 Check Connection & Reconnect'}
          </button>

          {onContinueOffline && (
            <button
              onClick={() => {
                playClick();
                onContinueOffline();
              }}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff',
                padding: '0.85rem 1.6rem',
                borderRadius: '12px',
                fontSize: '0.92rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              📖 Continue in Offline Mode
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
