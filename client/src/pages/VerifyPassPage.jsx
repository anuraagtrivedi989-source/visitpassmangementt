import React from 'react';
import PassDetails from '../components/visitors/PassDetails.jsx';

export default function VerifyPassPage({ verifyId, setVerifyId, onVerify, scannerOpen, setScannerOpen, verifyResult, selected, qrData, onPrint, onCheckIn, onCheckOut, isAdmin = false, onDelete }) {
  return <section className="verify-grid">
    <div className="panel"><div className="panel-heading"><div><h2>Verify a visitor pass</h2><p>Enter the unique pass ID or scan its QR code.</p></div></div>
      <form className="stack" onSubmit={onVerify}><label>Pass ID<input value={verifyId} onChange={(event) => setVerifyId(event.target.value)} placeholder="VP-…" required /></label><button>Verify pass</button></form>
      <button type="button" className="secondary scanner-button" onClick={() => setScannerOpen((value) => !value)}>{scannerOpen ? 'Close scanner' : '▦ Scan QR code with camera'}</button>
      {scannerOpen && <div id="visitpass-qr-reader" className="scanner" />}
      {verifyResult && <div className={`verify-result ${verifyResult.valid ? 'valid' : 'invalid'}`}><b>{verifyResult.valid ? '✓ PASS VALID' : '! PASS NOT VALID'}</b><p>{verifyResult.message}</p></div>}
    </div>
    {selected && <PassDetails visitor={selected} qrData={qrData} onPrint={onPrint} onCheckIn={onCheckIn} onCheckOut={onCheckOut} isAdmin={isAdmin} onDelete={() => onDelete(selected)} />}
  </section>;
}
