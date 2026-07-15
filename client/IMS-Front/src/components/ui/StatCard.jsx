import React from 'react';

/* Resolve accent color from glowVariant string */
const resolveColor = (glowVariant) => {
  switch (glowVariant) {
    case 'orange': return 'var(--neon-orange)';
    case 'green':  return 'var(--color-success)';
    case 'red':    return 'var(--color-danger)';
    case 'blue':
    default:       return 'var(--neon-blue-data)';
  }
};

/* Icon background / border also follow variant */
const resolveIconStyle = (glowVariant) => {
  switch (glowVariant) {
    case 'orange': return { bg: 'rgba(255,107,0,0.1)',   border: 'var(--glass-border-orange)', color: 'var(--neon-orange)'    };
    case 'green':  return { bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.2)',       color: 'var(--color-success)'  };
    case 'red':    return { bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.2)',        color: 'var(--color-danger)'   };
    case 'blue':
    default:       return { bg: 'rgba(47,128,255,0.1)',  border: 'var(--glass-border-blue)',   color: 'var(--neon-blue-data)' };
  }
};

const StatCard = ({ icon: Icon, title, value, trend, glowVariant = 'blue', valueColor }) => {
  /* glow border class — keep blue for green/red variants (no separate css class needed) */
  const glowClass = glowVariant === 'orange' ? 'glow-orange' : 'glow-blue';
  const numColor  = valueColor || resolveColor(glowVariant);
  const iconStyle = resolveIconStyle(glowVariant);

  return (
    <div className={`glass-card ${glowClass}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '500' }}>
            {title}
          </span>
          <p className="stat-number" style={{ color: numColor }}>
            {value}
          </p>
        </div>
        {Icon && (
          <div
            style={{
              padding: '12px',
              borderRadius: '12px',
              background: iconStyle.bg,
              border: `1px solid ${iconStyle.border}`,
              color: iconStyle.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon size={24} />
          </div>
        )}
      </div>

      {trend && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px' }}>
          <span className={`stat-trend ${trend.type || 'blue'}`}>
            {trend.text}
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            {trend.label || 'vs last month'}
          </span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
