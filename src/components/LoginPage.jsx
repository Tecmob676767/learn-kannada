import React, { useState, useEffect, useRef } from 'react';
import {
  Mail, KeyRound, ArrowRight, CheckCircle, RefreshCw,
  Sparkles, ShieldCheck, UserCheck, AlertCircle, Copy, Check
} from 'lucide-react';
import { createUser, loginUser, loginOrCreateGoogleUser, loginOrCreateEmailUser } from '../utils/storage.js';
import { verifyControlCenterCode } from '../utils/adminConfig.js';
import { requestEmailOTP, verifyEmailOTP } from '../utils/emailOtpService.js';
import { playSuccess, playFanfare, playClick } from '../utils/soundEffects.js';

const LoginPage = ({ onLogin, onOpenControlCenter }) => {
  const [tab, setTab] = useState('email'); // 'email' | 'code' | 'new'
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [otpStep, setOtpStep] = useState(false); // false = email input, true = otp input
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [activeOtpCode, setActiveOtpCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState(null);
  const [newUser, setNewUser] = useState(null);
  const [copied, setCopied] = useState(false);

  const otpInputsRef = useRef([]);

  // Hidden Master Shortcut: Ctrl + Shift + O opens Control Center without any visible UI clue
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'o' || e.key === 'O' || e.code === 'KeyO')) {
        e.preventDefault();
        onOpenControlCenter?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenControlCenter]);

  // Cooldown countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown(c => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Listener for custom OTP simulation toast/preview
  useEffect(() => {
    const handleOtpEvent = (e) => {
      const detail = e.detail;
      if (detail && detail.otp) {
        setActiveOtpCode(detail.otp);
      }
    };
    window.addEventListener('sobagu:otp_sent', handleOtpEvent);
    return () => window.removeEventListener('sobagu:otp_sent', handleOtpEvent);
  }, []);

  // Google Identity Services (frontend-only)
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const handleCredentialResponse = async (response) => {
      try {
        const payload = JSON.parse(atob(response.credential.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        const user = await loginOrCreateGoogleUser(payload);
        if (user) {
          if (user.banned) {
            setError(`🚫 ${user.reason || 'This account has been suspended.'}`);
            return;
          }
          playSuccess();
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
  }, [onLogin]);

  // ── Step 1: Request OTP ────────────────────────────────────────────────────
  const handleSendOTP = (e) => {
    e?.preventDefault();
    setError('');
    setSuccessMsg('');
    const cleanEmail = email.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    const res = requestEmailOTP(cleanEmail);
    setLoading(false);

    if (res.success) {
      playClick();
      setOtpStep(true);
      setActiveOtpCode(res.otp);
      setResendCooldown(30);
      setSuccessMsg(`OTP sent to ${cleanEmail}! Check your inbox.`);
      // Focus first OTP box
      setTimeout(() => {
        if (otpInputsRef.current[0]) otpInputsRef.current[0].focus();
      }, 150);
    } else {
      setError(res.error || 'Failed to send OTP.');
    }
  };

  // ── Step 2: Handle OTP Input & Auto-focus ─────────────────────────────────
  const handleOtpChange = (index, value) => {
    const val = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = val;
    setOtpDigits(newDigits);

    if (val && index < 5 && otpInputsRef.current[index + 1]) {
      otpInputsRef.current[index + 1].focus();
    }

    // Auto submit if all 6 digits entered
    const fullCode = newDigits.join('');
    if (fullCode.length === 6) {
      handleVerifyOTP(fullCode);
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0 && otpInputsRef.current[index - 1]) {
      otpInputsRef.current[index - 1].focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const newDigits = pasted.split('').concat(Array(6).fill('')).slice(0, 6);
    setOtpDigits(newDigits);
    if (pasted.length === 6) {
      handleVerifyOTP(pasted);
    } else {
      const nextIdx = Math.min(pasted.length, 5);
      if (otpInputsRef.current[nextIdx]) otpInputsRef.current[nextIdx].focus();
    }
  };

  // ── Step 3: Verify OTP & Log In ───────────────────────────────────────────
  const handleVerifyOTP = async (codeToVerify) => {
    const enteredOtp = codeToVerify || otpDigits.join('');
    if (enteredOtp.length !== 6) {
      setError('Please enter all 6 digits of the OTP code.');
      return;
    }

    setError('');
    setLoading(true);

    const check = verifyEmailOTP(email, enteredOtp);
    if (!check.success) {
      setLoading(false);
      setError(check.error || 'Invalid OTP. Please try again.');
      return;
    }

    try {
      const user = await loginOrCreateEmailUser(email, name);
      setLoading(false);
      if (!user) {
        setError('Could not initialize account. Please try again.');
        return;
      }
      if (user.banned) {
        setError(`🚫 ${user.reason || 'This account has been suspended.'}`);
        return;
      }
      playFanfare();
      onLogin(user);
    } catch {
      setLoading(false);
      setError('Authentication failed. Please check your network.');
    }
  };

  const handleQuickFillOTP = () => {
    if (!activeOtpCode) return;
    const digits = activeOtpCode.split('').slice(0, 6);
    setOtpDigits(digits);
    handleVerifyOTP(activeOtpCode);
  };

  // ── 6-Digit Code Login ────────────────────────────────────────────────────
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
      playSuccess();
      onLogin(user);
    } catch {
      setError('❌ Login failed. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  // ── Quick Anonymous User Creation ─────────────────────────────────────────
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

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Emblem & Logo */}
        <div className="login-logo">
          <div className="petals" style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
            <svg width="84" height="84" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
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
              <circle cx="50" cy="50" r="46" fill="url(#logoBg)" stroke="url(#goldGrad)" strokeWidth="4" filter="url(#logoGlow)" />
              <circle cx="50" cy="50" r="40" stroke="url(#goldGrad)" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.8" />
              <path d="M35 34 L42 42 L50 28 L58 42 L65 34 L62 50 L38 50 Z" fill="url(#goldGrad)" />
              <circle cx="35" cy="32" r="2.5" fill="#fff" />
              <circle cx="50" cy="26" r="3" fill="#fff" />
              <circle cx="65" cy="32" r="2.5" fill="#fff" />
              <text x="50" y="74" textAnchor="middle" fill="url(#goldGrad)" fontSize="28" fontWeight="900" fontFamily="Noto Sans Kannada, sans-serif" filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.5))">
                ಸೊ
              </text>
            </svg>
          </div>
          <h1>ಸೊಬಗು</h1>
          <p className="subtitle">Sobagu · Master Spoken & Written Kannada</p>
        </div>

        {/* Google Sign-In */}
        <div style={{ display: 'flex', justifyContent: 'center', margin: '0.8rem 0' }}>
          <div id="google-signin-button" />
        </div>

        <div className="glass-card login-card" style={{ padding: '1.5rem', borderRadius: '20px' }}>
          {/* Navigation Tabs */}
          <div className="login-tabs" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.9fr 0.9fr', gap: '0.35rem', marginBottom: '1.2rem' }}>
            <button
              className={`login-tab${tab === 'email' ? ' active' : ''}`}
              onClick={() => { setTab('email'); setError(''); setSuccessMsg(''); }}
              style={{ fontSize: '0.82rem', padding: '0.65rem 0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}
            >
              <Mail size={14} /> Email OTP
            </button>
            <button
              className={`login-tab${tab === 'code' ? ' active' : ''}`}
              onClick={() => { setTab('code'); setError(''); setSuccessMsg(''); }}
              style={{ fontSize: '0.82rem', padding: '0.65rem 0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}
            >
              <KeyRound size={14} /> 6-Digit Code
            </button>
            <button
              className={`login-tab${tab === 'new' ? ' active' : ''}`}
              onClick={() => { setTab('new'); setError(''); setSuccessMsg(''); setGeneratedCode(null); }}
              style={{ fontSize: '0.82rem', padding: '0.65rem 0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}
            >
              🌱 Quick
            </button>
          </div>

          {/* TAB 1: EMAIL + OTP LOGIN (Primary) */}
          {tab === 'email' && (
            <div>
              {!otpStep ? (
                /* Step 1: Enter Email */
                <form onSubmit={handleSendOTP}>
                  <div style={{ background: 'linear-gradient(135deg, rgba(255,107,53,0.12), rgba(79,172,254,0.08))', border: '1px solid rgba(255,107,53,0.3)', borderRadius: '14px', padding: '0.9rem', marginBottom: '1.1rem' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--sakura-pink)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
                      <Sparkles size={16} /> Enter Email to Stay Updated
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.4 }}>
                      Get daily conversational Kannada phrase bites, cloud sync across all your devices, and streak protection reminders.
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Mail size={14} color="var(--sakura-pink)" /> Email Address
                    </label>
                    <input
                      className="form-input"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      autoFocus
                      required
                      style={{ fontSize: '0.95rem' }}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                    <label className="form-label">Your Name (Optional)</label>
                    <input
                      className="form-input"
                      type="text"
                      placeholder="e.g. Priya, Arjun, Rahul..."
                      value={name}
                      onChange={e => setName(e.target.value)}
                      maxLength={30}
                      style={{ fontSize: '0.95rem' }}
                    />
                  </div>

                  {error && (
                    <div style={{ background: 'rgba(239,35,60,0.15)', border: '1px solid rgba(239,35,60,0.4)', borderRadius: '10px', padding: '0.6rem 0.8rem', color: '#ff5858', fontSize: '0.82rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <AlertCircle size={15} /> {error}
                    </div>
                  )}

                  <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', padding: '0.85rem' }}>
                    {loading ? 'Sending Verification Code...' : 'Send Verification OTP 📧'}
                  </button>
                </form>
              ) : (
                /* Step 2: Enter 6-Digit OTP */
                <div>
                  <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#ff6b35,#ffa366)', margin: '0 auto 0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ShieldCheck size={24} color="#fff" />
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>Verify Your Email</h3>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'rgba(255,255,255,0.65)' }}>
                      Enter the 6-digit code dispatched to <strong style={{ color: 'var(--sakura-pink)' }}>{email}</strong>
                    </p>
                  </div>

                  {/* 6-Digit OTP Boxes */}
                  <div style={{ display: 'flex', gap: '0.45rem', justifyContent: 'center', marginBottom: '1.2rem' }} onPaste={handleOtpPaste}>
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={el => otpInputsRef.current[idx] = el}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleOtpChange(idx, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(idx, e)}
                        style={{
                          width: '44px',
                          height: '52px',
                          borderRadius: '12px',
                          background: digit ? 'rgba(255,107,53,0.15)' : 'rgba(255,255,255,0.08)',
                          border: `1.5px solid ${digit ? 'var(--sakura-pink)' : 'var(--glass-border)'}`,
                          color: '#fff',
                          fontSize: '1.4rem',
                          fontWeight: 900,
                          textAlign: 'center',
                          outline: 'none',
                          boxShadow: digit ? '0 0 12px rgba(255,107,53,0.3)' : 'none',
                          transition: 'all 0.15s ease',
                        }}
                      />
                    ))}
                  </div>

                  {/* Dispatched OTP Instant Helper Banner */}
                  {activeOtpCode && (
                    <div style={{
                      background: 'rgba(67,233,123,0.12)', border: '1px solid rgba(67,233,123,0.35)',
                      borderRadius: '12px', padding: '0.7rem 0.9rem', marginBottom: '1rem',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem',
                    }}>
                      <div style={{ fontSize: '0.78rem', color: '#43e97b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <CheckCircle size={15} /> OTP Dispatched: <strong style={{ letterSpacing: '2px', fontSize: '0.9rem' }}>{activeOtpCode}</strong>
                      </div>
                      <button
                        type="button"
                        onClick={handleQuickFillOTP}
                        style={{
                          background: 'linear-gradient(135deg,#43e97b,#38f9d7)', border: 'none',
                          borderRadius: '8px', padding: '0.3rem 0.6rem', color: '#0f381e',
                          fontWeight: 800, fontSize: '0.72rem', cursor: 'pointer',
                        }}
                      >
                        Autofill
                      </button>
                    </div>
                  )}

                  {error && (
                    <div style={{ background: 'rgba(239,35,60,0.15)', border: '1px solid rgba(239,35,60,0.4)', borderRadius: '10px', padding: '0.6rem 0.8rem', color: '#ff5858', fontSize: '0.82rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <AlertCircle size={15} /> {error}
                    </div>
                  )}

                  <button
                    className="btn-primary"
                    type="button"
                    onClick={() => handleVerifyOTP()}
                    disabled={loading}
                    style={{ width: '100%', padding: '0.85rem', marginBottom: '0.8rem' }}
                  >
                    {loading ? 'Verifying...' : 'Verify & Enter Sobagu ✨'}
                  </button>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)' }}>
                    <button
                      type="button"
                      onClick={() => { setOtpStep(false); setError(''); }}
                      style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Change Email
                    </button>
                    <button
                      type="button"
                      disabled={resendCooldown > 0}
                      onClick={handleSendOTP}
                      style={{
                        background: 'none', border: 'none',
                        color: resendCooldown > 0 ? 'rgba(255,255,255,0.35)' : 'var(--sakura-pink)',
                        fontWeight: 700, cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', gap: '0.3rem',
                      }}
                    >
                      <RefreshCw size={12} /> {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: 6-DIGIT CODE LOGIN */}
          {tab === 'code' && (
            <form onSubmit={handleReturning}>
              <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                <label className="form-label">Enter Your 6-Digit Code</label>
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
                  style={{ fontSize: '1.3rem', letterSpacing: '4px', textAlign: 'center', fontWeight: 900 }}
                />
              </div>
              {loading && (
                <div style={{ textAlign: 'center', margin: '0.5rem 0', fontSize: '0.85rem', color: '#4facfe', fontWeight: 600 }}>
                  ☁️ Connecting to Cloud Storage... Syncing profile
                </div>
              )}
              {error && (
                <div style={{ background: 'rgba(239,35,60,0.15)', border: '1px solid rgba(239,35,60,0.4)', borderRadius: '10px', padding: '0.6rem 0.8rem', color: '#ff5858', fontSize: '0.82rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <AlertCircle size={15} /> {error}
                </div>
              )}
              <button id="btn-login" className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', padding: '0.85rem' }}>
                {loading ? '☁️ Syncing Cloud Account...' : '🔑 Log In With Code'}
              </button>
            </form>
          )}

          {/* TAB 3: QUICK ANONYMOUS ACCOUNT */}
          {tab === 'new' && (
            <div>
              {!generatedCode ? (
                <form onSubmit={handleNewUser}>
                  <div className="form-group" style={{ marginBottom: '1.2rem' }}>
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
                      style={{ fontSize: '0.95rem' }}
                    />
                  </div>
                  {error && (
                    <div style={{ background: 'rgba(239,35,60,0.15)', border: '1px solid rgba(239,35,60,0.4)', borderRadius: '10px', padding: '0.6rem 0.8rem', color: '#ff5858', fontSize: '0.82rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <AlertCircle size={15} /> {error}
                    </div>
                  )}
                  <button id="btn-create-account" className="btn-primary" type="submit" style={{ width: '100%', padding: '0.85rem' }}>
                    🌸 Quick Enter Without Email
                  </button>
                </form>
              ) : (
                <div>
                  <div className="welcome-user">
                    <div className="avatar">{(newUser?.name || '?')[0].toUpperCase()}</div>
                    <h3>Welcome, {newUser?.name}! 🎉</h3>
                    <p>Your Kannada journey begins now.</p>
                  </div>

                  <div className="code-display">
                    <p className="code-label">🔐 Your Personal Multi-Device Code</p>
                    <span className="code-number">{generatedCode}</span>
                    <button className="copy-btn" onClick={handleCopy}>
                      {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy Code</>}
                    </button>
                  </div>

                  <button id="btn-enter-app" className="btn-primary" onClick={() => onLogin(newUser)} style={{ width: '100%', padding: '0.85rem' }}>
                    🚀 Start Learning Kannada!
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          🌸 ಕನ್ನಡ ರಾಜ್ಯೋತ್ಸವ · Instant Verified Login · Zero passwords
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
