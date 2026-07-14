import React from 'react';
import { Search, Bell, Sun, Moon, Plus } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { togglePanel } from '../../store/notificationSlice';

const InventoryHeader = ({ 
  onAddClick, 
  onSearchChange, 
  searchValue, 
  notificationsCount = 2,
  onNotificationsClick
}) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notifications);

  return (
    <header className="top-nav">
      {/* Global Search Bar */}
      <div className="top-nav-search">
        <Search className="top-nav-search-icon" size={18} />
        <input 
          type="text" 
          placeholder="Global system search..." 
          className="top-nav-search-input"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Right Side Header Controls */}
      <div className="top-nav-actions">
        {/* Theme Switcher Toggle (Visual Placeholder) */}
        <button className="nav-icon-button" title="Toggle UI Mode">
          <Sun size={20} className="theme-sun-icon" />
        </button>

        {/* Notifications Icon with Badge */}
        <button 
          className="nav-icon-button" 
          title="Notifications Alert Center"
          onClick={() => {
            if (onNotificationsClick) onNotificationsClick();
            dispatch(togglePanel());
          }}
        >
          <Bell size={20} />
          {unreadCount > 0 && <span className="nav-notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
        </button>

        {/* Dynamic User Profile Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar" style={{ width: '40px', height: '40px', fontSize: '0.85rem' }}>
              {user?.username?.[0]?.toUpperCase() || user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="status-indicator"></div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: '0' }} className="profile-details-nav">
            <span style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-pure-white)' }}>
              {user?.username || user?.name || 'Admin'}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Online
            </span>
          </div>
        </div>

        {/* Glowing Neon Orange Add Item Button */}
        <button 
          className="btn btn-primary" 
          onClick={onAddClick}
          style={{ padding: '10px 20px', gap: '8px', fontSize: '0.88rem' }}
        >
          <Plus size={18} />
          <span>Add Product</span>
        </button>
      </div>
    </header>
  );
};

export default InventoryHeader;
