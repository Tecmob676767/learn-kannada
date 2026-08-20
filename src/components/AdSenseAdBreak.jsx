import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, X, Play, Clock, Sparkles, ShieldCheck } from 'lucide-react';

const BREAK_INTERVAL_SECONDS = 5 * 60; // 5 minutes = 300 seconds

const AdSenseAdBreak = ({ onToast }) => {
  const [timeLeft, setTimeLeft] = useState(BREAK_INTERVAL_SECONDS);
  const [showModal, setShowModal] = useState(false);
  const [skipCountdown, setSkipCountdown] = useState(5);
  const [canSkip, setCanSkip] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [adLoaded, setAdLoaded] = useState(false);

  const clientId = import.meta.env.VITE_GOOGLE_ADSENSE_CLIENT_ID || 'ca-pub-7557687021248166';
  const slotId = import.meta.env.VITE_GOOGLE_ADSENSE_SLOT_ID || '1234567890';

  const adRef = useRef(null);

  // Initialize or load saved timer target
  useEffect(() => {
    const savedLastBreak = localStorage.getItem('sobagu_last_ad_break');
    const now = Math.floor(Date.now() / 1000);

    if (savedLastBreak) {
      const elapsed = now - parseInt(savedLastBreak, 10);
      if (elapsed < BREAK_INTERVAL_SECONDS) {
        setTimeLeft(BREAK_INTERVAL_SECONDS - elapsed);
      } else {
        setTimeLeft(0);
      }
    } else {
      localStorage.setItem('sobagu_last_ad_break', now.toString());
    }
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

  // Listen for custom trigger event (e.g. from Settings "Test Ad Break")
  useEffect(() => {
    const handleCustomTrigger = () => {
      triggerAdBreak();
    };

    window.addEventListener('trigger-adsense-break', handleCustomTrigger);
    return () => window.removeEventListener('trigger-adsense-break', handleCustomTrigger);
  }, []);

  // Countdown timer inside the active Ad Modal
  useEffect(() => {
    let interval = null;
    if (showModal && skipCountdown > 0) {
      interval = setInterval(() => {
        setSkipCountdown(prev => {
          if (prev <= 1) {
            setCanSkip(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showModal, skipCountdown]);

  // Push AdSense slot when modal becomes visible
  useEffect(() => {
    if (showModal) {
      const timer = setTimeout(() => {
        try {
          if (window.adsbygoogle && slotId && slotId !== '1234567890') {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            setAdLoaded(true);
          }
        } catch (err) {
          console.warn('AdSense push notice:', err);
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [showModal, slotId]);

  const triggerAdBreak = () => {
    setShowModal(true);
    setSkipCountdown(5);
    setCanSkip(false);
    setAdLoaded(false);
    localStorage.setItem('sobagu_last_ad_break', Math.floor(Date.now() / 1000).toString());
    setTimeLeft(BREAK_INTERVAL_SECONDS);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    onToast && onToast('✨ Resuming Kannada learning session!', 'success');
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <>
      {/* ── Persistent Floating Ad Break Status Pill ───────────────────── */}
      {!showModal && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 9990,
            background: 'rgba(28, 12, 2, 0.88)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 163, 102, 0.3)',
            borderRadius: '30px',
            padding: minimized ? '6px 14px' : '10px 18px',
            color: '#fff',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.85rem',
            fontWeight: 600,
            transition: 'all 0.3s ease',
            cursor: 'pointer',
          }}
          onClick={() => setMinimized(!minimized)}
          title="Click to toggle Google AdSense timer display"
        >
          <Clock size={16} style={{ color: 'var(--sakura-pink, #ffa366)', animation: 'spin 12s linear infinite' }} />
          {!minimized ? (
            <span>
              Ad Break in <strong style={{ color: 'var(--sakura-pink, #ffa366)' }}>{formatTime(timeLeft)}</strong>
            </span>
          ) : (
            <span style={{ color: 'var(--sakura-pink, #ffa366)' }}>{formatTime(timeLeft)}</span>
          )}
        </div>
      )}

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
                  5-Minute Ad Break
                </span>
              </div>

              <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={16} style={{ color: '#43e97b' }} />
                Google AdSense Verified
              </div>
            </div>

            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.4rem', background: 'linear-gradient(90deg, #fff, #ffa366)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Sponsored Ad Break
            </h3>
            <p style={{ fontSize: '0.92rem', color: 'rgba(255, 255, 255, 0.75)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              Sobagu Kannada is 100% free. Ad breaks every 5 minutes keep high-quality lessons, audio, and tools free for everyone!
            </p>

            {/* Google AdSense Container */}
            <div
              style={{
                minHeight: '260px',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px dashed rgba(255, 163, 102, 0.25)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                position: 'relative',
                margin: '1.2rem 0',
                padding: '1rem',
              }}
            >
              {/* Actual Google AdSense Tag */}
              <ins
                ref={adRef}
                className="adsbygoogle"
                style={{ display: 'block', width: '100%', minWidth: '300px', height: '250px' }}
                data-ad-client={clientId}
                data-ad-slot={slotId}
                data-ad-format="auto"
                data-full-width-responsive="true"
              />

              {/* Fallback Display Card (Shows when slotId is placeholder, ad is loading/blocked, or in dev mode) */}
              {(!adLoaded || !slotId || slotId === '1234567890') && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.15), rgba(28, 12, 2, 0.98))',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1.5rem',
                    textAlign: 'center',
                    zIndex: 2,
                  }}
                >
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.4rem' }}>🌸 📢</div>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffa366', marginBottom: '0.4rem' }}>
                    Google AdSense Active
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.85)', maxWidth: '460px', lineHeight: '1.4', marginBottom: '0.8rem' }}>
                    Publisher ID <code style={{ color: '#ffd700', fontSize: '0.8rem', background: 'rgba(0,0,0,0.4)', padding: '2px 6px', borderRadius: '4px' }}>{clientId}</code> is connected.
                  </p>

                  {(!slotId || slotId === '1234567890') ? (
                    <div style={{ background: 'rgba(255, 163, 102, 0.12)', border: '1px solid rgba(255, 163, 102, 0.3)', borderRadius: '12px', padding: '10px 16px', fontSize: '0.78rem', color: '#ffb7c5', maxWidth: '480px' }}>
                      💡 <strong>To show live ads:</strong> Go to <strong>Google AdSense Dashboard &gt; Ads &gt; By ad unit</strong>, copy your <strong>Ad Slot ID</strong> (numeric), and save it in <strong>Settings</strong>!
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.06)', padding: '6px 14px', borderRadius: '12px' }}>
                      Ad Slot ID: {slotId} • AdSense interstitial active
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Skip / Close Footer */}
            <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                {canSkip ? (
                  <span style={{ color: '#43e97b', fontWeight: 600 }}>✓ You can resume learning now</span>
                ) : (
                  <span>Resume button enables in <strong style={{ color: '#ffa366' }}>{skipCountdown}s</strong></span>
                )}
              </div>

              <button
                onClick={handleCloseModal}
                disabled={!canSkip}
                className="btn-primary"
                style={{
                  width: 'auto',
                  padding: '0.75rem 2rem',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  opacity: canSkip ? 1 : 0.45,
                  cursor: canSkip ? 'pointer' : 'not-allowed',
                  boxShadow: canSkip ? '0 4px 20px rgba(255, 107, 53, 0.4)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                {canSkip ? '▶ Resume Learning' : `Please wait (${skipCountdown}s)`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdSenseAdBreak;
