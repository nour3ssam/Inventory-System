import React from 'react';
import { Mail, Phone, Calendar, ShoppingBag, ShieldAlert, Star, Layers, DollarSign, MapPin } from 'lucide-react';
import GlassModal from '../ui/GlassModal';

const SupplierDetailModal = ({ isOpen, onClose, supplier, metrics }) => {
  if (!supplier) return null;

  // const isInactive = supplier.status?.toLowerCase() === 'inactive';

  /*
  const renderStars = (rating) => {
    const stars = [];
    const floorRating = Math.floor(rating);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star 
          key={i} 
          size={14} 
          className={i <= floorRating ? 'star-filled' : 'star-empty'} 
        />
      );
    }
    return <div className="rating-container">{stars}</div>;
  };
  */

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title="Supplier Partner Profile"
    >
      <div className="supplier-profile-detail">
        {/* Cover Photo */}
        <div className="detail-cover-banner">
          {/*
          <span className={`badge ${isInactive ? 'badge-inactive' : 'badge-active'}`} style={{ position: 'absolute', top: '16px', right: '16px' }}>
            {supplier.status}
          </span>
          */}
        </div>

        {/* Profile Header section */}
        <div className="detail-profile-header" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '0 24px', marginTop: '-32px', marginBottom: '24px' }}>
          <div className="card-avatar" style={{ width: '80px', height: '80px', fontSize: '1.8rem', border: '4px solid var(--bg-secondary)', flexShrink: 0 }}>
            {supplier.name?.[0]?.toUpperCase() || 'S'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 className="supplier-title-text" style={{ fontSize: '1.4rem', margin: '0' }}>{supplier.name}</h2>
              {/* <span className="code-badge" style={{ fontSize: '0.8rem' }}>{supplier.code}</span> */}
            </div>
            {/*
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '4px 0' }}>
              Primary Contact: <strong>{supplier.contactPerson}</strong>
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {renderStars(supplier.rating || 0)}
              <span style={{ fontSize: '0.85rem', color: 'var(--text-pure-white)', fontWeight: '600' }}>
                {supplier.rating?.toFixed(1)} / 5.0 Rating
              </span>
            </div>
            */}
          </div>
        </div>

        {/* Profile Content Body */}
        <div className="detail-profile-body" style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '0 24px 24px 24px' }}>
          
          {/* Business Summary */}
          {/*
          <div>
            <h4 style={{ color: 'var(--text-pure-white)', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
              Business Overview
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
              {supplier.description}
            </p>
          </div>
          */}

          {/* Contact Details Panel */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {/* Email card */}
            <div className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Mail size={18} color="var(--neon-blue-data)" />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Email Address</span>
                <a href={`mailto:${supplier.email}`} style={{ fontSize: '0.88rem', color: 'var(--text-pure-white)', textDecoration: 'underline' }}>
                  {supplier.email}
                </a>
              </div>
            </div>
            
            {/* Phone card */}
            <div className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Phone size={18} color="var(--neon-orange)" />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Phone Number</span>
                <a href={`tel:${supplier.phone}`} style={{ fontSize: '0.88rem', color: 'var(--text-pure-white)' }}>
                  {supplier.phone}
                </a>
              </div>
            </div>

            {/* Address card */}
            <div className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', gridColumn: '1 / -1' }}>
              <MapPin size={18} color="var(--color-success)" />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Registered Address</span>
                <span style={{ fontSize: '0.88rem', color: 'var(--text-pure-white)' }}>
                  {supplier.address || '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Live Valuation metrics */}
          <div>
            <h4 style={{ color: 'var(--text-pure-white)', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
              Inventory Valuation Ledger
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div className="glass-panel" style={{ padding: '16px', textAlign: 'center', background: 'rgba(255,255,255,0.01)' }}>
                <Layers size={18} color="var(--neon-blue-data)" style={{ margin: '0 auto 8px auto' }} />
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Unique SKUs</span>
                <strong style={{ fontSize: '1.2rem', color: 'var(--text-pure-white)' }}>{metrics.skus}</strong>
              </div>
              <div className="glass-panel" style={{ padding: '16px', textAlign: 'center', background: 'rgba(255,255,255,0.01)' }}>
                <ShoppingBag size={18} color="var(--color-success)" style={{ margin: '0 auto 8px auto' }} />
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Stock Units</span>
                <strong style={{ fontSize: '1.2rem', color: 'var(--text-pure-white)' }}>{metrics.units}</strong>
              </div>
              <div className="glass-panel" style={{ padding: '16px', textAlign: 'center', background: 'rgba(255,255,255,0.01)' }}>
                <DollarSign size={18} color="var(--neon-orange)" style={{ margin: '0 auto 8px auto' }} />
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Valuation Asset</span>
                <strong style={{ fontSize: '1.2rem', color: 'var(--neon-orange)' }}>
                  ${metrics.value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </strong>
              </div>
            </div>
          </div>

          {/* Registration date */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.8rem', alignSelf: 'flex-end', marginTop: '8px' }}>
            <Calendar size={12} />
            <span>Last registry sync: {new Date(supplier.lastUpdated).toLocaleDateString()}</span>
          </div>

        </div>

        {/* Cancel Button */}
        <div style={{ padding: '0 24px 24px 24px', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Close Profile
          </button>
        </div>

      </div>
    </GlassModal>
  );
};

export default SupplierDetailModal;
