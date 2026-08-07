import React, { useState, useRef } from 'react';
import { stories } from '../data/storiesData.js';
import { speakKannada } from '../utils/tts.js';
import { addXP } from '../utils/storage.js';

const StoryMode = ({ onXP, onToast }) => {
  const [storyIdx, setStoryIdx] = useState(0);
  const [sentenceIdx, setSentenceIdx] = useState(0);
  const [tooltip, setTooltip] = useState(null); // { word, meaning, x, y }
  const [completed, setCompleted] = useState(new Set());
  const [playing, setPlaying] = useState(false);
  const containerRef = useRef(null);

  const story = stories[storyIdx];
  const sentence = story.sentences[sentenceIdx];
  const progress = Math.round((sentenceIdx / story.sentences.length) * 100);

  const handleWordClick = (word, e) => {
    const rect = e.target.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    setTooltip({
      word: word.kannada,
      meaning: word.english,
      x: rect.left - (containerRect?.left || 0),
      y: rect.bottom - (containerRect?.top || 0) + 8,
    });
    setTimeout(() => setTooltip(null), 2500);
  };

  const speakSentence = () => {
    setPlaying(true);
    speakKannada(sentence.kannada);
    setTimeout(() => setPlaying(false), 3000);
  };

  const nextSentence = () => {
    if (!completed.has(sentenceIdx)) {
      addXP(5);
      onXP && onXP(5);
      setCompleted(c => new Set([...c, sentenceIdx]));
    }
    if (sentenceIdx < story.sentences.length - 1) {
      setSentenceIdx(i => i + 1);
    } else {
      onToast && onToast(`📖 Story complete! ಅಭಿನಂದನೆ!`, 'success');
    }
  };

  const selectStory = (i) => {
    setStoryIdx(i);
    setSentenceIdx(0);
    setCompleted(new Set());
    setTooltip(null);
  };

  return (
    <div className="learning-screen">
      <div className="page-header">
        <h2>📖 Kannada Story Mode</h2>
        <p>Read Kannada stories — tap any word to see its meaning!</p>
      </div>

      {/* Story Selector */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {stories.map((s, i) => (
          <button key={s.id} onClick={() => selectStory(i)}
            className={`section-tab${storyIdx === i ? ' active' : ''}`}>
            {s.icon} {s.titleEn}
          </button>
        ))}
      </div>

      {/* Story Card */}
      <div className="glass-card" style={{ padding: '0', overflow: 'hidden', marginBottom: '1.5rem' }}>
        {/* Header */}
        <div style={{ background: story.color, padding: '1.5rem 2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '2.5rem' }}>{story.icon}</span>
            <div>
              <h3 style={{ fontFamily: 'Noto Sans Kannada', fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
                {story.title}
              </h3>
              <p style={{ margin: 0, opacity: 0.85, fontSize: '0.9rem' }}>{story.titleEn} • {story.level}</p>
            </div>
          </div>
        </div>

        <div style={{ padding: '2rem', position: 'relative' }} ref={containerRef}>
          {/* Progress */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            <span>Sentence {sentenceIdx + 1} of {story.sentences.length}</span>
            <span style={{ color: 'var(--gold)' }}>{completed.size} completed ✓</span>
          </div>
          <div className="quiz-progress-bar" style={{ marginBottom: '1.5rem' }}>
            <div className="quiz-progress-fill" style={{ width: `${progress}%` }} />
          </div>

          {/* Kannada sentence — word-by-word clickable */}
          <div style={{
            fontFamily: 'Noto Sans Kannada, sans-serif',
            fontSize: 'clamp(1.3rem, 4vw, 2rem)',
            lineHeight: 1.8,
            marginBottom: '1rem',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.4rem',
          }}>
            {sentence.words.map((word, i) => (
              <span
                key={i}
                onClick={(e) => handleWordClick(word, e)}
                style={{
                  cursor: 'pointer',
                  padding: '0.15rem 0.4rem',
                  borderRadius: '6px',
                  transition: 'all 0.15s',
                  userSelect: 'none',
                  background: 'rgba(255,182,193,0.08)',
                  border: '1px solid transparent',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,182,193,0.22)';
                  e.currentTarget.style.borderColor = 'rgba(255,182,193,0.4)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,182,193,0.08)';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
              >
                {word.kannada}
              </span>
            ))}
          </div>

          {/* English translation */}
          <div style={{
            fontSize: '1rem',
            color: 'var(--text-secondary)',
            fontStyle: 'italic',
            marginBottom: '1.5rem',
            padding: '0.75rem 1rem',
            borderLeft: '3px solid var(--sakura-pink)',
            background: 'rgba(255,182,193,0.05)',
            borderRadius: '0 8px 8px 0',
          }}>
            {sentence.english}
          </div>

          {/* Tooltip */}
          {tooltip && (
            <div style={{
              position: 'absolute',
              left: tooltip.x,
              top: tooltip.y,
              background: 'var(--card-bg)',
              border: '1px solid var(--sakura-pink)',
              borderRadius: '10px',
              padding: '0.5rem 0.9rem',
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              zIndex: 100,
              fontSize: '0.9rem',
              animation: 'fadeIn 0.2s ease',
              whiteSpace: 'nowrap',
            }}>
              <strong style={{ fontFamily: 'Noto Sans Kannada', color: 'var(--sakura-pink)', fontSize: '1rem' }}>
                {tooltip.word}
              </strong>
              <span style={{ color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>= {tooltip.meaning}</span>
            </div>
          )}

          {/* Controls */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button className="audio-btn" onClick={speakSentence} disabled={playing}>
              {playing ? '🔊 Playing…' : '🔊 Listen'}
            </button>
            <button className="btn-primary" onClick={nextSentence}
              style={{ flex: 1, padding: '0.75rem 1.5rem' }}>
              {sentenceIdx < story.sentences.length - 1 ? 'Next Sentence →' : '✅ Complete Story'}
            </button>
          </div>
        </div>
      </div>

      {/* Word bank */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h4 style={{ marginBottom: '1rem', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
          📚 Word Bank — Click any word above to reveal meaning
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {sentence.words.map((w, i) => (
            <div key={i} style={{
              padding: '0.4rem 0.75rem',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '8px',
              fontSize: '0.82rem',
            }}>
              <span style={{ fontFamily: 'Noto Sans Kannada', color: 'var(--sakura-pink)' }}>{w.kannada}</span>
              <span style={{ color: 'var(--text-muted)', marginLeft: '0.4rem' }}>({w.english})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StoryMode;
