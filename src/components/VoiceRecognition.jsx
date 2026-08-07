import React, { useState, useRef } from 'react';
import { addXP } from '../utils/storage.js';
import { speakKannada } from '../utils/tts.js';

const VOICE_WORDS = [
  { kannada: 'ನಮಸ್ಕಾರ', english: 'Namaskara (Hello)', transliteration: 'namaskāra' },
  { kannada: 'ಧನ್ಯವಾದ', english: 'Dhanyavada (Thank you)', transliteration: 'dhanyavāda' },
  { kannada: 'ನೀರು', english: 'Niru (Water)', transliteration: 'nīru' },
  { kannada: 'ಮನೆ', english: 'Mane (House)', transliteration: 'mane' },
  { kannada: 'ಹೋಗು', english: 'Hogu (Go)', transliteration: 'hōgu' },
  { kannada: 'ಬಾ', english: 'Ba (Come)', transliteration: 'bā' },
  { kannada: 'ತಿನ್ನು', english: 'Tinnu (Eat)', transliteration: 'tinnu' },
  { kannada: 'ಓದು', english: 'Odu (Read)', transliteration: 'ōdu' },
  { kannada: 'ಅಮ್ಮ', english: 'Amma (Mother)', transliteration: 'amma' },
  { kannada: 'ಅಪ್ಪ', english: 'Appa (Father)', transliteration: 'appa' },
  { kannada: 'ಕನ್ನಡ', english: 'Kannada', transliteration: 'kannaḍa' },
  { kannada: 'ಹಾಲು', english: 'Halu (Milk)', transliteration: 'hālu' },
];

const normalize = (s) => s.toLowerCase().replace(/[^a-z]/g, '').trim();

const VoiceRecognition = ({ onXP, onToast }) => {
  const [wordIdx, setWordIdx] = useState(0);
  const [listening, setListening] = useState(false);
  const [result, setResult] = useState(null); // 'correct' | 'close' | 'wrong'
  const [heard, setHeard] = useState('');
  const [score, setScore] = useState({ correct: 0, tried: 0 });
  const [supported] = useState(() => !!(window.SpeechRecognition || window.webkitSpeechRecognition));
  const recognitionRef = useRef(null);

  const word = VOICE_WORDS[wordIdx];

  const startListening = () => {
    if (!supported) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = 'kn-IN';
    rec.interimResults = false;
    rec.maxAlternatives = 5;
    recognitionRef.current = rec;

    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);

    rec.onresult = (e) => {
      const alternatives = Array.from(e.results[0]).map(a => a.transcript.trim());
      const heardText = alternatives[0] || '';
      setHeard(heardText);

      const exact = alternatives.some(a => a.trim() === word.kannada.trim());
      const close = normalize(heardText).includes(normalize(word.transliteration).slice(0, 4));

      if (exact) {
        setResult('correct');
        addXP(20); onXP && onXP(20);
        setScore(s => ({ correct: s.correct + 1, tried: s.tried + 1 }));
        onToast && onToast('🎙️ Perfect pronunciation! +20 XP', 'xp');
      } else if (close) {
        setResult('close');
        addXP(8); onXP && onXP(8);
        setScore(s => ({ correct: s.correct, tried: s.tried + 1 }));
        onToast && onToast('👍 Close! Keep practicing! +8 XP', 'xp');
      } else {
        setResult('wrong');
        setScore(s => ({ ...s, tried: s.tried + 1 }));
      }
    };

    rec.onerror = () => { setListening(false); onToast && onToast('⚠️ Could not hear audio. Try again.', 'info'); };
    rec.start();
  };

  const stopListening = () => { recognitionRef.current?.stop(); setListening(false); };

  const next = () => {
    setWordIdx(i => (i + 1) % VOICE_WORDS.length);
    setResult(null); setHeard('');
  };

  const resultColor = result === 'correct' ? '#43e97b' : result === 'close' ? '#ffd200' : '#f5576c';
  const resultMsg = result === 'correct' ? '✅ Perfect!' : result === 'close' ? '👍 Almost there!' : '❌ Try again';

  return (
    <div className="learning-screen">
      <div className="page-header">
        <h2>🗣️ Voice Recognition Quiz</h2>
        <p>Hear the Kannada word, then say it aloud to check your pronunciation!</p>
      </div>

      {!supported && (
        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', borderLeft: '4px solid #ffd200' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚠️</div>
          <p style={{ color: 'var(--text-secondary)' }}>
            Voice recognition is not supported in this browser. Try <strong>Google Chrome</strong> on desktop.
          </p>
        </div>
      )}

      {supported && (
        <>
          {/* Score */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            {[
              { label: 'Correct', value: score.correct, icon: '✅', color: '#43e97b' },
              { label: 'Tried', value: score.tried, icon: '🎙️', color: '#4facfe' },
              { label: 'Word', value: `${wordIdx + 1}/${VOICE_WORDS.length}`, icon: '📝', color: '#f093fb' },
            ].map(s => (
              <div key={s.label} className="glass-card" style={{ padding: '0.75rem', textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: '1.2rem' }}>{s.icon}</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Word card */}
          <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ fontFamily: 'Noto Sans Kannada, sans-serif', fontSize: 'clamp(2.5rem, 8vw, 4rem)', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--sakura-pink)' }}>
              {word.kannada}
            </div>
            <div style={{ fontSize: '1rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '0.25rem' }}>
              {word.transliteration}
            </div>
            <div style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              {word.english}
            </div>

            {/* Listen button */}
            <button className="audio-btn" style={{ marginBottom: '1.5rem' }} onClick={() => speakKannada(word.kannada)}>
              🔊 Hear Pronunciation
            </button>

            {/* Mic button */}
            <div>
              <button
                onClick={listening ? stopListening : startListening}
                style={{
                  width: '90px', height: '90px', borderRadius: '50%',
                  background: listening ? 'linear-gradient(135deg, #f5576c, #f093fb)' : 'linear-gradient(135deg, #4facfe, #00f2fe)',
                  border: 'none', cursor: 'pointer', fontSize: '2rem',
                  boxShadow: listening ? '0 0 0 12px rgba(245,87,108,0.25), 0 0 0 24px rgba(245,87,108,0.1)' : '0 4px 20px rgba(79,172,254,0.4)',
                  transition: 'all 0.3s', animation: listening ? 'pulse 1s infinite' : 'none',
                  color: '#fff',
                }}
              >
                {listening ? '⏹' : '🎙️'}
              </button>
              <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {listening ? 'Listening… speak now!' : 'Tap to speak'}
              </div>
            </div>

            {/* Result */}
            {result && (
              <div style={{ marginTop: '1.5rem', padding: '1rem', background: `${resultColor}15`, border: `2px solid ${resultColor}`, borderRadius: '12px' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: resultColor, marginBottom: '0.25rem' }}>{resultMsg}</div>
                {heard && <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>I heard: "{heard}"</div>}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="glass-btn" style={{ flex: 1 }} onClick={() => { setResult(null); setHeard(''); }}>🔄 Retry</button>
            <button className="btn-primary" style={{ flex: 2 }} onClick={next}>Next Word →</button>
          </div>
        </>
      )}
      <style>{`@keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }`}</style>
    </div>
  );
};

export default VoiceRecognition;
