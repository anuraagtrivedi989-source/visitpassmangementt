import React from 'react';
import VisitorTable from '../components/visitors/VisitorTable.jsx';

export default function DashboardPage({ admin, stats, visitors, onTabChange, onOpenVisitor, onDeleteVisitor }) {
  const statCards = [
    ['Total visitors', stats.total, 'All registered passes', '♙'],
    ['Scheduled', stats.scheduled, 'Awaiting arrival', '◷'],
    ['Currently inside', stats.checkedIn, 'Checked in', '↗'],
    ['Completed visits', stats.checkedOut, 'Checked out', '✓'],
  ];
  const primaryAction = admin.role === 'security' ? ['verify', '⌕ Verify a pass'] : admin.role === 'employee' ? ['appointments', '◷ View appointments'] : ['register', '＋ Register a visitor'];
  const canBrowseVisitors = admin.role !== 'employee';
  return <>
    <section className="welcome-panel"><div><span className="pill">● LIVE WORKSPACE</span><h2>Good to see you, {admin.name?.split(' ')[0]}.</h2><p>{admin.role === 'security' ? 'Verify passes and keep visitor arrivals and exits accurate.' : admin.role === 'employee' ? 'Manage your visitor appointment workflow from one place.' : 'Manage visitor arrivals, digital passes, and exit records from one place.'}</p><button onClick={() => onTabChange(primaryAction[0])}>{primaryAction[1]}</button></div><div className="welcome-art">✦</div></section>
    <section className="stats-grid">{statCards.map(([label, value, sub, icon]) => <div className="stat-card" key={label}><div className="stat-top"><span>{label}</span><span className="stat-icon">{icon}</span></div><strong>{value}</strong><small>{sub}</small></div>)}</section>
    {canBrowseVisitors && <section className="panel"><div className="panel-heading"><div><h2>Recent visitors</h2><p>Latest visitor pass activity</p></div><button className="secondary" onClick={() => onTabChange('visitors')}>View all →</button></div><VisitorTable visitors={visitors.slice(0, 6)} onOpen={onOpenVisitor} isAdmin={admin.role === 'admin'} onDelete={onDeleteVisitor} /></section>}
  </>;
}
