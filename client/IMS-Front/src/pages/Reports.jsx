import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  BarChart2, TrendingUp, TrendingDown, Package, DollarSign,
  AlertTriangle, AlertOctagon, Download, RefreshCw, PieChart,
  ShoppingCart, Truck, Users, ArrowUpRight, ArrowDownRight, CheckCircle,
} from 'lucide-react';
import '../styles/pages/Reports.css';

/* ── Helpers ──────────────────────────────────────────────────────────────── */
const currency = (n) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const pct = (n, total) => total > 0 ? ((n / total) * 100).toFixed(1) : 0;

/* ── Month abbreviations for bar chart ───────────────────────────────────── */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];

/* ── Mock monthly data ───────────────────────────────────────────────────── */
const MONTHLY_STOCK_IN  = [32, 45, 38, 62, 55, 48, 70];
const MONTHLY_STOCK_OUT = [20, 30, 28, 50, 42, 35, 58];

/* ── Bar chart component ─────────────────────────────────────────────────── */
const BarChart = ({ data1, data2, labels }) => {
  const max = Math.max(...data1, ...data2);
  return (
    <div className="bar-chart-wrap">
      {labels.map((label, i) => (
        <div key={label} className="bar-group">
          <div className="bar-col primary" data-val={data1[i]} style={{ height: `${(data1[i] / max) * 150}px` }} />
          <div className="bar-col secondary" data-val={data2[i]} style={{ height: `${(data2[i] / max) * 150}px` }} />
          <div className="bar-label">{label}</div>
        </div>
      ))}
    </div>
  );
};

/* ── Donut chart (SVG) ───────────────────────────────────────────────────── */
const DonutChart = ({ segments, value, sub }) => {
  const R = 54;
  const C = 2 * Math.PI * R;
  let offset = 0;

  return (
    <div className="donut-wrap">
      <div className="donut-chart">
        <svg viewBox="0 0 120 120" className="donut-svg" width="140" height="140">
          <circle cx="60" cy="60" r={R} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="12" />
          {segments.map((seg, i) => {
            const dash = (seg.pct / 100) * C;
            const el = (
              <circle
                key={i}
                cx="60" cy="60" r={R}
                fill="none"
                stroke={seg.color}
                strokeWidth="12"
                strokeDasharray={`${dash} ${C - dash}`}
                strokeDashoffset={-offset}
                strokeLinecap="round"
                style={{ filter: `drop-shadow(0 0 4px ${seg.color}60)` }}
              />
            );
            offset += dash;
            return el;
          })}
        </svg>
        <div className="donut-label">
          <div className="donut-val">{value}</div>
          <div className="donut-sub">{sub}</div>
        </div>
      </div>
      <div className="donut-legend">
        {segments.map((seg) => (
          <div key={seg.label} className="legend-item">
            <div className="legend-dot" style={{ background: seg.color }} />
            <span className="legend-label">{seg.label}</span>
            <span className="legend-val">{seg.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────── */
const Reports = () => {
  const inventoryItems = useSelector((s) => s.inventory.items);
  const suppliers      = useSelector((s) => s.suppliers.items);
  const users          = useSelector((s) => s.users.items);
  const transfers      = useSelector((s) => s.transfers.items);

  const [lastRefresh] = useState(new Date().toLocaleTimeString());

  /* ── Computed metrics ── */
  const metrics = useMemo(() => {
    const totalSKUs    = inventoryItems.length;
    const totalUnits   = inventoryItems.reduce((a, p) => a + p.quantity, 0);
    const totalValue   = inventoryItems.reduce((a, p) => a + (p.quantity * p.unitPrice), 0);
    const outOfStock   = inventoryItems.filter((p) => p.quantity === 0).length;
    const lowStock     = inventoryItems.filter((p) => p.quantity > 0 && p.quantity < 15).length;
    const healthyStock = totalSKUs - outOfStock - lowStock;
    const avgUnit      = totalSKUs > 0 ? totalValue / totalUnits : 0;
    const completedTr  = transfers.filter((t) => t.status === 'Completed').length;
    const inTransitTr  = transfers.filter((t) => t.status === 'In Transit').length;

    /* Category breakdown */
    const catMap = {};
    inventoryItems.forEach((p) => {
      if (!catMap[p.category]) catMap[p.category] = { units: 0, value: 0, skus: 0 };
      catMap[p.category].units += p.quantity;
      catMap[p.category].value += p.quantity * p.unitPrice;
      catMap[p.category].skus  += 1;
    });
    const categories = Object.entries(catMap).map(([name, d]) => ({ name, ...d }));

    /* Top 5 products by value */
    const topProducts = [...inventoryItems]
      .sort((a, b) => (b.quantity * b.unitPrice) - (a.quantity * a.unitPrice))
      .slice(0, 5);

    /* Supplier distribution by SKU count */
    const supMap = {};
    inventoryItems.forEach((p) => {
      supMap[p.supplier] = (supMap[p.supplier] || 0) + 1;
    });
    const supBreakdown = Object.entries(supMap).map(([name, count]) => ({ name, count }));

    /* Warehouse distribution */
    const whMap = {};
    inventoryItems.forEach((p) => {
      if (!whMap[p.warehouse]) whMap[p.warehouse] = { units: 0, skus: 0 };
      whMap[p.warehouse].units += p.quantity;
      whMap[p.warehouse].skus  += 1;
    });
    const warehouseBreakdown = Object.entries(whMap).map(([name, d]) => ({ name, ...d }));

    return { totalSKUs, totalUnits, totalValue, outOfStock, lowStock, healthyStock, avgUnit, completedTr, inTransitTr, categories, topProducts, supBreakdown, warehouseBreakdown };
  }, [inventoryItems, transfers]);

  /* ── Donut segments for stock health ── */
  const stockHealthSegments = [
    { label: 'Healthy',      count: metrics.healthyStock, pct: pct(metrics.healthyStock, metrics.totalSKUs), color: 'var(--color-success)' },
    { label: 'Low Stock',    count: metrics.lowStock,     pct: pct(metrics.lowStock,     metrics.totalSKUs), color: 'var(--color-warning)' },
    { label: 'Out of Stock', count: metrics.outOfStock,   pct: pct(metrics.outOfStock,   metrics.totalSKUs), color: 'var(--color-danger)' },
  ];

  /* ── Warehouse color cycle ── */
  const WH_COLORS = ['var(--neon-orange)', 'var(--neon-blue-data)', 'var(--color-success)', 'var(--color-warning)'];

  return (
    <div className="reports-layout">
      {/* ── Page header ── */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">Analytics & Reports</h1>
          <p className="page-subtitle">Business intelligence, inventory KPIs, and operational metrics</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Last refreshed: {lastRefresh}</span>
          <button className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* ── Top KPI cards ── */}
      <div className="kpi-row">
        {[
          { label: 'Total Inventory Value', value: currency(metrics.totalValue),  color: 'orange', icon: <DollarSign size={18} />, delta: { dir: 'up',   text: '+12.4% vs last month' } },
          { label: 'Total SKUs',            value: metrics.totalSKUs,             color: 'blue',   icon: <Package size={18} />,    delta: { dir: 'neutral', text: `${metrics.totalUnits} total units` } },
          { label: 'Stock Transfers',        value: metrics.completedTr,           color: 'green',  icon: <Truck size={18} />,      delta: { dir: 'up',   text: `${metrics.inTransitTr} in transit` } },
          { label: 'Active Users',           value: users.filter((u) => u.status === 'Active').length, color: 'blue', icon: <Users size={18} />, delta: { dir: 'neutral', text: `${suppliers.length} active suppliers` } },
        ].map((kpi) => (
          <div key={kpi.label} className="kpi-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="kpi-label">{kpi.label}</div>
              <div style={{
                padding: '8px',
                borderRadius: '10px',
                background: kpi.color === 'orange' ? 'rgba(255,107,0,0.1)' : kpi.color === 'green' ? 'rgba(16,185,129,0.1)' : 'rgba(47,128,255,0.1)',
                color: kpi.color === 'orange' ? 'var(--neon-orange)' : kpi.color === 'green' ? 'var(--color-success)' : 'var(--neon-blue-data)',
                border: `1px solid ${kpi.color === 'orange' ? 'rgba(255,107,0,0.2)' : kpi.color === 'green' ? 'rgba(16,185,129,0.2)' : 'rgba(47,128,255,0.2)'}`,
              }}>
                {kpi.icon}
              </div>
            </div>
            <div className={`kpi-value ${kpi.color}`}>{kpi.value}</div>
            <div className={`kpi-delta ${kpi.delta.dir}`}>
              {kpi.delta.dir === 'up' && <ArrowUpRight size={13} />}
              {kpi.delta.dir === 'down' && <ArrowDownRight size={13} />}
              {kpi.delta.text}
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts row ── */}
      <div className="reports-grid">
        {/* Stock In vs Out bar chart */}
        <div className="glass-panel">
          <div className="reports-section-title">
            <div className="s-icon"><BarChart2 size={16} /></div>
            Stock Movement (Monthly)
          </div>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {[
              { color: 'var(--neon-orange)',    label: 'Stock In' },
              { color: 'var(--neon-blue-data)', label: 'Stock Out' },
            ].map((l) => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: l.color }} />
                {l.label}
              </div>
            ))}
          </div>
          <BarChart data1={MONTHLY_STOCK_IN} data2={MONTHLY_STOCK_OUT} labels={MONTHS} />
        </div>

        {/* Stock health donut */}
        <div className="glass-panel">
          <div className="reports-section-title">
            <div className="s-icon"><PieChart size={16} /></div>
            Stock Health Distribution
          </div>
          <DonutChart
            segments={stockHealthSegments}
            value={`${metrics.totalSKUs}`}
            sub="Total SKUs"
          />
        </div>
      </div>

      {/* ── Alerts & warnings ── */}
      <div className="glass-panel">
        <div className="reports-section-title">
          <div className="s-icon" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--color-danger)' }}>
            <AlertOctagon size={16} />
          </div>
          Inventory Alerts
        </div>
        {metrics.outOfStock === 0 && metrics.lowStock === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', color: 'var(--color-success)' }}>
            <CheckCircle size={32} style={{ marginBottom: '8px' }} />
            <p style={{ fontWeight: 600 }}>All inventory levels are healthy!</p>
          </div>
        ) : (
          <div>
            {inventoryItems.filter((p) => p.quantity === 0).map((p) => (
              <div key={p.id} className="alert-item">
                <div className="alert-icon-wrap red"><AlertOctagon size={16} /></div>
                <div className="alert-text">
                  <div className="alert-title">Out of Stock — {p.name}</div>
                  <div className="alert-sub">{p.sku} · {p.warehouse} · Supplier: {p.supplier}</div>
                </div>
              </div>
            ))}
            {inventoryItems.filter((p) => p.quantity > 0 && p.quantity < 15).map((p) => (
              <div key={p.id} className="alert-item">
                <div className="alert-icon-wrap orange"><AlertTriangle size={16} /></div>
                <div className="alert-text">
                  <div className="alert-title">Low Stock — {p.name} ({p.quantity} units)</div>
                  <div className="alert-sub">{p.sku} · {p.warehouse} · Supplier: {p.supplier}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Two-col bottom section ── */}
      <div className="reports-grid">
        {/* Top products by value */}
        <div className="glass-panel">
          <div className="reports-section-title">
            <div className="s-icon"><TrendingUp size={16} /></div>
            Top Products by Value
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="top-products-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>Units</th>
                  <th>Total Value</th>
                  <th>Stock %</th>
                </tr>
              </thead>
              <tbody>
                {metrics.topProducts.map((p, i) => {
                  const totalVal = p.quantity * p.unitPrice;
                  const stockRatio = metrics.totalUnits > 0 ? (p.quantity / metrics.totalUnits) * 100 : 0;
                  return (
                    <tr key={p.id}>
                      <td>
                        <div className={`rank-badge rank-${i < 3 ? i + 1 : 'n'}`}>{i + 1}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-pure-white)' }}>{p.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{p.sku}</div>
                      </td>
                      <td style={{ fontWeight: 700 }}>{p.quantity}</td>
                      <td style={{ color: 'var(--neon-orange)', fontWeight: 700 }}>{currency(totalVal)}</td>
                      <td style={{ minWidth: '90px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stockRatio.toFixed(1)}%</span>
                          <div className="progress-bar-wrap">
                            <div className="progress-bar-fill orange" style={{ width: `${stockRatio}%` }} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Category & Warehouse breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Category breakdown */}
          <div className="glass-panel">
            <div className="reports-section-title">
              <div className="s-icon"><Package size={16} /></div>
              Category Breakdown
            </div>
            {metrics.categories.map((cat, i) => {
              const pctOfTotal = pct(cat.units, metrics.totalUnits);
              const colors = ['orange', 'blue', 'green'];
              const c = colors[i % colors.length];
              return (
                <div key={cat.name} style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-pure-white)' }}>{cat.name}</span>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{cat.units} units · {currency(cat.value)}</span>
                  </div>
                  <div className="progress-bar-wrap" style={{ height: '8px' }}>
                    <div className={`progress-bar-fill ${c}`} style={{ width: `${pctOfTotal}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Warehouse distribution */}
          <div className="glass-panel">
            <div className="reports-section-title">
              <div className="s-icon" style={{ background: 'rgba(47,128,255,0.1)', border: '1px solid rgba(47,128,255,0.2)', color: 'var(--neon-blue-data)' }}>
                <Truck size={16} />
              </div>
              Warehouse Distribution
            </div>
            {metrics.warehouseBreakdown.map((wh, i) => {
              const pctOfTotal = pct(wh.units, metrics.totalUnits);
              return (
                <div key={wh.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: WH_COLORS[i % WH_COLORS.length], flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-pure-white)', fontSize: '0.9rem' }}>{wh.name}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{wh.skus} SKUs</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, color: WH_COLORS[i % WH_COLORS.length] }}>{wh.units} units</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{pctOfTotal}% of total</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Supplier contribution ── */}
      <div className="glass-panel">
        <div className="reports-section-title">
          <div className="s-icon"><ShoppingCart size={16} /></div>
          Supplier SKU Contribution
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
          {metrics.supBreakdown.map((sup, i) => {
            const share = pct(sup.count, metrics.totalSKUs);
            const colors = ['var(--neon-orange)', 'var(--neon-blue-data)', 'var(--color-success)', 'var(--color-warning)'];
            const color = colors[i % colors.length];
            return (
              <div key={sup.name} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', padding: '16px' }}>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>{sup.name}</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color, letterSpacing: '-1px' }}>{sup.count}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>{share}% of total SKUs</div>
                <div className="progress-bar-wrap" style={{ marginTop: '10px', height: '6px' }}>
                  <div className="progress-bar-fill orange" style={{ width: `${share}%`, background: color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Reports;
