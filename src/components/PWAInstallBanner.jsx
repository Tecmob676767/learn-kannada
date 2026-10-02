import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Download, WifiOff, X, Sparkles, Smartphone, Monitor, Apple, CheckCircle2, ChevronRight } from 'lucide-react';
import { syncUserToCloud } from '../utils/onlineLeaderboard.js';
import { getCurrentUser } from '../utils/storage.js';

const UniversalAppInstaller = lazy(() => import('./UniversalAppInstaller.jsx'));

export default function PWAInstallBanner({ showToast, onOpenInstaller }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));
  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem('sobagu_app_banner_dismissed') === 'true';
    } catch {
      return false;
    }
  });
  const [platform, setPlatform] = useState('android');
  const [showInstallerModal, setShowInstallerModal] = useState(false);

  useEffect(() => {
    // 1. Detect if running inside standalone PWA / Native webview
    if (typeof window !== 'undefined') {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                           window.navigator.standalone === true ||
                           document.referrer.includes('android-app://');
      if (isStandalone) {
        setIsInstalled(true);
      }

      // 2. Detect OS accurately
      const ua = navigator.userAgent.toLowerCase();
      const isIPad = /ipad/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      if (/android/.test(ua)) setPlatform('android');
      else if (isIPad) setPlatform('ipados');
      else if (/iphone|ipod/.test(ua)) setPlatform('ios');
      else if (/win/.test(ua)) setPlatform('windows');
      else if (/mac/.test(ua)) setPlatform('mac');
      else if (/linux/.test(ua)) setPlatform('linux');
    }

    // 3. Listen for browser install prompt
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      if (showToast) showToast('🎉 Sobagu installed successfully as a native app!', 'success');
    };

    // 4. Network status listeners
    const handleOnline = () => {
      setIsOnline(true);
      if (showToast) showToast('🌐 Back online! Syncing progress...', 'info');
      const u = getCurrentUser();
      if (u) syncUserToCloud(u);
    };

    const handleOffline = () => {
      setIsOnline(false);
      if (showToast) showToast('📶 You are offline. Lessons & flashcards remain playable!', 'warning');
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

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem('sobagu_app_banner_dismissed', 'true');
    } catch {}
  };

  const handlePrimaryAction = async () => {
    // If Android and user wants direct APK or prompt
    if (platform === 'android') {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted' && showToast) {
          showToast('🚀 Installing Sobagu App...', 'info');
        }
        setDeferredPrompt(null);
      } else {
        // Direct download APK or open modal
        setShowInstallerModal(true);
      }
      return;
    }

    // If browser prompt is available on Windows/Chrome/Mac/Linux
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted' && showToast) {
        showToast('🚀 Installing Sobagu Desktop App...', 'info');
      }
      setDeferredPrompt(null);
      return;
    }

    // Otherwise, open the tailored instructions modal
    setShowInstallerModal(true);
  };

  const getPlatformLabel = () => {
    switch (platform) {
      case 'android': return 'Android APK';
      case 'ios':     return 'iPhone (iOS)';
      case 'ipados':  return 'iPad (iPadOS)';
      case 'windows': return 'Windows 10/11';
      case 'mac':     return 'macOS';
      case 'linux':   return 'Linux';
      default:        return 'Mobile & PC';
    }
  };

  const getPlatformIcon = () => {
    switch (platform) {
      case 'android': return '🤖';
      case 'ios':     return '🍎';
      case 'ipados':  return '📱';
      case 'windows': return '🪟';
      case 'mac':     return '🍏';
      case 'linux':   return '🐧';
      default:        return '📲';
    }
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
          animation: 'pulse 2s infinite',
        }}>
          <WifiOff size={18} />
          <span>Offline Mode Active · Lessons, audio & drills remain fully playable offline</span>
        </div>
      )}

      {/* Prominent Universal Web Entry Banner */}
      {!isInstalled && !dismissed && (
        <aside
          aria-label="Download Sobagu App Banner"
          style={{
            position: 'relative',
            zIndex: 950,
            background: 'linear-gradient(90deg, #b91c1c 0%, #d90429 25%, #ff6b35 70%, #f97316 100%)',
            color: '#fff',
            borderBottom: '2px solid #ffd700',
            boxShadow: '0 4px 24px rgba(217, 4, 41, 0.45)',
            padding: '10px 16px',
            animation: 'fadeIn 0.3s ease-in-out',
          }}
        >
          <div style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
          }}>
            {/* Left: Branding & Message */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 320px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: '#fff',
                color: '#d90429',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                fontWeight: 900,
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
              }}>
                ಸೊ
              </div>
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: 900,
                  fontSize: '0.98rem',
                  letterSpacing: '-0.2px',
                  textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                }}>
                  <span>Download Sobagu App for a Better Experience!</span>
                  <span style={{
                    background: '#ffd700',
                    color: '#000',
                    fontSize: '0.68rem',
                    fontWeight: 900,
                    padding: '2px 8px',
                    borderRadius: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    Android · iOS · iPadOS · PC
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.92)', lineHeight: 1.3, marginTop: '2px' }}>
                  Learn on the web or install the native app for <strong>offline audio, zero lag, and full-screen Kannada learning</strong>.
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {/* Primary Detected OS Action */}
              <button
                onClick={handlePrimaryAction}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#ffffff',
                  color: '#b91c1c',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '24px',
                  fontWeight: 900,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                <span>{getPlatformIcon()}</span>
                <span>Get for {getPlatformLabel()}</span>
                <ChevronRight size={15} />
              </button>

              {/* View All Platforms Modal Button */}
              <button
                onClick={() => setShowInstallerModal(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: 'rgba(0, 0, 0, 0.25)',
                  color: '#fff',
                  border: '1px solid rgba(255, 255, 255, 0.35)',
                  padding: '8px 14px',
                  borderRadius: '24px',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0, 0, 0, 0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0, 0, 0, 0.25)'; }}
              >
                <span>🌐 All 6 Platforms</span>
              </button>

              {/* Dismiss Button */}
              <button
                onClick={handleDismiss}
                title="Dismiss banner"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.75)',
                  cursor: 'pointer',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  transition: 'color 0.15s, background 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(0,0,0,0.2)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255, 255, 255, 0.75)'; e.currentTarget.style.background = 'none'; }}
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Universal Installer Modal Popup */}
      {showInstallerModal && (
        <div
          onClick={() => setShowInstallerModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '1rem',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '720px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              borderRadius: '24px',
            }}
          >
            <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: '#ff6b35', fontWeight: 800 }}>🌸 Loading App Installer...</div>}>
              <UniversalAppInstaller
                onClose={() => setShowInstallerModal(false)}
                onToast={showToast}
              />
            </Suspense>
          </div>
        </div>
      )}
    </>
  );
}
