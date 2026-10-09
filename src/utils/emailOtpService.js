/**
 * emailOtpService.js
 * Real Email Verification & OTP Dispatch Engine for Sobagu.
 * Sends authentic one-time passwords directly to the learner's Gmail or email inbox
 * via Gmail SMTP (Nodemailer), Brevo, or Resend.
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
 * Dispatch real email to the user's Gmail / email address
 */
async function dispatchRealEmail({ email, otp }) {
  // 1. Try backend/serverless endpoint: /api/send-otp
  try {
    const res = await fetch('/api/send-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp }),
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok && data.success) {
      return { success: true, provider: data.provider || 'server' };
    }

    if (data.error && data.error.includes('NO_EMAIL_PROVIDER_CONFIGURED')) {
      return {
        success: false,
        notConfigured: true,
        error: 'Email service credentials not yet configured in .env. Please set GMAIL_USER and GMAIL_APP_PASSWORD, or BREVO_API_KEY, or RESEND_API_KEY.',
      };
    }

    if (data.error) {
      console.warn('[Sobagu OTP] /api/send-otp error:', data.error);
    }
  } catch (err) {
    console.warn('[Sobagu OTP] /api/send-otp network error:', err.message);
  }

  // 2. Direct client-side Brevo fallback if VITE_BREVO_API_KEY is defined
  const brevoKey = import.meta.env.VITE_BREVO_API_KEY;
  if (brevoKey) {
    try {
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': brevoKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: { name: 'Sobagu Kannada', email: import.meta.env.VITE_BREVO_SENDER || 'no-reply@sobagu.app' },
          to: [{ email }],
          subject: `Your Sobagu Kannada Login OTP: ${otp}`,
          htmlContent: `
            <div style="font-family: sans-serif; background: #1a0c02; color: #fff; padding: 24px; border-radius: 16px; max-width: 480px; margin: 0 auto; text-align: center;">
              <h2 style="color: #ffd700;">ಸೊಬಗು · Sobagu</h2>
              <p>Your real One-Time Password (OTP) for login is:</p>
              <div style="font-size: 36px; font-weight: 900; letter-spacing: 6px; color: #ff6b35; background: #000; padding: 12px; border-radius: 8px; margin: 16px 0;">
                ${otp}
              </div>
              <p style="font-size: 13px; color: #aaa;">Valid for 5 minutes. Do not share this code.</p>
            </div>
          `,
        }),
      });

      if (res.ok) {
        return { success: true, provider: 'brevo-client' };
      }
    } catch (e) {
      console.warn('[Sobagu OTP] Client-side Brevo failed:', e);
    }
  }

  // 3. Direct client-side Resend fallback if VITE_RESEND_API_KEY is defined
  const resendKey = import.meta.env.VITE_RESEND_API_KEY;
  if (resendKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Sobagu Kannada <onboarding@resend.dev>',
          to: [email],
          subject: `Your Sobagu Kannada Login OTP: ${otp}`,
          html: `<p>Your Sobagu Kannada Login OTP is: <strong>${otp}</strong>. Valid for 5 minutes.</p>`,
        }),
      });

      if (res.ok) {
        return { success: true, provider: 'resend-client' };
      }
    } catch (e) {
      console.warn('[Sobagu OTP] Client-side Resend failed:', e);
    }
  }

  return {
    success: false,
    notConfigured: true,
    error: 'No email service configured. Please add GMAIL_USER and GMAIL_APP_PASSWORD, or BREVO_API_KEY, or RESEND_API_KEY to .env to send real emails to Gmail.',
  };
}

/**
 * Generate and dispatch a REAL 6-digit OTP to the user's Gmail
 */
export const requestEmailOTP = async (email) => {
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

  // Generate cryptographically strong or pseudo-random 6-digit OTP
  let otp;
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const arr = new Uint32Array(1);
    window.crypto.getRandomValues(arr);
    otp = (100000 + (arr[0] % 900000)).toString();
  } else {
    otp = Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Attempt to dispatch real email to the user's Gmail / inbox
  const dispatchResult = await dispatchRealEmail({ email: cleanEmail, otp });

  // Store the generated OTP code in session store (NEVER expose otp to UI)
  store[cleanEmail] = {
    otp,
    createdAt: now,
    expiresAt: now + OTP_EXPIRY_MS,
    attempts: 0,
  };
  saveOtpStore(store);

  if (dispatchResult.success) {
    // ✅ Real email sent — do NOT return the otp value (security)
    return {
      success: true,
      provider: dispatchResult.provider,
      message: `✅ Verification code sent to ${cleanEmail}! Check your inbox (and Spam / Promotions folder).`,
      expiresInSeconds: 300,
    };
  }

  // Email dispatch failed — clear the stored OTP and report the error clearly
  delete store[cleanEmail];
  saveOtpStore(store);

  return {
    success: false,
    error: dispatchResult.error ||
      'Could not send OTP email. Make sure GMAIL_USER and GMAIL_APP_PASSWORD are set in your Vercel environment variables.',
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
    return { success: false, error: 'No active OTP found for this email. Please request a new verification code.' };
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
