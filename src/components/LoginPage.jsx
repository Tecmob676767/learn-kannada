import React, { useState } from 'react';
import { createUser, loginUser } from '../utils/storage.js';
import { verifyControlCenterCode } from '../utils/adminConfig.js';

const LoginPage = ({ onLogin, onOpenControlCenter }) => {
  const [tab, setTab] = useState('new'); // 'new' | 'returning'
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [generatedCode, setGeneratedCode] = useState(null);
  const [newUser, setNewUser] = useState(null);
  const [copied, setCopied] = useState(false);

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

  const handleReturning = (e) => {
    e.preventDefault();
    setError('');
    const trimmed = code.replace(/\s/g, '');
    if (verifyControlCenterCode(trimmed)) {
      onOpenControlCenter?.();
      return;
    }
    if (trimmed.length !== 6 || isNaN(trimmed)) {
      setError('Please enter your 6-digit code');
      return;
    }
    const user = loginUser(trimmed);
    if (!user) {
      setError('❌ Code not found. Double-check or create a new account!');
      return;
    }
    if (user.banned) {
      setError(`🚫 ${user.reason || 'This account has been suspended.'}`);
      return;
    }
    onLogin(user);
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

        <div className="glass-card login-card">
          <div className="login-tabs">
            <button
              className={`login-tab${tab === 'new' ? ' active' : ''}`}
              onClick={() => { setTab('new'); setError(''); setGeneratedCode(null); }}
            >
              🌱 New Here
            </button>
            <button
              className={`login-tab${tab === 'returning' ? ' active' : ''}`}
              onClick={() => { setTab('returning'); setError(''); }}
            >
              🔑 I Have a Code
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
                <p className="code-label">🔐 Your Personal Login Code</p>
                <span className="code-number">{generatedCode}</span>
                <p className="code-note">Save this code! You'll need it to log back in.</p>
                <button className="copy-btn" onClick={handleCopy}>
                  {copied ? '✅ Copied!' : '📋 Copy Code'}
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
                  placeholder="_ _ _ _ _ _"
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  autoFocus
                  inputMode="numeric"
                />
              </div>
              {error && <p style={{ color: 'var(--red-error)', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>}
              <button id="btn-login" className="btn-primary" type="submit">
                🔑 Enter Sobagu
              </button>
              <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
                Don't have a code? Switch to "New Here" to create an account.
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
          🛡️ Sobagu Control Center
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
