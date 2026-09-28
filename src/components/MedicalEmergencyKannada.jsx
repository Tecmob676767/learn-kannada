import React, { useState } from 'react';
import { speakKannada } from '../utils/tts.js';
import { playSuccess, playClick, playFanfare } from '../utils/soundEffects.js';

const SYMPTOMS = [
  { id: 'fever', icon: '🌡️', kn: 'ಜ್ವರ', en: 'Fever', translit: 'Jvara', phraseKn: 'ನನಗೆ ನಿನ್ನೆಯಿಂದ ತುಂಬಾ ಜ್ವರ ಇದೆ.', phraseEn: 'I have had high fever since yesterday.' },
  { id: 'headache', icon: '🤕', kn: 'ತಲೆ ನೋವು', en: 'Headache', translit: 'Tale novu', phraseKn: 'ತಲೆ ವಿಪರೀತ ನೋಯುತ್ತಿದೆ.', phraseEn: 'My head is paining severely.' },
  { id: 'cough', icon: '😷', kn: 'ಕೆಮ್ಮು ಮತ್ತು ನೆಗಡಿ', en: 'Cough & Cold', translit: 'Kemmu mattu negadi', phraseKn: 'ವಿಪರೀತ ಒಣ ಕೆಮ್ಮು ಮತ್ತು ಗಂಟಲು ನೋವಿದೆ.', phraseEn: 'Severe dry cough and sore throat.' },
  { id: 'stomach', icon: '🤢', kn: 'ಹೊಟ್ಟೆ ನೋವು', en: 'Stomach Pain', translit: 'Hotte novu', phraseKn: 'ಹೊಟ್ಟೆ ತುಂಬಾ ನೋಯುತ್ತಿದೆ, ವಾಂತಿ ಬರ್ತಿದೆ.', phraseEn: 'Stomach hurts badly, feeling nausea.' },
  { id: 'chest', icon: '🫀', kn: 'ಎದೆ ನೋವು', en: 'Chest Pain', translit: 'Ede novu', phraseKn: 'ಎದೆ ಬಿಗಿತ ಮತ್ತು ಉಸಿರಾಟದ ತೊಂದರೆ ಇದೆ.', phraseEn: 'Chest tightness and breathing difficulty.' },
  { id: 'dizzy', icon: '💫', kn: 'ತಲೆ ಸುತ್ತುವುದು', en: 'Dizziness', translit: 'Tale suttuvudu', phraseKn: 'ನನಗೆ ತಲೆ ತಿರುಗುತ್ತಿದೆ, ಆಯಾಸವಾಗಿದೆ.', phraseEn: 'I feel dizzy and exhausted.' },
  { id: 'allergy', icon: '🩹', kn: 'ತುರಿಕೆ / ಅಲರ್ಜಿ', en: 'Itching / Allergy', translit: 'Turike / Allergy', phraseKn: 'ಚರ್ಮದ ಮೇಲೆ ಕೆಂಪು ಗುಳ್ಳೆಗಳು ಮತ್ತು ತುರಿಕೆ ಇದೆ.', phraseEn: 'Red rashes and itching on skin.' },
];

const PHARMACY_DOSAGES = [
  {
    instructionKn: 'ಊಟ ಆದಮೇಲೆ ಒಂದು ಮಾತ್ರೆ ತಗೊಳ್ಳಿ.',
    instructionEn: 'Take one tablet after meals.',
    translit: 'Oota aadmele ondu maatre tagolli.',
    badge: 'Post-Meal',
    badgeColor: '#10b981'
  },
  {
    instructionKn: 'ಬೆಳಗ್ಗೆ ಖಾಲಿ ಹೊಟ್ಟೆಯಲ್ಲಿ ಸೇವಿಸಿ.',
    instructionEn: 'Take in the morning on an empty stomach.',
    translit: 'Belagge khaali hotteyalli sevisi.',
    badge: 'Empty Stomach',
    badgeColor: '#f59e0b'
  },
  {
    instructionKn: 'ರಾತ್ರಿ ಮಲಗುವ ಮುನ್ನ ಬಿಸಿ ನೀರಿನ ಜೊತೆ ತಗೊಳ್ಳಿ.',
    instructionEn: 'Take before sleeping at night with warm water.',
    translit: 'Raatri malaguva munna bisi neerina jote tagolli.',
    badge: 'Bedtime',
    badgeColor: '#6366f1'
  },
  {
    instructionKn: 'ದಿನಕ್ಕೆ ಮೂರು ಬಾರಿ (ಬೆಳಗ್ಗೆ, ಮಧ್ಯಾಹ್ನ, ರಾತ್ರಿ).',
    instructionEn: 'Three times a day (Morning, Afternoon, Night).',
    translit: 'Dinakke mooru baari (Belagge, Madhyaahna, Raatri).',
    badge: 'TDS (3x Daily)',
    badgeColor: '#ec4899'
  },
  {
    instructionKn: 'ಈ ಸಿರಪ್ ಅನ್ನು ಕುಡಿಯುವ ಮುನ್ನ ಚೆನ್ನಾಗಿ ಅಲ್ಲಾಡಿಸಿ.',
    instructionEn: 'Shake this syrup bottle well before drinking.',
    translit: 'Ee syrup annu kudiyuva munna chennaagi allaadisi.',
    badge: 'Shake Well',
    badgeColor: '#06b6d4'
  }
];

const EMERGENCY_SOS = [
  { kn: 'ಆಂಬ್ಯುಲೆನ್ಸ್ ಬೇಗ ಕಳಿಸಿ! (108)', en: 'Send an ambulance quickly! (Dial 108)' },
  { kn: 'ಹತ್ತಿರದ ಆಸ್ಪತ್ರೆ ಅಥವಾ ಕ್ಲಿನಿಕ್ ಎಲ್ಲಿದೆ?', en: 'Where is the nearest hospital or clinic?' },
  { kn: 'ಇಲ್ಲಿ ತುರ್ತು ವೈದ್ಯಕೀಯ ಸಹಾಯ ಬೇಕಾಗಿದೆ!', en: 'Emergency medical help needed here!' },
  { kn: 'ರಕ್ತದೊತ್ತಡ (BP) ಮತ್ತು ಶುಗರ್ ಪರೀಕ್ಷೆ ಮಾಡಿ.', en: 'Please check blood pressure and blood sugar.' },
];

export default function MedicalEmergencyKannada({ onXP, onToast }) {
  const [selectedSymptom, setSelectedSymptom] = useState(SYMPTOMS[0]);
  const [activeTab, setActiveTab] = useState('symptoms'); // 'symptoms' | 'pharmacy' | 'sos'

  const handleSelectSymptom = (sym) => {
    playClick();
    setSelectedSymptom(sym);
    speakKannada(sym.phraseKn);
    onXP && onXP(15);
    onToast && onToast(`🩺 Practiced symptom phrase! +15 XP`, 'xp');
  };

  return (
    <div className="learning-screen" style={{ maxWidth: 840, margin: '0 auto', padding: '1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.8rem' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0, fontSize: '1.6rem' }}>
            🏥 ಆಸ್ಪತ್ರೆ & ವೈದ್ಯಕೀಯ ಕನ್ನಡ
          </h1>
          <p style={{ margin: '0.2rem 0 0', opacity: 0.8, fontSize: '0.9rem' }}>
            Medical, Clinic & Pharmacy Survival Kannada Guide
          </p>
        </div>

        {/* Tab Controls */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => { playClick(); setActiveTab('symptoms'); }}
            style={{
              padding: '0.5rem 0.9rem',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'symptoms' ? 'linear-gradient(135deg, #ef4444, #f87171)' : 'rgba(255,255,255,0.08)',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            🩺 Symptoms
          </button>
          <button
            onClick={() => { playClick(); setActiveTab('pharmacy'); }}
            style={{
              padding: '0.5rem 0.9rem',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'pharmacy' ? 'linear-gradient(135deg, #10b981, #34d399)' : 'rgba(255,255,255,0.08)',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            💊 Pharmacy & Dosage
          </button>
          <button
            onClick={() => { playClick(); setActiveTab('sos'); }}
            style={{
              padding: '0.5rem 0.9rem',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'sos' ? 'linear-gradient(135deg, #f59e0b, #fbbf24)' : 'rgba(255,255,255,0.08)',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            🚨 Emergency SOS
          </button>
        </div>
      </div>

      {activeTab === 'symptoms' && (
        <div>
          {/* Selected Symptom Focus Card */}
          <div className="glass-card" style={{ padding: '1.6rem', borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.3)', marginBottom: '1.5rem', background: 'rgba(239, 68, 68, 0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <span style={{ fontSize: '2.5rem' }}>{selectedSymptom.icon}</span>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.4rem', fontFamily: 'Noto Sans Kannada' }}>{selectedSymptom.kn}</h2>
                  <div style={{ fontSize: '0.85rem', opacity: 0.75 }}>{selectedSymptom.en} · ({selectedSymptom.translit})</div>
                </div>
              </div>
              <button
                onClick={() => speakKannada(selectedSymptom.phraseKn)}
                style={{
                  background: 'linear-gradient(135deg, #ef4444, #f87171)',
                  border: 'none',
                  color: '#fff',
                  padding: '0.6rem 1.2rem',
                  borderRadius: '10px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                🔊 Listen
              </button>
            </div>

            {/* What to tell doctor */}
            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '1.2rem', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.78rem', color: '#f87171', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                How to explain to Doctor (ವೈದ್ಯರಿಗೆ ಹೇಳುವ ರೀತಿ):
              </div>
              <div style={{ fontFamily: 'Noto Sans Kannada', fontSize: '1.2rem', fontWeight: 800, lineHeight: 1.5, marginBottom: '0.3rem' }}>
                "{selectedSymptom.phraseKn}"
              </div>
              <div style={{ fontSize: '0.9rem', opacity: 0.85 }}>
                "{selectedSymptom.phraseEn}"
              </div>
            </div>
          </div>

          {/* Grid of Symptoms */}
          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffa366', marginBottom: '0.8rem' }}>
            ರೋಗ ಲಕ್ಷಣವನ್ನು ಆಯ್ಕೆಮಾಡಿ (Select Symptom to Practice):
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.8rem' }}>
            {SYMPTOMS.map((sym) => (
              <div
                key={sym.id}
                onClick={() => handleSelectSymptom(sym)}
                style={{
                  padding: '1rem',
                  borderRadius: '12px',
                  border: selectedSymptom.id === sym.id ? '2px solid #ef4444' : '1px solid rgba(255,255,255,0.1)',
                  background: selectedSymptom.id === sym.id ? 'rgba(239, 68, 68, 0.18)' : 'rgba(255,255,255,0.03)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.8rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <span style={{ fontSize: '1.8rem' }}>{sym.icon}</span>
                <div>
                  <div style={{ fontFamily: 'Noto Sans Kannada', fontWeight: 700, fontSize: '1rem' }}>{sym.kn}</div>
                  <div style={{ fontSize: '0.78rem', opacity: 0.7 }}>{sym.en}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'pharmacy' && (
        <div>
          <div style={{ marginBottom: '1.2rem', fontSize: '0.9rem', opacity: 0.85 }}>
            Understanding dosage instructions at medical shops and pharmacies (ಔಷಧಿ ಅಂಗಡಿ ಮಾರ್ಗದರ್ಶಿ):
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {PHARMACY_DOSAGES.map((dosage, idx) => (
              <div
                key={idx}
                className="glass-card"
                style={{
                  padding: '1.2rem',
                  borderRadius: '14px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1rem'
                }}
              >
                <div style={{ flex: 1 }}>
                  <span
                    style={{
                      display: 'inline-block',
                      background: dosage.badgeColor,
                      color: '#fff',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '6px',
                      marginBottom: '0.5rem'
                    }}
                  >
                    {dosage.badge}
                  </span>
                  <div style={{ fontFamily: 'Noto Sans Kannada', fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.25rem' }}>
                    {dosage.instructionKn}
                  </div>
                  <div style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: '0.2rem' }}>
                    {dosage.instructionEn}
                  </div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.6, fontStyle: 'italic' }}>
                    Pronunciation: {dosage.translit}
                  </div>
                </div>
                <button
                  onClick={() => { playClick(); speakKannada(dosage.instructionKn); }}
                  style={{
                    background: 'rgba(16, 185, 129, 0.2)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    color: '#34d399',
                    borderRadius: '50%',
                    width: 44,
                    height: 44,
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    flexShrink: 0
                  }}
                  title="Audio"
                >
                  🔊
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'sos' && (
        <div>
          <div style={{
            padding: '1.2rem',
            borderRadius: '14px',
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <span style={{ fontSize: '2.5rem' }}>🚨</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fbbf24' }}>
                ತುರ್ತು ಸಹಾಯ ಸಂಖ್ಯೆಗಳು (Emergency Numbers in Karnataka)
              </div>
              <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                Ambulance: <strong>108</strong> · Police: <strong>112 / 100</strong> · Fire: <strong>101</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {EMERGENCY_SOS.map((sos, i) => (
              <div
                key={i}
                className="glass-card"
                style={{
                  padding: '1.2rem',
                  borderRadius: '14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                <div>
                  <div style={{ fontFamily: 'Noto Sans Kannada', fontSize: '1.2rem', fontWeight: 800, color: '#f87171', marginBottom: '0.3rem' }}>
                    "{sos.kn}"
                  </div>
                  <div style={{ fontSize: '0.88rem', opacity: 0.85 }}>
                    "{sos.en}"
                  </div>
                </div>
                <button
                  onClick={() => { playClick(); speakKannada(sos.kn); }}
                  style={{
                    background: 'linear-gradient(135deg, #ef4444, #f87171)',
                    border: 'none',
                    color: '#fff',
                    borderRadius: '10px',
                    padding: '0.6rem 1rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    flexShrink: 0
                  }}
                >
                  🔊 Speak Out
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
