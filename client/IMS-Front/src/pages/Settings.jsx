import React from 'react';

const Settings = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">System Settings</h1>
        <p className="page-subtitle">Adjust core server configurations, theme parameters, and backup protocols</p>
      </div>

      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <h2 style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>General Configuration</h2>
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>Global Threshold Alarm</strong>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Send warning indicator if inventory counts sink under 15%</p>
              </div>
              <input type="checkbox" defaultChecked style={{ accentColor: 'var(--neon-orange)', width: '20px', height: '20px' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>Ambient Cyber Glow UI</strong>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Enable soft orange and blue background drops</p>
              </div>
              <input type="checkbox" defaultChecked style={{ accentColor: 'var(--neon-orange)', width: '20px', height: '20px' }} />
            </div>
          </div>
        </div>

        <div>
          <h2 style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>Database Maintenance</h2>
          <button className="btn btn-primary" style={{ marginTop: '16px' }}>Backup System Registry</button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
