import React, { useState } from 'react';
import { comprehensiveDictionary, dictionaryCategories } from '../data/dictionaryData.js';
import { speakKannada } from '../utils/tts.js';

const Dictionary = () => {
  const [query, setQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  const [speechRate, setSpeechRate] = useState(0.85);
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('sobagu_dict_favs') || '[]');
    } catch {
      return [];
    }
  });

  const toggleFav = (word) => {
    const nextFavs = favorites.includes(word.kannada)
      ? favorites.filter(k => k !== word.kannada)
      : [...favorites, word.kannada];
    setFavorites(nextFavs);
    localStorage.setItem('sobagu_dict_favs', JSON.stringify(nextFavs));
  };

  const filtered = comprehensiveDictionary.filter(d => {
    const matchesCat = selectedCat === 'All' || d.category === selectedCat;
    const q = query.toLowerCase().trim();
    const matchesQuery = !q ||
      d.kannada.includes(q) ||
      d.transliteration.toLowerCase().includes(q) ||
      d.meaning.toLowerCase().includes(q);
    return matchesCat && matchesQuery;
  });

  return (
    <div className="learning-screen">
      <div className="page-header">
        <h2>📖 ಕನ್ನಡ ಶಬ್ದಕೋಶ — Dictionary ({comprehensiveDictionary.length}+ Words)</h2>
        <p>Search across 12 categories, listen at custom audio speed, and bookmark favorites!</p>
      </div>

      {/* Audio Speed Controller & Search */}
      <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1rem' }}>
          <input
            id="dict-search-input"
            className="form-input"
            style={{ flex: 1, minWidth: '220px', fontFamily: 'Noto Sans Kannada, Outfit, sans-serif', fontSize: '1rem' }}
            type="text"
            placeholder="🔍 Search in Kannada, Transliteration, or English..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
          />

          {/* Speech Rate Control */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.3)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>🔊 Audio Speed: {speechRate}x</span>
            <input
              type="range"
              min="0.5"
              max="1.2"
              step="0.05"
              value={speechRate}
              onChange={e => setSpeechRate(parseFloat(e.target.value))}
              style={{ width: '80px', cursor: 'pointer' }}
            />
          </div>
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.4rem', scrollbarWidth: 'none' }}>
          {dictionaryCategories.map(cat => (
            <button
              key={cat}
              className={`section-tab${selectedCat === cat ? ' active' : ''}`}
              onClick={() => setSelectedCat(cat)}
              style={{ padding: '0.35rem 0.9rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Word Count */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Showing {filtered.length} of {comprehensiveDictionary.length} words
        </span>
        {favorites.length > 0 && (
          <span style={{ fontSize: '0.85rem', color: 'var(--gold)', fontWeight: 600 }}>
            ⭐ {favorites.length} Bookmarked
          </span>
        )}
      </div>

      {/* Dictionary Items List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {filtered.map((d, i) => {
          const isFav = favorites.includes(d.kannada);
          return (
            <div
              key={i}
              className="glass-card"
              style={{
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between',
                transition: 'var(--transition)',
                border: isFav ? '1px solid rgba(255,215,0,0.4)' : undefined,
                background: isFav ? 'linear-gradient(135deg, rgba(255,215,0,0.06), rgba(232,130,154,0.04))' : undefined,
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <span style={{ fontFamily: 'Noto Sans Kannada, sans-serif', fontSize: '1.8rem', fontWeight: 800, color: 'var(--sakura-pink)' }}>
                    {d.kannada}
                  </span>
                  <button
                    onClick={() => toggleFav(d)}
                    style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', opacity: isFav ? 1 : 0.4 }}
                    title={isFav ? 'Remove bookmark' : 'Bookmark word'}
                  >
                    ⭐
                  </button>
                </div>

                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                  {d.meaning}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '0.75rem' }}>
                  {d.transliteration}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                <span className="pill pill-pink" style={{ fontSize: '0.7rem' }}>{d.category}</span>
                <button
                  className="audio-btn"
                  onClick={() => speakKannada(d.kannada, speechRate)}
                >
                  🔊 Listen
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          No words found matching "{query}". Try another keyword or select "All"!
        </div>
      )}
    </div>
  );
};

export default Dictionary;
