import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ShieldCheck } from 'lucide-react';

const BREAK_INTERVAL_SECONDS = 5 * 60; // 5 minutes = 300 seconds

const AdSenseAdBreak = ({ onToast }) => {
  const [timeLeft, setTimeLeft] = useState(BREAK_INTERVAL_SECONDS);
  const [showModal, setShowModal] = useState(false);

  const clientId = import.meta.env.VITE_GOOGLE_ADSENSE_CLIENT_ID || 'ca-pub-7557687021248166';
  const slotId = import.meta.env.VITE_GOOGLE_ADSENSE_SLOT_ID || '7268606143';

  const adRef = useRef(null);

  // Initialize timer on session start: guarantee full 5-minute break interval
  useEffect(() => {
    const now = Math.floor(Date.now() / 1000);
    localStorage.setItem('sobagu_last_ad_break', now.toString());
    setTimeLeft(BREAK_INTERVAL_SECONDS);
  }, []);

  // Main 5-minute timer countdown loop
  useEffect(() => {
    if (showModal) return; // Freeze main timer while modal is open

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          triggerAdBreak();
          return BREAK_INTERVAL_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showModal]);

  // Listen for custom trigger event (e.g. manual trigger)
  useEffect(() => {
    const handleCustomTrigger = () => {
      triggerAdBreak();
    };

    window.addEventListener('trigger-adsense-break', handleCustomTrigger);
    return () => window.removeEventListener('trigger-adsense-break', handleCustomTrigger);
  }, []);

  // Push AdSense slot when modal becomes visible
  useEffect(() => {
    if (showModal) {
      const timer = setTimeout(() => {
        try {
          if (window.adsbygoogle) {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
          }
        } catch (err) {
          console.warn('AdSense push notice:', err);
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [showModal]);

  const triggerAdBreak = () => {
    setShowModal(true);
    localStorage.setItem('sobagu_last_ad_break', Math.floor(Date.now() / 1000).toString());
    setTimeLeft(BREAK_INTERVAL_SECONDS);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    onToast && onToast('✨ Resuming Kannada learning session!', 'success');
  };

  return (
    <>
      {/* ── 5-Minute Interstitial Ad Break Modal ──────────────────────── */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            backgroundColor: 'rgba(10, 4, 1, 0.88)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            animation: 'fadeIn 0.3s ease-out',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '680px',
              background: 'linear-gradient(145deg, rgba(38, 18, 7, 0.95), rgba(20, 8, 2, 0.98))',
              border: '1px solid rgba(255, 163, 102, 0.4)',
              borderRadius: '24px',
              padding: '2.2rem 2rem',
              boxShadow: '0 24px 64px rgba(0, 0, 0, 0.8), 0 0 40px rgba(255, 107, 53, 0.15)',
              textAlign: 'center',
              color: '#fff',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 107, 53, 0.15)', padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(255, 107, 53, 0.3)' }}>
                <Sparkles size={16} style={{ color: '#ff6b35' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.5px', color: '#ffa366', textTransform: 'uppercase' }}>
                  Ad Break
                </span>
              </div>

              <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={16} style={{ color: '#43e97b' }} />
                Google AdSense
              </div>
            </div>

            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.4rem', background: 'linear-gradient(90deg, #fff, #ffa366)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Sponsored Break
            </h3>
            <p style={{ fontSize: '0.92rem', color: 'rgba(255, 255, 255, 0.75)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              Ad breaks every 5 minutes keep Sobagu Kannada 100% free for everyone!
            </p>

            {/* Google AdSense Container (Auto-Fitting) */}
            <div
              style={{
                width: '100%',
                minHeight: '280px',
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                margin: '1.2rem 0',
                padding: '0.5rem',
              }}
            >
              <ins
                ref={adRef}
                className="adsbygoogle"
                style={{ display: 'block', width: '100%', minHeight: '280px' }}
                data-ad-client={clientId}
                data-ad-slot={slotId}
                data-ad-format="auto"
                data-full-width-responsive="true"
              />
            </div>

            {/* Close / Resume Footer */}
            <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ fontSize: '0.85rem', color: '#43e97b', fontWeight: 600 }}>
                ✓ You can resume learning anytime
              </div>

              <button
                onClick={handleCloseModal}
                className="btn-primary"
                style={{
                  width: 'auto',
                  padding: '0.75rem 2rem',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(255, 107, 53, 0.4)',
                  transition: 'all 0.2s ease',
                }}
              >
                ▶ Resume Learning
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdSenseAdBreak;
