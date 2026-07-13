import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  User, Mail, Phone, MapPin, Shield, Calendar, Clock,
  Edit3, Lock, Bell, Moon, Globe, Save, Eye, EyeOff,
  Package, ArrowLeftRight, CheckCircle, AlertTriangle,
} from 'lucide-react';
import { logout, updateUserData } from '../store/authSlice';
import authService from '../services/authService';
import '../styles/pages/Profile.css';

/* ── Helpers ──────────────────────────────────────────────────────────────── */
const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
};

const timeAgo = (iso) => {
  if (!iso) return 'Never';
  const diff = (Date.now() - new Date(iso)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

/* ── Activity Feed mock data ─────────────────────────────────────────────── */
const ACTIVITY = [
  { id: 1, color: 'orange', action: 'Added product "Quantum CPU Core" to North Hub', time: '2026-07-07T11:30:00Z' },
  { id: 2, color: 'blue',   action: 'Initiated transfer TRN-3829 (Neon Plasma Tubing)',  time: '2026-07-07T09:15:00Z' },
  { id: 3, color: 'green',  action: 'Approved Purchase Order PO-0042 from Apex Tech',   time: '2026-07-06T16:45:00Z' },
  { id: 4, color: 'red',    action: 'Deleted supplier "Omega Freight" from directory',  time: '2026-07-05T14:00:00Z' },
  { id: 5, color: 'blue',   action: 'Updated category thresholds for Electronics',      time: '2026-07-04T10:20:00Z' },
];

/* ─────────────────────────────────────────────────────────────────────────── */
const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // Fallback demo user if not logged in
  const currentUser = user || {
    name: 'Alexandra Cole',
    username: 'a.cole',
    email: 'a.cole@imscore.io',
    role: 'Admin',
    warehouse: 'North Hub',
    phone: '+1 (555) 019-2831',
    createdAt: '2026-01-15T09:00:00Z',
    lastLogin: '2026-07-07T11:30:00Z',
  };

  const displayName = currentUser.name || currentUser.username || 'User';
  const initials = displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  // Password form state
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const [pwForm, setPwForm]           = useState({ current: '', newPw: '', confirm: '' });
  const [pwMessage, setPwMessage]     = useState(null);

  // Preferences state
  const [prefs, setPrefs] = useState({
    notifications: true,
    darkMode: true,
    emailAlerts: false,
    autoLogout: true,
  });

  const handlePwSave = async (e) => {
    e.preventDefault();
    if (!pwForm.current || !pwForm.newPw) {
      setPwMessage({ type: 'error', text: 'Please fill in all password fields.' });
      return;
    }
    if (pwForm.newPw !== pwForm.confirm) {
      setPwMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (pwForm.newPw.length < 8) {
      setPwMessage({ type: 'error', text: 'Password must be at least 8 characters.' });
      return;
    }
    try {
      await authService.updateProfile({
        currentPassword: pwForm.current,
        newPassword:     pwForm.newPw,
        confirmPassword: pwForm.confirm,
      });
      setPwMessage({ type: 'success', text: 'Password updated successfully.' });
      setPwForm({ current: '', newPw: '', confirm: '' });
      setTimeout(() => setPwMessage(null), 3000);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to update password. Please try again.';
      setPwMessage({ type: 'error', text: msg });
    }
  };

  const roleClass = currentUser.role?.toLowerCase() || 'operator';

  return (
    <div className="profile-layout">
      {/* ── Page header ── */}
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Manage your account details, security, and preferences</p>
      </div>

      {/* ── Hero card ── */}
      <div className="glass-panel profile-hero-card" style={{ padding: 0 }}>
        <div className="profile-cover-banner" />
        <div className="profile-hero-body">
          <div className="profile-avatar-wrap">
            <div className="profile-avatar-lg">{initials}</div>
            <div className="profile-hero-meta">
              <div className="profile-hero-name">{displayName}</div>
              <div className={`profile-hero-role role-pill role-${roleClass}`}>
                <Shield size={12} />
                {currentUser.role || 'Operator'}
              </div>
            </div>
          </div>
          <div className="profile-hero-stats">
            <div className="profile-stat-item">
              <span className="profile-stat-label">Username</span>
              <span className="profile-stat-value" style={{ fontFamily: 'monospace' }}>@{currentUser.username || 'user'}</span>
            </div>
            <div className="profile-stat-item">
              <span className="profile-stat-label">Assigned Hub</span>
              <span className="profile-stat-value">{currentUser.warehouse || 'All Hubs'}</span>
            </div>
            <div className="profile-stat-item">
              <span className="profile-stat-label">Member Since</span>
              <span className="profile-stat-value">{formatDate(currentUser.createdAt)}</span>
            </div>
            <div className="profile-stat-item">
              <span className="profile-stat-label">Last Login</span>
              <span className="profile-stat-value">{timeAgo(currentUser.lastLogin)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main 2-col grid ── */}
      <div className="profile-grid">
        {/* ── Account Info ── */}
        <div className="glass-panel">
          <div className="profile-section-title">
            <div className="title-icon"><User size={16} /></div>
            Account Information
          </div>

          {[
            { icon: <User size={14} />,     label: 'Full Name',     value: displayName },
            { icon: <Mail size={14} />,     label: 'Email Address', value: currentUser.email || '—' },
            { icon: <Phone size={14} />,    label: 'Phone',         value: currentUser.phone || '—' },
            { icon: <MapPin size={14} />,   label: 'Warehouse',     value: currentUser.warehouse || 'All Hubs' },
            { icon: <Shield size={14} />,   label: 'Role',          value: currentUser.role || 'Operator' },
            { icon: <Calendar size={14} />, label: 'Joined',        value: formatDate(currentUser.createdAt) },
            { icon: <Clock size={14} />,    label: 'Last Login',    value: currentUser.lastLogin ? new Date(currentUser.lastLogin).toLocaleString() : '—' },
          ].map((row) => (
            <div key={row.label} className="profile-info-row">
              <span className="profile-info-label">{row.icon}{row.label}</span>
              <span className="profile-info-value">{row.value}</span>
            </div>
          ))}
        </div>

        {/* ── Security ── */}
        <div className="glass-panel">
          <div className="profile-section-title">
            <div className="title-icon" style={{ background: 'rgba(255,107,0,0.1)', border: '1px solid rgba(255,107,0,0.2)', color: 'var(--neon-orange)' }}>
              <Lock size={16} />
            </div>
            Change Password
          </div>

          <form onSubmit={handlePwSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { label: 'Current Password', key: 'current', show: showCurrent, toggle: () => setShowCurrent(p => !p) },
              { label: 'New Password',     key: 'newPw',   show: showNew,     toggle: () => setShowNew(p => !p) },
              { label: 'Confirm New',      key: 'confirm', show: showNew,     toggle: null },
            ].map(({ label, key, show, toggle }) => (
              <div key={key} className="profile-form-group">
                <label className="profile-form-label">{label}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={show ? 'text' : 'password'}
                    className="form-input"
                    placeholder="••••••••"
                    value={pwForm[key]}
                    onChange={(e) => setPwForm(p => ({ ...p, [key]: e.target.value }))}
                    autoComplete="new-password"
                  />
                  {toggle && (
                    <button
                      type="button"
                      onClick={toggle}
                      style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                      {show ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {pwMessage && (
              <div style={{
                padding: '10px 14px',
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontWeight: 600,
                background: pwMessage.type === 'error' ? 'var(--color-danger-dim)' : 'var(--color-success-dim)',
                color: pwMessage.type === 'error' ? 'var(--color-danger)' : 'var(--color-success)',
                border: `1px solid ${pwMessage.type === 'error' ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`,
                display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                {pwMessage.type === 'error' ? <AlertTriangle size={14} /> : <CheckCircle size={14} />}
                {pwMessage.text}
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
              <Save size={16} />
              Update Password
            </button>
          </form>
        </div>

        {/* ── Preferences ── */}
        <div className="glass-panel">
          <div className="profile-section-title">
            <div className="title-icon"><Bell size={16} /></div>
            Preferences
          </div>

          {[
            { key: 'notifications', label: 'Push Notifications',      sub: 'Receive in-app alerts for stock changes' },
            { key: 'darkMode',      label: 'Dark Mode',                sub: 'Cyber dark theme (always on for IMS)' },
            { key: 'emailAlerts',   label: 'Email Low-Stock Alerts',   sub: 'Send email when stock drops below threshold' },
            { key: 'autoLogout',    label: 'Auto Logout (30 min)',     sub: 'Automatically sign out on inactivity' },
          ].map(({ key, label, sub }) => (
            <div key={key} className="pref-toggle-row">
              <div className="pref-label">
                <strong>{label}</strong>
                <span>{sub}</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={prefs[key]}
                  onChange={() => setPrefs(p => ({ ...p, [key]: !p[key] }))}
                />
                <span className="toggle-slider" />
              </label>
            </div>
          ))}
        </div>

        {/* ── Recent Activity ── */}
        <div className="glass-panel">
          <div className="profile-section-title">
            <div className="title-icon" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: 'var(--color-success)' }}>
              <Clock size={16} />
            </div>
            Recent Activity
          </div>

          <div className="activity-feed">
            {ACTIVITY.map((item) => (
              <div key={item.id} className="activity-item">
                <div className={`activity-dot ${item.color}`} />
                <div className="activity-content">
                  <div className="activity-action">{item.action}</div>
                  <div className="activity-time">{timeAgo(item.time)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Danger zone ── */}
      <div className="glass-panel" style={{ borderColor: 'rgba(239,68,68,0.15)', background: 'rgba(239,68,68,0.03)' }}>
        <div className="profile-section-title" style={{ color: 'var(--color-danger)' }}>
          <div className="title-icon" style={{ background: 'var(--color-danger-dim)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--color-danger)' }}>
            <AlertTriangle size={16} />
          </div>
          Danger Zone
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '16px' }}>
          Signing out will end your current session. All unsaved changes will be lost.
        </p>
        <button
          className="btn"
          style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--color-danger)', border: '1px solid rgba(239,68,68,0.25)' }}
          onClick={async () => {
            await authService.logout();  // invalidates server-side token
            dispatch(logout());          // clears Redux + localStorage
            navigate('/login');
          }}
        >
          Sign Out of IMS Core
        </button>
      </div>
    </div>
  );
};

export default Profile;