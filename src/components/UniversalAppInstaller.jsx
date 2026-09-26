import React, { useState, useEffect } from 'react';
import {
  Smartphone, Monitor, Apple, Download, CheckCircle,
  Sparkles, ExternalLink, ShieldCheck, ChevronRight, X
} from 'lucide-react';
import { playClick, playSuccess } from '../utils/soundEffects.js';

export default function UniversalAppInstaller({ onToast, onClose }) {
  const [platform, setPlatform] = useState('android'); // 'android' | 'ios' | 'windows' | 'linux' | 'mac'
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    // Detect OS automatically
    const ua = navigator.userAgent.toLowerCase();
    if (/android/.test(ua)) setPlatform('android');
    else if (/iphone|ipad|ipod/.test(ua)) setPlatform('ios');
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
      maxWidth: '680px',
      margin: '0 auto',
      boxShadow: '0 16px 48px rgba(0, 0, 0, 0.7)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #ff6b35, #ffa366)',
            width: 40, height: 40, borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Download size={22} color="#fff" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#fff' }}>
              Install Sobagu Everywhere
            </h2>
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)' }}>
              Native Android APK · iOS / iPadOS · Windows · Linux · macOS
            </p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        )}
      </div>

      {/* Platform Selector Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '0.5rem', marginBottom: '1.4rem' }}>
        {[
          { id: 'android', label: 'Android APK', icon: '🤖' },
          { id: 'ios', label: 'iOS / iPadOS', icon: '🍎' },
          { id: 'windows', label: 'Windows', icon: '🪟' },
          { id: 'linux', label: 'Linux', icon: '🐧' },
          { id: 'mac', label: 'macOS', icon: '🍏' },
        ].map((p) => (
          <button
            key={p.id}
            onClick={() => { playClick(); setPlatform(p.id); }}
            style={{
              background: platform === p.id ? 'linear-gradient(135deg,#ff6b35,#ffa366)' : 'rgba(255,255,255,0.06)',
              border: platform === p.id ? 'none' : '1px solid var(--glass-border)',
              borderRadius: '12px',
              padding: '0.65rem 0.4rem',
              color: '#fff',
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.25rem',
              transition: 'all 0.15s ease',
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>{p.icon}</span>
            {p.label}
          </button>
        ))}
      </div>

      {/* Dynamic Platform Instructions & Actions */}
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '18px',
        padding: '1.25rem',
        marginBottom: '1.2rem',
      }}>
        {platform === 'android' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#43e97b', fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.4rem' }}>
              <ShieldCheck size={18} /> Real Android Native APK Package
            </div>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.82rem', lineHeight: 1.5, margin: '0 0 1rem' }}>
              Install the real Android APK on any Samsung, Xiaomi, OnePlus, Google Pixel, Vivo, Realme, or Motorola device. Includes full camera/mic permissions for video calls, pronunciation recognition, and 0s Plumine CS+ sync.
            </p>

            <button
              onClick={handleDownloadAPK}
              disabled={downloading}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #43e97b, #38f9d7)',
                border: 'none',
                borderRadius: '12px',
                padding: '0.9rem',
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
          </div>
        )}

        {platform === 'ios' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffa366', fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.4rem' }}>
              <Apple size={18} /> iPhone & iPad (iOS / iPadOS)
            </div>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.82rem', lineHeight: 1.5, margin: '0 0 0.8rem' }}>
              Install Sobagu as a full-screen native standalone app on iOS 15, 16, 17, 18+ and iPadOS:
            </p>
            <ol style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.8rem', lineHeight: 1.7, margin: '0 0 1rem', paddingLeft: '1.2rem' }}>
              <li>Open <strong>Safari</strong> on your iPhone or iPad.</li>
              <li>Tap the <strong>Share</strong> button (box with upward arrow at bottom/top).</li>
              <li>Scroll down and tap <strong>"Add to Home Screen"</strong> (ಮನೆ ಪರದೆಗೆ ಸೇರಿಸಿ).</li>
              <li>Tap <strong>Add</strong> in the top-right corner.</li>
            </ol>
            <button
              onClick={handleBrowserInstall}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #ff6b35, #ffa366)',
                border: 'none',
                borderRadius: '12px',
                padding: '0.8rem',
                color: '#fff',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: 'pointer',
              }}
            >
              Install on iPad / iPhone
            </button>
          </div>
        )}

        {platform === 'windows' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4facfe', fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.4rem' }}>
              <Monitor size={18} /> Windows 10 & 11 Desktop App
            </div>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.82rem', lineHeight: 1.5, margin: '0 0 1rem' }}>
              Install Sobagu as a lightweight native Windows Desktop Application with Start Menu & Taskbar pinning, instant shortcuts, and offline mode.
            </p>
            <button
              onClick={handleBrowserInstall}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
                border: 'none',
                borderRadius: '12px',
                padding: '0.8rem',
                color: '#042749',
                fontWeight: 900,
                fontSize: '0.9rem',
                cursor: 'pointer',
              }}
            >
              Install Windows App (1-Click)
            </button>
          </div>
        )}

        {platform === 'linux' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f093fb', fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.4rem' }}>
              <Monitor size={18} /> Linux (Ubuntu, Debian, Fedora, Arch)
            </div>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.82rem', lineHeight: 1.5, margin: '0 0 1rem' }}>
              Compatible with all Linux desktop environments (GNOME, KDE Plasma, XFCE, Cinnamon, Wayland, X11).
            </p>
            <button
              onClick={handleBrowserInstall}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #f093fb, #f5576c)',
                border: 'none',
                borderRadius: '12px',
                padding: '0.8rem',
                color: '#fff',
                fontWeight: 900,
                fontSize: '0.9rem',
                cursor: 'pointer',
              }}
            >
              Install Linux Desktop App
            </button>
          </div>
        )}

        {platform === 'mac' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffb703', fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.4rem' }}>
              <Apple size={18} /> macOS (Apple Silicon M1/M2/M3/M4 & Intel)
            </div>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.82rem', lineHeight: 1.5, margin: '0 0 1rem' }}>
              In Safari or Chrome, click <strong>File &gt; Add to Dock</strong> or the Install button in the address bar to launch Sobagu in its own native macOS window.
            </p>
            <button
              onClick={handleBrowserInstall}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #ffb703, #fb8500)',
                border: 'none',
                borderRadius: '12px',
                padding: '0.8rem',
                color: '#1a0d00',
                fontWeight: 900,
                fontSize: '0.9rem',
                cursor: 'pointer',
              }}
            >
              Add to macOS Dock
            </button>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
        <span>✔ 100% Free Forever</span>
        <span>✔ Offline Mode Supported</span>
        <span>✔ 0s Edge Cloud Sync</span>
      </div>
    </div>
  );
}
