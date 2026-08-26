import React, { useState } from 'react';

const AUTO_SCENARIOS = [
  {
    destination: 'ಕೋರಮಂಗಲ (Koramangala 5th Block)',
    distance: '6 km',
    meterFare: 90,
    driverDemand: 180,
    dialogueKn: 'ಕೋರಮಂಗಲನಾ? ೧೮೦ ರೂಪಾಯಿ ಆಗುತ್ತೆ ಸಾರ್, ಟ್ರಾಫಿಕ್ ಜಾಸ್ತಿ ಇದೆ!',
    dialogueEn: 'Koramangala? 180 rupees sir, traffic is very heavy!',
    options: [
      { textKn: 'ಮೀಟರ್ ಹಾಕಿ ಬನ್ನಿ ಸಾರ್, ಎಕ್ಸ್ಟ್ರಾ ೨೦ ರೂಪಾಯಿ ಕೊಡ್ತೀನಿ.', textEn: 'Put meter sir, I will give 20 rupees extra.', score: 100, replyKn: 'ಆಯ್ತು ಹತ್ತಿ ಸಾರ್, ಮೀಟರ್ ಹಾಕ್ತೀನಿ!', replyEn: 'Okay get in sir, putting meter!' },
      { textKn: '೧೨೦ ರೂಪಾಯಿಗೆ ಬರ್ತೀರಾ?', textEn: 'Will you come for 120 rupees?', score: 80, replyKn: '೧೪೦ ಕೊಡಿ ಸಾರ್ ಹೋಗೋಣ.', replyEn: 'Give 140 sir, let us go.' },
      { textKn: 'ತುಂಬಾ ಜಾಸ್ತಿ ಆಯಿತು, ನಾನು ಬೇರೆ ಆಟೋ ನೋಡ್ತೀನಿ.', textEn: 'Too much, I will look for another auto.', score: 60, replyKn: 'ಸರಿ ಸಾರ್, ಬನ್ನಿ ೧೦೦ ರೂಪಾಯಿ ಕೊಡಿ ಸಾಕು!', replyEn: 'Okay sir, come give 100 rupees!' }
    ]
  },
  {
    destination: 'ಇಂದಿರಾನಗರ ೧೦೦ ಫೀಟ್ ರೋಡ್ (Indiranagar 100ft Road)',
    distance: '4 km',
    meterFare: 65,
    driverDemand: 150,
    dialogueKn: 'ಇಂದಿರಾನಗರನಾ? ರಿಟರ್ನ್ ಸವಾರಿ ಸಿಗಲ್ಲ, ೧೫೦ ಫಿಕ್ಸ್!',
    dialogueEn: 'Indiranagar? No return ride, 150 rupees fixed!',
    options: [
      { textKn: 'ಮೀಟರ್ ಮೇಲೆ ೩೦ ರೂಪಾಯಿ ಜಾಸ್ತಿ ತಗೊಳ್ಳಿ.', textEn: 'Take 30 rupees above meter.', score: 95, replyKn: 'ಆಯ್ತು ಸಾರ್, ದಯವಿಟ್ಟು ಬನ್ನಿ.', replyEn: 'Okay sir, please come.' },
      { textKn: '೧೦೦ ರೂಪಾಯಿ ಫೈನಲ್.', textEn: '100 rupees final.', score: 85, replyKn: 'ಸರಿ ಹತ್ತಿ.', replyEn: 'Fine, get in.' },
      { textKn: 'ನನಗೆ ಮೆಟ್ರೋ ಹತ್ತಿರ ಇದೆ, ಬೇಡ.', textEn: 'Metro is nearby, no thanks.', score: 90, replyKn: 'ಅಯ್ಯೋ ಬನ್ನಿ ಸಾರ್, ಮೀಟರ್ ಹಾಕ್ತೀನಿ!', replyEn: 'Ayyoo come sir, I will put meter!' }
    ]
  }
];

export default function AutoRickshawAI({ onXP, onToast }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [outcome, setOutcome] = useState(null);
  const [totalSaved, setTotalSaved] = useState(0);

  const cur = AUTO_SCENARIOS[currentIdx];

  function speak(text) {
    if (!window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'kn-IN';
    u.rate = 0.85;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  function handleSelect(opt) {
    setOutcome(opt);
    const saved = cur.driverDemand - cur.meterFare - 20;
    setTotalSaved(s => s + saved);
    onXP && onXP(25);
    onToast && onToast(`🛺 Auto bargain success! +25 XP`, 'xp');
  }

  function nextRide() {
    setOutcome(null);
    setCurrentIdx(i => (i + 1) % AUTO_SCENARIOS.length);
  }

  return (
    <div className="learning-screen">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
        <h1 className="page-title">🛺 ಆಟೋ ಚೌಕಾಶಿ · Auto Rickshaw AI Simulator</h1>
        <span style={{ color: '#4ade80', fontWeight: 800 }}>Saved: ₹{totalSaved}</span>
      </div>

      <div className="glass-card" style={{ maxWidth: 640, margin: '0 auto', padding: '2rem' }}>
        {/* Scenario Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', padding: '1rem', background: 'rgba(255,255,255,0.06)', borderRadius: '12px' }}>
          <div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffa366' }}>{cur.destination}</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Distance: {cur.distance} · Meter Estimate: ₹{cur.meterFare}</div>
          </div>
          <div style={{ fontSize: '2.5rem' }}>🛺</div>
        </div>

        {/* Auto Driver Dialog Box */}
        <div style={{ padding: '1.4rem', background: 'rgba(255, 107, 53, 0.15)', border: '1px solid rgba(255, 107, 53, 0.35)', borderRadius: '14px', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#ffa366', fontWeight: 800, marginBottom: '0.3rem' }}>AUTO DRIVER ASKS:</div>
              <div style={{ fontFamily: 'Noto Sans Kannada, sans-serif', fontSize: '1.25rem', fontWeight: 900, lineHeight: 1.6 }}>
                "{cur.dialogueKn}"
              </div>
            </div>
            <button onClick={() => speak(cur.dialogueKn)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.3rem' }}>
              🔊
            </button>
          </div>
          <div style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '0.5rem' }}>
            "{cur.dialogueEn}"
          </div>
        </div>

        {/* User Response Options */}
        {!outcome ? (
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, opacity: 0.8, marginBottom: '0.8rem' }}>
              ನಿಮ್ಮ ಉತ್ತರ (Choose Street-Smart Response):
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {cur.options.map((opt, i) => (
                <button
                  key={i}
                  className="btn-primary"
                  onClick={() => handleSelect(opt)}
                  style={{
                    textAlign: 'left',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <span style={{ fontFamily: 'Noto Sans Kannada, sans-serif', fontWeight: 800, fontSize: '1.05rem' }}>
                    {opt.textKn}
                  </span>
                  <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                    {opt.textEn}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ padding: '1.4rem', background: 'rgba(74, 222, 128, 0.15)', border: '1px solid rgba(74, 222, 128, 0.35)', borderRadius: '14px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>🤝✅</div>
            <div style={{ fontFamily: 'Noto Sans Kannada, sans-serif', fontSize: '1.3rem', fontWeight: 900, color: '#4ade80' }}>
              "{outcome.replyKn}"
            </div>
            <div style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '0.3rem', marginBottom: '1.2rem' }}>
              "{outcome.replyEn}"
            </div>
            <button className="btn-primary" onClick={nextRide} style={{ padding: '0.7rem 1.8rem' }}>
              Next Destination 🛺 →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
