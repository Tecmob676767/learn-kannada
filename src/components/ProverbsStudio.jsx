import React, { useState } from 'react';
import { proverbsData } from '../data/proverbsData.js';
import { speakKannada } from '../utils/tts.js';
import { addXP, markExplored } from '../utils/storage.js';

const ProverbsStudio = ({ onXP }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProverb, setSelectedProverb] = useState(proverbsData[0]);
  const [isPlaying, setIsPlaying] = useState(false);

  const categories = ['All', ...new Set(proverbsData.map(p => p.category))];

  const filteredProverbs = selectedCategory === 'All'
    ? proverbsData
    : proverbsData.filter(p => p.category === selectedCategory);

  const handleSelect = (proverb) => {
    setSelectedProverb(proverb);
    setIsPlaying(true);
    speakKannada(proverb.kannada);
    setTimeout(() => setIsPlaying(false), 1500);

    const isNew = markExplored(`proverb_${proverb.id}`);
    if (isNew) {
      addXP(5);
      onXP && onXP(5);
    }
  };

  return (
    <div className="learning-screen">
      <div className="page-header">
        <h2>📜 ಗಾದೆ ಮಾತುಗಳು — Kannada Proverbs & Wisdom</h2>
        <p>Explore timeless ancient Kannada proverbs, cultural wisdom, and native audio!</p>
      </div>

      {/* Hero Showcase Card */}
      {selectedProverb && (
        <div className="glass-card" style={{
          padding: '2rem',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, rgba(255,215,0,0.12), rgba(232,130,154,0.08))',
          border: '1px solid rgba(255,215,0,0.3)',
          boxShadow: '0 12px 40px rgba(232,130,154,0.15)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
            <span className="pill pill-gold" style={{ fontSize: '0.8rem' }}>
              💡 {selectedProverb.category}
            </span>
            <button
              className="btn-primary"
              style={{ padding: '0.6rem 1.4rem', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '100px' }}
              onClick={() => handleSelect(selectedProverb)}
            >
              {isPlaying ? '🔊 Speaking...' : '🔊 Listen Native Audio'}
            </button>
          </div>

          <h3 style={{
            fontFamily: 'Noto Sans Kannada, sans-serif',
            fontSize: '2rem',
            fontWeight: 800,
            color: 'var(--sakura-pink)',
            marginBottom: '0.5rem',
            lineHeight: 1.3
          }}>
            "{selectedProverb.kannada}"
          </h3>

          <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--gold)', marginBottom: '1rem', fontStyle: 'italic' }}>
            /{selectedProverb.transliteration}/
          </div>

          <div style={{
            background: 'rgba(0,0,0,0.25)',
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block' }}>Literal Translation</span>
              <span style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>"{selectedProverb.literalMeaning}"</span>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', fontWeight: 700 }}>Actual Meaning</span>
              <span style={{ fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 700 }}>{selectedProverb.actualMeaning}</span>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--sakura-blossom)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block' }}>Cultural Context</span>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{selectedProverb.explanation}</span>
            </div>
          </div>
        </div>
      )}

      {/* Category Filter Pills */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
        {categories.map(cat => (
          <button
            key={cat}
            className={`section-tab${selectedCategory === cat ? ' active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* List of Proverbs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {filteredProverbs.map(p => {
          const isSelected = selectedProverb?.id === p.id;
          return (
            <div
              key={p.id}
              className={`glass-card alpha-tile${isSelected ? ' selected' : ''}`}
              onClick={() => handleSelect(p)}
              style={{
                padding: '1.25rem',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between',
                borderRadius: 'var(--radius-md)'
              }}
            >
              <div>
                <span className="pill pill-gold" style={{ fontSize: '0.68rem', marginBottom: '0.5rem', display: 'inline-block' }}>
                  {p.category}
                </span>
                <h4 style={{
                  fontFamily: 'Noto Sans Kannada, sans-serif',
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  color: isSelected ? 'var(--sakura-pink)' : 'var(--text-primary)',
                  lineHeight: 1.3,
                  marginBottom: '0.4rem'
                }}>
                  {p.kannada}
                </h4>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '0.6rem' }}>
                  {p.transliteration}
                </div>
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                💡 {p.actualMeaning}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProverbsStudio;
