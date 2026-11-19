import React from 'react';

export default function AuthPage({
  isRegistering, setIsRegistering, email, setEmail, password, setPassword,
  fullName, setFullName, organizationName, setOrganizationName,
  loginBusy, error, onLogin, onRegister, selectedRole, setSelectedRole,
}) {
  const submit = isRegistering ? onRegister : onLogin;
  return (
    <div className="login-page">
      <div className="login-card">
        <div className="brand-mark">VP</div><p className="eyebrow">DIGITAL FRONT DESK</p>
        <h1>{isRegistering ? 'Create your organization' : 'Welcome to VisitPass'}</h1>
        <p className="muted">{isRegistering ? 'Register your organization and create its first administrator account.' : 'Secure, simple visitor management for your organization.'}</p>
        {error && <div className="alert error">{error}</div>}
        <form onSubmit={submit} className="stack">
          {isRegistering && <>
            <label>Your full name<input value={fullName} onChange={(event) => setFullName(event.target.value)} required maxLength={100} autoComplete="name" placeholder="e.g. Priya Sharma" /></label>
            <label>Organization name<input value={organizationName} onChange={(event) => setOrganizationName(event.target.value)} required maxLength={120} autoComplete="organization" placeholder="e.g. Acme Technologies" /></label>
          </>}
          {!isRegistering && <label>Sign in as<select value={selectedRole} onChange={(event) => setSelectedRole(event.target.value)} required><option value="admin">Admin</option><option value="security">Security</option><option value="frontdesk">Frontdesk</option><option value="employee">Employee</option></select><small className="field-help">Choose the role assigned to your account. The server verifies it.</small></label>}
          <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="username" /></label>
          <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={isRegistering ? 10 : 1} autoComplete={isRegistering ? 'new-password' : 'current-password'} placeholder={isRegistering ? 'At least 10 characters' : ''} /></label>
          <button disabled={loginBusy}>{loginBusy ? (isRegistering ? 'Creating account…' : 'Signing in…') : (isRegistering ? 'Create organization account' : 'Sign in to dashboard')}</button>
        </form>
        <p className="tiny muted">{isRegistering ? 'This creates a new organization and its first administrator. Staff accounts can be added by an admin.' : 'Select your assigned role and sign in. Your account must already have that role; choosing another role will not grant access.'}</p>
        <button type="button" className="auth-switch" onClick={() => { setIsRegistering((value) => !value); }}>
          {isRegistering ? 'Already registered? Sign in' : 'New organization? Create an account'}
        </button>
      </div>
    </div>
  );
}
