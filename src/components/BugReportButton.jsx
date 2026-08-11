import React, { useState } from 'react';
import { submitBugReport } from '../utils/storage.js';

const BugReportButton = ({ onToast }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('bug');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    submitBugReport(message, category);
    setSubmitted(true);
    setMessage('');
    onToast?.('🐛 Bug report sent to Founder Sujay!', 'success');
    setTimeout(() => {
      setSubmitted(false);
      setOpen(false);
    }, 2500);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(true)}
        title="Report a Bug"
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: 'linear-gradient(135deg,#f093fb,#f5576c)',
          border: 'none',
          cursor: 'pointer',
          fontSize: '1.4rem',
          boxShadow: '0 4px 20px rgba(240,147,251,0.45)',
          zIndex: 900,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.12)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(240,147,251,0.6)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(240,147,251,0.45)'; }}
      >
        🐛
      </button>

      {/* Modal */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: '1rem',
          }}
        >
          <div
            className="glass-card"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: 440, width: '100%', padding: '2rem' }}
          >
            <h3 style={{ marginBottom: '0.35rem' }}>🐛 Report a Bug</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Your message will go directly to <strong style={{ color: '#ffd700' }}>Founder Sujay</strong>.
            </p>

            {submitted ? (
              <div style={{ textAlign: 'center', padding: '1.5rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>✅</div>
                <p style={{ fontWeight: 700 }}>Report sent! Thank you 🙏</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                    {[
                      { id: 'bug', label: '🐛 Bug' },
                      { id: 'crash', label: '💥 Crash' },
                      { id: 'feature', label: '✨ Feature Request' },
                      { id: 'general', label: '💬 General' },
                    ].map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setCategory(c.id)}
                        style={{
                          padding: '0.3rem 0.75rem', borderRadius: '20px', border: 'none',
                          cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700,
                          background: category === c.id
                            ? 'linear-gradient(135deg,#f093fb,#f5576c)'
                            : 'rgba(255,255,255,0.08)',
                          color: category === c.id ? '#fff' : 'var(--text-secondary)',
                        }}
                      >{c.label}</button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Describe the issue</label>
                  <textarea
                    className="form-input"
                    rows={4}
                    placeholder="Describe what happened, what you expected, and the steps to reproduce..."
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    maxLength={1000}
                    style={{ resize: 'vertical', fontFamily: 'inherit' }}
                    autoFocus
                  />
                  <div style={{ textAlign: 'right', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{message.length}/1000</div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setOpen(false)}>Cancel</button>
                  <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={!message.trim()}>
                    📤 Send to Founder
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default BugReportButton;
