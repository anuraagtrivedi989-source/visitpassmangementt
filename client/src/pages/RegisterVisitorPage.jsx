import React from 'react';

export default function RegisterVisitorPage({ form, onFormChange, onSubmit, saving }) {
  const update = (field) => (event) => onFormChange({ ...form, [field]: event.target.value });
  return <section className="panel form-panel"><div className="panel-heading"><div><h2>New visitor pass</h2><p>Enter visitor information to issue a digital pass.</p></div><span className="pill">● PASS ISSUANCE</span></div>
    <form onSubmit={onSubmit} className="visitor-form">
      <label>Visitor full name *<input value={form.fullName} onChange={update('fullName')} maxLength="100" required placeholder="e.g. Rahul Sharma" /></label>
      <label>Phone number *<input value={form.phone} onChange={update('phone')} required maxLength="20" placeholder="Contact number" /></label>
      <label>Email address<input type="email" value={form.email || ''} onChange={update('email')} maxLength="254" autoComplete="email" placeholder="visitor@example.com" /></label>
      <label>Organization<input value={form.organization} onChange={update('organization')} maxLength="120" placeholder="Company or institution" /></label>
      <label>Person to meet *<input value={form.hostName} onChange={update('hostName')} required maxLength="100" placeholder="Host / employee name" /></label>
      <label className="full">Purpose of visit *<textarea value={form.purpose} onChange={update('purpose')} required maxLength="300" placeholder="Meeting, delivery, interview…" /></label>
      <label>Visit date *<input type="date" value={form.visitDate} onChange={update('visitDate')} required /></label>
      <div className="form-actions"><button disabled={saving}>{saving ? 'Creating pass…' : 'Generate visitor pass →'}</button></div>
    </form>
  </section>;
}
