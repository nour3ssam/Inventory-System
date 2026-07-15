import React from 'react';
import { Star, Edit, Trash2, Mail, Phone, ShoppingBag, DollarSign } from 'lucide-react';

const SupplierCard = ({ supplier, metrics, onCardClick, onEditClick, onDeleteClick }) => {
  // const isInactive = supplier.status?.toLowerCase() === 'inactive';
  
  // Render rating stars helper
  /*
  const renderStars = (rating) => {
    const stars = [];
    const floorRating = Math.floor(rating);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star 
          key={i} 
          size={13} 
          className={i <= floorRating ? 'star-filled' : 'star-empty'} 
        />
      );
    }
    return <div className="card-stars-row">{stars}</div>;
  };
  */

  const handleCardClick = (e) => {
    // Avoid opening details modal when clicking action buttons
    if (e.target.closest('.btn-action') || e.target.closest('.card-actions-wrapper')) {
      return;
    }
    onCardClick(supplier);
  };

  return (
    <div className="supplier-card glass-card" onClick={handleCardClick}>
      {/* 1. Cover Photo Banner */}
      <div className="card-cover-banner">
        {/*
        <span className={`badge card-status-badge ${isInactive ? 'badge-inactive' : 'badge-active'}`}>
          {supplier.status}
        </span>
        */}
      </div>

      {/* 2. Floating Avatar Profile Circle */}
      <div className="card-avatar-wrapper">
        <div className="card-avatar">
          {supplier.name?.[0]?.toUpperCase() || 'S'}
        </div>
      </div>

      {/* 3. Card Profile Body Content */}
      <div className="card-profile-body">
        {/* Code Badge & Company Name */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}>
          {/* <span className="code-badge" style={{ fontSize: '0.75rem', padding: '2px 6px' }}>{supplier.code}</span> */}
        </div>
        <h3 className="supplier-title-text" style={{ textAlign: 'center', fontSize: '1.15rem' }}>{supplier.name}</h3>
        
        {/* Contact Person */}
        {/*
        <p className="contact-name-text" style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
          Partner: {supplier.contactPerson}
        </p>
        */}

        {/* Performance Stars */}
        {/*
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
          {renderStars(supplier.rating || 0)}
          <span style={{ fontSize: '0.8rem', color: 'var(--text-pure-white)', marginLeft: '6px', fontWeight: '600' }}>
            {supplier.rating?.toFixed(1)}
          </span>
        </div>
        */}

        {/* Business Summary Description */}
        {/*
        <p className="supplier-description-text" style={{ textAlign: 'center', fontSize: '0.8rem', margin: '0 auto 16px auto', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '36px', lineHeight: '1.3' }}>
          {supplier.description}
        </p>
        */}
      </div>

      {/* 4. Mini Stats Metrics Panel */}
      <div className="card-metrics-row">
        <div className="card-metric-item" title="Unique SKU items supplied">
          <ShoppingBag size={14} color="var(--neon-blue-data)" />
          <span>{metrics.skus} SKUs</span>
        </div>
        <div className="card-metric-item" title="Asset valuation supplied">
          <DollarSign size={14} color="var(--neon-orange)" />
          <span>${metrics.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
        </div>
      </div>

      {/* 5. Card Hover Actions Overlay Bar */}
      <div className="card-actions-wrapper">
        <button 
          className="btn-action" 
          onClick={(e) => { e.stopPropagation(); onEditClick(supplier); }}
          title="Edit Details"
        >
          <Edit size={14} />
        </button>
        <button 
          className="btn-action delete" 
          onClick={(e) => { e.stopPropagation(); onDeleteClick(supplier.id, supplier.name); }}
          title="Delete Vendor"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

export default SupplierCard;
