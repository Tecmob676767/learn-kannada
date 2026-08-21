import React, { useState, useEffect, useRef } from 'react';
import { AI_SCENARIOS, chatWithSobaguAI, hasAIEnabled } from '../utils/aiCoach.js';
import { speakKannada } from '../utils/tts.js';
import { playSuccess, playClick, playError } from '../utils/soundEffects.js';

const SobaguAI = ({ onXP, onToast, user }) => {
  const [currentScenarioId, setCurrentScenarioId] = useState('freechat');
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recognitionSupported, setRecognitionSupported] = useState(false);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const activeScenario = AI_SCENARIOS[currentScenarioId] || AI_SCENARIOS.freechat;

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setRecognitionSupported(true);
      const recog = new SpeechRecognition();
      recog.continuous = false;
      recog.interimResults = false;
      recog.lang = 'kn-IN'; // Kannada (India)

      recog.onstart = () => setIsListening(true);
      recog.onend = () => setIsListening(false);
      recog.onerror = () => {
        setIsListening(false);
        onToast && onToast('Could not recognize voice. Try typing!', 'info');
      };
      recog.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        if (transcript) {
          setInputMessage(transcript);
          handleSendMessage(transcript);
        }
      };
      recognitionRef.current = recog;
    }
  }, []);

  // Reset dialogue when scenario changes
  useEffect(() => {
    const scenario = AI_SCENARIOS[currentScenarioId] || AI_SCENARIOS.freechat;
    setMessages([
      {
        id: 'initial',
        sender: 'ai',
        text: scenario.initialMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
  }, [currentScenarioId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend = null) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    playClick();
    const userMsg = {
      id: 'u_' + Date.now(),
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await chatWithSobaguAI(newHistory, currentScenarioId);
      const aiMsg = {
        id: 'ai_' + Date.now(),
        sender: 'ai',
        text: response.text,
        source: response.source,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages([...newHistory, aiMsg]);
      playSuccess();
      onXP && onXP(15);

      // Auto speak Kannada line
      const match = response.text.match(/^([^()\n]+)/);
      if (match && match[1]) {
        speakKannada(match[1].trim());
      }
    } catch (err) {
      playError();
      onToast && onToast('AI response error. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicToggle = () => {
    if (!recognitionRef.current) {
      onToast && onToast('Voice recognition not supported in this browser. Please type!', 'info');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch {
        recognitionRef.current.stop();
      }
    }
  };

  return (
    <div className="learning-screen sobagu-ai-container">
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.75rem', fontWeight: 900 }}>
              🤖 <span className="gradient-text">Sobagu AI</span> · ಕನ್ನಡ ಸಂಭಾಷಣೆ ಗುರು
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Practice real-world Kannada conversations with live audio speech & instant grammar feedback.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: hasAIEnabled() ? 'rgba(67,233,123,0.1)' : 'rgba(255,163,102,0.1)', padding: '0.4rem 0.9rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: hasAIEnabled() ? '#43e97b' : '#ffa366', display: 'inline-block' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: hasAIEnabled() ? '#43e97b' : '#ffa366' }}>
              {hasAIEnabled() ? 'Claude 3.5 AI Active' : 'Sobagu Fast AI Active'}
            </span>
          </div>
        </div>
      </div>

      {/* Scenario Selector */}
      <div style={{ display: 'flex', gap: '0.6rem', overflowX: 'auto', paddingBottom: '0.8rem', marginBottom: '1.5rem' }}>
        {Object.values(AI_SCENARIOS).map(sc => (
          <button
            key={sc.id}
            onClick={() => {
              playClick();
              setCurrentScenarioId(sc.id);
            }}
            style={{
              padding: '0.75rem 1.1rem',
              borderRadius: '16px',
              border: currentScenarioId === sc.id ? '2px solid var(--sakura-pink)' : '1px solid rgba(255,255,255,0.08)',
              background: currentScenarioId === sc.id ? 'rgba(255,163,102,0.18)' : 'rgba(255,255,255,0.03)',
              color: currentScenarioId === sc.id ? '#fff' : 'var(--text-secondary)',
              fontWeight: currentScenarioId === sc.id ? 800 : 500,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              transition: 'all 0.2s',
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>{sc.icon}</span>
            <div style={{ textAlign: 'left' }}>
              <div>{sc.name}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'Noto Sans Kannada, sans-serif' }}>{sc.nameKn}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Main Chat Interface */}
      <div 
        className="glass-card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '600px',
          borderRadius: '24px',
          overflow: 'hidden',
          border: '1.5px solid rgba(255,163,102,0.25)',
          background: 'rgba(28, 12, 2, 0.75)',
        }}
      >
        {/* Scenario Header Info */}
        <div style={{ padding: '1rem 1.5rem', background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.8rem', padding: '0.35rem', background: 'rgba(255,255,255,0.06)', borderRadius: '12px' }}>
              {activeScenario.icon}
            </span>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: '#fff' }}>{activeScenario.role}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>📍 {activeScenario.location}</div>
            </div>
          </div>
          <button
            className="glass-btn"
            onClick={() => {
              playClick();
              const s = AI_SCENARIOS[currentScenarioId];
              setMessages([{ id: 'init_' + Date.now(), sender: 'ai', text: s.initialMessage, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
            }}
            style={{ fontSize: '0.78rem', padding: '0.4rem 0.8rem' }}
          >
            ↺ Restart Dialogue
          </button>
        </div>

        {/* Message Feed */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {messages.map((m) => {
            const isAI = m.sender === 'ai';
            return (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  alignSelf: isAI ? 'flex-start' : 'flex-end',
                  maxWidth: '85%',
                  flexDirection: isAI ? 'row' : 'row-reverse',
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: isAI ? 'linear-gradient(135deg, var(--sakura-pink), var(--sakura-deep))' : 'linear-gradient(135deg, #4facfe, #00f2fe)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.1rem',
                    flexShrink: 0,
                  }}
                >
                  {isAI ? '🤖' : '👤'}
                </div>

                <div
                  style={{
                    background: isAI ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg, rgba(255,107,53,0.3), rgba(255,163,102,0.2))',
                    border: isAI ? '1px solid rgba(255,255,255,0.1)' : '1px solid var(--sakura-pink)',
                    borderRadius: isAI ? '4px 20px 20px 20px' : '20px 4px 20px 20px',
                    padding: '1rem 1.25rem',
                    position: 'relative',
                  }}
                >
                  <div style={{ fontSize: '0.95rem', color: '#fff', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                    {m.text}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.6rem', gap: '0.75rem', paddingTop: '0.4rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{m.time}</span>
                    {isAI && (
                      <button
                        onClick={() => {
                          const clean = m.text.replace(/\([^)]*\)/g, '').split('\n')[0];
                          speakKannada(clean);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--gold)',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          padding: '0.15rem 0.4rem',
                          borderRadius: '6px',
                        }}
                        title="Listen to native pronunciation"
                      >
                        🔊 Listen
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div style={{ display: 'flex', gap: '0.75rem', alignSelf: 'flex-start', alignItems: 'center' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--sakura-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                🤖
              </div>
              <div style={{ background: 'rgba(255,255,255,0.06)', padding: '0.75rem 1.25rem', borderRadius: '18px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <span>✨ Sobagu AI is composing response...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div style={{ padding: '1rem 1.25rem', background: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {recognitionSupported && (
            <button
              onClick={handleMicToggle}
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                border: 'none',
                background: isListening ? '#f87171' : 'rgba(255,255,255,0.08)',
                color: '#fff',
                fontSize: '1.25rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isListening ? '0 0 15px #f87171' : 'none',
                transition: 'all 0.2s',
                flexShrink: 0,
              }}
              title={isListening ? 'Listening... Speak now!' : 'Speak in Kannada'}
            >
              🎙️
            </button>
          )}

          <input
            type="text"
            className="glass-input"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type in Kannada or English (e.g. 'Ondu coffee kodi' / 'How to say hello?')..."
            style={{ flex: 1, height: '46px', borderRadius: '24px', padding: '0 1.25rem', fontSize: '0.92rem' }}
          />

          <button
            className="btn-primary"
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() || isLoading}
            style={{ width: 'auto', height: '46px', padding: '0 1.5rem', borderRadius: '24px', fontWeight: 800 }}
          >
            Send ➔
          </button>
        </div>
      </div>
    </div>
  );
};

export default SobaguAI;
