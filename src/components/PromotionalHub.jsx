import React, { useState } from 'react';
import {
  Gift, Share2, Copy, Check, Sparkles, Award, Flame,
  Globe, Send, MessageSquare, Mail, Code, ExternalLink,
  ShieldCheck, CheckCircle, Zap
} from 'lucide-react';
import {
  getCurrentUser, claimReferralCode, canClaimDailyChest,
  claimDailyLuckyChest, getLevelTitle
} from '../utils/storage.js';
import { playSuccess, playFanfare } from '../utils/soundEffects.js';

const PROMO_LANGUAGES = [
  { id: 'en', label: 'English', text: '🌸 Learn Kannada easily with Sobagu AI! Interactive lessons, speech pronunciation, grammar, and multiplayer games. Join now with code:' },
  { id: 'kn', label: 'ಕನ್ನಡ', text: '🌸 ಸೊಬಗು ಆ್ಯಪ್ ಮೂಲಕ ಸುಲಭವಾಗಿ ಕನ್ನಡ ಕಲಿಯಿರಿ! ಧ್ವನಿ ತರಬೇತಿ, ವ್ಯಾಕರಣ ಮತ್ತು ಆಟಗಳು. ನನ್ನ ಕೋಡ್ ಬಳಸಿ:' },
  { id: 'hi', label: 'हिन्दी', text: '🌸 सोबगु ऐप के साथ आसानी से कन्नड़ सीखें! इंटरैक्टिव पाठ, उच्चारण और गेम्स। मेरे कोड के साथ जुड़ें:' },
  { id: 'te', label: 'తెలుగు', text: '🌸 సొబగు యాప్‌తో సులభంగా కన్నడ నేర్చుకోండి! ఇంటరాక్టివ్ పాఠాలు మరియు గేమ్‌లు. నా కోಡ್ ఉపయోగించండి:' },
  { id: 'ta', label: 'தமிழ்', text: '🌸 சொபகு ஆப் மூலம் எளிதாக கன்னடம் கற்றுக்கொள்ளுங்கள்! ஊடாடும் பாடங்கள் மற்றும் விளையாட்டுகள். என் குறியீட்டைப் பயன்படுத்துங்கள்:' },
];

export default function PromotionalHub({ onToast, onXP, onRefreshUser, user }) {
  const [activeTab, setActiveTab]         = useState('worldwide'); // 'worldwide' | 'referral' | 'chest' | 'embed'
  const [friendCodeInput, setFriendCodeInput] = useState('');
  const [copied, setCopied]               = useState(false);
  const [canOpenChest, setCanOpenChest]   = useState(canClaimDailyChest());
  const [chestOpening, setChestOpening]   = useState(false);
  const [chestReward, setChestReward]     = useState(null);
  const [selectedLang, setSelectedLang]   = useState(PROMO_LANGUAGES[0]);

  const currentUser = user || getCurrentUser() || {};
  const userCode = currentUser.code || '102450';
  const referralCount = currentUser.referralCount || 0;
  const streak = currentUser.streak || 0;
  const level = currentUser.level || 1;
  const levelTitle = getLevelTitle(level);
  const appUrl = 'https://sobagukannadaedu.vercel.app';
  const referralLink = `${appUrl}/?ref=${userCode}`;

  const shareText = `${selectedLang.text} *${userCode}* 👉 ${referralLink}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    if (onToast) onToast('Referral link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(shareText);
    if (onToast) onToast('Worldwide promotion message copied!', 'success');
  };

  const handleShare = (platform) => {
    let url = '';
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(referralLink);

    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodedText}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'reddit':
        url = `https://reddit.com/submit?url=${encodedUrl}&title=${encodeURIComponent('Learn Kannada Online with Sobagu AI')}`;
        break;
      case 'telegram':
        url = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
        break;
      case 'email':
        url = `mailto:?subject=${encodeURIComponent('Join me in learning Kannada on Sobagu!')}&body=${encodedText}`;
        break;
      default:
        if (navigator.share) {
          navigator.share({ title: 'Learn Kannada on Sobagu', text: shareText, url: referralLink }).catch(() => {});
          return;
        }
        handleCopyMessage();
        return;
    }

    if (url) window.open(url, '_blank');
  };

  const handleClaimReferral = () => {
    const code = friendCodeInput.trim();
    if (!code) {
      if (onToast) onToast('Please enter a friend code', 'error');
      return;
    }
    const result = claimReferralCode(code);
    if (result.success) {
      if (onXP) onXP(250);
      playFanfare();
      if (onToast) onToast(`🎉 ${result.message}`, 'success');
      setFriendCodeInput('');
      if (onRefreshUser) onRefreshUser();
    } else {
      if (onToast) onToast(result.message, 'error');
    }
  };

  const handleOpenChest = () => {
    if (!canOpenChest || chestOpening) return;
    setChestOpening(true);
    setTimeout(() => {
      const result = claimDailyLuckyChest();
      setChestOpening(false);
      if (result.success) {
        setChestReward(result.reward);
        setCanOpenChest(false);
        playSuccess();
        if (result.reward.type === 'xp' && onXP) onXP(result.reward.amount);
        if (onToast) onToast(result.reward.title, 'success');
        if (onRefreshUser) onRefreshUser();
      }
    }, 1200);
  };

  const embedCode = `<a href="https://sobagukannadaedu.vercel.app?ref=${userCode}" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/Learn%20Kannada-Sobagu%20AI-orange?style=for-the-badge&logo=google-translate" alt="Learn Kannada with Sobagu" /></a>`;

  return (
    <div className="learning-screen" style={{ maxWidth: 840, margin: '0 auto', padding: '1rem' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255,107,53,0.25), rgba(255,163,102,0.1))',
        border: '1px solid var(--glass-border)',
        borderRadius: '24px',
        padding: '1.8rem 2rem',
        marginBottom: '1.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{
            background: 'linear-gradient(135deg,#ff6b35,#ffa366)',
            borderRadius: '18px', padding: '0.9rem', display: 'flex',
            boxShadow: '0 8px 24px rgba(255,107,53,0.4)',
          }}>
            <Globe size={32} color="#fff" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900, color: '#fff' }}>
              Promote Sobagu Worldwide 🌍
            </h1>
            <p style={{ margin: '0.3rem 0 0', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', fontFamily: 'Noto Sans Kannada,sans-serif' }}>
              ಜಗತ್ತಿನಾದ್ಯಂತ ಕನ್ನಡ ಕಲಿಕೆಯನ್ನು ಹಂಚಿಕೊಳ್ಳಿ · Help millions learn Kannada for free!
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.4rem', flexWrap: 'wrap' }}>
        {[
          { id: 'worldwide', label: '🌍 Worldwide Outreach', icon: Globe },
          { id: 'referral', label: '🎁 Referral Rewards', icon: Gift },
          { id: 'chest', label: '📦 Daily Mystery Chest', icon: Sparkles },
          { id: 'embed', label: '💻 Web Badges', icon: Code },
        ].map(tab => {
          const TabIcon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1, minWidth: '160px',
                background: active ? 'linear-gradient(135deg,#ff6b35,#ffa366)' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${active ? 'transparent' : 'var(--glass-border)'}`,
                borderRadius: '12px', padding: '0.75rem 1rem', color: '#fff',
                fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                transition: 'all 0.2s',
              }}
            >
              <TabIcon size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: Worldwide Outreach */}
      {activeTab === 'worldwide' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {/* Language Selector */}
          <div className="glass-card" style={{ padding: '1.4rem' }}>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Globe size={16} color="var(--sakura-pink)" /> Select Promotion Language
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              {PROMO_LANGUAGES.map(lang => (
                <button
                  key={lang.id}
                  onClick={() => setSelectedLang(lang)}
                  style={{
                    background: selectedLang.id === lang.id ? 'linear-gradient(135deg,#ff6b35,#ffa366)' : 'rgba(255,255,255,0.08)',
                    border: 'none', borderRadius: '10px', padding: '0.45rem 1rem',
                    color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.82rem',
                  }}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            {/* Generated Share Preview */}
            <div style={{
              background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)',
              borderRadius: '12px', padding: '1rem', color: '#fff', fontSize: '0.9rem',
              lineHeight: 1.5, marginBottom: '1rem',
            }}>
              {shareText}
            </div>

            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              <button
                onClick={handleCopyMessage}
                style={{
                  background: 'linear-gradient(135deg,#4facfe,#00f2fe)', border: 'none',
                  borderRadius: '10px', padding: '0.6rem 1.2rem', color: '#fff',
                  fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem',
                }}
              >
                <Copy size={16} /> Copy Message
              </button>
              <button
                onClick={handleCopyLink}
                style={{
                  background: 'rgba(255,255,255,0.12)', border: '1px solid var(--glass-border)',
                  borderRadius: '10px', padding: '0.6rem 1.2rem', color: '#fff',
                  fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem',
                }}
              >
                {copied ? <Check size={16} /> : <Share2 size={16} />} {copied ? 'Link Copied!' : 'Copy Direct Link'}
              </button>
            </div>
          </div>

          {/* 1-Click Global Channel Broadcast */}
          <div className="glass-card" style={{ padding: '1.4rem' }}>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem' }}>
              Share to Global Platforms & Communities
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.8rem' }}>
              {[
                { id: 'telegram', label: 'Telegram', icon: Send, bg: '#0088cc' },
                { id: 'twitter', label: 'X / Twitter', icon: Share2, bg: '#000000' },
                { id: 'linkedin', label: 'LinkedIn', icon: Globe, bg: '#0077b5' },
                { id: 'facebook', label: 'Facebook', icon: Share2, bg: '#1877f2' },
                { id: 'reddit', label: 'Reddit', icon: MessageSquare, bg: '#ff4500' },
                { id: 'email', label: 'Email', icon: Mail, bg: '#ea4335' },
              ].map(p => {
                const Icon = p.icon;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleShare(p.id)}
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: '12px', padding: '0.85rem 0.5rem',
                      color: '#fff', fontWeight: 700, cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem',
                      transition: 'transform 0.15s, background 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                  >
                    <div style={{ background: p.bg, width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={18} color="#fff" />
                    </div>
                    <span style={{ fontSize: '0.8rem' }}>{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Worldwide Communities Kit */}
          <div className="glass-card" style={{ padding: '1.4rem', background: 'linear-gradient(135deg, rgba(67,233,123,0.1), rgba(56,249,215,0.05))' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#43e97b', fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.4rem' }}>
              <ShieldCheck size={18} /> Global Kannada Ambassador Kit
            </div>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem', lineHeight: 1.5, margin: '0 0 0.8rem' }}>
              Promote Sobagu in your local Kannada Sangha, college language club, tech office, or diaspora community worldwide (USA, UK, Canada, UAE, Singapore, Australia, Germany).
            </p>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              {['#LearnKannada', '#SobaguAI', '#KannadaWorldwide', '#NammaKannada', '#LearnKannadaOnline'].map(tag => (
                <span key={tag} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '20px', padding: '0.2rem 0.7rem', color: '#43e97b', fontSize: '0.75rem', fontWeight: 700 }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Referral Rewards */}
      {activeTab === 'referral' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div className="glass-card" style={{ padding: '1.4rem' }}>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', marginBottom: '0.6rem' }}>
              Your Unique Referral Link
            </div>
            <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1rem' }}>
              <input
                readOnly
                value={referralLink}
                style={{
                  flex: 1, background: 'rgba(255,255,255,0.08)', border: '1px solid var(--glass-border)',
                  borderRadius: '10px', padding: '0.7rem 1rem', color: '#fff', fontSize: '0.9rem', outline: 'none',
                }}
              />
              <button
                onClick={handleCopyLink}
                style={{
                  background: 'linear-gradient(135deg,#ff6b35,#ffa366)', border: 'none',
                  borderRadius: '10px', padding: '0 1.2rem', color: '#fff', fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem',
                }}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.8rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '0.8rem', textAlign: 'center' }}>
                <div style={{ color: 'var(--sakura-pink)', fontSize: '1.6rem', fontWeight: 900 }}>{referralCount}</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>Friends Joined</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '0.8rem', textAlign: 'center' }}>
                <div style={{ color: '#43e97b', fontSize: '1.6rem', fontWeight: 900 }}>{(referralCount * 250).toLocaleString()}</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>Bonus XP Earned</div>
              </div>
            </div>
          </div>

          {/* Enter Friend Code */}
          <div className="glass-card" style={{ padding: '1.4rem' }}>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.5rem' }}>
              Have a Friend's Referral Code?
            </div>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <input
                value={friendCodeInput}
                onChange={e => setFriendCodeInput(e.target.value)}
                placeholder="Enter 6-digit friend code..."
                maxLength={6}
                style={{
                  flex: 1, background: 'rgba(255,255,255,0.08)', border: '1px solid var(--glass-border)',
                  borderRadius: '10px', padding: '0.7rem 1rem', color: '#fff', fontSize: '0.9rem', outline: 'none',
                }}
              />
              <button
                onClick={handleClaimReferral}
                style={{
                  background: 'linear-gradient(135deg,#4facfe,#00f2fe)', border: 'none',
                  borderRadius: '10px', padding: '0 1.2rem', color: '#fff', fontWeight: 700, cursor: 'pointer',
                  fontSize: '0.85rem',
                }}
              >
                Claim +250 XP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Mystery Chest */}
      {activeTab === 'chest' && (
        <div className="glass-card" style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '0.8rem', animation: chestOpening ? 'pulse 0.4s infinite' : 'none' }}>
            {chestReward ? '🎁' : canOpenChest ? '📦' : '⏳'}
          </div>
          <h2 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 800, margin: '0 0 0.4rem' }}>
            {chestReward ? chestReward.title : canOpenChest ? 'Daily Lucky Chest Ready!' : 'Next Chest Tomorrow'}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.85rem', maxWidth: 400, margin: '0 auto 1.4rem' }}>
            {chestReward
              ? chestReward.desc
              : canOpenChest
              ? 'Open your daily lucky chest to win XP bonuses, streak freezes, and rare emblems!'
              : 'You have already claimed today\'s chest. Come back tomorrow for more rewards!'}
          </p>
          {canOpenChest && (
            <button
              onClick={handleOpenChest}
              disabled={chestOpening}
              style={{
                background: 'linear-gradient(135deg,#ff6b35,#ffa366)', border: 'none',
                borderRadius: '14px', padding: '0.85rem 2.2rem', color: '#fff',
                fontWeight: 800, fontSize: '1rem', cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(255,107,53,0.4)',
              }}
            >
              {chestOpening ? 'Unlocking Chest...' : 'Open Lucky Chest! 🎁'}
            </button>
          )}
        </div>
      )}

      {/* TAB 4: Embeddable Web Badges */}
      {activeTab === 'embed' && (
        <div className="glass-card" style={{ padding: '1.4rem' }}>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', marginBottom: '0.4rem' }}>
            Embed Sobagu on Your Blog, Website, or GitHub
          </div>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.82rem', marginBottom: '1rem' }}>
            Add a live learning badge to your personal portfolio, GitHub README, or Kannada blog.
          </p>

          <div style={{ marginBottom: '1.2rem' }}>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', marginBottom: '0.4rem' }}>Badge Preview:</div>
            <div style={{ display: 'inline-block', background: 'rgba(0,0,0,0.3)', padding: '0.5rem 1rem', borderRadius: '8px' }}>
              <img src="https://img.shields.io/badge/Learn%20Kannada-Sobagu%20AI-orange?style=for-the-badge&logo=google-translate" alt="Learn Kannada Badge" />
            </div>
          </div>

          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', marginBottom: '0.4rem' }}>HTML Embed Code:</div>
          <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid var(--glass-border)', borderRadius: '10px', padding: '0.8rem', color: '#43e97b', fontFamily: 'monospace', fontSize: '0.78rem', wordBreak: 'break-all', marginBottom: '1rem' }}>
            {embedCode}
          </div>

          <button
            onClick={() => {
              navigator.clipboard.writeText(embedCode);
              if (onToast) onToast('Embed code copied to clipboard!', 'success');
            }}
            style={{
              background: 'linear-gradient(135deg,#4facfe,#00f2fe)', border: 'none',
              borderRadius: '10px', padding: '0.6rem 1.2rem', color: '#fff', fontWeight: 700,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem',
            }}
          >
            <Copy size={15} /> Copy HTML Badge Code
          </button>
        </div>
      )}
    </div>
  );
}
