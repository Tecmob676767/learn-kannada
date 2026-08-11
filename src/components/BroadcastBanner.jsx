import React, { useState, useEffect } from 'react';
import { getActiveBroadcast } from '../utils/storage.js';

const BroadcastBanner = () => {
  const [broadcast, setBroadcast] = useState(null);
  const [dismissedId, setDismissedId] = useState(null);

  useEffect(() => {
    const check = () => {
      const active = getActiveBroadcast();
      setBroadcast(active);
    };
    check();
    const interval = setInterval(check, 3000);
    return () => clearInterval(interval);
  }, []);

  if (!broadcast || broadcast.id === dismissedId) return null;

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(255,215,0,0.15) 0%, rgba(217,4,41,0.18) 100%)',
        borderBottom: '1px solid rgba(255,215,0,0.4)',
        backdropFilter: 'blur(15px)',
        padding: '0.65rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        boxShadow: '0 4px 20px rgba(255,215,0,0.15)',
        zIndex: 500,
        position: 'relative',
        animation: 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
        <span style={{
          background: 'linear-gradient(135deg,#ffd700,#ff8c00)',
          color: '#000', fontSize: '0.65rem', fontWeight: 900,
          padding: '0.25rem 0.65rem', borderRadius: '20px', letterSpacing: '0.8px',
          display: 'inline-flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0,
          boxShadow: '0 0 10px rgba(255,215,0,0.4)',
        }}>
          👑 ANNOUNCEMENT FROM {broadcast.senderName || 'FOUNDER SUJAY'}
        </span>
        <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 700, lineHeight: 1.4 }}>
          {broadcast.message}
        </span>
      </div>

      <button
        onClick={() => setDismissedId(broadcast.id)}
        title="Dismiss announcement"
        style={{
          background: 'rgba(255,255,255,0.1)', border: 'none', color: 'rgba(255,255,255,0.8)',
          width: 28, height: 28, borderRadius: '50%', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.85rem', flexShrink: 0, transition: 'all 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = '#fff'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; }}
      >
        ✕
      </button>
    </div>
  );
};

export default BroadcastBanner;
