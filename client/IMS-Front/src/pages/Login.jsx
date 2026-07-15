import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginStart, loginSuccess, loginFailure } from '../store/authSlice';
import authService from '../services/authService';
import { prepareNewSession } from '../utils/session';
import '../styles/pages/Login.css';

/* ── icons (inline SVG, no dependency) ─────────────────────────────── */
const EyeIcon = ({ open }) =>
  open ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const SpinnerIcon = () => (
  <svg className="lp-spinner" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

/* ── field component ───────────────────────────────────────────────── */
function Field({ id, label, type, icon, value, onChange, placeholder, autoComplete, showToggle, isVisible, onToggle, error }) {
  const inputType = showToggle ? (isVisible ? 'text' : 'password') : type;

  return (
    <div className={`lp-field${error ? ' lp-field--error' : ''}`}>
      <label className="lp-field__label" htmlFor={id}>{label}</label>
      <div className="lp-field__wrap">
        <span className="lp-field__icon">{icon}</span>
        <input
          id={id}
          className="lp-field__input"
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
        />
        {showToggle && (
          <button
            type="button"
            className="lp-field__toggle"
            onClick={onToggle}
            aria-label={isVisible ? 'Hide password' : 'Show password'}
          >
            <EyeIcon open={isVisible} />
          </button>
        )}
      </div>
      {error && <p className="lp-field__error">{error}</p>}
    </div>
  );
}

/* ── error extraction helper ────────────────────────────────────────── */
const extractErrors = (err, fallbackMsg) => {
  const data = err?.response?.data;
  if (!data) return [fallbackMsg];
  
  if (Array.isArray(data)) {
    if (data[0] && data[0].description) return data.map(e => e.description);
    if (typeof data[0] === 'string') return data;
  }

  if (data.errors) {
    if (Array.isArray(data.errors)) {
      return data.errors.map(e => typeof e === 'object' ? (e.description || e.message) : e);
    } else if (typeof data.errors === 'object') {
      const msgs = [];
      Object.values(data.errors).forEach(val => {
        if (Array.isArray(val)) msgs.push(...val);
        else if (typeof val === 'string') msgs.push(val);
      });
      if (msgs.length > 0) return msgs;
    }
  }
  
  if (data.message) return [data.message];
  return [fallbackMsg];
};

/* ── main component ───────────────────────────────────────────────── */
export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error: reduxError } = useSelector(s => s.auth);

  /* Tab state */
  const [tab, setTab] = useState('login'); // 'login' | 'signup'

  /* Login fields */
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPwd, setShowLoginPwd] = useState(false);

  /* Signup fields */
  const [signupName, setSignupName] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');
  const [showSignupPwd, setShowSignupPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  /* Local validation errors */
  const [fieldErrors, setFieldErrors] = useState({});
  const [localError, setLocalError] = useState('');

  const clearErrors = () => { setFieldErrors({}); setLocalError(''); };

  /* ── Login submit ─────────────────────────────────────────────── */
  const handleLogin = async e => {
    e.preventDefault();
    clearErrors();
    const errs = {};
    if (!loginEmail.trim()) errs.loginEmail = 'Email is required';
    if (!loginPassword.trim()) errs.loginPassword = 'Password is required';
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }

    dispatch(loginStart());
    try {
      const data = await authService.login({ email: loginEmail, password: loginPassword });
      // Drop previous account's cached inventory/notifications before hydrating new JWT.
      prepareNewSession(dispatch);
      dispatch(loginSuccess(data));
      navigate('/');
    } catch (err) {
      const msgs = extractErrors(err, 'Invalid credentials. Please try again.');
      dispatch(loginFailure(msgs));
    }
  };

  /* ── Signup submit ────────────────────────────────────────────── */
  const handleSignup = async e => {
    e.preventDefault();
    clearErrors();
    const errs = {};
    if (!signupName.trim()) errs.signupName = 'Full name is required';
    if (!signupUsername.trim()) errs.signupUsername = 'Username is required';
    if (!signupEmail.trim()) errs.signupEmail = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupEmail)) errs.signupEmail = 'Enter a valid email';
    if (!signupPhone.trim()) errs.signupPhone = 'Phone number is required';
    if (signupPassword.length < 8) errs.signupPassword = 'At least 8 characters required';
    if (signupConfirm !== signupPassword) errs.signupConfirm = 'Passwords do not match';
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }

    dispatch(loginStart());
    try {
      const data = await authService.register({
        name:            signupName,
        username:        signupUsername,
        email:           signupEmail,
        phone:           signupPhone,
        password:        signupPassword,
        confirmPassword: signupConfirm,
      });
      // Drop previous account's cached data so the new user starts clean.
      prepareNewSession(dispatch);
      dispatch(loginSuccess(data));
      navigate('/');
    } catch (err) {
      const msgs = extractErrors(err, 'Registration failed. Please try again.');
      dispatch(loginFailure(msgs));
    }
  };

  const switchTab = t => { setTab(t); clearErrors(); dispatch(loginFailure(null)); };

  return (
    <div className="lp">
      {/* Floating card */}
      <div className="lp-card">

        {/* Brand header */}
        <div className="lp-brand">
          <div className="lp-brand__icon">
            <svg viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="10" fill="var(--neon-orange)" fillOpacity="0.15" />
              <path d="M8 28V16l12-8 12 8v12" stroke="var(--neon-orange)" strokeWidth="2" strokeLinejoin="round" />
              <rect x="15" y="20" width="10" height="8" rx="1" stroke="var(--neon-orange)" strokeWidth="2" />
              <path d="M20 20v8" stroke="var(--neon-orange)" strokeWidth="1.5" />
            </svg>
          </div>
          <div>
            <h1 className="lp-brand__name">IMS</h1>
            <p className="lp-brand__sub">Inventory Management System</p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="lp-tabs" role="tablist">
          <button
            id="tab-login"
            role="tab"
            className={`lp-tab${tab === 'login' ? ' lp-tab--active' : ''}`}
            aria-selected={tab === 'login'}
            onClick={() => switchTab('login')}
          >
            Sign In
          </button>
          <button
            id="tab-signup"
            role="tab"
            className={`lp-tab${tab === 'signup' ? ' lp-tab--active' : ''}`}
            aria-selected={tab === 'signup'}
            onClick={() => switchTab('signup')}
          >
            Create Account
          </button>
          {/* Sliding indicator */}
          <div className={`lp-tabs__indicator${tab === 'signup' ? ' lp-tabs__indicator--right' : ''}`} />
        </div>

        {/* Global error banner */}
        {(reduxError || localError) && (
          <div className="lp-error-banner" role="alert" style={{ alignItems: Array.isArray(reduxError) && reduxError.length > 1 ? 'flex-start' : 'center' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: Array.isArray(reduxError) && reduxError.length > 1 ? '4px' : '0' }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div className="lp-error-content" style={{ display: 'flex', flexDirection: 'column' }}>
              {Array.isArray(reduxError) ? (
                <ul style={{ margin: 0, paddingLeft: reduxError.length > 1 ? '1.2rem' : '0', listStyleType: reduxError.length > 1 ? 'disc' : 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {reduxError.map((err, i) => <li key={i}>{err}</li>)}
                </ul>
              ) : (
                <span>{reduxError || localError}</span>
              )}
            </div>
          </div>
        )}

        {/* ── LOGIN FORM ─────────────────────────────────────── */}
        {tab === 'login' && (
          <form
            id="login-form"
            className="lp-form"
            onSubmit={handleLogin}
            aria-labelledby="tab-login"
            noValidate
          >
            <Field
              id="login-email"
              label="Email address"
              type="email"
              icon={<MailIcon />}
              value={loginEmail}
              onChange={e => setLoginEmail(e.target.value)}
              placeholder="you@company.com"
              autoComplete="email"
              error={fieldErrors.loginEmail}
            />
            <Field
              id="login-password"
              label="Password"
              type="password"
              icon={<LockIcon />}
              value={loginPassword}
              onChange={e => setLoginPassword(e.target.value)}
              placeholder="Your password"
              autoComplete="current-password"
              showToggle
              isVisible={showLoginPwd}
              onToggle={() => setShowLoginPwd(v => !v)}
              error={fieldErrors.loginPassword}
            />

            <div className="lp-form__row">
              <label className="lp-checkbox">
                <input type="checkbox" id="remember-me" />
                <span className="lp-checkbox__box" />
                <span>Remember me</span>
              </label>
              <button type="button" className="lp-link">Forgot password?</button>
            </div>

            <button
              id="login-submit"
              type="submit"
              className="lp-btn"
              disabled={loading}
            >
              {loading ? <><SpinnerIcon /> Signing in…</> : 'Sign In'}
            </button>

            <p className="lp-form__switch">
              No account?{' '}
              <button type="button" className="lp-link" onClick={() => switchTab('signup')}>
                Create one for free
              </button>
            </p>
          </form>
        )}

        {/* ── SIGNUP FORM ─────────────────────────────────────── */}
        {tab === 'signup' && (
          <form
            id="signup-form"
            className="lp-form"
            onSubmit={handleSignup}
            aria-labelledby="tab-signup"
            noValidate
          >
            <Field
              id="signup-name"
              label="Full name"
              type="text"
              icon={<UserIcon />}
              value={signupName}
              onChange={e => setSignupName(e.target.value)}
              placeholder="John Smith"
              autoComplete="name"
              error={fieldErrors.signupName}
            />
            <Field
              id="signup-username"
              label="Username"
              type="text"
              icon={<UserIcon />}
              value={signupUsername}
              onChange={e => setSignupUsername(e.target.value)}
              placeholder="jsmith88"
              autoComplete="username"
              error={fieldErrors.signupUsername}
            />
            <Field
              id="signup-email"
              label="Work email"
              type="email"
              icon={<MailIcon />}
              value={signupEmail}
              onChange={e => setSignupEmail(e.target.value)}
              placeholder="you@company.com"
              autoComplete="email"
              error={fieldErrors.signupEmail}
            />
            <Field
              id="signup-phone"
              label="Phone number"
              type="text"
              icon={<MailIcon />} // Reusing MailIcon as placeholder or you can use Phone icon if available
              value={signupPhone}
              onChange={e => setSignupPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              autoComplete="tel"
              error={fieldErrors.signupPhone}
            />
            <Field
              id="signup-password"
              label="Password"
              type="password"
              icon={<LockIcon />}
              value={signupPassword}
              onChange={e => setSignupPassword(e.target.value)}
              placeholder="Min. 8 characters"
              autoComplete="new-password"
              showToggle
              isVisible={showSignupPwd}
              onToggle={() => setShowSignupPwd(v => !v)}
              error={fieldErrors.signupPassword}
            />
            <Field
              id="signup-confirm"
              label="Confirm password"
              type="password"
              icon={<LockIcon />}
              value={signupConfirm}
              onChange={e => setSignupConfirm(e.target.value)}
              placeholder="Repeat password"
              autoComplete="new-password"
              showToggle
              isVisible={showConfirmPwd}
              onToggle={() => setShowConfirmPwd(v => !v)}
              error={fieldErrors.signupConfirm}
            />

            {/* Password strength meter */}
            {signupPassword && (
              <PasswordStrength password={signupPassword} />
            )}

            <button
              id="signup-submit"
              type="submit"
              className="lp-btn"
              disabled={loading}
            >
              {loading ? <><SpinnerIcon /> Creating account…</> : 'Create Account'}
            </button>

            <p className="lp-form__switch">
              Already have an account?{' '}
              <button type="button" className="lp-link" onClick={() => switchTab('login')}>
                Sign in instead
              </button>
            </p>
          </form>
        )}

        {/* Footer */}
        <p className="lp-footer">
          &copy; {new Date().getFullYear()} IMS &mdash; Secure &amp; Encrypted
        </p>
      </div>
    </div>
  );
}

/* ── Password strength indicator ───────────────────────────────────── */
function PasswordStrength({ password }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', '#ef4444', '#f59e0b', '#3b82f6', '#10b981'];

  return (
    <div className="lp-strength" aria-label={`Password strength: ${labels[score]}`}>
      <div className="lp-strength__bars">
        {checks.map((ok, i) => (
          <div
            key={i}
            className="lp-strength__bar"
            style={{ background: i < score ? colors[score] : undefined }}
          />
        ))}
      </div>
      <span className="lp-strength__label" style={{ color: colors[score] }}>
        {labels[score]}
      </span>
    </div>
  );
}