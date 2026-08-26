import React, { useState } from 'react';

const FOOD = [
  { kn:'ಇಡ್ಲಿ',     en:'Idli',        icon:'🫓', desc:'Steamed rice cake' },
  { kn:'ದೋಸೆ',      en:'Dose',        icon:'🥞', desc:'Crispy rice crepe' },
  { kn:'ಸಾಂಬಾರ್',   en:'Sambar',      icon:'🍲', desc:'Lentil vegetable stew' },
  { kn:'ಚಟ್ನಿ',     en:'Chutney',     icon:'🟢', desc:'Coconut dip' },
  { kn:'ಅನ್ನ',      en:'Rice',        icon:'🍚', desc:'Steamed rice' },
  { kn:'ರೊಟ್ಟಿ',    en:'Rotti',       icon:'🫓', desc:'Flat jowar bread' },
  { kn:'ಅವಲಕ್ಕಿ',   en:'Avalakki',    icon:'🌾', desc:'Flattened rice snack' },
  { kn:'ವಡೆ',       en:'Vade',        icon:'🍩', desc:'Savory lentil donut' },
  { kn:'ಕೇಸರಿ',     en:'Kesari Bath', icon:'🟠', desc:'Sweet semolina halwa' },
  { kn:'ಮೊಸರು',     en:'Curd',        icon:'🥛', desc:'Fresh yogurt' },
  { kn:'ಮಜ್ಜಿಗೆ',   en:'Buttermilk',  icon:'🥤', desc:'Spiced buttermilk' },
  { kn:'ಕಾಫಿ',      en:'Coffee',      icon:'☕', desc:'South Indian filter coffee' },
  { kn:'ಚಹಾ',       en:'Tea',         icon:'🍵', desc:'Masala chai' },
  { kn:'ಉಪ್ಪಿಟ್ಟು',  en:'Upma',        icon:'🌿', desc:'Semolina savoury porridge' },
  { kn:'ಬಿಸಿಬೇಳೆ',  en:'Bisi Bele',   icon:'🍛', desc:'Rice lentil vegetable dish' },
  { kn:'ಪುಳಿಯೋಗರೆ', en:'Puliyogare',  icon:'🍋', desc:'Tamarind rice' },
];

function speak(word) {
  if (!window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(word);
  u.lang = 'kn-IN'; u.rate = 0.85;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

export default function FoodMenu({ onXP, onToast }) {
  const [meal, setMeal] = useState(null);
  const [ordered, setOrdered] = useState([]);

  function generateMeal() {
    const shuffled = [...FOOD].sort(() => Math.random() - 0.5);
    const items = shuffled.slice(0, 3);
    setMeal(items);
    onXP && onXP(10);
    onToast && onToast('Meal generated! +10 XP 🍽️', 'xp');
  }

  return (
    <div className="learning-screen">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.2rem' }}>
        <h1 className="page-title">🍽️ ಕರ್ನಾಟಕ ಊಟ · Karnataka Food</h1>
        <button className="btn-primary" onClick={generateMeal}>🎲 Random Meal</button>
      </div>

      {meal && (
        <div className="glass-card" style={{ marginBottom:'1.5rem', padding:'1.2rem', background:'rgba(255,163,102,0.1)', border:'1px solid rgba(255,163,102,0.3)' }}>
          <h3 style={{ marginBottom:'0.8rem', color:'#ffa366' }}>🍽️ Your Karnataka Meal</h3>
          <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap' }}>
            {meal.map(f => (
              <div key={f.en} style={{ textAlign:'center', padding:'0.6rem 1rem', background:'rgba(255,255,255,0.08)', borderRadius:12 }}>
                <div style={{ fontSize:'2rem' }}>{f.icon}</div>
                <div style={{ fontFamily:'Noto Sans Kannada, sans-serif', fontWeight:700 }}>{f.kn}</div>
                <div style={{ fontSize:'0.75rem', opacity:0.7 }}>{f.en}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:'0.8rem' }}>
        {FOOD.map(f => (
          <div key={f.en} className="glass-card" style={{ padding:'1rem', cursor:'pointer', display:'flex', gap:'0.8rem', alignItems:'center' }}
            onClick={() => speak(f.kn)}>
            <div style={{ fontSize:'2rem', flexShrink:0 }}>{f.icon}</div>
            <div>
              <div style={{ fontFamily:'Noto Sans Kannada, sans-serif', fontWeight:800, fontSize:'1rem' }}>{f.kn}</div>
              <div style={{ fontSize:'0.8rem', fontWeight:600 }}>{f.en}</div>
              <div style={{ fontSize:'0.7rem', opacity:0.55 }}>{f.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
