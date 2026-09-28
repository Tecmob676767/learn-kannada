import nodemailer from 'nodemailer';

/**
 * api/send-otp.js
 * Vercel Serverless Function & Node.js Endpoint to send real OTP emails
 * to Gmail and other mail providers for Sobagu Kannada Learning.
 */

// Generate styled HTML email for real OTP delivery
export const createOtpEmailHtml = (otp) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sobagu Login Code</title>
</head>
<body style="margin: 0; padding: 24px; background-color: #120904; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff;">
  <div style="max-width: 520px; margin: 0 auto; background: linear-gradient(135deg, #1c0c02 0%, #2e1405 100%); border: 1.5px solid rgba(255, 107, 53, 0.4); border-radius: 20px; padding: 32px; box-shadow: 0 16px 40px rgba(0,0,0,0.6); text-align: center;">
    
    <!-- Crown Emblem & Title -->
    <div style="margin-bottom: 20px;">
      <div style="display: inline-block; width: 64px; height: 64px; line-height: 64px; border-radius: 50%; background: linear-gradient(135deg, #d90429, #ef233c); border: 2.5px solid #ffb703; font-size: 28px; font-weight: 900; color: #fff3b0;">
        ಸೊ
      </div>
      <h1 style="color: #ffb703; font-size: 28px; margin: 12px 0 4px 0; font-weight: 900; letter-spacing: -0.5px;">
        ಸೊಬಗು · Sobagu
      </h1>
      <p style="color: #ffa366; font-size: 14px; margin: 0; font-weight: 600;">
        Master Spoken &amp; Written Kannada
      </p>
    </div>

    <!-- OTP Code Box -->
    <div style="background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 163, 102, 0.25); border-radius: 16px; padding: 24px; margin: 24px 0;">
      <p style="color: #e2e8f0; font-size: 15px; margin: 0 0 16px 0;">
        Your One-Time Login Verification Code is:
      </p>
      <div style="background: #000000; border: 2px solid #ff6b35; border-radius: 12px; padding: 14px 24px; display: inline-block; margin-bottom: 14px;">
        <span style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 900; letter-spacing: 8px; color: #ffd700;">
          ${otp}
        </span>
      </div>
      <p style="color: #94a3b8; font-size: 13px; margin: 0; line-height: 1.5;">
        ⏱️ This code will expire in <strong style="color: #ffb703;">5 minutes</strong>.<br>
        Please enter it on your device to continue learning Kannada.
      </p>
    </div>

    <!-- Security Note -->
    <p style="color: #64748b; font-size: 12px; margin: 20px 0 0 0; line-height: 1.4;">
      🔒 Never share your login code with anyone. Sobagu will never ask for your code.<br>
      If you did not request this login code, you can safely ignore this email.
    </p>

    <!-- Footer -->
    <div style="border-top: 1px solid rgba(255,255,255,0.08); margin-top: 24px; padding-top: 16px; color: #64748b; font-size: 11px;">
      🌸 ಕನ್ನಡ ರಾಜ್ಯೋತ್ಸವ · Sobagu Kannada Learning App
    </div>
  </div>
</body>
</html>`;
};

// Dispatch email using available providers
export async function sendOtpEmail({ email, otp }) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanOtp = String(otp || '').trim();

  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    throw new Error('Invalid destination email address.');
  }
  if (!cleanOtp || cleanOtp.length !== 6) {
    throw new Error('Invalid OTP code. Must be 6 digits.');
  }

  const html = createOtpEmailHtml(cleanOtp);
  const subject = `Your Sobagu Kannada Login OTP: ${cleanOtp}`;

  // ── Strategy 1: Gmail SMTP / Custom SMTP via Nodemailer ───────────────────
  const gmailUser = process.env.GMAIL_USER || process.env.VITE_GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD || process.env.VITE_GMAIL_APP_PASSWORD;
  const smtpHost  = process.env.SMTP_HOST || (gmailUser ? 'smtp.gmail.com' : null);
  const smtpPort  = Number(process.env.SMTP_PORT) || 465;
  const smtpUser  = process.env.SMTP_USER || gmailUser;
  const smtpPass  = process.env.SMTP_PASS || gmailPass;

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transportConfig = (gmailUser && !process.env.SMTP_HOST)
        ? {
            service: 'gmail',
            auth: {
              user: gmailUser,
              pass: gmailPass,
            },
          }
        : {
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465,
            auth: {
              user: smtpUser,
              pass: smtpPass,
            },
          };
      const transporter = nodemailer.createTransport(transportConfig);

      const info = await transporter.sendMail({
        from: `"Sobagu Kannada" <${smtpUser}>`,
        to: cleanEmail,
        subject,
        html,
        text: `Your Sobagu Kannada Login OTP is: ${cleanOtp}. This code expires in 5 minutes.`,
      });

      return {
        success: true,
        provider: 'smtp',
        messageId: info.messageId,
        message: `Real OTP successfully delivered to ${cleanEmail}`,
      };
    } catch (err) {
      console.error('[Sobagu Email] SMTP dispatch failed:', err.message);
      // Fall through to next provider if SMTP fails
    }
  }

  // ── Strategy 2: Resend REST API ───────────────────────────────────────────
  const resendKey = process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY;
  if (resendKey) {
    try {
      const fromEmail = process.env.RESEND_FROM || 'Sobagu Kannada <onboarding@resend.dev>';
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [cleanEmail],
          subject,
          html,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Resend API error');

      return {
        success: true,
        provider: 'resend',
        id: data.id,
        message: `Real OTP successfully delivered to ${cleanEmail}`,
      };
    } catch (err) {
      console.error('[Sobagu Email] Resend dispatch failed:', err.message);
    }
  }

  // ── Strategy 3: Brevo (Sendinblue) REST API ───────────────────────────────
  const brevoKey = process.env.BREVO_API_KEY || process.env.VITE_BREVO_API_KEY;
  if (brevoKey) {
    try {
      const senderEmail = process.env.BREVO_SENDER || 'no-reply@sobagu.app';
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': brevoKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: { name: 'Sobagu Kannada', email: senderEmail },
          to: [{ email: cleanEmail }],
          subject,
          htmlContent: html,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Brevo API error');

      return {
        success: true,
        provider: 'brevo',
        messageId: data.messageId,
        message: `Real OTP successfully delivered to ${cleanEmail}`,
      };
    } catch (err) {
      console.error('[Sobagu Email] Brevo dispatch failed:', err.message);
    }
  }

  // If no email credentials configured:
  throw new Error(
    'NO_EMAIL_PROVIDER_CONFIGURED: Please configure GMAIL_USER and GMAIL_APP_PASSWORD, or BREVO_API_KEY, or RESEND_API_KEY in .env to send real emails.'
  );
}

// Default export handler for Vercel Serverless Function
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { email, otp } = body;

    const result = await sendOtpEmail({ email, otp });
    return res.status(200).json(result);
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }
}
