import React from 'react';
import VisitorTable from '../components/visitors/VisitorTable.jsx';
import PassDetails from '../components/visitors/PassDetails.jsx';

export default function VisitorsPage({ visitors, search, onSearchChange, onRefresh, onTabChange, onOpenVisitor, selected, qrData, onPrint, onCheckIn, onCheckOut, canRegister = true, isAdmin = false, onDelete }) {
  return <>
    <section className="panel"><div className="panel-heading"><div><h2>Visitor directory</h2><p>Search and manage issued visitor passes.</p></div>{canRegister && <button onClick={() => onTabChange('register')}>＋ New visitor</button>}</div>
      <input className="search" value={search} onChange={(event) => onSearchChange(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && onRefresh()} placeholder="Search by name, pass ID, phone, or host…" />
      <VisitorTable visitors={visitors} onOpen={onOpenVisitor} isAdmin={isAdmin} onDelete={onDelete} />
    </section>
    {selected && <PassDetails visitor={selected} qrData={qrData} onPrint={onPrint} onCheckIn={onCheckIn} onCheckOut={onCheckOut} isAdmin={isAdmin} onDelete={() => onDelete(selected)} />}
  </>;
}
