import React, { useState, useEffect } from 'react';
import { Download, Wifi, WifiOff, CheckCircle2, X } from 'lucide-react';
import { syncUserToCloud } from '../utils/onlineLeaderboard.js';
import { getCurrentUser } from '../utils/storage.js';

export default function PWAInstallBanner({ showToast }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));
  const [dismissedInstall, setDismissedInstall] = useState(false);

  useEffect(() => {
    // Check if already in standalone PWA mode
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setIsInstalled(true);
    }

    // Capture install prompt event
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      if (showToast) showToast('🎉 Sobagu AI installed successfully as a native app!', 'xp');
    };

    // Network status listeners
    const handleOnline = () => {
      setIsOnline(true);
      if (showToast) showToast('🌐 Back online! Syncing progress to cloud...', 'info');
      const u = getCurrentUser();
      if (u) syncUserToCloud(u);
    };

    const handleOffline = () => {
      setIsOnline(false);
      if (showToast) showToast('📶 You are currently offline. Offline mode active — lessons & flashcards remain playable!', 'warning');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showToast]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      if (showToast) showToast('🚀 Installing Sobagu AI...', 'info');
    }
    setDeferredPrompt(null);
  };

  return (
    <>
      {/* Offline Status Floating Pill */}
      {!isOnline && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(185, 28, 28, 0.95))',
          color: '#fff',
          padding: '10px 20px',
          borderRadius: '30px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.88rem',
          fontWeight: '600',
          border: '1px solid rgba(255,255,255,0.3)',
          animation: 'pulse 2s infinite'
        }}>
          <WifiOff size={18} />
          <span>Offline Mode Active · Offline cache is preserving your lessons & drills</span>
        </div>
      )}

      {/* PWA Install Banner (Top or Sub-header) */}
      {deferredPrompt && !isInstalled && !dismissedInstall && (
        <div style={{
          background: 'linear-gradient(90deg, rgba(255, 107, 53, 0.2), rgba(255, 163, 102, 0.15))',
          border: '1px solid rgba(255, 107, 53, 0.4)',
          borderRadius: '14px',
          padding: '10px 16px',
          margin: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #ff6b35, #ff8533)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '18px',
              boxShadow: '0 4px 12px rgba(255,107,53,0.35)'
            }}>
              🌸
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#fff' }}>
                Install Sobagu AI App
              </div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.75)' }}>
                Install for offline access, instant loading, and fullscreen study experience!
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleInstallClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'linear-gradient(135deg, #ff6b35, #ff8533)',
                border: 'none',
                color: '#fff',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '0.88rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(255,107,53,0.4)',
                transition: 'transform 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <Download size={16} />
              <span>Install App</span>
            </button>
            <button
              onClick={() => setDismissedInstall(true)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Dismiss"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
