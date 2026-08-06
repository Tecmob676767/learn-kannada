import React, { useState } from 'react';
import { createUser, loginUser } from '../utils/storage.js';

const LoginPage = ({ onLogin }) => {
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
    if (trimmed.length !== 6 || isNaN(trimmed)) {
      setError('Please enter your 6-digit code');
      return;
    }
    const user = loginUser(trimmed);
    if (!user) {
      setError('❌ Code not found. Double-check or create a new account!');
      return;
    }
    onLogin(user);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-logo">
          <span className="petals">🌸</span>
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
      </div>
    </div>
  );
};

export default LoginPage;
