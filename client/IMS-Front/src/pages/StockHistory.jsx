import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Clock, Database, Search, Filter } from 'lucide-react';
import { fetchStockHistory, setHistoryFilters } from '../store/stockHistorySlice';

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const StockHistory = () => {
  const dispatch = useDispatch();
  const { items: stockHistory, loading, filters } = useSelector((s) => s.stockHistory);

  useEffect(() => {
    dispatch(fetchStockHistory());
  }, [dispatch]);

  // Optionally filter locally or just re-fetch based on filters (currently the slice handles it via fetchStockHistory)
  // For a simple UI, we just display the fetched items.

  return (
    <div className="page-layout" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="page-header">
        <h1 className="page-title">Stock History</h1>
        <p className="page-subtitle">Complete chronological log of all stock movements (IN, OUT, ADJUSTMENT)</p>
      </div>

      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--glass-border)', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Database size={20} style={{ color: 'var(--neon-blue-data)' }} />
          <h2 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, color: 'var(--text-pure-white)' }}>Movement Logs</h2>
        </div>
        
        <div style={{ width: '100%', overflowX: 'auto' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Clock size={36} style={{ opacity: 0.3, marginBottom: '12px' }} />
              <p>Loading stock movements…</p>
            </div>
          ) : stockHistory.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Database size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
              <p>No stock movement records found.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <th style={{ padding: '12px 20px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Type</th>
                  <th style={{ padding: '12px 20px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Product</th>
                  <th style={{ padding: '12px 20px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Qty</th>
                  <th style={{ padding: '12px 20px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Supplier</th>
                  <th style={{ padding: '12px 20px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Notes</th>
                  <th style={{ padding: '12px 20px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {stockHistory.map((h) => {
                  const typeColors = { IN: 'var(--color-success)', OUT: 'var(--color-danger)', ADJUSTMENT: 'var(--neon-orange)' };
                  return (
                    <tr key={h.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                      <td style={{ padding: '12px 20px' }}>
                        <span style={{
                          padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700,
                          color: typeColors[h.typeName] || 'var(--text-muted)',
                          background: `${typeColors[h.typeName]}15` || 'transparent',
                          border: `1px solid ${typeColors[h.typeName]}30`,
                        }}>
                          {h.typeName}
                        </span>
                      </td>
                      <td style={{ padding: '12px 20px', fontWeight: 600, color: 'var(--text-pure-white)' }}>{h.productName}</td>
                      <td style={{ padding: '12px 20px', fontWeight: 700 }}>{h.quantity}</td>
                      <td style={{ padding: '12px 20px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{h.supplierName || '—'}</td>
                      <td style={{ padding: '12px 20px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{h.notes || '—'}</td>
                      <td style={{ padding: '12px 20px', color: 'var(--text-muted)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{formatDate(h.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockHistory;
