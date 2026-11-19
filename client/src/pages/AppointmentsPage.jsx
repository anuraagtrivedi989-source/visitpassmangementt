import React, { useState } from 'react';
import { request, downloadVisitorCsv } from '../services/api.js';
import { statusClass } from '../utils/formatters.js';

const EMPTY_APPOINTMENT = { visitorName: '', visitorEmail: '', visitorPhone: '', hostName: '', purpose: '', scheduledAt: '' };

export default function AppointmentsPage({ token, appointments, onRefresh, onError, onNotice, adminRole }) {
  const [form, setForm] = useState(EMPTY_APPOINTMENT);
  const [saving, setSaving] = useState(false);
  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  async function createAppointment(event) {
    event.preventDefault(); onError(''); setSaving(true);
    try {
      await request('/api/appointments', token, { method: 'POST', body: JSON.stringify(form) });
      setForm(EMPTY_APPOINTMENT); onNotice('Appointment request created.'); await onRefresh();
    } catch (error) { onError(error.message); }
    finally { setSaving(false); }
  }

  async function decideAppointment(appointment, status) {
    onError('');
    try {
      await request(`/api/appointments/${appointment._id}/decision`, token, { method: 'POST', body: JSON.stringify({ status }) });
      onNotice(status === 'approved' ? 'Appointment approved and pass issued.' : 'Appointment rejected.');
      await onRefresh();
    } catch (error) { onError(error.message); }
  }

  async function exportCsv() {
    onError('');
    try { await downloadVisitorCsv(token); }
    catch (error) { onError(error.message); }
  }

  return <section className="panel form-panel"><div className="panel-heading"><div><h2>Pre-registration & appointments</h2><p>Create visitor invitations and approve or reject pending requests.</p></div><span className="pill">● HOST WORKFLOW</span></div>
    <form className="visitor-form" onSubmit={createAppointment}>
      <label>Visitor name *<input required value={form.visitorName} onChange={update('visitorName')} /></label>
      <label>Visitor phone *<input required value={form.visitorPhone} onChange={update('visitorPhone')} /></label>
      <label>Visitor email<input type="email" value={form.visitorEmail} onChange={update('visitorEmail')} /></label>
      <label>Host / employee *<input required value={form.hostName} onChange={update('hostName')} /></label>
      <label className="full">Purpose *<input required value={form.purpose} onChange={update('purpose')} /></label>
      <label>Scheduled date & time *<input type="datetime-local" required value={form.scheduledAt} onChange={update('scheduledAt')} /></label>
      <div className="form-actions"><button disabled={saving}>{saving ? 'Creating…' : 'Create appointment'}</button></div>
    </form>
    <div className="panel-heading" style={{ marginTop: 24 }}><div><h2>{adminRole === 'employee' ? 'My appointment requests' : 'Appointment queue'}</h2><p>{appointments.length} requests</p></div>{adminRole === 'admin' && <button className="secondary" onClick={exportCsv}>Export visitor CSV</button>}</div>
    <div className="table-wrap"><table><thead><tr><th>VISITOR</th><th>HOST</th><th>SCHEDULED</th><th>STATUS</th><th>ACTION</th></tr></thead><tbody>
      {appointments.map((appointment) => <tr key={appointment._id}><td><b>{appointment.visitorName}</b><small>{appointment.visitorPhone}</small></td><td>{appointment.hostName}</td><td>{new Date(appointment.scheduledAt).toLocaleString()}</td><td><span className={statusClass(appointment.status)}>{appointment.status}</span></td><td>{appointment.status === 'pending' && ['admin', 'frontdesk'].includes(adminRole) ? <><button className="secondary compact" onClick={() => decideAppointment(appointment, 'approved')}>Approve</button> <button className="secondary compact" onClick={() => decideAppointment(appointment, 'rejected')}>Reject</button></> : '—'}</td></tr>)}
      {appointments.length === 0 && <tr><td colSpan="5">No appointment requests yet.</td></tr>}
    </tbody></table></div>
  </section>;
}
