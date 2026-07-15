import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Users as UsersIcon, Search, Plus, Edit3, Trash2, Eye,
  Shield, Mail, MapPin, Clock, Filter, UserCheck, UserX,
  AlertTriangle, CheckCircle, Key, X,
} from 'lucide-react';
import {
  addUser, updateUser, deleteUser,
  setSearchQuery, setRoleFilter, setStatusFilter,
} from '../store/userSlice';
import GlassModal from '../components/ui/GlassModal';
import '../styles/pages/Users.css';

/* ── Helpers ──────────────────────────────────────────────────────────────── */
const timeAgo = (iso) => {
  if (!iso) return 'Never';
  const diff = (Date.now() - new Date(iso)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const ROLES = ['Admin', 'Manager', 'Operator'];
const WAREHOUSES = ['North Hub', 'South Wing', 'East Depot'];

const avatarClass = (role) => {
  if (role === 'Admin') return 'avatar-admin';
  if (role === 'Manager') return 'avatar-manager';
  return 'avatar-operator';
};

const coverClass = (role) => {
  if (role === 'Admin') return 'admin-cover';
  if (role === 'Manager') return 'manager-cover';
  return 'operator-cover';
};

const rolePillClass = (role) => {
  if (role === 'Admin') return 'role-admin';
  if (role === 'Manager') return 'role-manager';
  return 'role-operator';
};

const EMPTY_FORM = { name: '', username: '', email: '', role: 'Operator', warehouse: 'North Hub', status: 'Active' };

/* ─────────────────────────────────────────────────────────────────────────── */
const Users = () => {
  const dispatch = useDispatch();
  const { items, searchQuery, roleFilter, statusFilter } = useSelector((s) => s.users);

  /* ── UI state ── */
  const [isFormOpen, setIsFormOpen]     = useState(false);
  const [editingUser, setEditingUser]   = useState(null);
  const [detailUser, setDetailUser]     = useState(null);
  const [formData, setFormData]         = useState(EMPTY_FORM);
  const [formError, setFormError]       = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  /* ── Derived ── */
  const filtered = useMemo(() => {
    return items.filter((u) => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchRole   = roleFilter   === 'All' || u.role === roleFilter;
      const matchStatus = statusFilter === 'All' || u.status === statusFilter;
      return matchSearch && matchRole && matchStatus;
    });
  }, [items, searchQuery, roleFilter, statusFilter]);

  const stats = useMemo(() => ({
    total:    items.length,
    active:   items.filter((u) => u.status === 'Active').length,
    admins:   items.filter((u) => u.role === 'Admin').length,
    managers: items.filter((u) => u.role === 'Manager').length,
  }), [items]);

  /* ── Form helpers ── */
  const openAdd = () => { setEditingUser(null); setFormData(EMPTY_FORM); setFormError(''); setIsFormOpen(true); };
  const openEdit = (u) => { setEditingUser(u); setFormData({ name: u.name, username: u.username, email: u.email, role: u.role, warehouse: u.warehouse, status: u.status }); setFormError(''); setIsFormOpen(true); };
  const closeForm = () => { setIsFormOpen(false); setEditingUser(null); setFormError(''); };

  const handleChange = (e) => setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.username || !formData.email) {
      setFormError('Name, username and email are required.');
      return;
    }
    if (editingUser) {
      dispatch(updateUser({ ...editingUser, ...formData }));
    } else {
      dispatch(addUser(formData));
    }
    closeForm();
  };

  const handleDelete = (id) => {
    dispatch(deleteUser(id));
    setDeleteConfirm(null);
    if (detailUser?.id === id) setDetailUser(null);
  };

  return (
    <div className="users-layout">
      {/* ── Page header ── */}
      <div className="page-header">
        <h1 className="page-title">User Accounts</h1>
        <p className="page-subtitle">Manage system credentials, roles, and warehouse access permissions</p>
      </div>

      {/* ── Stats row ── */}
      <div className="grid-container">
        {[
          { label: 'Total Users',    value: stats.total,    glow: 'glow-blue',   color: 'var(--neon-blue-data)', sub: 'Registered accounts' },
          { label: 'Active Now',     value: stats.active,   glow: 'glow-blue',   color: 'var(--color-success)',  sub: 'Online sessions' },
          { label: 'Admins',         value: stats.admins,   glow: 'glow-orange', color: 'var(--neon-orange)',    sub: 'Full access role' },
          { label: 'Managers',       value: stats.managers, glow: 'glow-blue',   color: 'var(--neon-blue-data)', sub: 'Supervisors' },
        ].map((s) => (
          <div key={s.label} className={`glass-card ${s.glow}`}>
            <h3 style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>{s.label}</h3>
            <p className="stat-number" style={{ color: s.color }}>{s.value}</p>
            <span className="stat-trend blue">{s.sub}</span>
          </div>
        ))}
      </div>

      {/* ── Controls ── */}
      <div className="users-controls">
        <div className="users-filters">
          <Filter size={16} style={{ color: 'var(--text-muted)' }} />
          <select className="filter-select" value={roleFilter} onChange={(e) => dispatch(setRoleFilter(e.target.value))}>
            <option value="All">All Roles</option>
            {ROLES.map((r) => <option key={r}>{r}</option>)}
          </select>
          <select className="filter-select" value={statusFilter} onChange={(e) => dispatch(setStatusFilter(e.target.value))}>
            <option value="All">All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="users-search-wrap">
            <Search size={15} className="users-search-icon" />
            <input
              className="users-search-input"
              placeholder="Search name, username, email…"
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
            />
          </div>
          <button className="btn btn-primary" onClick={openAdd}>
            <Plus size={16} />
            Add User
          </button>
        </div>
      </div>

      {/* ── User cards grid ── */}
      {filtered.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-muted)' }}>
          <UsersIcon size={48} style={{ opacity: 0.25, marginBottom: '16px' }} />
          <p>No users match your current filters.</p>
        </div>
      ) : (
        <div className="users-grid">
          {filtered.map((u) => (
            <div key={u.id} className="user-card" onClick={() => setDetailUser(u)}>
              {/* Cover banner */}
              <div className={`user-card-cover ${coverClass(u.role)}`} />

              {/* Body */}
              <div className="user-card-body">
                <div className="user-avatar-wrap">
                  <div className={`user-avatar ${avatarClass(u.role)}`}>{u.avatar || u.name[0]}</div>
                </div>

                <div className="user-card-name">{u.name}</div>
                <div className="user-card-username">@{u.username}</div>
                <div className="user-card-email"><Mail size={12} />{u.email}</div>

                <div className="user-card-footer">
                  <span className={`role-pill ${rolePillClass(u.role)}`}>
                    <Shield size={10} />
                    {u.role}
                  </span>
                  <div className="user-status-wrap">
                    <span className={`status-dot ${u.status === 'Active' ? 'active' : 'inactive'} ${u.status === 'Active' ? 'online-ring' : ''}`} />
                    {u.status}
                  </div>
                </div>

                {/* Hover actions */}
                <div className="user-card-actions" style={{ marginTop: '10px' }} onClick={(e) => e.stopPropagation()}>
                  <button className="card-icon-btn" title="Edit" onClick={() => openEdit(u)}>
                    <Edit3 size={13} />
                  </button>
                  <button className="card-icon-btn danger" title="Delete" onClick={() => setDeleteConfirm(u)}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Add / Edit User Modal ── */}
      <GlassModal
        isOpen={isFormOpen}
        onClose={closeForm}
        title={editingUser ? 'Edit User' : 'Add New User'}
      >
        <form onSubmit={handleSubmit}>
          <div className="user-form-grid">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-input" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Jane Doe" />
            </div>
            <div className="form-group">
              <label className="form-label">Username *</label>
              <input className="form-input" name="username" value={formData.username} onChange={handleChange} placeholder="e.g. j.doe" />
            </div>
            <div className="form-group full-span">
              <label className="form-label">Email Address *</label>
              <input type="email" className="form-input" name="email" value={formData.email} onChange={handleChange} placeholder="user@imscore.io" />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-input" name="role" value={formData.role} onChange={handleChange}>
                {ROLES.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Assigned Warehouse</label>
              <select className="form-input" name="warehouse" value={formData.warehouse} onChange={handleChange}>
                {WAREHOUSES.map((w) => <option key={w}>{w}</option>)}
              </select>
            </div>
            <div className="form-group full-span">
              <label className="form-label">Status</label>
              <select className="form-input" name="status" value={formData.status} onChange={handleChange}>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>

          {formError && (
            <div style={{ marginTop: '12px', padding: '10px 14px', borderRadius: '10px', background: 'var(--color-danger-dim)', color: 'var(--color-danger)', border: '1px solid rgba(239,68,68,0.2)', fontSize: '0.85rem', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <AlertTriangle size={14} /> {formError}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={closeForm}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              {editingUser ? <><CheckCircle size={15} />Save Changes</> : <><Plus size={15} />Create User</>}
            </button>
          </div>
        </form>
      </GlassModal>

      {/* ── Delete Confirm Modal ── */}
      <GlassModal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirm Deletion">
        {deleteConfirm && (
          <div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
              Are you sure you want to remove <strong style={{ color: 'var(--text-pure-white)' }}>{deleteConfirm.name}</strong> from the system? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button
                className="btn"
                style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--color-danger)', border: '1px solid rgba(239,68,68,0.3)' }}
                onClick={() => handleDelete(deleteConfirm.id)}
              >
                <Trash2 size={15} /> Delete User
              </button>
            </div>
          </div>
        )}
      </GlassModal>

      {/* ── User Detail Drawer Modal ── */}
      <GlassModal isOpen={!!detailUser} onClose={() => setDetailUser(null)} title="User Profile">
        {detailUser && (
          <div style={{ padding: '0' }}>
            {/* Cover */}
            <div
              className={`user-detail-cover ${coverClass(detailUser.role)}`}
              style={{ margin: '-32px -32px 0 -32px', borderRadius: '24px 24px 0 0' }}
            />
            <div className="user-detail-body" style={{ padding: '0' }}>
              <div className="user-detail-avatar-wrap">
                <div className={`user-detail-avatar ${avatarClass(detailUser.role)}`}>
                  {detailUser.avatar || detailUser.name[0]}
                </div>
                <div style={{ display: 'flex', gap: '8px', paddingBottom: '4px' }}>
                  <button className="card-icon-btn" title="Edit" onClick={() => { setDetailUser(null); openEdit(detailUser); }}>
                    <Edit3 size={14} />
                  </button>
                  <button className="card-icon-btn danger" title="Delete" onClick={() => { setDetailUser(null); setDeleteConfirm(detailUser); }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '8px' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-pure-white)' }}>{detailUser.name}</div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>@{detailUser.username}</div>
                <div style={{ marginTop: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span className={`role-pill ${rolePillClass(detailUser.role)}`}>
                    <Shield size={10} />{detailUser.role}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: detailUser.status === 'Active' ? 'var(--color-success)' : 'var(--text-muted)' }}>
                    <span className={`status-dot ${detailUser.status === 'Active' ? 'active' : 'inactive'}`} />
                    {detailUser.status}
                  </span>
                </div>
              </div>

              <div className="user-detail-info-grid" style={{ marginTop: '20px' }}>
                {[
                  { icon: <Mail size={13} />,    label: 'Email',     value: detailUser.email },
                  { icon: <MapPin size={13} />,  label: 'Warehouse', value: detailUser.warehouse },
                  { icon: <Clock size={13} />,   label: 'Last Login', value: timeAgo(detailUser.lastLogin) },
                  { icon: <Shield size={13} />,  label: 'Joined',    value: formatDate(detailUser.createdAt) },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="info-block">
                    <div className="info-block-label">{icon}{label}</div>
                    <div className="info-block-value">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </GlassModal>
    </div>
  );
};

export default Users;
