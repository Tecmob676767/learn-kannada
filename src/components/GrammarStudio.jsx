import React, { useState } from 'react';
import { addXP } from '../utils/storage.js';
import { speakKannada } from '../utils/tts.js';

const GRAMMAR_SECTIONS = [
  {
    id: 'pronouns',
    title: 'Pronouns (ಸರ್ವನಾಮಗಳು)',
    icon: '👥',
    description: 'Learn pronouns categorized by Person and Gender.',
    items: [
      { kannada: 'ನಾನು', translit: 'nānu', english: 'I' },
      { kannada: 'ನಾವು', translit: 'nāvu', english: 'We' },
      { kannada: 'ನೀನು', translit: 'nīnu', english: 'You (singular/informal)' },
      { kannada: 'ನೀವು', translit: 'nīvu', english: 'You (plural/formal)' },
      { kannada: 'ಅವನು', translit: 'avanu', english: 'He' },
      { kannada: 'ಅವಳು', translit: 'avaḷu', english: 'She' },
      { kannada: 'ಅದು', translit: 'adu', english: 'It/That' },
      { kannada: 'ಅವರು', translit: 'avaru', english: 'They (people/formal singular)' },
      { kannada: 'ಅವು', translit: 'avu', english: 'They (things/animals)' },
    ],
  },
  {
    id: 'tenses',
    title: 'Tenses (ಕಾಲಗಳು)',
    icon: '⏱️',
    description: 'Understand past, present, and future verb formations.',
    items: [
      { kannada: 'ನಾನು ಹೋಗುತ್ತೇನೆ', translit: 'nānu hōguttēne', english: 'I go / I am going (Present)' },
      { kannada: 'ನಾನು ಹೋದೆನು', translit: 'nānu hōdenu', english: 'I went (Past)' },
      { kannada: 'ನಾನು ಹೋಗುವೆನು', translit: 'nānu hōguvenu', english: 'I will go (Future)' },
      { kannada: 'ಅವನು ಬರೆಯುತ್ತಾನೆ', translit: 'avanu bareyuttāne', english: 'He writes / He is writing' },
      { kannada: 'ಅವನು ಬರೆದನು', translit: 'avanu baredanu', english: 'He wrote' },
      { kannada: 'ಅವನು ಬರೆಯುವನು', translit: 'avanu bareyuvanu', english: 'He will write' },
    ],
  },
  {
    id: 'vibhakti',
    title: 'Case Endings (ವಿಭಕ್ತಿ ಪ್ರತ್ಯಯಗಳು)',
    icon: '🏷️',
    description: 'Nouns modify their endings based on grammatical case role (nominative, accusative, dative etc.)',
    items: [
      { kannada: 'ಮನೆಯು', translit: 'maneyu', english: 'The house (Nominative - Subject)' },
      { kannada: 'ಮನೆಯನ್ನು', translit: 'maneyannu', english: 'The house (Accusative - Object)' },
      { kannada: 'ಮನೆಯಿಂದ', translit: 'maneyinda', english: 'From/By the house (Instrumental/Ablative)' },
      { kannada: 'ಮನೆಗೆ', translit: 'manege', english: 'To the house (Dative - Destination)' },
      { kannada: 'ಮನೆಯಲ್ಲಿ', translit: 'maneyalli', english: 'In the house (Locative - Position)' },
      { kannada: 'ಮನೆಯ', translit: 'maneya', english: 'Of the house (Genitive - Possessive)' },
    ],
  },
];

const GrammarStudio = ({ onXP, onToast }) => {
  const [activeTab, setActiveTab] = useState('pronouns');
  const [learned, setLearned] = useState(new Set());

  const current = GRAMMAR_SECTIONS.find(s => s.id === activeTab) || GRAMMAR_SECTIONS[0];

  const handleLearnItem = (item) => {
    speakKannada(item.kannada);
    if (!learned.has(item.kannada)) {
      const newLearned = new Set([...learned, item.kannada]);
      setLearned(newLearned);
      addXP(5);
      onXP && onXP(5);
    }
  };

  return (
    <div className="learning-screen">
      <div className="page-header">
        <h2>📚 Advanced Grammar Studio</h2>
        <p>Master pronouns, tenses, and grammatical case endings with audio feedback.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {GRAMMAR_SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveTab(s.id)}
            className={`section-tab${activeTab === s.id ? ' active' : ''}`}
          >
            {s.icon} {s.title}
          </button>
        ))}
      </div>

      <div className="glass-card" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--sakura-pink)' }}>
          {current.title}
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          💡 {current.description}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {current.items.map((item, i) => {
            const isRead = learned.has(item.kannada);
            return (
              <div
                key={i}
                onClick={() => handleLearnItem(item)}
                style={{
                  padding: '1rem 1.25rem',
                  borderRadius: '12px',
                  background: isRead ? 'rgba(67,233,123,0.08)' : 'rgba(255,255,255,0.03)',
                  border: isRead ? '1px solid rgba(67,233,123,0.25)' : '1px solid rgba(255,255,255,0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--sakura-pink)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = isRead ? 'rgba(67,233,123,0.25)' : 'rgba(255,255,255,0.1)'}
              >
                <div>
                  <div style={{ fontFamily: 'Noto Sans Kannada', fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '0.2rem' }}>
                    {item.kannada}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    {item.english}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    {item.translit}
                  </div>
                </div>
                <div style={{ fontSize: '1.2rem' }}>
                  {isRead ? '✅' : '🔊'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        <span>Click any grammar card to hear standard Kannada pronunciation!</span>
        <span>Items mastered: {learned.size} (+5 XP each)</span>
      </div>
    </div>
  );
};

export default GrammarStudio;
