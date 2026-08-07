import React, { useState, useRef, useEffect } from 'react';
import { songs } from '../data/songsData.js';
import { speakKannada } from '../utils/tts.js';
import { addXP } from '../utils/storage.js';

const SongsRhymes = ({ onXP, onToast }) => {
  const [songIdx, setSongIdx] = useState(0);
  const [verseIdx, setVerseIdx] = useState(0);
  const [lineIdx, setLineIdx] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [showTranslit, setShowTranslit] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);
  const [earned, setEarned] = useState(false);
  const timeoutsRef = useRef([]);

  const song = songs[songIdx];
  const verse = song.verses[verseIdx];

  const clearTimeouts = () => {
    timeoutsRef.current.forEach(t => clearTimeout(t));
    timeoutsRef.current = [];
  };

  const playVerse = () => {
    if (playing) {
      clearTimeouts();
      setPlaying(false);
      setLineIdx(-1);
      return;
    }
    setPlaying(true);
    setLineIdx(0);

    verse.lines.forEach((line, i) => {
      const t1 = setTimeout(() => {
        setLineIdx(i);
        speakKannada(line.kannada);
      }, i * 3200);
      timeoutsRef.current.push(t1);
    });

    const total = verse.lines.length * 3200 + 500;
    const tEnd = setTimeout(() => {
      setPlaying(false);
      setLineIdx(-1);
      if (!earned) {
        addXP(15);
        onXP && onXP(15);
        setEarned(true);
        onToast && onToast('🎵 Song played! +15 XP', 'xp');
      }
    }, total);
    timeoutsRef.current.push(tEnd);
  };

  const selectSong = (i) => {
    clearTimeouts();
    setPlaying(false);
    setLineIdx(-1);
    setSongIdx(i);
    setVerseIdx(0);
    setEarned(false);
  };

  useEffect(() => () => clearTimeouts(), []);

  return (
    <div className="learning-screen">
      <div className="page-header">
        <h2>🎵 ಕನ್ನಡ ಹಾಡು & ಪದ್ಯ — Songs & Rhymes</h2>
        <p>Learn Kannada through songs! Lyrics highlight as audio plays 🎶</p>
      </div>

      {/* Song Selector */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {songs.map((s, i) => (
          <button key={s.id} onClick={() => selectSong(i)}
            className={`section-tab${songIdx === i ? ' active' : ''}`}>
            {s.icon} {s.titleEn}
          </button>
        ))}
      </div>

      {/* Song Card */}
      <div className="glass-card" style={{ overflow: 'hidden', marginBottom: '1.5rem' }}>
        {/* Banner */}
        <div style={{ background: song.color, padding: '1.5rem 2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '2.5rem' }}>{song.icon}</span>
              <div>
                <h3 style={{ fontFamily: 'Noto Sans Kannada', fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>
                  {song.title}
                </h3>
                <p style={{ margin: 0, opacity: 0.85, fontSize: '0.88rem' }}>{song.titleEn} • ⏱ {song.tempo}</p>
              </div>
            </div>
            <button
              onClick={playVerse}
              style={{
                padding: '0.75rem 1.75rem',
                background: playing ? 'rgba(245,87,108,0.9)' : 'rgba(255,255,255,0.25)',
                backdropFilter: 'blur(8px)',
                border: '2px solid rgba(255,255,255,0.4)',
                borderRadius: '50px',
                color: '#fff',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {playing ? '⏹ Stop' : '▶ Play Verse'}
            </button>
          </div>
        </div>

        <div style={{ padding: '2rem' }}>
          {/* Verse tabs */}
          {song.verses.length > 1 && (
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {song.verses.map((_, i) => (
                <button key={i} onClick={() => { clearTimeouts(); setPlaying(false); setLineIdx(-1); setVerseIdx(i); }}
                  className={`section-tab${verseIdx === i ? ' active' : ''}`}
                  style={{ padding: '0.35rem 0.9rem', fontSize: '0.82rem' }}>
                  Verse {i + 1}
                </button>
              ))}
            </div>
          )}

          {/* Toggle controls */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <button className={`section-tab${showTranslit ? ' active' : ''}`}
              onClick={() => setShowTranslit(v => !v)} style={{ fontSize: '0.8rem', padding: '0.35rem 0.8rem' }}>
              🔤 Transliteration
            </button>
            <button className={`section-tab${showTranslation ? ' active' : ''}`}
              onClick={() => setShowTranslation(v => !v)} style={{ fontSize: '0.8rem', padding: '0.35rem 0.8rem' }}>
              🌐 Translation
            </button>
          </div>

          {/* Lyrics */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {verse.lines.map((line, i) => {
              const isActive = lineIdx === i;
              return (
                <div key={i} style={{
                  padding: '1rem 1.25rem',
                  borderRadius: '12px',
                  background: isActive ? 'rgba(255,182,193,0.15)' : 'rgba(255,255,255,0.03)',
                  borderLeft: `4px solid ${isActive ? 'var(--sakura-pink)' : 'transparent'}`,
                  transition: 'all 0.3s',
                  transform: isActive ? 'scale(1.01)' : 'scale(1)',
                  cursor: 'pointer',
                }}
                  onClick={() => speakKannada(line.kannada)}
                >
                  <div style={{
                    fontFamily: 'Noto Sans Kannada, sans-serif',
                    fontSize: 'clamp(1.1rem, 3vw, 1.5rem)',
                    fontWeight: isActive ? 700 : 400,
                    color: isActive ? 'var(--sakura-pink)' : 'var(--text-primary)',
                    marginBottom: '0.25rem',
                  }}>
                    {line.kannada}
                  </div>
                  {showTranslit && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '0.2rem' }}>
                      {line.transliteration}
                    </div>
                  )}
                  {showTranslation && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {line.english}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            💡 Click any line to hear it individually
          </div>
        </div>
      </div>
    </div>
  );
};

export default SongsRhymes;
