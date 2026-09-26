import React, { useState } from 'react';
import { Sparkles, ExternalLink } from 'lucide-react';

export default function MetaAdBanner({ placement = 'dashboard' }) {
  const [closed, setClosed] = useState(false);

  if (closed) return null;

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(8,102,255,0.08), rgba(0,198,255,0.04))',
      border: '1px solid rgba(8,102,255,0.2)',
      borderRadius: '16px',
      padding: '0.85rem 1.2rem',
      margin: '1rem 0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '0.75rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <div style={{
          width: 30, height: 30, borderRadius: '8px',
          background: 'linear-gradient(135deg, #0866ff, #00c6ff)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 900, color: '#fff', fontSize: '0.85rem', flexShrink: 0,
        }}>
          ∞
        </div>
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0866ff', textTransform: 'uppercase' }}>
            Meta Audience Network Sponsor
          </div>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>
            Learn Kannada On-The-Go with Sobagu Mobile App
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <a
          href="https://sobagukannadaedu.vercel.app/?tab=promotional"
          style={{
            background: 'linear-gradient(135deg, #0866ff, #0084ff)',
            color: '#fff',
            padding: '0.35rem 0.8rem',
            borderRadius: '10px',
            fontSize: '0.75rem',
            fontWeight: 800,
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
          }}
        >
          Explore <ExternalLink size={12} />
        </a>
        <button
          onClick={() => setClosed(true)}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.4)',
            fontSize: '0.75rem',
            cursor: 'pointer',
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
