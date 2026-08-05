import React, { useState } from 'react';
import { vachanas, gaadegalu, movieQuotes } from '../data/literatureData.js';
import { speakKannada } from '../utils/tts.js';
import { addXP, updateUser, getCurrentUser, markExplored } from '../utils/storage.js';

const LiteratureMasterclass = ({ onXP }) => {
  const [tab, setTab] = useState('vachana');
  const [expanded, setExpanded] = useState(null);

  const handleExpand = (id, text) => {
    setExpanded(e => e === id ? null : id);
    speakKannada(text);

    const isNew = markExplored(`lit_${id}`);
    if (isNew) {
      addXP(5);
      onXP && onXP(5);
      const u = getCurrentUser();
      if (u) updateUser({ progress: { ...(u.progress || {}), literature: Math.min(100, (u.progress?.literature || 0) + 8) } });
    }
  };

  return (
    <div className="learning-screen">
      <div className="page-header">
        <h2>📜 ಸಾಹಿತ್ಯ — Literature Masterclass</h2>
        <p>Explore Vachanas, Proverbs & Kannada Movie Gems. Tap to hear & learn!</p>
      </div>

      <div className="section-tabs">
        <button className={`section-tab${tab === 'vachana' ? ' active' : ''}`} onClick={() => setTab('vachana')}>🪔 Vachanas</button>
        <button className={`section-tab${tab === 'proverb' ? ' active' : ''}`} onClick={() => setTab('proverb')}>🌿 Gaadegalu (Proverbs)</button>
        <button className={`section-tab${tab === 'movie' ? ' active' : ''}`} onClick={() => setTab('movie')}>🎬 Movie Quotes</button>
      </div>

      {tab === 'vachana' && (
        <div>
          {vachanas.map(v => (
            <div key={v.id} className="vachana-card" onClick={() => handleExpand(v.id, v.lines.join(' '))}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '1.5rem' }}>{v.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--gold)', fontSize: '0.9rem' }}>{v.author}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{v.period}</div>
                </div>
                <button className="audio-btn" style={{ marginLeft: 'auto' }} onClick={e => { e.stopPropagation(); speakKannada(v.lines.join('. ')); }}>
                  🔊 Hear
                </button>
              </div>

              {v.lines.map((line, li) => (
                <span key={li} className="vachana-line">{line}</span>
              ))}

              {expanded === v.id && (
                <div className="vachana-meaning">
                  <div style={{ marginBottom: '0.5rem', fontStyle: 'normal', color: 'var(--text-secondary)' }}>
                    <strong style={{ color: 'var(--gold)' }}>Transliteration:</strong> {v.transliteration}
                  </div>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong style={{ color: 'var(--gold)' }}>Literal:</strong> {v.literal}
                  </div>
                  <div>
                    <strong style={{ color: 'var(--gold)' }}>Deep Meaning:</strong> {v.meaning}
                  </div>
                </div>
              )}

              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
                {expanded === v.id ? '▲ Click to collapse' : '▼ Click to expand meaning & translation'}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'proverb' && (
        <div>
          {gaadegalu.map((g, i) => (
            <div key={i} className="proverb-card" onClick={() => handleExpand(`p${i}`, g.kannada)}>
              <span className="proverb-kannada">{g.kannada}</span>
              <span className="proverb-transliteration">{g.transliteration}</span>
              {expanded === `p${i}` && (
                <>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontStyle: 'italic' }}>
                    Literal: "{g.literal}"
                  </div>
                  <p className="proverb-meaning">{g.meaning}</p>
                </>
              )}
              {expanded !== `p${i}` && <p className="proverb-meaning" style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.82rem' }}>Click to reveal meaning...</p>}
            </div>
          ))}
        </div>
      )}

      {tab === 'movie' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {movieQuotes.map((q, i) => (
            <div key={i} className="glass-card" style={{ padding: '1.5rem', cursor: 'pointer', border: '1px solid rgba(255,215,0,0.15)' }}
              onClick={() => handleExpand(`m${i}`, q.kannada)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <span className="pill pill-gold" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>🎬 {q.movie}</span>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>— {q.character}</div>
                </div>
                <button className="audio-btn" onClick={e => { e.stopPropagation(); speakKannada(q.kannada); }}>🔊</button>
              </div>
              <div style={{ fontFamily: 'Noto Sans Kannada, sans-serif', fontSize: '1.4rem', fontWeight: 700, color: 'var(--sakura-pink)', marginBottom: '0.4rem' }}>
                {q.kannada}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>{q.transliteration}</div>
              {expanded === `m${i}` && (
                <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(255,215,0,0.05)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--gold)' }}>
                  {q.meaning}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LiteratureMasterclass;
