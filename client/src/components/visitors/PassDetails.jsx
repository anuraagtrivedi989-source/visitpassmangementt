import React from 'react';
import { dateTime, statusClass } from '../../utils/formatters.js';

export default function PassDetails({ visitor, qrData, onPrint, onCheckIn, onCheckOut, isAdmin = false, onDelete }) {
  return (
    <section className="panel pass-panel print-area">
      <div className="panel-heading"><div><h2>Digital visitor pass</h2><p>Issued pass details</p></div><button className="secondary" onClick={onPrint}>Print pass</button></div>
      <div className="pass-content">
        <div className="pass-info">
          <span className="eyebrow">VISITOR PASS</span><h2>{visitor.fullName}</h2>
          <p className="muted">{visitor.organization || 'Visitor'}</p><div className="pass-id">{visitor.passId}</div>
          <dl>
            <dt>Purpose</dt><dd>{visitor.purpose}</dd><dt>Host</dt><dd>{visitor.hostName}</dd>
            <dt>Phone</dt><dd>{visitor.phone}</dd><dt>Visit date</dt><dd>{new Date(visitor.visitDate).toLocaleDateString()}</dd>
            <dt>Check-in</dt><dd>{dateTime(visitor.checkedInAt)}</dd><dt>Check-out</dt><dd>{dateTime(visitor.checkedOutAt)}</dd>
          </dl>
          <span className={statusClass(visitor.status)}>{visitor.status}</span>
        </div>
        <div className="qr-box">
          {qrData ? <img src={qrData} alt={`QR code for ${visitor.passId}`} /> : <div className="qr-placeholder">Generating QR…</div>}
          <b>Scan to verify</b><small>{visitor.passId}</small>
        </div>
      </div>
      <div className="pass-actions">
        {visitor.status === 'scheduled' && <button onClick={onCheckIn}>✓ Check in</button>}
        {visitor.status === 'checked-in' && <button onClick={onCheckOut}>↗ Check out</button>}
        {isAdmin && visitor.status === 'checked-out' && onDelete && (
          <button className="danger-button" onClick={onDelete}>🗑 Delete pass</button>
        )}
      </div>
    </section>
  );
}
