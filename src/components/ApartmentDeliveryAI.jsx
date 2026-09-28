import React, { useState } from 'react';
import { speakKannada } from '../utils/tts.js';
import { playSuccess, playClick, playFanfare } from '../utils/soundEffects.js';

const SCENARIOS = [
  {
    id: 'delivery_gate',
    category: 'Swiggy / Zomato Call',
    icon: '🛵',
    titleKn: 'ಡೆಲಿವರಿ ಬಾಯ್ ಕಾಲ್ (Delivery Partner Call)',
    incomingKn: 'ಸರ್, ನಾನು ಸ್ವಿಗ್ಗಿ ಡೆಲಿವರಿಯಿಂದ ಕಾಲ್ ಮಾಡ್ತಾ ಇದ್ದೀನಿ. ಅಪಾರ್ಟ್‌ಮೆಂಟ್ ಗೇಟ್ ಹತ್ರ ಇದ್ದೀನಿ, ಸೆಕ್ಯುರಿಟಿ ಒಳಗೆ ಬಿಡ್ತಿಲ್ಲ!',
    incomingEn: 'Sir, I am calling from Swiggy delivery. I am at the apartment gate, security is not letting me inside!',
    options: [
      {
        textKn: 'ಸೆಕ್ಯುರಿಟಿಗೆ ಫೋನ್ ಕೊಡಿ, ನಾನು ಮಾತಾಡ್ತೀನಿ.',
        textEn: 'Give the phone to security, I will speak.',
        score: 100,
        replyKn: 'ಆಯ್ತು ಸರ್, ಅವರಿಗೆ ಫೋನ್ ಕೊಡ್ತೀನಿ, ಥ್ಯಾಂಕ್ಸ್!',
        replyEn: 'Okay sir, giving phone to him, thanks!',
        tip: 'Best way to resolve security check without walking all the way down!'
      },
      {
        textKn: 'ಪಾರ್ಸೆಲ್ ಅನ್ನು ಸೆಕ್ಯುರಿಟಿ ಡೆಸ್ಕ್ ಹತ್ತಿರ ಇಟ್ಟು ಹೋಗಿ.',
        textEn: 'Leave the parcel near the security desk and go.',
        score: 95,
        replyKn: 'ಸರಿ ಸರ್, ಗೇಟ್ ಟೇಬಲ್ ಮೇಲೆ ಇಟ್ಟು ಫೋಟೋ ಕಳಿಸ್ತೀನಿ.',
        replyEn: 'Fine sir, placing on gate table and sending photo.',
        tip: 'Very common in high-rise societies with gate drop-boxes.'
      },
      {
        textKn: 'ನನಗೆ ಕನ್ನಡ ಬರಲ್ಲ, ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಮಾತಾಡಿ.',
        textEn: 'I do not know Kannada, speak in English.',
        score: 40,
        replyKn: 'ಸರ್, ಸಿಗ್ನಲ್ ಕಟ್ ಆಗ್ತಿದೆ, ಅರ್ಥ ಆಗ್ತಿಲ್ಲ...',
        replyEn: 'Sir, audio cutting, I cannot understand...',
        tip: 'Using basic Kannada phrases helps delivery partners instantly!'
      }
    ]
  },
  {
    id: 'otp_verification',
    category: 'OTP Verification',
    icon: '🔢',
    titleKn: 'ಓಟಿಪಿ ಹೇಳಿ (Tell the Delivery OTP)',
    incomingKn: 'ಸರ್, ಆರ್ಡರ್ ಕೊಡೋಕೆ ಓಟಿಪಿ (OTP) ಹೇಳಿ ದಯವಿಟ್ಟು.',
    incomingEn: 'Sir, please tell the OTP to deliver the order.',
    options: [
      {
        textKn: 'ಓಟಿಪಿ: ಎಂಟು, ಎರಡು, ನಾಲ್ಕು, ಆರು (8 2 4 6)',
        textEn: 'OTP: Eight, Two, Four, Six (8 2 4 6)',
        score: 100,
        replyKn: 'ಕರೆಕ್ಟ್ ಸರ್! ವೆರಿಫೈ ಆಯಿತು. ಊಟ ತಗೊಳ್ಳಿ, ಥ್ಯಾಂಕ್ ಯು!',
        replyEn: 'Correct sir! Verified. Please take food, thank you!',
        tip: 'Reciting single-digit Kannada numbers (ಒಂದು, ಎರಡು, ಮೂರು...) makes OTP handoffs effortless.'
      },
      {
        textKn: 'ಒಂದು ನಿಮಿಷ ಮೊಬೈಲ್ ನೋಡಿ ಹೇಳ್ತೀನಿ.',
        textEn: 'Wait one minute, I will check phone and say.',
        score: 85,
        replyKn: 'ಆಯ್ತು ಸರ್, ನೋಡಿ ನಿಧಾನವಾಗಿ ಹೇಳಿ.',
        replyEn: 'Okay sir, check and say comfortably.',
        tip: '"Ondu nimisha" (one minute) buys you time politely.'
      }
    ]
  },
  {
    id: 'gate_security',
    category: 'Apartment Security',
    icon: '👮',
    titleKn: 'ಸೆಕ್ಯುರಿಟಿ ಗೇಟ್ ಚೆಕ್ (Security Guard Chat)',
    incomingKn: 'ಸರ್, ಯಾವ ಫ್ಲಾಟ್‌ಗೆ ಹೋಗ್ಬೇಕು? ರಿಜಿಸ್ಟರ್‌ನಲ್ಲಿ ಎಂಟ್ರಿ ಮಾಡಿ.',
    incomingEn: 'Sir, which flat do you need to visit? Please enter in the register.',
    options: [
      {
        textKn: 'ನಾನು ಬ್ಲಾಕ್-ಬಿ, ಫ್ಲಾಟ್ ೪೦೨ (ನಾಲ್ಕು ನೂರ ಎರಡು) ಗೆ ಹೋಗ್ಬೇಕು.',
        textEn: 'I need to go to Block-B, Flat 402 (Four Hundred Two).',
        score: 100,
        replyKn: 'ಸರಿ ಸರ್, ಲಿಫ್ಟ್ ಬಲಗಡೆ ಇದೆ, ಹೋಗಿ.',
        replyEn: 'Fine sir, lift is on the right side, please go.',
        tip: '"Balagade" = Right side, "Edagade" = Left side.'
      },
      {
        textKn: 'ನನ್ನ ಸ್ನೇಹಿತನ ಮನೆಗೆ ಹೋಗ್ತಿದ್ದೀನಿ.',
        textEn: 'I am going to my friend\'s house.',
        score: 70,
        replyKn: 'ಸ್ನೇಹಿತನ ಹೆಸರು ಮತ್ತು ಫ್ಲಾಟ್ ನಂಬರ್ ಬೇಕು ಸರ್.',
        replyEn: 'Need friend\'s name and flat number sir.',
        tip: 'Guards will always need the specific flat number.'
      }
    ]
  },
  {
    id: 'house_help',
    category: 'Home Help & Maid',
    icon: '🧹',
    titleKn: 'ಮನೆ ಕೆಲಸದವರೊಡನೆ ಮಾತುಕತೆ (House Help Chat)',
    incomingKn: 'ಅಮ್ಮಾ / ಸರ್, ಇವತ್ತು ಹಾಲ್ ಮತ್ತು ಬಾಲ್ಕನಿ ಎರಡೂ ತೊಳೆದು ಒರೆಸಲಾ?',
    incomingEn: 'Sir/Madam, should I wash and mop both the hall and balcony today?',
    options: [
      {
        textKn: 'ಹೌದು, ಇವತ್ತು ಬಾಲ್ಕನಿ ಚೆನ್ನಾಗಿ ಒರೆಸಿ, ಕಸ ಹೊರಗಿಡಿ.',
        textEn: 'Yes, wipe balcony nicely today, keep dustbin outside.',
        score: 100,
        replyKn: 'ಆಯ್ತು ಸರ್, ಕಸದ ಬಕೆಟ್ ಹೊರಗಿಟ್ಟು ಕ್ಲೀನ್ ಮಾಡ್ತೀನಿ.',
        replyEn: 'Okay sir, keeping dustbin outside and cleaning.',
        tip: '"Oresi" (ಒರೆಸಿ) means mop/wipe; "Kasa" (ಕಸ) means garbage/dust.'
      },
      {
        textKn: 'ಬೇಡ, ಕೇವಲ ಪಾತ್ರೆ ತೊಳೆದು ಹೊರಡಿ.',
        textEn: 'No need, just wash the utensils and leave.',
        score: 90,
        replyKn: 'ಸರಿ ಸರ್, ಪಾತ್ರೆ ತೊಳೆದು ಹೋಗ್ತೀನಿ.',
        replyEn: 'Fine sir, washing dishes and leaving.',
        tip: '"Paatre toleyiri" (ಪಾತ್ರೆ ತೊಳೆಯಿರಿ) = Wash utensils.'
      }
    ]
  }
];

const KANNADA_DIGITS = [
  { num: '0', kn: 'ಸೊನ್ನೆ', en: 'Sonne' },
  { num: '1', kn: 'ಒಂದು', en: 'Ondu' },
  { num: '2', kn: 'ಎರಡು', en: 'Eradu' },
  { num: '3', kn: 'ಮೂರು', en: 'Mooru' },
  { num: '4', kn: 'ನಾಲ್ಕು', en: 'Naalku' },
  { num: '5', kn: 'ಐದು', en: 'Aidu' },
  { num: '6', kn: 'ಆರು', en: 'Aaru' },
  { num: '7', kn: 'ಏಳು', en: 'Yelu' },
  { num: '8', kn: 'ಎಂಟು', en: 'Entu' },
  { num: '9', kn: 'ಒಂಬತ್ತು', en: 'Ombattu' },
];

export default function ApartmentDeliveryAI({ onXP, onToast }) {
  const [tab, setTab] = useState('dialogue'); // 'dialogue' | 'otp_trainer'
  const [currentIdx, setCurrentIdx] = useState(0);
  const [chosenOpt, setChosenOpt] = useState(null);
  const [otpCode, setOtpCode] = useState(['4', '8', '2', '9']);

  const cur = SCENARIOS[currentIdx];

  const handleSelectOption = (opt) => {
    playClick();
    setChosenOpt(opt);
    const xp = Math.round(opt.score / 4);
    if (opt.score >= 90) {
      playFanfare();
      onXP && onXP(xp);
      onToast && onToast(`🛵 Delivery Handshake Master! +${xp} XP`, 'xp');
    } else {
      playSuccess();
      onXP && onXP(xp);
      onToast && onToast(`+${xp} XP`, 'xp');
    }
  };

  const handleNext = () => {
    playClick();
    setChosenOpt(null);
    setCurrentIdx(i => (i + 1) % SCENARIOS.length);
  };

  const generateNewOtp = () => {
    playClick();
    const fresh = Array.from({ length: 4 }, () => Math.floor(Math.random() * 10).toString());
    setOtpCode(fresh);
  };

  return (
    <div className="learning-screen" style={{ maxWidth: 840, margin: '0 auto', padding: '1rem' }}>
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.8rem' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0, fontSize: '1.6rem' }}>
            🏢 ಅಪಾರ್ಟ್‌ಮೆಂಟ್ & ಡೆಲಿವರಿ ಸಂಭಾಷಣೆ
          </h1>
          <p style={{ margin: '0.2rem 0 0', opacity: 0.8, fontSize: '0.9rem' }}>
            Apartment Survival & Swiggy/Zomato/Dunzo Kannada Simulator
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => { playClick(); setTab('dialogue'); }}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '10px',
              border: 'none',
              background: tab === 'dialogue' ? 'linear-gradient(135deg, #ff6b35, #ffa366)' : 'rgba(255,255,255,0.08)',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            💬 Scenarios
          </button>
          <button
            onClick={() => { playClick(); setTab('otp_trainer'); }}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '10px',
              border: 'none',
              background: tab === 'otp_trainer' ? 'linear-gradient(135deg, #ff6b35, #ffa366)' : 'rgba(255,255,255,0.08)',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            🔢 OTP Number Trainer
          </button>
        </div>
      </div>

      {tab === 'dialogue' ? (
        <div className="glass-card" style={{ padding: '1.6rem', borderRadius: '16px', border: '1px solid rgba(255, 163, 102, 0.25)' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
            <span style={{ fontSize: '0.85rem', background: 'rgba(255, 107, 53, 0.15)', color: '#ffa366', padding: '0.3rem 0.8rem', borderRadius: '8px', fontWeight: 700 }}>
              {cur.icon} {cur.category}
            </span>
            <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>
              Scenario {currentIdx + 1} of {SCENARIOS.length}
            </span>
          </div>

          {/* Caller Dialogue */}
          <div style={{
            padding: '1.3rem',
            background: 'rgba(255, 107, 53, 0.12)',
            border: '1px solid rgba(255, 107, 53, 0.3)',
            borderRadius: '14px',
            marginBottom: '1.4rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.8rem' }}>
              <div>
                <div style={{ fontSize: '0.78rem', color: '#ffa366', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                  {cur.titleKn}:
                </div>
                <div style={{ fontFamily: 'Noto Sans Kannada, sans-serif', fontSize: '1.2rem', fontWeight: 800, lineHeight: 1.5, marginBottom: '0.4rem' }}>
                  "{cur.incomingKn}"
                </div>
                <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>
                  "{cur.incomingEn}"
                </div>
              </div>
              <button
                onClick={() => speakKannada(cur.incomingKn)}
                style={{
                  background: 'rgba(255, 107, 53, 0.25)',
                  border: '1px solid rgba(255, 107, 53, 0.4)',
                  borderRadius: '50%',
                  width: 42,
                  height: 42,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  flexShrink: 0
                }}
              >
                🔊
              </button>
            </div>
          </div>

          {/* Options */}
          <div style={{ marginBottom: '1.2rem' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.8rem', color: '#ffa366' }}>
              ನಿಮ್ಮ ಉತ್ತರ (Choose Your Reply):
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {cur.options.map((opt, i) => {
                const isSelected = chosenOpt === opt;
                return (
                  <div
                    key={i}
                    onClick={() => !chosenOpt && handleSelectOption(opt)}
                    style={{
                      padding: '1rem',
                      borderRadius: '12px',
                      border: isSelected
                        ? opt.score >= 90 ? '2px solid #4ade80' : '2px solid #facc15'
                        : '1px solid rgba(255,255,255,0.1)',
                      background: isSelected
                        ? opt.score >= 90 ? 'rgba(74, 222, 128, 0.15)' : 'rgba(250, 204, 21, 0.15)'
                        : 'rgba(255,255,255,0.03)',
                      cursor: chosenOpt ? 'default' : 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: 'Noto Sans Kannada, sans-serif', fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.2rem' }}>
                          {opt.textKn}
                        </div>
                        <div style={{ fontSize: '0.82rem', opacity: 0.75 }}>
                          {opt.textEn}
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); speakKannada(opt.textKn); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}
                      >
                        🔊
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Response Feedback */}
          {chosenOpt && (
            <div style={{
              padding: '1.2rem',
              borderRadius: '14px',
              background: 'rgba(74, 222, 128, 0.1)',
              border: '1px solid rgba(74, 222, 128, 0.3)',
              marginBottom: '1rem'
            }}>
              <div style={{ fontWeight: 800, color: '#4ade80', marginBottom: '0.4rem' }}>
                ⭐ {chosenOpt.replyKn}
              </div>
              <div style={{ fontSize: '0.85rem', opacity: 0.85, marginBottom: '0.6rem' }}>
                {chosenOpt.replyEn}
              </div>
              <div style={{ fontSize: '0.8rem', background: 'rgba(0,0,0,0.25)', padding: '0.5rem 0.8rem', borderRadius: '8px', color: '#ffa366' }}>
                💡 <strong>Apartment Pro-Tip:</strong> {chosenOpt.tip}
              </div>
              <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                <button
                  onClick={handleNext}
                  style={{
                    background: 'linear-gradient(135deg, #ff6b35, #ffa366)',
                    color: '#fff',
                    border: 'none',
                    padding: '0.6rem 1.4rem',
                    borderRadius: '10px',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  Next Scenario ➔
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* OTP Number Trainer */
        <div className="glass-card" style={{ padding: '1.6rem', borderRadius: '16px', border: '1px solid rgba(255, 163, 102, 0.25)' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.3rem', margin: '0 0 0.5rem' }}>🔢 ೪-ಅಂಕಿಯ ಓಟಿಪಿ ತರಬೇತಿ (4-Digit OTP Trainer)</h2>
            <p style={{ opacity: 0.8, fontSize: '0.88rem', margin: 0 }}>
              Practice telling your Swiggy / Zepto OTP in Kannada digits like a native!
            </p>
          </div>

          {/* OTP Display */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
            {otpCode.map((digit, i) => {
              const info = KANNADA_DIGITS.find(d => d.num === digit);
              return (
                <div
                  key={i}
                  onClick={() => speakKannada(info.kn)}
                  style={{
                    width: 72,
                    height: 90,
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.2), rgba(255, 163, 102, 0.1))',
                    border: '2px solid #ffa366',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                  }}
                  title="Click to hear digit"
                >
                  <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffa366' }}>{digit}</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, fontFamily: 'Noto Sans Kannada' }}>{info.kn}</span>
                  <span style={{ fontSize: '0.68rem', opacity: 0.7 }}>{info.en}</span>
                </div>
              );
            })}
          </div>

          {/* Say whole OTP button */}
          <div style={{ textAlign: 'center', marginBottom: '1.8rem' }}>
            <button
              onClick={() => {
                const phrase = otpCode.map(d => KANNADA_DIGITS.find(k => k.num === d).kn).join(', ');
                speakKannada(phrase);
              }}
              style={{
                background: 'linear-gradient(135deg, #ff6b35, #ffa366)',
                border: 'none',
                color: '#fff',
                padding: '0.75rem 1.6rem',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '1rem',
                cursor: 'pointer',
                marginRight: '0.8rem'
              }}
            >
              🔊 Listen to Full OTP in Kannada
            </button>
            <button
              onClick={generateNewOtp}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff',
                padding: '0.75rem 1.2rem',
                borderRadius: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              🎲 New Random OTP
            </button>
          </div>

          {/* Digit Reference Grid */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.2rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ffa366', marginBottom: '0.8rem' }}>
              Kannada Digits Cheat-Sheet (0 - 9):
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.6rem' }}>
              {KANNADA_DIGITS.map(d => (
                <button
                  key={d.num}
                  onClick={() => speakKannada(d.kn)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    background: 'rgba(255,255,255,0.03)',
                    color: 'inherit',
                    cursor: 'pointer'
                  }}
                >
                  <span style={{ fontWeight: 800, color: '#ffa366' }}>{d.num}</span>
                  <span style={{ fontFamily: 'Noto Sans Kannada', fontWeight: 700 }}>{d.kn}</span>
                  <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>{d.en}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
