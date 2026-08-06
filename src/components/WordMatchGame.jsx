import React, { useState, useEffect } from 'react';
import { comprehensiveDictionary } from '../data/dictionaryData.js';
import { speakKannada } from '../utils/tts.js';
import { addXP } from '../utils/storage.js';

const WordMatchGame = ({ onXP, onToast }) => {
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const [tiles, setTiles] = useState([]);
  const [selectedTile, setSelectedTile] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [wrongPair, setWrongPair] = useState(null);

  // Initialize round
  const startNewGame = () => {
    setScore(0);
    setStreak(0);
    setTimeLeft(60);
    setGameOver(false);
    setGameActive(true);
    setMatchedPairs([]);
    setSelectedTile(null);
    setWrongPair(null);
    setupBoard();
  };

  const setupBoard = () => {
    // Pick 6 random words from comprehensive dictionary
    const shuffledDict = [...comprehensiveDictionary].sort(() => Math.random() - 0.5);
    const selectedWords = shuffledDict.slice(0, 6);

    const formattedTiles = [];
    selectedWords.forEach((item, index) => {
      formattedTiles.push({
        id: `kannada_${index}`,
        pairId: index,
        text: item.kannada,
        subtext: item.transliteration,
        type: 'kannada',
      });
      formattedTiles.push({
        id: `english_${index}`,
        pairId: index,
        text: item.meaning,
        type: 'english',
      });
    });

    // Shuffle tiles
    setTiles(formattedTiles.sort(() => Math.random() - 0.5));
    setSelectedTile(null);
    setWrongPair(null);
  };

  // Timer countdown
  useEffect(() => {
    let timer = null;
    if (gameActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            setGameActive(false);
            setGameOver(true);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameActive, timeLeft]);

  // Handle Tile Click
  const handleTileClick = (tile) => {
    if (!gameActive || matchedPairs.includes(tile.pairId)) return;

    if (tile.type === 'kannada') {
      speakKannada(tile.text);
    }

    if (!selectedTile) {
      setSelectedTile(tile);
      setWrongPair(null);
      return;
    }

    if (selectedTile.id === tile.id) {
      setSelectedTile(null);
      return;
    }

    // Check Match
    if (selectedTile.pairId === tile.pairId) {
      // MATCH SUCCESS!
      const newMatched = [...matchedPairs, tile.pairId];
      setMatchedPairs(newMatched);
      setSelectedTile(null);
      setStreak(s => s + 1);

      const pointsEarned = 10 + streak * 2;
      setScore(s => s + pointsEarned);

      // Check if board cleared (6 pairs)
      if (newMatched.length === 6) {
        addXP(15);
        onXP && onXP(15);
        onToast && onToast('🔥 Board Cleared! +15 XP Bonus!', 'xp');
        setTimeout(() => {
          setMatchedPairs([]);
          setupBoard();
        }, 600);
      }
    } else {
      // MISMATCH!
      setWrongPair([selectedTile.id, tile.id]);
      setStreak(0);
      setTimeout(() => {
        setSelectedTile(null);
        setWrongPair(null);
      }, 700);
    }
  };

  return (
    <div className="learning-screen">
      <div className="page-header">
        <h2>🎮 Word Match Arena — Speed Matching</h2>
        <p>Match Kannada words with their English meanings before time runs out!</p>
      </div>

      {!gameActive && !gameOver && (
        <div className="glass-card" style={{ padding: '3rem 2rem', textAlign: 'center', maxWidth: '550px', margin: '2rem auto' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>⏱️</div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--sakura-pink)', marginBottom: '0.5rem' }}>
            Ready for Speed Match?
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            You have 60 seconds to match as many Kannada & English pairs as possible. Build streaks for multiplier bonus points!
          </p>
          <button className="btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', borderRadius: '100px' }} onClick={startNewGame}>
            🚀 Start Matching Challenge!
          </button>
        </div>
      )}

      {gameActive && (
        <>
          {/* Game Stats Bar */}
          <div className="glass-card" style={{
            padding: '1rem 1.5rem',
            marginBottom: '1.5rem',
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            border: '1px solid rgba(255,215,0,0.3)'
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Time Left</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: timeLeft <= 10 ? '#ef4444' : 'var(--gold)' }}>
                ⏱️ {timeLeft}s
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Score</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--sakura-pink)' }}>
                ⭐ {score}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Streak Combo</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: streak >= 3 ? '#4ade80' : 'var(--text-primary)' }}>
                🔥 {streak}x
              </div>
            </div>
          </div>

          {/* Matching Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: '0.85rem'
          }}>
            {tiles.map(tile => {
              const isMatched = matchedPairs.includes(tile.pairId);
              const isSelected = selectedTile?.id === tile.id;
              const isWrong = wrongPair?.includes(tile.id);

              return (
                <div
                  key={tile.id}
                  className="glass-card"
                  onClick={() => handleTileClick(tile)}
                  style={{
                    height: '110px',
                    padding: '0.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justify: 'center',
                    cursor: isMatched ? 'default' : 'pointer',
                    opacity: isMatched ? 0.3 : 1,
                    transform: isSelected ? 'scale(1.05)' : isWrong ? 'shake 0.3s' : 'scale(1)',
                    border: isMatched
                      ? '1px solid rgba(34,197,94,0.3)'
                      : isWrong
                        ? '2px solid #ef4444'
                        : isSelected
                          ? '2px solid var(--sakura-pink)'
                          : '1px solid rgba(255,255,255,0.1)',
                    background: isMatched
                      ? 'rgba(34,197,94,0.1)'
                      : isWrong
                        ? 'rgba(239,68,68,0.2)'
                        : isSelected
                          ? 'linear-gradient(135deg, rgba(255,183,197,0.3), rgba(155,58,110,0.2))'
                          : undefined,
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? '0 0 20px rgba(255,183,197,0.4)' : undefined
                  }}
                >
                  {tile.type === 'kannada' ? (
                    <>
                      <span style={{ fontFamily: 'Noto Sans Kannada, sans-serif', fontSize: '1.6rem', fontWeight: 800, color: 'var(--sakura-pink)' }}>
                        {tile.text}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        /{tile.subtext}/
                      </span>
                    </>
                  ) : (
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', textAlign: 'center', lineHeight: 1.2 }}>
                      {tile.text}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {gameOver && (
        <div className="glass-card" style={{ padding: '3rem 2rem', textAlign: 'center', maxWidth: '550px', margin: '2rem auto' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>🎉</div>
          <h3 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--gold)', marginBottom: '0.5rem' }}>
            Game Over!
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem', fontSize: '1.1rem' }}>
            Final Score: <strong style={{ color: 'var(--sakura-pink)' }}>{score} points</strong>
          </p>

          <div style={{
            background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.25)',
            padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', color: 'var(--gold)'
          }}>
            ⭐ Earned <strong>+{Math.floor(score / 10)} XP</strong> for this match round!
          </div>

          <button className="btn-primary" style={{ padding: '0.9rem 2.2rem', fontSize: '1.05rem', borderRadius: '100px' }} onClick={startNewGame}>
            🔄 Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default WordMatchGame;
