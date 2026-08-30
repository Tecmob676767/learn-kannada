import React, { useState, useEffect } from 'react';
import {
  getPlumineTelemetry,
  subscribeToPlumineSync,
  forcePlumineSync,
  createPlumineSnapshot,
  getPlumineSnapshots,
  generatePlumineMagicPayload,
} from '../utils/plumineCS.js';
import { getCurrentUser, saveAllUsers, getAllUsers, setCurrentUser } from '../utils/storage.js';

const PlumineCSModal = ({ isOpen, onClose, onToast, onRefreshUser }) => {
  const [telemetry, setTelemetry] = useState(getPlumineTelemetry());
  const [activeTab, setActiveTab] = useState('telemetry'); // 'telemetry' | 'magicsync' | 'snapshots'
  const [snapshots, setSnapshots] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [magicLink, setMagicLink] = useState('');

  const currentUser = getCurrentUser();

  useEffect(() => {
    if (!isOpen) return;
    const unsub = subscribeToPlumineSync((t) => setTelemetry(t));
    if (currentUser?.code) {
      setSnapshots(getPlumineSnapshots(currentUser.code));
      const payload = generatePlumineMagicPayload(currentUser);
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://sobagukannadaedu.vercel.app';
      setMagicLink(`${origin}?sync_data=${payload}`);
    }
    return () => unsub();
  }, [isOpen, currentUser?.code]);

  if (!isOpen) return null;

  const handleSyncNow = async () => {
    if (!currentUser) return;
    setSyncing(true);
    try {
      await forcePlumineSync(currentUser);
      createPlumineSnapshot(currentUser, 'Manual Sync Point');
      setSnapshots(getPlumineSnapshots(currentUser.code));
      onToast && onToast('⚡ Quantum Cloud Sync Complete! All devices in sync.', 'success');
      onRefreshUser && onRefreshUser();
    } catch {
      onToast && onToast('⚠️ Cloud push deferred to outbox queue.', 'warning');
    } finally {
      setSyncing(false);
    }
  };

  const handleCreateSnapshot = () => {
    if (!currentUser) return;
    const snap = createPlumineSnapshot(currentUser, `User Snapshot (${new Date().toLocaleTimeString()})`);
    if (snap) {
      setSnapshots(getPlumineSnapshots(currentUser.code));
      onToast && onToast('💾 Quantum Snapshot created successfully!', 'success');
    }
  };

  const handleRestoreSnapshot = (snap) => {
    if (!snap?.data) return;
    const users = getAllUsers();
    users[snap.data.code] = snap.data;
    saveAllUsers(users);
    setCurrentUser(snap.data.code);
    forcePlumineSync(snap.data);
    onToast && onToast(`✨ Restored snapshot from ${snap.dateStr}!`, 'success');
    onRefreshUser && onRefreshUser();
    onClose && onClose();
  };

  const handleCopyMagicLink = () => {
    if (!magicLink) return;
    navigator.clipboard.writeText(magicLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    onToast && onToast('📋 Magic Sync Link copied! Open on any device to login instantly.', 'success');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 5, 10, 0.85)',
        backdropFilter: 'blur(16px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '680px',
          background: 'linear-gradient(145deg, #140d28, #0a0614)',
          border: '1px solid rgba(192, 132, 252, 0.4)',
          borderRadius: '24px',
          boxShadow: '0 20px 60px rgba(168, 85, 247, 0.25), 0 0 40px rgba(99, 102, 241, 0.15)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
          color: '#fff',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            background: 'linear-gradient(90deg, rgba(168,85,247,0.18), rgba(56,189,248,0.12))',
            borderBottom: '1px solid rgba(192, 132, 252, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #c084fc, #6366f1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.3rem',
                boxShadow: '0 0 16px rgba(192, 132, 252, 0.6)',
              }}
            >
              ☁️
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, letterSpacing: '-0.01em' }}>
                  Plumine CS+ <span style={{ fontSize: '0.75rem', color: '#38bdf8', border: '1px solid #38bdf8', padding: '1px 6px', borderRadius: '8px' }}>QUANTUM WORLDWIDE v7.8</span>
                </h2>
              </div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>
                Worldwide 0-Second Latency Cloud Sync & Real-Time Edge Mesh
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.2)' }}>
          {[
            { id: 'telemetry', label: '⚡ Live Telemetry', icon: '📡' },
            { id: 'magicsync', label: '🔗 Magic Sync & QR', icon: '🪄' },
            { id: 'snapshots', label: '💾 Cloud Snapshots', icon: '🛡️' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '0.85rem',
                border: 'none',
                background: activeTab === tab.id ? 'rgba(168,85,247,0.18)' : 'transparent',
                borderBottom: activeTab === tab.id ? '2px solid #c084fc' : '2px solid transparent',
                color: activeTab === tab.id ? '#c084fc' : 'rgba(255,255,255,0.6)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {activeTab === 'telemetry' && (
            <div>
              {/* Status Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '1rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>SYNC STATUS</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', fontWeight: 800 }}>
                    <span
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: telemetry.status === 'synced' ? '#4ade80' : telemetry.status === 'syncing' ? '#38bdf8' : '#f87171',
                        boxShadow: `0 0 10px ${telemetry.status === 'synced' ? '#4ade80' : '#38bdf8'}`,
                      }}
                    />
                    <span style={{ textTransform: 'uppercase', color: telemetry.status === 'synced' ? '#4ade80' : '#38bdf8' }}>
                      {telemetry.status}
                    </span>
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '1rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>QUANTUM LATENCY</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38bdf8' }}>
                    {telemetry.latencyMs} ms <span style={{ fontSize: '0.75rem', color: '#4ade80' }}>⚡ Ultra-Fast</span>
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '1rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>MULTI-TAB MESH NODES</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#c084fc' }}>
                    {telemetry.meshNodes} Active {telemetry.meshNodes > 1 ? 'Nodes 🌐' : 'Node 🖥️'}
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '1rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>PENDING OUTBOX QUEUE</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: telemetry.pendingCount > 0 ? '#fbbf24' : '#4ade80' }}>
                    {telemetry.pendingCount} items
                  </div>
                </div>
              </div>

              {/* Protocol Spec Box */}
              <div
                style={{
                  background: 'rgba(168,85,247,0.08)',
                  border: '1px solid rgba(168,85,247,0.25)',
                  padding: '1rem',
                  borderRadius: '16px',
                  fontSize: '0.8rem',
                  lineHeight: '1.5',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ fontWeight: 800, color: '#c084fc', marginBottom: '4px' }}>🛡️ Intelligent 3-Way CRDT Engine</div>
                Plumine CS+ automatically synchronizes your Kannada learning state across devices, merging XP, streaks, unlocked badges, and SRS intervals without ever overwriting your hard-earned progress.
              </div>

              {/* Trigger Button */}
              <button
                onClick={handleSyncNow}
                disabled={syncing}
                style={{
                  width: '100%',
                  padding: '0.9rem',
                  background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                  border: 'none',
                  borderRadius: '14px',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(168, 85, 247, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                {syncing ? '⏳ Syncing Quantum Mesh...' : '⚡ Sync All Progress Now'}
              </button>
            </div>
          )}

          {activeTab === 'magicsync' && (
            <div>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginTop: 0, marginBottom: '1.25rem' }}>
                Transfer your entire Kannada learning profile to your phone, tablet, or another browser with 1 click.
              </p>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#c084fc', marginBottom: '6px' }}>
                  🪄 1-Click Magic Sync URL
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    readOnly
                    value={magicLink}
                    style={{
                      flex: 1,
                      padding: '0.75rem 1rem',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(192, 132, 252, 0.3)',
                      borderRadius: '12px',
                      color: '#38bdf8',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                  <button
                    onClick={handleCopyMagicLink}
                    style={{
                      padding: '0.75rem 1.25rem',
                      background: copied ? '#22c55e' : 'linear-gradient(135deg, #c084fc, #6366f1)',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#fff',
                      fontWeight: 800,
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                    }}
                  >
                    {copied ? '✅ Copied!' : '📋 Copy'}
                  </button>
                </div>
              </div>

              {/* QR Code generator placeholder */}
              <div
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px dashed rgba(192, 132, 252, 0.3)',
                  borderRadius: '16px',
                  padding: '1.25rem',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.4rem', color: '#fff' }}>
                  📱 Scan on Mobile Device
                </div>
                <div style={{ display: 'inline-block', padding: '12px', background: '#fff', borderRadius: '12px', margin: '0.5rem 0' }}>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(magicLink)}`}
                    alt="Plumine CS+ Magic QR"
                    style={{ width: '150px', height: '150px', display: 'block' }}
                  />
                </div>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', margin: '4px 0 0' }}>
                  Point your phone camera to instantly restore your progress on mobile.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'snapshots' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
                  Auto-saved rollback restore points
                </span>
                <button
                  onClick={handleCreateSnapshot}
                  style={{
                    padding: '0.45rem 0.85rem',
                    background: 'rgba(168,85,247,0.2)',
                    border: '1px solid rgba(168,85,247,0.4)',
                    borderRadius: '10px',
                    color: '#c084fc',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                  }}
                >
                  ➕ Create Snapshot
                </button>
              </div>

              {snapshots.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
                  No snapshots recorded yet. Click "Create Snapshot" or trigger a cloud sync.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {snapshots.map((snap) => (
                    <div
                      key={snap.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.85rem 1rem',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '14px',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#fff' }}>{snap.label}</div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
                          {snap.dateStr} · ⭐ {snap.xp} XP · 🔥 {snap.streak}d Streak
                        </div>
                      </div>
                      <button
                        onClick={() => handleRestoreSnapshot(snap)}
                        style={{
                          padding: '0.4rem 0.8rem',
                          background: 'rgba(56,189,248,0.15)',
                          border: '1px solid rgba(56,189,248,0.4)',
                          borderRadius: '8px',
                          color: '#38bdf8',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                        }}
                      >
                        Rollback ↺
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlumineCSModal;
