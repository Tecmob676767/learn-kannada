import React, { useState } from 'react';
import { BookOpen, Users, CheckCircle, ArrowLeft, Star } from 'lucide-react';

const LESSONS = [
  { letter: 'ಅ', roman: 'a', meaning: 'First vowel' },
  { letter: 'ಆ', roman: 'aa', meaning: 'Second vowel' },
  { letter: 'ಇ', roman: 'i', meaning: 'Third vowel' },
  { letter: 'ಈ', roman: 'ii', meaning: 'Fourth vowel' },
  { letter: 'ಉ', roman: 'u', meaning: 'Fifth vowel' },
  { letter: 'ಊ', roman: 'uu', meaning: 'Sixth vowel' },
  { letter: 'ಅ + ಕ = ಕ', roman: 'ka', meaning: 'Consonant ka' },
  { letter: 'ಆ + ಕ = ಕಾ', roman: 'kaa', meaning: 'Long ka' },
];

const card = { background: 'var(--indigo-card)', border: '1px solid var(--glass-border)', borderRadius: '18px', padding: '1.4rem' };

export default function CoopLessonRoom({ user, onXP, onToast, onNavigate }) {
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState([]);
  const [partnerTyping] = useState(false);

  const lesson = LESSONS[idx];
  const progress = Math.round((done.length / LESSONS.length) * 100);

  const markDone = () => {
    if (done.includes(idx)) return;
    setDone(d => [...d, idx]);
    if (onXP) onXP(15);
    onToast('+15 XP — great teamwork!', 'success');
    if (idx + 1 < LESSONS.length) setIdx(idx + 1);
    else onToast('Lesson completed! Amazing work together!', 'success');
  };

  return (
    <div className="learning-screen" style={{ maxWidth: 620, margin: '0 auto', padding: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'linear-gradient(135deg,#43e97b,#38f9d7)', borderRadius: '14px', padding: '0.7rem', display: 'flex' }}>
          <BookOpen size={26} color="#fff" />
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>Coop Study Room</h1>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'Noto Sans Kannada,sans-serif' }}>ಜಂಟಿ ಅಭ್ಯಾಸ</p>
        </div>
        <button onClick={() => onNavigate('multiplayerarena')} style={{ background: 'none', border: '1px solid var(--glass-border)', borderRadius: '10px', padding: '0.45rem 0.8rem', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}>
          <ArrowLeft size={15} /> Back
        </button>
      </div>

      {/* Progress */}
      <div style={{ ...card, marginBottom: '1rem', padding: '0.9rem 1.2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Users size={14} /> Study Progress
          </span>
          <span style={{ color: '#43e97b', fontWeight: 700, fontSize: '0.85rem' }}>{done.length}/{LESSONS.length}</span>
        </div>
        <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3 }}>
          <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg,#43e97b,#38f9d7)', borderRadius: 3, transition: 'width 0.5s' }} />
        </div>
      </div>

      {/* Lesson Card */}
      <div style={{ ...card, textAlign: 'center', marginBottom: '1rem' }}>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', marginBottom: '1rem' }}>
          Lesson {idx + 1} of {LESSONS.length}
        </div>
        <div style={{ fontSize: '5rem', marginBottom: '0.7rem', fontFamily: 'Noto Sans Kannada,sans-serif', filter: 'drop-shadow(0 0 16px rgba(67,233,123,0.4))' }}>
          {lesson.letter}
        </div>
        <div style={{ color: 'var(--sakura-pink)', fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.3rem' }}>
          "{lesson.roman}"
        </div>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>{lesson.meaning}</div>

        {partnerTyping && (
          <div style={{ marginTop: '0.8rem', color: '#43e97b', fontSize: '0.78rem', fontStyle: 'italic' }}>
            Partner is typing…
          </div>
        )}
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', gap: '0.7rem', marginBottom: '1rem' }}>
        <button onClick={() => setIdx(i => Math.max(0, i - 1))} disabled={idx === 0} style={{ flex: 1, background: 'rgba(255,255,255,0.07)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '0.7rem', color: 'rgba(255,255,255,0.6)', cursor: idx === 0 ? 'not-allowed' : 'pointer', fontWeight: 700, opacity: idx === 0 ? 0.4 : 1 }}>
          Previous
        </button>
        <button onClick={markDone} style={{ flex: 2, background: done.includes(idx) ? 'rgba(67,233,123,0.2)' : 'linear-gradient(135deg,#43e97b,#38f9d7)', border: done.includes(idx) ? '1px solid #43e97b' : 'none', borderRadius: '12px', padding: '0.7rem', color: '#fff', cursor: 'pointer', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          {done.includes(idx) ? <><CheckCircle size={18} /> Done!</> : <><Star size={18} /> Mark Complete (+15 XP)</>}
        </button>
        <button onClick={() => setIdx(i => Math.min(LESSONS.length - 1, i + 1))} disabled={idx >= LESSONS.length - 1} style={{ flex: 1, background: 'rgba(255,255,255,0.07)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '0.7rem', color: 'rgba(255,255,255,0.6)', cursor: idx >= LESSONS.length - 1 ? 'not-allowed' : 'pointer', fontWeight: 700, opacity: idx >= LESSONS.length - 1 ? 0.4 : 1 }}>
          Next
        </button>
      </div>

      {/* Completed list */}
      {done.length > 0 && (
        <div style={{ ...card, padding: '1rem' }}>
          <div style={{ color: '#43e97b', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CheckCircle size={14} /> Completed
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {done.map(i => (
              <span key={i} style={{ background: 'rgba(67,233,123,0.12)', border: '1px solid rgba(67,233,123,0.3)', borderRadius: '8px', padding: '0.2rem 0.6rem', color: '#43e97b', fontSize: '0.85rem', fontFamily: 'Noto Sans Kannada,sans-serif' }}>
                {LESSONS[i].letter.split(' ')[0]}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
