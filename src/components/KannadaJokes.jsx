import React, { useState } from 'react';

const JOKES = [
  {
    setupKn: 'ಶಿಕ್ಷಕ: "೧೦ ರಲ್ಲಿ ೪ ಕಳೆದರೆ ಎಷ್ಟು ಉಳಿಯುತ್ತದೆ?"',
    setupEn: 'Teacher: "If you subtract 4 from 10, how much is left?"',
    punchKn: 'ಗುಂಡ: "ಉಳಿದದ್ದು ಬಿಡಿ ಸರ್, ಕದ್ದವರು ಯಾರು ಅಂತ ಮೊದಲು ಹೇಳಿ!"',
    punchEn: 'Gunda: "Forget what is left sir, first tell me who stole the 4!"',
  },
  {
    setupKn: 'ಡಾಕ್ಟರ್: "ದಿನಕ್ಕೆ ೪ ಕಿಲೋಮೀಟರ್ ಓಡಿ, ಆರೋಗ್ಯ ಚೆನ್ನಾಗಿರುತ್ತೆ."',
    setupEn: 'Doctor: "Run 4 kilometers every day, health will be great."',
    punchKn: 'ಗುಂಡ: "ಆಯ್ತು ಸರ್, ಈಗ ನಾನು ಬೆಂಗಳೂರಿನಿಂದ ೧೨೦ ಕಿಮೀ ದೂರ ಇದ್ದೀನಿ, ಮನೆಗೆ ಹೇಗೆ ಬರಲಿ?"',
    punchEn: 'Gunda: "Done sir, now I am 120km away from Bengaluru, how do I get home?"',
  },
  {
    setupKn: 'ಗಂಡ: "ಅಡುಗೆ ಇವತ್ತು ತುಂಬಾ ಚೆನ್ನಾಗಿದೆ, ಯಾವ ಹೊಟೆಲ್ ಇಂದ ತರಿಸಿದೆ?"',
    setupEn: 'Husband: "Food is amazing today, which hotel did you order from?"',
    punchKn: 'ಹೆಂಡತಿ: "ಅದು ನಾನು ಮಾಡಿದ್ದಲ್ಲ, ಪಕ್ಕದ ಮನೆ ಶಾಂಭವಿ ಕೊಟ್ಟಿದ್ದು!"',
    punchEn: 'Wife: "I did not make it, neighbour Shambhavi gave it!"',
  },
  {
    setupKn: 'ಪರೀಕ್ಷೆಯಲ್ಲಿ ಪ್ರಶ್ನೆ: "ಕರ್ನಾಟಕದ ರಾಜಧಾನಿ ಯಾವುದು?"',
    setupEn: 'Exam question: "What is the capital of Karnataka?"',
    punchKn: 'ಗುಂಡ ಬರೆದ ಉತ್ತರ: "ನನ್ನ ಪ್ರಕಾರ ಬೆಂಗಳೂರು, ನಿಮ್ಮ ಪ್ರಕಾರ ಹೇಗೋ ಗೊತ್ತಿಲ್ಲ!"',
    punchEn: 'Gunda answer: "According to me Bengaluru, do not know about your opinion!"',
  },
  {
    setupKn: 'ಹೋಟೆಲ್ ವೇಟರ್: "ಸರ್, ಕಾಫಿ ಜೊತೆ ಏನಾದರೂ ತಿನ್ನಲು ಬೇಕಾ?"',
    setupEn: 'Hotel waiter: "Sir, want anything to eat with coffee?"',
    punchKn: 'ಗ್ರಾಹಕ: "ಹೂಂ, ಕಾಫಿ ತಣ್ಣಗಾಗೋ ಮೊದಲು ಬಿಲ್ ತನ್ನಿ ಸಾಕು!"',
    punchEn: 'Customer: "Yes, just bring the bill before the coffee gets cold!"',
  }
];

export default function KannadaJokes({ onXP, onToast }) {
  const [index, setIndex] = useState(0);
  const [rated, setRated] = useState({});

  const cur = JOKES[index];

  function speak(text) {
    if (!window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'kn-IN';
    u.rate = 0.85;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  function handleRate(isLaugh) {
    if (!rated[index]) {
      setRated(r => ({ ...r, [index]: isLaugh ? 'laugh' : 'smile' }));
      onXP && onXP(15);
      onToast && onToast(isLaugh ? '😂 Haha! +15 XP' : '🙂 Chuckle! +15 XP', 'xp');
    }
  }

  return (
    <div className="learning-screen">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
        <h1 className="page-title">😂 ಹಾಸ್ಯ ಕೂಟ · Kannada Laugh Club</h1>
        <span style={{ opacity: 0.65, fontSize: '0.85rem' }}>Joke {index + 1} / {JOKES.length}</span>
      </div>

      <div className="glass-card" style={{ maxWidth: 540, margin: '0 auto', padding: '2rem' }}>
        <div style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.06)', borderRadius: 12, marginBottom: '1.2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
            <div style={{ fontFamily: 'Noto Sans Kannada, sans-serif', fontSize: '1.2rem', fontWeight: 800, lineHeight: 1.6, color: '#ffa366' }}>
              {cur.setupKn}
            </div>
            <button onClick={() => speak(cur.setupKn)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>🔊</button>
          </div>
          <div style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: '0.4rem' }}>{cur.setupEn}</div>
        </div>

        <div style={{ padding: '1.2rem', background: 'rgba(255, 107, 53, 0.12)', border: '1px solid rgba(255, 107, 53, 0.3)', borderRadius: 12, marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
            <div style={{ fontFamily: 'Noto Sans Kannada, sans-serif', fontSize: '1.25rem', fontWeight: 900, lineHeight: 1.6, color: '#ff6b35' }}>
              {cur.punchKn}
            </div>
            <button onClick={() => speak(cur.punchKn)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>🔊</button>
          </div>
          <div style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: '0.4rem' }}>{cur.punchEn}</div>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1rem' }}>
          <button className="btn-primary" style={{ flex: 1, background: rated[index] === 'laugh' ? 'rgba(74, 222, 128, 0.3)' : undefined }} onClick={() => handleRate(true)}>
            😂 ಸೂಪರ್ ಜೋಕ್!
          </button>
          <button className="btn-primary" style={{ flex: 1, background: rated[index] === 'smile' ? 'rgba(96, 165, 250, 0.3)' : undefined }} onClick={() => handleRate(false)}>
            🙂 ಚೆನ್ನಾಗಿದೆ
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button
            onClick={() => setIndex(i => (i - 1 + JOKES.length) % JOKES.length)}
            style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: 'inherit', borderRadius: 8, padding: '0.5rem 1rem', cursor: 'pointer' }}
          >
            ← Previous
          </button>
          <button
            className="btn-primary"
            onClick={() => setIndex(i => (i + 1) % JOKES.length)}
          >
            Next Joke →
          </button>
        </div>
      </div>
    </div>
  );
}
