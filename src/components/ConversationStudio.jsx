import React, { useState } from 'react';
import { conversations } from '../data/conversationsData.js';
import { speakKannada } from '../utils/tts.js';
import { addXP, updateUser, getCurrentUser } from '../utils/storage.js';

const ConversationStudio = ({ onXP }) => {
  const [scenarioIdx, setScenarioIdx] = useState(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [history, setHistory] = useState([]);
  const [ended, setEnded] = useState(false);
  const [endMsg, setEndMsg] = useState('');

  const startScenario = (i) => {
    setScenarioIdx(i);
    setStepIdx(0);
    setHistory([{ ...conversations[i].script[0], stepType: 'npc' }]);
    setEnded(false);
    setEndMsg('');
    speakKannada(conversations[i].script[0].kannada);
  };

  const handleChoice = (choice) => {
    const convo = conversations[scenarioIdx];
    const step = convo.script[stepIdx];
    const newHistory = [
      ...history,
      { kannada: choice.kannada, transliteration: choice.transliteration, translation: choice.translation, stepType: 'user' },
    ];

    if (choice.next === 'end_polite' || choice.next === 'end_ok') {
      setEnded(true);
      setEndMsg('👋 Conversation ended. Good job responding in Kannada! +20 XP');
      addXP(20);
      onXP && onXP(20);
      setHistory(newHistory);
      return;
    }

    const nextStep = convo.script[choice.next];
    if (nextStep) {
      setHistory([...newHistory, { ...nextStep, stepType: 'npc' }]);
      setStepIdx(choice.next);
      speakKannada(nextStep.kannada);
      if (nextStep.isEnd) {
        setEnded(true);
        setEndMsg(nextStep.endMessage || '🎉 Conversation complete! +50 XP');
        addXP(50);
        onXP && onXP(50);
        const u = getCurrentUser();
        if (u) updateUser({ progress: { ...(u.progress || {}), conversations: Math.min(100, (u.progress?.conversations || 0) + 30) } });
      }
    }
  };

  const currentStep = scenarioIdx !== null ? conversations[scenarioIdx].script[stepIdx] : null;
  const currentChoices = (!ended && currentStep?.choices?.length > 0) ? currentStep.choices : [];

  if (scenarioIdx === null) {
    return (
      <div className="learning-screen">
        <div className="page-header">
          <h2>🗣️ ಸಂಭಾಷಣೆ — Conversation Studio</h2>
          <p>Choose a real-world Bengaluru scenario and practice speaking Kannada!</p>
        </div>
        <div className="curriculum-grid">
          {conversations.map((c, i) => (
            <div key={c.id} className="glass-card level-card" onClick={() => startScenario(i)}>
              <span className="level-icon">{c.icon}</span>
              <span className="level-title-kannada">{c.titleKannada}</span>
              <div className="level-title">{c.title}</div>
              <div style={{ marginTop: '0.5rem' }}>
                <span className="pill pill-pink">{c.difficulty}</span>
              </div>
              <div className="level-meta" style={{ marginTop: '1rem' }}>
                <span className="level-lessons">{c.script.length} exchanges</span>
                <span className="level-arrow">→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const convo = conversations[scenarioIdx];

  return (
    <div className="learning-screen">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={() => setScenarioIdx(null)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', padding: '0.4rem 0.8rem', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontSize: '0.85rem' }}>
          ← Back
        </button>
        <div>
          <h2 style={{ fontSize: '1.4rem' }}>{convo.icon} {convo.title}</h2>
          <p>{convo.titleKannada}</p>
        </div>
      </div>

      <div className="conversation-box">
        {history.map((msg, i) => (
          <div key={i} className={`chat-bubble${msg.stepType === 'user' ? ' user' : ''}`}>
            <div className="chat-avatar">
              {msg.stepType === 'npc' ? '👤' : '🙋'}
            </div>
            <div className="chat-message">
              {msg.stepType === 'npc' && <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'block' }}>{msg.npcName}</span>}
              <span className="chat-kannada">{msg.kannada}</span>
              <span className="chat-transliteration">{msg.transliteration}</span>
              <span className="chat-translation">{msg.translation}</span>
              {msg.stepType === 'npc' && (
                <button className="audio-btn" style={{ marginTop: '0.5rem', fontSize: '0.72rem', padding: '0.3rem 0.7rem' }} onClick={() => speakKannada(msg.kannada)}>
                  🔊
                </button>
              )}
            </div>
          </div>
        ))}

        {ended && (
          <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(74,222,128,0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(74,222,128,0.2)' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--green-success)' }}>{endMsg}</div>
          </div>
        )}
      </div>

      {!ended && currentChoices.length > 0 && (
        <div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Choose your response:</p>
          <div className="conversation-choices">
            {currentChoices.map((c, i) => (
              <button key={i} className="choice-btn" onClick={() => handleChoice(c)}>
                <span className="choice-kannada">{c.kannada}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>{c.transliteration}</span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.15rem', display: 'block' }}>{c.translation}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {ended && (
        <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={() => startScenario(scenarioIdx)}>
          🔄 Restart This Scenario
        </button>
      )}
    </div>
  );
};

export default ConversationStudio;
