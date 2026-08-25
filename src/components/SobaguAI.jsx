import React, { useState, useEffect, useRef } from 'react';
import { speakKannada } from '../utils/tts.js';
import { playSuccess, playClick, playError } from '../utils/soundEffects.js';
import { addSRSCard } from '../utils/storage.js';

// Advanced AI Scenarios & Modes
const AI_MODES = [
  { id: 'conversation', name: '💬 Roleplay Dialogue', desc: 'Real-life conversational practice in Bengaluru scenarios' },
  { id: 'grammar_deconstruct', name: '🧩 Sentence Deconstructor', desc: 'Break down Kannada grammar, Vibhakti, and SOV structure' },
  { id: 'pronunciation', name: '🗣️ Pronunciation Coach', desc: 'Phonetic tongue placement and retroflex guidance' },
  { id: 'instant_quiz', name: '⚡ Smart Quiz Generator', desc: 'Test and reinforce newly learned Kannada concepts' },
];

const SCENARIOS = [
  { id: 'hotel', label: '☕ Darshini Coffee & Dosa', prompt: 'You are a waiter at a famous Bengaluru Darshini. Greet the customer and help them order Masala Dosa and Filter Coffee in Kannada.' },
  { id: 'auto', label: '🛺 Auto Rickshaw Bargaining', prompt: 'You are an auto driver in Bengaluru near Majestic. Negotiate the fare politely in authentic Kannada.' },
  { id: 'market', label: '🛒 KR Market Vegetable Shopping', prompt: 'You are a shopkeeper at KR Market. Ask the customer what vegetables they want and tell prices in Kannada.' },
  { id: 'metro', label: '🚇 Namma Metro Directions', prompt: 'You are a metro station helper guiding a commuter to MG Road station in Kannada.' },
  { id: 'casual', label: '🌸 Friendly Casual Chat', prompt: 'You are a friendly Bengaluru local chatting about weather, hobbies, and favorite Kannada food.' },
];

// Advanced Offline Kannada Linguistic Engine
const generateAdvancedAIResponse = (mode, userText, scenarioId) => {
  const text = userText.trim().toLowerCase();

  if (mode === 'grammar_deconstruct') {
    return {
      kannada: `ವಾಕ್ಯ ವಿಶ್ಲೇಷಣೆ (Sentence Analysis): "${userText}"`,
      transliteration: `Vaakya Vishleshane`,
      breakdown: [
        { part: 'Subject (ಕರ್ತೃ)', desc: 'Identifies the doer with Prathama Vibhakti (nominative case)' },
        { part: 'Object (ಕರ್ಮ)', desc: 'Identifies the target with Dvitiya Vibhakti (-annu)' },
        { part: 'Verb (ಕ್ರಿಯಾಪದ)', desc: 'Placed at the END following Kannada SOV (Subject-Object-Verb) grammar rule' },
      ],
      grammarTip: '💡 Pro Tip: In Kannada, verbs always conjugate according to gender, person (1st/2nd/3rd), and respect level (e.g., madu vs madi).',
      srsCard: { front: userText, back: 'Kannada Sentence Pattern' },
    };
  }

  if (mode === 'pronunciation') {
    return {
      kannada: `ಉಚ್ಚಾರಣೆ ಮಾರ್ಗದರ್ಶಿ (Pronunciation Guide): "${userText}"`,
      transliteration: 'Ucchaarane Maargadarshi',
      breakdown: [
        { part: 'Retroflex Sounds (ಟ, ಡ, ಣ, ಳ)', desc: 'Curl tongue tip backward to the hard palate and release forward with snap.' },
        { part: 'Vowel Length (ಹ್ರಸ್ವ vs ದೀರ್ಘ)', desc: 'Hold long vowels (ಆ, ಈ, ಊ) twice as long as short ones.' },
        { part: 'Aspiration (ಮಹಾಪ್ರಾಣ)', desc: 'Aspirated consonants (ಖ, ಘ, ಛ, ಥ) need an explosive puff of breath.' },
      ],
      grammarTip: '🎯 Bengaluru Native Accent: Keep tongue relaxed on alveolar sounds like ನ (na) and ಲ (la).',
    };
  }

  if (mode === 'instant_quiz') {
    return {
      kannada: `ಬುದ್ಧಿವಂತ ಪ್ರಶ್ನೆ (Smart Challenge): "${userText}" ಗೆ ಸಂಬಂಧಿಸಿದ ಪ್ರಶ್ನೆ:`,
      transliteration: 'Buddhivanta Prashne',
      breakdown: [
        { part: 'Question:', desc: `How do you politely say "Please come here" in Kannada?` },
        { part: 'Option A:', desc: 'ಇಲ್ಲಿ ಬಾ (Illi baa) - Casual' },
        { part: 'Option B (Correct):', desc: 'ಇಲ್ಲಿ ಬನ್ನಿ (Illi banni) - Polite & Respectful ✨' },
      ],
      grammarTip: '🌟 Adding "-iri" or "-i" (Banni, Kootkoli, Hogi) instantly transforms verbs into respectful forms.',
    };
  }

  // Conversation Mode
  if (scenarioId === 'hotel') {
    if (text.includes('coffee') || text.includes('ಕಾಫಿ')) {
      return {
        kannada: 'ಖಂಡಿತಾ! ಬಿಸಿ ಬಿಸಿ ಫಿಲ್ಟರ್ ಕಾಫಿ ರೆಡಿ ಇದೆ. ಸಕ್ಕರೆ ಎಷ್ಟು ಬೇಕು? (Certainly! Piping hot filter coffee is ready. How much sugar do you want?)',
        transliteration: 'Khandita! Bisi bisi filter coffee ready ide. Sakkare eshtu beku?',
        grammarTip: '"Bisi bisi" (ಬಿಸಿ ಬಿಸಿ) is a Kannada reduplication expressing "steaming hot" freshness.',
      };
    }
    return {
      kannada: 'ನಮಸ್ಕಾರ ಸ್ವಾಮಿ! ನಮ್ಮಲ್ಲಿ ಬೆಣ್ಣೆ ಮಸಾಲೆ ದೋಸೆ, ಇಡ್ಲಿ-ವಡೆ ಮತ್ತು ಫಿಲ್ಟರ್ ಕಾಫಿ ಪ್ರಸಿದ್ಧ. ಏನು ತರಲಿ? (Hello sir! Butter Masala Dosa, Idli-Vada and Filter Coffee are famous here. What shall I bring?)',
      transliteration: 'Namaskara swami! Nammalli benne masale dose, idli-vade mattu filter coffee prasiddha. Enu tarali?',
      grammarTip: '"Tarali?" (ತರಲಿ?) means "Shall I bring?" using the permissive cohortative verb form.',
    };
  }

  if (scenarioId === 'auto') {
    return {
      kannada: 'ಸರ್, ಎಲ್ಲಿಗೆ ಹೋಗ್ಬೇಕು? ಮೀಟರ್ ಹಾಕಿ ಹೋಗೋಣ, ಬನ್ನಿ ಕೂತ್ಕೊಳ್ಳಿ! (Sir, where do you want to go? We will go by meter, please come and sit!)',
      transliteration: 'Sir, elligey hogbeku? Meter haaki hogona, banni kootkoli!',
      grammarTip: '"Hogona" (ಹೋಗೋಣ) = "Let us go" (1st person plural hortative mood).',
    };
  }

  // Default rich dialogue
  return {
    kannada: `ತುಂಬಾ ಸಂತೋಷ! ನೀವು ಹೇಳಿದ್ದು: "${userText}". ಕನ್ನಡ ಕಲಿಯುವುದು ತುಂಬಾ ಸುಲಭ ಮತ್ತು ಸುಂದರ! (Very happy! You said: "${userText}". Learning Kannada is very easy and beautiful!)`,
    transliteration: 'Tumba santosha! Neevu heliddu... Kannada kaliyuvudu tumba sulabha mattu sundara!',
    grammarTip: '🎯 Notice SOV order: "ಕನ್ನಡ (O) ಕಲಿಯುವುದು (S) ಸುಲಭ (V)".',
  };
};

const SobaguAI = ({ onXP, onToast, user }) => {
  const [currentMode, setCurrentMode] = useState('conversation');
  const [currentScenario, setCurrentScenario] = useState('hotel');
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಸೊಬಗು AI ಕನ್ನಡ ಶಿಕ್ಷಕ (I am your Sobagu AI Kannada Tutor). How can I guide your Kannada journey today? 🌸',
      transliteration: 'Namaskara! Naanu nimma Sobagu AI Kannada shikshaka.',
      grammarTip: 'Select any mode above to start interactive dialogues, sentence deconstruction, or pronunciation drills!',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showTranslit, setShowTranslit] = useState(true);

  const messagesEndRef = useRef(null);
  const recogRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Voice recognition init
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.continuous = false;
      recog.interimResults = false;
      recog.lang = 'kn-IN';
      recog.onstart = () => setIsListening(true);
      recog.onend = () => setIsListening(false);
      recog.onerror = () => {
        setIsListening(false);
        onToast && onToast('Voice recognition ended. Feel free to type!', 'info');
      };
      recog.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        if (transcript) {
          setInputText(transcript);
          handleSend(transcript);
        }
      };
      recogRef.current = recog;
    }
  }, []);

  const handleSend = async (overrideText = null) => {
    const text = (overrideText || inputText).trim();
    if (!text || isLoading) return;

    playClick();
    const userMsg = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    setTimeout(() => {
      const response = generateAdvancedAIResponse(currentMode, text, currentScenario);
      const aiMsg = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: response.kannada,
        transliteration: response.transliteration,
        breakdown: response.breakdown,
        grammarTip: response.grammarTip,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsLoading(false);
      playSuccess();
      onXP && onXP(20);

      // Auto-speak Kannada line
      const spokenPart = response.kannada.split(/[\n(]/)[0].replace(/[^ಀ-೿\s]/g, '').trim();
      if (spokenPart) {
        speakKannada(spokenPart);
      }
    }, 600);
  };

  const handleVoiceToggle = () => {
    if (!recogRef.current) {
      onToast && onToast('Microphone recognition not supported in this browser. Please type!', 'warning');
      return;
    }
    if (isListening) {
      recogRef.current.stop();
    } else {
      try {
        recogRef.current.start();
      } catch {
        recogRef.current.stop();
      }
    }
  };

  const handleSaveToSRS = (kannada, meaning) => {
    addSRSCard(kannada, meaning || 'Sobagu AI Saved Phrase', 'AI Smart Deck');
    onToast && onToast(`💾 Added "${kannada}" to your Spaced Repetition deck!`, 'success');
  };

  return (
    <div className="learning-screen sobagu-ai-container" style={{ maxWidth: '980px', margin: '0 auto', paddingBottom: '2rem' }}>
      {/* Header */}
      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #ff6b35, #ffb7c5, #a855f7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.6rem',
              boxShadow: '0 0 20px rgba(255,107,53,0.5)',
            }}
          >
            🌸
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-primary)' }}>
              Sobagu AI <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', background: 'rgba(255,163,102,0.2)', color: '#ffa366', border: '1px solid rgba(255,163,102,0.4)' }}>NEO TUTOR v3.0</span>
            </h1>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Native Bengaluru Conversational AI, Linguistic Deconstructor & Pronunciation Coach
            </p>
          </div>
        </div>

        <button
          className="glass-btn"
          onClick={() => setShowTranslit(t => !t)}
          style={{ fontSize: '0.8rem', padding: '0.5rem 0.9rem' }}
        >
          {showTranslit ? '🔤 Transliteration ON' : '🔤 Transliteration OFF'}
        </button>
      </div>

      {/* Mode Selector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.65rem', marginBottom: '1.25rem' }}>
        {AI_MODES.map((mode) => (
          <button
            key={mode.id}
            onClick={() => {
              setCurrentMode(mode.id);
              onToast && onToast(`Switched to ${mode.name}`, 'info');
            }}
            className="glass-card"
            style={{
              padding: '0.85rem 1rem',
              textAlign: 'left',
              border: currentMode === mode.id ? '2px solid #ffa366' : '1px solid rgba(255,255,255,0.08)',
              background: currentMode === mode.id ? 'rgba(255,163,102,0.15)' : 'rgba(255,255,255,0.03)',
              cursor: 'pointer',
              borderRadius: '14px',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: currentMode === mode.id ? '#ffa366' : '#fff' }}>
              {mode.name}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '3px' }}>
              {mode.desc}
            </div>
          </button>
        ))}
      </div>

      {/* Scenario Pills for Conversation Mode */}
      {currentMode === 'conversation' && (
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
          {SCENARIOS.map((sc) => (
            <button
              key={sc.id}
              onClick={() => {
                setCurrentScenario(sc.id);
                setMessages(prev => [
                  ...prev,
                  {
                    id: `sc_${Date.now()}`,
                    sender: 'ai',
                    text: `Switched scenario to: ${sc.label}. Start speaking or typing! 🌸`,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  }
                ]);
              }}
              style={{
                padding: '0.45rem 0.9rem',
                borderRadius: '20px',
                border: currentScenario === sc.id ? '1px solid #ff6b35' : '1px solid rgba(255,255,255,0.1)',
                background: currentScenario === sc.id ? 'rgba(255,107,53,0.2)' : 'rgba(255,255,255,0.05)',
                color: currentScenario === sc.id ? '#ffa366' : '#fff',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {sc.label}
            </button>
          ))}
        </div>
      )}

      {/* Messages Viewport */}
      <div
        className="glass-card"
        style={{
          minHeight: '440px',
          maxHeight: '560px',
          overflowY: 'auto',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          marginBottom: '1rem',
        }}
      >
        {messages.map((msg) => {
          const isAI = msg.sender === 'ai';
          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                justifyContent: isAI ? 'flex-start' : 'flex-end',
              }}
            >
              <div
                style={{
                  maxWidth: '85%',
                  padding: '1rem 1.25rem',
                  borderRadius: isAI ? '4px 20px 20px 20px' : '20px 4px 20px 20px',
                  background: isAI ? 'rgba(30, 20, 40, 0.85)' : 'linear-gradient(135deg, #ff6b35, #e8547a)',
                  border: isAI ? '1px solid rgba(255,163,102,0.3)' : 'none',
                  boxShadow: isAI ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(255,107,53,0.35)',
                  color: '#fff',
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.8rem', color: isAI ? '#ffa366' : '#ffe033' }}>
                    {isAI ? '🌸 Sobagu AI Tutor' : '👤 You'}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>{msg.time}</span>
                </div>

                {/* Main Text */}
                <div style={{ fontSize: '1.02rem', lineHeight: '1.6', fontWeight: 600 }}>
                  {msg.text}
                </div>

                {/* Transliteration */}
                {showTranslit && msg.transliteration && (
                  <div style={{ fontSize: '0.85rem', color: '#38bdf8', fontStyle: 'italic', marginTop: '4px' }}>
                    🔤 {msg.transliteration}
                  </div>
                )}

                {/* Linguistic Breakdown */}
                {msg.breakdown && (
                  <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(0,0,0,0.3)', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {msg.breakdown.map((b, i) => (
                      <div key={i} style={{ fontSize: '0.82rem', lineHeight: '1.4' }}>
                        <strong style={{ color: '#c084fc' }}>{b.part}:</strong> {b.desc}
                      </div>
                    ))}
                  </div>
                )}

                {/* Grammar Tip */}
                {msg.grammarTip && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#4ade80', background: 'rgba(74,222,128,0.1)', padding: '6px 10px', borderRadius: '8px' }}>
                    {msg.grammarTip}
                  </div>
                )}

                {/* Action Buttons for AI message */}
                {isAI && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '0.75rem' }}>
                    <button
                      onClick={() => speakKannada(msg.text.split(/[\n(]/)[0].replace(/[^ಀ-೿\s]/g, ''))}
                      style={{
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '8px',
                        padding: '3px 8px',
                        color: '#fff',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                      }}
                    >
                      🔊 Speak
                    </button>
                    <button
                      onClick={() => handleSaveToSRS(msg.text.split(/[\n(]/)[0].trim(), msg.transliteration)}
                      style={{
                        background: 'rgba(168,85,247,0.15)',
                        border: '1px solid rgba(168,85,247,0.3)',
                        borderRadius: '8px',
                        padding: '3px 8px',
                        color: '#c084fc',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                      }}
                    >
                      💾 Save to SRS
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffa366', fontSize: '0.9rem', fontStyle: 'italic' }}>
            <span>🌸 Sobagu AI is thinking in Kannada...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          className="form-input"
          placeholder={isListening ? '🎙️ Listening in Kannada...' : 'Ask Sobagu AI anything in English or Kannada...'}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          style={{ flex: 1, padding: '0.85rem 1.25rem', fontSize: '0.95rem', borderRadius: '16px' }}
        />

        <button
          type="button"
          onClick={handleVoiceToggle}
          style={{
            padding: '0.85rem 1.2rem',
            background: isListening ? '#ef4444' : 'rgba(255,255,255,0.08)',
            border: isListening ? '2px solid #fff' : '1px solid rgba(255,255,255,0.2)',
            borderRadius: '16px',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '1.1rem',
            boxShadow: isListening ? '0 0 16px rgba(239,68,68,0.8)' : 'none',
          }}
          title="Voice Speak"
        >
          {isListening ? '⏹️' : '🎙️'}
        </button>

        <button
          type="submit"
          className="btn-primary"
          style={{ padding: '0.85rem 1.5rem', borderRadius: '16px', fontWeight: 800 }}
        >
          🚀 Send
        </button>
      </form>
    </div>
  );
};

export default SobaguAI;
