import React from 'react';

const Pos = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Point of Sale</h1>
        <p className="page-subtitle">Retail checkout, barcode scanning, and quick-sale transactions</p>
      </div>

      <div className="glass-panel" style={{ marginTop: '2rem', padding: '4rem 2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🖥️</div>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>POS Terminal Coming Soon</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto', lineHeight: 1.7 }}>
          The Point of Sale module requires a dedicated backend endpoint for real-time transactions.
          Record sales manually via <strong>Stock History → OUT</strong> transactions in the Transfers page.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem', flexWrap: 'wrap' }}>
          {['Barcode Scanner', 'Receipt Printer', 'Cash Drawer', 'Card Terminal'].map((feat) => (
            <span
              key={feat}
              style={{
                padding: '0.4rem 1rem',
                borderRadius: '20px',
                background: 'rgba(255,107,0,0.1)',
                border: '1px solid rgba(255,107,0,0.25)',
                color: 'var(--neon-orange)',
                fontSize: '0.8rem',
                fontWeight: 600,
              }}
            >
              {feat}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pos;
