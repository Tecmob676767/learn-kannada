import React, { useState } from 'react';

const SCENARIOS = [
  {
    title: 'KR Market Vegetables 🥦',
    item: 'ತಾಜಾ ಈರುಳ್ಳಿ (Fresh Onions - 1 kg)',
    sellerAsk: 50,
    minPrice: 35,
    dialogue: 'ಅಣ್ಣಾ, ಈರುಳ್ಳಿ ೧ ಕೆಜಿಗೆ ೫೦ ರೂಪಾಯಿ!',
    dialogueEn: 'Brother, onions are 50 rupees per kg!',
  },
  {
    title: 'Flower Market Mallige 🌸',
    item: 'ಮೈಸೂರು ಮಲ್ಲಿಗೆ (Jasmine Garland)',
    sellerAsk: 80,
    minPrice: 60,
    dialogue: 'ಮಲ್ಲಿಗೆ ಹಾರ ತುಂಬಾ ತಾಜಾ ಇದೆ, ೮೦ ರೂಪಾಯಿ ಕೊಡಿ!',
    dialogueEn: 'The jasmine garland is very fresh, give 80 rupees!',
  },
  {
    title: 'Auto Rickshaw to Majestic 🛺',
    item: 'ಮೆಜೆಸ್ಟಿಕ್‌ಗೆ ಆಟೋ ಬಾಡಿಗೆ (Auto Fare)',
    sellerAsk: 150,
    minPrice: 100,
    dialogue: 'ಮೀಟರ್ ಇಲ್ಲ ಸರ್, ಮೆಜೆಸ್ಟಿಕ್‌ಗೆ ೧೫೦ ರೂಪಾಯಿ ಫಿಕ್ಸ್!',
    dialogueEn: 'No meter sir, 150 rupees fixed for Majestic!',
  },
  {
    title: 'Tender Coconut Stalls 🥥',
    item: 'ಎಳನೀರು (Sweet Tender Coconut)',
    sellerAsk: 60,
    minPrice: 45,
    dialogue: 'ತುಂಬಾ ನೀರಿದೆ ಸರ್, ಒಂದಕ್ಕೆ ೬೦ ರೂಪಾಯಿ!',
    dialogueEn: 'Lots of water sir, 60 rupees for one!',
  },
  {
    title: 'Silk Saree Shop 🥻',
    item: 'ಮೈಸೂರು ಸಿಲ್ಕ್ ಸೀರೆ (Mysore Silk Saree)',
    sellerAsk: 2000,
    minPrice: 1500,
    dialogue: 'ಪ್ಯೂರ್ ಸಿಲ್ಕ್ ಮೇಡಂ, ಕೊನೆ ಬೆಲೆ ೨೦೦೦ ರೂಪಾಯಿ!',
    dialogueEn: 'Pure silk madam, final price 2000 rupees!',
  },
  {
    title: 'Filter Coffee Darshini ☕',
    item: '೨ ಬಿಸಿ ಫಿಲ್ಟರ್ ಕಾಫಿ (2 Filter Coffees)',
    sellerAsk: 40,
    minPrice: 30,
    dialogue: 'ಎರಡು ಸ್ಟ್ರಾಂಗ್ ಕಾಫಿಗೆ ೪೦ ರೂಪಾಯಿ ಸರ್!',
    dialogueEn: '40 rupees for two strong coffees sir!',
  }
];

export default function MarketBargain({ onXP, onToast }) {
  const [index, setIndex] = useState(0);
  const [offer, setOffer] = useState('');
  const [status, setStatus] = useState(null);
  const [totalSaved, setTotalSaved] = useState(0);
  const [completed, setCompleted] = useState(false);

  const cur = SCENARIOS[index];

  function speak(text) {
    if (!window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'kn-IN';
    u.rate = 0.85;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  function handleBargain(customVal) {
    const val = customVal !== undefined ? customVal : parseInt(offer, 10);
    if (!val || isNaN(val) || val <= 0) {
      setStatus({ type: 'error', msg: 'ದಯವಿಟ್ಟು ಸರಿಯಾದ ಬೆಲೆ ಹಾಕಿ (Enter a valid amount)!' });
      return;
    }

    if (val < cur.minPrice) {
      setStatus({
        type: 'rejected',
        msg: `❌ "ಇಲ್ಲ ಸಾರ್, ಅಷ್ಟು ಕಮ್ಮಿಗೆ ಆಗಲ್ಲ!" (Seller rejected: Too low! Min is ₹${cur.minPrice})`,
      });
    } else if (val >= cur.sellerAsk) {
      setStatus({
        type: 'accepted',
        msg: `🤝 "ಸರಿ ಸಾರ್, ತಗೊಳ್ಳಿ!" (Deal accepted at full price: ₹${val})`,
      });
      onXP && onXP(10);
      onToast && onToast('Deal accepted! +10 XP 🛍️', 'xp');
    } else {
      const saved = cur.sellerAsk - val;
      setTotalSaved(s => s + saved);
      setStatus({
        type: 'bargained',
        msg: `🎉 "ಆಯ್ತು ಕೊಡಿ!" (Bargain Success! You saved ₹${saved}!)`,
      });
      onXP && onXP(25);
      onToast && onToast(`🔥 Master Bargainer! Saved ₹${saved} & +25 XP!`, 'xp');
    }
  }

  function nextScenario() {
    setStatus(null);
    setOffer('');
    if (index + 1 < SCENARIOS.length) {
      setIndex(i => i + 1);
    } else {
      setCompleted(true);
    }
  }

  function restart() {
    setIndex(0);
    setStatus(null);
    setOffer('');
    setTotalSaved(0);
    setCompleted(false);
  }

  return (
    <div className="learning-screen">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h1 className="page-title">🛍️ ಮಾರುಕಟ್ಟೆ ಚೌಕಾಶಿ · Market Bargain</h1>
        <span style={{ fontWeight: 800, color: '#4ade80', fontSize: '0.95rem' }}>💰 Total Saved: ₹{totalSaved}</span>
      </div>

      {!completed ? (
        <div className="glass-card" style={{ maxWidth: 540, margin: '0 auto', padding: '1.8rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', opacity: 0.65, fontSize: '0.85rem' }}>
            <span>{cur.title}</span>
            <span>Scenario {index + 1} / {SCENARIOS.length}</span>
          </div>

          <div style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.06)', borderRadius: 12, marginBottom: '1.2rem' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.3rem', color: '#ffa366' }}>{cur.item}</div>
            <div style={{ fontSize: '0.9rem', color: '#ff6b6b', fontWeight: 700 }}>Seller Asking Price: ₹{cur.sellerAsk}</div>
          </div>

          <div style={{ padding: '1rem', background: 'rgba(255,163,102,0.1)', border: '1px solid rgba(255,163,102,0.25)', borderRadius: 12, marginBottom: '1.2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '1.3rem' }}>🗣️</span>
              <span style={{ fontFamily: 'Noto Sans Kannada, sans-serif', fontWeight: 800, fontSize: '1.05rem' }}>{cur.dialogue}</span>
              <button onClick={() => speak(cur.dialogue)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}>🔊</button>
            </div>
            <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{cur.dialogueEn}</div>
          </div>

          {status && (
            <div style={{
              padding: '0.8rem 1rem', borderRadius: 8, marginBottom: '1.2rem', fontWeight: 700,
              background: status.type === 'bargained' ? 'rgba(74, 222, 128, 0.2)' : status.type === 'accepted' ? 'rgba(96, 165, 250, 0.2)' : 'rgba(248, 113, 113, 0.2)',
              color: status.type === 'bargained' ? '#4ade80' : status.type === 'accepted' ? '#60a5fa' : '#f87171'
            }}>
              {status.msg}
            </div>
          )}

          {!status ? (
            <div>
              <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.6rem' }}>ಚೌಕಾಶಿ ಮಾಡಿ (Make Your Offer):</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '0.8rem' }}>
                <button className="btn-primary" onClick={() => handleBargain(Math.round(cur.sellerAsk * 0.7))}>
                  ₹{Math.round(cur.sellerAsk * 0.7)} (-30%)
                </button>
                <button className="btn-primary" onClick={() => handleBargain(Math.round(cur.sellerAsk * 0.8))}>
                  ₹{Math.round(cur.sellerAsk * 0.8)} (-20%)
                </button>
                <button className="btn-primary" onClick={() => handleBargain(cur.sellerAsk)}>
                  ₹{cur.sellerAsk} (Accept)
                </button>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="number"
                  placeholder="Custom ₹..."
                  value={offer}
                  onChange={e => setOffer(e.target.value)}
                  style={{ flex: 1, padding: '0.6rem', borderRadius: 8, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: 'inherit' }}
                />
                <button className="btn-primary" onClick={() => handleBargain()}>Offer 💰</button>
              </div>
            </div>
          ) : (
            <button className="btn-primary" style={{ width: '100%', padding: '0.8rem' }} onClick={nextScenario}>
              Next Shop / Scenario →
            </button>
          )}
        </div>
      ) : (
        <div className="glass-card" style={{ maxWidth: 440, margin: '2rem auto', padding: '2.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '0.8rem' }}>🛍️🏆</div>
          <h2>Bargaining Quest Complete!</h2>
          <p style={{ margin: '0.8rem 0', fontSize: '1.1rem' }}>Total money saved in Bengaluru markets:</p>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#4ade80', marginBottom: '1.2rem' }}>₹{totalSaved}</div>
          <button className="btn-primary" onClick={restart}>Play Again 🔄</button>
        </div>
      )}
    </div>
  );
}
