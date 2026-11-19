import React, { useCallback, useEffect, useState } from 'react';
import { request } from '../services/api.js';

const ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'security', label: 'Security' },
  { value: 'frontdesk', label: 'Frontdesk' },
  { value: 'employee', label: 'Employee' },
];
const EMPTY = { name: '', email: '', password: '', role: 'frontdesk' };

export default function StaffPage({ token, currentUserId, onError, onNotice }) {
  const [staff, setStaff] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    try { const data = await request('/api/auth/staff', token); setStaff(data.staff || []); }
    catch (error) { onError(error.message); }
  }, [token, onError]);
  useEffect(() => { load(); }, [load]);
  const update = (key) => (event) => setForm((old) => ({ ...old, [key]: event.target.value }));
  async function create(event) {
    event.preventDefault(); onError(''); setBusy(true);
    try { await request('/api/auth/staff', token, { method: 'POST', body: JSON.stringify(form) }); setForm(EMPTY); onNotice('Staff account created successfully.'); await load(); }
    catch (error) { onError(error.message); } finally { setBusy(false); }
  }
  async function toggle(user) {
    onError('');
    try { const data = await request(`/api/auth/staff/${user._id}/status`, token, { method: 'PATCH', body: JSON.stringify({ isActive: !user.isActive }) }); onNotice(data.message); await load(); }
    catch (error) { onError(error.message); }
  }
  return <div>
    <section className="panel form-panel">
      <div className="panel-heading"><div><h2>Create staff account</h2><p>Assign one role per account. New staff can sign in with the role assigned here.</p></div><span className="pill">ADMIN ONLY</span></div>
      <form className="visitor-form" onSubmit={create}>
        <label>Full name *<input required maxLength={100} value={form.name} onChange={update('name')} autoComplete="name" /></label>
        <label>Email *<input required type="email" value={form.email} onChange={update('email')} autoComplete="email" /></label>
        <label>Password *<input required type="password" minLength={10} value={form.password} onChange={update('password')} autoComplete="new-password" placeholder="At least 10 characters" /></label>
        <label>Role *<select value={form.role} onChange={update('role')}>{ROLES.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}</select></label>
        <div className="form-actions full"><button disabled={busy}>{busy ? 'Creating…' : 'Create staff account'}</button></div>
      </form>
    </section>
    <section className="panel">
      <div className="panel-heading"><div><h2>Organization staff</h2><p>{staff.length} accounts · only accounts in your organization are shown</p></div><button className="secondary" onClick={load}>↻ Refresh</button></div>
      <div className="table-wrap"><table><thead><tr><th>STAFF MEMBER</th><th>ROLE</th><th>STATUS</th><th>CREATED</th><th>ACTION</th></tr></thead><tbody>
        {staff.map((user) => <tr key={user._id}><td><b>{user.name}</b><small>{user.email}</small></td><td><span className="role-pill">{user.role}</span></td><td><span className={`status ${user.isActive ? 'status-checked-in' : 'status-expired'}`}>{user.isActive ? 'Active' : 'Disabled'}</span></td><td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</td><td>{user._id === currentUserId ? <span className="muted">Current account</span> : <button className="secondary compact" onClick={() => toggle(user)}>{user.isActive ? 'Disable' : 'Enable'}</button>}</td></tr>)}
        {!staff.length && <tr><td colSpan="5">No staff accounts found.</td></tr>}
      </tbody></table></div>
    </section>
  </div>;
}
