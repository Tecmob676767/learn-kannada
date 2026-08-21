import React, { useState, useEffect } from 'react';
import { fetchGlobalUsers } from '../utils/onlineLeaderboard.js';
import { getCurrentUser } from '../utils/storage.js';
import { playClick } from '../utils/soundEffects.js';

const LEAGUE_TIERS = [
  { id: 'bronze', name: 'Bronze League', nameKn: 'ಕಂಚಿನ ವಿಭಾಗ', icon: '🥉', minXP: 0, maxXP: 500, color: '#cd7f32', bg: 'linear-gradient(135deg, #8B5A2B, #CD7F32)' },
  { id: 'silver', name: 'Silver League', nameKn: 'ಬೆಳ್ಳಿಯ ವಿಭಾಗ', icon: '🥈', minXP: 500, maxXP: 1500, color: '#c0c0c0', bg: 'linear-gradient(135deg, #708090, #C0C0C0)' },
  { id: 'gold', name: 'Gold League', nameKn: 'ಚಿನ್ನದ ವಿಭಾಗ', icon: '🥇', minXP: 1500, maxXP: 3000, color: '#ffd700', bg: 'linear-gradient(135deg, #B8860B, #FFD700)' },
  { id: 'diamond', name: 'Diamond League', nameKn: 'ವಜ್ರದ ವಿಭಾಗ', icon: '💎', minXP: 3000, maxXP: 6000, color: '#00f2fe', bg: 'linear-gradient(135deg, #4facfe, #00f2fe)' },
  { id: 'crown', name: 'Karnataka Crown League', nameKn: 'ಕರ್ನಾಟಕ ಕಿರೀಟ ವಿಭಾಗ', icon: '👑', minXP: 6000, maxXP: Infinity, color: '#ff6b35', bg: 'linear-gradient(135deg, #d90429, #ffb703)' },
];

const Leagues = ({ user, onToast }) => {
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const userXP = user?.xp || 0;

  // Determine user's current league
  const userLeague = LEAGUE_TIERS.find(t => userXP >= t.minXP && userXP < t.maxXP) || LEAGUE_TIERS[0];
  const [selectedLeagueId, setSelectedLeagueId] = useState(userLeague.id);

  useEffect(() => {
    fetchGlobalUsers(false).then(res => {
      setUsers(res || {});
      setLoading(false);
    });
  }, []);

  const activeTier = LEAGUE_TIERS.find(t => t.id === selectedLeagueId) || userLeague;

  // Filter users belonging to the selected league tier
  const tierUsers = Object.values(users)
    .filter(u => (u.xp || 0) >= activeTier.minXP && (u.xp || 0) < activeTier.maxXP)
    .sort((a, b) => (b.xp || 0) - (a.xp || 0));

  // Compute days until Sunday reset
  const now = new Date();
  const daysUntilSunday = (7 - now.getDay()) % 7 || 7;

  return (
    <div className="learning-screen leagues-container">
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.75rem', fontWeight: 900 }}>
              🏆 <span className="gradient-text">Sobagu Weekly Leagues</span> · ಸಾಪ್ತಾಹಿಕ ಲೀಗ್
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Compete with Kannada learners worldwide. Top 3 gain promotion every Sunday!
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(255,215,0,0.1)', padding: '0.5rem 1rem', borderRadius: '20px', border: '1px solid rgba(255,215,0,0.3)' }}>
            <span>⏳</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--gold)' }}>
              League resets in {daysUntilSunday} days
            </span>
          </div>
        </div>
      </div>

      {/* User Current League Banner */}
      <div
        className="glass-card"
        style={{
          padding: '1.5rem 2rem',
          marginBottom: '2rem',
          background: activeTier.bg,
          boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <span style={{ fontSize: '3.5rem', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.4))' }}>
              {activeTier.icon}
            </span>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 800 }}>
                {activeTier.nameKn}
              </div>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff', margin: '0.2rem 0' }}>
                {activeTier.name}
              </h3>
              <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.9)' }}>
                Required XP: {activeTier.minXP} – {activeTier.maxXP === Infinity ? '6000+' : activeTier.maxXP} XP
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right', background: 'rgba(0,0,0,0.3)', padding: '0.75rem 1.25rem', borderRadius: '16px', backdropFilter: 'blur(10px)' }}>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>Your XP</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--gold)' }}>{userXP} XP</div>
            <div style={{ fontSize: '0.72rem', color: '#4ade80', fontWeight: 700 }}>
              {userXP >= activeTier.maxXP ? '👑 Promotion Zone' : `${activeTier.maxXP - userXP} XP to next tier`}
            </div>
          </div>
        </div>
      </div>

      {/* League Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {LEAGUE_TIERS.map(tier => (
          <button
            key={tier.id}
            onClick={() => {
              playClick();
              setSelectedLeagueId(tier.id);
            }}
            style={{
              padding: '0.7rem 1.2rem',
              borderRadius: '20px',
              border: selectedLeagueId === tier.id ? `2px solid ${tier.color}` : '1px solid rgba(255,255,255,0.08)',
              background: selectedLeagueId === tier.id ? `${tier.color}20` : 'rgba(255,255,255,0.03)',
              color: selectedLeagueId === tier.id ? '#fff' : 'var(--text-secondary)',
              fontWeight: selectedLeagueId === tier.id ? 800 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            <span>{tier.icon}</span>
            <span>{tier.name}</span>
          </button>
        ))}
      </div>

      {/* Leaderboard Table */}
      <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>
            {activeTier.icon} {activeTier.name} Standings ({tierUsers.length} Learners)
          </span>
          <span style={{ fontSize: '0.8rem', color: '#4ade80', fontWeight: 700 }}>
            🟢 Top 3 Advance to Next League
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            Loading live league standings...
          </div>
        ) : tierUsers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{activeTier.icon}</div>
            <h4 style={{ color: '#fff', fontSize: '1.1rem' }}>Be the First in {activeTier.name}!</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '400px', margin: '0.5rem auto' }}>
              Earn {activeTier.minXP} XP by completing daily lessons and quizzes to claim the #1 spot in this division!
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {tierUsers.map((u, i) => {
              const isCurrentUser = u.code === user?.code;
              const isPromotion = i < 3;

              return (
                <div
                  key={u.code || i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.9rem 1.25rem',
                    borderRadius: '14px',
                    background: isCurrentUser 
                      ? 'rgba(255,163,102,0.18)' 
                      : isPromotion 
                        ? 'rgba(74,222,128,0.06)' 
                        : 'rgba(255,255,255,0.02)',
                    border: isCurrentUser 
                      ? '1.5px solid var(--sakura-pink)' 
                      : isPromotion 
                        ? '1px solid rgba(74,222,128,0.3)' 
                        : '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: i === 0 ? '#ffd700' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : 'rgba(255,255,255,0.06)',
                      color: i < 3 ? '#000' : '#fff',
                      fontWeight: 900,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.85rem',
                    }}>
                      {i + 1}
                    </div>

                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem', color: isCurrentUser ? 'var(--sakura-pink)' : '#fff' }}>
                        {u.name || 'Kannada Learner'} {isCurrentUser && ' (You)'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Level {u.level || 1} · 🔥 {u.streak || 1} day streak
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 900, fontSize: '1rem', color: 'var(--gold)' }}>
                      {u.xp || 0} XP
                    </div>
                    {isPromotion && (
                      <div style={{ fontSize: '0.7rem', color: '#4ade80', fontWeight: 800 }}>
                        ▲ Promoted
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leagues;
