import React, { useState } from 'react';
import { speakKannada } from '../utils/tts.js';
import { playSuccess, playClick, playFanfare } from '../utils/soundEffects.js';

const SLANG_TERMS = [
  {
    slangKn: 'ಮಾಚಾ',
    slangEn: 'Macha',
    meaning: 'Bro / Dude / Close Buddy',
    formalKn: 'ಗೆಳೆಯ / ಸ್ನೇಹಿತ (Friend)',
    contextExampleKn: 'ಏನ್ ಮಾಚಾ, ಇವತ್ತು ಸಾಯಂಕಾಲ ಸಿಗೋಣ್ವಾ?',
    contextExampleEn: 'Hey macha, shall we meet this evening?',
    vibe: 'Friendly Street Greeting',
    tag: 'Essential'
  },
  {
    slangKn: 'ಸಕ್ಕತ್',
    slangEn: 'Sakkath',
    meaning: 'Super / Awesome / Extremely good',
    formalKn: 'ಅತ್ಯುತ್ತಮ / ಬಹಳ ಚೆನ್ನಾಗಿದೆ',
    contextExampleKn: 'ದೋಸೆ ಸಕ್ಕತ್ ಆಗಿದೆ ಗುರು!',
    contextExampleEn: 'The dosa is simply awesome guru!',
    vibe: 'High Energy Praise',
    tag: 'Iconic'
  },
  {
    slangKn: 'ಬೊಂಬಾಟ್',
    slangEn: 'Bombat',
    meaning: 'Fantastic / Top Notch / Mind-blowing',
    formalKn: 'ಅದ್ಭುತ (Splendid)',
    contextExampleKn: 'ಫಿಲ್ಮ್ ಬೊಂಬಾಟ್ ಆಗಿದೆ, ಮಿಸ್ ಮಾಡ್ಕೋಬೇಡ.',
    contextExampleEn: 'The movie is bombat, do not miss it.',
    vibe: 'Cinematic Thrill',
    tag: 'Classic'
  },
  {
    slangKn: 'ಸೀನ್ ಇಲ್ಲ',
    slangEn: 'Scene Illa',
    meaning: 'No problem / Chill out / Nothing to worry',
    formalKn: 'ಏನೂ ತೊಂದರೆ ಇಲ್ಲ (No problem)',
    contextExampleKn: 'ಟೆನ್ಷನ್ ತಗೋಬೇಡ ಮಾಚಾ, ನಾನಿದ್ದೀನಿ, ಸೀನ್ ಇಲ್ಲ!',
    contextExampleEn: 'Don\'t take tension bro, I am here, scene illa!',
    vibe: 'Reassurance & Chill',
    tag: 'Everyday'
  },
  {
    slangKn: 'ಚಿಂಡಿ',
    slangEn: 'Chindi',
    meaning: 'Blown away / Out of the park / Rocked it',
    formalKn: 'ಅಮೋಘ ಸಾಧನೆ (Stellar performance)',
    contextExampleKn: 'ಮ್ಯಾಚ್‌ನಲ್ಲಿ ಕೊಹ್ಲಿ ಬ್ಯಾಟಿಂಗ್ ಚಿಂಡಿ ಉಡಾಯಿಸ್ತು!',
    contextExampleEn: 'Kohli\'s batting in the match was sheer chindi!',
    vibe: 'Power & Destruction',
    tag: 'Bangalore Peak'
  },
  {
    slangKn: 'ಬೇಡ ಗುರು',
    slangEn: 'Beda Guru',
    meaning: 'No way bro / Just drop it / Forget it',
    formalKn: 'ದಯವಿಟ್ಟು ಬೇಡ (Please don\'t)',
    contextExampleKn: 'ಆ ರಸ್ತೆಯಲ್ಲಿ ಟ್ರಾಫಿಕ್ ಜಾಸ್ತಿ, ಬೇಡ ಗುರು ಬೇರೆ ದಾರಿ ಹೋಗೋಣ.',
    contextExampleEn: 'Too much traffic on that road, beda guru let\'s take another route.',
    vibe: 'Street Advice',
    tag: 'Commuter'
  },
  {
    slangKn: 'ಕಿರಿಕ್',
    slangEn: 'Kirik',
    meaning: 'Trouble / Petty Quarrel / Confusion',
    formalKn: 'ಜಗಳ / ಗಲಾಟೆ (Dispute)',
    contextExampleKn: 'ಅವನ ಜೊತೆ ಮಾತಾಡೋದು ಸುಮ್ಮನೆ ಕಿರಿಕ್!',
    contextExampleEn: 'Talking to him is unnecessary kirik!',
    vibe: 'Drama & Friction',
    tag: 'Movie Fame'
  },
  {
    slangKn: 'ಮಜಾ ಮಾಡಿ',
    slangEn: 'Maja Maadi',
    meaning: 'Have a blast / Enjoy to the fullest',
    formalKn: 'ಆನಂದಿಸಿ (Enjoy)',
    contextExampleKn: 'ವೀಕೆಂಡ್ ಬಂತು, ಎಲ್ಲರೂ ಮಜಾ ಮಾಡಿ!',
    contextExampleEn: 'Weekend is here, everyone enjoy to the fullest!',
    vibe: 'Celebration',
    tag: 'Weekend'
  },
  {
    slangKn: 'ಕಣ್ರೋ',
    slangEn: 'Kanro',
    meaning: 'Listen guys! / Look folks! (Addressing group)',
    formalKn: 'ಕೇಳಿಸಿಕೊಳ್ಳಿ (Listen all)',
    contextExampleKn: 'ನಾಳೆ ಎಕ್ಸಾಮ್ ಇದೆ ಕಣ್ರೋ, ಓದ್ಕೊಳ್ಳಿ!',
    contextExampleEn: 'Exams tomorrow guys, study up!',
    vibe: 'Group Shorthand',
    tag: 'College'
  }
];

const QUIZ_ITEMS = [
  {
    question: 'How do you say "Awesome! No problem bro!" in Bangalore slang?',
    options: [
      { text: 'ಸಕ್ಕತ್! ಸೀನ್ ಇಲ್ಲ ಮಾಚಾ!', correct: true },
      { text: 'ಬಹಳ ತೊಂದರೆ ಇದೆ ಸ್ನೇಹಿತರೆ.', correct: false },
      { text: 'ಊಟ ಆಯ್ತಾ ಗುರು?', correct: false },
      { text: 'ಗೊತ್ತಿಲ್ಲ ಕಣ್ರೀ.', correct: false }
    ],
    explanation: '"Sakkath" = Awesome, "Scene illa" = No problem, "Macha" = Bro!'
  },
  {
    question: 'What does someone mean when they say "ಅವನ ಹತ್ತಿರ ಕಿರಿಕ್ ಬೇಡ"?',
    options: [
      { text: 'Don\'t get into fights or trouble with him.', correct: true },
      { text: 'He has tasty snacks.', correct: false },
      { text: 'He is buying an auto rickshaw.', correct: false },
      { text: 'He is waiting at metro station.', correct: false }
    ],
    explanation: '"Kirik" is Bangalore slang for unnecessary quarrel or nuisance.'
  },
  {
    question: 'If you loved a filter coffee immensely, which slang phrase fits best?',
    options: [
      { text: 'ಕಾಫಿ ಬೊಂಬಾಟ್ ಆಗಿದೆ ಗುರು!', correct: true },
      { text: 'ಕಾಫಿ ಬೇಡ ಗುರು.', correct: false },
      { text: 'ಚಿಲ್ಲರೆ ಇಲ್ಲ.', correct: false },
      { text: 'ಬೈ-ಟೂ ಬೇಡ.', correct: false }
    ],
    explanation: '"Bombat" indicates top-tier, fantastic quality!'
  }
];

export default function BangaloreSlangDecoder({ onXP, onToast }) {
  const [tab, setTab] = useState('explorer'); // 'explorer' | 'quiz'
  const [activeSlang, setActiveSlang] = useState(SLANG_TERMS[0]);
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(null);
  const [scoreCount, setScoreCount] = useState(0);

  const handleSelectSlang = (item) => {
    playClick();
    setActiveSlang(item);
    speakKannada(item.slangKn);
  };

  const handleQuizAnswer = (opt) => {
    playClick();
    setQuizAnswered(opt);
    if (opt.correct) {
      playSuccess();
      setScoreCount(s => s + 1);
      onXP && onXP(25);
      onToast && onToast('🔥 Slang Pro! +25 XP', 'xp');
    }
  };

  const nextQuiz = () => {
    playClick();
    setQuizAnswered(null);
    setQuizIdx(i => (i + 1) % QUIZ_ITEMS.length);
  };

  return (
    <div className="learning-screen" style={{ maxWidth: 840, margin: '0 auto', padding: '1rem' }}>
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.8rem' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0, fontSize: '1.6rem' }}>
            🤙 ಬೆಂಗಳೂರು ಸ್ಲ್ಯಾಂಗ್ ಡಿಕೋಡರ್
          </h1>
          <p style={{ margin: '0.2rem 0 0', opacity: 0.8, fontSize: '0.9rem' }}>
            Bangalore Colloquial & Street Slang Decoder · Talk like a true Bangalorean!
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => { playClick(); setTab('explorer'); }}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '10px',
              border: 'none',
              background: tab === 'explorer' ? 'linear-gradient(135deg, #ff6b35, #ffa366)' : 'rgba(255,255,255,0.08)',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            📚 Slang Deck
          </button>
          <button
            onClick={() => { playClick(); setTab('quiz'); }}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '10px',
              border: 'none',
              background: tab === 'quiz' ? 'linear-gradient(135deg, #ff6b35, #ffa366)' : 'rgba(255,255,255,0.08)',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            🎯 Street Quiz
          </button>
        </div>
      </div>

      {tab === 'explorer' ? (
        <div>
          {/* Active Highlight Card */}
          <div className="glass-card" style={{ padding: '1.8rem', borderRadius: '16px', border: '1px solid rgba(255, 107, 53, 0.3)', marginBottom: '1.5rem', background: 'rgba(255, 107, 53, 0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.8rem' }}>
              <div>
                <span style={{ background: '#ffa366', color: '#1c0c02', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', marginRight: '0.6rem' }}>
                  {activeSlang.tag}
                </span>
                <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>Vibe: <strong>{activeSlang.vibe}</strong></span>
                <h2 style={{ fontFamily: 'Noto Sans Kannada', fontSize: '2.4rem', margin: '0.4rem 0 0.2rem', color: '#ffa366' }}>
                  {activeSlang.slangKn} <span style={{ fontSize: '1.4rem', color: '#fff', fontWeight: 600 }}>({activeSlang.slangEn})</span>
                </h2>
                <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                  Meaning: {activeSlang.meaning}
                </div>
              </div>
              <button
                onClick={() => speakKannada(`${activeSlang.slangKn}. ${activeSlang.contextExampleKn}`)}
                style={{
                  background: 'linear-gradient(135deg, #ff6b35, #ffa366)',
                  border: 'none',
                  color: '#fff',
                  padding: '0.75rem 1.4rem',
                  borderRadius: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                🔊 Listen in Context
              </button>
            </div>

            {/* Formal vs Street comparison */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginTop: '1.2rem' }}>
              <div style={{ background: 'rgba(0,0,0,0.25)', padding: '1rem', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.75rem', color: '#ffa366', fontWeight: 800, marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                  🗣️ In Actual Street Conversation:
                </div>
                <div style={{ fontFamily: 'Noto Sans Kannada', fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.2rem' }}>
                  "{activeSlang.contextExampleKn}"
                </div>
                <div style={{ fontSize: '0.85rem', opacity: 0.85 }}>
                  "{activeSlang.contextExampleEn}"
                </div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.25)', padding: '1rem', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.75rem', color: '#4ade80', fontWeight: 800, marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                  📖 Formal Textbook Equivalent:
                </div>
                <div style={{ fontFamily: 'Noto Sans Kannada', fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.2rem' }}>
                  {activeSlang.formalKn}
                </div>
                <div style={{ fontSize: '0.85rem', opacity: 0.85 }}>
                  Use this in polite corporate or academic environments.
                </div>
              </div>
            </div>
          </div>

          {/* Grid of Slang Cards */}
          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffa366', marginBottom: '0.8rem' }}>
            Choose a Slang to Decode:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.8rem' }}>
            {SLANG_TERMS.map((item, idx) => (
              <div
                key={idx}
                onClick={() => handleSelectSlang(item)}
                style={{
                  padding: '1rem',
                  borderRadius: '12px',
                  border: activeSlang.slangKn === item.slangKn ? '2px solid #ffa366' : '1px solid rgba(255,255,255,0.1)',
                  background: activeSlang.slangKn === item.slangKn ? 'rgba(255, 107, 53, 0.2)' : 'rgba(255,255,255,0.03)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ fontFamily: 'Noto Sans Kannada', fontSize: '1.3rem', fontWeight: 800, color: '#ffa366' }}>
                  {item.slangKn}
                </div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{item.slangEn}</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '0.2rem' }}>{item.meaning}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Quiz Mode */
        <div className="glass-card" style={{ padding: '1.8rem', borderRadius: '16px', border: '1px solid rgba(255, 107, 53, 0.25)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#ffa366', fontWeight: 800 }}>
              Question {quizIdx + 1} of {QUIZ_ITEMS.length}
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>
              Score: {scoreCount} Correct
            </span>
          </div>

          <h2 style={{ fontSize: '1.2rem', margin: '0 0 1.2rem' }}>
            {QUIZ_ITEMS[quizIdx].question}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.2rem' }}>
            {QUIZ_ITEMS[quizIdx].options.map((opt, i) => {
              const isSelected = quizAnswered === opt;
              return (
                <div
                  key={i}
                  onClick={() => !quizAnswered && handleQuizAnswer(opt)}
                  style={{
                    padding: '1rem',
                    borderRadius: '12px',
                    border: isSelected
                      ? opt.correct ? '2px solid #4ade80' : '2px solid #ef4444'
                      : '1px solid rgba(255,255,255,0.1)',
                    background: isSelected
                      ? opt.correct ? 'rgba(74, 222, 128, 0.15)' : 'rgba(239, 68, 68, 0.15)'
                      : 'rgba(255,255,255,0.03)',
                    cursor: quizAnswered ? 'default' : 'pointer',
                    fontFamily: 'Noto Sans Kannada',
                    fontSize: '1.05rem',
                    fontWeight: 700
                  }}
                >
                  {opt.text}
                </div>
              );
            })}
          </div>

          {quizAnswered && (
            <div style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', marginBottom: '1rem' }}>
              <div style={{ fontWeight: 800, color: quizAnswered.correct ? '#4ade80' : '#ef4444', marginBottom: '0.3rem' }}>
                {quizAnswered.correct ? '🎉 Correct!' : '❌ Not quite!'}
              </div>
              <div style={{ fontSize: '0.85rem', opacity: 0.85 }}>
                {QUIZ_ITEMS[quizIdx].explanation}
              </div>
              <div style={{ textAlign: 'right', marginTop: '0.8rem' }}>
                <button
                  onClick={nextQuiz}
                  style={{
                    background: 'linear-gradient(135deg, #ff6b35, #ffa366)',
                    border: 'none',
                    color: '#fff',
                    padding: '0.6rem 1.4rem',
                    borderRadius: '8px',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  Next Question ➔
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
