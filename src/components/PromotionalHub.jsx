import React, { useState, useEffect } from 'react';
import {
  Gift,
  Share2,
  Copy,
  Check,
  Sparkles,
  Award,
  Flame,
  MessageCircle,
  Send,
  HelpCircle,
  Zap,
  Shield,
  Star
} from 'lucide-react';
import {
  getCurrentUser,
  claimReferralCode,
  canClaimDailyChest,
  claimDailyLuckyChest,
  getLevelTitle
} from '../utils/storage.js';
import { playSuccess, playFanfare, playLevelUp } from '../utils/soundEffects.js';

export default function PromotionalHub({ onToast, onXP, onRefreshUser, user }) {
  const [activeTab, setActiveTab] = useState('referral'); // 'referral' | 'chest' | 'brag' | 'perks'
  const [friendCodeInput, setFriendCodeInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [canOpenChest, setCanOpenChest] = useState(canClaimDailyChest());
  const [chestOpening, setChestOpening] = useState(false);
  const [chestReward, setChestReward] = useState(null);

  const currentUser = user || getCurrentUser() || {};
  const userCode = currentUser.code || '123456';
  const referralCount = currentUser.referralCount || 0;
  const streak = currentUser.streak || 0;
  const level = currentUser.level || 1;
  const levelTitle = getLevelTitle(level);
  const appUrl = 'https://sobagukannadaedu.vercel.app';
  const referralLink = `${appUrl}/?ref=${userCode}`;

  const shareText = `🌸 ನಮಸ್ಕಾರ! Join me in learning Kannada on Sobagu AI — the #1 free interactive Kannada learning app! Use my invite code *${userCode}* to get +250 Bonus XP instantly: ${referralLink}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    if (onToast) onToast('📋 Referral link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleTwitterShare = () => {
    const text = `Learning Kannada for free with @SobaguAI! 🌸 Master Varnamale, speech audio, and proverbs. Use my code ${userCode} for bonus XP: ${referralLink}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleTelegramShare = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent('Join me on Sobagu AI to learn Kannada!')}`;
    window.open(url, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Learn Kannada on Sobagu AI',
          text: shareText,
          url: referralLink,
        });
      } catch (_e) {}
    } else {
      handleCopyLink();
    }
  };

  const handleClaimFriendCode = () => {
    if (!friendCodeInput.trim()) {
      if (onToast) onToast('⚠️ Please enter a 6-digit code.', 'warning');
      return;
    }
    const res = claimReferralCode(friendCodeInput);
    if (res.success) {
      playFanfare();
      if (onToast) onToast(`🎉 +${res.bonusXP} Bonus XP Claimed! Welcome to Sobagu!`, 'xp');
      setFriendCodeInput('');
      if (onRefreshUser) onRefreshUser();
    } else {
      if (onToast) onToast(`⚠️ ${res.reason}`, 'error');
    }
  };

  const handleOpenChest = () => {
    if (!canOpenChest || chestOpening) return;
    setChestOpening(true);
    setTimeout(() => {
      const res = claimDailyLuckyChest();
      setChestOpening(false);
      if (res.success) {
        setChestReward(res.reward);
        setCanOpenChest(false);
        playFanfare();
        if (onToast) onToast(`🎁 ${res.reward.title}! ${res.reward.desc}`, 'xp');
        if (onRefreshUser) onRefreshUser();
      } else {
        if (onToast) onToast(res.reason, 'warning');
      }
    }, 1200);
  };

  return (
    <div className="learning-screen">
      {/* ── Page Header ──────────────────────────────────────────── */}
      <div className="page-header">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,107,53,0.15)', border: '1px solid rgba(255,107,53,0.3)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: '700', color: 'var(--sakura-pink)', marginBottom: '8px' }}>
          <Sparkles size={16} />
          <span>Sobagu Rewards &amp; Viral Growth Hub</span>
        </div>
        <h2>🎁 Refer Friends &amp; Win Rewards</h2>
        <p>Invite friends to learn Kannada, earn bonus XP, open daily lucky chests &amp; climb the leaderboard!</p>
      </div>

      {/* ── Navigation Tabs ──────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.75rem' }}>
        {[
          { id: 'referral', label: '🎁 Invite & Earn +500 XP', icon: Gift },
          { id: 'chest',    label: '🎰 Daily Lucky Loot',      icon: Zap },
          { id: 'brag',     label: '📣 Social Brag Cards',     icon: Share2 },
          { id: 'perks',    label: '👑 Ambassador Club',       icon: Award },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '12px',
                fontWeight: '700',
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: isActive ? '2px solid var(--sakura-pink)' : '1px solid rgba(255,255,255,0.08)',
                background: isActive ? 'linear-gradient(135deg, rgba(255,107,53,0.25), rgba(255,163,102,0.15))' : 'rgba(255,255,255,0.04)',
                color: isActive ? '#fff' : 'var(--text-secondary)',
                boxShadow: isActive ? '0 4px 16px rgba(255,107,53,0.3)' : 'none',
              }}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Tab 1: Referral Program ──────────────────────────────── */}
      {activeTab === 'referral' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Main Referral Card */}
          <div className="glass-card" style={{ padding: '2rem', border: '1.5px solid rgba(255,107,53,0.35)', background: 'linear-gradient(135deg, rgba(255,107,53,0.1), rgba(255,163,102,0.03))' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '800', color: 'var(--sakura-pink)' }}>
                  Viral Growth Loop
                </span>
                <h3 style={{ fontSize: '1.6rem', fontWeight: '900', margin: '6px 0 10px', color: '#fff' }}>
                  Give 250 XP, Get 500 XP! 🚀
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 1.5rem 0' }}>
                  Share your unique referral link with family, classmates, or colleagues. When they join, they get <strong style={{ color: '#ffd700' }}>+250 Bonus XP</strong> and you receive <strong style={{ color: '#4ade80' }}>+500 XP</strong> directly into your account!
                </p>

                {/* Referral Code Display */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0,0,0,0.35)', padding: '10px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', maxWidth: '420px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Your 6-Digit Referral Code</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#ffd700', letterSpacing: '2px' }}>{userCode}</div>
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className="btn-primary"
                    style={{ width: 'auto', padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                </div>
              </div>

              {/* Share Actions Grid */}
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '800', marginBottom: '1rem', color: '#fff' }}>
                  1-Click Instant Share
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button
                    onClick={handleWhatsAppShare}
                    style={{
                      background: 'linear-gradient(135deg, #25D366, #128C7E)',
                      border: 'none',
                      color: '#fff',
                      padding: '12px 18px',
                      borderRadius: '10px',
                      fontWeight: '700',
                      fontSize: '0.92rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      boxShadow: '0 4px 14px rgba(37,211,102,0.3)',
                    }}
                  >
                    <MessageCircle size={18} />
                    <span>Share to WhatsApp (Friends &amp; Groups)</span>
                  </button>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <button
                      onClick={handleTwitterShare}
                      style={{
                        background: '#000',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: '#fff',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        fontWeight: '700',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      <span style={{ fontWeight: '900', fontSize: '1rem' }}>𝕏</span>
                      <span>Post on X</span>
                    </button>
                    <button
                      onClick={handleTelegramShare}
                      style={{
                        background: '#0088cc',
                        border: 'none',
                        color: '#fff',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        fontWeight: '700',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      <Send size={16} />
                      <span>Telegram</span>
                    </button>
                  </div>

                  <button
                    onClick={handleNativeShare}
                    className="glass-btn"
                    style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <Share2 size={16} />
                    <span>More Share Options</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Referral Stats & Claim Friend Code Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {/* Referral Stats */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--sakura-pink)' }}>
                <Award size={18} />
                <span>Your Referral Impact</span>
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '1rem', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#ffd700' }}>{referralCount}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Friends Joined</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '1rem', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#4ade80' }}>{referralCount * 500}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>XP Earned</div>
                </div>
              </div>
            </div>

            {/* Enter Friend Code */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '0.5rem', color: '#4facfe' }}>
                Have a Friend's Invite Code?
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Enter the 6-digit code they shared to claim your <strong style={{ color: '#fff' }}>+250 Welcome XP</strong> bonus!
              </p>

              {currentUser.referredBy ? (
                <div style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', color: '#4ade80', fontWeight: '600' }}>
                  ✓ You claimed referral code: {currentUser.referredBy} (+250 XP awarded)
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    value={friendCodeInput}
                    onChange={(e) => setFriendCodeInput(e.target.value)}
                    className="form-input"
                    style={{ flex: 1, textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '700' }}
                  />
                  <button
                    onClick={handleClaimFriendCode}
                    className="btn-primary"
                    style={{ width: 'auto', padding: '0 18px', fontSize: '0.88rem' }}
                  >
                    Claim
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 2: Daily Lucky Loot Chest ────────────────────────── */}
      {activeTab === 'chest' && (
        <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center', maxWidth: '640px', margin: '0 auto' }}>
          <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '800', color: '#ffd700' }}>
            Daily Login Reward
          </span>
          <h3 style={{ fontSize: '1.6rem', fontWeight: '900', margin: '6px 0 12px' }}>
            🎰 Mystery Lucky Chest
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Open your lucky chest every 24 hours to win XP boosters, streak freezes, or the 500 XP jackpot!
          </p>

          {/* Chest Graphic */}
          <div
            onClick={canOpenChest ? handleOpenChest : undefined}
            style={{
              width: '140px',
              height: '140px',
              margin: '0 auto 1.5rem',
              borderRadius: '24px',
              background: canOpenChest
                ? 'linear-gradient(135deg, #ffd700, #ff6b35)'
                : 'rgba(255,255,255,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '64px',
              cursor: canOpenChest ? 'pointer' : 'default',
              boxShadow: canOpenChest ? '0 10px 30px rgba(255,107,53,0.5)' : 'none',
              transform: chestOpening ? 'scale(1.15) rotate(5deg)' : 'scale(1)',
              transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            }}
          >
            {chestOpening ? '✨' : canOpenChest ? '🎁' : '🔒'}
          </div>

          {chestReward && (
            <div style={{ background: 'rgba(255,215,0,0.12)', border: '1.5px solid rgba(255,215,0,0.4)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', animation: 'scaleUp 0.3s ease' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#ffd700' }}>{chestReward.title}</div>
              <div style={{ fontSize: '0.85rem', color: '#fff', marginTop: '4px' }}>{chestReward.desc}</div>
            </div>
          )}

          <button
            onClick={handleOpenChest}
            disabled={!canOpenChest || chestOpening}
            className="btn-primary"
            style={{
              padding: '12px 32px',
              fontSize: '1rem',
              fontWeight: '800',
              opacity: canOpenChest ? 1 : 0.6,
              cursor: canOpenChest ? 'pointer' : 'not-allowed',
            }}
          >
            {chestOpening ? 'Opening Chest...' : canOpenChest ? 'Open Lucky Chest Now! 🌟' : 'Claimed for Today! (Come back tomorrow)'}
          </button>
        </div>
      )}

      {/* ── Tab 3: Social Brag Cards ─────────────────────────────── */}
      {activeTab === 'brag' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {/* Streak Card */}
          <div className="glass-card" style={{ padding: '1.5rem', border: '1px solid rgba(251,146,60,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
              <Flame size={24} color="#fb923c" />
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '800' }}>Day Streak Brag Card</h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Share your continuous learning habit</span>
              </div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.4)', padding: '1rem', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.88rem', color: '#fff' }}>
              🔥 I'm on a <strong>{streak}-day Kannada learning streak</strong> on Sobagu AI! Master Kannada with me: {referralLink}
            </div>
            <button
              onClick={() => {
                const text = `🔥 I'm on a ${streak}-day Kannada learning streak on Sobagu AI! Can you beat me? Join here: ${referralLink}`;
                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
              }}
              style={{ width: '100%', background: '#25D366', border: 'none', color: '#fff', padding: '10px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <MessageCircle size={16} />
              <span>Share Streak to WhatsApp</span>
            </button>
          </div>

          {/* Level Card */}
          <div className="glass-card" style={{ padding: '1.5rem', border: '1px solid rgba(96,165,250,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
              <Star size={24} color="#60a5fa" />
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '800' }}>Level Achievement Card</h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Showcase your fluency rank</span>
              </div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.4)', padding: '1rem', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.88rem', color: '#fff' }}>
              🎓 I just reached <strong>Level {level} ({levelTitle})</strong> in Kannada on Sobagu AI! Start learning free: {referralLink}
            </div>
            <button
              onClick={() => {
                const text = `🎓 I just reached Level ${level} (${levelTitle}) in Kannada on Sobagu AI! 🌸 Start learning free: ${referralLink}`;
                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
              }}
              style={{ width: '100%', background: '#25D366', border: 'none', color: '#fff', padding: '10px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <MessageCircle size={16} />
              <span>Share Level to WhatsApp</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Tab 4: Ambassador Perks ──────────────────────────────── */}
      {activeTab === 'perks' && (
        <div className="glass-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #ffd700, #ff6b35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
              👑
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '900', color: '#ffd700' }}>
                Sobagu Ambassador Club
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Spread the love for Kannada &amp; unlock exclusive VIP perks.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🌟</div>
              <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#fff' }}>Ambassador Badge</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Invite 1 friend to unlock the exclusive Ambassador badge on your profile.
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⚡</div>
              <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#ffd700' }}>500 XP per Referral</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                No limit on rewards! Invite 10 friends to earn 5,000 XP instantly.
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🛡️</div>
              <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#4facfe' }}>Free Streak Freezes</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Receive complimentary streak freeze shields to protect your daily progress.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
