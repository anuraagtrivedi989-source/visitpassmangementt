import React from 'react';

const NAV_ITEMS = [
  ['dashboard', '▦', 'Dashboard'],
  ['register', '＋', 'Register visitor'],
  ['visitors', '♙', 'Visitors'],
  ['appointments', '◷', 'Appointments'],
  ['verify', '⌕', 'Verify pass'],
  ['staff', '♙', 'Staff & roles', ['admin']],
];
const PAGE_TITLES = {
  dashboard: 'Overview', register: 'Register visitor', visitors: 'Visitor directory',
  appointments: 'Appointments', verify: 'Pass verification', staff: 'Staff & roles',
};

export default function AppLayout({ admin, tab, onTabChange, onLogout, onRefresh, error, notice, onClearError, onClearNotice, children }) {
  const visibleItems = NAV_ITEMS.filter(([, , , roles]) => !roles || roles.includes(admin.role));
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark small">VP</span><span>VisitPass<small>Visitor management</small></span></div>
        <div className="nav-label">WORKSPACE</div>
        {visibleItems.map(([id, icon, label]) => (
          <button key={id} className={`nav-item ${tab === id ? 'active' : ''}`} onClick={() => onTabChange(id)}><span>{icon}</span>{label}</button>
        ))}
        <div className="sidebar-bottom"><div className="avatar">{admin.name?.slice(0, 1) || 'A'}</div><div className="admin-label"><b>{admin.name}</b><small>{String(admin.role || 'admin').replace(/^./, (c) => c.toUpperCase())}</small></div><button className="icon-button" title="Sign out" aria-label="Sign out" onClick={onLogout}>↪</button></div>
      </aside>
      <main className="main-area">
        <header className="topbar">
          <div><span className="eyebrow">VISITOR OPERATIONS</span><h1>{PAGE_TITLES[tab] || 'VisitPass'}</h1></div>
          <div className="top-actions"><span className="live-dot" /> System workspace <button className="secondary compact" onClick={onRefresh}>↻ Refresh</button><button className="secondary compact signout-button" onClick={onLogout}>↪ Sign out</button></div>
        </header>
        {error && <div className="alert error">{error}<button className="dismiss" onClick={onClearError}>×</button></div>}
        {notice && <div className="alert success">{notice}<button className="dismiss" onClick={onClearNotice}>×</button></div>}
        {children}
      </main>
    </div>
  );
}
