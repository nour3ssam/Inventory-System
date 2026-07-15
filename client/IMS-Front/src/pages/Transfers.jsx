import React, { useState, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  ArrowLeftRight, Search, Plus, ArrowRight, Eye, Trash2,
  Filter, CheckCircle, Clock, AlertTriangle, XCircle,
  Package, User, Calendar, Warehouse, FileText, Database,
} from 'lucide-react';
import {
  addTransfer,
  updateTransferStatus,
  deleteTransfer,
  setSearchQuery,
  setStatusFilter,
  setWarehouseFilter,
} from '../store/transferSlice';
import { fetchStockHistory, createStockEntry, TransactionType } from '../store/stockHistorySlice';
import GlassModal from '../components/ui/GlassModal';
import '../styles/pages/Transfers.css';

/* ── Helpers ──────────────────────────────────────────────────────────────── */
const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};
const formatDateTime = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const STATUS_META = {
  Completed:  { css: 'status-completed',  icon: <CheckCircle size={12} />, color: 'green' },
  'In Transit': { css: 'status-in-transit', icon: <Clock size={12} />,       color: 'blue' },
  Pending:    { css: 'status-pending',    icon: <AlertTriangle size={12} />, color: 'orange' },
  Cancelled:  { css: 'status-cancelled', icon: <XCircle size={12} />,       color: 'red' },
};

const WAREHOUSES = ['North Hub', 'South Wing', 'East Depot'];
const STATUSES   = ['Completed', 'In Transit', 'Pending', 'Cancelled'];
const EMPTY_FORM = {
  product: '', sku: '', fromWarehouse: '', toWarehouse: '',
  quantity: '', initiatedBy: '', notes: '',
};

/* ─────────────────────────────────────────────────────────────────────────── */
const Transfers = () => {
  const dispatch = useDispatch();
  const { items, searchQuery, statusFilter, warehouseFilter } = useSelector((s) => s.transfers);
  const inventoryItems = useSelector((s) => s.inventory.items);
  const { items: stockHistory, loading: historyLoading } = useSelector((s) => s.stockHistory);

  /* Fetch real stock history from API on mount */
  useEffect(() => {
    dispatch(fetchStockHistory());
  }, [dispatch]);

  /* ── Local UI state ── */
  const [activeTab, setActiveTab] = useState('stock'); // 'stock' only now
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [detailTransfer, setDetailTransfer] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');

  /* ── Derived / filtered list ── */
  const filtered = useMemo(() => {
    return items.filter((t) => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || t.product.toLowerCase().includes(q) || t.transferCode.toLowerCase().includes(q) || t.initiatedBy?.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'All' || t.status === statusFilter;
      const matchWH = warehouseFilter === 'All' || t.fromWarehouse === warehouseFilter || t.toWarehouse === warehouseFilter;
      return matchSearch && matchStatus && matchWH;
    });
  }, [items, searchQuery, statusFilter, warehouseFilter]);

  /* ── Stats ── */
  const stats = useMemo(() => ({
    inTransit:  items.filter((t) => t.status === 'In Transit').length,
    completed:  items.filter((t) => t.status === 'Completed').length,
    pending:    items.filter((t) => t.status === 'Pending').length,
    cancelled:  items.filter((t) => t.status === 'Cancelled').length,
  }), [items]);

  /* ── Form handlers ── */
  const handleFormChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.product || !formData.fromWarehouse || !formData.toWarehouse || !formData.quantity) {
      setFormError('Please fill in all required fields.');
      return;
    }
    if (formData.fromWarehouse === formData.toWarehouse) {
      setFormError('Source and destination warehouses must differ.');
      return;
    }
    // Record as local transfer UI entry
    // dispatch(addTransfer({ ...formData, quantity: Number(formData.quantity) }));
    // Also record as real StockHistory OUT entry (moving stock between hubs)
    const product = inventoryItems.find((i) => i.name === formData.product);
    if (product) {
      dispatch(createStockEntry({
        productId: product.id,
        supplierId: null,
        quantity: Number(formData.quantity),
        type: TransactionType.OUT,
        notes: formData.notes || `Transfer: ${formData.fromWarehouse} → ${formData.toWarehouse}`,
      }));
    }
    setFormData(EMPTY_FORM);
    setFormError('');
    setIsAddOpen(false);
  };

  return (
    <div className="transfers-layout">
      {/* ── Page header ── */}
      <div className="page-header">
        <h1 className="page-title">Stock Transfers</h1>
        <p className="page-subtitle">Track inter-warehouse movements and full product activity history</p>
      </div>

      {/* ── KPI stats row ── */}
      <div className="grid-container">
        {[
          { label: 'In Transit',       value: stats.inTransit,  glowClass: 'glow-blue',   color: 'var(--neon-blue-data)', trend: 'Active shipments' },
          { label: 'Completed',        value: stats.completed,  glowClass: 'glow-blue',   color: 'var(--color-success)',  trend: 'All time total' },
          { label: 'Pending Approval', value: stats.pending,    glowClass: 'glow-orange', color: 'var(--color-warning)',  trend: 'Awaiting action' },
          { label: 'Cancelled',        value: stats.cancelled,  glowClass: 'glow-orange', color: 'var(--color-danger)',   trend: 'This cycle' },
        ].map((s) => (
          <div key={s.label} className={`glass-card ${s.glowClass}`}>
            <h3 style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>{s.label}</h3>
            <p className="stat-number" style={{ color: s.color }}>{s.value}</p>
            <span className="stat-trend blue">{s.trend}</span>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div className="transfers-tabs">
          {[
            // { key: 'transfers', icon: <ArrowLeftRight size={15} />, label: 'Transfer Log' },
            // { key: 'history',   icon: <FileText size={15} />,       label: 'Product History' },
            { key: 'stock',     icon: <Database size={15} />,       label: 'Stock Movements' },
          ].map((tab) => (
            <button
              key={tab.key}
              className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={() => setIsAddOpen(true)}>
          <Plus size={16} />
          New Transfer
        </button>
      </div>

      {/* ── Controls bar ── */}
      <div className="transfers-controls">
        <div className="transfers-filters">
          <Filter size={16} style={{ color: 'var(--text-muted)' }} />
          <select className="filter-select" value={statusFilter} onChange={(e) => dispatch(setStatusFilter(e.target.value))}>
            <option value="All">All Status</option>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select className="filter-select" value={warehouseFilter} onChange={(e) => dispatch(setWarehouseFilter(e.target.value))}>
            <option value="All">All Warehouses</option>
            {WAREHOUSES.map((w) => <option key={w}>{w}</option>)}
          </select>
        </div>
        <div className="transfers-search-wrap">
          <Search size={15} className="transfers-search-icon" />
          <input
            className="transfers-search-input"
            placeholder="Search product, code, or initiator…"
            value={searchQuery}
            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
          />
        </div>
      </div>

      {/* ── TRANSFER LOG TAB ── */}
      {/*
      {activeTab === 'transfers' && (
        <div className="glass-panel" style={{ padding: 0 }}>
          <div className="transfers-table-wrap">
            {filtered.length === 0 ? (
              <div className="transfers-empty">
                <ArrowLeftRight size={48} />
                <p>No transfers match your filters.</p>
              </div>
            ) : (
              <table className="transfers-table">
                <thead>
                  <tr>
                    <th>Transfer ID</th>
                    <th>Product</th>
                    <th>Route</th>
                    <th>Qty</th>
                    <th>Status</th>
                    <th>Initiated By</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => {
                    const meta = STATUS_META[t.status] || STATUS_META['Pending'];
                    return (
                      <tr key={t.id}>
                        <td><span className="transfer-code-chip">{t.transferCode}</span></td>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--text-pure-white)' }}>{t.product}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{t.sku}</div>
                        </td>
                        <td>
                          <div className="transfer-route">
                            <span className="wh-from">{t.fromWarehouse}</span>
                            <ArrowRight size={13} className="arrow-icon" />
                            <span className="wh-to">{t.toWarehouse}</span>
                          </div>
                        </td>
                        <td style={{ fontWeight: 700 }}>{t.quantity}</td>
                        <td><span className={`status-badge ${meta.css}`}>{t.status}</span></td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{t.initiatedBy || '—'}</td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>{formatDate(t.createdAt)}</td>
                        <td>
                          <button className="tr-action-btn" title="View Details" onClick={() => setDetailTransfer(t)}>
                            <Eye size={13} />
                          </button>
                          {t.status === 'Pending' && (
                            <button
                              className="tr-action-btn"
                              title="Mark In Transit"
                              style={{ color: 'var(--neon-blue-data)' }}
                              onClick={() => dispatch(updateTransferStatus({ id: t.id, status: 'In Transit' }))}
                            >
                              <Clock size={13} />
                            </button>
                          )}
                          {t.status === 'In Transit' && (
                            <button
                              className="tr-action-btn"
                              title="Mark Completed"
                              style={{ color: 'var(--color-success)' }}
                              onClick={() => dispatch(updateTransferStatus({ id: t.id, status: 'Completed' }))}
                            >
                              <CheckCircle size={13} />
                            </button>
                          )}
                          <button
                            className="tr-action-btn"
                            title="Delete"
                            style={{ marginLeft: '4px', color: 'var(--color-danger)' }}
                            onClick={() => dispatch(deleteTransfer(t.id))}
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
      */}

      {/* ── PRODUCT HISTORY TAB ── */}
      {/*
      {activeTab === 'history' && (
        <div className="glass-panel">
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-pure-white)' }}>Product Movement Timeline</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>Chronological log of all stock movements across warehouses</p>
          </div>

          <div className="history-timeline">
            {[...items]
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map((t) => {
                const meta = STATUS_META[t.status] || STATUS_META['Pending'];
                return (
                  <div key={t.id} className="history-item">
                    <div className={`history-node ${meta.color}`} />
                    <div className="history-card">
                      <div className="history-card-top">
                        <div>
                          <span className="transfer-code-chip" style={{ fontSize: '0.75rem' }}>{t.transferCode}</span>
                          <div className="history-product-name" style={{ marginTop: '8px' }}>{t.product}</div>
                        </div>
                        <span className={`status-badge ${meta.css}`}>{t.status}</span>
                      </div>
                      <div className="history-meta">
                        <div className="history-meta-item">
                          <Package size={13} />
                          <span>Qty: <strong>{t.quantity}</strong></span>
                        </div>
                        <div className="history-meta-item">
                          <Warehouse size={13} />
                          <span><strong>{t.fromWarehouse}</strong> → <strong>{t.toWarehouse}</strong></span>
                        </div>
                        <div className="history-meta-item">
                          <User size={13} />
                          <span>By: <strong>{t.initiatedBy || '—'}</strong></span>
                        </div>
                        <div className="history-meta-item">
                          <Calendar size={13} />
                          <span>{formatDateTime(t.createdAt)}</span>
                        </div>
                      </div>
                      {t.notes && (
                        <p style={{ marginTop: '10px', fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          "{t.notes}"
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
      */}

      {/* ── STOCK MOVEMENTS TAB (real API data) ── */}
      {activeTab === 'stock' && (
        <div className="glass-panel" style={{ padding: 0 }}>
          <div className="transfers-table-wrap">
            {historyLoading ? (
              <div className="transfers-empty">
                <Clock size={36} style={{ opacity: 0.3 }} />
                <p>Loading stock movements…</p>
              </div>
            ) : stockHistory.length === 0 ? (
              <div className="transfers-empty">
                <Database size={48} />
                <p>No stock movement records found.</p>
              </div>
            ) : (
              <table className="transfers-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Supplier</th>
                    <th>Notes</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stockHistory.map((h) => {
                    const typeColors = { IN: 'var(--color-success)', OUT: 'var(--color-danger)', ADJUSTMENT: 'var(--neon-orange)' };
                    return (
                      <tr key={h.id}>
                        <td>
                          <span style={{
                            padding: '3px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700,
                            color: typeColors[h.typeName] || 'var(--text-muted)',
                            background: `${typeColors[h.typeName]}18` || 'transparent',
                            border: `1px solid ${typeColors[h.typeName]}33`,
                          }}>
                            {h.typeName}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600, color: 'var(--text-pure-white)' }}>{h.productName}</td>
                        <td style={{ fontWeight: 700 }}>{h.quantity}</td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{h.supplierName || '—'}</td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.notes || '—'}</td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>{formatDate(h.createdAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ── Add Transfer Modal ── */}
      <GlassModal isOpen={isAddOpen} onClose={() => { setIsAddOpen(false); setFormError(''); }} title="New Stock Transfer">
        <form onSubmit={handleSubmit}>
          <div className="transfer-form-grid">
            <div className="form-group full-span">
              <label className="form-label">Product Name *</label>
              <select className="form-input" name="product" value={formData.product} onChange={(e) => {
                const p = inventoryItems.find((i) => i.name === e.target.value);
                setFormData((prev) => ({ ...prev, product: e.target.value, sku: p?.sku || '' }));
              }}>
                <option value="">Select a product…</option>
                {inventoryItems.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">From Warehouse *</label>
              <select className="form-input" name="fromWarehouse" value={formData.fromWarehouse} onChange={handleFormChange}>
                <option value="">Select source…</option>
                {WAREHOUSES.map((w) => <option key={w}>{w}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">To Warehouse *</label>
              <select className="form-input" name="toWarehouse" value={formData.toWarehouse} onChange={handleFormChange}>
                <option value="">Select destination…</option>
                {WAREHOUSES.map((w) => <option key={w}>{w}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Quantity *</label>
              <input type="number" className="form-input" name="quantity" value={formData.quantity} onChange={handleFormChange} placeholder="0" min="1" />
            </div>
            <div className="form-group">
              <label className="form-label">Initiated By</label>
              <input type="text" className="form-input" name="initiatedBy" value={formData.initiatedBy} onChange={handleFormChange} placeholder="Staff name…" />
            </div>
            <div className="form-group full-span">
              <label className="form-label">Notes</label>
              <textarea className="form-input" name="notes" value={formData.notes} onChange={handleFormChange} placeholder="Reason for transfer…" rows={3} style={{ resize: 'vertical' }} />
            </div>
          </div>
          {formError && (
            <div style={{ padding: '10px 14px', borderRadius: '10px', marginTop: '8px', background: 'var(--color-danger-dim)', color: 'var(--color-danger)', border: '1px solid rgba(239,68,68,0.2)', fontSize: '0.85rem', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <AlertTriangle size={14} /> {formError}
            </div>
          )}
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={() => { setIsAddOpen(false); setFormError(''); }}>Cancel</button>
            <button type="submit" className="btn btn-primary"><Plus size={15} />Create Transfer</button>
          </div>
        </form>
      </GlassModal>

      {/* ── Detail Modal ── */}
      <GlassModal isOpen={!!detailTransfer} onClose={() => setDetailTransfer(null)} title="Transfer Details">
        {detailTransfer && (() => {
          const meta = STATUS_META[detailTransfer.status] || STATUS_META['Pending'];
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="transfer-code-chip">{detailTransfer.transferCode}</span>
                <span className={`status-badge ${meta.css}`}>{detailTransfer.status}</span>
              </div>
              {[
                { label: 'Product',         value: detailTransfer.product,      icon: <Package size={14} /> },
                { label: 'SKU',             value: detailTransfer.sku,          icon: <FileText size={14} /> },
                { label: 'Quantity',        value: detailTransfer.quantity,     icon: <Package size={14} /> },
                { label: 'From',            value: detailTransfer.fromWarehouse, icon: <Warehouse size={14} /> },
                { label: 'To',              value: detailTransfer.toWarehouse,  icon: <Warehouse size={14} /> },
                { label: 'Initiated By',    value: detailTransfer.initiatedBy || '—', icon: <User size={14} /> },
                { label: 'Created',         value: formatDateTime(detailTransfer.createdAt), icon: <Calendar size={14} /> },
                { label: 'Completed',       value: formatDateTime(detailTransfer.completedAt), icon: <CheckCircle size={14} /> },
              ].map(({ label, value, icon }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>{icon}{label}</span>
                  <span style={{ color: 'var(--text-pure-white)', fontWeight: 600, fontSize: '0.88rem' }}>{value}</span>
                </div>
              ))}
              {detailTransfer.notes && (
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '14px' }}>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>NOTES</p>
                  <p style={{ color: 'var(--text-primary)', fontSize: '0.88rem', fontStyle: 'italic' }}>"{detailTransfer.notes}"</p>
                </div>
              )}
            </div>
          );
        })()}
      </GlassModal>
    </div>
  );
};

export default Transfers;
