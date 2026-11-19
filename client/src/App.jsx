import React, { useCallback, useEffect, useState } from 'react';
import AppLayout from './components/layout/AppLayout.jsx';
import AuthPage from './components/auth/AuthPage.jsx';
import LandingPage from './pages/LandingPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import RegisterVisitorPage from './pages/RegisterVisitorPage.jsx';
import VisitorsPage from './pages/VisitorsPage.jsx';
import AppointmentsPage from './pages/AppointmentsPage.jsx';
import VerifyPassPage from './pages/VerifyPassPage.jsx';
import StaffPage from './pages/StaffPage.jsx';
import { request } from './services/api.js';
import useQrCode from './hooks/useQrCode.js';
import useQrScanner from './hooks/useQrScanner.js';

const EMPTY_VISITOR = {
  fullName: '',
  phone: '',
  email: '',
  organization: '',
  purpose: '',
  hostName: '',
  visitDate: new Date().toISOString().slice(0, 10),
};

export default function App() {
  const [token, setToken] = useState(() => sessionStorage.getItem('visitpass_token') || '');
  const [admin, setAdmin] = useState(null);
  const [email, setEmail] = useState('admin@visitpass.local');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('admin');
  const [isRegistering, setIsRegistering] = useState(false);
  const [fullName, setFullName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [error, setError] = useState('');
  const [showAuth, setShowAuth] = useState(false);
  const [loginBusy, setLoginBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [tab, setTab] = useState('dashboard');
  const [stats, setStats] = useState({ total: 0, scheduled: 0, checkedIn: 0, checkedOut: 0 });
  const [visitors, setVisitors] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(EMPTY_VISITOR);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState(null);
  const [verifyId, setVerifyId] = useState('');
  const [verifyResult, setVerifyResult] = useState(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const qrData = useQrCode(selected?.passId);

  const logout = useCallback(() => {
    sessionStorage.removeItem('visitpass_token');
    setToken('');
    setAdmin(null);
    setSelected(null);
    setVerifyResult(null);
    setShowAuth(false);
    setError('');
    setNotice('');
    setTab('dashboard');
  }, []);

  useEffect(() => {
    if (!token) {
      setAdmin(null);
      return;
    }

    let active = true;
    request('/api/auth/me', token)
      .then((data) => {
        if (active) setAdmin(data.admin);
      })
      .catch(() => {
        if (active) logout();
      });

    return () => {
      active = false;
    };
  }, [token, logout]);

  const refresh = useCallback(async () => {
    if (!token || !admin) return;

    try {
      const canViewVisitors = ['admin', 'security', 'frontdesk'].includes(admin.role);
      const canViewAppointments = ['admin', 'frontdesk', 'employee'].includes(admin.role);

      const [statsData, visitorData, appointmentData] = await Promise.all([
        request('/api/dashboard/stats', token),
        canViewVisitors
          ? request(`/api/visitors?search=${encodeURIComponent(search)}`, token)
          : Promise.resolve({ visitors: [] }),
        canViewAppointments
          ? request('/api/appointments', token)
          : Promise.resolve({ appointments: [] }),
      ]);

      setStats(statsData);
      setVisitors(visitorData.visitors || []);
      setAppointments(appointmentData.appointments || []);
    } catch (requestError) {
      setError(requestError.message);
    }
  }, [token, admin, search]);

  useEffect(() => {
    if (token && admin) {
      refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, admin, tab]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');
    setLoginBusy(true);

    try {
      const data = await request('/api/auth/login', '', {
        method: 'POST',
        body: JSON.stringify({ email, password, role: selectedRole }),
      });

      const tokenValue = data.token || data.accessToken || '';
      if (!tokenValue) {
        setError('Login failed: No token returned');
        return;
      }

      const adminValue = data.admin || data.user || data;
      sessionStorage.setItem('visitpass_token', tokenValue);
      setAdmin(adminValue);
      setToken(tokenValue);
      setPassword('');
      setNotice('Welcome to VisitPass.');
      setShowAuth(false);
      setTab('dashboard');
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setLoginBusy(false);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');
    setLoginBusy(true);

    try {
      const data = await request('/api/auth/register', '', {
        method: 'POST',
        body: JSON.stringify({ name: fullName, organizationName, email, password }),
      });

      sessionStorage.setItem('visitpass_token', data.token);
      setAdmin(data.admin);
      setToken(data.token);
      setPassword('');
      setFullName('');
      setOrganizationName('');
      setNotice('Organization registered successfully. Welcome to VisitPass!');
    } catch (registerError) {
      setError(registerError.message);
    } finally {
      setLoginBusy(false);
    }
  };

  const createVisitor = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');
    setSaving(true);

    try {
      const data = await request('/api/visitors', token, {
        method: 'POST',
        body: JSON.stringify(form),
      });

      setSelected(data.visitor);
      setForm(EMPTY_VISITOR);
      setNotice('Visitor registered and pass created.');
      setTab('visitors');
      await refresh();
    } catch (createError) {
      setError(createError.message);
    } finally {
      setSaving(false);
    }
  };

  const verifyPass = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');
    setVerifyResult(null);

    try {
      const data = await request('/api/visitors/verify', token, {
        method: 'POST',
        body: JSON.stringify({ passId: verifyId }),
      });

      setVerifyResult(data);
      if (data.visitor) setSelected(data.visitor);
    } catch (verifyError) {
      setError(verifyError.message);
    }
  };

  const transition = async (visitor, action) => {
    setError('');
    setNotice('');

    try {
      const data = await request(`/api/visitors/${visitor._id}/${action}`, token, {
        method: 'POST',
        body: '{}',
      });

      setSelected(data.visitor);
      setNotice(data.message);
      setVerifyResult(null);
      await refresh();
    } catch (transitionError) {
      setError(transitionError.message);
    }
  };

  const deletePass = async (visitor) => {
    if (!visitor) return;

    if (admin?.role !== 'admin') {
      setError('Only administrators are authorized to delete passes.');
      return;
    }

    if (visitor.status !== 'checked-out') {
      setError('Only checked-out passes can be deleted.');
      return;
    }

    if (!window.confirm(`Are you sure you want to permanently delete pass ${visitor.passId}?`)) {
      return;
    }

    try {
      const data = await request(`/api/visitors/${visitor._id}`, token, { method: 'DELETE' });
      if (selected?._id === visitor._id || selected?.passId === visitor.passId) {
        setSelected(null);
        setVerifyResult(null);
      }
      setNotice(data.message || `Pass ${visitor.passId} deleted successfully.`);
      await refresh();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  const openVisitor = (visitor) => {
    setSelected(visitor);
    setTab('visitors');
  };

  const handleQrDetected = useCallback((decodedText) => {
    try {
      const payload = JSON.parse(decodedText);
      setVerifyId(payload.passId || decodedText.trim());
    } catch {
      setVerifyId(decodedText.trim());
    }
    setScannerOpen(false);
    setTab('verify');
  }, []);

  useQrScanner(scannerOpen, handleQrDetected);

  if (!token || !admin) {
    return showAuth ? (
      <AuthPage
        isRegistering={isRegistering}
        setIsRegistering={setIsRegistering}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        fullName={fullName}
        setFullName={setFullName}
        organizationName={organizationName}
        setOrganizationName={setOrganizationName}
        selectedRole={selectedRole}
        setSelectedRole={setSelectedRole}
        loginBusy={loginBusy}
        error={error}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />
    ) : (
      <LandingPage onGetStarted={() => setShowAuth(true)} />
    );
  }

  const ROLE_TABS = {
    admin: ['dashboard', 'register', 'visitors', 'appointments', 'verify', 'staff'],
    security: ['dashboard', 'visitors', 'verify'],
    frontdesk: ['dashboard', 'register', 'visitors', 'appointments', 'verify'],
    employee: ['dashboard', 'appointments'],
  };

  const allowedTabs = ROLE_TABS[admin.role] || ['dashboard'];
  const effectiveTab = allowedTabs.includes(tab) ? tab : 'dashboard';
  const isAdmin = admin.role === 'admin';

  let page;
  if (effectiveTab === 'dashboard') {
    page = <DashboardPage admin={admin} stats={stats} visitors={visitors} onTabChange={setTab} onOpenVisitor={openVisitor} onDeleteVisitor={deletePass} />;
  }
  if (effectiveTab === 'register') {
    page = <RegisterVisitorPage form={form} onFormChange={setForm} onSubmit={createVisitor} saving={saving} />;
  }
  if (effectiveTab === 'visitors') {
    page = (
      <VisitorsPage
        canRegister={admin.role === 'admin' || admin.role === 'frontdesk'}
        visitors={visitors}
        search={search}
        onSearchChange={setSearch}
        onRefresh={refresh}
        onTabChange={setTab}
        onOpenVisitor={openVisitor}
        selected={selected}
        qrData={qrData}
        onPrint={() => window.print()}
        onCheckIn={() => transition(selected, 'check-in')}
        onCheckOut={() => transition(selected, 'check-out')}
        isAdmin={isAdmin}
        onDelete={deletePass}
      />
    );
  }
  if (effectiveTab === 'appointments') {
    page = <AppointmentsPage adminRole={admin.role} token={token} appointments={appointments} onRefresh={refresh} onError={setError} onNotice={setNotice} />;
  }
  if (effectiveTab === 'staff' && admin.role === 'admin') {
    page = <StaffPage token={token} currentUserId={admin.id || admin._id} onError={setError} onNotice={setNotice} />;
  }
  if (effectiveTab === 'verify') {
    page = (
      <VerifyPassPage
        verifyId={verifyId}
        setVerifyId={setVerifyId}
        onVerify={verifyPass}
        scannerOpen={scannerOpen}
        setScannerOpen={setScannerOpen}
        verifyResult={verifyResult}
        selected={selected}
        qrData={qrData}
        onPrint={() => window.print()}
        onCheckIn={() => transition(selected, 'check-in')}
        onCheckOut={() => transition(selected, 'check-out')}
        isAdmin={isAdmin}
        onDelete={deletePass}
      />
    );
  }

  return (
    <AppLayout
      admin={admin}
      tab={effectiveTab}
      onTabChange={(nextTab) => {
        setNotice('');
        if (allowedTabs.includes(nextTab)) {
          setTab(nextTab);
          setError('');
        } else {
          setTab('dashboard');
          setError('Your role does not have access to that section.');
        }
      }}
      onLogout={logout}
      onRefresh={refresh}
      error={error}
      notice={notice}
      onClearError={() => setError('')}
      onClearNotice={() => setNotice('')}
    >
      {page || <div className="panel">Page not found.</div>}
    </AppLayout>
  );
}
