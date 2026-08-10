import React from 'react';

const FESTIVALS = [
  { 
    id: 'ugadi', name: 'Ugadi (ಯುಗಾದಿ)', emoji: '🌿', month: 'March/April',
    desc: 'The Kannada New Year. People eat "Bevu Bella" (Neem and Jaggery) symbolizing the mixture of bitter and sweet experiences in life.',
    phrases: [
      { k: 'ಯುಗಾದಿ ಹಬ್ಬದ ಶುಭಾಶಯಗಳು', t: 'Ugadi habbada shubhashayagalu', e: 'Happy Ugadi' },
      { k: 'ಬೇವು ಬೆಲ್ಲ', t: 'Bevu bella', e: 'Neem and Jaggery' }
    ]
  },
  { 
    id: 'dasara', name: 'Mysuru Dasara (ಮೈಸೂರು ದಸರಾ)', emoji: '🐘', month: 'September/October',
    desc: 'The Nadahabba (state festival) of Karnataka. A 10-day festival culminating in Vijayadashami, celebrating the victory of good over evil.',
    phrases: [
      { k: 'ನಾಡಹಬ್ಬ ದಸರಾದ ಶುಭಾಶಯಗಳು', t: 'Nadahabba dasarada shubhashayagalu', e: 'Happy state festival Dasara' },
      { k: 'ಜಂಬೂ ಸವಾರಿ', t: 'Jamboo savaari', e: 'Elephant procession' }
    ]
  },
  { 
    id: 'deepavali', name: 'Deepavali (ದೀಪಾವಳಿ)', emoji: '🪔', month: 'October/November',
    desc: 'The festival of lights. People light diyas, burst crackers, and distribute sweets.',
    phrases: [
      { k: 'ದೀಪಾವಳಿ ಹಬ್ಬದ ಹಾರ್ದಿಕ ಶುಭಾಶಯಗಳು', t: 'Deepavali habbada haardika shubhashayagalu', e: 'Heartfelt Deepavali greetings' },
      { k: 'ಪಟಾಕಿ', t: 'Pataaki', e: 'Firecrackers' }
    ]
  },
  { 
    id: 'sankranti', name: 'Makara Sankranti (ಮಕರ ಸಂಕ್ರಾಂತಿ)', emoji: '🌾', month: 'January',
    desc: 'The harvest festival. People exchange "Ellu Bella" (sesame seeds and jaggery).',
    phrases: [
      { k: 'ಎಳ್ಳು ಬೆಲ್ಲ ತಿಂದು ಒಳ್ಳೆ ಮಾತಾಡು', t: 'Ellu bella thindu olle maataadu', e: 'Eat sesame and jaggery and speak good words' },
      { k: 'ಸಂಕ್ರಾಂತಿ ಶುಭಾಶಯಗಳು', t: 'Sankranthi shubhashayagalu', e: 'Happy Sankranthi' }
    ]
  },
  { 
    id: 'rajyotsava', name: 'Kannada Rajyotsava (ಕನ್ನಡ ರಾಜ್ಯೋತ್ಸವ)', emoji: '💛❤️', month: 'November 1',
    desc: 'Karnataka Formation Day. The state flag is hoisted and celebrations occur across the state.',
    phrases: [
      { k: 'ಕನ್ನಡ ರಾಜ್ಯೋತ್ಸವದ ಶುಭಾಶಯಗಳು', t: 'Kannada rajyotsavada shubhashayagalu', e: 'Happy Kannada Rajyotsava' },
      { k: 'ಸಿರಿಗನ್ನಡಂ ಗೆಲ್ಗೆ', t: 'Sirigannadam gelge', e: 'Victory to rich Kannada' }
    ]
  },
  { 
    id: 'gowriganesha', name: 'Gowri Ganesha (ಗೌರಿ ಗಣೇಶ)', emoji: '🐘', month: 'August/September',
    desc: 'Celebration of Lord Ganesha and his mother Goddess Gowri. "Kadubu" is a special dish prepared.',
    phrases: [
      { k: 'ಗೌರಿ ಗಣೇಶ ಹಬ್ಬದ ಶುಭಾಶಯಗಳು', t: 'Gowri Ganesha habbada shubhashayagalu', e: 'Happy Gowri Ganesha festival' },
      { k: 'ಕಡುಬು', t: 'Kadubu', e: 'A sweet dumpling' }
    ]
  }
];

const FestivalCalendar = () => {
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  
  const handleSpeak = (txt) => {
    const u = new SpeechSynthesisUtterance(txt);
    u.lang = 'kn-IN';
    window.speechSynthesis.speak(u);
  };

  return (
    <div className="learning-screen">
      <div className="page-header">
        <h2>🎉 Festival Calendar</h2>
        <p>Learn about Karnataka's rich cultural celebrations and greetings.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        {FESTIVALS.map(f => {
          const isCurrent = f.month.includes(currentMonth);
          
          return (
            <div 
              key={f.id} 
              className="glass-card" 
              style={{ 
                padding: '2rem', 
                border: isCurrent ? '2px solid var(--sakura-pink)' : '1px solid var(--glass-border)',
                background: isCurrent ? 'linear-gradient(135deg, rgba(255,163,102,0.1), rgba(0,0,0,0.3))' : 'var(--glass-bg)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ fontSize: '3rem' }}>{f.emoji}</div>
                <div>
                  <h3 style={{ fontSize: '1.6rem', color: 'var(--gold)', margin: 0 }}>{f.name}</h3>
                  <div style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.9rem', marginTop: '0.25rem', textTransform: 'uppercase' }}>
                    📅 {f.month} {isCurrent && <span style={{ color: '#4ade80', marginLeft: '0.5rem' }}>• Coming up soon!</span>}
                  </div>
                </div>
              </div>
              
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                {f.desc}
              </p>
              
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.25rem', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--sakura-pink)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                  Helpful Phrases
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {f.phrases.map((p, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{p.k}</div>
                        <div style={{ fontStyle: 'italic', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{p.t}</div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{p.e}</div>
                      </div>
                      <button 
                        onClick={() => handleSpeak(p.k)}
                        style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', fontSize: '1rem' }}
                      >
                        🔊
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FestivalCalendar;
