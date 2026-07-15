import React from 'react';

const Warehouses = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Warehouses</h1>
        <p className="page-subtitle">Manage regional storage hubs and physical facility nodes</p>
      </div>

      <div className="grid-container">
        <div className="glass-card glow-blue">
          <h3 style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Active Hubs</h3>
          <p className="stat-number" style={{ color: 'var(--color-success)' }}>4</p>
          <span className="stat-trend green">All operational</span>
        </div>
        <div className="glass-card glow-blue">
          <h3 style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Storage Capacity</h3>
          <p className="stat-number" style={{ color: 'var(--neon-orange)' }}>72%</p>
          <span className="stat-trend blue">28% remaining</span>
        </div>
        <div className="glass-card glow-orange">
          <h3 style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Flagged Issues</h3>
          <p className="stat-number" style={{ color: 'var(--neon-blue-data)' }}>0</p>
          <span className="stat-trend green">No warnings reported</span>
        </div>
      </div>

      <div className="glass-panel">
        <h2>Warehouse Locations</h2>
        <div style={{ marginTop: '16px', padding: '24px', background: 'rgba(0,0,0,0.1)', borderRadius: '12px', border: '1px dashed var(--glass-border)' }}>
          <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
            Loading regional warehouse metadata...
          </p>
        </div>
      </div>
    </div>
  );
};

export default Warehouses;
