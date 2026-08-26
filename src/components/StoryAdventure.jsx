import React, { useState } from 'react';

const STORIES = [
  {
    id: 'mysore_palace',
    title: 'ಮೈಸೂರು ಅರಮನೆ ರಹಸ್ಯ (Mysore Palace Mystery)',
    icon: '🏰',
    initialNode: 'start',
    nodes: {
      start: {
        textKn: 'ನೀವು ದಸರಾ ಹಬ್ಬದ ದಿನ ಮೈಸೂರು ಅರಮನೆ ತಲುಪಿದ್ದೀರಿ. ಭವ್ಯವಾದ ದ್ವಾರದ ಬಳಿ ಇಬ್ಬರು ಕಾವಲುಗಾರರು ನಿಂತಿದ್ದಾರೆ. ನೀವು ಏನು ಮಾಡುತ್ತೀರಿ?',
        textEn: 'You reach Mysore Palace on Dasara festival day. Two royal guards stand near the grand arch. What do you do?',
        options: [
          { textKn: 'ಕಾವಲುಗಾರರಿಗೆ "ನಮಸ್ಕಾರ, ಒಳಗೆ ಹೋಗಬಹುದಾ?" ಎಂದು ಕೇಳಿ.', textEn: 'Ask the guards politely: "Namaskara, can I enter?"', next: 'ask_guards', xp: 10 },
          { textKn: 'ಬದಿಯ ಸಣ್ಣ ಬಾಗಿಲಿನಿಂದ ರಹಸ್ಯವಾಗಿ ಹೋಗಿ.', textEn: 'Sneak through the small side gate.', next: 'sneak_side', xp: 5 }
        ]
      },
      ask_guards: {
        textKn: 'ಕಾವಲುಗಾರರು ನಗುತ್ತಾ, "ಖಂಡಿತ, ಆದರೆ ಮೊದಲು ರಾಜರ ರಹಸ್ಯ ಸಂಕೇತ ಪದ ಹೇಳಬೇಕು!" ಎಂದರು. ಸಂಕೇತ ಪದ ಯಾವುದು?',
        textEn: 'Guards smile and say: "Sure, but first tell the King`s secret password!" What is the password?',
        options: [
          { textKn: '"ಕರ್ನಾಟಕ ರತ್ನ" (Karnataka Ratna)', textEn: '"Karnataka Ratna"', next: 'royal_durbar', xp: 20 },
          { textKn: '"ಸಿಂಹ ದ್ವಾರ" (Simha Dwaara)', textEn: '"Simha Dwaara"', next: 'wrong_password', xp: 5 }
        ]
      },
      sneak_side: {
        textKn: 'ನೀವು ಹಳೆಯ ಉದ್ಯಾನವನ ತಲುಪಿದ್ದೀರಿ. ಅಲ್ಲಿ ಒಬ್ಬ ಪುರಾತನ ವಿದ್ವಾಂಸರು ತಾಳೆಗರಿ ಓದುತ್ತಿದ್ದಾರೆ.',
        textEn: 'You reach an ancient royal garden. An old scholar is reading palm leaf manuscripts.',
        options: [
          { textKn: '"ಗುರುಗಳೇ, ಇದು ಯಾವ ಗ್ರಂಥ?" ಎಂದು ಕೇಳಿ.', textEn: 'Ask respectfully: "Gurugale, which scripture is this?"', next: 'scholar_help', xp: 15 },
          { textKn: 'ಸುಮ್ಮನೆ ಮುಂದುವರಿಯಿರಿ.', textEn: 'Continue quietly.', next: 'royal_durbar', xp: 10 }
        ]
      },
      royal_durbar: {
        textKn: 'ಅದ್ಭುತ! ನೀವು ಸುವರ್ಣ ಸಿಂಹಾಸನದ ದರ್ಬಾರ್ ಸಭಾಂಗಣ ತಲುಪಿದ್ದೀರಿ. ದಸರಾ ಉತ್ಸವದ ಆಶೀರ್ವಾದ ಪಡೆದಿದ್ದೀರಿ! 🌟',
        textEn: 'Marvelous! You reached the Golden Throne Durbar hall and received royal Dasara festival blessings! 🌟',
        options: [],
        isEnd: true,
        xpBonus: 30
      },
      wrong_password: {
        textKn: 'ಕಾವಲುಗಾರರು, "ತಪ್ಪು ಸಂಕೇತ! ಆದರೆ ನೀವು ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡಿದ್ದರಿಂದ ಕ್ಷಮಿಸಿ ಒಳಗೆ ಬಿಡುತ್ತೇವೆ!" ಎಂದರು.',
        textEn: 'Guards say: "Wrong password! But since you spoke Kannada, we forgive and welcome you!"',
        options: [
          { textKn: 'ದರ್ಬಾರ್ ಸಭಾಂಗಣಕ್ಕೆ ತೆರಳಿ', textEn: 'Proceed to Durbar Hall', next: 'royal_durbar', xp: 15 }
        ]
      },
      scholar_help: {
        textKn: 'ವಿದ್ವಾಂಸರು ನಿಮಗೆ ಪ್ರಾಚೀನ ಕನ್ನಡ ಕಾವ್ಯದ ರಹಸ್ಯ ಮಂತ್ರವನ್ನು ಹೇಳಿಕೊಟ್ಟರು: "ಸಿರಿಗನ್ನಡಂ ಗೆಲ್ಗೆ!"',
        textEn: 'The scholar taught you the legendary ancient Kannada motto: "Sirigannadam Gelge!"',
        options: [
          { textKn: 'ದರ್ಬಾರ್ ಸಭಾಂಗಣಕ್ಕೆ ತೆರಳಿ', textEn: 'Proceed to Durbar Hall', next: 'royal_durbar', xp: 20 }
        ]
      }
    }
  }
];

export default function StoryAdventure({ onXP, onToast }) {
  const [selectedStory, setSelectedStory] = useState(STORIES[0]);
  const [currentNodeId, setCurrentNodeId] = useState('start');
  const [totalXPEarned, setTotalXPEarned] = useState(0);

  const node = selectedStory.nodes[currentNodeId];

  function speak(text) {
    if (!window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'kn-IN';
    u.rate = 0.85;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  function handleChoice(opt) {
    if (opt.xp) {
      setTotalXPEarned(x => x + opt.xp);
      onXP && onXP(opt.xp);
      onToast && onToast(`Choice made! +${opt.xp} XP 🌟`, 'xp');
    }
    setCurrentNodeId(opt.next);
  }

  function restart() {
    setCurrentNodeId('start');
    setTotalXPEarned(0);
  }

  return (
    <div className="learning-screen">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
        <h1 className="page-title">🗺️ ಸಾಹಸ ಕಥೆ · AI Story RPG</h1>
        <span style={{ fontWeight: 800, color: '#38ef7d', fontSize: '0.9rem' }}>XP Earned: +{totalXPEarned}</span>
      </div>

      <div className="glass-card" style={{ maxWidth: 640, margin: '0 auto', padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '2.5rem' }}>{selectedStory.icon}</span>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffa366' }}>{selectedStory.title}</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Interactive Kannada Decision Story</div>
          </div>
        </div>

        {/* Narrative Box */}
        <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.06)', borderRadius: '14px', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
            <div style={{ fontFamily: 'Noto Sans Kannada, sans-serif', fontSize: '1.2rem', fontWeight: 800, lineHeight: 1.7, color: '#ffedd5' }}>
              {node.textKn}
            </div>
            <button onClick={() => speak(node.textKn)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.3rem' }}>
              🔊
            </button>
          </div>
          <div style={{ fontSize: '0.85rem', opacity: 0.75, marginTop: '0.6rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.6rem' }}>
            {node.textEn}
          </div>
        </div>

        {/* Action Choices */}
        {!node.isEnd ? (
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, opacity: 0.8, marginBottom: '0.8rem' }}>
              ನಿಮ್ಮ ಆಯ್ಕೆ ಏನು? (What is your decision?):
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {node.options.map((opt, i) => (
                <button
                  key={i}
                  className="btn-primary"
                  onClick={() => handleChoice(opt)}
                  style={{
                    textAlign: 'left',
                    padding: '1rem 1.2rem',
                    lineHeight: 1.4,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <span style={{ fontFamily: 'Noto Sans Kannada, sans-serif', fontWeight: 800, fontSize: '1.05rem' }}>
                    {opt.textKn}
                  </span>
                  <span style={{ fontSize: '0.78rem', opacity: 0.8 }}>
                    {opt.textEn}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>👑✨</div>
            <h2>ಅಧ್ಯಾಯ ಪೂರ್ಣಗೊಂಡಿದೆ! (Quest Complete!)</h2>
            <button className="btn-primary" onClick={restart} style={{ marginTop: '1rem', padding: '0.8rem 2rem' }}>
              Replay Adventure 🔄
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
