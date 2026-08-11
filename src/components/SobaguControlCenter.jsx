import React, { useState, useEffect, useCallback } from 'react';
import {
  getAllUsers,
  banUser,
  unbanUser,
  promoteToAdmin,
  demoteFromAdmin,
  deleteUser,
  resetUserProgressByCode,
  ensureFounderAccount,
  getAdminStats,
  getBugReports,
  markBugReportRead,
  deleteBugReport,
  getUnreadBugCount,
} from '../utils/storage.js';
import {
  FOUNDER_NAME,
  verifyControlCenterCode,
  setAdminSession,
  isAdminSessionActive,
} from '../utils/adminConfig.js';
import { fetchGlobalUsers } from '../utils/onlineLeaderboard.js';

// ── Admin Gate ─────────────────────────────────────────────────────────────
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
      setError('❌ Invalid code. Only Founder Sujay may access this.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg,#0a0a0f,#1a0a2e,#0a0a0f)',
      padding: '2rem',
    }}>
      <div className="glass-card" style={{ maxWidth: 420, width: '100%', padding: '2.5rem', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 70, height: 70, borderRadius: '50%',
          background: 'linear-gradient(135deg,#d90429,#8d0801)',
          fontSize: '2rem', marginBottom: '1.25rem',
          boxShadow: '0 0 30px rgba(217,4,41,0.5)',
        }}>🛡️</div>
        <div style={{
          display: 'inline-block', background: 'rgba(217,4,41,0.15)',
          border: '1px solid rgba(217,4,41,0.4)', color: '#ef233c',
          fontSize: '0.7rem', fontWeight: 800, letterSpacing: '2px',
          padding: '0.25rem 0.75rem', borderRadius: '20px', marginBottom: '1rem',
        }}>⚡ RESTRICTED ACCESS</div>
        <h2 style={{ fontSize: '1.6rem', marginBottom: '0.4rem' }}>Sobagu Control Center</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
          Founded by {FOUNDER_NAME} · Authorised personnel only
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ position: 'relative', textAlign: 'left' }}>
            <label className="form-label">Master Access Code</label>
            <input
              className="form-input"
              type={showCode ? 'text' : 'password'}
              inputMode="numeric"
              placeholder="Enter your 12-digit master code"
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 12))}
              maxLength={12}
              autoFocus
              style={{ letterSpacing: '0.2em', paddingRight: '3rem' }}
            />
            <button
              type="button"
              onClick={() => setShowCode(v => !v)}
              style={{
                position: 'absolute', right: '0.75rem', top: '2.4rem',
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '1.1rem', color: 'var(--text-muted)',
              }}
            >{showCode ? '🙈' : '👁️'}</button>
          </div>
          {error && <p style={{ color: '#ef233c', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>}
          <button className="btn-primary" type="submit" style={{ width: '100%' }}>
            🔐 Unlock Control Center
          </button>
        </form>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '1.5rem' }}>
          👑 Founded by {FOUNDER_NAME} · Sobagu Platform
        </p>
      </div>
    </div>
  );
};

// ── Role Badge ─────────────────────────────────────────────────────────────
const RoleBadge = ({ role, banned }) => {
  if (banned) return <span className="cc-badge cc-badge-banned">🚫 Banned</span>;
  if (role === 'founder') return <span className="cc-badge cc-badge-founder">👑 Founder</span>;
  if (role === 'admin') return <span className="cc-badge cc-badge-admin">🛡️ Admin</span>;
  return <span className="cc-badge cc-badge-user">👤 User</span>;
};

// ── Category Badge ─────────────────────────────────────────────────────────
const CategoryBadge = ({ cat }) => {
  const map = {
    bug: { label: '🐛 Bug', color: '#ef233c' },
    feature: { label: '✨ Feature', color: '#4facfe' },
    crash: { label: '💥 Crash', color: '#ff9900' },
    general: { label: '💬 General', color: '#a18cd1' },
  };
  const c = map[cat] || map.general;
  return (
    <span style={{
      background: c.color + '22', border: `1px solid ${c.color}55`,
      color: c.color, fontSize: '0.7rem', fontWeight: 700,
      padding: '0.15rem 0.55rem', borderRadius: '20px', whiteSpace: 'nowrap',
    }}>{c.label}</span>
  );
};

// ── Main Control Center ────────────────────────────────────────────────────
const SobaguControlCenter = ({ onExit, onToast }) => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState(getAdminStats());
  const [selectedUser, setSelectedUser] = useState(null);
  const [banReason, setBanReason] = useState('');
  const [cloudCount, setCloudCount] = useState(0);
  const [bugReports, setBugReports] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

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

  const handleLogout = () => {
    setAdminSession(false);
    onExit();
  };

  const TABS = [
    { id: 'users', label: '👥 Users', badge: null },
    { id: 'bugs', label: '🐛 Bug Reports', badge: unreadCount > 0 ? unreadCount : null },
    { id: 'stats', label: '📊 Platform Stats', badge: null },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#080810,#160822)', padding: '0' }}>
      {/* Header */}
      <header style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '1.25rem 2rem', flexWrap: 'wrap', gap: '1rem',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(20px)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <span style={{ fontSize: '1.8rem' }}>🛡️</span>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900 }}>Sobagu Control Center</h2>
            <p style={{ margin: 0, color: '#ffd700', fontSize: '0.78rem', fontWeight: 700 }}>
              👑 Founder {FOUNDER_NAME} · Full Platform Authority
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button className="btn-secondary cc-btn" onClick={refresh}>🔄 Refresh</button>
          <button className="btn-secondary cc-btn" onClick={onExit}>← Back to Sobagu</button>
          <button className="btn-primary cc-btn" onClick={handleLogout} style={{ background: 'linear-gradient(135deg,#d90429,#8d0801)' }}>🔒 Lock</button>
        </div>
      </header>

      <div style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto' }}>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Total Accounts', value: stats.total, icon: '👥', color: '#4facfe' },
            { label: 'Active Today', value: stats.activeToday, icon: '🔥', color: '#ff6b35' },
            { label: 'Admins', value: stats.admins, icon: '🛡️', color: '#a18cd1' },
            { label: 'Banned', value: stats.banned, icon: '🚫', color: '#ef233c' },
            { label: 'Total XP', value: stats.totalXP.toLocaleString(), icon: '⭐', color: '#ffd700' },
            { label: 'Cloud Synced', value: cloudCount, icon: '☁️', color: '#43e97b' },
            { label: 'Bug Reports', value: bugReports.length, icon: '🐛', color: '#f093fb' },
          ].map(s => (
            <div key={s.label} className="glass-card" style={{ padding: '1.1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.6rem', marginBottom: '0.3rem' }}>{s.icon}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tab Nav */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                padding: '0.6rem 1.2rem', borderRadius: '30px', border: 'none', cursor: 'pointer',
                fontWeight: 700, fontSize: '0.88rem', position: 'relative',
                background: activeTab === t.id
                  ? 'linear-gradient(135deg,#d90429,#8d0801)'
                  : 'rgba(255,255,255,0.07)',
                color: activeTab === t.id ? '#fff' : 'var(--text-secondary)',
                transition: 'all 0.2s',
              }}
            >
              {t.label}
              {t.badge && (
                <span style={{
                  position: 'absolute', top: '-6px', right: '-6px',
                  background: '#ffd700', color: '#000', borderRadius: '50%',
                  width: 18, height: 18, fontSize: '0.65rem', fontWeight: 900,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{t.badge}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── Users Tab ── */}
        {activeTab === 'users' && (
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              <input
                className="form-input"
                style={{ flex: 1, minWidth: 200 }}
                placeholder="🔍 Search by name or code..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['all', 'active', 'admin', 'banned'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    style={{
                      padding: '0.4rem 0.9rem', borderRadius: '20px', border: 'none', cursor: 'pointer',
                      fontWeight: 700, fontSize: '0.8rem',
                      background: filter === f ? 'linear-gradient(135deg,#d90429,#8d0801)' : 'rgba(255,255,255,0.07)',
                      color: filter === f ? '#fff' : 'var(--text-secondary)',
                    }}
                  >{f.charAt(0).toUpperCase() + f.slice(1)}</button>
                ))}
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    {['Name', 'Code', 'XP', 'Level', 'Streak', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '0.75rem 0.5rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No accounts found</td></tr>
                  )}
                  {filtered.map(u => (
                    <tr key={u.code} style={{
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      background: u.banned ? 'rgba(239,35,60,0.05)' : 'transparent',
                    }}>
                      <td style={{ padding: '0.7rem 0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: 'linear-gradient(135deg,#a18cd1,#fbc2eb)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 900, fontSize: '0.85rem', flexShrink: 0,
                          }}>{u.name?.[0]?.toUpperCase() || '?'}</div>
                          <span style={{ fontWeight: 600 }}>{u.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.7rem 0.5rem' }}>
                        <code style={{ background: 'rgba(255,255,255,0.07)', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.8rem' }}>{u.code}</code>
                      </td>
                      <td style={{ padding: '0.7rem 0.5rem', fontWeight: 700, color: '#ffd700' }}>{(u.xp || 0).toLocaleString()}</td>
                      <td style={{ padding: '0.7rem 0.5rem' }}>{u.level || 1}</td>
                      <td style={{ padding: '0.7rem 0.5rem' }}>{u.streak || 0} 🔥</td>
                      <td style={{ padding: '0.7rem 0.5rem' }}><RoleBadge role={u.role} banned={u.banned} /></td>
                      <td style={{ padding: '0.7rem 0.5rem' }}>
                        {u.role !== 'founder' ? (
                          <div style={{ display: 'flex', gap: '0.35rem' }}>
                            {!u.banned ? (
                              <button title="Ban" onClick={() => setSelectedUser(u.code)}
                                style={{ padding: '0.3rem 0.5rem', background: 'rgba(239,35,60,0.15)', border: '1px solid rgba(239,35,60,0.3)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>🚫</button>
                            ) : (
                              <button title="Unban" onClick={() => handleUnban(u.code)}
                                style={{ padding: '0.3rem 0.5rem', background: 'rgba(67,233,123,0.15)', border: '1px solid rgba(67,233,123,0.3)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>✅</button>
                            )}
                            {u.role !== 'admin' ? (
                              <button title="Make Admin" onClick={() => handlePromote(u.code)}
                                style={{ padding: '0.3rem 0.5rem', background: 'rgba(161,140,209,0.15)', border: '1px solid rgba(161,140,209,0.3)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>🛡️</button>
                            ) : (
                              <button title="Remove Admin" onClick={() => handleDemote(u.code)}
                                style={{ padding: '0.3rem 0.5rem', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>⬇️</button>
                            )}
                            <button title="Reset Progress" onClick={() => handleReset(u.code)}
                              style={{ padding: '0.3rem 0.5rem', background: 'rgba(79,172,254,0.15)', border: '1px solid rgba(79,172,254,0.3)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>🔄</button>
                            <button title="Delete Account" onClick={() => handleDelete(u.code)}
                              style={{ padding: '0.3rem 0.5rem', background: 'rgba(239,35,60,0.15)', border: '1px solid rgba(239,35,60,0.3)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>🗑️</button>
                          </div>
                        ) : (
                          <span style={{ color: '#ffd700', fontWeight: 700, fontSize: '0.8rem' }}>👑 Protected</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Bug Reports Tab ── */}
        {activeTab === 'bugs' && (
          <div>
            {bugReports.length === 0 ? (
              <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🐛</div>
                <h3>No Bug Reports Yet</h3>
                <p style={{ color: 'var(--text-muted)' }}>When users report bugs, they will appear here.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {bugReports.map(r => (
                  <div key={r.id} className="glass-card" style={{
                    padding: '1.25rem 1.5rem',
                    borderLeft: r.read ? '3px solid rgba(255,255,255,0.1)' : '3px solid #ffd700',
                    opacity: r.read ? 0.75 : 1,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                          <CategoryBadge cat={r.category} />
                          {!r.read && <span style={{ background: '#ffd700', color: '#000', fontSize: '0.65rem', fontWeight: 900, padding: '0.1rem 0.45rem', borderRadius: '20px' }}>NEW</span>}
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                            From: <strong style={{ color: 'var(--text-primary)' }}>{r.userName}</strong> · Code: <code style={{ fontSize: '0.75rem' }}>{r.userCode}</code>
                          </span>
                        </div>
                        <p style={{ margin: '0 0 0.5rem', fontSize: '0.95rem', lineHeight: 1.6 }}>{r.message}</p>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                          {new Date(r.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                        {!r.read && (
                          <button onClick={() => handleMarkRead(r.id)}
                            style={{ padding: '0.35rem 0.75rem', background: 'rgba(67,233,123,0.15)', border: '1px solid rgba(67,233,123,0.3)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', color: '#43e97b', fontWeight: 700 }}>
                            ✓ Mark Read
                          </button>
                        )}
                        <button onClick={() => handleDeleteReport(r.id)}
                          style={{ padding: '0.35rem 0.75rem', background: 'rgba(239,35,60,0.1)', border: '1px solid rgba(239,35,60,0.25)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', color: '#ef233c', fontWeight: 700 }}>
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

        {/* ── Platform Stats Tab ── */}
        {activeTab === 'stats' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '1.5rem' }}>
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>👥 User Breakdown</h3>
              {[
                { label: 'Regular Users', value: stats.total - stats.admins - stats.banned, color: '#4facfe' },
                { label: 'Admins', value: stats.admins, color: '#a18cd1' },
                { label: 'Banned', value: stats.banned, color: '#ef233c' },
                { label: 'Active Today', value: stats.activeToday, color: '#43e97b' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{s.label}</span>
                  <span style={{ fontWeight: 800, color: s.color, fontSize: '1.05rem' }}>{s.value}</span>
                </div>
              ))}
            </div>
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>⭐ XP & Engagement</h3>
              {[
                { label: 'Total XP (all users)', value: stats.totalXP.toLocaleString() + ' XP', color: '#ffd700' },
                { label: 'Cloud Synced Users', value: cloudCount, color: '#43e97b' },
                { label: 'Bug Reports', value: bugReports.length, color: '#f093fb' },
                { label: 'Unread Reports', value: unreadCount, color: '#ffd700' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{s.label}</span>
                  <span style={{ fontWeight: 800, color: s.color, fontSize: '1.05rem' }}>{s.value}</span>
                </div>
              ))}
            </div>
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>🔐 Admin Actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button className="btn-primary" onClick={() => { if (window.confirm('Clear ALL bug reports?')) { getBugReports().forEach(r => deleteBugReport(r.id)); refresh(); onToast?.('🗑️ All reports cleared', 'info'); } }}
                  style={{ background: 'rgba(239,35,60,0.2)', border: '1px solid rgba(239,35,60,0.3)', color: '#ef233c' }}>
                  🗑️ Clear All Bug Reports
                </button>
                <button className="btn-secondary" onClick={refresh}>🔄 Force Refresh Data</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ban Modal */}
      {selectedUser && (
        <div onClick={() => setSelectedUser(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999,
        }}>
          <div className="glass-card" onClick={e => e.stopPropagation()} style={{ padding: '2rem', maxWidth: 400, width: '90%' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>🚫 Ban Account</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Code: <code style={{ color: '#ffd700' }}>{selectedUser}</code>
            </p>
            <div className="form-group">
              <label className="form-label">Reason (optional)</label>
              <input className="form-input" placeholder="Reason for ban..." value={banReason} onChange={e => setBanReason(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setSelectedUser(null)}>Cancel</button>
              <button className="btn-primary" style={{ flex: 1, background: 'linear-gradient(135deg,#d90429,#8d0801)' }} onClick={() => handleBan(selectedUser)}>Confirm Ban</button>
            </div>
          </div>
        </div>
      )}

      <footer style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2rem' }}>
        🛡️ Sobagu Control Center · Founded by {FOUNDER_NAME} · All actions are logged locally
      </footer>
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
