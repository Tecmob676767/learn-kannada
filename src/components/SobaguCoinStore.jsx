import React, { useState } from 'react';
import { SOBAGU_PACKAGES, PACKAGE_CATEGORIES } from '../data/sobaguPackagesData.js';
import { buyPackageWithCoins, getSobaguCoins, getPurchasedPackages, isPackagePurchased, getCurrentUser } from '../utils/storage.js';
import { speakKannada } from '../utils/tts.js';
import { playSuccess, playFanfare, playClick, playError } from '../utils/soundEffects.js';

export default function SobaguCoinStore({ user, onNavigate, onToast, onRefreshUser }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalPackage, setActiveModalPackage] = useState(null);
  const [buyingId, setBuyingId] = useState(null);

  const currentUser = user || getCurrentUser() || {};
  const coins = Number(currentUser.coins !== undefined ? currentUser.coins : 5) || 0;
  const purchasedList = Array.isArray(currentUser.purchasedPackages) ? currentUser.purchasedPackages : getPurchasedPackages();

  const handleBuy = (pkg) => {
    playClick();
    if (purchasedList.includes(pkg.id)) {
      setActiveModalPackage(pkg);
      return;
    }

    if (coins < pkg.coinPrice) {
      playError();
      onToast?.(
        `🪙 Not enough coins! You have ${coins} coins, but need ${pkg.coinPrice}. Complete lessons to earn +1 coin each!`,
        'error'
      );
      return;
    }

    setBuyingId(pkg.id);
    const result = buyPackageWithCoins(pkg.id, pkg.coinPrice);
    setBuyingId(null);

    if (result.success) {
      playFanfare();
      onRefreshUser?.();
      onToast?.(`🎉 "${pkg.title}" Unlocked! -${pkg.coinPrice} Coins`, 'xp');
      setActiveModalPackage(pkg);
    } else {
      playError();
      onToast?.(result.reason || 'Could not complete purchase.', 'error');
    }
  };

  const filteredPackages = SOBAGU_PACKAGES.filter((pkg) => {
    const matchCategory = selectedCategory === 'all' || pkg.category === selectedCategory;
    const matchSearch =
      !searchQuery ||
      pkg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.titleKn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="learning-screen">
      {/* ── Regal Hero Banner ── */}
      <div
        className="glass-card"
        style={{
          padding: '2.2rem 2rem',
          borderRadius: '24px',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.22) 0%, rgba(245, 158, 11, 0.15) 50%, rgba(220, 38, 38, 0.18) 100%)',
          border: '1.8px solid rgba(251, 191, 36, 0.65)',
          boxShadow: '0 12px 40px rgba(245, 158, 11, 0.25)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div style={{ flex: 1, minWidth: '280px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(90deg, #ffd700, #ff8c00)',
              color: '#000',
              fontWeight: 900,
              fontSize: '0.72rem',
              padding: '3px 12px',
              borderRadius: '20px',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              marginBottom: '0.6rem',
            }}
          >
            <span>🪙</span>
            <span>SOBAGU COINS BAZAAR · ನಾಣ್ಯಗಳ ಮಾರುಕಟ್ಟೆ</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)',
              fontWeight: 900,
              color: '#fff',
              margin: '0 0 0.4rem 0',
              fontFamily: 'Noto Sans Kannada, sans-serif',
            }}
          >
            ಸೊಬಗು ನಾಣ್ಯಗಳ ಅಂಗಡಿ & ವಿಶೇಷ ಪ್ಯಾಕ್‌ಗಳು 🛍️
          </h1>

          <p
            style={{
              fontSize: '0.92rem',
              color: 'rgba(255, 255, 255, 0.85)',
              margin: '0 0 1rem 0',
              lineHeight: 1.5,
              maxWidth: '620px',
            }}
          >
            Earn <strong>1 Sobagu Coin for every lesson</strong> you complete on the Lesson Path! Redeem your coins for 50+ exclusive cultural packages: Sandalwood punchlines, Darshini guides, Bangalore street slang, Vachana literature, and VIP badges.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              className="btn-primary"
              onClick={() => {
                playClick();
                onNavigate?.('lessons');
              }}
              style={{
                background: 'linear-gradient(135deg, #ffd700, #f59e0b)',
                color: '#000',
                fontWeight: 900,
                padding: '0.75rem 1.4rem',
                borderRadius: '12px',
              }}
            >
              🗺️ Earn Coins on Lesson Path (+1 Coin/Lesson) ➔
            </button>
          </div>
        </div>

        {/* ── Coin Balance Vault ── */}
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(16px)',
            border: '2px solid rgba(251, 191, 36, 0.7)',
            borderRadius: '20px',
            padding: '1.5rem 1.8rem',
            textAlign: 'center',
            minWidth: '220px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ffd700', textTransform: 'uppercase', letterSpacing: '1px' }}>
            YOUR COIN BALANCE
          </div>
          <div
            style={{
              fontSize: '3rem',
              fontWeight: 900,
              color: '#ffd700',
              margin: '0.2rem 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <span>🪙</span>
            <span>{coins}</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.7)' }}>
            Unlocked Packs: <strong style={{ color: '#4ade80' }}>{purchasedList.length}</strong> / {SOBAGU_PACKAGES.length}
          </div>
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          <input
            type="text"
            placeholder="🔍 Search 50+ special packages (e.g., Rajkumar, Coffee, KGF, Slang, Vachana)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              minWidth: '280px',
              padding: '0.85rem 1.25rem',
              borderRadius: '14px',
              border: '1.5px solid rgba(251, 191, 36, 0.35)',
              background: 'rgba(0, 0, 0, 0.35)',
              color: '#fff',
              fontSize: '0.95rem',
              outline: 'none',
            }}
          />
        </div>

        {/* Categories Bar */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', scrollbarWidth: 'none' }}>
          {PACKAGE_CATEGORIES.map((cat) => {
            const count =
              cat.id === 'all'
                ? SOBAGU_PACKAGES.length
                : SOBAGU_PACKAGES.filter((p) => p.category === cat.id).length;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  playClick();
                  setSelectedCategory(cat.id);
                }}
                style={{
                  padding: '0.65rem 1.15rem',
                  borderRadius: '12px',
                  background: isSelected ? 'linear-gradient(135deg, #ffd700, #f59e0b)' : 'rgba(255, 255, 255, 0.06)',
                  color: isSelected ? '#000' : 'rgba(255, 255, 255, 0.85)',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  border: isSelected ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                }}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span
                  style={{
                    background: isSelected ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.12)',
                    padding: '2px 7px',
                    borderRadius: '10px',
                    fontSize: '0.72rem',
                    marginLeft: '4px',
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Package Grid ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem',
        }}
      >
        {filteredPackages.map((pkg) => {
          const isOwned = purchasedList.includes(pkg.id);
          const canAfford = coins >= pkg.coinPrice;

          return (
            <div
              key={pkg.id}
              className="glass-card"
              style={{
                padding: '1.5rem',
                borderRadius: '18px',
                border: isOwned
                  ? '1.5px solid rgba(74, 222, 128, 0.5)'
                  : '1.5px solid rgba(251, 191, 36, 0.3)',
                background: isOwned
                  ? 'linear-gradient(135deg, rgba(74, 222, 128, 0.08), rgba(0, 0, 0, 0.4))'
                  : 'rgba(0, 0, 0, 0.35)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
            >
              <div>
                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontSize: '2.2rem' }}>{pkg.icon}</span>
                    <div>
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: 900,
                          background: 'rgba(251, 191, 36, 0.2)',
                          color: '#ffd700',
                          padding: '2px 8px',
                          borderRadius: '8px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        {pkg.badge}
                      </span>
                    </div>
                  </div>

                  {/* Price Tag */}
                  <div
                    style={{
                      background: isOwned
                        ? 'rgba(74, 222, 128, 0.2)'
                        : 'linear-gradient(135deg, rgba(251, 191, 36, 0.25), rgba(245, 158, 11, 0.15))',
                      border: `1.5px solid ${isOwned ? '#4ade80' : '#ffd700'}`,
                      borderRadius: '12px',
                      padding: '4px 10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontWeight: 900,
                      color: isOwned ? '#4ade80' : '#ffd700',
                      fontSize: '0.85rem',
                    }}
                  >
                    <span>{isOwned ? '✓' : '🪙'}</span>
                    <span>{isOwned ? 'OWNED' : `${pkg.coinPrice} Coins`}</span>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.18rem', fontWeight: 900, color: '#fff', margin: '0 0 0.2rem 0' }}>
                  {pkg.title}
                </h3>
                <div
                  style={{
                    fontSize: '0.92rem',
                    color: '#ffd700',
                    fontFamily: 'Noto Sans Kannada, sans-serif',
                    fontWeight: 700,
                    marginBottom: '0.65rem',
                  }}
                >
                  {pkg.titleKn}
                </div>

                <p style={{ fontSize: '0.83rem', color: 'rgba(255, 255, 255, 0.75)', lineHeight: 1.45, margin: '0 0 1rem 0' }}>
                  {pkg.desc}
                </p>

                {/* Features checklist */}
                <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: '10px', padding: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>
                    Included Features:
                  </div>
                  {pkg.features.map((feat, fIdx) => (
                    <div key={fIdx} style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                      <span style={{ color: '#4ade80', fontSize: '0.75rem' }}>✓</span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                {/* Sample phrase audio preview */}
                {pkg.samplePhrase && (
                  <div
                    style={{
                      background: 'rgba(0,0,0,0.3)',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '10px',
                      borderLeft: '3px solid #ffd700',
                      marginBottom: '1rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 700, fontFamily: 'Noto Sans Kannada' }}>
                        "{pkg.samplePhrase.kn}"
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.6)' }}>
                        {pkg.samplePhrase.en}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        playClick();
                        speakKannada(pkg.samplePhrase.kn);
                      }}
                      style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: 'none',
                        color: '#ffd700',
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title="Hear Audio"
                    >
                      🔊
                    </button>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div>
                {isOwned ? (
                  <button
                    className="btn-primary"
                    onClick={() => {
                      playClick();
                      setActiveModalPackage(pkg);
                    }}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      fontSize: '0.88rem',
                      fontWeight: 800,
                      background: 'rgba(74, 222, 128, 0.2)',
                      border: '1.5px solid #4ade80',
                      color: '#4ade80',
                      borderRadius: '12px',
                    }}
                  >
                    📖 View Unlocked Package ➔
                  </button>
                ) : (
                  <button
                    className="btn-primary"
                    onClick={() => handleBuy(pkg)}
                    disabled={buyingId === pkg.id}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      fontSize: '0.9rem',
                      fontWeight: 900,
                      background: canAfford ? 'linear-gradient(135deg, #ffd700, #ff8c00)' : 'rgba(255,255,255,0.1)',
                      color: canAfford ? '#000' : 'rgba(255,255,255,0.5)',
                      border: canAfford ? 'none' : '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '12px',
                      cursor: canAfford ? 'pointer' : 'default',
                    }}
                  >
                    {canAfford ? (
                      `🪙 Buy with ${pkg.coinPrice} Coins`
                    ) : (
                      `🔒 Need ${pkg.coinPrice - coins} More Coins`
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Package Detail & Content Modal ── */}
      {activeModalPackage && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(10px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
          onClick={() => setActiveModalPackage(null)}
        >
          <div
            className="glass-card"
            style={{
              maxWidth: '560px',
              width: '100%',
              padding: '2rem',
              borderRadius: '24px',
              border: '2px solid rgba(251, 191, 36, 0.6)',
              background: 'radial-gradient(circle at top, #2e1a06 0%, #0d0702 100%)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
              position: 'relative',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '3rem' }}>{activeModalPackage.icon}</span>
                <div>
                  <h2 style={{ fontSize: '1.4rem', color: '#fff', margin: 0 }}>
                    {activeModalPackage.title}
                  </h2>
                  <div style={{ fontSize: '1.05rem', color: '#ffd700', fontFamily: 'Noto Sans Kannada', fontWeight: 800 }}>
                    {activeModalPackage.titleKn}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setActiveModalPackage(null)}
                style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.4rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                background: 'rgba(74, 222, 128, 0.15)',
                border: '1px solid rgba(74, 222, 128, 0.4)',
                borderRadius: '12px',
                padding: '0.65rem 1rem',
                color: '#4ade80',
                fontSize: '0.82rem',
                fontWeight: 800,
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>✓</span>
              <span>This package is permanently unlocked on your Sobagu account!</span>
            </div>

            <p style={{ fontSize: '0.92rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              {activeModalPackage.desc}
            </p>

            {/* Included Content Features */}
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '14px', padding: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ffd700', textTransform: 'uppercase', marginBottom: '6px' }}>
                Unlocked Materials:
              </div>
              {activeModalPackage.features.map((feat, i) => (
                <div key={i} style={{ fontSize: '0.85rem', color: '#fff', margin: '4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#4ade80' }}>★</span>
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            {/* Showcase Phrase */}
            {activeModalPackage.samplePhrase && (
              <div style={{ background: 'rgba(0,0,0,0.4)', padding: '1.2rem', borderRadius: '14px', borderLeft: '4px solid #ffd700', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.72rem', color: '#ffd700', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>
                  Signature Master Dialogue:
                </div>
                <div style={{ fontSize: '1.15rem', color: '#fff', fontWeight: 900, fontFamily: 'Noto Sans Kannada', lineHeight: 1.4 }}>
                  "{activeModalPackage.samplePhrase.kn}"
                </div>
                <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)', fontStyle: 'italic', margin: '4px 0' }}>
                  {activeModalPackage.samplePhrase.t}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.85)' }}>
                  {activeModalPackage.samplePhrase.en}
                </div>

                <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="btn-primary"
                    onClick={() => {
                      playClick();
                      speakKannada(activeModalPackage.samplePhrase.kn);
                    }}
                    style={{ padding: '0.45rem 1rem', fontSize: '0.8rem', fontWeight: 800, width: 'auto' }}
                  >
                    🔊 Listen Audio
                  </button>
                  <button
                    className="glass-btn"
                    onClick={() => {
                      playClick();
                      navigator.clipboard?.writeText(activeModalPackage.samplePhrase.kn);
                      onToast?.('📋 Dialogue copied to clipboard!', 'success');
                    }}
                    style={{ padding: '0.45rem 1rem', fontSize: '0.8rem' }}
                  >
                    📋 Copy Text
                  </button>
                </div>
              </div>
            )}

            <button
              className="btn-primary"
              onClick={() => setActiveModalPackage(null)}
              style={{ width: '100%', padding: '0.8rem', fontWeight: 800 }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
