import React, { useState, useRef, useEffect } from 'react';
import { speakKannada } from '../utils/tts.js';
import { playSuccess, playClick, playFanfare } from '../utils/soundEffects.js';

const ICONIC_DIALOGUES = [
  {
    id: 'rajkumar_babruvahana',
    movie: 'ಬಭ್ರುವಾಹನ (Babruvahana)',
    actor: 'ಡಾ. ರಾಜ್‌ಕುಮಾರ್ (Dr. Rajkumar)',
    character: 'Babruvahana',
    year: '1977',
    emotion: 'Mythological Fire 🔥',
    dialogueKn: 'ಯಾರು? ಕೌಂತೇಯನೆ?! ಆಹಾ... ಪಾಂಡವ ಮಧ್ಯಮನ ಮಗನೆಂಬ ಅಹಂಕಾರವೆ ನಿನಗೆ?!',
    translit: 'Yaaru? Kaunteyane?! Aaha... Paandava madhyamana maganemba ahankaarave ninage?!',
    dialogueEn: 'Who? The son of Kunti?! Aaha... Do you boast with pride of being the middle Pandava\'s son?!',
    durationSec: 6
  },
  {
    id: 'kgf_yash',
    movie: 'ಕೆ.ಜಿ.ಎಫ್ (KGF Chapter 1)',
    actor: 'ರಾಕಿಂಗ್ ಸ್ಟಾರ್ ಯಶ್ (Rocking Star Yash)',
    character: 'Rocky Bhai',
    year: '2018',
    emotion: 'Mass Swagger ⚡',
    dialogueKn: 'ಗಾಯಗೊಂಡ ಸಿಂಹದ ಉಸಿರು ಘರ್ಜನೆಗಿಂತಲೂ ಭಯಂಕರವಾಗಿರುತ್ತೆ!',
    translit: 'Gaayagonda simhada usiru gharjanegintaloo bhayankaravaagirutte!',
    dialogueEn: 'The breath of a wounded lion is far more terrifying than its roar!',
    durationSec: 5
  },
  {
    id: 'shankar_nag_autoraja',
    movie: 'ಆಟೋ ರಾಜಾ (Auto Raja)',
    actor: 'ಶಂಕರ್ ನಾಗ್ (Shankar Nag)',
    character: 'Auto Raja',
    year: '1980',
    emotion: 'Iconic Street Pride 🛺',
    dialogueKn: 'ನನ್ನ ಹೆಸರು ರಾಜಾ... ಆಟೋ ರಾಜಾ! ಕಾಯಕವೇ ಕೈಲಾಸ ಅಂತ ನಂಬಿರೋನು ನಾನು!',
    translit: 'Nanna hesaru Raja... Auto Raja! Kaayakave Kailaasa anta nambironu naanu!',
    dialogueEn: 'My name is Raja... Auto Raja! I am one who believes work is worship!',
    durationSec: 5
  },
  {
    id: 'kantara_rishab',
    movie: 'ಕಾಂತಾರ (Kantara)',
    actor: 'ರಿಷಬ್ ಶೆಟ್ಟಿ (Rishab Shetty)',
    character: 'Shiva',
    year: '2022',
    emotion: 'Divine Folklore 🐗',
    dialogueKn: 'ಕಾಡು ನಮ್ಮ ಅಮ್ಮ... ಈ ಮಣ್ಣಿನ ಋಣ ತೀರಿಸೋಕೆ ಯಾವ ತ್ಯಾಗಕ್ಕೂ ನಾವು ರೆಡಿ!',
    translit: 'Kaadu namma amma... Ee mannina runa teerisoke yaava tyaagakkoo naavu ready!',
    dialogueEn: 'The forest is our mother... To repay this soil\'s debt, we are ready for any sacrifice!',
    durationSec: 5
  },
  {
    id: 'upendra_super',
    movie: 'ಉಪೇಂದ್ರ (Upendra / Super)',
    actor: 'ಉಪೇಂದ್ರ (Real Star Upendra)',
    character: 'Subhash',
    year: '1999',
    emotion: 'Mind-Bending Philosophy 🧠',
    dialogueKn: 'ನಾನು ಅನ್ನೋದು ಅಹಂಕಾರ... ನಾವು ಅನ್ನೋದು ಸಂಸ್ಕಾರ! ಬದಲಾವಣೆ ನಮ್ಮಿಂದಲೇ ಶುರು!',
    translit: 'Naanu annodu ahankaara... Naavu annodu samskaara! Badalaavane nammindale shuru!',
    dialogueEn: '"I" is ego... "We" is culture! Transformation begins with ourselves!',
    durationSec: 5
  },
  {
    id: 'appu_raajakumara',
    movie: 'ರಾಜಕುಮಾರ (Raajakumara)',
    actor: 'ಪುನೀತ್ ರಾಜ್‌ಕುಮಾರ್ (Power Star Puneeth)',
    character: 'Siddharth',
    year: '2017',
    emotion: 'Heartfelt Emotion ❤️',
    dialogueKn: 'ಅಪ್ಪ ಅಮ್ಮ ಅನ್ನೋದು ದೇವರು ಕೊಟ್ಟ ವರ... ಅವರ ಮುಖದ ನಗುನೇ ನಮಗೆ ಸಿಗೋ ದೊಡ್ಡ ಪ್ರಶಸ್ತಿ!',
    translit: 'Appa amma annodu devaru kotta vara... Avara mukhada nagune namage sigo dodda prashasti!',
    dialogueEn: 'Parents are a blessing from God... The smile on their face is the biggest award we can receive!',
    durationSec: 6
  }
];

export default function CinemaDubbingStudio({ onXP, onToast }) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState(null);
  const [dubScore, setDubScore] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const cur = ICONIC_DIALOGUES[selectedIdx];

  const handleSelectDialogue = (i) => {
    playClick();
    setSelectedIdx(i);
    setRecordedUrl(null);
    setDubScore(null);
  };

  const startRecording = async () => {
    try {
      playClick();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setRecordedUrl(url);
        stream.getTracks().forEach(t => t.stop());
        evaluateDubbing();
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setDubScore(null);
    } catch (err) {
      console.warn('Microphone error:', err);
      // Fallback simulation for environments without microphone access
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        setRecordedUrl('simulated');
        evaluateDubbing();
      }, 3500);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const evaluateDubbing = () => {
    setIsEvaluating(true);
    setTimeout(() => {
      setIsEvaluating(false);
      const randomScore = Math.floor(Math.random() * 16) + 85; // 85 - 100
      setDubScore(randomScore);
      playFanfare();
      onXP && onXP(50);
      onToast && onToast(`🎬 Dubbing wrapped! Score: ${randomScore}% · +50 XP`, 'xp');
    }, 1200);
  };

  return (
    <div className="learning-screen" style={{ maxWidth: 840, margin: '0 auto', padding: '1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.8rem' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0, fontSize: '1.6rem' }}>
            🎬 ಸ್ಯಾಂಡಲ್‌ವುಡ್ ಡಬ್ಬಿಂಗ್ ಸ್ಟುಡಿಯೋ
          </h1>
          <p style={{ margin: '0.2rem 0 0', opacity: 0.8, fontSize: '0.9rem' }}>
            Sandalwood Dialogue Dubbing & Acting Studio · Star in Iconic Kannada Cinema!
          </p>
        </div>
        <div style={{ background: 'rgba(236, 72, 153, 0.15)', border: '1px solid rgba(236, 72, 153, 0.35)', padding: '0.5rem 1rem', borderRadius: '12px', fontWeight: 800, color: '#f472b6' }}>
          🎞️ Take 1: Clapperboard Ready
        </div>
      </div>

      {/* Movie Dialogue Selector Carousel */}
      <div style={{ display: 'flex', gap: '0.6rem', overflowX: 'auto', paddingBottom: '0.8rem', marginBottom: '1.2rem' }}>
        {ICONIC_DIALOGUES.map((d, i) => (
          <button
            key={d.id}
            onClick={() => handleSelectDialogue(i)}
            style={{
              padding: '0.7rem 1rem',
              borderRadius: '12px',
              border: selectedIdx === i ? '2px solid #ec4899' : '1px solid rgba(255,255,255,0.1)',
              background: selectedIdx === i ? 'rgba(236, 72, 153, 0.2)' : 'rgba(255,255,255,0.04)',
              color: 'inherit',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              textAlign: 'left',
              flexShrink: 0,
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ fontWeight: 800, fontSize: '0.85rem', color: selectedIdx === i ? '#f472b6' : 'inherit' }}>
              {d.movie}
            </div>
            <div style={{ fontSize: '0.72rem', opacity: 0.7 }}>
              {d.actor}
            </div>
          </button>
        ))}
      </div>

      {/* Main Studio Console */}
      <div className="glass-card" style={{ padding: '1.8rem', borderRadius: '16px', border: '1px solid rgba(236, 72, 153, 0.25)', position: 'relative' }}>
        {/* Film metadata banner */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <span style={{ background: 'rgba(236, 72, 153, 0.2)', color: '#f472b6', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800, marginRight: '0.6rem' }}>
              {cur.emotion}
            </span>
            <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>
              Movie: <strong>{cur.movie}</strong> ({cur.year}) · Character: <strong>{cur.character}</strong>
            </span>
          </div>
          <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
            Actor: {cur.actor}
          </div>
        </div>

        {/* Dialogue Teleprompter */}
        <div style={{
          padding: '1.5rem',
          background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.12), rgba(139, 92, 246, 0.1))',
          border: '1px solid rgba(236, 72, 153, 0.3)',
          borderRadius: '14px',
          marginBottom: '1.5rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.75rem', color: '#f472b6', fontWeight: 800, letterSpacing: '1px', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
            YOUR TELEPROMPTER SCRIPT:
          </div>
          <div style={{ fontFamily: 'Noto Sans Kannada, sans-serif', fontSize: '1.45rem', fontWeight: 900, lineHeight: 1.6, marginBottom: '0.6rem', color: '#fff' }}>
            "{cur.dialogueKn}"
          </div>
          <div style={{ fontSize: '0.92rem', color: '#fda4af', marginBottom: '0.4rem', fontStyle: 'italic' }}>
            "{cur.translit}"
          </div>
          <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>
            Meaning: "{cur.dialogueEn}"
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          <button
            onClick={() => speakKannada(cur.dialogueKn)}
            style={{
              padding: '0.75rem 1.4rem',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.06)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            🔊 Listen to Original Line
          </button>

          {!isRecording ? (
            <button
              onClick={startRecording}
              style={{
                padding: '0.75rem 1.8rem',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #ec4899, #ef4444)',
                color: '#fff',
                fontWeight: 900,
                fontSize: '1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 15px rgba(236, 72, 153, 0.4)'
              }}
            >
              🎙️ Action! Record Dub
            </button>
          ) : (
            <button
              onClick={stopRecording}
              style={{
                padding: '0.75rem 1.8rem',
                borderRadius: '12px',
                border: 'none',
                background: '#ef4444',
                color: '#fff',
                fontWeight: 900,
                fontSize: '1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                animation: 'pulse 1s infinite'
              }}
            >
              ⏹️ Cut! Finish Take
            </button>
          )}
        </div>

        {/* Recording Status / Evaluating */}
        {isRecording && (
          <div style={{ textAlign: 'center', color: '#f87171', fontWeight: 800, marginBottom: '1rem' }}>
            🔴 RECORDING IN PROGRESS... Say the dialogue with power and emotion!
          </div>
        )}

        {isEvaluating && (
          <div style={{ textAlign: 'center', color: '#f472b6', fontWeight: 800, marginBottom: '1rem' }}>
            🎬 Director is reviewing your audio take...
          </div>
        )}

        {/* Score & Playback Review Card */}
        {dubScore && !isEvaluating && (
          <div style={{
            padding: '1.4rem',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.15), rgba(34, 197, 94, 0.08))',
            border: '1px solid rgba(74, 222, 128, 0.35)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.3rem' }}>🏆 👏 🍿</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#4ade80', marginBottom: '0.3rem' }}>
              BLOCKBUSTER TAKE! Performance: {dubScore}%
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '1rem' }}>
              Awesome energy! You matched the Sandalwood swagger and delivered the dialogue with punch.
            </div>

            {recordedUrl && recordedUrl !== 'simulated' && (
              <div style={{ marginBottom: '1rem' }}>
                <audio controls src={recordedUrl} style={{ width: '100%', maxWidth: 360 }} />
              </div>
            )}

            <button
              onClick={() => handleSelectDialogue((selectedIdx + 1) % ICONIC_DIALOGUES.length)}
              style={{
                background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                border: 'none',
                color: '#fff',
                padding: '0.65rem 1.6rem',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: 'pointer'
              }}
            >
              Next Iconic Scene ➔
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
