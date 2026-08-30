import React, { useRef, useState, useEffect } from 'react';
import { getLevelTitle, getCurrentUser } from '../utils/storage.js';
import { playFanfare, playClick } from '../utils/soundEffects.js';

const CertificateStudio = ({ user, onToast }) => {
  const [learnerName, setLearnerName] = useState(user?.name || 'Kannada Learner');
  const [selectedTier, setSelectedTier] = useState('kannada_kovid'); // 'novice' | 'elementary' | 'intermediate' | 'kannada_kovid'
  const certRef = useRef(null);

  const TIERS = {
    novice: { title: 'Kannada Novice Scholar', titleKn: 'ಕನ್ನಡ ಪ್ರವೇಶ ಪತ್ರ', color: '#43e97b', desc: 'Successfully mastered the Kannada Alphabet (Varnamale), Kagunita Syllables, and Basic Vocabulary.' },
    elementary: { title: 'Kannada Elementary Graduate', titleKn: 'ಕನ್ನಡ ಪ್ರಾಥಮಿಕ ಪ್ರವೀಣ', color: '#4facfe', desc: 'Demonstrated fluency in everyday conversational phrases, numbers, and basic sentence construction.' },
    intermediate: { title: 'Kannada Intermediate Master', titleKn: 'ಕನ್ನಡ ಮಧ್ಯಮ ವಿದ್ವಾಂಸ', color: '#f093fb', desc: 'Achieved mastery over verb tenses, proverbs, colloquial dialogues, and spoken pronunciation.' },
    kannada_kovid: { title: 'Grand Kannada Kovida (Honors)', titleKn: 'ಕನ್ನಡ ಕೋವಿದ ಮಹಾಗೌರವ ಪತ್ರ', color: '#ffd700', desc: 'Conferred highest distinction for completing the 32-Lesson Curriculum with exceptional cultural & literary fluency.' },
  };

  const currentTier = TIERS[selectedTier] || TIERS.kannada_kovid;
  const certId = 'SBG-' + (user?.code || '849201') + '-' + selectedTier.toUpperCase().slice(0, 3);
  const issueDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const nameParam = params.get('name');
      const tierParam = params.get('tier');
      if (nameParam) setLearnerName(decodeURIComponent(nameParam));
      if (tierParam && TIERS[tierParam]) setSelectedTier(tierParam);
    } catch (_e) {}
  }, []);

  const handleShare = (platform) => {
    playClick();
    const certViewerUrl = `https://sobagukannadaedu.vercel.app/?tab=certificates&certId=${certId}&name=${encodeURIComponent(learnerName)}&tier=${selectedTier}`;
    const text = `🎓 I just earned the official ${currentTier.title} (${currentTier.titleKn}) on Sobagu AI! Verify and view my certificate here: ${certViewerUrl}`;

    if (platform === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
    } else if (platform === 'linkedin') {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certViewerUrl)}`, '_blank');
    } else {
      navigator.clipboard.writeText(certViewerUrl);
      onToast && onToast('📋 Certificate link copied to clipboard!', 'success');
    }
  };

  const handlePrint = () => {
    playFanfare();
    window.print();
  };

  return (
    <div className="learning-screen certificate-studio-container">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.75rem', fontWeight: 900 }}>
              📜 <span className="gradient-text">Certificate Studio</span> · ಪ್ರಮಾಣ ಪತ್ರ
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Generate, download, and showcase your verified official Kannada Fluency Certificate.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-primary" onClick={handlePrint} style={{ width: 'auto', padding: '0.65rem 1.25rem', fontWeight: 800 }}>
              🖨️ Print / Save PDF
            </button>
          </div>
        </div>
      </div>

      {/* Tier Selector & Customizer */}
      <div className="glass-card" style={{ padding: '1.25rem 1.5rem', marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {Object.entries(TIERS).map(([k, t]) => (
            <button
              key={k}
              onClick={() => {
                playClick();
                setSelectedTier(k);
              }}
              style={{
                padding: '0.6rem 1rem',
                borderRadius: '16px',
                border: selectedTier === k ? `2px solid ${t.color}` : '1px solid rgba(255,255,255,0.08)',
                background: selectedTier === k ? `${t.color}20` : 'rgba(255,255,255,0.03)',
                color: selectedTier === k ? '#fff' : 'var(--text-secondary)',
                fontWeight: selectedTier === k ? 800 : 500,
                fontSize: '0.82rem',
                cursor: 'pointer',
              }}
            >
              {t.title}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Name on Certificate:</span>
          <input
            type="text"
            className="glass-input"
            value={learnerName}
            onChange={(e) => setLearnerName(e.target.value)}
            style={{ width: '200px', height: '36px', borderRadius: '12px', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      {/* Certificate Display Card */}
      <div
        ref={certRef}
        className="certificate-paper"
        style={{
          width: '100%',
          maxWidth: '900px',
          margin: '0 auto 2.5rem auto',
          background: 'linear-gradient(135deg, #1c0c02 0%, #2e1507 50%, #150901 100%)',
          border: '16px solid #d4af37',
          outline: '4px solid #8d0801',
          outlineOffset: '-10px',
          borderRadius: '12px',
          padding: '3.5rem 3rem',
          boxShadow: '0 25px 70px rgba(0,0,0,0.8), inset 0 0 50px rgba(212,175,55,0.15)',
          position: 'relative',
          textAlign: 'center',
          color: '#fff',
        }}
      >
        {/* Royal Corner Ornaments */}
        <div style={{ position: 'absolute', top: '15px', left: '15px', fontSize: '1.8rem', color: '#d4af37' }}>⚜️</div>
        <div style={{ position: 'absolute', top: '15px', right: '15px', fontSize: '1.8rem', color: '#d4af37' }}>⚜️</div>
        <div style={{ position: 'absolute', bottom: '15px', left: '15px', fontSize: '1.8rem', color: '#d4af37' }}>⚜️</div>
        <div style={{ position: 'absolute', bottom: '15px', right: '15px', fontSize: '1.8rem', color: '#d4af37' }}>⚜️</div>

        {/* Emblems & Header */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.25rem', marginBottom: '1rem' }}>
          <span style={{ fontSize: '3rem' }}>👑</span>
        </div>

        <div style={{ fontFamily: 'Noto Sans Kannada, sans-serif', fontSize: '1.1rem', color: '#ffb703', fontWeight: 800, letterSpacing: '2px' }}>
          ಸೊಬಗು ಕನ್ನಡ ಜ್ಞಾನಪೀಠ · SOBAGU AI ACADEMY
        </div>
        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '4px', textTransform: 'uppercase', marginTop: '0.2rem' }}>
          Official Certificate of Kannada Linguistic Distinction
        </div>

        {/* Decorative Divider */}
        <div style={{ width: '120px', height: '2px', background: 'linear-gradient(90deg, transparent, #d4af37, transparent)', margin: '1.5rem auto' }} />

        <div style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.8)', fontStyle: 'italic', marginBottom: '0.5rem' }}>
          This is proudly conferred upon
        </div>

        <div style={{ fontSize: '2.8rem', fontWeight: 900, color: '#fff', letterSpacing: '1px', textShadow: '0 2px 10px rgba(255,215,0,0.3)', margin: '0.5rem 0' }}>
          {learnerName}
        </div>

        <div style={{ fontSize: '1.3rem', color: currentTier.color, fontFamily: 'Noto Sans Kannada, sans-serif', fontWeight: 800, marginBottom: '1.5rem' }}>
          {currentTier.titleKn}
        </div>

        <p style={{ maxWidth: '650px', margin: '0 auto 2rem auto', fontSize: '1rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.75)' }}>
          {currentTier.desc}
        </p>

        {/* Certificate Bottom Signatures & Seal */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(212,175,55,0.3)' }}>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>Date of Issue</div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>{issueDate}</div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.2rem' }}>ID: {certId}</div>
          </div>

          {/* Gold Embossed Seal */}
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            border: '3px dashed #d4af37',
            background: 'radial-gradient(circle, #ffb703 0%, #b8860b 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(212,175,55,0.5)',
            color: '#1c0c02',
            fontWeight: 900,
          }}>
            <span style={{ fontSize: '1.2rem' }}>🌸</span>
            <span style={{ fontSize: '0.55rem', letterSpacing: '1px' }}>VERIFIED</span>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'Dancing Script, cursive, serif', fontSize: '1.4rem', color: '#ffb703' }}>Sujay</div>
            <div style={{ width: '130px', height: '1px', background: '#d4af37', margin: '0.2rem 0 0.2rem auto' }} />
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#fff' }}>Founder & Architect</div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>Sobagu AI Technologies</div>
          </div>
        </div>
      </div>

      {/* Share Section */}
      <div className="glass-card" style={{ padding: '1.5rem 2rem', textAlign: 'center' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>
          🎉 Share Your Achievement with the World!
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          Inspire friends and colleagues to learn Kannada on Social Media, LinkedIn, and Messages.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleShare('message')}
            style={{ padding: '0.75rem 1.5rem', borderRadius: '24px', background: 'linear-gradient(135deg,#ff6b35,#ffa366)', color: '#fff', border: 'none', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <span>💬 Share Certificate</span>
          </button>
          <button
            onClick={() => handleShare('linkedin')}
            style={{ padding: '0.75rem 1.5rem', borderRadius: '24px', background: '#0A66C2', color: '#fff', border: 'none', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <span>💼 Share on LinkedIn</span>
          </button>
          <button
            onClick={() => handleShare('twitter')}
            style={{ padding: '0.75rem 1.5rem', borderRadius: '24px', background: '#000', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <span>𝕏 Share on Twitter</span>
          </button>
          <button
            className="glass-btn"
            onClick={() => handleShare('copy')}
            style={{ padding: '0.75rem 1.5rem', borderRadius: '24px' }}
          >
            📋 Copy Share Link
          </button>
        </div>
      </div>
    </div>
  );
};

export default CertificateStudio;
