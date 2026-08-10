import React, { useState } from 'react';

const TOPICS = [
  {
    id: 'pronouns',
    title: '1. Pronouns (ಸರ್ವನಾಮ)',
    desc: 'Kannada pronouns change based on gender, respect, and distance.',
    examples: [
      { k: 'ನಾನು', t: 'Naanu', e: 'I / Me' },
      { k: 'ನೀನು', t: 'Neenu', e: 'You (informal)' },
      { k: 'ನೀವು', t: 'Neevu', e: 'You (respectful/plural)' },
      { k: 'ಅವನು', t: 'Avanu', e: 'He (that boy)' },
      { k: 'ಇವಳು', t: 'Ivalu', e: 'She (this girl)' },
      { k: 'ಅವರು', t: 'Avaru', e: 'They / He/She (respectful)' },
    ]
  },
  {
    id: 'verbs',
    title: '2. Verb Basics (ಕ್ರಿಯಾಪದ)',
    desc: 'Verbs are usually placed at the END of a sentence (Subject-Object-Verb).',
    examples: [
      { k: 'ನಾನು ಸೇಬು ತಿನ್ನುತ್ತೇನೆ', t: 'Naanu sebu thinnuthene', e: 'I eat an apple (I apple eat)' },
      { k: 'ಅವರು ಶಾಲೆಗೆ ಹೋಗುತ್ತಾರೆ', t: 'Avaru shalege hoguthare', e: 'They go to school (They to-school go)' },
      { k: 'ಬನ್ನಿ', t: 'Banni', e: 'Come (respectful)' },
      { k: 'ಹೋಗು', t: 'Hogu', e: 'Go (informal)' },
    ]
  },
  {
    id: 'questions',
    title: '3. Question Words (ಪ್ರಶ್ನಾರ್ಥಕ)',
    desc: 'Question words generally start with "E" (ಎ/ಏ) or "Y" (ಯಾ).',
    examples: [
      { k: 'ಏನು?', t: 'Yenu?', e: 'What?' },
      { k: 'ಯಾರು?', t: 'Yaaru?', e: 'Who?' },
      { k: 'ಎಲ್ಲಿ?', t: 'Elli?', e: 'Where?' },
      { k: 'ಯಾವಾಗ?', t: 'Yaavaga?', e: 'When?' },
      { k: 'ಹೇಗೆ?', t: 'Hege?', e: 'How?' },
      { k: 'ಏಕೆ / ಯಾಕೆ?', t: 'Yeke / Yaake?', e: 'Why?' },
    ]
  },
  {
    id: 'negation',
    title: '4. Negation (ಇಲ್ಲ / ಅಲ್ಲ)',
    desc: 'Use "ಇಲ್ಲ" (illa) for "not/does not exist" and "ಅಲ್ಲ" (alla) for "is not (identity)".',
    examples: [
      { k: 'ನನಗೆ ಗೊತ್ತಿಲ್ಲ', t: 'Nanage gottilla', e: 'I do not know' },
      { k: 'ನನ್ನ ಹತ್ತಿರ ಹಣ ಇಲ್ಲ', t: 'Nanna hattira hana illa', e: 'I do not have money' },
      { k: 'ಅವನು ನನ್ನ ತಮ್ಮ ಅಲ್ಲ', t: 'Avanu nanna thamma alla', e: 'He is not my younger brother' },
      { k: 'ಇದು ನಾಯಿಯಲ್ಲ', t: 'Idu naayiyalla', e: 'This is not a dog' },
    ]
  },
  {
    id: 'cases',
    title: '5. Noun Cases / Prepositions (ವಿಭಕ್ತಿ)',
    desc: 'In Kannada, prepositions (like in, to, for, from) are added as suffixes to nouns.',
    examples: [
      { k: 'ಮನೆ (Mane)', t: 'Home', e: 'Base noun' },
      { k: 'ಮನೆಯಲ್ಲಿ (Mane-yalli)', t: 'In the home', e: 'Locative suffix: -alli (in/at)' },
      { k: 'ಮನೆಗೆ (Mane-ge)', t: 'To the home', e: 'Dative suffix: -ge (to/for)' },
      { k: 'ಮನೆಯಿಂದ (Mane-yinda)', t: 'From the home', e: 'Ablative suffix: -inda (from/by)' },
      { k: 'ಮನೆಯ (Mane-ya)', t: 'Of the home', e: 'Genitive suffix: -a/-ya (of)' },
    ]
  }
];

const GrammarExplainer = ({ onXP, onToast }) => {
  const [activeTab, setActiveTab] = useState(TOPICS[0].id);
  const [completed, setCompleted] = useState(new Set());

  const handleMarkComplete = (id) => {
    if (!completed.has(id)) {
      const nc = new Set(completed);
      nc.add(id);
      setCompleted(nc);
      if (onXP) onXP(15);
      if (onToast) onToast('Grammar topic completed! +15 XP', 'success');
    }
  };

  const activeData = TOPICS.find(t => t.id === activeTab);

  const handleSpeak = (txt) => {
    const u = new SpeechSynthesisUtterance(txt);
    u.lang = 'kn-IN';
    window.speechSynthesis.speak(u);
  };

  return (
    <div className="learning-screen">
      <div className="page-header">
        <h2>📝 Grammar Explainer</h2>
        <p>Understand the rules of Kannada sentence structure.</p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
        
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {TOPICS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                padding: '0.75rem 1.25rem',
                whiteSpace: 'nowrap',
                background: activeTab === t.id ? 'var(--sakura-deep)' : 'rgba(255,255,255,0.05)',
                border: activeTab === t.id ? '1px solid var(--sakura-pink)' : '1px solid transparent',
                borderRadius: '12px',
                color: 'white',
                fontWeight: activeTab === t.id ? 800 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {completed.has(t.id) && '✅ '}
              {t.title}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeData && (
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--sakura-pink)' }}>{activeData.title}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '2rem', lineHeight: 1.5 }}>
              {activeData.desc}
            </p>

            <div style={{ display: 'grid', gap: '1rem' }}>
              {activeData.examples.map((ex, i) => (
                <div key={i} style={{ 
                  background: 'rgba(0,0,0,0.2)', 
                  padding: '1.25rem', 
                  borderRadius: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderLeft: '4px solid var(--sakura-pink)'
                }}>
                  <div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--gold)', marginBottom: '0.2rem' }}>{ex.k}</div>
                    <div style={{ fontStyle: 'italic', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontSize: '0.9rem' }}>{ex.t}</div>
                    <div style={{ fontSize: '1rem', fontWeight: 600 }}>{ex.e}</div>
                  </div>
                  <button 
                    onClick={() => handleSpeak(ex.k)}
                    style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                  >
                    🔊
                  </button>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <button 
                className="btn-primary" 
                style={{ width: 'auto', padding: '1rem 2.5rem' }}
                onClick={() => handleMarkComplete(activeData.id)}
                disabled={completed.has(activeData.id)}
              >
                {completed.has(activeData.id) ? '✅ Completed' : 'Mark as Understood'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GrammarExplainer;
