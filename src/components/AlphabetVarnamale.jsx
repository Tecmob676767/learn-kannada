import React, { useState } from 'react';
import { swaragalu, vyanjanagalu, ottakshara } from '../data/varnamaleData.js';
import { speakKannada } from '../utils/tts.js';
import { addXP, updateUser, getCurrentUser, markExplored } from '../utils/storage.js';

const AlphabetVarnamale = ({ onXP }) => {
  const [tab, setTab] = useState('swara');
  const [selected, setSelected] = useState(swaragalu[0]);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleTile = (item) => {
    setSelected(item);
    setIsPlaying(true);
    speakKannada(item.ttsText || item.kannada);
    setTimeout(() => setIsPlaying(false), 1200);

    // Award XP ONLY ONCE per unique letter explored
    const itemKey = `varnamale_${item.kannada}`;
    const isNew = markExplored(itemKey);
    
    if (isNew) {
      addXP(2);
      onXP && onXP(2);
      const u = getCurrentUser();
      if (u) {
        updateUser({ progress: { ...(u.progress || {}), varnamale: Math.min(100, (u.progress?.varnamale || 0) + 5) } });
      }
    }
  };

  const items = tab === 'swara' ? swaragalu : tab === 'vyanjana' ? vyanjanagalu : ottakshara;

  return (
    <div className="learning-screen">
      <div className="page-header">
        <h2>🔡 ಅಕ್ಷರ ಮಾಲೆ — Varnamale & Swara Mastery</h2>
        <p>Master Kannada Swaras (Vowels), Consonants & Conjuncts with native audio!</p>
      </div>

      <div className="section-tabs">
        <button className={`section-tab${tab === 'swara' ? ' active' : ''}`} onClick={() => { setTab('swara'); setSelected(swaragalu[0]); }}>
          ✨ Swaragalu (15 Vowels)
        </button>
        <button className={`section-tab${tab === 'vyanjana' ? ' active' : ''}`} onClick={() => { setTab('vyanjana'); setSelected(vyanjanagalu[0]); }}>
          🔤 Vyanjanagalu (34 Consonants)
        </button>
        <button className={`section-tab${tab === 'ottakshara' ? ' active' : ''}`} onClick={() => { setTab('ottakshara'); setSelected(ottakshara[0]); }}>
          🔗 Ottakshara (Conjuncts)
        </button>
      </div>

      {/* Hero Showcase Card for Selected Letter */}
      {selected && (
        <div className="glass-card" style={{
          padding: '2rem',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, rgba(255,183,197,0.15), rgba(232,130,154,0.08), rgba(255,215,0,0.05))',
          border: '1px solid rgba(255,183,197,0.4)',
          boxShadow: '0 12px 40px rgba(232,130,154,0.2), inset 0 0 0 1px rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '2rem',
          flexWrap: 'wrap',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Ambient Glow */}
          <div style={{
            position: 'absolute', top: '-40%', right: '-10%',
            width: '200px', height: '200px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,183,197,0.3) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          {/* Letter Badge */}
          <div style={{
            width: '110px', height: '110px',
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, rgba(255,183,197,0.25), rgba(155,58,110,0.2))',
            border: '2px solid var(--sakura-pink)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 30px rgba(255,183,197,0.4)',
            flexShrink: 0
          }}>
            <span style={{
              fontFamily: 'Noto Sans Kannada, sans-serif',
              fontSize: '4.5rem',
              fontWeight: 800,
              color: 'var(--sakura-pink)',
              lineHeight: 1,
              textShadow: '0 0 20px rgba(255,183,197,0.6)'
            }}>
              {selected.kannada}
            </span>
          </div>

          {/* Letter Info */}
          <div style={{ flex: 1, minWidth: '220px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
              <span className="pill pill-gold" style={{ fontSize: '0.8rem' }}>
                {selected.category || selected.group || 'Letter'}
              </span>
              <span className="pill pill-pink" style={{ fontSize: '0.8rem' }}>
                Phonetic: /{selected.transliteration}/
              </span>
            </div>

            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Pronunciation: <span style={{ color: 'var(--gold)' }}>{selected.transliteration}</span>
            </h3>

            {selected.soundLike && (
              <div style={{
                marginTop: '0.6rem',
                fontSize: '1rem',
                color: 'var(--text-secondary)',
                background: 'rgba(0,0,0,0.25)',
                padding: '0.6rem 1rem',
                borderRadius: 'var(--radius-sm)',
                display: 'inline-block',
                border: '1px solid rgba(255,255,255,0.08)'
              }}>
                🎧 Sounds like: <strong style={{ color: 'var(--sakura-blossom)' }}>"{selected.soundLike}"</strong>
              </div>
            )}

            {selected.example && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                💡 Example: <strong style={{ color: 'var(--sakura-pink)' }}>{selected.example}</strong>
              </div>
            )}
          </div>

          {/* Play Audio Button */}
          <button
            className="btn-primary"
            style={{
              width: 'auto',
              padding: '0.9rem 2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              fontSize: '1.1rem',
              borderRadius: '100px'
            }}
            onClick={() => handleTile(selected)}
          >
            {isPlaying ? '🔊 Speaking...' : '🔊 Hear Native Audio'}
          </button>
        </div>
      )}

      {/* Grid of Letters */}
      <div className="alphabet-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '1rem' }}>
        {items.map((item, i) => {
          const isSel = selected?.kannada === item.kannada;
          return (
            <div
              key={i}
              className={`alpha-tile${isSel ? ' selected' : ''}`}
              onClick={() => handleTile(item)}
              style={{
                height: '100px',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <span className="kannada-char" style={{ fontSize: '2.2rem' }}>{item.kannada}</span>
              <span className="transliteration" style={{ fontSize: '0.75rem', fontWeight: 600 }}>{item.transliteration}</span>
              {item.soundLike && (
                <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.1rem' }}>
                  {item.soundLike.split(' ')[0]}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div style={{
        marginTop: '2rem',
        padding: '1.25rem',
        borderRadius: 'var(--radius-md)',
        background: 'rgba(255,183,197,0.06)',
        border: '1px dashed rgba(255,183,197,0.25)',
        textAlign: 'center',
        color: 'var(--text-secondary)',
        fontSize: '0.88rem'
      }}>
        🌸 <strong>Pro Tip:</strong> Click any letter tile to hear authentic native Kannada audio! You earn +2 XP when discovering each new letter.
      </div>
    </div>
  );
};

export default AlphabetVarnamale;
