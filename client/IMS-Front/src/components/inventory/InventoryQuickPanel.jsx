import React from 'react';
import { useSelector } from 'react-redux';
import { AlertTriangle, Clock, Truck, BarChart2 } from 'lucide-react';

const InventoryQuickPanel = () => {
  const { items } = useSelector((state) => state.inventory);

  // Extract low stock alerts dynamically from Redux
  const lowStockItems = items.filter((item) => item.quantity > 0 && item.quantity <= 20);
  const outOfStockItems = items.filter((item) => item.quantity === 0);

  // Calculate sum counts
  const totalValue = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  const totalUnits = items.reduce((acc, item) => acc + item.quantity, 0);

  // Mock static logs
  const activityLogs = [
    { text: 'Chassis SKU-1049 relocated to East Depot', time: '30m ago', color: 'var(--neon-blue-data)' },
    { text: 'Lithium Power Pack depleted in North Hub', time: '2h ago', color: 'var(--color-danger)' },
    { text: 'Conveyor Belt SKU-3304 registered by Lead Operator', time: '4h ago', color: 'var(--color-success)' },
    { text: 'Plasma Tubing count updated in South Wing', time: '1d ago', color: 'var(--neon-orange)' },
  ];

  // Mock shipments
  const upcomingDeliveries = [
    { sku: 'SKU-8840', qty: 200, eta: 'Tomorrow', supplier: 'Apex Tech' },
    { sku: 'SKU-1192', qty: 50, eta: 'Jun 28', supplier: 'Quantum Indus' },
  ];

  return (
    <aside className="inventory-side">
      {/* 1. Quick Stats Summary */}
      <div className="glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <BarChart2 size={18} color="var(--neon-blue-data)" />
          <h3 className="quick-panel-title" style={{ border: 'none', padding: '0', margin: '0' }}>
            Hub Summary
          </h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Unique SKUs</span>
            <span style={{ fontWeight: '600', color: 'var(--text-pure-white)' }}>{items.length}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Total Stock Units</span>
            <span style={{ fontWeight: '600', color: 'var(--text-pure-white)' }}>{totalUnits}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Valuation Asset</span>
            <span style={{ fontWeight: '600', color: 'var(--neon-orange)' }}>${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Operational Capacity</span>
            <span style={{ fontWeight: '600', color: 'var(--color-success)' }}>72%</span>
          </div>
        </div>
      </div>

      {/* 2. Critical Stock Notifications */}
      <div className="glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <AlertTriangle size={18} color="var(--neon-orange)" />
          <h3 className="quick-panel-title" style={{ border: 'none', padding: '0', margin: '0' }}>
            Critical Stock Warnings
          </h3>
        </div>
        <div className="alert-list">
          {outOfStockItems.map((item) => (
            <div key={item.id} className="alert-item">
              <div className="alert-info">
                <span className="alert-name">{item.name}</span>
                <span className="alert-desc">{item.sku} • {item.warehouse}</span>
              </div>
              <span className="badge badge-out-of-stock" style={{ padding: '4px 8px', fontSize: '0.7rem' }}>
                DEPLETED
              </span>
            </div>
          ))}
          {lowStockItems.map((item) => (
            <div key={item.id} className="alert-item warning">
              <div className="alert-info">
                <span className="alert-name">{item.name}</span>
                <span className="alert-desc">{item.sku} • {item.warehouse}</span>
              </div>
              <span className="badge badge-low-stock" style={{ padding: '4px 8px', fontSize: '0.7rem' }}>
                QTY {item.quantity}
              </span>
            </div>
          ))}
          {lowStockItems.length === 0 && outOfStockItems.length === 0 && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '8px 0' }}>
              All inventory levels nominal.
            </p>
          )}
        </div>
      </div>

      {/* 3. Upcoming Re-supply Deliveries */}
      <div className="glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Truck size={18} color="var(--color-success)" />
          <h3 className="quick-panel-title" style={{ border: 'none', padding: '0', margin: '0' }}>
            Incoming Shipments
          </h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {upcomingDeliveries.map((delivery) => (
            <div 
              key={delivery.sku} 
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                fontSize: '0.85rem',
                borderBottom: '1px solid rgba(255,255,255,0.02)',
                paddingBottom: '8px'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: '600', color: 'var(--text-pure-white)' }}>{delivery.sku}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{delivery.supplier}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span style={{ color: 'var(--color-success)', fontWeight: '600' }}>+{delivery.qty} Units</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ETA: {delivery.eta}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Live Activity Tracker */}
      <div className="glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Clock size={18} color="var(--text-muted)" />
          <h3 className="quick-panel-title" style={{ border: 'none', padding: '0', margin: '0' }}>
            System Ledger Logs
          </h3>
        </div>
        <div className="activity-list">
          {activityLogs.map((log, index) => (
            <div key={index} className="activity-item">
              <div className="activity-indicator" style={{ background: log.color }}></div>
              <div className="activity-details">
                <span className="activity-text">{log.text}</span>
                <span className="activity-time">{log.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default InventoryQuickPanel;
