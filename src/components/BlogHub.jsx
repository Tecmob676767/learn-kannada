import React, { useState } from 'react';
import { speakKannada } from '../utils/tts.js';
import { playClick, playSuccess } from '../utils/soundEffects.js';

const BLOG_POSTS = [
  {
    id: 'why-i-am-building-sobagu',
    title: 'Why I Am Building Sobagu: A Kannadiga’s Mission to Share His Mother Tongue',
    titleKn: 'ನಾನು ಸೊಬಗು ಕಟ್ಟುತ್ತಿರುವುದೇಕೆ: ಒಬ್ಬ ಕನ್ನಡಿಗನ ಧ್ಯೇಯ',
    author: 'Sujay (Founder, Sobagu)',
    date: 'August 27, 2026',
    readTime: '4 min read',
    category: 'Founder Story',
    tags: ['#Kannada', '#Bengaluru', '#LanguageLearning', '#Mission', '#Culture'],
    summary: 'As a Kannadiga, nothing makes me happier than hearing someone try to speak our language. But why are current online tools failing new learners, and how is Sobagu changing the game?',
    content: (
      <div style={{ lineHeight: '1.85', fontSize: '1.05rem', color: 'rgba(255,255,255,0.9)' }}>
        <p>
          As a Kannadiga, nothing makes me happier than hearing someone from outside Karnataka try to speak our language. Whether it is a simple <strong>"Namaskara"</strong> or a hesitant <strong>"Kannada gothilla,"</strong> just seeing the effort warms my heart.
        </p>
        
        <p>
          But lately, through my website <strong>Sobagu</strong>, I started noticing a worrying trend. I saw countless people posting about how they wanted to learn Kannada, but they were feeling completely defeated. They felt stuck, overwhelmed, and disconnected.
        </p>

        <div style={{
          background: 'rgba(255, 107, 53, 0.12)',
          borderLeft: '4px solid #ff6b35',
          padding: '1.25rem 1.5rem',
          borderRadius: '0 14px 14px 0',
          margin: '1.5rem 0',
          fontStyle: 'italic',
          color: '#ffedd5'
        }}>
          "One day, I decided to see what they were dealing with. I opened a laptop, opened a search engine, and typed 'Learn Kannada online.' What I found shocked me. The resources available were completely broken."
        </div>

        <p>
          One website immediately forced beginners to memorize the entire Kannada script—all our complex, beautiful vowels and consonants—before they could even learn how to say "hello." Another platform taught incredibly formal, textbook grammar. It was the kind of heavy language you might find in old literature, but absolutely nobody talks like that to a vegetable vendor or an auto driver on the streets of Bengaluru!
        </p>

        <p>
          The online materials were scattered, intimidating, and completely impractical.
        </p>

        <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffd700', marginTop: '1.8rem', marginBottom: '0.8rem' }}>
          💡 The Realization: People Aren't Failing; The Tools Are
        </h3>

        <p>
          I realized right then that <strong>people aren’t failing to learn Kannada; our current tools are failing them.</strong> Newcomers genuinely want to connect with our culture, but the internet is throwing a wall of complex grammar at them instead of a welcoming hand.
        </p>

        <p>
          That was the exact spark that led me to design the new <strong>Sobagu</strong> platform.
        </p>

        <p>
          I am building this platform to be the warm, accessible bridge that helps people fall in love with Kannada, step by step. Because I know our language is best learned through conversation, Sobagu is designed to change the game entirely:
        </p>

        {/* 4 Pillars Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.2rem', margin: '2rem 0' }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.2rem', borderRadius: '14px', border: '1px solid rgba(255,163,102,0.3)' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>🗣️</div>
            <h4 style={{ color: '#ffa366', fontWeight: 800, marginBottom: '0.4rem' }}>Speaking First, Script Later</h4>
            <p style={{ fontSize: '0.9rem', opacity: 0.85, margin: 0 }}>
              You don't need to master the alphabet just to ask "Oota aaytha?" (Had food?). We use easy-to-read romanised text first so learners can start speaking to locals on day one.
            </p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.2rem', borderRadius: '14px', border: '1px solid rgba(67,233,123,0.3)' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>🛺</div>
            <h4 style={{ color: '#43e97b', fontWeight: 800, marginBottom: '0.4rem' }}>Real Street Kannada</h4>
            <p style={{ fontSize: '0.9rem', opacity: 0.85, margin: 0 }}>
              No outdated textbook phrases. Lessons are structured around the exact words used every day in local markets, tech parks, and daily commutes—like "Yethri" or "Hogi".
            </p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.2rem', borderRadius: '14px', border: '1px solid rgba(79,172,254,0.3)' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>🗺️</div>
            <h4 style={{ color: '#4facfe', fontWeight: 800, marginBottom: '0.4rem' }}>A Simple Daily Roadmap</h4>
            <p style={{ fontSize: '0.9rem', opacity: 0.85, margin: 0 }}>
              Instead of getting lost in random internet links, learners get a structured, 15-minute daily path.
            </p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.2rem', borderRadius: '14px', border: '1px solid rgba(240,147,251,0.3)' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>🎙️</div>
            <h4 style={{ color: '#f093fb', fontWeight: 800, marginBottom: '0.4rem' }}>Native Audio Guides</h4>
            <p style={{ fontSize: '0.9rem', opacity: 0.85, margin: 0 }}>
              Since I want them to speak confidently, every phrase has clear audio clips so they can master the perfect pronunciation without feeling shy.
            </p>
          </div>
        </div>

        <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffd700', marginTop: '1.5rem' }}>
          ಸಿರಿಗನ್ನಡಂ ಗೆಲ್ಗೆ, ಸಿರಿಗನ್ನಡಂ ಬಾಳ್ಗೆ! 🌸
        </p>
        <p style={{ opacity: 0.8, fontSize: '0.95rem' }}>
          Welcome to the Sobagu family. Let's make Karnataka feel like home for everyone who lives here.
        </p>
      </div>
    )
  },
  {
    id: '10-essential-kannada-phrases-bengaluru',
    title: '10 Essential Kannada Phrases for Auto Rides, Darshinis & Street Markets',
    titleKn: 'ದೈನಂದಿನ ಜೀವನಕ್ಕೆ ೧೦ ಪ್ರಮುಖ ಕನ್ನಡ ವಾಕ್ಯಗಳು',
    author: 'Sobagu Editorial Team',
    date: 'August 25, 2026',
    readTime: '3 min read',
    category: 'Practical Guide',
    tags: ['#StreetKannada', '#AutoRides', '#Food', '#Beginners'],
    summary: 'Moving to Bengaluru or Karnataka? Master these 10 conversational phrases to navigate auto rides, order crispy dosas, and bargain like a local.',
    content: (
      <div style={{ lineHeight: '1.85', fontSize: '1.05rem', color: 'rgba(255,255,255,0.9)' }}>
        <p>
          Learning a new language doesn't mean starting with months of complex grammatical tables. Here are the 10 most practical phrases you can start using today across Karnataka:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', margin: '1.5rem 0' }}>
          {[
            { num: 1, kn: 'ನಮಸ್ಕಾರ (Namaskara)', en: 'Hello / Greetings (Works everywhere, anytime!)' },
            { num: 2, kn: 'ಊಟ ಆಯ್ತಾ? (Oota aaytha?)', en: 'Had food? (The ultimate Kannada expression of care)' },
            { num: 3, kn: 'ಎಷ್ಟು ರೂಪಾಯಿ? (Eshtu roopayi?)', en: 'How much money? (For market shopping & auto rides)' },
            { num: 4, kn: 'ಸ್ವಲ್ಪ ಕಡಿಮೆ ಮಾಡಿ (Swalpa kadime maadi)', en: 'Reduce the price a little (Friendly bargaining)' },
            { num: 5, kn: 'ಒಂದು ಕಾಫಿ ಕೊಡಿ (Ondu coffee kodi)', en: 'Give one coffee (Ordering at Darshini counters)' },
            { num: 6, kn: 'ಮೀಟರ್ ಹಾಕಿ ಅಣ್ಣಾ (Meter haaki anna)', en: 'Turn on the meter, brother (For auto rickshaws)' },
            { num: 7, kn: 'ಇಲ್ಲಿ ನಿಲ್ಲಿಸಿ (Illi nillisi)', en: 'Stop here (When reaching your destination)' },
            { num: 8, kn: 'ಕನ್ನಡ ಕಲಿಯುತ್ತಿದ್ದೇನೆ (Kannada kaliyuttiddene)', en: 'I am learning Kannada (Locals will love you for this!)' },
            { num: 9, kn: 'ಧನ್ಯವಾದಗಳು (Dhanyavadagalu)', en: 'Thank you very much' },
            { num: 10, kn: 'ಹೋಗಿ ಬರ್ತೀನಿ (Hogi barthini)', en: 'See you again / Goodbye (Literally: "I will go and come back")' }
          ].map(item => (
            <div key={item.num} style={{ background: 'rgba(255,255,255,0.04)', padding: '1rem 1.25rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 800, color: '#ffa366', fontSize: '1.1rem', fontFamily: 'Noto Sans Kannada, sans-serif' }}>
                  {item.num}. {item.kn}
                </div>
                <div style={{ fontSize: '0.88rem', opacity: 0.8, marginTop: '2px' }}>{item.en}</div>
              </div>
              <button
                onClick={() => speakKannada(item.kn.split('(')[0].trim())}
                style={{ background: 'rgba(255,163,102,0.15)', border: '1px solid rgba(255,163,102,0.3)', borderRadius: '8px', padding: '0.4rem 0.75rem', color: '#ffa366', cursor: 'pointer' }}
              >
                🔊 Listen
              </button>
            </div>
          ))}
        </div>
      </div>
    )
  }
];

export default function BlogHub({ onNavigate, onToast }) {
  const [selectedPostId, setSelectedPostId] = useState(BLOG_POSTS[0].id);
  const activePost = BLOG_POSTS.find(p => p.id === selectedPostId) || BLOG_POSTS[0];

  const shareBlog = (platform) => {
    playClick();
    const appUrl = 'https://sobagukannadaedu.vercel.app';
    const blogUrl = `${appUrl}/blog?article=${activePost.id}`;
    const text = `🌸 Read "${activePost.title}" on Sobagu Blog: ${blogUrl}`;

    if (platform === 'copy') {
      navigator.clipboard.writeText(blogUrl);
      if (onToast) onToast('📋 Article link copied to clipboard!', 'success');
      return;
    }

    let url = '';
    if (platform === 'whatsapp') url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    if (platform === 'twitter') url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    if (platform === 'linkedin') url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(blogUrl)}`;
    if (url) window.open(url, '_blank');
  };

  return (
    <div className="learning-screen" style={{ maxWidth: '980px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Blog Top Header */}
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', margin: 0 }}>
              📰 <span className="gradient-text">Sobagu Blog & Stories</span> · ಲೇಖನಗಳು
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
              Insights, stories, and practical guides on learning Kannada in modern Karnataka.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => shareBlog('copy')}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff',
                padding: '0.5rem 1rem',
                borderRadius: '12px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              📋 Share Blog
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 300px) 1fr', gap: '1.8rem' }}>
        {/* Article Selector List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            ARTICLES ({BLOG_POSTS.length})
          </div>
          {BLOG_POSTS.map(post => {
            const isSelected = post.id === selectedPostId;
            return (
              <div
                key={post.id}
                onClick={() => {
                  playClick();
                  setSelectedPostId(post.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="glass-card"
                style={{
                  padding: '1.2rem',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  border: isSelected ? '1.5px solid #ffa366' : '1px solid rgba(255,255,255,0.08)',
                  background: isSelected ? 'rgba(255,163,102,0.15)' : 'rgba(255,255,255,0.03)',
                  transition: 'all 0.2s'
                }}
              >
                <span style={{ fontSize: '0.72rem', background: 'rgba(255,215,0,0.15)', color: '#ffd700', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: 800 }}>
                  {post.category}
                </span>
                <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: isSelected ? '#ffa366' : '#fff', margin: '0.5rem 0 0.3rem 0', lineHeight: '1.4' }}>
                  {post.title}
                </h4>
                <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>
                  {post.date} · {post.readTime}
                </div>
              </div>
            );
          })}
        </div>

        {/* Active Article Full View */}
        <div className="glass-card" style={{ padding: '2.5rem', borderRadius: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem', flexWrap: 'wrap' }}>
            <span style={{ background: 'linear-gradient(90deg, #ff6b35, #ffd700)', color: '#1a1008', padding: '0.25rem 0.75rem', borderRadius: '10px', fontSize: '0.78rem', fontWeight: 800 }}>
              {activePost.category}
            </span>
            <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)' }}>
              Published on {activePost.date} · ⏱️ {activePost.readTime}
            </span>
          </div>

          <h2 style={{ fontSize: '1.9rem', fontWeight: 900, lineHeight: '1.3', marginBottom: '0.5rem', color: '#fff' }}>
            {activePost.title}
          </h2>
          <div style={{ fontFamily: 'Noto Sans Kannada, sans-serif', fontSize: '1.1rem', fontWeight: 700, color: '#ffa366', marginBottom: '1.5rem' }}>
            {activePost.titleKn}
          </div>

          {/* Author Badge & Share Toolbar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', padding: '1rem 0', borderTop: '1px solid rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '1.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #ff6b35, #ffd700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#1a1008', fontSize: '1.1rem' }}>
                ✍️
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>{activePost.author}</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.65 }}>Author & Creator</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => shareBlog('whatsapp')} style={{ background: '#25D366', border: 'none', color: '#fff', borderRadius: '8px', padding: '0.4rem 0.8rem', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
                WhatsApp
              </button>
              <button onClick={() => shareBlog('twitter')} style={{ background: '#1DA1F2', border: 'none', color: '#fff', borderRadius: '8px', padding: '0.4rem 0.8rem', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
                Twitter
              </button>
              <button onClick={() => shareBlog('linkedin')} style={{ background: '#0077b5', border: 'none', color: '#fff', borderRadius: '8px', padding: '0.4rem 0.8rem', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
                LinkedIn
              </button>
            </div>
          </div>

          {/* Article Body */}
          {activePost.content}

          {/* Tags */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '2rem', paddingTop: '1.2rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            {activePost.tags.map(tag => (
              <span key={tag} style={{ background: 'rgba(255,255,255,0.06)', padding: '0.3rem 0.75rem', borderRadius: '12px', fontSize: '0.78rem', color: '#ffa366', fontWeight: 600 }}>
                {tag}
              </span>
            ))}
          </div>

          {/* Bottom CTA */}
          <div style={{ marginTop: '2rem', background: 'linear-gradient(135deg, rgba(255,107,53,0.15), rgba(255,215,0,0.08))', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,163,102,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h4 style={{ margin: '0 0 0.3rem 0', fontWeight: 800, color: '#fff' }}>Start Your Conversational Journey Today</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.75)' }}>Begin speaking real Kannada in 15 minutes a day.</p>
            </div>
            <button
              className="btn-primary"
              onClick={() => {
                playSuccess();
                if (onNavigate) onNavigate('lessons');
              }}
              style={{ padding: '0.75rem 1.5rem', fontWeight: 800 }}
            >
              Start Free Lessons ➔
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
