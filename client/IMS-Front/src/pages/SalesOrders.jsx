import React from 'react';
import { useSelector } from 'react-redux';

const SalesOrders = () => {
  const { items } = useSelector((s) => s.inventory);
  const totalValue = items.reduce((acc, i) => acc + (i.sellingPrice ?? 0) * (i.quantity ?? 0), 0);

  const stats = [
    { label: 'Open Orders',       value: '—',                          color: 'var(--neon-blue-data)' },
    { label: 'Inventory Value',   value: `$${totalValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}`, color: 'var(--neon-orange)' },
    { label: 'Fulfilled Today',   value: '—',                          color: 'var(--color-success)' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Sales Orders</h1>
        <p className="page-subtitle">Track outbound sales orders and customer fulfilment pipelines</p>
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
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</div>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Sales Orders Coming Soon</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto', lineHeight: 1.7 }}>
          The Sales Orders module is not yet available in the backend API.
          Use <strong>Stock History</strong> (Transfers page) to record outbound stock using <em>OUT</em> transactions,
          which automatically deduct from product inventory.
        </p>
      </div>
    </div>
  );
};

export default SalesOrders;
