import React from 'react';
import { speakKannada } from '../utils/tts.js';
import { playSuccess, playClick } from '../utils/soundEffects.js';

export default function AboutMission({ onNavigate }) {
  const samplePhrases = [
    { kn: 'ನಮಸ್ಕಾರ', en: 'Namaskara', meaning: 'Hello / Greetings' },
    { kn: 'ಕನ್ನಡ ಗೊತ್ತಿಲ್ಲ', en: 'Kannada gothilla', meaning: 'I don’t know Kannada (yet!)' },
    { kn: 'ಊಟ ಆಯ್ತಾ?', en: 'Oota aaytha?', meaning: 'Had food?' },
    { kn: 'ಎಷ್ಟುರೀ?', en: 'Yethri? / Eshtu?', meaning: 'How much?' },
    { kn: 'ಹೋಗಿ ಬನ್ನಿ', en: 'Hogi banni', meaning: 'Go and come back (See you!)' },
    { kn: 'ಸಿರಿಗನ್ನಡಂ ಗೆಲ್ಗೆ!', en: 'Sirigannadam gelge!', meaning: 'Victory to rich Kannada!' }
  ];

  const handleSpeak = (text) => {
    speakKannada(text);
  };

  const handleNav = (page) => {
    playClick();
    if (onNavigate) {
      onNavigate(page);
    }
  };

  return (
    <div className="learning-screen" style={{ maxWidth: '960px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Header Banner */}
      <div
        className="glass-card"
        style={{
          padding: '2.5rem 2rem',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.18), rgba(255, 215, 0, 0.12))',
          border: '1.5px solid rgba(255, 163, 102, 0.35)',
          borderRadius: '24px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '2rem' }}>🌸</span>
          <span style={{
            background: 'linear-gradient(90deg, #ff6b35, #ffd700)',
            color: '#1a1008',
            padding: '0.25rem 0.85rem',
            borderRadius: '12px',
            fontSize: '0.82rem',
            fontWeight: 800,
            letterSpacing: '1px',
            textTransform: 'uppercase'
          }}>
            Founder's Mission · ನಮ್ಮ ಧ್ಯೇಯ
          </span>
        </div>

        <h1 style={{
          fontSize: '2.2rem',
          fontWeight: 900,
          lineHeight: '1.25',
          marginBottom: '1rem',
          background: 'linear-gradient(135deg, #ffffff 0%, #ffcf71 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Why I Am Building Sobagu: A Kannadiga’s Mission to Share His Mother Tongue
        </h1>

        <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.85)', lineHeight: '1.7', maxWidth: '800px' }}>
          "As a Kannadiga, nothing makes me happier than hearing someone from outside Karnataka try to speak our language. Whether it is a simple <strong>'Namaskara'</strong> or a hesitant <strong>'Kannada gothilla,'</strong> just seeing the effort warms my heart."
        </p>
      </div>

      {/* Narrative Section */}
      <div style={{ display: 'grid', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="glass-card" style={{ padding: '2rem', borderRadius: '20px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffa366', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span>🔍</span> The Problem with Traditional Tools
          </h2>
          <div style={{ color: 'rgba(255,255,255,0.88)', lineHeight: '1.8', fontSize: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p>
              Lately, through my website <strong>Sobagu</strong>, I started noticing a worrying trend. I saw countless people posting about how they wanted to learn Kannada, but they were feeling completely defeated. They felt stuck, overwhelmed, and disconnected.
            </p>
            <p>
              One day, I decided to see what they were dealing with. I opened a laptop, opened a search engine, and typed <em>"Learn Kannada online."</em>
            </p>
            <div style={{
              background: 'rgba(0,0,0,0.3)',
              borderLeft: '4px solid #ff416c',
              padding: '1.2rem 1.5rem',
              borderRadius: '0 12px 12px 0',
              fontStyle: 'italic',
              color: '#ffcfcf'
            }}>
              "What I found shocked me. The resources available were completely broken. One website immediately forced beginners to memorize the entire Kannada script—all our complex, beautiful vowels and consonants—before they could even learn how to say 'hello.' Another platform taught incredibly formal, textbook grammar. It was the kind of heavy language you might find in old literature, but absolutely nobody talks like that to a vegetable vendor or an auto driver on the streets of Bengaluru!"
            </div>
            <p>
              The online materials were scattered, intimidating, and completely impractical. I realized right then that <strong>people aren’t failing to learn Kannada; our current tools are failing them.</strong> Newcomers genuinely want to connect with our culture, but the internet is throwing a wall of complex grammar at them instead of a welcoming hand.
            </p>
          </div>
        </div>

        {/* The 4 Core Pillars of Sobagu */}
        <div className="glass-card" style={{ padding: '2rem', borderRadius: '20px', background: 'rgba(255,255,255,0.03)' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffd700', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span>✨</span> How Sobagu Changes the Game
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
            Sobagu is designed to be the warm, accessible bridge that helps people fall in love with Kannada, step by step:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem' }}>
            {/* Pillar 1 */}
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,163,102,0.25)',
              borderRadius: '16px',
              padding: '1.4rem',
              transition: 'transform 0.2s',
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🗣️</div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffa366', marginBottom: '0.5rem' }}>
                1. Speaking First, Script Later
              </h3>
              <p style={{ fontSize: '0.92rem', color: 'rgba(255,255,255,0.8)', lineHeight: '1.6' }}>
                You don't need to master the alphabet just to ask <em>"Oota aaytha?" (Had food?)</em>. We use easy-to-read romanised text first so learners can start speaking to locals on day one.
              </p>
            </div>

            {/* Pillar 2 */}
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(67,233,123,0.25)',
              borderRadius: '16px',
              padding: '1.4rem',
              transition: 'transform 0.2s',
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🛺</div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#43e97b', marginBottom: '0.5rem' }}>
                2. Real Street Kannada
              </h3>
              <p style={{ fontSize: '0.92rem', color: 'rgba(255,255,255,0.8)', lineHeight: '1.6' }}>
                No outdated textbook phrases. Lessons are structured around the exact words used every day in local markets, tech parks, and daily commutes—like <em>"Yethri"</em> (How much) or <em>"Hogi"</em> (Go).
              </p>
            </div>

            {/* Pillar 3 */}
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(79,172,254,0.25)',
              borderRadius: '16px',
              padding: '1.4rem',
              transition: 'transform 0.2s',
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🗺️</div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#4facfe', marginBottom: '0.5rem' }}>
                3. A Simple Daily Roadmap
              </h3>
              <p style={{ fontSize: '0.92rem', color: 'rgba(255,255,255,0.8)', lineHeight: '1.6' }}>
                Instead of getting lost in random internet links, learners get a structured, 15-minute daily path that builds practical fluency with gamified XP, streaks, and milestones.
              </p>
            </div>

            {/* Pillar 4 */}
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(240,147,251,0.25)',
              borderRadius: '16px',
              padding: '1.4rem',
              transition: 'transform 0.2s',
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎙️</div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f093fb', marginBottom: '0.5rem' }}>
                4. Native Audio Guides
              </h3>
              <p style={{ fontSize: '0.92rem', color: 'rgba(255,255,255,0.8)', lineHeight: '1.6' }}>
                Since we want everyone to speak confidently, every phrase has clear native audio clips so learners can master the perfect pronunciation without feeling shy.
              </p>
            </div>
          </div>
        </div>

        {/* Interactive Audio Showcase */}
        <div className="glass-card" style={{ padding: '2rem', borderRadius: '20px' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffcf71', marginBottom: '0.5rem' }}>
            🔊 Try Everyday Kannada Right Now
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: '1.2rem' }}>
            Click any phrase below to hear clear Kannada pronunciation:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.9rem' }}>
            {samplePhrases.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSpeak(p.kn)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '14px',
                  padding: '1rem',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s',
                  color: 'inherit'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,163,102,0.15)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              >
                <div>
                  <div style={{ fontFamily: 'Noto Sans Kannada, sans-serif', fontSize: '1.15rem', fontWeight: 800, color: '#ffd700' }}>
                    {p.kn}
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', marginTop: '2px' }}>
                    {p.en}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>
                    {p.meaning}
                  </div>
                </div>
                <span style={{ fontSize: '1.4rem', opacity: 0.8 }}>🔊</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action Bar */}
      <div
        className="glass-card"
        style={{
          padding: '2rem',
          borderRadius: '20px',
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.2), rgba(127, 0, 255, 0.15))',
          border: '1.5px solid rgba(255, 163, 102, 0.3)'
        }}
      >
        <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.5rem', color: '#fff' }}>
          Ready to Start Your Kannada Journey? 💛❤️
        </h3>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem', marginBottom: '1.5rem', maxWidth: '600px', margin: '0 auto 1.5rem' }}>
          Join thousands of learners speaking real, conversational Kannada today with zero friction.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            className="btn-primary"
            onClick={() => handleNav('lessons')}
            style={{
              padding: '0.9rem 2rem',
              fontSize: '1rem',
              fontWeight: 800,
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <span>🗺️</span> Start 32-Lesson Path
          </button>

          <button
            onClick={() => handleNav('sobaguai')}
            style={{
              background: 'linear-gradient(135deg, #ff0844, #ffb199)',
              color: '#fff',
              border: 'none',
              padding: '0.9rem 2rem',
              fontSize: '1rem',
              fontWeight: 800,
              borderRadius: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <span>🤖</span> Practice with Sobagu AI
          </button>
        </div>
      </div>
    </div>
  );
}
