import React from 'react';
import { useSelector } from 'react-redux';

const PurchaseOrders = () => {
  const { items } = useSelector((s) => s.inventory);
  const totalValue = items.reduce((acc, i) => acc + (i.costPrice ?? 0) * (i.quantity ?? 0), 0);

  const stats = [
    { label: 'Open Orders',    value: '—',                          color: 'var(--neon-orange)' },
    { label: 'Total PO Value', value: `$${totalValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}`, color: 'var(--neon-blue-data)' },
    { label: 'Received',       value: '—',                          color: 'var(--color-success)' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Purchase Orders</h1>
        <p className="page-subtitle">Manage supplier purchase orders and inbound stock requisitions</p>
      </div>

      <div className="grid-container">
        {stats.map((s) => (
          <div key={s.label} className="glass-card glow-blue">
            <h3 style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>{s.label}</h3>
            <p className="stat-number" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="glass-panel" style={{ marginTop: '2rem', padding: '3rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Purchase Orders Coming Soon</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto', lineHeight: 1.7 }}>
          The Purchase Orders module is not yet available in the backend API.
          Use <strong>Stock History</strong> (Transfers page) to record incoming stock using <em>IN</em> transactions.
        </p>
      </div>
    </div>
  );
};

export default PurchaseOrders;
