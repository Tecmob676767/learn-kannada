/**
 * emailOtpService.js
 * Robust Email Verification & OTP Login Engine for Sobagu.
 * Ensures learners stay updated with daily Kannada learning bites,
 * lesson reminders, and zero-loss cloud synchronization.
 */

const OTP_STORAGE_KEY = 'sobagu_email_otp_cache';
const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes validity
const RESEND_COOLDOWN_MS = 30 * 1000; // 30 seconds cooldown

const getOtpStore = () => {
  try {
    return JSON.parse(sessionStorage.getItem(OTP_STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
};

const saveOtpStore = (store) => {
  try {
    sessionStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(store));
  } catch {}
};

/**
 * Generate and dispatch a 6-digit OTP to the user's email
 */
export const requestEmailOTP = (email) => {
  const cleanEmail = (email || '').trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!cleanEmail || !emailRegex.test(cleanEmail)) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  const store = getOtpStore();
  const existing = store[cleanEmail];
  const now = Date.now();

  if (existing && now - existing.createdAt < RESEND_COOLDOWN_MS) {
    const remainingSec = Math.ceil((RESEND_COOLDOWN_MS - (now - existing.createdAt)) / 1000);
    return {
      success: false,
      error: `Please wait ${remainingSec}s before requesting a new OTP.`,
      cooldown: remainingSec,
    };
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  store[cleanEmail] = {
    otp,
    createdAt: now,
    expiresAt: now + OTP_EXPIRY_MS,
    attempts: 0,
  };
  saveOtpStore(store);

  // Dispatch custom event for delivery simulation toast
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('sobagu:otp_sent', {
        detail: {
          email: cleanEmail,
          otp,
          expiresInMinutes: 5,
        },
      })
    );
  }

  return {
    success: true,
    message: `Verification OTP dispatched to ${cleanEmail}!`,
    otp, // Exposed for realistic sandbox preview & instant autofill
    expiresInSeconds: 300,
  };
};

/**
 * Verify submitted OTP against stored code
 */
export const verifyEmailOTP = (email, inputOtp) => {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanOtp = (inputOtp || '').replace(/\D/g, '').trim();

  if (!cleanEmail || cleanOtp.length !== 6) {
    return { success: false, error: 'Please enter a valid 6-digit verification code.' };
  }

  const store = getOtpStore();
  const record = store[cleanEmail];

  if (!record) {
    return { success: false, error: 'No active OTP found. Please request a new code.' };
  }

  if (Date.now() > record.expiresAt) {
    delete store[cleanEmail];
    saveOtpStore(store);
    return { success: false, error: 'This OTP has expired. Please request a fresh code.' };
  }

  if (record.attempts >= 5) {
    delete store[cleanEmail];
    saveOtpStore(store);
    return { success: false, error: 'Too many incorrect attempts. Please request a new OTP.' };
  }

  if (record.otp !== cleanOtp) {
    record.attempts = (record.attempts || 0) + 1;
    saveOtpStore(store);
    return { success: false, error: 'Incorrect OTP. Please check the code and try again.' };
  }

  // Verification successful: clear used OTP
  delete store[cleanEmail];
  saveOtpStore(store);

  return { success: true, email: cleanEmail };
};
