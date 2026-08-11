import React, { useState, useEffect, useCallback } from 'react';
import {
  getAllUsers,
  banUser,
  unbanUser,
  promoteToAdmin,
  demoteFromAdmin,
  createNewAdmin,
  deleteUser,
  resetUserProgressByCode,
  ensureFounderAccount,
  getAdminStats,
  getBugReports,
  markBugReportRead,
  deleteBugReport,
  setActiveBroadcast,
  getActiveBroadcast,
  clearActiveBroadcast,
} from '../utils/storage.js';
import {
  FOUNDER_NAME,
  verifyControlCenterCode,
  setAdminSession,
  isAdminSessionActive,
} from '../utils/adminConfig.js';
import { fetchGlobalUsers } from '../utils/onlineLeaderboard.js';

// ── Royal Crown Logo SVG ──────────────────────────────────────────────────
const CrownEmblem = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="ccBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#d90429" />
        <stop offset="50%" stopColor="#ef233c" />
        <stop offset="100%" stopColor="#8d0801" />
      </linearGradient>
      <linearGradient id="ccGold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fff3b0" />
        <stop offset="50%" stopColor="#ffb703" />
        <stop offset="100%" stopColor="#fb8500" />
      </linearGradient>
      <filter id="ccGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    <circle cx="50" cy="50" r="46" fill="url(#ccBg)" stroke="url(#ccGold)" strokeWidth="4" filter="url(#ccGlow)" />
    <circle cx="50" cy="50" r="40" stroke="url(#ccGold)" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.8" />
    <path d="M35 34 L42 42 L50 28 L58 42 L65 34 L62 50 L38 50 Z" fill="url(#ccGold)" />
    <circle cx="35" cy="32" r="2.5" fill="#fff" />
    <circle cx="50" cy="26" r="3" fill="#fff" />
    <circle cx="65" cy="32" r="2.5" fill="#fff" />
    <text x="50" y="74" textAnchor="middle" fill="url(#ccGold)" fontSize="28" fontWeight="900" fontFamily="Noto Sans Kannada, sans-serif" filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.5))">
      ಸೊ
    </text>
  </svg>
);

// ── Admin Gate Lock Screen ─────────────────────────────────────────────────
const AdminGate = ({ onUnlock }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [showCode, setShowCode] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (verifyControlCenterCode(code)) {
      ensureFounderAccount();
      setAdminSession(true);
      onUnlock();
    } else {
      setError('❌ Access Denied: Invalid Master Code. Authorized to Founder Sujay only.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 50% 30%, #1e092b 0%, #0a0410 70%, #040208 100%)',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background Ambient Glow Orbs */}
      <div style={{
        position: 'absolute', top: '15%', left: '25%', width: 350, height: 350,
        background: 'radial-gradient(circle, rgba(217,4,41,0.2) 0%, rgba(0,0,0,0) 70%)',
        filter: 'blur(50px)', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '15%', right: '25%', width: 350, height: 350,
        background: 'radial-gradient(circle, rgba(255,183,3,0.2) 0%, rgba(0,0,0,0) 70%)',
        filter: 'blur(50px)', pointerEvents: 'none',
      }} />

      <div className="glass-card" style={{
        maxWidth: 440, width: '100%', padding: '3rem 2.5rem', textAlign: 'center',
        background: 'rgba(20, 10, 30, 0.75)',
        border: '1px solid rgba(255,215,0,0.3)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 40px rgba(255,215,0,0.15)',
        borderRadius: '28px', position: 'relative', zIndex: 2,
      }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <CrownEmblem size={72} />
        </div>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          background: 'linear-gradient(135deg, rgba(255,215,0,0.15), rgba(217,4,41,0.15))',
          border: '1px solid rgba(255,215,0,0.4)', color: '#ffd700',
          fontSize: '0.72rem', fontWeight: 900, letterSpacing: '2.5px',
          padding: '0.35rem 1rem', borderRadius: '30px', marginBottom: '1.25rem',
          boxShadow: '0 0 15px rgba(255,215,0,0.2)',
        }}>
          ⚡ FOUNDER COMMAND CENTER
        </div>

        <h2 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '0.4rem', letterSpacing: '-0.5px' }}>
          Sobagu Control Hub
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.88rem', lineHeight: 1.5 }}>
          Authorized Access Only · Enter Master Key to authenticate
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ position: 'relative', textAlign: 'left', marginBottom: '1.25rem' }}>
            <label className="form-label" style={{ fontSize: '0.75rem', letterSpacing: '1px', textTransform: 'uppercase', color: '#ffd700', fontWeight: 800 }}>
              Master Security Code
            </label>
            <input
              className="form-input"
              type={showCode ? 'text' : 'password'}
              inputMode="numeric"
              placeholder="•••• •••• ••••"
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 12))}
              maxLength={12}
              autoFocus
              style={{
                letterSpacing: '0.25em', paddingRight: '3.2rem', height: '52px',
                fontSize: '1.1rem', fontWeight: 700,
                background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,215,0,0.3)',
                borderRadius: '14px', color: '#fff',
              }}
            />
            <button
              type="button"
              onClick={() => setShowCode(v => !v)}
              style={{
                position: 'absolute', right: '0.85rem', top: '2.45rem',
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '1.2rem', color: 'rgba(255,255,255,0.6)',
              }}
            >
              {showCode ? '🙈' : '👁️'}
            </button>
          </div>

          {error && (
            <div style={{
              background: 'rgba(239,35,60,0.15)', border: '1px solid rgba(239,35,60,0.4)',
              color: '#ff4d6d', fontSize: '0.83rem', padding: '0.65rem 0.85rem',
              borderRadius: '12px', marginBottom: '1.25rem', fontWeight: 600,
            }}>
              {error}
            </div>
          )}

          <button
            className="btn-primary"
            type="submit"
            style={{
              width: '100%', height: '52px', fontSize: '1rem', fontWeight: 800,
              background: 'linear-gradient(135deg, #d90429 0%, #ef233c 50%, #b7094c 100%)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '14px', cursor: 'pointer',
              boxShadow: '0 8px 25px rgba(217,4,41,0.4)',
              transition: 'all 0.25s ease',
            }}
          >
            🔐 Authenticate Founder Sujay
          </button>
        </form>

        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', margin: 0 }}>
            👑 Platform Owner & Founder: <strong style={{ color: '#ffd700' }}>Sujay</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

// ── Role Badge ─────────────────────────────────────────────────────────────
const RoleBadge = ({ role, banned }) => {
  if (banned) {
    return (
      <span style={{
        background: 'rgba(239,35,60,0.15)', border: '1px solid rgba(239,35,60,0.4)',
        color: '#ff4d6d', fontSize: '0.72rem', fontWeight: 800,
        padding: '0.2rem 0.65rem', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      }}>🚫 Banned</span>
    );
  }
  if (role === 'founder') {
    return (
      <span style={{
        background: 'linear-gradient(135deg, rgba(255,215,0,0.2), rgba(217,4,41,0.2))',
        border: '1px solid rgba(255,215,0,0.5)', color: '#ffd700',
        fontSize: '0.72rem', fontWeight: 900, letterSpacing: '0.5px',
        padding: '0.2rem 0.65rem', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
        boxShadow: '0 0 10px rgba(255,215,0,0.2)',
      }}>👑 Founder</span>
    );
  }
  if (role === 'admin') {
    return (
      <span style={{
        background: 'rgba(79,172,254,0.15)', border: '1px solid rgba(79,172,254,0.4)',
        color: '#4facfe', fontSize: '0.72rem', fontWeight: 800,
        padding: '0.2rem 0.65rem', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      }}>🛡️ Admin</span>
    );
  }
  return (
    <span style={{
      background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
      color: 'rgba(255,255,255,0.7)', fontSize: '0.72rem', fontWeight: 700,
      padding: '0.2rem 0.65rem', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
    }}>👤 Learner</span>
  );
};

// ── Category Badge ─────────────────────────────────────────────────────────
const CategoryBadge = ({ cat }) => {
  const map = {
    bug: { label: '🐛 Bug', color: '#ff4d6d' },
    feature: { label: '✨ Feature', color: '#4facfe' },
    crash: { label: '💥 Crash', color: '#ff923c' },
    general: { label: '💬 General', color: '#a18cd1' },
  };
  const c = map[cat] || map.general;
  return (
    <span style={{
      background: c.color + '22', border: `1px solid ${c.color}55`,
      color: c.color, fontSize: '0.7rem', fontWeight: 800,
      padding: '0.2rem 0.6rem', borderRadius: '20px', whiteSpace: 'nowrap',
    }}>{c.label}</span>
  );
};

// ── Main Control Center Component ─────────────────────────────────────────
const SobaguControlCenter = ({ onExit, onToast }) => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState(getAdminStats());
  const [selectedUser, setSelectedUser] = useState(null);
  const [inspectUser, setInspectUser] = useState(null);
  const [banReason, setBanReason] = useState('');
  const [cloudCount, setCloudCount] = useState(0);
  const [bugReports, setBugReports] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminCode, setNewAdminCode] = useState('');
  const [createdAdmin, setCreatedAdmin] = useState(null);

  const handleCreateAdmin = (e) => {
    e.preventDefault();
    if (!newAdminName.trim()) return;
    const admin = createNewAdmin(newAdminName.trim(), newAdminCode.trim() || null);
    setCreatedAdmin(admin);
    setNewAdminName('');
    setNewAdminCode('');
    onToast?.(`🛡️ Admin "${admin.name}" created!`, 'success');
    refresh();
  };

  const refresh = useCallback(async () => {
    const localUsers = Object.values(getAllUsers()).sort((a, b) => (b.xp || 0) - (a.xp || 0));
    setUsers(localUsers);
    setStats(getAdminStats());
    const reports = getBugReports();
    setBugReports(reports);
    setUnreadCount(reports.filter(r => !r.read).length);
    try {
      const cloud = await fetchGlobalUsers();
      setCloudCount(Object.keys(cloud || {}).length);
    } catch {
      setCloudCount(0);
    }
  }, []);

  useEffect(() => {
    ensureFounderAccount();
    refresh();
  }, [refresh]);

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchesSearch = !q || u.name?.toLowerCase().includes(q) || u.code?.includes(q);
    const matchesFilter =
      filter === 'all' ||
      (filter === 'banned' && u.banned) ||
      (filter === 'admin' && (u.role === 'admin' || u.role === 'founder')) ||
      (filter === 'active' && !u.banned);
    return matchesSearch && matchesFilter;
  });

  const handleBan = (code) => {
    if (!window.confirm('Ban this account? They will not be able to log in.')) return;
    banUser(code, banReason || 'Banned by Founder Sujay');
    setBanReason('');
    setSelectedUser(null);
    onToast?.('🚫 Account banned', 'info');
    refresh();
  };

  const handleUnban = (code) => {
    unbanUser(code);
    onToast?.('✅ Account unbanned', 'success');
    refresh();
  };

  const handlePromote = (code) => {
    promoteToAdmin(code);
    onToast?.('🛡️ User promoted to Admin', 'success');
    refresh();
  };

  const handleDemote = (code) => {
    demoteFromAdmin(code);
    onToast?.('👤 Admin demoted to User', 'info');
    refresh();
  };

  const handleDelete = (code) => {
    if (!window.confirm('Permanently delete this account? This cannot be undone.')) return;
    deleteUser(code);
    setSelectedUser(null);
    onToast?.('🗑️ Account deleted', 'info');
    refresh();
  };

  const handleReset = (code) => {
    if (!window.confirm('Reset all progress for this user?')) return;
    resetUserProgressByCode(code);
    onToast?.('🔄 Progress reset', 'info');
    refresh();
  };

  const handleMarkRead = (id) => {
    markBugReportRead(id);
    refresh();
  };

  const handleDeleteReport = (id) => {
    deleteBugReport(id);
    onToast?.('🗑️ Report deleted', 'info');
    refresh();
  };

  const handleSendBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    setActiveBroadcast(broadcastMessage.trim(), 'Founder Sujay');
    onToast?.(`📢 Live broadcast published across the platform!`, 'xp');
    setShowBroadcastModal(false);
    setBroadcastMessage('');
    refresh();
  };

  const handleClearBroadcast = () => {
    clearActiveBroadcast();
    onToast?.('🗑️ Active broadcast cleared', 'info');
    refresh();
  };

  const handleLogout = () => {
    setAdminSession(false);
    onExit();
  };

  const TABS = [
    { id: 'users', label: '👥 User Directory', count: users.length },
    { id: 'bugs', label: '🐛 Bug Reports Inbox', count: bugReports.length, highlight: unreadCount > 0 ? unreadCount : null },
    { id: 'analytics', label: '📊 Platform Analytics', count: null },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 50% 10%, #170724 0%, #0a0410 60%, #030106 100%)',
      color: 'var(--text-primary)',
      fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif",
      paddingBottom: '3rem',
    }}>
      {/* ── Top Header ────────────────────────────────────────────────────────── */}
      <header style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '1.25rem 2.5rem', flexWrap: 'wrap', gap: '1.25rem',
        background: 'rgba(12, 5, 20, 0.85)',
        borderBottom: '1px solid rgba(255, 215, 0, 0.25)',
        backdropFilter: 'blur(20px)',
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.1rem' }}>
          <CrownEmblem size={52} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h1 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900, letterSpacing: '-0.3px', background: 'linear-gradient(135deg, #fff, #ffd700)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Sobagu Control Center
              </h1>
              <span style={{
                background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)',
                color: '#4ade80', fontSize: '0.68rem', fontWeight: 900,
                padding: '0.15rem 0.55rem', borderRadius: '20px', letterSpacing: '0.5px',
              }}>
                ● ONLINE
              </span>
            </div>
            <p style={{ margin: '0.2rem 0 0', color: '#ffd700', fontSize: '0.8rem', fontWeight: 700 }}>
              👑 FOUNDER & CHIEF ARCHITECT — {FOUNDER_NAME}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={() => { setShowAddAdminModal(true); setCreatedAdmin(null); }}
            style={{
              padding: '0.55rem 1.1rem', borderRadius: '12px', border: '1px solid rgba(79,172,254,0.5)',
              background: 'linear-gradient(135deg, rgba(79,172,254,0.2), rgba(0,102,255,0.2))',
              color: '#4facfe', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              boxShadow: '0 0 15px rgba(79,172,254,0.2)',
            }}
          >
            🛡️ + Add Admin
          </button>
          <button
            onClick={() => setShowBroadcastModal(true)}
            style={{
              padding: '0.55rem 1.1rem', borderRadius: '12px', border: '1px solid rgba(255,215,0,0.4)',
              background: 'linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,140,0,0.15))',
              color: '#ffd700', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              transition: 'all 0.2s ease',
            }}
          >
            📢 Send Broadcast
          </button>
          <button
            onClick={refresh}
            style={{
              padding: '0.55rem 1.1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.06)', color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.4rem',
            }}
          >
            🔄 Sync Data
          </button>
          <button
            onClick={onExit}
            style={{
              padding: '0.55rem 1.1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.06)', color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
            }}
          >
            ← Back to App
          </button>
          <button
            onClick={handleLogout}
            style={{
              padding: '0.55rem 1.1rem', borderRadius: '12px', border: '1px solid rgba(239,35,60,0.5)',
              background: 'linear-gradient(135deg, #d90429, #8d0801)', color: '#fff', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(217,4,41,0.3)',
            }}
          >
            🔒 Lock Terminal
          </button>
        </div>
      </header>

      {/* ── Main Container ──────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* ── Stat Cards Grid ──────────────────────────────────────────────── */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '1.1rem', marginBottom: '2.25rem',
        }}>
          {[
            { label: 'Total Accounts', value: stats.total, icon: '👥', color: '#4facfe', bg: 'rgba(79,172,254,0.1)' },
            { label: 'Active Today', value: stats.activeToday, icon: '🔥', color: '#ff7b54', bg: 'rgba(255,123,84,0.1)' },
            { label: 'Platform Admins', value: stats.admins, icon: '🛡️', color: '#a18cd1', bg: 'rgba(161,140,209,0.1)' },
            { label: 'Suspended', value: stats.banned, icon: '🚫', color: '#ff4d6d', bg: 'rgba(255,77,109,0.1)' },
            { label: 'Total Platform XP', value: stats.totalXP.toLocaleString(), icon: '⭐', color: '#ffd700', bg: 'rgba(255,215,0,0.1)' },
            { label: 'Cloud Synced', value: cloudCount, icon: '☁️', color: '#43e97b', bg: 'rgba(67,233,123,0.1)' },
            { label: 'Bug Reports', value: bugReports.length, icon: '🐛', color: '#f093fb', bg: 'rgba(240,147,251,0.1)', badge: unreadCount > 0 ? `${unreadCount} new` : null },
          ].map(s => (
            <div
              key={s.label}
              className="glass-card"
              style={{
                padding: '1.25rem 1rem', textAlign: 'center', position: 'relative', overflow: 'hidden',
                background: 'rgba(20, 10, 30, 0.65)', border: `1px solid ${s.color}33`,
                borderRadius: '20px', transition: 'all 0.25s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = s.color; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = s.color + '33'; }}
            >
              {s.badge && (
                <span style={{
                  position: 'absolute', top: 10, right: 10,
                  background: '#ffd700', color: '#000', fontSize: '0.62rem', fontWeight: 900,
                  padding: '0.15rem 0.45rem', borderRadius: '10px',
                }}>
                  {s.badge}
                </span>
              )}
              <div style={{
                width: 44, height: 44, borderRadius: '50%', background: s.bg,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.35rem', marginBottom: '0.65rem', border: `1px solid ${s.color}44`,
              }}>
                {s.icon}
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: s.color, lineHeight: 1 }}>
                {s.value}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.35rem', fontWeight: 600 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* ── Navigation Tabs ───────────────────────────────────────────────── */}
        <div style={{
          display: 'flex', gap: '0.75rem', marginBottom: '1.75rem',
          background: 'rgba(15, 7, 25, 0.6)', padding: '0.4rem', borderRadius: '18px',
          border: '1px solid rgba(255,255,255,0.08)', flexWrap: 'wrap',
        }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                padding: '0.75rem 1.4rem', borderRadius: '14px', border: 'none', cursor: 'pointer',
                fontWeight: 800, fontSize: '0.9rem', position: 'relative',
                background: activeTab === t.id
                  ? 'linear-gradient(135deg, #d90429 0%, #ef233c 100%)'
                  : 'transparent',
                color: activeTab === t.id ? '#fff' : 'rgba(255,255,255,0.65)',
                boxShadow: activeTab === t.id ? '0 4px 20px rgba(217,4,41,0.4)' : 'none',
                transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}
            >
              {t.label}
              {t.count !== null && (
                <span style={{
                  background: activeTab === t.id ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.1)',
                  padding: '0.1rem 0.5rem', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 900,
                }}>
                  {t.count}
                </span>
              )}
              {t.highlight && (
                <span style={{
                  background: '#ffd700', color: '#000', borderRadius: '50%',
                  width: 20, height: 20, fontSize: '0.7rem', fontWeight: 900,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {t.highlight}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── TAB 1: User Directory ───────────────────────────────────────────── */}
        {activeTab === 'users' && (
          <div className="glass-card" style={{
            padding: '1.75rem', borderRadius: '24px',
            background: 'rgba(15, 8, 25, 0.75)', border: '1px solid rgba(255,215,0,0.15)',
          }}>
            {/* Search and Filters Toolbar */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap',
            }}>
              <input
                className="form-input"
                style={{
                  maxWidth: 360, width: '100%', height: '44px',
                  background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '12px', fontSize: '0.9rem', paddingLeft: '1rem',
                }}
                placeholder="🔍 Search user by name or 6-digit code..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {[
                  { id: 'all', label: 'All Users' },
                  { id: 'active', label: 'Active' },
                  { id: 'admin', label: 'Admins & Founder' },
                  { id: 'banned', label: 'Banned' },
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id)}
                    style={{
                      padding: '0.45rem 1rem', borderRadius: '12px', border: 'none', cursor: 'pointer',
                      fontWeight: 700, fontSize: '0.8rem',
                      background: filter === f.id ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.06)',
                      border: `1px solid ${filter === f.id ? '#ffd700' : 'rgba(255,255,255,0.1)'}`,
                      color: filter === f.id ? '#ffd700' : 'rgba(255,255,255,0.7)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Users Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    {['Learner Profile', 'Login Code', 'XP Score', 'Level', 'Streak', 'Role Status', 'Founder Actions'].map(h => (
                      <th key={h} style={{
                        padding: '0.85rem 0.75rem', textAlign: 'left',
                        color: 'rgba(255,255,255,0.5)', fontWeight: 800, fontSize: '0.75rem',
                        textTransform: 'uppercase', letterSpacing: '0.7px',
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.4)' }}>
                        No accounts match your filter criteria.
                      </td>
                    </tr>
                  )}
                  {filtered.map(u => (
                    <tr
                      key={u.code}
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        background: u.banned ? 'rgba(239,35,60,0.06)' : 'transparent',
                        transition: 'background 0.2s',
                      }}
                    >
                      <td style={{ padding: '0.85rem 0.75rem' }}>
                        <div
                          onClick={() => setInspectUser(u)}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer' }}
                        >
                          <div style={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: u.role === 'founder'
                              ? 'linear-gradient(135deg,#ffd700,#ff8c00)'
                              : 'linear-gradient(135deg,#a18cd1,#fbc2eb)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 900, fontSize: '0.9rem', color: '#000', flexShrink: 0,
                            boxShadow: u.role === 'founder' ? '0 0 12px rgba(255,215,0,0.5)' : 'none',
                          }}>
                            {u.name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, color: u.role === 'founder' ? '#ffd700' : '#fff' }}>
                              {u.name}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>
                              Joined {new Date(u.createdAt || Date.now()).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem' }}>
                        <code style={{
                          background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
                          padding: '0.2rem 0.55rem', borderRadius: '6px', fontSize: '0.85rem',
                          fontFamily: 'monospace', color: '#ffd700', fontWeight: 700,
                        }}>
                          {u.code}
                        </code>
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem', fontWeight: 900, color: '#ffd700' }}>
                        {(u.xp || 0).toLocaleString()} XP
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem', fontWeight: 700 }}>
                        Lv.{u.level || 1}
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem', fontWeight: 700, color: '#ff7b54' }}>
                        {u.streak || 0} 🔥
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem' }}>
                        <RoleBadge role={u.role} banned={u.banned} />
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem' }}>
                        {u.role !== 'founder' ? (
                          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                            {!u.banned ? (
                              <button
                                title="Ban Account"
                                onClick={() => setSelectedUser(u.code)}
                                style={{
                                  padding: '0.35rem 0.65rem', background: 'rgba(239,35,60,0.15)',
                                  border: '1px solid rgba(239,35,60,0.4)', borderRadius: '8px',
                                  color: '#ff4d6d', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700,
                                }}
                              >🚫 Ban</button>
                            ) : (
                              <button
                                title="Unban Account"
                                onClick={() => handleUnban(u.code)}
                                style={{
                                  padding: '0.35rem 0.65rem', background: 'rgba(67,233,123,0.15)',
                                  border: '1px solid rgba(67,233,123,0.4)', borderRadius: '8px',
                                  color: '#43e97b', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700,
                                }}
                              >✅ Unban</button>
                            )}
                            {u.role !== 'admin' ? (
                              <button
                                title="Promote to Admin"
                                onClick={() => handlePromote(u.code)}
                                style={{
                                  padding: '0.35rem 0.65rem', background: 'rgba(79,172,254,0.15)',
                                  border: '1px solid rgba(79,172,254,0.4)', borderRadius: '8px',
                                  color: '#4facfe', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700,
                                }}
                              >🛡️ Admin</button>
                            ) : (
                              <button
                                title="Demote to User"
                                onClick={() => handleDemote(u.code)}
                                style={{
                                  padding: '0.35rem 0.65rem', background: 'rgba(255,255,255,0.08)',
                                  border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px',
                                  color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700,
                                }}
                              >⬇️ Demote</button>
                            )}
                            <button
                              title="Reset Progress"
                              onClick={() => handleReset(u.code)}
                              style={{
                                padding: '0.35rem 0.65rem', background: 'rgba(255,183,3,0.15)',
                                border: '1px solid rgba(255,183,3,0.4)', borderRadius: '8px',
                                color: '#ffb703', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700,
                              }}
                            >🔄 Reset</button>
                            <button
                              title="Delete Account"
                              onClick={() => handleDelete(u.code)}
                              style={{
                                padding: '0.35rem 0.65rem', background: 'rgba(239,35,60,0.15)',
                                border: '1px solid rgba(239,35,60,0.4)', borderRadius: '8px',
                                color: '#ff4d6d', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700,
                              }}
                            >🗑️ Delete</button>
                          </div>
                        ) : (
                          <span style={{ color: '#ffd700', fontWeight: 900, fontSize: '0.82rem' }}>
                            👑 Protected Founder
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 2: Bug Reports Inbox ────────────────────────────────────────── */}
        {activeTab === 'bugs' && (
          <div>
            {bugReports.length === 0 ? (
              <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center', borderRadius: '24px' }}>
                <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🐛</div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Bug Reports Inbox Empty</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: 400, margin: '0.5rem auto 0' }}>
                  No customer bug reports or feature requests have been submitted yet.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {bugReports.map(r => (
                  <div
                    key={r.id}
                    className="glass-card"
                    style={{
                      padding: '1.5rem', borderRadius: '20px',
                      background: 'rgba(15, 8, 25, 0.75)',
                      borderLeft: r.read ? '4px solid rgba(255,255,255,0.15)' : '4px solid #ffd700',
                      boxShadow: r.read ? 'none' : '0 0 20px rgba(255,215,0,0.15)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.25rem', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.65rem', flexWrap: 'wrap' }}>
                          <CategoryBadge cat={r.category} />
                          {!r.read && (
                            <span style={{
                              background: '#ffd700', color: '#000', fontSize: '0.65rem', fontWeight: 900,
                              padding: '0.15rem 0.5rem', borderRadius: '20px', letterSpacing: '0.5px',
                            }}>
                              NEW UNREAD
                            </span>
                          )}
                          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem' }}>
                            From: <strong style={{ color: '#fff' }}>{r.userName}</strong> (Code: <code style={{ color: '#ffd700' }}>{r.userCode}</code>)
                          </span>
                        </div>
                        <p style={{ margin: '0 0 0.65rem', fontSize: '1rem', lineHeight: 1.6, color: '#fff' }}>
                          {r.message}
                        </p>
                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem' }}>
                          📅 Submitted {new Date(r.timestamp).toLocaleString()}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '0.6rem', flexShrink: 0 }}>
                        {!r.read && (
                          <button
                            onClick={() => handleMarkRead(r.id)}
                            style={{
                              padding: '0.45rem 0.85rem', background: 'rgba(67,233,123,0.15)',
                              border: '1px solid rgba(67,233,123,0.4)', borderRadius: '10px',
                              color: '#43e97b', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 800,
                            }}
                          >
                            ✓ Mark Read
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteReport(r.id)}
                          style={{
                            padding: '0.45rem 0.85rem', background: 'rgba(239,35,60,0.15)',
                            border: '1px solid rgba(239,35,60,0.4)', borderRadius: '10px',
                            color: '#ff4d6d', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 800,
                          }}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: Platform Analytics ───────────────────────────────────────── */}
        {activeTab === 'analytics' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            <div className="glass-card" style={{ padding: '1.75rem', borderRadius: '24px', background: 'rgba(15, 8, 25, 0.75)' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', color: '#ffd700' }}>
                👥 User Distribution
              </h3>
              {[
                { label: 'Regular Learners', value: stats.total - stats.admins - stats.banned, color: '#4facfe' },
                { label: 'Platform Admins', value: stats.admins, color: '#a18cd1' },
                { label: 'Suspended Accounts', value: stats.banned, color: '#ff4d6d' },
                { label: 'Active Today', value: stats.activeToday, color: '#43e97b' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>{s.label}</span>
                  <span style={{ fontWeight: 900, color: s.color, fontSize: '1.1rem' }}>{s.value}</span>
                </div>
              ))}
            </div>

            <div className="glass-card" style={{ padding: '1.75rem', borderRadius: '24px', background: 'rgba(15, 8, 25, 0.75)' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', color: '#ffd700' }}>
                ⚡ Engagement Metrics
              </h3>
              {[
                { label: 'Total Accumulated XP', value: stats.totalXP.toLocaleString() + ' XP', color: '#ffd700' },
                { label: 'Cloud Synced Leaderboard Records', value: cloudCount, color: '#43e97b' },
                { label: 'Total Bug Reports Filed', value: bugReports.length, color: '#f093fb' },
                { label: 'Unread Customer Reports', value: unreadCount, color: '#ff7b54' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>{s.label}</span>
                  <span style={{ fontWeight: 900, color: s.color, fontSize: '1.1rem' }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Modal 1: Ban Account Reason Modal ────────────────────────────────── */}
      {selectedUser && (
        <div
          onClick={() => setSelectedUser(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: '1rem', backdropFilter: 'blur(5px)',
          }}
        >
          <div
            className="glass-card"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: 420, width: '100%', padding: '2rem', borderRadius: '24px', background: 'rgba(20, 10, 30, 0.95)' }}
          >
            <h3 style={{ marginBottom: '0.5rem', color: '#ff4d6d' }}>🚫 Confirm Account Suspension</h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
              Target User Code: <code style={{ color: '#ffd700' }}>{selectedUser}</code>
            </p>
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label">Ban Reason (visible to user)</label>
              <input
                className="form-input"
                placeholder="e.g. Violation of community guidelines"
                value={banReason}
                onChange={e => setBanReason(e.target.value)}
                autoFocus
              />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setSelectedUser(null)}>Cancel</button>
              <button
                className="btn-primary"
                style={{ flex: 1, background: 'linear-gradient(135deg, #d90429, #8d0801)' }}
                onClick={() => handleBan(selectedUser)}
              >
                Confirm Ban
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal 2: User Inspect Profile Modal ──────────────────────────────── */}
      {inspectUser && (
        <div
          onClick={() => setInspectUser(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: '1rem', backdropFilter: 'blur(5px)',
          }}
        >
          <div
            className="glass-card"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: 480, width: '100%', padding: '2.25rem', borderRadius: '28px', background: 'rgba(20, 10, 30, 0.95)', border: '1px solid rgba(255,215,0,0.3)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'linear-gradient(135deg,#ffd700,#ff8c00)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', fontWeight: 900, color: '#000',
              }}>
                {inspectUser.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900 }}>{inspectUser.name}</h3>
                <code style={{ color: '#ffd700', fontSize: '0.85rem' }}>Code: {inspectUser.code}</code>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1.5rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.85rem', borderRadius: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ffd700' }}>{(inspectUser.xp || 0).toLocaleString()}</div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)' }}>Total XP</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.85rem', borderRadius: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ff7b54' }}>{inspectUser.streak || 0} 🔥</div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)' }}>Day Streak</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setInspectUser(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal 3: Broadcast Toast Modal ───────────────────────────────────── */}
      {showBroadcastModal && (
        <div
          onClick={() => setShowBroadcastModal(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: '1rem', backdropFilter: 'blur(5px)',
          }}
        >
          <div
            className="glass-card"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: 440, width: '100%', padding: '2rem', borderRadius: '24px', background: 'rgba(20, 10, 30, 0.95)' }}
          >
            <h3 style={{ marginBottom: '0.5rem', color: '#ffd700' }}>📢 Send Live Platform Broadcast</h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              This message will pop up live as a notification across the app.
            </p>

            <form onSubmit={handleSendBroadcast}>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Broadcast Message</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="e.g. Welcome to Sobagu! Check out the new Speed Typing game! 🎉"
                  value={broadcastMessage}
                  onChange={e => setBroadcastMessage(e.target.value)}
                  autoFocus
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowBroadcastModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1, background: 'linear-gradient(135deg, #ffd700, #ff8c00)', color: '#000', fontWeight: 900 }} disabled={!broadcastMessage.trim()}>
                  🚀 Send Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal 4: Add New Admin Modal ─────────────────────────────────────── */}
      {showAddAdminModal && (
        <div
          onClick={() => setShowAddAdminModal(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: '1rem', backdropFilter: 'blur(5px)',
          }}
        >
          <div
            className="glass-card"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: 440, width: '100%', padding: '2rem', borderRadius: '24px', background: 'rgba(20, 10, 30, 0.95)', border: '1px solid rgba(79,172,254,0.3)' }}
          >
            <h3 style={{ marginBottom: '0.5rem', color: '#4facfe' }}>🛡️ Add New Platform Admin</h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Create an Admin account. Admins will have administrative privileges on Sobagu.
            </p>

            {createdAdmin ? (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎉</div>
                <h4 style={{ color: '#4facfe', fontSize: '1.2rem', marginBottom: '0.5rem' }}>Admin Account Created!</h4>
                <div style={{ background: 'rgba(0,0,0,0.4)', padding: '1rem', borderRadius: '14px', margin: '1rem 0', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <p style={{ margin: '0 0 0.5rem', fontSize: '0.9rem' }}>Admin Name: <strong>{createdAdmin.name}</strong></p>
                  <p style={{ margin: 0, fontSize: '0.9rem' }}>6-Digit Login Code: <code style={{ color: '#ffd700', fontSize: '1.1rem', fontWeight: 900 }}>{createdAdmin.code}</code></p>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
                  Share this 6-digit code with the new admin so they can log in.
                </p>
                <button className="btn-primary" style={{ width: '100%' }} onClick={() => { setCreatedAdmin(null); setShowAddAdminModal(false); }}>
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateAdmin}>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Admin Name</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="e.g. Admin Rahul, Admin Priya..."
                    value={newAdminName}
                    onChange={e => setNewAdminName(e.target.value)}
                    autoFocus
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label">Custom 6-Digit Code (Optional)</label>
                  <input
                    className="form-input"
                    type="text"
                    inputMode="numeric"
                    placeholder="Leave blank to auto-generate"
                    value={newAdminCode}
                    onChange={e => setNewAdminCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowAddAdminModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary" style={{ flex: 1, background: 'linear-gradient(135deg, #4facfe, #0066ff)', color: '#fff', fontWeight: 900 }} disabled={!newAdminName.trim()}>
                    ✨ Create Admin
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ── App Wrapper ────────────────────────────────────────────────────────────
const SobaguControlCenterApp = ({ onExit, onToast }) => {
  const [unlocked, setUnlocked] = useState(isAdminSessionActive());

  if (!unlocked) {
    return <AdminGate onUnlock={() => setUnlocked(true)} />;
  }

  return <SobaguControlCenter onExit={onExit} onToast={onToast} />;
};

export default SobaguControlCenterApp;
