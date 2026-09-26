import React, { useState, useEffect } from 'react';
import { X, Sparkles, Volume2, ShieldCheck, ExternalLink } from 'lucide-react';
import { playSuccess, playClick } from '../utils/soundEffects.js';

const META_SPONSORS = [
  {
    title: 'Kannada Sahitya Sangha Worldwide',
    tagline: 'Connecting 50M+ Kannada speakers globally',
    desc: 'Join global cultural events, literature circles, and language immersion workshops in 28 countries.',
    cta: 'Explore Community',
    url: 'https://sobagukannadaedu.vercel.app/?tab=about',
    color: '#0866ff',
    badge: 'Meta Verified Partner',
  },
  {
    title: 'Namma Karnataka Heritage Tour',
    tagline: 'Discover Hampi, Mysore Palace & Western Ghats',
    desc: 'Learn native cultural terms, royal history, and historic architecture through interactive guided modules.',
    cta: 'View Heritage',
    url: 'https://sobagukannadaedu.vercel.app/?tab=tour',
    color: '#0084ff',
    badge: 'Meta Audience Network',
  },
  {
    title: 'Sobagu Global Ambassador Kit',
    tagline: 'Empowering language preservation worldwide',
    desc: 'Earn exclusive badges, certificate seals, and lead Kannada study groups in your university or workplace.',
    cta: 'Become Ambassador',
    url: 'https://sobagukannadaedu.vercel.app/?tab=promotional',
    color: '#43e97b',
    badge: 'Meta Sponsored Spotlight',
  },
];

const MetaAdBreak = ({ onToast, onReward }) => {
  const [visible, setVisible] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [sponsorIndex, setSponsorIndex] = useState(0);

  const sponsor = META_SPONSORS[sponsorIndex] || META_SPONSORS[0];

  useEffect(() => {
    const handleTrigger = () => {
      setSponsorIndex(Math.floor(Math.random() * META_SPONSORS.length));
      setCountdown(5);
      setVisible(true);
    };

    window.addEventListener('trigger-meta-break', handleTrigger);
    window.addEventListener('trigger-adsense-break', handleTrigger); // Compatibility trigger
    return () => {
      window.removeEventListener('trigger-meta-break', handleTrigger);
      window.removeEventListener('trigger-adsense-break', handleTrigger);
    };
  }, []);

  useEffect(() => {
    if (!visible || countdown <= 0) return;
    const t = setInterval(() => {
      setCountdown(c => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [visible, countdown]);

  const handleClose = () => {
    playClick();
    setVisible(false);
    if (onToast) onToast('✨ Thanks for supporting free Kannada education with Meta Ads!', 'success');
  };

  const handleClaimReward = () => {
    playSuccess();
    setVisible(false);
    if (onReward) onReward(25);
    if (onToast) onToast('🎉 +25 Bonus XP Earned from Meta Sponsored Break!', 'xp');
  };

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(5, 2, 12, 0.85)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      animation: 'fadeIn 0.2s ease-out',
    }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(20, 12, 38, 0.96), rgba(12, 6, 24, 0.98))',
        border: '1.5px solid rgba(8, 102, 255, 0.4)',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '480px',
        padding: '1.5rem',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(8, 102, 255, 0.25)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Top Header Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: 28, height: 28, borderRadius: '8px',
              background: 'linear-gradient(135deg, #0866ff, #00c6ff)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, color: '#fff', fontSize: '0.9rem',
            }}>
              ∞
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0866ff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {sponsor.badge}
              </span>
              <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)' }}>
                Supporting 100% Free Kannada Education
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {countdown > 0 ? (
              <span style={{
                background: 'rgba(255,255,255,0.08)',
                borderRadius: '12px',
                padding: '0.3rem 0.6rem',
                fontSize: '0.72rem',
                color: 'rgba(255,255,255,0.7)',
                fontWeight: 700,
              }}>
                Reward in {countdown}s
              </span>
            ) : (
              <button
                onClick={handleClose}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 30,
                  height: 30,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  cursor: 'pointer',
                }}
                aria-label="Close"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Sponsor Creative Content */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(8,102,255,0.12), rgba(0,198,255,0.06))',
          border: '1px solid rgba(8,102,255,0.25)',
          borderRadius: '16px',
          padding: '1.2rem',
          marginBottom: '1.2rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#00c6ff', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.4rem' }}>
            <Sparkles size={14} /> {sponsor.tagline}
          </div>
          <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
            {sponsor.title}
          </h3>
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>
            {sponsor.desc}
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <a
            href={sponsor.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClaimReward}
            style={{
              flex: 1,
              background: 'linear-gradient(135deg, #0866ff, #0084ff)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              padding: '0.75rem',
              fontWeight: 800,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              textDecoration: 'none',
              boxShadow: '0 4px 15px rgba(8,102,255,0.4)',
              cursor: 'pointer',
            }}
          >
            {sponsor.cta} <ExternalLink size={15} />
          </a>

          {countdown === 0 && (
            <button
              onClick={handleClaimReward}
              style={{
                background: 'linear-gradient(135deg, #43e97b, #38f9d7)',
                color: '#0d381e',
                border: 'none',
                borderRadius: '12px',
                padding: '0.75rem 1rem',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              Claim +25 XP
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetaAdBreak;
