import React, { useState, useEffect } from 'react';
import {
  Smartphone, Monitor, Apple, Download, CheckCircle,
  Sparkles, ExternalLink, ShieldCheck, ChevronRight, X, Globe, Tablet
} from 'lucide-react';
import { playClick, playSuccess } from '../utils/soundEffects.js';

export default function UniversalAppInstaller({ onToast, onClose }) {
  const [platform, setPlatform] = useState('android'); // 'android' | 'ios' | 'ipados' | 'windows' | 'linux' | 'mac' | 'web'
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    // Detect OS automatically
    const ua = navigator.userAgent.toLowerCase();
    const isIPad = /ipad/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (/android/.test(ua)) setPlatform('android');
    else if (isIPad) setPlatform('ipados');
    else if (/iphone|ipod/.test(ua)) setPlatform('ios');
    else if (/win/.test(ua)) setPlatform('windows');
    else if (/linux/.test(ua)) setPlatform('linux');
    else if (/mac/.test(ua)) setPlatform('mac');

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleDownloadAPK = () => {
    playClick();
    setDownloading(true);
    if (onToast) onToast('⬇️ Downloading Sobagu Android APK...', 'info');

    // Direct APK download link from GitHub Releases or self-hosted package
    const apkUrl = 'https://github.com/Tecmob676767/learn-kannada/releases/latest/download/Sobagu-Kannada.apk';
    const link = document.createElement('a');
    link.href = apkUrl;
    link.setAttribute('download', 'Sobagu-Kannada.apk');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setDownloading(false);
      playSuccess();
      if (onToast) onToast('✅ Sobagu APK download started! Open file to install.', 'success');
    }, 1500);
  };

  const handleBrowserInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        if (onToast) onToast('🎉 Sobagu installed successfully as a native desktop/mobile app!', 'success');
      }
      setDeferredPrompt(null);
    } else {
      if (onToast) onToast('💡 Use your browser menu: click "Install Sobagu" or "Add to Home Screen".', 'info');
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(25, 14, 42, 0.98), rgba(14, 7, 24, 0.99))',
      border: '1.5px solid rgba(255, 107, 53, 0.35)',
      borderRadius: '24px',
      padding: '1.6rem',
      maxWidth: '720px',
      margin: '0 auto',
      boxShadow: '0 16px 48px rgba(0, 0, 0, 0.7)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #d90429, #ff6b35)',
            width: 44, height: 44, borderRadius: '14px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '22px', fontWeight: 900, color: '#fff',
            boxShadow: '0 4px 14px rgba(217, 4, 41, 0.4)',
          }}>
            ಸೊ
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Sobagu Universal App Suite</span>
              <span style={{ fontSize: '0.72rem', background: '#ffd700', color: '#000', padding: '2px 8px', borderRadius: '10px', fontWeight: 900 }}>
                6 Platforms
              </span>
            </h2>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.65)' }}>
              Native Android APK · iOS · iPadOS · Windows · macOS · Linux · Web Browser
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            title="Close"
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              width: 32, height: 32,
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Platform Selector Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(95px, 1fr))', gap: '0.45rem', marginBottom: '1.4rem' }}>
        {[
          { id: 'android', label: 'Android APK', icon: '🤖' },
          { id: 'ios',     label: 'iPhone (iOS)', icon: '🍎' },
          { id: 'ipados',  label: 'iPad (iPadOS)', icon: '📱' },
          { id: 'windows', label: 'Windows', icon: '🪟' },
          { id: 'mac',     label: 'macOS', icon: '🍏' },
          { id: 'linux',   label: 'Linux', icon: '🐧' },
          { id: 'web',     label: 'Web Online', icon: '🌐' },
        ].map((p) => (
          <button
            key={p.id}
            onClick={() => { playClick(); setPlatform(p.id); }}
            style={{
              background: platform === p.id ? 'linear-gradient(135deg,#ff6b35,#ffa366)' : 'rgba(255,255,255,0.06)',
              border: platform === p.id ? '1.5px solid #ffd700' : '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '0.65rem 0.35rem',
              color: '#fff',
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.25rem',
              transition: 'all 0.15s ease',
              boxShadow: platform === p.id ? '0 4px 14px rgba(255,107,53,0.35)' : 'none',
            }}
          >
            <span style={{ fontSize: '1.25rem' }}>{p.icon}</span>
            <span>{p.label}</span>
          </button>
        ))}
      </div>

      {/* Dynamic Platform Instructions & Actions */}
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '18px',
        padding: '1.35rem',
        marginBottom: '1.2rem',
      }}>
        {platform === 'android' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#43e97b', fontWeight: 800, fontSize: '0.98rem', marginBottom: '0.4rem' }}>
              <ShieldCheck size={20} /> Real Android Native APK Package
            </div>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.82rem', lineHeight: 1.5, margin: '0 0 1rem' }}>
              Install the real Android APK on any Samsung, Xiaomi, OnePlus, Google Pixel, Vivo, Realme, or Motorola device. Includes full camera/mic permissions for video calls, pronunciation recognition, and offline Kannada audio lessons.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <button
                onClick={handleDownloadAPK}
                disabled={downloading}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #43e97b, #38f9d7)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.95rem',
                  color: '#0d381e',
                  fontWeight: 900,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 6px 20px rgba(67,233,123,0.35)',
                }}
              >
                <Download size={20} /> {downloading ? 'Preparing APK Download...' : 'Download Android APK (Direct Install)'}
              </button>

              <button
                onClick={handleBrowserInstall}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  padding: '0.75rem',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                📲 Or Install via Chrome / Web PWA (1-Click)
              </button>
            </div>
          </div>
        )}

        {platform === 'ios' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffa366', fontWeight: 800, fontSize: '0.98rem', marginBottom: '0.4rem' }}>
              <Apple size={20} /> iPhone (iOS 15, 16, 17, 18+)
            </div>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.82rem', lineHeight: 1.5, margin: '0 0 0.8rem' }}>
              Add Sobagu to your iPhone Home Screen as a full-screen native standalone app with offline support:
            </p>
            <ol style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.82rem', lineHeight: 1.8, margin: '0 0 1rem', paddingLeft: '1.2rem' }}>
              <li>Open <strong>Safari</strong> on your iPhone.</li>
              <li>Tap the <strong>Share button</strong> (the square with an arrow pointing up at the bottom).</li>
              <li>Scroll down and tap <strong>"Add to Home Screen"</strong> (ಮನೆ ಪರದೆಗೆ ಸೇರಿಸಿ).</li>
              <li>Tap <strong>Add</strong> in the top-right corner. Sobagu icon will appear on your home screen!</li>
            </ol>
            <button
              onClick={handleBrowserInstall}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #ff6b35, #ffa366)',
                border: 'none',
                borderRadius: '12px',
                padding: '0.85rem',
                color: '#fff',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: 'pointer',
              }}
            >
              Add to iPhone Home Screen
            </button>
          </div>
        )}

        {platform === 'ipados' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffcf71', fontWeight: 800, fontSize: '0.98rem', marginBottom: '0.4rem' }}>
              <Tablet size={20} /> iPad & iPad Pro (iPadOS)
            </div>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.82rem', lineHeight: 1.5, margin: '0 0 0.8rem' }}>
              Optimized for iPad screen dimensions, Apple Pencil handwriting practice, and full tablet immersion:
            </p>
            <ol style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.82rem', lineHeight: 1.8, margin: '0 0 1rem', paddingLeft: '1.2rem' }}>
              <li>Open <strong>Safari</strong> on your iPad.</li>
              <li>Tap the <strong>Share button</strong> in the top toolbar (square with upward arrow).</li>
              <li>Select <strong>"Add to Home Screen"</strong> from the menu.</li>
              <li>Tap <strong>Add</strong> to launch Sobagu in high-resolution iPad full-screen mode!</li>
            </ol>
            <button
              onClick={handleBrowserInstall}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                border: 'none',
                borderRadius: '12px',
                padding: '0.85rem',
                color: '#fff',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: 'pointer',
              }}
            >
              Install on iPadOS (Full-Screen Tablet)
            </button>
          </div>
        )}

        {platform === 'windows' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4facfe', fontWeight: 800, fontSize: '0.98rem', marginBottom: '0.4rem' }}>
              <Monitor size={20} /> Windows 10 & 11 Desktop App
            </div>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.82rem', lineHeight: 1.5, margin: '0 0 1rem' }}>
              Install Sobagu as a lightweight native Windows Desktop Application with Start Menu & Taskbar pinning, keyboard shortcuts, and offline mode.
            </p>
            <button
              onClick={handleBrowserInstall}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
                border: 'none',
                borderRadius: '12px',
                padding: '0.85rem',
                color: '#042749',
                fontWeight: 900,
                fontSize: '0.92rem',
                cursor: 'pointer',
              }}
            >
              Install Windows App (1-Click Instant)
            </button>
          </div>
        )}

        {platform === 'linux' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f093fb', fontWeight: 800, fontSize: '0.98rem', marginBottom: '0.4rem' }}>
              <Monitor size={20} /> Linux (Ubuntu, Debian, Fedora, Arch)
            </div>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.82rem', lineHeight: 1.5, margin: '0 0 1rem' }}>
              Compatible with all Linux desktop environments (GNOME, KDE Plasma, XFCE, Cinnamon, Wayland, X11) through Chrome/Chromium/Brave desktop integration.
            </p>
            <button
              onClick={handleBrowserInstall}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #f093fb, #f5576c)',
                border: 'none',
                borderRadius: '12px',
                padding: '0.85rem',
                color: '#fff',
                fontWeight: 900,
                fontSize: '0.92rem',
                cursor: 'pointer',
              }}
            >
              Install Linux Desktop App
            </button>
          </div>
        )}

        {platform === 'mac' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffb703', fontWeight: 800, fontSize: '0.98rem', marginBottom: '0.4rem' }}>
              <Apple size={20} /> macOS (Apple Silicon M1/M2/M3/M4 & Intel)
            </div>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.82rem', lineHeight: 1.5, margin: '0 0 1rem' }}>
              In Safari or Chrome, click <strong>File &gt; Add to Dock</strong> or the Install icon in the address bar to launch Sobagu in its own native macOS window with full trackpad gestures.
            </p>
            <button
              onClick={handleBrowserInstall}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #ffb703, #fb8500)',
                border: 'none',
                borderRadius: '12px',
                padding: '0.85rem',
                color: '#1a0d00',
                fontWeight: 900,
                fontSize: '0.92rem',
                cursor: 'pointer',
              }}
            >
              Add to macOS Dock
            </button>
          </div>
        )}

        {platform === 'web' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38f9d7', fontWeight: 800, fontSize: '0.98rem', marginBottom: '0.4rem' }}>
              <Globe size={20} /> Web Online Learning (Zero Install)
            </div>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.82rem', lineHeight: 1.5, margin: '0 0 1rem' }}>
              You are currently using Sobagu in your web browser! You can learn anytime from any smartphone, laptop, tablet, or smart TV with zero storage space needed. Your progress automatically syncs across all devices via your 6-digit Multi-Device Code.
            </p>
            <div style={{
              background: 'rgba(56,249,215,0.1)',
              border: '1px solid rgba(56,249,215,0.3)',
              borderRadius: '12px',
              padding: '0.75rem 1rem',
              color: '#38f9d7',
              fontSize: '0.82rem',
              fontWeight: 700,
            }}>
              ✨ Bookmark this page (Ctrl+D or Cmd+D) to return anytime!
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.2rem', fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', flexWrap: 'wrap' }}>
        <span>✔ 100% Free Forever</span>
        <span>✔ Offline Mode Supported</span>
        <span>✔ 0s Edge Cloud Sync</span>
        <span>✔ Audio Lessons Included</span>
      </div>
    </div>
  );
}
