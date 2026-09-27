import React, { useState, useEffect, useRef } from 'react';
import {
  Mail, KeyRound, CheckCircle, RefreshCw,
  Sparkles, ShieldCheck, AlertCircle, Copy, Check, Globe,
  Phone, User, Calendar, MapPin, Briefcase, Target, ChevronRight, ChevronLeft,
} from 'lucide-react';
import { createUser, loginUser, loginOrCreateGoogleUser, loginOrCreateEmailUser, updateUser } from '../utils/storage.js';
import { verifyControlCenterCode } from '../utils/adminConfig.js';
import { requestEmailOTP, verifyEmailOTP } from '../utils/emailOtpService.js';
import { playSuccess, playFanfare, playClick } from '../utils/soundEffects.js';

// ── Supported Native Languages ──────────────────────────────────────────────
const NATIVE_LANGUAGES = [
  { code: 'en', name: 'English',    nativeName: 'English',   flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi',      nativeName: 'हिन्दी',     flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil',      nativeName: 'தமிழ்',      flag: '🏴' },
  { code: 'te', name: 'Telugu',     nativeName: 'తెలుగు',     flag: '🏴' },
  { code: 'ml', name: 'Malayalam',  nativeName: 'മലയാളം',    flag: '🏴' },
  { code: 'mr', name: 'Marathi',    nativeName: 'मराठी',      flag: '🏴' },
  { code: 'gu', name: 'Gujarati',   nativeName: 'ગુજરાતી',    flag: '🏴' },
  { code: 'bn', name: 'Bengali',    nativeName: 'বাংলা',      flag: '🇧🇩' },
  { code: 'ur', name: 'Urdu',       nativeName: 'اردو',       flag: '🇵🇰' },
  { code: 'pa', name: 'Punjabi',    nativeName: 'ਪੰਜਾਬੀ',     flag: '🏴' },
  { code: 'or', name: 'Odia',       nativeName: 'ଓଡ଼ିଆ',      flag: '🏴' },
  { code: 'as', name: 'Assamese',   nativeName: 'অসমীয়া',    flag: '🏴' },
  { code: 'fr', name: 'French',     nativeName: 'Français',   flag: '🇫🇷' },
  { code: 'es', name: 'Spanish',    nativeName: 'Español',    flag: '🇪🇸' },
  { code: 'de', name: 'German',     nativeName: 'Deutsch',    flag: '🇩🇪' },
  { code: 'ar', name: 'Arabic',     nativeName: 'العربية',    flag: '🇸🇦' },
  { code: 'zh', name: 'Chinese',    nativeName: '中文',        flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese',   nativeName: '日本語',      flag: '🇯🇵' },
  { code: 'ko', name: 'Korean',     nativeName: '한국어',      flag: '🇰🇷' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português',  flag: '🇧🇷' },
  { code: 'ru', name: 'Russian',    nativeName: 'Русский',    flag: '🇷🇺' },
  { code: 'it', name: 'Italian',    nativeName: 'Italiano',   flag: '🇮🇹' },
];

const LEARNING_GOALS = [
  { id: 'speak',    label: 'Speak Kannada Daily',   icon: '🗣️', desc: 'Hold everyday conversations' },
  { id: 'work',     label: 'Use at Workplace',       icon: '💼', desc: 'Professional Kannada in office' },
  { id: 'culture',  label: 'Explore Culture',        icon: '🎭', desc: 'Literature, songs & festivals' },
  { id: 'family',   label: 'Connect with Family',    icon: '👨‍👩‍👧', desc: 'Talk to relatives in Kannada' },
  { id: 'travel',   label: 'Travel Karnataka',       icon: '🗺️', desc: 'Get around and read signs' },
  { id: 'study',    label: 'Academic / Exam Prep',   icon: '🎓', desc: 'School, college or govt exams' },
  { id: 'kids',     label: 'For My Kids',             icon: '🧸', desc: 'Teach children their roots' },
  { id: 'fun',      label: 'Just for Fun!',           icon: '🎉', desc: 'Casual learning, no pressure' },
];

const PROFESSIONS = [
  'Student', 'Software Engineer / IT', 'Teacher / Educator', 'Doctor / Healthcare',
  'Business / Entrepreneur', 'Government / Public Sector', 'Artist / Creative',
  'Homemaker', 'Retired', 'Other',
];

// ── Sobagu Logo SVG ─────────────────────────────────────────────────────────
const SobaguLogo = ({ size = 84 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="loginLogoBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#d90429" />
        <stop offset="50%" stopColor="#ef233c" />
        <stop offset="100%" stopColor="#8d0801" />
      </linearGradient>
      <linearGradient id="loginGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fff3b0" />
        <stop offset="50%" stopColor="#ffb703" />
        <stop offset="100%" stopColor="#fb8500" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="46" fill="url(#loginLogoBg)" stroke="url(#loginGoldGrad)" strokeWidth="4" />
    <circle cx="50" cy="50" r="40" stroke="url(#loginGoldGrad)" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.8" />
    <path d="M35 34 L42 42 L50 28 L58 42 L65 34 L62 50 L38 50 Z" fill="url(#loginGoldGrad)" />
    <circle cx="35" cy="32" r="2.5" fill="#fff" />
    <circle cx="50" cy="26" r="3" fill="#fff" />
    <circle cx="65" cy="32" r="2.5" fill="#fff" />
    <text x="50" y="74" textAnchor="middle" fill="url(#loginGoldGrad)" fontSize="28" fontWeight="900" fontFamily="Noto Sans Kannada, sans-serif">
      ಸೊ
    </text>
  </svg>
);

// ── Step Progress Bar ────────────────────────────────────────────────────────
const StepBar = ({ current, total }) => (
  <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginBottom: '1.5rem' }}>
    {Array.from({ length: total }, (_, i) => (
      <div key={i} style={{
        height: '4px', flex: 1, borderRadius: '2px', maxWidth: '48px',
        background: i < current ? 'var(--sakura-pink)' : i === current ? 'rgba(255,163,102,0.5)' : 'rgba(255,255,255,0.12)',
        transition: 'all 0.3s',
      }} />
    ))}
  </div>
);

// ── Main Component ───────────────────────────────────────────────────────────
const LoginPage = ({ onLogin, onOpenControlCenter }) => {
  /* ── Auth state ── */
  const [tab, setTab]                     = useState('email'); // 'email' | 'code' | 'new'
  const [email, setEmail]                 = useState('');
  const [otpStep, setOtpStep]             = useState(false);
  const [otpDigits, setOtpDigits]         = useState(['', '', '', '', '', '']);
  const [activeOtpCode, setActiveOtpCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [code, setCode]                   = useState('');
  const [error, setError]                 = useState('');
  const [successMsg, setSuccessMsg]       = useState('');
  const [loading, setLoading]             = useState(false);
  const [generatedCode, setGeneratedCode] = useState(null);
  const [newUser, setNewUser]             = useState(null);
  const [copied, setCopied]               = useState(false);
  const otpInputsRef                      = useRef([]);

  /* ── Onboarding wizard state ── */
  // Shown after authentication completes (new or existing users)
  const [onboardingUser, setOnboardingUser] = useState(null); // user object to onboard
  const [onboardStep, setOnboardStep]       = useState(0);    // 0..N-1
  const [isNewAccount, setIsNewAccount]     = useState(false);

  // Collected profile fields
  const [obName, setObName]               = useState('');
  const [obNativeLang, setObNativeLang]   = useState('en');
  const [obDob, setObDob]                 = useState('');
  const [obPhone, setObPhone]             = useState('');
  const [obGender, setObGender]           = useState('');
  const [obProfession, setObProfession]   = useState('');
  const [obState, setObState]             = useState('');
  const [obCountry, setObCountry]         = useState('India');
  const [obGoal, setObGoal]               = useState('');
  const [obGoalDesc, setObGoalDesc]       = useState('');

  const ONBOARD_STEPS = isNewAccount ? 5 : 3; // new users see more steps

  // ── Keyboard shortcut for Control Center ──────────────────────────────────
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

  // ── Resend cooldown ───────────────────────────────────────────────────────
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => setResendCooldown(c => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // ── OTP simulation event ─────────────────────────────────────────────────
  useEffect(() => {
    const handleOtpEvent = (e) => { if (e.detail?.otp) setActiveOtpCode(e.detail.otp); };
    window.addEventListener('sobagu:otp_sent', handleOtpEvent);
    return () => window.removeEventListener('sobagu:otp_sent', handleOtpEvent);
  }, []);

  // ── Google Identity Services ─────────────────────────────────────────────
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;
    const handleCredentialResponse = async (response) => {
      try {
        const payload = JSON.parse(atob(response.credential.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        const user = await loginOrCreateGoogleUser(payload);
        if (user) {
          if (user.banned) { setError(`🚫 ${user.reason || 'Account suspended.'}`); return; }
          playSuccess();
          startOnboarding(user, !user.dob); // new if no DOB collected yet
        }
      } catch (err) { console.error('Google credential handling failed', err); }
    };
    const t = setTimeout(() => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({ client_id: clientId, callback: handleCredentialResponse });
        const container = document.getElementById('google-signin-button');
        if (container) window.google.accounts.id.renderButton(container, { theme: 'outline', size: 'large', width: '280' });
      }
    }, 300);
    return () => clearTimeout(t);
  }, [onLogin]);

  // ── Start onboarding ──────────────────────────────────────────────────────
  const startOnboarding = (user, isNew = false) => {
    setOnboardingUser(user);
    setIsNewAccount(isNew);
    setOnboardStep(0);
    // Pre-fill from existing data
    setObName(user.name || '');
    setObNativeLang(user.settings?.nativeLang || 'en');
    setObDob(user.dob || '');
    setObPhone(user.phone || '');
    setObGender(user.gender || '');
    setObProfession(user.profession || '');
    setObState(user.state || '');
    setObCountry(user.country || 'India');
    setObGoal(user.learningGoal || '');
    setObGoalDesc('');
  };

  // ── Save onboarding data and enter app ───────────────────────────────────
  const finishOnboarding = () => {
    if (!onboardingUser) return;
    const profileUpdate = {
      name: obName.trim() || onboardingUser.name,
      dob: obDob || null,
      phone: obPhone || null,
      gender: obGender || null,
      profession: obProfession || null,
      state: obState || null,
      country: obCountry || null,
      learningGoal: obGoal || null,
      settings: {
        ...(onboardingUser.settings || {}),
        nativeLang: obNativeLang,
      },
      onboardingComplete: true,
    };
    const updated = updateUser(profileUpdate);
    playFanfare();
    onLogin(updated || { ...onboardingUser, ...profileUpdate });
  };

  // ── OTP send ─────────────────────────────────────────────────────────────
  const handleSendOTP = (e) => {
    e?.preventDefault();
    setError(''); setSuccessMsg('');
    const cleanEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) { setError('Please enter a valid email address.'); return; }
    setLoading(true);
    const res = requestEmailOTP(cleanEmail);
    setLoading(false);
    if (res.success) {
      playClick();
      setOtpStep(true);
      setActiveOtpCode(res.otp);
      setResendCooldown(30);
      setSuccessMsg(`OTP sent to ${cleanEmail}`);
      setTimeout(() => { if (otpInputsRef.current[0]) otpInputsRef.current[0].focus(); }, 150);
    } else { setError(res.error || 'Failed to send OTP.'); }
  };

  const handleOtpChange = (index, value) => {
    const val = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = val;
    setOtpDigits(newDigits);
    if (val && index < 5 && otpInputsRef.current[index + 1]) otpInputsRef.current[index + 1].focus();
    const fullCode = newDigits.join('');
    if (fullCode.length === 6) handleVerifyOTP(fullCode);
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
    if (pasted.length === 6) handleVerifyOTP(pasted);
    else { const nextIdx = Math.min(pasted.length, 5); if (otpInputsRef.current[nextIdx]) otpInputsRef.current[nextIdx].focus(); }
  };

  const handleVerifyOTP = async (codeToVerify) => {
    const enteredOtp = codeToVerify || otpDigits.join('');
    if (enteredOtp.length !== 6) { setError('Please enter all 6 digits.'); return; }
    setError(''); setLoading(true);
    const check = verifyEmailOTP(email, enteredOtp);
    if (!check.success) { setLoading(false); setError(check.error || 'Invalid OTP.'); return; }
    try {
      const user = await loginOrCreateEmailUser(email, '');
      setLoading(false);
      if (!user) { setError('Could not initialize account.'); return; }
      if (user.banned) { setError(`🚫 ${user.reason || 'Account suspended.'}`); return; }
      startOnboarding(user, !user.onboardingComplete);
    } catch { setLoading(false); setError('Authentication failed. Check your network.'); }
  };

  const handleQuickFillOTP = () => {
    if (!activeOtpCode) return;
    const digits = activeOtpCode.split('').slice(0, 6);
    setOtpDigits(digits);
    handleVerifyOTP(activeOtpCode);
  };

  // ── 6-digit code login ───────────────────────────────────────────────────
  const handleReturning = async (e) => {
    e.preventDefault(); setError('');
    const trimmed = code.replace(/\D/g, '').trim();
    if (verifyControlCenterCode(trimmed)) { onOpenControlCenter?.(); return; }
    if (trimmed.length !== 6) { setError('Please enter your 6-digit login code'); return; }
    setLoading(true);
    try {
      const user = await loginUser(trimmed);
      if (!user) { setError('❌ Code not found. Double-check your 6-digit code!'); return; }
      if (user.banned) { setError(`🚫 ${user.reason || 'Account suspended.'}`); return; }
      playSuccess();
      startOnboarding(user, !user.onboardingComplete);
    } catch { setError('❌ Login failed. Check your network.'); }
    finally { setLoading(false); }
  };

  // ── Quick anonymous account ──────────────────────────────────────────────
  const handleNewUser = (e) => {
    e.preventDefault(); setError('');
    const nameVal = obName.trim();
    if (!nameVal || nameVal.length < 2) { setError('Please enter your name (at least 2 characters)'); return; }
    // We'll create the user after onboarding
    const tempUser = { code: null, name: nameVal, _pendingCreate: true };
    setNewUser(tempUser);
    setIsNewAccount(true);
    setOnboardingUser(tempUser);
    setOnboardStep(0);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Onboarding wizard ────────────────────────────────────────────────────
  const advanceOnboard = () => {
    if (onboardStep < ONBOARD_STEPS - 1) setOnboardStep(s => s + 1);
    else completeOnboard();
  };

  const completeOnboard = () => {
    // If this is a pending (quick-create) account, create it now with profile
    if (onboardingUser?._pendingCreate) {
      const profile = {
        nativeLang: obNativeLang,
        dob: obDob,
        phone: obPhone,
        gender: obGender,
        profession: obProfession,
        state: obState,
        country: obCountry,
        learningGoal: obGoal,
      };
      const user = createUser(obName.trim(), profile);
      setGeneratedCode(user.code);
      setNewUser(user);
      setOnboardingUser(user);
      // Show code display step
      setOnboardStep(ONBOARD_STEPS); // special "done" step
      return;
    }
    finishOnboarding();
  };

  // ── Render onboarding wizard ─────────────────────────────────────────────
  if (onboardingUser && onboardStep <= ONBOARD_STEPS) {
    // Special done step for quick accounts
    if (onboardStep === ONBOARD_STEPS && generatedCode) {
      return (
        <div className="login-page">
          <div className="login-container">
            <div className="login-logo">
              <SobaguLogo size={68} />
              <h1>ಸೊಬಗು</h1>
            </div>
            <div className="glass-card login-card" style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎉</div>
              <h2 style={{ fontWeight: 900, marginBottom: '0.4rem' }}>Welcome, {obName || newUser?.name}!</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                Your Kannada journey begins now. Save your code to login from any device!
              </p>
              <div className="code-display" style={{ marginBottom: '1.5rem' }}>
                <p className="code-label">🔐 Your Personal Login Code</p>
                <span className="code-number">{generatedCode}</span>
                <button className="copy-btn" onClick={handleCopy}>
                  {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy Code</>}
                </button>
              </div>
              <button
                className="btn-primary"
                onClick={() => onLogin(newUser)}
                style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', fontWeight: 800 }}
              >
                🚀 Start Learning Kannada!
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Wizard steps
    const stepContent = () => {
      // Step 0: Language selection (ALWAYS shown — most important!)
      if (onboardStep === 0) return (
        <div>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🌍</div>
            <h2 style={{ fontWeight: 900, fontSize: '1.3rem', marginBottom: '0.3rem' }}>
              Which language do you speak?
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
              We'll teach you Kannada using translations in your language.
            </p>
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px,1fr))',
            gap: '0.5rem', maxHeight: '300px', overflowY: 'auto',
          }}>
            {NATIVE_LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => setObNativeLang(lang.code)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.6rem 0.8rem', borderRadius: '12px', cursor: 'pointer',
                  background: obNativeLang === lang.code ? 'rgba(255,107,53,0.2)' : 'rgba(255,255,255,0.05)',
                  border: obNativeLang === lang.code ? '2px solid var(--sakura-pink)' : '1px solid rgba(255,255,255,0.1)',
                  color: '#fff', textAlign: 'left', transition: 'all 0.15s',
                  fontWeight: obNativeLang === lang.code ? 800 : 400,
                  boxShadow: obNativeLang === lang.code ? '0 0 14px rgba(255,107,53,0.35)' : 'none',
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>{lang.flag}</span>
                <div>
                  <div style={{ fontSize: '0.8rem', lineHeight: 1.2 }}>{lang.nativeName}</div>
                  <div style={{ fontSize: '0.65rem', opacity: 0.5 }}>{lang.name}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      );

      // Step 1: Basic profile (name, DOB, gender, phone)
      if (onboardStep === 1) return (
        <div>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>👤</div>
            <h2 style={{ fontWeight: 900, fontSize: '1.3rem', marginBottom: '0.3rem' }}>Tell us about yourself</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>This helps us personalize your learning experience.</p>
          </div>

          {/* Name */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}><User size={13} /> Your Name</label>
            <input
              className="form-input" type="text" placeholder="e.g. Priya, Rahul, Arjun..."
              value={obName} onChange={e => setObName(e.target.value)} maxLength={30}
              style={inputStyle}
            />
          </div>

          {/* DOB */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}><Calendar size={13} /> Date of Birth</label>
            <input
              className="form-input" type="date"
              value={obDob} onChange={e => setObDob(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              style={inputStyle}
            />
          </div>

          {/* Gender */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}><User size={13} /> Gender</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.35rem' }}>
              {['Male', 'Female', 'Non-binary', 'Prefer not to say'].map(g => (
                <button
                  key={g}
                  onClick={() => setObGender(g)}
                  style={pillStyle(obGender === g)}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Phone */}
          <div style={{ marginBottom: '0.5rem' }}>
            <label style={labelStyle}><Phone size={13} /> Phone Number <span style={{ opacity: 0.5 }}>(optional)</span></label>
            <input
              className="form-input" type="tel" placeholder="+91 98765 43210"
              value={obPhone} onChange={e => setObPhone(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>
      );

      // Step 2: Location & Profession
      if (onboardStep === 2) return (
        <div>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🌏</div>
            <h2 style={{ fontWeight: 900, fontSize: '1.3rem', marginBottom: '0.3rem' }}>Where are you from?</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>Helps us show you region-relevant Kannada content.</p>
          </div>

          {/* State */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}><MapPin size={13} /> State / Region</label>
            <input
              className="form-input" type="text" placeholder="e.g. Karnataka, Tamil Nadu, Maharashtra..."
              value={obState} onChange={e => setObState(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Country */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}><Globe size={13} /> Country</label>
            <input
              className="form-input" type="text" placeholder="e.g. India, USA, UK..."
              value={obCountry} onChange={e => setObCountry(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Profession */}
          <div style={{ marginBottom: '0.5rem' }}>
            <label style={labelStyle}><Briefcase size={13} /> What do you do?</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.35rem' }}>
              {PROFESSIONS.map(p => (
                <button key={p} onClick={() => setObProfession(p)} style={pillStyle(obProfession === p)}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      );

      // Step 3: Learning Goal
      if (onboardStep === 3) return (
        <div>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎯</div>
            <h2 style={{ fontWeight: 900, fontSize: '1.3rem', marginBottom: '0.3rem' }}>Why learn Kannada?</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>Choose your main goal — we'll tailor your path!</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
            {LEARNING_GOALS.map(g => (
              <button
                key={g.id}
                onClick={() => setObGoal(g.id)}
                style={{
                  padding: '0.85rem', borderRadius: '14px', cursor: 'pointer', textAlign: 'left',
                  background: obGoal === g.id ? 'rgba(255,107,53,0.2)' : 'rgba(255,255,255,0.05)',
                  border: obGoal === g.id ? '2px solid var(--sakura-pink)' : '1px solid rgba(255,255,255,0.1)',
                  color: '#fff', transition: 'all 0.15s',
                  boxShadow: obGoal === g.id ? '0 0 16px rgba(255,107,53,0.3)' : 'none',
                }}
              >
                <div style={{ fontSize: '1.3rem', marginBottom: '0.2rem' }}>{g.icon}</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, lineHeight: 1.2 }}>{g.label}</div>
                <div style={{ fontSize: '0.68rem', opacity: 0.6, marginTop: '0.15rem' }}>{g.desc}</div>
              </button>
            ))}
          </div>
        </div>
      );

      // Step 4: Summary confirmation (only for new accounts)
      if (onboardStep === 4) return (
        <div>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>✨</div>
            <h2 style={{ fontWeight: 900, fontSize: '1.3rem', marginBottom: '0.3rem' }}>All set!</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>Here's your profile summary. You can always update these in Settings.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {[
              { icon: '👤', label: 'Name', value: obName },
              { icon: '🌍', label: 'Learning in', value: NATIVE_LANGUAGES.find(l => l.code === obNativeLang)?.name + ' → Kannada' },
              { icon: '📅', label: 'Date of Birth', value: obDob || '—' },
              { icon: '📱', label: 'Phone', value: obPhone || '—' },
              { icon: '⚥', label: 'Gender', value: obGender || '—' },
              { icon: '💼', label: 'Profession', value: obProfession || '—' },
              { icon: '📍', label: 'Location', value: [obState, obCountry].filter(Boolean).join(', ') || '—' },
              { icon: '🎯', label: 'Goal', value: LEARNING_GOALS.find(g => g.id === obGoal)?.label || '—' },
            ].map(row => (
              <div key={row.label} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.6rem 0.9rem', borderRadius: '10px', background: 'rgba(255,255,255,0.05)',
              }}>
                <span style={{ fontSize: '1.1rem', width: '24px', textAlign: 'center' }}>{row.icon}</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', minWidth: '90px' }}>{row.label}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      );

      return null;
    };

    const canAdvance = () => {
      if (onboardStep === 0) return !!obNativeLang;
      if (onboardStep === 1) return (obName.trim().length >= 2);
      return true; // steps 2, 3, 4 are optional / always ok
    };

    const stepLabels = isNewAccount
      ? ['Language', 'Profile', 'Location', 'Goal', 'Summary']
      : ['Language', 'Profile', 'Goal'];

    return (
      <div className="login-page">
        <div className="login-container" style={{ maxWidth: '520px' }}>
          <div className="login-logo" style={{ marginBottom: '1rem' }}>
            <SobaguLogo size={54} />
            <h1 style={{ fontSize: '1.5rem' }}>ಸೊಬಗು</h1>
          </div>

          <div className="glass-card login-card" style={{ padding: '1.75rem' }}>
            {/* Step label */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Step {onboardStep + 1} of {ONBOARD_STEPS} · {stepLabels[onboardStep]}
              </span>
              {onboardStep > 0 && (
                <button
                  onClick={() => setOnboardStep(s => s - 1)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem' }}
                >
                  <ChevronLeft size={14} /> Back
                </button>
              )}
            </div>

            <StepBar current={onboardStep} total={ONBOARD_STEPS} />

            {/* Step content */}
            {stepContent()}

            {/* CTA */}
            <button
              className="btn-primary"
              onClick={advanceOnboard}
              disabled={!canAdvance()}
              style={{
                width: '100%', padding: '0.9rem', marginTop: '1.5rem',
                fontWeight: 800, fontSize: '0.95rem',
                opacity: canAdvance() ? 1 : 0.5,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              }}
            >
              {onboardStep === ONBOARD_STEPS - 1
                ? (onboardingUser._pendingCreate ? '🌸 Create My Account' : '🚀 Enter Sobagu!')
                : (<>Continue <ChevronRight size={16} /></>)
              }
            </button>

            {/* Skip option for optional steps */}
            {onboardStep >= 2 && (
              <button
                onClick={advanceOnboard}
                style={{ width: '100%', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.78rem', marginTop: '0.5rem', textDecoration: 'underline' }}
              >
                Skip this step
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Login / Auth Screen ───────────────────────────────────────────────────
  return (
    <div className="login-page">
      <div className="login-container">
        {/* Logo */}
        <div className="login-logo">
          <div className="petals" style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
            <SobaguLogo size={84} />
          </div>
          <h1>ಸೊಬಗು</h1>
          <p className="subtitle">Sobagu · Master Spoken & Written Kannada</p>
        </div>

        {/* Google Sign-In */}
        <div style={{ display: 'flex', justifyContent: 'center', margin: '0.8rem 0' }}>
          <div id="google-signin-button" />
        </div>

        <div className="glass-card login-card" style={{ padding: '1.5rem', borderRadius: '20px' }}>
          {/* Tabs */}
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

          {/* ── TAB 1: EMAIL OTP ── */}
          {tab === 'email' && (
            <div>
              {!otpStep ? (
                <form onSubmit={handleSendOTP}>
                  <div style={{ background: 'linear-gradient(135deg,rgba(255,107,53,0.12),rgba(79,172,254,0.08))', border: '1px solid rgba(255,107,53,0.3)', borderRadius: '14px', padding: '0.9rem', marginBottom: '1.1rem' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--sakura-pink)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
                      <Sparkles size={16} /> Sign in with Email
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.4 }}>
                      Get a one-time code, cloud sync across all your devices, and daily Kannada tips.
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Mail size={14} color="var(--sakura-pink)" /> Email Address
                    </label>
                    <input className="form-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} autoFocus required style={{ fontSize: '0.95rem' }} />
                  </div>
                  {error && <ErrorBox msg={error} />}
                  <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', padding: '0.85rem' }}>
                    {loading ? 'Sending...' : 'Send Verification OTP 📧'}
                  </button>
                </form>
              ) : (
                <div>
                  <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#ff6b35,#ffa366)', margin: '0 auto 0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ShieldCheck size={24} color="#fff" />
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Verify Your Email</h3>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'rgba(255,255,255,0.65)' }}>
                      Enter the 6-digit code sent to <strong style={{ color: 'var(--sakura-pink)' }}>{email}</strong>
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.45rem', justifyContent: 'center', marginBottom: '1.2rem' }} onPaste={handleOtpPaste}>
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx} ref={el => otpInputsRef.current[idx] = el}
                        type="text" inputMode="numeric" maxLength={1} value={digit}
                        onChange={e => handleOtpChange(idx, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(idx, e)}
                        style={{ width: '44px', height: '52px', borderRadius: '12px', background: digit ? 'rgba(255,107,53,0.15)' : 'rgba(255,255,255,0.08)', border: `1.5px solid ${digit ? 'var(--sakura-pink)' : 'var(--glass-border)'}`, color: '#fff', fontSize: '1.4rem', fontWeight: 900, textAlign: 'center', outline: 'none' }}
                      />
                    ))}
                  </div>
                  {activeOtpCode && (
                    <div style={{ background: 'rgba(67,233,123,0.12)', border: '1px solid rgba(67,233,123,0.35)', borderRadius: '12px', padding: '0.7rem 0.9rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <div style={{ fontSize: '0.78rem', color: '#43e97b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <CheckCircle size={15} /> OTP: <strong style={{ letterSpacing: '2px' }}>{activeOtpCode}</strong>
                      </div>
                      <button type="button" onClick={handleQuickFillOTP} style={{ background: 'linear-gradient(135deg,#43e97b,#38f9d7)', border: 'none', borderRadius: '8px', padding: '0.3rem 0.6rem', color: '#0f381e', fontWeight: 800, fontSize: '0.72rem', cursor: 'pointer' }}>Autofill</button>
                    </div>
                  )}
                  {error && <ErrorBox msg={error} />}
                  <button className="btn-primary" type="button" onClick={() => handleVerifyOTP()} disabled={loading} style={{ width: '100%', padding: '0.85rem', marginBottom: '0.8rem' }}>
                    {loading ? 'Verifying...' : 'Verify & Enter Sobagu ✨'}
                  </button>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)' }}>
                    <button type="button" onClick={() => { setOtpStep(false); setError(''); }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', textDecoration: 'underline' }}>Change Email</button>
                    <button type="button" disabled={resendCooldown > 0} onClick={handleSendOTP} style={{ background: 'none', border: 'none', color: resendCooldown > 0 ? 'rgba(255,255,255,0.35)' : 'var(--sakura-pink)', fontWeight: 700, cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <RefreshCw size={12} /> {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── TAB 2: 6-DIGIT CODE ── */}
          {tab === 'code' && (
            <form onSubmit={handleReturning}>
              <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                <label className="form-label">Enter Your 6-Digit Code</label>
                <input
                  id="input-login-code" className="form-input code-input" type="text"
                  placeholder="e.g. 849201" value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 12))}
                  maxLength={12} autoFocus inputMode="numeric" disabled={loading}
                  style={{ fontSize: '1.3rem', letterSpacing: '4px', textAlign: 'center', fontWeight: 900 }}
                />
              </div>
              {loading && <div style={{ textAlign: 'center', margin: '0.5rem 0', fontSize: '0.85rem', color: '#4facfe', fontWeight: 600 }}>☁️ Syncing from Cloud...</div>}
              {error && <ErrorBox msg={error} />}
              <button id="btn-login" className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', padding: '0.85rem' }}>
                {loading ? '☁️ Syncing...' : '🔑 Log In With Code'}
              </button>
            </form>
          )}

          {/* ── TAB 3: QUICK / NEW ── */}
          {tab === 'new' && (
            <form onSubmit={handleNewUser}>
              <div style={{ background: 'rgba(255,107,53,0.08)', border: '1px solid rgba(255,107,53,0.25)', borderRadius: '12px', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                ⚡ Quick start — no email needed. You'll get a 6-digit code to save your progress across devices.
              </div>
              <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                <label className="form-label"><User size={13} /> Your Name</label>
                <input
                  id="input-name" className="form-input" type="text"
                  placeholder="e.g. Priya, Rahul, Arjun..."
                  value={obName} onChange={e => setObName(e.target.value)}
                  autoFocus maxLength={30} style={{ fontSize: '0.95rem' }}
                />
              </div>
              {error && <ErrorBox msg={error} />}
              <button id="btn-create-account" className="btn-primary" type="submit" style={{ width: '100%', padding: '0.85rem' }}>
                🌸 Continue & Setup Profile
              </button>
            </form>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          🌸 ಕನ್ನಡ ರಾಜ್ಯೋತ್ಸವ · Verified Login · Zero Passwords
        </p>
      </div>
    </div>
  );
};

// ── Shared styles ─────────────────────────────────────────────────────────────
const labelStyle = {
  display: 'flex', alignItems: 'center', gap: '0.35rem',
  fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 600,
};
const inputStyle = { fontSize: '0.95rem', width: '100%' };
const pillStyle = (active) => ({
  padding: '0.35rem 0.8rem', borderRadius: '20px', cursor: 'pointer', fontSize: '0.78rem',
  fontWeight: active ? 700 : 400,
  background: active ? 'rgba(255,107,53,0.25)' : 'rgba(255,255,255,0.07)',
  border: active ? '1.5px solid var(--sakura-pink)' : '1px solid rgba(255,255,255,0.12)',
  color: '#fff', transition: 'all 0.15s',
  boxShadow: active ? '0 0 10px rgba(255,107,53,0.3)' : 'none',
});

const ErrorBox = ({ msg }) => (
  <div style={{ background: 'rgba(239,35,60,0.15)', border: '1px solid rgba(239,35,60,0.4)', borderRadius: '10px', padding: '0.6rem 0.8rem', color: '#ff5858', fontSize: '0.82rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
    <AlertCircle size={15} /> {msg}
  </div>
);

export default LoginPage;
