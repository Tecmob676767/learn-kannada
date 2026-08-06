import React, { useState } from 'react';
import { createUser, loginUser, findUserByPhone } from '../utils/storage.js';
import { checkGlobalPhoneExists } from '../utils/onlineLeaderboard.js';

const LoginPage = ({ onLogin }) => {
  // Tabs: 'new' | 'login' | 'otp_login'
  const [tab, setTab] = useState('new');

  // Form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loginIdentifier, setLoginIdentifier] = useState(''); // phone or code
  const [loginPassword, setLoginPassword] = useState('');

  // OTP Verification state
  const [step, setStep] = useState('input'); // 'input' | 'otp_verify' | 'success'
  const [otpCode, setOtpCode] = useState('');
  const [inputOtp, setInputOtp] = useState('');
  const [otpTargetPhone, setOtpTargetPhone] = useState('');
  const [pendingUserData, setPendingUserData] = useState(null);

  // Status & errors
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Helper to format phone cleanly
  const formatPhone = (val) => val.replace(/\D/g, '').slice(0, 10);

  // Generate random 6-digit OTP
  const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

  // Reset form errors
  const switchTab = (newTab) => {
    setTab(newTab);
    setStep('input');
    setError('');
    setInputOtp('');
    setOtpCode('');
    setResetSuccess(false);
  };

  // --- 1. NEW ACCOUNT SIGNUP ---
  const handleRequestSignupOTP = async (e) => {
    e.preventDefault();
    setError('');

    const cleanName = name.trim();
    const cleanPhone = formatPhone(phone);

    if (!cleanName || cleanName.length < 2) {
      setError('Please enter your name (at least 2 letters)');
      return;
    }
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile phone number');
      return;
    }
    if (!password || password.length < 4) {
      setError('Please set a password (at least 4 characters)');
      return;
    }

    setLoading(true);

    // Enforce "One Phone Number = One Login"
    const localExisting = findUserByPhone(cleanPhone);
    if (localExisting) {
      setLoading(false);
      setError('❌ This phone number is already registered! Please use Phone Login or Forgot Password.');
      return;
    }

    const cloudExisting = await checkGlobalPhoneExists(cleanPhone);
    if (cloudExisting) {
      setLoading(false);
      setError('❌ This phone number is already registered globally! Please use Phone Login or Forgot Password.');
      return;
    }

    setLoading(false);

    // Generate & send OTP
    const code = generateOTP();
    setOtpCode(code);
    setOtpTargetPhone(cleanPhone);
    setPendingUserData({ name: cleanName, phone: cleanPhone, password });
    setStep('otp_verify');
  };

  const handleVerifySignupOTP = (e) => {
    e.preventDefault();
    setError('');

    if (inputOtp.trim() !== otpCode) {
      setError('❌ Incorrect OTP code. Please check the SMS box below.');
      return;
    }

    // OTP Verified -> Create Account
    const newUser = createUser(
      pendingUserData.name,
      pendingUserData.phone,
      pendingUserData.password
    );

    setPendingUserData(newUser);
    setStep('success');
  };

  // --- 2. REGULAR LOGIN (Phone or 6-digit Code + Password) ---
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setError('');

    const cleanIdent = loginIdentifier.trim();
    if (!cleanIdent) {
      setError('Please enter your 10-digit phone number or 6-digit login code');
      return;
    }

    const res = loginUser(cleanIdent, loginPassword);
    if (!res) {
      setError('❌ Account not found. Please check your phone number or create a new account.');
      return;
    }
    if (res.error === 'invalid_password') {
      setError('❌ Incorrect password! If you forgot it, use "Forgot Password / OTP Login".');
      return;
    }

    onLogin(res);
  };

  // --- 3. FORGOT PASSWORD / OTP LOGIN ---
  const handleRequestLoginOTP = (e) => {
    e.preventDefault();
    setError('');

    const cleanPhone = formatPhone(phone);
    if (cleanPhone.length !== 10) {
      setError('Please enter your 10-digit registered mobile phone number');
      return;
    }

    const existingUser = findUserByPhone(cleanPhone);
    if (!existingUser) {
      setError('❌ Phone number not found in system. Please check the number or create a new account.');
      return;
    }

    const code = generateOTP();
    setOtpCode(code);
    setOtpTargetPhone(cleanPhone);
    setPendingUserData(existingUser);
    setStep('otp_verify');
  };

  const handleVerifyLoginOTP = (e) => {
    e.preventDefault();
    setError('');

    if (inputOtp.trim() !== otpCode) {
      setError('❌ Incorrect OTP code. Please check the SMS box below.');
      return;
    }

    // OTP Verified -> Log user in directly
    const user = loginUser(pendingUserData.phone);
    if (user) {
      onLogin(user);
    } else {
      setError('Error logging in after verification. Please try again.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container" style={{ maxWidth: '440px' }}>
        <div className="login-logo">
          <span className="petals">🌸</span>
          <h1>ಸೊಬಗು</h1>
          <p className="subtitle">Sobagu · Learn Kannada</p>
        </div>

        <div className="glass-card login-card" style={{ padding: '2rem 1.75rem' }}>
          {/* Login Mode Tabs */}
          <div className="login-tabs" style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem' }}>
            <button
              className={`login-tab${tab === 'new' ? ' active' : ''}`}
              onClick={() => switchTab('new')}
              style={{ fontSize: '0.82rem', padding: '0.6rem 0.4rem' }}
            >
              🌱 Sign Up
            </button>
            <button
              className={`login-tab${tab === 'login' ? ' active' : ''}`}
              onClick={() => switchTab('login')}
              style={{ fontSize: '0.82rem', padding: '0.6rem 0.4rem' }}
            >
              🔑 Password Login
            </button>
            <button
              className={`login-tab${tab === 'otp_login' ? ' active' : ''}`}
              onClick={() => switchTab('otp_login')}
              style={{ fontSize: '0.82rem', padding: '0.6rem 0.4rem' }}
            >
              📱 Forgot / OTP
            </button>
          </div>

          {/* =================================================== */}
          {/* TAB 1: NEW ACCOUNT SIGNUP                           */}
          {/* =================================================== */}
          {tab === 'new' && (
            <>
              {step === 'input' && (
                <form onSubmit={handleRequestSignupOTP}>
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label">Full Name</label>
                    <input
                      className="form-input"
                      type="text"
                      placeholder="e.g. Priya Sharma, Rahul..."
                      value={name}
                      onChange={e => setName(e.target.value)}
                      maxLength={30}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label">Mobile Phone Number (10 Digits)</label>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 700 }}>+91</span>
                      <input
                        className="form-input"
                        type="tel"
                        placeholder="98765 43210"
                        value={phone}
                        onChange={e => setPhone(formatPhone(e.target.value))}
                        maxLength={10}
                        required
                        inputMode="numeric"
                      />
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                      🔒 One phone number can only create 1 account.
                    </span>
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                    <label className="form-label">Set Account Password</label>
                    <input
                      className="form-input"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      maxLength={30}
                      required
                    />
                  </div>

                  {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: 1.4 }}>{error}</p>}

                  <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%' }}>
                    {loading ? '⏳ Checking Availability...' : '📲 Send Verification OTP'}
                  </button>
                </form>
              )}

              {step === 'otp_verify' && (
                <form onSubmit={handleVerifySignupOTP}>
                  {/* SMS Simulation Banner */}
                  <div style={{
                    background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)',
                    padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '1.6rem', marginBottom: '0.2rem' }}>📱 SMS Received!</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      Sent to <strong>+91 {otpTargetPhone}</strong>
                    </div>
                    <div style={{
                      fontFamily: 'monospace', fontSize: '1.8rem', fontWeight: 900,
                      color: '#4ade80', letterSpacing: '4px', margin: '0.5rem 0'
                    }}>
                      {otpCode}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Enter this 6-digit verification code below:
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                    <label className="form-label">Enter 6-Digit OTP</label>
                    <input
                      className="form-input code-input"
                      type="text"
                      placeholder="_ _ _ _ _ _"
                      value={inputOtp}
                      onChange={e => setInputOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      maxLength={6}
                      autoFocus
                      inputMode="numeric"
                      required
                    />
                  </div>

                  {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>}

                  <button className="btn-primary" type="submit" style={{ width: '100%', marginBottom: '0.75rem' }}>
                    ✅ Verify & Create Account
                  </button>

                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer', width: '100%' }}
                    onClick={() => setStep('input')}
                  >
                    ← Change Name or Phone Number
                  </button>
                </form>
              )}

              {step === 'success' && (
                <div style={{ textAlign: 'center' }}>
                  <div className="welcome-user">
                    <div className="avatar">{pendingUserData?.name?.[0]?.toUpperCase()}</div>
                    <h3>Welcome, {pendingUserData?.name}! 🎉</h3>
                    <p style={{ color: 'var(--green-success)', fontWeight: 700, fontSize: '0.9rem' }}>
                      ✅ Phone (+91 {pendingUserData?.phone}) Verified & Linked!
                    </p>
                  </div>

                  <div className="code-display" style={{ margin: '1.25rem 0' }}>
                    <p className="code-label">🔐 Your Personal Login Code</p>
                    <span className="code-number">{pendingUserData?.code}</span>
                    <p className="code-note">You can log in anytime using your <strong>Phone Number</strong> or this <strong>6-digit Code</strong>.</p>
                  </div>

                  <button className="btn-primary" style={{ width: '100%' }} onClick={() => onLogin(pendingUserData)}>
                    🚀 Start Learning Kannada!
                  </button>
                </div>
              )}
            </>
          )}

          {/* =================================================== */}
          {/* TAB 2: REGULAR PASSWORD LOGIN                       */}
          {/* =================================================== */}
          {tab === 'login' && (
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Phone Number or 6-Digit Code</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="e.g. 9876543210 or 123456"
                  value={loginIdentifier}
                  onChange={e => setLoginIdentifier(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Password</label>
                <input
                  className="form-input"
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                />
              </div>

              {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: 1.4 }}>{error}</p>}

              <button className="btn-primary" type="submit" style={{ width: '100%', marginBottom: '1rem' }}>
                🔑 Enter Sobagu
              </button>

              <div style={{ textAlign: 'center' }}>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: 'var(--sakura-pink)', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => switchTab('otp_login')}
                >
                  ❓ Forgot Password? Login via Phone OTP →
                </button>
              </div>
            </form>
          )}

          {/* =================================================== */}
          {/* TAB 3: FORGOT PASSWORD / LOGIN VIA PHONE OTP       */}
          {/* =================================================== */}
          {tab === 'otp_login' && (
            <>
              {step === 'input' && (
                <form onSubmit={handleRequestLoginOTP}>
                  <div style={{ marginBottom: '1rem' }}>
                    <h4 style={{ color: 'var(--gold)', fontSize: '1rem', marginBottom: '0.3rem' }}>📱 Phone OTP Login</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Forgot your password or code? Enter your registered mobile number to receive an instant verification OTP.
                    </p>
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                    <label className="form-label">Registered Phone Number</label>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 700 }}>+91</span>
                      <input
                        className="form-input"
                        type="tel"
                        placeholder="98765 43210"
                        value={phone}
                        onChange={e => setPhone(formatPhone(e.target.value))}
                        maxLength={10}
                        required
                        inputMode="numeric"
                        autoFocus
                      />
                    </div>
                  </div>

                  {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: 1.4 }}>{error}</p>}

                  <button className="btn-primary" type="submit" style={{ width: '100%' }}>
                    📲 Send Login OTP
                  </button>
                </form>
              )}

              {step === 'otp_verify' && (
                <form onSubmit={handleVerifyLoginOTP}>
                  {/* SMS Simulation Banner */}
                  <div style={{
                    background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)',
                    padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '1.6rem', marginBottom: '0.2rem' }}>📱 SMS Received!</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      Sent to <strong>+91 {otpTargetPhone}</strong>
                    </div>
                    <div style={{
                      fontFamily: 'monospace', fontSize: '1.8rem', fontWeight: 900,
                      color: '#4ade80', letterSpacing: '4px', margin: '0.5rem 0'
                    }}>
                      {otpCode}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Enter this OTP to verify and log in instantly:
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                    <label className="form-label">Enter 6-Digit Login OTP</label>
                    <input
                      className="form-input code-input"
                      type="text"
                      placeholder="_ _ _ _ _ _"
                      value={inputOtp}
                      onChange={e => setInputOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      maxLength={6}
                      autoFocus
                      inputMode="numeric"
                      required
                    />
                  </div>

                  {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>}

                  <button className="btn-primary" type="submit" style={{ width: '100%', marginBottom: '0.75rem' }}>
                    🔓 Verify & Login
                  </button>

                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer', width: '100%' }}
                    onClick={() => setStep('input')}
                  >
                    ← Try another phone number
                  </button>
                </form>
              )}
            </>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          🔒 Secure Phone OTP Verification · 🌸 Sobagu Kannada Learn
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
