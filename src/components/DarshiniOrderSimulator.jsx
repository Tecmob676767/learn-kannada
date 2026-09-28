import React, { useState } from 'react';
import { speakKannada } from '../utils/tts.js';
import { playSuccess, playClick, playFanfare } from '../utils/soundEffects.js';

const DARSHINI_STATIONS = [
  {
    id: 'coffee',
    nameKn: 'ಫಿಲ್ಟರ್ ಕಾಫಿ ಕೌಂಟರ್',
    nameEn: 'Filter Coffee Counter',
    icon: '☕',
    description: 'Order authentic Bengaluru By-Two Kaapi like a native!',
    scenarios: [
      {
        promptKn: 'ಮಾಸ್ಟರ್, ಕಾಫಿ ಹೇಗೆ ಬೇಕು? ಸ್ಟ್ರಾಂಗ್ ಅಥವಾ ಲೈಟ್?',
        promptEn: 'Master: How would you like your coffee? Strong or light?',
        context: 'You want two cups shared with your friend, less sweet and strong.',
        options: [
          {
            textKn: 'ಒಂದು ಬೈ-ಟೂ ಸ್ಟ್ರಾಂಗ್ ಫಿಲ್ಟರ್ ಕಾಫಿ ಕೊಡಿ, ಸಕ್ಕರೆ ಕಮ್ಮಿ ಹಾಕಿ!',
            textEn: 'Give one by-two strong filter coffee, put less sugar!',
            feedbackKn: 'ಪರ್ಫೆಕ್ಟ್! ಮಾಸ್ಟರ್ ತಕ್ಷಣ ಎರಡು ಲೋಟಗಳಲ್ಲಿ ನೊರೆ ಬರುವ ಕಾಫಿ ಸುರೀತಾರೆ!',
            feedbackEn: 'Spot on! The master pours foamy by-two coffee between dabarah-tumblers with flair.',
            score: 100,
            streetSmartTip: '"By-two" (ಬೈ-ಟೂ) is Bangalore shorthand for 1 coffee split into 2 tumblers!'
          },
          {
            textKn: 'ಎರಡು ಕಾಫಿ ಬೇರೆ ಬೇರೆ ಕೊಡಿ, ತುಂಬಾ ಸಕ್ಕರೆ ಹಾಕಿ.',
            textEn: 'Give two separate coffees, put lots of sugar.',
            feedbackKn: 'ಸರಿ, ಆದರೆ ಬೈ-ಟೂ ಹೇಳಿದರೆ ಅಸಲಿ ಬೆಂಗಳೂರು ಮಜಾ!',
            feedbackEn: 'Okay, but asking for by-two gives you true darshini vibes!',
            score: 75,
            streetSmartTip: 'Try using "By-two" next time to save money and sound local.'
          },
          {
            textKn: 'ಕಾಫಿ ಬೇಡ, ಬಿಸಿ ನೀರು ಕೊಡಿ.',
            textEn: 'No coffee, give hot water.',
            feedbackKn: 'ಅರೆ, ಕಾಫಿ ಕೌಂಟರ್‌ನಲ್ಲಿ ನೀರಾ?!',
            feedbackEn: 'Hey, asking for just water at the coffee counter?!',
            score: 40,
            streetSmartTip: 'Water is usually at the self-service drinking dispenser.'
          }
        ]
      },
      {
        promptKn: 'ಟೋಕನ್ ಕೌಂಟರ್‌ನಲ್ಲಿ ಟೋಕನ್ ತಗೊಂಡ್ರಾ ಸಾರ್?',
        promptEn: 'Coffee Master: Did you get the token from the counter, sir?',
        context: 'You forgot the token and need to quickly check where to pay.',
        options: [
          {
            textKn: 'ಇಲ್ಲ ಸಾರ್, ಮರೆತುಹೋಯ್ತು! ಕ್ಯಾಶ್ ಕೌಂಟರ್ ಎಲ್ಲಿದೆ?',
            textEn: 'No sir, I forgot! Where is the cash counter?',
            feedbackKn: 'ಮಾಸ್ಟರ್: ಮುಂಭಾಗದಲ್ಲೇ ಇದೆ, ಟೋಕನ್ ತಗೊಂಡು ಬನ್ನಿ!',
            feedbackEn: 'Master: Right at the front entrance, grab token and come back!',
            score: 95,
            streetSmartTip: 'In Darshinis, always get food/coffee tokens first before standing in line.'
          },
          {
            textKn: 'ನಿಮಗೇ ನೇರವಾಗಿ ದುಡ್ಡು ಕೊಡ್ತೀನಿ, ತಗೊಳ್ಳಿ.',
            textEn: 'I will give money directly to you, take it.',
            feedbackKn: 'ಮಾಸ್ಟರ್: ಇಲ್ಲಿ ದುಡ್ಡು ತಗೊಳಲ್ಲ, ಟೋಕನ್ ಮಾತ್ರ!',
            feedbackEn: 'Master: We do not accept money here, only tokens!',
            score: 50,
            streetSmartTip: 'Food/beverage handlers in Darshinis never touch cash for hygiene.'
          }
        ]
      }
    ]
  },
  {
    id: 'tindi',
    nameKn: 'ತಿಂಡಿ ಕೌಂಟರ್ (ಮಸಾಲ ದೋಸೆ & ಇಡ್ಲಿ)',
    nameEn: 'Tindi Section (Dosa & Idli)',
    icon: '🥞',
    description: 'Crispy Benne Masala Dosa, hot button idlis & saagu.',
    scenarios: [
      {
        promptKn: 'ಮಾಸ್ಟರ್: ಏನು ಬೇಕು ಸಾರ್? ಮಸಾಲಾನಾ, ಖಾಲಿ ದೋಸೆನಾ?',
        promptEn: 'Dosa Master: What would you like sir? Masala or Khali Dosa?',
        context: 'You want a crispy masala dosa with extra chutney on the side.',
        options: [
          {
            textKn: 'ಒಂದು ಗರಿಗರಿ ಮಸಾಲ ದೋಸೆ, ಚಟ್ನಿ ಸಪರೇಟ್ ಆಗಿ ಕೊಡಿ!',
            textEn: 'One crispy masala dosa, please give chutney separately!',
            feedbackKn: 'ಬೊಂಬಾಟ್! ಕೆಂಪಗೆ ಬೆಂದ ಗರಿಗರಿ ಮಸಾಲ ದೋಸೆ ಸಿದ್ಧ!',
            feedbackEn: 'Bombat! Golden crispy red chutney smeared roast dosa is served!',
            score: 100,
            streetSmartTip: '"Garigari" (ಗರಿಗರಿ) means crispy crunchy!'
          },
          {
            textKn: 'ಒಂದು ಪ್ಲೇಟ್ ಇಡ್ಲಿ ವಡೆ, ಸಾಂಬಾರ್ ಡಿಪ್ ಮಾಡಿ ಕೊಡಿ.',
            textEn: 'One plate Idli Vada, serve dipped in hot sambar.',
            feedbackKn: 'ಆಹಾ! ಬಿಸಿ ಬಿಸಿ ಸಾಂಬಾರ್ ಡಿಪ್ ಇಡ್ಲಿ-ವಡೆ ಸವಿಯಿರಿ!',
            feedbackEn: 'Aaha! Sambar-dip idli-vada is the quintessential Bangalore breakfast!',
            score: 95,
            streetSmartTip: '"Sambar Dip" (ಸಾಂಬಾರ್ ಡಿಪ್) means soaked in a bowl of sambar.'
          },
          {
            textKn: 'ಸಾಂಬಾರ್ ಬೇಡ, ಕೇವಲ ಚಪಾತಿ ಕೊಡಿ.',
            textEn: 'No sambar, just give chapati.',
            feedbackKn: 'ಬೆಳಗ್ಗೆ ಚಪಾತಿ ರೆಡಿ ಇರಲ್ಲ ಸಾರ್, ದೋಸೆ ಇಡ್ಲಿ ಮಾತ್ರ.',
            feedbackEn: 'Chapati is usually for noon lunch, only tindi available now.',
            score: 60,
            streetSmartTip: 'Morning hours are dedicated to tindi (idli, vada, dosa, khara bath).'
          }
        ]
      }
    ]
  },
  {
    id: 'billing',
    nameKn: 'ಕ್ಯಾಶ್ & ಯುಪಿಐ ಕೌಂಟರ್',
    nameEn: 'Cash & UPI Token Counter',
    icon: '🧾',
    description: 'Pay quickly, ask for digital QR, and request receipt.',
    scenarios: [
      {
        promptKn: 'ಕ್ಯಾಶಿಯರ್: ಏನು ತಿಂಡಿ ಸಾರ್? ಟೋಟಲ್ ೧೪೦ ರೂಪಾಯಿ ಆಯಿತು.',
        promptEn: 'Cashier: What items sir? Total comes to 140 rupees.',
        context: 'You want to pay via UPI (GPay/PhonePe) because you don’t have exact change.',
        options: [
          {
            textKn: 'ಫೋನ್ ಪೇ / ಜಿಪೇ ಕ್ಯೂಆರ್ ಕೋಡ್ ಎಲ್ಲಿದೆ ಸಾರ್? ಸ್ಕ್ಯಾನ್ ಮಾಡ್ತೀನಿ.',
            textEn: 'Where is the PhonePe / GPay QR code sir? I will scan.',
            feedbackKn: 'ಕ್ಯಾಶಿಯರ್: ಇಲ್ಲೇ ಕೌಂಟರ್ ಮುಂದಿದೆ, ಸ್ಕ್ಯಾನ್ ಮಾಡಿ ತೋರಿಸಿ!',
            feedbackEn: 'Cashier points right in front, scan and show the green checkmark!',
            score: 100,
            streetSmartTip: 'Almost 100% of Bangalore darshinis have UPI scanners at the counter.'
          },
          {
            textKn: '೫೦೦ ರೂಪಾಯಿ ನೋಟು ಇದೆ, ಚಿಲ್ಲರೆ ಕೊಡ್ತೀರಾ?',
            textEn: 'I have a 500 rupee note, will you give change?',
            feedbackKn: 'ಕ್ಯಾಶಿಯರ್: ಬೆಳಗ್ಗೆ ಬೆಳಗ್ಗೆ ಚಿಲ್ಲರೆ ಇಲ್ಲ ಸಾರ್, ಆನ್‌ಲೈನ್ ಮಾಡಿ!',
            feedbackEn: 'Cashier: No small change so early in morning, please do online!',
            score: 70,
            streetSmartTip: '"Chillare" (ಚಿಲ್ಲರೆ) means coins / loose change.'
          }
        ]
      }
    ]
  },
  {
    id: 'parcel',
    nameKn: 'ಪಾರ್ಸಲ್ & ಟೇಕ್‌ಅವೇ ಕೌಂಟರ್',
    nameEn: 'Parcel / Takeaway Counter',
    icon: '🥡',
    description: 'Get your meals packed for home with extra sambar.',
    scenarios: [
      {
        promptKn: 'ಪಾರ್ಸಲ್ ಬಾಯ್: ಯಾವ ಆರ್ಡರ್ ಸಾರ್? ಟೋಕನ್ ಕೊಡಿ.',
        promptEn: 'Parcel Staff: Which order sir? Give me the token.',
        context: 'You want your masala dosa and bisi bele bath packed with extra chutney.',
        options: [
          {
            textKn: 'ಎರಡು ಮಸಾಲ ದೋಸೆ ಪಾರ್ಸಲ್ ಮಾಡಿ, ಚಟ್ನಿ ಸ್ವಲ್ಪ ಜಾಸ್ತಿ ಹಾಕಿ ದಯವಿಟ್ಟು!',
            textEn: 'Pack two masala dosas parcel, put a little extra chutney please!',
            feedbackKn: 'ಸೂಪರ್! ಬಾಳೆ ಎಲೆ ಮತ್ತು ಕವರ್‌ನಲ್ಲಿ ಚೆನ್ನಾಗಿ ಪ್ಯಾಕ್ ಮಾಡಿಕೊಡ್ತಾರೆ!',
            feedbackEn: 'Super! Packed cleanly with banana leaf lining and extra chutney pouch!',
            score: 100,
            streetSmartTip: '"Jaasti" (ಜಾಸ್ತಿ) = More / Extra; "Kammi" (ಕಮ್ಮಿ) = Less.'
          },
          {
            textKn: 'ಬೇಗ ಮಾಡಿ, ಆಫೀಸ್‌ಗೆ ತಡವಾಗ್ತಿದೆ!',
            textEn: 'Do it fast, getting late for office!',
            feedbackKn: 'ಆಯ್ತು ಸಾರ್, ಎರಡು ನಿಮಿಷದಲ್ಲಿ ಕೊಡ್ತೀನಿ.',
            feedbackEn: 'Understood, packing in 2 minutes flat.',
            score: 80,
            streetSmartTip: '"Tada aagtide" (ತಡವಾಗ್ತಿದೆ) = Getting late.'
          }
        ]
      }
    ]
  }
];

export default function DarshiniOrderSimulator({ onXP, onToast }) {
  const [stationIdx, setStationIdx] = useState(0);
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [sessionXP, setSessionXP] = useState(0);

  const curStation = DARSHINI_STATIONS[stationIdx];
  const curScenario = curStation.scenarios[scenarioIdx % curStation.scenarios.length];

  const handleSelectStation = (idx) => {
    playClick();
    setStationIdx(idx);
    setScenarioIdx(0);
    setSelectedOpt(null);
  };

  const handleChoose = (opt) => {
    playClick();
    setSelectedOpt(opt);
    const xp = Math.round(opt.score / 4);
    setSessionXP(x => x + xp);
    if (opt.score >= 90) {
      playFanfare();
      onXP && onXP(xp);
      onToast && onToast(`☕ Darshini Master! +${xp} XP`, 'xp');
    } else {
      playSuccess();
      onXP && onXP(xp);
      onToast && onToast(`+${xp} XP earned! Keep practicing.`, 'xp');
    }
  };

  const handleNext = () => {
    playClick();
    setSelectedOpt(null);
    if (scenarioIdx + 1 < curStation.scenarios.length) {
      setScenarioIdx(s => s + 1);
    } else {
      setStationIdx(s => (s + 1) % DARSHINI_STATIONS.length);
      setScenarioIdx(0);
    }
  };

  return (
    <div className="learning-screen" style={{ maxWidth: 840, margin: '0 auto', padding: '1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.8rem' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0, fontSize: '1.6rem' }}>
            ☕ ದರ್ಶಿನಿ ಆರ್ಡರ್ ಸಿಮ್ಯುಲೇಟರ್
          </h1>
          <p style={{ margin: '0.2rem 0 0', opacity: 0.8, fontSize: '0.9rem' }}>
            Bengaluru Darshini & Tindi Counter Roleplay · Order like a local!
          </p>
        </div>
        <div style={{ background: 'rgba(255, 107, 53, 0.18)', border: '1px solid rgba(255, 107, 53, 0.35)', padding: '0.5rem 1rem', borderRadius: '12px', fontWeight: 800, color: '#ffa366' }}>
          ⭐ Session XP: +{sessionXP}
        </div>
      </div>

      {/* Station Tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.6rem', marginBottom: '1.5rem' }}>
        {DARSHINI_STATIONS.map((st, i) => (
          <button
            key={st.id}
            onClick={() => handleSelectStation(i)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.75rem 0.9rem',
              borderRadius: '12px',
              border: stationIdx === i ? '2px solid #ffa366' : '1px solid rgba(255,255,255,0.1)',
              background: stationIdx === i ? 'rgba(255, 107, 53, 0.22)' : 'rgba(255,255,255,0.04)',
              cursor: 'pointer',
              color: 'inherit',
              textAlign: 'left',
              transition: 'all 0.2s ease'
            }}
          >
            <span style={{ fontSize: '1.6rem' }}>{st.icon}</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.88rem', color: stationIdx === i ? '#ffa366' : 'inherit' }}>{st.nameKn}</div>
              <div style={{ fontSize: '0.72rem', opacity: 0.7 }}>{st.nameEn}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Main Roleplay Glass Card */}
      <div className="glass-card" style={{ padding: '1.6rem', borderRadius: '16px', border: '1px solid rgba(255, 163, 102, 0.25)' }}>
        {/* Context badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ fontSize: '0.82rem', background: 'rgba(255,255,255,0.08)', padding: '0.3rem 0.75rem', borderRadius: '8px', opacity: 0.9 }}>
            📍 สถานการณ์ / Context: <strong>{curScenario.context}</strong>
          </div>
          <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>Station {stationIdx + 1} of {DARSHINI_STATIONS.length}</span>
        </div>

        {/* Counter Staff Dialog Box */}
        <div style={{
          padding: '1.3rem',
          background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.16), rgba(255, 163, 102, 0.08))',
          border: '1px solid rgba(255, 107, 53, 0.35)',
          borderRadius: '14px',
          marginBottom: '1.5rem',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.8rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#ffa366', fontWeight: 800, letterSpacing: '0.5px', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                {curStation.nameEn} Staff Asks:
              </div>
              <div style={{ fontFamily: 'Noto Sans Kannada, sans-serif', fontSize: '1.25rem', fontWeight: 800, lineHeight: 1.5, marginBottom: '0.4rem' }}>
                "{curScenario.promptKn}"
              </div>
              <div style={{ fontSize: '0.85rem', opacity: 0.85, fontStyle: 'italic' }}>
                "{curScenario.promptEn}"
              </div>
            </div>
            <button
              onClick={() => speakKannada(curScenario.promptKn)}
              title="Listen in Kannada"
              style={{
                background: 'rgba(255, 107, 53, 0.25)',
                border: '1px solid rgba(255, 107, 53, 0.4)',
                borderRadius: '50%',
                width: 44,
                height: 44,
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

        {/* User Options */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.8rem', color: '#ffa366' }}>
            👉 ನಿಮ್ಮ ಪ್ರತಿಕ್ರಿಯೆ (Choose Your Street-Smart Order):
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {curScenario.options.map((opt, i) => {
              const isSelected = selectedOpt === opt;
              return (
                <div
                  key={i}
                  onClick={() => !selectedOpt && handleChoose(opt)}
                  style={{
                    padding: '1rem',
                    borderRadius: '12px',
                    border: isSelected
                      ? opt.score >= 90 ? '2px solid #4ade80' : '2px solid #facc15'
                      : '1px solid rgba(255,255,255,0.12)',
                    background: isSelected
                      ? opt.score >= 90 ? 'rgba(74, 222, 128, 0.15)' : 'rgba(250, 204, 21, 0.15)'
                      : 'rgba(255,255,255,0.03)',
                    cursor: selectedOpt ? 'default' : 'pointer',
                    transition: 'all 0.2s ease'
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
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', opacity: 0.8 }}
                      title="Audio"
                    >
                      🔊
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Feedback Section */}
        {selectedOpt && (
          <div style={{
            padding: '1.2rem',
            borderRadius: '14px',
            background: selectedOpt.score >= 90 ? 'rgba(74, 222, 128, 0.12)' : 'rgba(250, 204, 21, 0.12)',
            border: selectedOpt.score >= 90 ? '1px solid rgba(74, 222, 128, 0.3)' : '1px solid rgba(250, 204, 21, 0.3)',
            marginBottom: '1.2rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '1.4rem' }}>{selectedOpt.score >= 90 ? '🌟' : '💡'}</span>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: selectedOpt.score >= 90 ? '#4ade80' : '#facc15' }}>
                Fluency Score: {selectedOpt.score}%
              </div>
            </div>
            <div style={{ fontSize: '0.9rem', marginBottom: '0.3rem', fontWeight: 600 }}>
              {selectedOpt.feedbackKn}
            </div>
            <div style={{ fontSize: '0.82rem', opacity: 0.85, marginBottom: '0.6rem' }}>
              {selectedOpt.feedbackEn}
            </div>
            {selectedOpt.streetSmartTip && (
              <div style={{ fontSize: '0.8rem', background: 'rgba(0,0,0,0.25)', padding: '0.5rem 0.8rem', borderRadius: '8px', color: '#ffa366' }}>
                💡 <strong>Darshini Secret:</strong> {selectedOpt.streetSmartTip}
              </div>
            )}
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
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                Next Order / Station ➔
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
