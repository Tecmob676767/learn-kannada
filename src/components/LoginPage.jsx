import React, { useState, useEffect } from 'react';
import { createUser, loginUser, loginOrCreateGoogleUser } from '../utils/storage.js';
import { verifyControlCenterCode } from '../utils/adminConfig.js';

const LoginPage = ({ onLogin, onOpenControlCenter }) => {
  const [tab, setTab] = useState('new'); // 'new' | 'returning' | 'admin'
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [showAdminCode, setShowAdminCode] = useState(false);
  const [error, setError] = useState('');
  const [generatedCode, setGeneratedCode] = useState(null);
  const [newUser, setNewUser] = useState(null);
  const [copied, setCopied] = useState(false);

  // Google Identity Services (frontend-only)
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const handleCredentialResponse = async (response) => {
      try {
        const payload = JSON.parse(atob(response.credential.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        // Login or restore Google user with full cross-device cloud progress sync
        const user = await loginOrCreateGoogleUser(payload);
        if (user) {
          if (user.banned) {
            setError(`🚫 ${user.reason || 'This account has been suspended.'}`);
            return;
          }
          onLogin(user);
        }
      } catch (err) {
        console.error('Google credential handling failed', err);
      }
    };

    const t = setTimeout(() => {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        window.google.accounts.id.initialize({ client_id: clientId, callback: handleCredentialResponse });
        const container = document.getElementById('google-signin-button');
        if (container) {
          window.google.accounts.id.renderButton(container, { theme: 'outline', size: 'large', width: '280' });
        }
      }
    }, 300);

    return () => clearTimeout(t);
  }, []);

  const handleNewUser = (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || name.trim().length < 2) {
      setError('Please enter your name (at least 2 characters)');
      return;
    }
    const user = createUser(name.trim());
    setGeneratedCode(user.code);
    setNewUser(user);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEnterApp = () => {
    onLogin(newUser);
  };

  const [loading, setLoading] = useState(false);

  const handleReturning = async (e) => {
    e.preventDefault();
    setError('');
    const trimmed = code.replace(/\D/g, '').trim();
    if (verifyControlCenterCode(trimmed)) {
      onOpenControlCenter?.();
      return;
    }
    if (trimmed.length !== 6) {
      setError('Please enter your 6-digit login code');
      return;
    }
    setLoading(true);
    try {
      const user = await loginUser(trimmed);
      if (!user) {
        setError('❌ Code not found on this device or in Cloud Storage. Double-check your 6-digit code!');
        return;
      }
      if (user.banned) {
        setError(`🚫 ${user.reason || 'This account has been suspended.'}`);
        return;
      }
      onLogin(user);
    } catch (err) {
      setError('❌ Login failed. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminSubmit = (e) => {
    e.preventDefault();
    setError('');
    const trimmed = adminCode.replace(/\D/g, '').trim();
    if (verifyControlCenterCode(trimmed)) {
      onOpenControlCenter?.();
    } else {
      setError('❌ Invalid Master Access Code. Access restricted to Founder Sujay.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-logo">
          <div className="petals" style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
            {/* Royal Karnataka Sobagu Golden Crown Emblem Logo */}
            <svg width="88" height="88" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="logoBg" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#d90429" />
                  <stop offset="50%" stopColor="#ef233c" />
                  <stop offset="100%" stopColor="#8d0801" />
                </linearGradient>
                <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fff3b0" />
                  <stop offset="50%" stopColor="#ffb703" />
                  <stop offset="100%" stopColor="#fb8500" />
                </linearGradient>
                <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              {/* Outer Golden Ring */}
              <circle cx="50" cy="50" r="46" fill="url(#logoBg)" stroke="url(#goldGrad)" strokeWidth="4" filter="url(#logoGlow)" />
              <circle cx="50" cy="50" r="40" stroke="url(#goldGrad)" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.8" />
              
              {/* Royal Crown Top */}
              <path d="M35 34 L42 42 L50 28 L58 42 L65 34 L62 50 L38 50 Z" fill="url(#goldGrad)" />
              <circle cx="35" cy="32" r="2.5" fill="#fff" />
              <circle cx="50" cy="26" r="3" fill="#fff" />
              <circle cx="65" cy="32" r="2.5" fill="#fff" />

              {/* Kannada Character "ಸೊ" */}
              <text x="50" y="74" textAnchor="middle" fill="url(#goldGrad)" fontSize="28" fontWeight="900" fontFamily="Noto Sans Kannada, sans-serif" filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.5))">
                ಸೊ
              </text>
            </svg>
          </div>
          <h1>ಸೊಬಗು</h1>
          <p className="subtitle">Sobagu · Learn Kannada</p>
        </div>

        {/* Google Sign-In */}
        <div style={{ display: 'flex', justifyContent: 'center', margin: '1rem 0' }}>
          <div id="google-signin-button" />
        </div>

        <div className="glass-card login-card">
          <div className="login-tabs" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.35rem' }}>
            <button
              className={`login-tab${tab === 'new' ? ' active' : ''}`}
              onClick={() => { setTab('new'); setError(''); setGeneratedCode(null); }}
              style={{ fontSize: '0.8rem', padding: '0.65rem 0.25rem' }}
            >
              🌱 New User
            </button>
            <button
              className={`login-tab${tab === 'returning' ? ' active' : ''}`}
              onClick={() => { setTab('returning'); setError(''); }}
              style={{ fontSize: '0.8rem', padding: '0.65rem 0.25rem' }}
            >
              🔑 Enter Code
            </button>
            <button
              className={`login-tab${tab === 'admin' ? ' active' : ''}`}
              onClick={() => { setTab('admin'); setError(''); }}
              style={{ fontSize: '0.8rem', padding: '0.65rem 0.25rem', color: tab === 'admin' ? '#ffd700' : 'var(--text-secondary)' }}
            >
              🛡️ Admin
            </button>
          </div>

          {tab === 'new' && !generatedCode && (
            <form onSubmit={handleNewUser}>
              <div className="form-group">
                <label className="form-label">Your Name</label>
                <input
                  id="input-name"
                  className="form-input"
                  type="text"
                  placeholder="e.g. Priya, Rahul, Arjun..."
                  value={name}
                  onChange={e => setName(e.target.value)}
                  autoFocus
                  maxLength={30}
                />
              </div>
              {error && <p style={{ color: 'var(--red-error)', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>}
              <button id="btn-create-account" className="btn-primary" type="submit">
                🌸 Create My Account
              </button>
              <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
                A unique 6-digit code will be generated for you to log back in anytime.
              </p>
            </form>
          )}

          {tab === 'new' && generatedCode && (
            <div>
              <div className="welcome-user">
                <div className="avatar">{newUser?.name?.[0]?.toUpperCase()}</div>
                <h3>Welcome, {newUser?.name}! 🎉</h3>
                <p>Your Kannada journey begins now.</p>
              </div>

              <div className="code-display">
                <p className="code-label">🔐 Your Personal Multi-Device Code</p>
                <span className="code-number">{generatedCode}</span>
                <p className="code-note">Save this code! You can use this exact 6-digit code to log in on ANY device (laptop, phone, tablet).</p>
                <button className="copy-btn" onClick={handleCopy}>
                  {copied ? '✅ Copied to Clipboard!' : '📋 Copy Code'}
                </button>
              </div>

              <button id="btn-enter-app" className="btn-primary" onClick={handleEnterApp}>
                🚀 Start Learning Kannada!
              </button>
            </div>
          )}

          {tab === 'returning' && (
            <form onSubmit={handleReturning}>
              <div className="form-group">
                <label className="form-label">Your 6-Digit Code</label>
                <input
                  id="input-login-code"
                  className="form-input code-input"
                  type="text"
                  placeholder="e.g. 849201"
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 12))}
                  maxLength={12}
                  autoFocus
                  inputMode="numeric"
                  disabled={loading}
                />
              </div>
              {loading && (
                <div style={{ textAlign: 'center', margin: '0.5rem 0', fontSize: '0.85rem', color: '#4facfe', fontWeight: 600 }}>
                  ☁️ Connecting to Cloud Storage... Syncing profile
                </div>
              )}
              {error && <p style={{ color: 'var(--red-error)', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>}
              <button id="btn-login" className="btn-primary" type="submit" disabled={loading}>
                {loading ? '☁️ Syncing Cloud Account...' : '🔑 Log In Across Devices'}
              </button>
              <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
                Enter the same 6-digit code you use on your laptop or phone to restore all your progress.
              </p>
            </form>
          )}

          {tab === 'admin' && (
            <form onSubmit={handleAdminSubmit}>
              <div className="form-group" style={{ position: 'relative' }}>
                <label className="form-label">Founder Master Access Code</label>
                <input
                  id="input-admin-code"
                  className="form-input code-input"
                  type={showAdminCode ? 'text' : 'password'}
                  placeholder="Enter 12-digit master code"
                  value={adminCode}
                  onChange={e => setAdminCode(e.target.value.replace(/\D/g, '').slice(0, 12))}
                  maxLength={12}
                  autoFocus
                  inputMode="numeric"
                  style={{ letterSpacing: '0.15em', paddingRight: '3rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowAdminCode(v => !v)}
                  style={{ position: 'absolute', right: '0.75rem', top: '2.35rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--text-muted)' }}
                >{showAdminCode ? '🙈' : '👁️'}</button>
              </div>
              {error && <p style={{ color: 'var(--red-error)', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>}
              <button id="btn-admin-login" className="btn-primary" type="submit" style={{ background: 'linear-gradient(135deg,#d90429,#8d0801)' }}>
                🛡️ Open Control Center
              </button>
              <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
                👑 Founder Sujay Access Portal · Master authority
              </p>
            </form>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          🌸 ಕನ್ನಡ ರಾಜ್ಯೋತ್ಸವ — Instant Access. No passwords.
        </p>
        <button
          type="button"
          className="control-center-link"
          onClick={() => onOpenControlCenter?.()}
        >
          🛡️ Sobagu Control Center Direct Access
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
