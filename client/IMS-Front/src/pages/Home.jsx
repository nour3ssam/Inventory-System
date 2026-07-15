import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import
  {
    TrendingUp, Package, AlertTriangle, Bell, CheckCheck,
    Activity, RefreshCw, ArrowUpRight, ArrowDownRight,
    AlertOctagon, Info, Clock, Zap, Cpu, Database,
    Shield, Radio, BarChart2, Users,
  } from 'lucide-react';
import { fetchProducts } from '../store/inventorySlice';
import { fetchNotifications, markAllNotificationsRead } from '../store/notificationSlice';
import { fetchStockHistory } from '../store/stockHistorySlice';
import '../styles/pages/Dashboard.css';

/* ─── Removed mock constants ─────────────────────────────────────────────────── */

/* ─── Formatters ─────────────────────────────────────────────────── */
const fmtMoney = (n) =>
{
  if (!n && n !== 0) return '—';
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
};
const fmtTime = (iso) =>
{
  if (!iso) return '—';
  const s = (Date.now() - new Date(iso)) / 1000;
  if (s < 60) return `${Math.floor(s)}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

/* ─── Priority mapping (backend enums)
   NotificationPriority: 0=Low 1=Medium 2=High 3=Critical
   NotificationType:     0=Normal 1=LowStock 2=OutOfStock 3=OverStock 4=Expired
   ──────────────────────────────────────────────────────────────────── */
const getPrio = ({ type, priority }) =>
{
  if (priority >= 2 || type === 2 || type === 4) return 'critical';
  if (priority === 1 || type === 1 || type === 3) return 'warning';
  return 'info';
};

/* ════════════════════════════════════════════════════════════════════
   CYBER GRID BACKGROUND — canvas that draws an animated hex/grid
   ════════════════════════════════════════════════════════════════════ */
const CyberGrid = () =>
{
  const canvasRef = useRef(null);

  useEffect(() =>
  {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let t = 0;

    const resize = () =>
    {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () =>
    {
      t += 0.003;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Perspective grid lines
      const vp = { x: canvas.width / 2, y: canvas.height * 0.38 };
      const cols = 18, rows = 10;
      const w = canvas.width, h = canvas.height;

      ctx.lineWidth = 0.4;
      // Vertical lines
      for (let i = 0; i <= cols; i++)
      {
        const xTop = (i / cols) * w;
        const xBot = vp.x + (xTop - vp.x) * 3.5;
        const pulse = 0.025 + 0.012 * Math.sin(t * 2 + i * 0.4);
        ctx.strokeStyle = `rgba(255,107,0,${pulse})`;
        ctx.beginPath();
        ctx.moveTo(xTop, 0);
        ctx.lineTo(xBot > w ? w : xBot < 0 ? 0 : xBot, h);
        ctx.stroke();
      }
      // Horizontal lines
      for (let j = 0; j <= rows; j++)
      {
        const y = (j / rows) * h;
        const pulse = 0.018 + 0.010 * Math.sin(t * 1.5 + j * 0.6);
        ctx.strokeStyle = `rgba(47,128,255,${pulse})`;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Scan line sweep
      const scanY = (((t * 0.4) % 1) * (h + 60)) - 30;
      const grad = ctx.createLinearGradient(0, scanY - 30, 0, scanY + 30);
      grad.addColorStop(0, 'rgba(255,107,0,0)');
      grad.addColorStop(0.5, 'rgba(255,107,0,0.055)');
      grad.addColorStop(1, 'rgba(255,107,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, scanY - 30, w, 60);

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={canvasRef} className="db-cyber-grid" aria-hidden="true" />;
};

/* ════════════════════════════════════════════════════════════════════
   SVG LINE CHART — Revenue vs. Cost
   ════════════════════════════════════════════════════════════════════ */
const CW = 780, CH = 230;
const PAD = { top: 28, right: 24, bottom: 44, left: 68 };
const IW = CW - PAD.left - PAD.right, IH = CH - PAD.top - PAD.bottom;
const pX = (i, n) => PAD.left + (i / (Math.max(1, n - 1))) * IW;
const pY = (v, mn, mx) => {
  if (mx === mn) return PAD.top + IH;
  return PAD.top + IH - ((v - mn) / (mx - mn)) * IH;
};

const smooth = (data, mn, mx, area) =>
{
  const pts = data.map((v, i) => [pX(i, data.length), pY(v, mn, mx)]);
  let d = area ? `M ${pts[0][0]} ${PAD.top + IH} L ${pts[0][0]} ${pts[0][1]}` : `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++)
  {
    const dx = (pts[i][0] - pts[i - 1][0]) * 0.38;
    d += ` C ${pts[i - 1][0] + dx} ${pts[i - 1][1]}, ${pts[i][0] - dx} ${pts[i][1]}, ${pts[i][0]} ${pts[i][1]}`;
  }
  if (area) d += ` L ${pts[pts.length - 1][0]} ${PAD.top + IH} Z`;
  return d;
};

const LineChart = ({ months, revData, costData }) =>
{
  const [anim, setAnim] = useState(false);
  const [hover, setHover] = useState(null);
  const svgRef = useRef(null);

  useEffect(() => { const t = setTimeout(() => setAnim(true), 300); return () => clearTimeout(t); }, []);

  const all = [...revData, ...costData];
  let mn = Math.min(...all) * 0.84;
  let mx = Math.max(...all) * 1.06;
  if (mn === mx) {
    mn = 0;
    mx = mx > 0 ? mx * 1.5 : 1000;
  }
  const grid = Array.from({ length: 5 }, (_, i) => mn + ((mx - mn) * i) / 4);

  const tipX = hover !== null
    ? Math.min(Math.max(pX(hover, months.length) - 70, PAD.left), CW - PAD.right - 144)
    : 0;

  const onMove = useCallback((e) =>
  {
    if (!svgRef.current) return;
    const r = svgRef.current.getBoundingClientRect();
    const sx = (e.clientX - r.left) * (CW / r.width) - PAD.left;
    setHover(Math.max(0, Math.min(months.length - 1, Math.round(sx / (IW / (Math.max(1, months.length - 1)))))));
  }, [months.length]);

  return (
    <div className="lc-outer">
      <div className="lc-hdr">
        <div className="lc-hdr-left">
          <BarChart2 size={14} className="lc-hdr-icon" aria-hidden="true" />
          <span className="lc-title">REVENUE VS. COST</span>
        </div>
        <div className="lc-legend-row">
          <span className="lc-leg"><span className="lc-leg-line lc-leg-rev" />REV</span>
          <span className="lc-leg"><span className="lc-leg-line lc-leg-cost" />COST</span>
        </div>
      </div>

      <svg ref={svgRef} viewBox={`0 0 ${CW} ${CH}`} className="lc-svg"
        onMouseMove={onMove} onMouseLeave={() => setHover(null)}
        aria-label="Revenue vs Cost chart">
        <defs>
          <linearGradient id="db-rev-g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF6B00" stopOpacity=".42" />
            <stop offset="100%" stopColor="#FF6B00" stopOpacity=".01" />
          </linearGradient>
          <linearGradient id="db-cost-g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2F80FF" stopOpacity=".30" />
            <stop offset="100%" stopColor="#2F80FF" stopOpacity=".01" />
          </linearGradient>
          <filter id="db-glow-r"><feGaussianBlur stdDeviation="2.5" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          <filter id="db-glow-b"><feGaussianBlur stdDeviation="2.5" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          <clipPath id="db-clip"><rect x={PAD.left} y={PAD.top} width={IW} height={IH} /></clipPath>
        </defs>

        {/* grid */}
        {grid.map((v, i) =>
        {
          const y = pY(v, mn, mx);
          return <g key={i}>
            <line x1={PAD.left} y1={y} x2={PAD.left + IW} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
            <text x={PAD.left - 8} y={y + 4} textAnchor="end" fontSize="9" fill="rgba(255,255,255,0.22)"
              fontFamily="'Share Tech Mono',monospace">{fmtMoney(v)}</text>
          </g>;
        })}
        {months.map((m, i) => (
          <text key={m} x={pX(i, months.length)} y={CH - 10} textAnchor="middle"
            fontSize="9" fill="rgba(255,255,255,0.22)"
            fontFamily="'Share Tech Mono',monospace">{m}</text>
        ))}

        {/* hover column */}
        {hover !== null && <rect
          x={pX(hover, months.length) - IW / (Math.max(1, months.length - 1)) / 2} y={PAD.top}
          width={IW / (Math.max(1, months.length - 1))} height={IH}
          fill="rgba(255,107,0,0.03)" />}

        {/* areas */}
        <g clipPath="url(#db-clip)">
          <path d={smooth(costData, mn, mx, true)} fill="url(#db-cost-g)" />
          <path d={smooth(revData, mn, mx, true)} fill="url(#db-rev-g)" />
        </g>

        {/* lines */}
        <path d={smooth(costData, mn, mx, false)} fill="none" stroke="#2F80FF" strokeWidth="2"
          pathLength="1" filter="url(#db-glow-b)"
          style={{
            strokeDasharray: 1, strokeDashoffset: anim ? 0 : 1,
            transition: 'stroke-dashoffset 2s cubic-bezier(.4,0,.2,1)'
          }} />
        <path d={smooth(revData, mn, mx, false)} fill="none" stroke="#FF6B00" strokeWidth="2.5"
          pathLength="1" filter="url(#db-glow-r)"
          style={{
            strokeDasharray: 1, strokeDashoffset: anim ? 0 : 1,
            transition: 'stroke-dashoffset 2.4s cubic-bezier(.4,0,.2,1) .15s'
          }} />

        {/* hover overlays */}
        {hover !== null && (() =>
        {
          const rx = pX(hover, months.length);
          const ry = pY(revData[hover], mn, mx);
          const cy = pY(costData[hover], mn, mx);
          return <>
            <line x1={rx} y1={PAD.top} x2={rx} y2={PAD.top + IH}
              stroke="rgba(255,107,0,0.18)" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx={rx} cy={ry} r="13" fill="rgba(255,107,0,0.1)" />
            <circle cx={rx} cy={ry} r="5" fill="#FF6B00" stroke="#07152D" strokeWidth="2.5" />
            <circle cx={rx} cy={cy} r="13" fill="rgba(47,128,255,0.1)" />
            <circle cx={rx} cy={cy} r="5" fill="#2F80FF" stroke="#07152D" strokeWidth="2.5" />
            <g transform={`translate(${tipX},${PAD.top + 8})`}>
              <rect width="142" height="78" rx="10" fill="rgba(4,12,30,0.97)"
                stroke="rgba(255,107,0,0.3)" strokeWidth="1" />
              <rect width="142" height="3" rx="1.5" fill="#FF6B00" opacity=".7" />
              <text x="12" y="22" fontSize="11" fontWeight="800" fill="#fff"
                fontFamily="'Share Tech Mono',monospace">{months[hover]}</text>
              <rect x="12" y="30" width="8" height="2.5" rx="1" fill="#FF6B00" />
              <text x="26" y="40" fontSize="10" fill="#FF6B00"
                fontFamily="'Share Tech Mono',monospace" fontWeight="700">
                {fmtMoney(revData[hover])}
              </text>
              <rect x="12" y="50" width="8" height="2.5" rx="1" fill="#2F80FF" />
              <text x="26" y="60" fontSize="10" fill="#2F80FF"
                fontFamily="'Share Tech Mono',monospace" fontWeight="700">
                {fmtMoney(costData[hover])}
              </text>
            </g>
          </>;
        })()}

        <rect x={PAD.left} y={PAD.top} width={IW} height={IH}
          fill="transparent" style={{ cursor: 'crosshair' }} />
      </svg>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════
   DONUT CHART — real inventory data
   ════════════════════════════════════════════════════════════════════ */
const DonutChart = ({ inStock, lowStock, outOfStock }) =>
{
  const [anim, setAnim] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnim(true), 600); return () => clearTimeout(t); }, []);

  const R = 72, SW = 26, CIRC = 2 * Math.PI * R;
  const total = inStock + lowStock + outOfStock;
  const pct = total > 0 ? Math.round((inStock / total) * 100) : 0;
  const hc = pct >= 70 ? '#00ff88' : pct >= 40 ? '#FF6B00' : '#ff3366';

  const segs = [
    { k: 'in', v: inStock, c: '#00ff88', label: 'IN STOCK', sub: 'Healthy' },
    { k: 'low', v: lowStock, c: '#FF6B00', label: 'LOW STOCK', sub: 'Reorder' },
    { k: 'out', v: outOfStock, c: '#ff3366', label: 'CRITICAL', sub: 'Out of Stock' },
  ];
  let cum = 0;
  const arcs = segs.map(s =>
  {
    const frac = total > 0 ? s.v / total : 0;
    const dash = anim ? Math.max(0, frac * CIRC - (s.v > 0 ? 4 : 0)) : 0;
    const a = { ...s, frac, dash, cum };
    cum += frac * CIRC;
    return a;
  });

  return (
    <div className="donut-outer">
      <div className="donut-title-row">
        <Database size={13} aria-hidden="true" />
        <span>STOCK HEALTH MATRIX</span>
      </div>
      <div className="donut-flex">
        <div className="donut-svg-wrap">
          <svg viewBox="0 0 200 200" className="donut-svg" aria-label="Stock health donut">
            {/* decorative rings */}
            <circle cx="100" cy="100" r={R + SW / 2 + 6} fill="none"
              stroke="rgba(255,107,0,0.06)" strokeWidth="1" />
            <circle cx="100" cy="100" r={R - SW / 2 - 6} fill="none"
              stroke="rgba(47,128,255,0.06)" strokeWidth="1" />
            {/* bg track */}
            <circle cx="100" cy="100" r={R} fill="none"
              stroke="rgba(255,255,255,0.04)" strokeWidth={SW} />
            {/* segments */}
            {total === 0
              ? <circle cx="100" cy="100" r={R} fill="none"
                stroke="rgba(255,255,255,0.07)" strokeWidth={SW} />
              : arcs.map(a => a.v > 0 && (
                <circle key={a.k} cx="100" cy="100" r={R}
                  transform="rotate(-90,100,100)"
                  fill="none" stroke={a.c} strokeWidth={SW}
                  strokeLinecap="butt"
                  strokeDasharray={`${a.dash} ${CIRC - a.dash}`}
                  strokeDashoffset={-a.cum}
                  style={{
                    transition: 'stroke-dasharray 1.6s cubic-bezier(.4,0,.2,1)',
                    filter: `drop-shadow(0 0 6px ${a.c}aa)`,
                  }} />
              ))}
            {/* center */}
            <text x="100" y="86" textAnchor="middle" fontSize="30" fontWeight="900"
              fill="#fff" fontFamily="'Share Tech Mono',monospace">{total}</text>
            <text x="100" y="101" textAnchor="middle" fontSize="8.5" fill="rgba(255,255,255,0.35)"
              fontFamily="'Share Tech Mono',monospace" letterSpacing="2">TOTAL SKUs</text>
            <text x="100" y="116" textAnchor="middle" fontSize="11" fontWeight="700"
              fill={hc} fontFamily="'Share Tech Mono',monospace">{pct}% HEALTHY</text>
          </svg>
        </div>
        <div className="donut-legs">
          {arcs.map(a => (
            <div key={a.k} className="donut-leg">
              <div className="donut-leg-sq" style={{ background: a.c, boxShadow: `0 0 8px ${a.c}88` }} />
              <div className="donut-leg-txt">
                <span className="donut-leg-label" style={{ color: a.c }}>{a.label}</span>
                <span className="donut-leg-sub">{a.sub}</span>
              </div>
              <span className="donut-leg-n" style={{ color: a.c }}>{a.v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════
   KPI CARD
   ════════════════════════════════════════════════════════════════════ */
const KPI = ({ icon: Icon, label, value, sub, color, delay = 0, glowColor }) =>
{
  const [vis, setVis] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), delay); return () => clearTimeout(t); }, [delay]);
  const gc = glowColor || color;

  return (
    <div className={`kpi ${vis ? 'kpi-vis' : ''}`}
      style={{ '--kc': color, '--gc': gc }}>
      {/* corner accents */}
      <span className="kpi-corner kpi-corner-tl" aria-hidden="true" />
      <span className="kpi-corner kpi-corner-tr" aria-hidden="true" />
      <span className="kpi-corner kpi-corner-bl" aria-hidden="true" />
      <span className="kpi-corner kpi-corner-br" aria-hidden="true" />

      <div className="kpi-glow" aria-hidden="true" />

      <div className="kpi-top">
        <div className="kpi-icon-box">
          <Icon size={16} aria-hidden="true" />
        </div>
        <span className="kpi-label">{label}</span>
      </div>
      <div className="kpi-val">{value}</div>
      <div className="kpi-sub">{sub}</div>

      {/* Animated scan line */}
      <div className="kpi-scan" aria-hidden="true" />
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════
   NOTIFICATION ITEM
   ════════════════════════════════════════════════════════════════════ */
const PMETA = {
  critical: { icon: <AlertOctagon size={10} />, label: 'CRITICAL', color: '#ff3366' },
  warning: { icon: <AlertTriangle size={10} />, label: 'WARNING', color: '#FF6B00' },
  info: { icon: <Info size={10} />, label: 'INFO', color: '#2F80FF' },
};

const NItem = ({ n }) =>
{
  const p = getPrio(n), m = PMETA[p];
  return (
    <div className={`ni ni-${p}${n.isRead ? ' ni-read' : ''}`}
      style={{ '--nc': m.color }} role="listitem">
      <div className={`ni-dot ni-dot-${p}`} aria-label={m.label} />
      <div className="ni-body">
        <div className="ni-top">
          <span className="ni-title">{n.title || 'System Alert'}</span>
          <span className="ni-badge" style={{
            color: m.color, borderColor: `${m.color}44`,
            background: `${m.color}12`
          }}>
            {m.icon}{m.label}
          </span>
        </div>
        <p className="ni-msg">{n.message}</p>
        {n.productName && (
          <div className="ni-chip">
            <Package size={9} /> {n.productName}
          </div>
        )}
        <div className="ni-foot">
          <Clock size={9} />
          <span>{fmtTime(n.createdAt)}</span>
          {!n.isRead && <span className="ni-pip" style={{
            background: m.color,
            boxShadow: `0 0 6px ${m.color}aa`
          }} />}
        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════
   SYSTEM STATUS BAR
   ════════════════════════════════════════════════════════════════════ */
const StatusBar = ({ products, unreadCount }) =>
{
  const [tick, setTick] = useState(0);
  useEffect(() =>
  {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const now = new Date();
  const ts = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

  return (
    <div className="status-bar" aria-label="System status">
      <div className="sb-item">
        <Radio size={10} className="sb-pulse-icon" aria-hidden="true" />
        <span className="sb-green">SYS ONLINE</span>
      </div>
      <div className="sb-sep" />
      <div className="sb-item">
        <Cpu size={10} aria-hidden="true" />
        <span>SKUs: <strong>{products}</strong></span>
      </div>
      <div className="sb-sep" />
      <div className="sb-item">
        <Shield size={10} aria-hidden="true" />
        <span>ALERTS: <strong style={{ color: unreadCount > 0 ? '#FF6B00' : '#00ff88' }}>{unreadCount}</strong></span>
      </div>
      <div className="sb-right">
        <Zap size={10} aria-hidden="true" />
        <span className="sb-ts">{ts}</span>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════
   HOME / DASHBOARD PAGE
   ════════════════════════════════════════════════════════════════════ */
export default function Home()
{
  const dispatch = useDispatch();
  const { items: products, loading: pLoad } = useSelector(s => s.inventory);
  const { items: notifs, unreadCount, loading: nLoad } = useSelector(s => s.notifications);
  const { items: stockHistory, loading: hLoad } = useSelector(s => s.stockHistory);

  useEffect(() =>
  {
    dispatch(fetchProducts());
    dispatch(fetchNotifications({ pageSize: 100 }));
    dispatch(fetchStockHistory({ pageSize: 2000 }));
  }, [dispatch]);

  // Aggregate line chart data
  const chartData = useMemo(() => {
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const revData = new Array(12).fill(0);
    const costData = new Array(12).fill(0);

    const currentYear = new Date().getFullYear();

    stockHistory.forEach((tx) => {
      if (!tx.createdAt) return;
      const txDate = new Date(tx.createdAt);
      if (txDate.getFullYear() === currentYear) {
        const monthIndex = txDate.getMonth();
        const product = products.find(p => p.id === tx.productId);
        if (product) {
          if (tx.type === 1) { // OUT -> Revenue
            revData[monthIndex] += (tx.quantity * (product.sellingPrice || 0));
          } else if (tx.type === 0) { // IN -> Cost
            costData[monthIndex] += (tx.quantity * (product.costPrice || 0));
          }
        }
      }
    });

    return { months, revData, costData };
  }, [stockHistory, products]);

  const kpis = useMemo(() =>
  {
    const val = products.reduce((s, p) => s + (p.quantity * (p.sellingPrice || 0)), 0);
    const inStock = products.filter(p => p.quantity > (p.reorderLevel || 0)).length;
    const lowStock = products.filter(p => p.quantity > 0 && p.quantity <= (p.reorderLevel || 0)).length;
    const outOf = products.filter(p => p.quantity === 0).length;
    return { val, inStock, lowStock, outOf, total: products.length };
  }, [products]);

  const loading = pLoad && !products.length;

  return (
    <div className="db-root">
      <CyberGrid />

      {/* ── Header ── */}
      <div className="db-header">
        <div className="db-header-left">
          <div className="db-title-chip" aria-hidden="true">
            <Activity size={12} /> OPERATIONAL
          </div>
          <h1 className="db-title">
            <span className="db-title-accent">NEXUS</span> COMMAND CENTER
          </h1>
          <p className="db-subtitle">Inventory Intelligence System · Real-Time Analytics</p>
        </div>
        <StatusBar products={kpis.total} unreadCount={unreadCount} />
      </div>

      {/* ── Main grid ── */}
      <div className="db-layout">

        {/* ──────── LEFT / CENTER  70% ──────── */}
        <div className="db-main">

          {/* KPI grid */}
          <div className="db-kpi-grid" role="region" aria-label="KPI metrics">
            <KPI icon={TrendingUp} label="TOTAL ASSET VALUE"
              value={loading ? '···' : fmtMoney(kpis.val)}
              sub="Across all inventory"
              color="#FF6B00" delay={0} />
            <KPI icon={Package} label="ACTIVE SKUs"
              value={loading ? '···' : kpis.total}
              sub="Product lines tracked"
              color="#2F80FF" delay={90} />
            <KPI icon={AlertTriangle} label="LOW STOCK ALERTS"
              value={loading ? '···' : kpis.lowStock}
              sub="Below reorder threshold"
              color="#f59e0b" glowColor="#f59e0b" delay={180} />
            <KPI icon={Activity} label="UNREAD ALERTS"
              value={unreadCount}
              sub="Pending notifications"
              color="#ff3366" glowColor="#ff3366" delay={270} />
          </div>

          {/* Charts row */}
          <div className="db-charts-row" role="region" aria-label="Performance charts">
            {/* Line chart */}
            <div className="db-glass db-chart-lg">
              <LineChart 
                months={chartData.months} 
                revData={chartData.revData} 
                costData={chartData.costData} 
              />
            </div>
            {/* Donut chart */}
            <div className="db-glass db-chart-sm">
              <DonutChart
                inStock={kpis.inStock}
                lowStock={kpis.lowStock}
                outOfStock={kpis.outOf} />
            </div>
          </div>

          {/* Activity footer strip */}
          <div className="db-activity-strip" role="complementary" aria-label="Inventory summary">
            {[
              { icon: Package, label: 'TOTAL SKUs', val: kpis.total, c: '#2F80FF' },
              { icon: TrendingUp, label: 'IN STOCK', val: kpis.inStock, c: '#00ff88' },
              { icon: AlertTriangle, label: 'LOW STOCK', val: kpis.lowStock, c: '#FF6B00' },
              { icon: AlertOctagon, label: 'OUT OF STOCK', val: kpis.outOf, c: '#ff3366' },
              { icon: Bell, label: 'UNREAD ALERTS', val: unreadCount, c: '#a855f7' },
            ].map(({ icon: I, label, val, c }) => (
              <div key={label} className="db-strip-item">
                <I size={12} style={{ color: c }} aria-hidden="true" />
                <span className="db-strip-label">{label}</span>
                <span className="db-strip-val" style={{ color: c }}>{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ──────── NOTIFICATION SIDEBAR  30% ──────── */}
        <aside className="db-sidebar" aria-label="Notification center">
          <div className="nc-panel">

            {/* Sticky header */}
            <div className="nc-hdr">
              {/* corner accents */}
              <span className="nc-corner nc-c-tl" />
              <span className="nc-corner nc-c-tr" />

              <div className="nc-hdr-top">
                <div className="nc-hdr-left">
                  <div className="nc-icon-box" aria-hidden="true">
                    <Bell size={14} />
                    {unreadCount > 0 && (
                      <span className="nc-badge-count"
                        aria-label={`${unreadCount} unread`}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </div>
                  <div>
                    <h2 className="nc-title">LIVE SYSTEM ALERTS</h2>
                    <p className="nc-sub">{notifs.length} total · {unreadCount} unread</p>
                  </div>
                </div>
                <button id="mark-all-read-btn" className="nc-mark-btn"
                  onClick={() => dispatch(markAllNotificationsRead())}
                  disabled={unreadCount === 0 || nLoad}
                  aria-label="Mark all as read">
                  <CheckCheck size={12} />
                  <span>CLEAR</span>
                </button>
              </div>

              {/* Priority legend */}
              <div className="nc-legend">
                {[
                  { p: 'critical', c: '#ff3366', l: 'CRITICAL' },
                  { p: 'warning', c: '#FF6B00', l: 'WARNING' },
                  { p: 'info', c: '#2F80FF', l: 'INFO' },
                ].map(({ p, c, l }) => (
                  <span key={p} className="nc-leg-item">
                    <span className={`ni-dot ni-dot-${p}`} />
                    <span style={{ color: c }}>{l}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Feed */}
            <div className="nc-feed" role="list" aria-live="polite">
              {nLoad && !notifs.length ? (
                <div className="nc-empty">
                  <RefreshCw size={22} className="spin-icon" aria-hidden="true" />
                  <span>LOADING FEED···</span>
                </div>
              ) : !notifs.length ? (
                <div className="nc-empty">
                  <Shield size={26} style={{ opacity: .25 }} aria-hidden="true" />
                  <span>ALL CLEAR</span>
                  <span className="nc-empty-sub">No active alerts detected</span>
                </div>
              ) : (
                notifs.map(n => <NItem key={n.id} n={n} />)
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}