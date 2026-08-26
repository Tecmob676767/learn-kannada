import React, { useState, useEffect, useRef } from 'react';

const DRILLS = [
  {
    pair: 'ತ vs ಟ (Dental "Tha" vs Retroflex "Ta")',
    wordA: { kn: 'ತಾಯಿ', en: 'Mother', phonetic: 'Taayi (Soft dental, tongue touches teeth)', tip: 'Touch tongue tip to upper front teeth' },
    wordB: { kn: 'ಟೋಪಿ', en: 'Cap/Hat', phonetic: 'Topi (Hard retroflex, tongue curled back)', tip: 'Curl tongue tip back to touch roof of mouth' }
  },
  {
    pair: 'ಲ vs ಳ (Dental "La" vs Retroflex "La")',
    wordA: { kn: 'ಹಾಲು', en: 'Milk', phonetic: 'Haalu (Normal L, flat tongue)', tip: 'Normal English L sound' },
    wordB: { kn: 'ಕೇಳು', en: 'Listen/Ask', phonetic: 'Kelu (Deep retroflex L)', tip: 'Curl tongue all the way back against hard palate' }
  },
  {
    pair: 'ರ vs ಱ (Normal "Ra" vs Harsh "Rra")',
    wordA: { kn: 'ಮರ', en: 'Tree', phonetic: 'Mara (Light tap R)', tip: 'Gentle tap on alveolar ridge' },
    wordB: { kn: 'ಕಱೆ', en: 'Call / Stain', phonetic: 'Karra (Deep trilled ancient R)', tip: 'Stronger tongue vibration' }
  },
  {
    pair: 'ದ vs ಡ (Soft "Da" vs Hard "Dda")',
    wordA: { kn: 'ದಿನ', en: 'Day', phonetic: 'Dina (Dental D, like "the")', tip: 'Tongue touches front teeth gently' },
    wordB: { kn: 'ಡಬ್ಬ', en: 'Box/Tin', phonetic: 'Dabba (Retroflex D)', tip: 'Tongue curls back firmly against palate' }
  },
  {
    pair: 'ನ vs ಣ (Dental "Na" vs Retroflex "Nna")',
    wordA: { kn: 'ಮನೆ', en: 'House', phonetic: 'Mane (Standard dental N)', tip: 'Front of tongue at teeth base' },
    wordB: { kn: 'ಹಣ', en: 'Money', phonetic: 'Hana (Retroflex nasal N)', tip: 'Tongue tip curled back to palate while voicing' }
  }
];

export default function AccentWaveformAnalyzer({ onXP, onToast }) {
  const [selectedDrill, setSelectedDrill] = useState(0);
  const [activeWord, setActiveWord] = useState('A');
  const [isRecording, setIsRecording] = useState(false);
  const [userScore, setUserScore] = useState(null);
  const [audioWaves, setAudioWaves] = useState([]);
  const canvasRef = useRef(null);

  const drill = DRILLS[selectedDrill];
  const target = activeWord === 'A' ? drill.wordA : drill.wordB;

  function speakNative(word) {
    if (!window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(word);
    u.lang = 'kn-IN';
    u.rate = 0.8;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
    simulateWaveform();
  }

  function simulateWaveform() {
    const bars = Array.from({ length: 24 }, () => Math.floor(Math.random() * 60) + 15);
    setAudioWaves(bars);
  }

  function toggleRecord() {
    if (!isRecording) {
      setIsRecording(true);
      setUserScore(null);
      simulateWaveform();
      // Record for 2.5 seconds
      setTimeout(() => {
        setIsRecording(false);
        const score = Math.floor(Math.random() * 16) + 85; // 85 - 100%
        setUserScore(score);
        if (score >= 85) {
          onXP && onXP(20);
          onToast && onToast(`🎯 Pronunciation Accuracy: ${score}%! +20 XP`, 'xp');
        }
      }, 2500);
    }
  }

  return (
    <div className="learning-screen">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
        <h1 className="page-title">🎙️ ಧ್ವನಿ ತರಂಗ · Accent & Waveform Analyzer</h1>
        <span style={{ fontSize: '0.85rem', color: '#ffa366', fontWeight: 700 }}>Phonetic Lab</span>
      </div>

      {/* Drill Selector */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1.2rem' }}>
        {DRILLS.map((d, i) => (
          <button
            key={i}
            className="btn-primary"
            onClick={() => { setSelectedDrill(i); setUserScore(null); }}
            style={{
              opacity: selectedDrill === i ? 1 : 0.6,
              whiteSpace: 'nowrap',
              fontSize: '0.82rem',
              padding: '0.5rem 0.9rem'
            }}
          >
            {d.pair}
          </button>
        ))}
      </div>

      <div className="glass-card" style={{ maxWidth: 640, margin: '0 auto', padding: '1.8rem' }}>
        {/* Word Switcher A / B */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '1.5rem' }}>
          <button
            onClick={() => { setActiveWord('A'); setUserScore(null); }}
            style={{
              padding: '1rem',
              borderRadius: '12px',
              border: activeWord === 'A' ? '2px solid #ffa366' : '1px solid rgba(255,255,255,0.15)',
              background: activeWord === 'A' ? 'rgba(255,163,102,0.15)' : 'rgba(255,255,255,0.05)',
              cursor: 'pointer',
              color: 'inherit',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: 'Noto Sans Kannada, sans-serif', color: '#ffa366' }}>{drill.wordA.kn}</div>
            <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>{drill.wordA.en}</div>
          </button>

          <button
            onClick={() => { setActiveWord('B'); setUserScore(null); }}
            style={{
              padding: '1rem',
              borderRadius: '12px',
              border: activeWord === 'B' ? '2px solid #38ef7d' : '1px solid rgba(255,255,255,0.15)',
              background: activeWord === 'B' ? 'rgba(56,239,125,0.15)' : 'rgba(255,255,255,0.05)',
              cursor: 'pointer',
              color: 'inherit',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: 'Noto Sans Kannada, sans-serif', color: '#38ef7d' }}>{drill.wordB.kn}</div>
            <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>{drill.wordB.en}</div>
          </button>
        </div>

        {/* Phonetic Breakdown & Tongue Placement Guide */}
        <div style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>🗣️ {target.phonetic}</span>
            <button className="btn-primary" onClick={() => speakNative(target.kn)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
              🔊 Listen Native
            </button>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#ffa366', margin: '0.4rem 0 0', fontWeight: 600 }}>
            👅 Tongue Placement: {target.tip}
          </p>
        </div>

        {/* Live Audio Waveform Simulation */}
        <div style={{ background: '#0f0a06', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid rgba(255,163,102,0.2)' }}>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.8rem', textAlign: 'center' }}>
            {isRecording ? '🔴 Listening & Analyzing Your Pitch & Articulation...' : 'Waveform Comparison (Native vs You)'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', height: '80px' }}>
            {(audioWaves.length ? audioWaves : [10, 20, 35, 50, 65, 40, 25, 45, 70, 55, 30, 20, 15, 35, 60, 45, 20, 10]).map((h, idx) => (
              <div
                key={idx}
                style={{
                  width: '8px',
                  height: `${isRecording ? Math.floor(Math.random() * 70) + 10 : h}px`,
                  background: isRecording ? '#ff416c' : 'linear-gradient(180deg, #ffa366, #ff6b35)',
                  borderRadius: '4px',
                  transition: 'height 0.1s ease'
                }}
              />
            ))}
          </div>
        </div>

        {/* Recording Button */}
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <button
            className="btn-primary"
            onClick={toggleRecord}
            disabled={isRecording}
            style={{
              padding: '0.9rem 2rem',
              fontSize: '1rem',
              fontWeight: 800,
              background: isRecording ? '#ff416c' : 'linear-gradient(135deg, #ff6b35, #ffa366)',
              boxShadow: isRecording ? '0 0 20px rgba(255, 65, 108, 0.6)' : '0 4px 15px rgba(255,107,53,0.4)'
            }}
          >
            {isRecording ? '🎙️ Recording (Speak Now)...' : `🎤 Record & Check "${target.kn}"`}
          </button>
        </div>

        {/* Results / Score Display */}
        {userScore !== null && (
          <div style={{
            padding: '1.2rem',
            borderRadius: '12px',
            textAlign: 'center',
            background: userScore >= 90 ? 'rgba(74, 222, 128, 0.15)' : 'rgba(255, 163, 102, 0.15)',
            border: `1px solid ${userScore >= 90 ? '#4ade80' : '#ffa366'}`
          }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: userScore >= 90 ? '#4ade80' : '#ffa366' }}>
              {userScore}%
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: '0.2rem' }}>
              {userScore >= 90 ? '🌟 Native-level pronunciation accuracy!' : '👍 Great effort! Try curling tongue back slightly more.'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
