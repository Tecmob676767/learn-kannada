import React, { useState } from 'react';
import { speakKannada } from '../utils/tts.js';
import { playClick, playSuccess } from '../utils/soundEffects.js';

export default function GoogleTranslateWidget({ onToast }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('kn');
  const [loading, setLoading] = useState(false);

  const LANGUAGES = [
    { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिन्दी (Hindi)' },
    { code: 'ta', name: 'தமிழ் (Tamil)' },
    { code: 'te', name: 'తెలుగు (Telugu)' },
  ];

  const handleTranslate = async (textToTranslate = inputText) => {
    const query = textToTranslate.trim();
    if (!query) return;

    setLoading(true);
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(query)}`;
      const res = await fetch(url);
      const data = await res.json();
      
      if (data && data[0]) {
        const result = data[0].map(item => item[0]).join('');
        setTranslatedText(result);
        playSuccess();
      } else {
        setTranslatedText('Translation unavailable');
      }
    } catch (err) {
      console.warn('[Google Translate] Error:', err);
      // Fallback
      setTranslatedText('Could not translate. Check network connection.');
    } finally {
      setLoading(false);
    }
  };

  const swapLanguages = () => {
    playClick();
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
    setInputText(translatedText);
    setTranslatedText(inputText);
  };

  const speakText = (text, lang) => {
    if (lang === 'kn') {
      speakKannada(text);
    } else if (window.speechSynthesis) {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang;
      window.speechSynthesis.speak(u);
    }
  };

  return (
    <>
      {/* Floating Toggle Button (Laptop & PWA) */}
      <button
        onClick={() => {
          playClick();
          setIsOpen(o => !o);
        }}
        title="Google Translate Assistant"
        style={{
          position: 'fixed',
          bottom: '5.5rem',
          right: '1.25rem',
          zIndex: 998,
          background: 'linear-gradient(135deg, #4285F4, #34A853)',
          color: '#fff',
          border: '2px solid rgba(255,255,255,0.4)',
          borderRadius: '50px',
          padding: '0.65rem 1.1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontWeight: 800,
          fontSize: '0.85rem',
          boxShadow: '0 8px 25px rgba(66, 133, 244, 0.45)',
          cursor: 'pointer',
          transition: 'transform 0.2s ease',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <span style={{ fontSize: '1.1rem' }}>🌐</span>
        <span>Google Translate</span>
      </button>

      {/* Translator Modal */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '9.5rem',
            right: '1.25rem',
            width: '92vw',
            maxWidth: '420px',
            background: '#1a0f08',
            border: '1.5px solid rgba(255, 163, 102, 0.4)',
            borderRadius: '24px',
            boxShadow: '0 16px 50px rgba(0,0,0,0.8)',
            zIndex: 999,
            padding: '1.5rem',
            backdropFilter: 'blur(16px)',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.3rem' }}>🌐</span>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#fff', margin: 0 }}>
                Google Translate · ಭಾಷಾಂತರ
              </h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: '1.2rem', cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>

          {/* Language Selector Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '1rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '12px' }}>
            <select
              value={sourceLang}
              onChange={e => setSourceLang(e.target.value)}
              style={{ background: '#2d160a', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', padding: '0.4rem 0.6rem', fontSize: '0.8rem', fontWeight: 700 }}
            >
              {LANGUAGES.map(l => (
                <option key={l.code} value={l.code}>{l.name}</option>
              ))}
            </select>

            <button
              onClick={swapLanguages}
              title="Swap Languages"
              style={{ background: 'rgba(255,163,102,0.2)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', color: '#ffa366', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              ⇄
            </button>

            <select
              value={targetLang}
              onChange={e => setTargetLang(e.target.value)}
              style={{ background: '#2d160a', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', padding: '0.4rem 0.6rem', fontSize: '0.8rem', fontWeight: 700 }}
            >
              {LANGUAGES.map(l => (
                <option key={l.code} value={l.code}>{l.name}</option>
              ))}
            </select>
          </div>

          {/* Input Box */}
          <div style={{ marginBottom: '1rem' }}>
            <textarea
              rows={3}
              placeholder="Type any word or sentence to translate..."
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff',
                fontFamily: 'inherit',
                fontSize: '0.9rem',
                resize: 'none'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.4rem' }}>
              <button
                className="btn-primary"
                onClick={() => handleTranslate()}
                disabled={loading}
                style={{ width: 'auto', padding: '0.45rem 1.2rem', fontSize: '0.82rem', fontWeight: 800 }}
              >
                {loading ? 'Translating...' : 'Translate ➔'}
              </button>
            </div>
          </div>

          {/* Output Box */}
          {translatedText && (
            <div style={{ background: 'rgba(255,163,102,0.12)', border: '1px solid rgba(255,163,102,0.3)', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#ffa366', textTransform: 'uppercase' }}>
                  TRANSLATION RESULT:
                </span>
                <button
                  onClick={() => speakText(translatedText, targetLang)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}
                  title="Listen Pronunciation"
                >
                  🔊 Listen
                </button>
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffd700', fontFamily: targetLang === 'kn' ? 'Noto Sans Kannada, sans-serif' : 'inherit' }}>
                {translatedText}
              </div>
            </div>
          )}

          {/* Quick Presets */}
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 800 }}>QUICK SAMPLES:</div>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {['How much is this?', 'Where is the metro station?', 'I want one filter coffee', 'Nice to meet you'].map((phrase, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInputText(phrase);
                    setSourceLang('en');
                    setTargetLang('kn');
                    handleTranslate(phrase);
                  }}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.72rem',
                    color: 'rgba(255,255,255,0.8)',
                    cursor: 'pointer'
                  }}
                >
                  {phrase}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
