import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { X, Check, Trash2, Bell, AlertTriangle, Info, PackageX, PackageMinus } from 'lucide-react';
import { 
  closePanel, 
  fetchNotifications, 
  markNotificationRead, 
  markAllNotificationsRead, 
  deleteNotification 
} from '../../store/notificationSlice';
import '../../styles/components/NotificationPanel.css';

const NotificationPanel = () => {
  const dispatch = useDispatch();
  const { items, isPanelOpen, loading, unreadCount } = useSelector((state) => state.notifications);

  // Fetch notifications when the panel opens
  useEffect(() => {
    if (isPanelOpen) {
      dispatch(fetchNotifications());
    }
  }, [isPanelOpen, dispatch]);

  if (!isPanelOpen) return null;

  const handleClose = () => {
    dispatch(closePanel());
  };

  const handleMarkRead = (id) => {
    dispatch(markNotificationRead(id));
  };

  const handleMarkAllRead = () => {
    dispatch(markAllNotificationsRead());
  };

  const handleDelete = (id) => {
    dispatch(deleteNotification(id));
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'LowStock': return <PackageMinus size={18} className="icon-orange" />;
      case 'OutOfStock': return <PackageX size={18} className="icon-red" />;
      case 'OverStock': return <AlertTriangle size={18} className="icon-blue" />;
      case 'Expired': return <AlertTriangle size={18} className="icon-red" />;
      default: return <Info size={18} className="icon-blue" />;
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <>
      <div className="notification-overlay" onClick={handleClose}></div>
      <div className={`notification-panel ${isPanelOpen ? 'open' : ''}`}>
        
        {/* Header */}
        <div className="notification-header">
          <div className="header-title">
            <Bell size={20} />
            <h2>Notifications</h2>
            {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
          </div>
          <div className="header-actions">
            {unreadCount > 0 && (
              <button 
                className="mark-all-btn" 
                onClick={handleMarkAllRead}
                title="Mark all as read"
              >
                <Check size={16} /> Mark All Read
              </button>
            )}
            <button className="close-btn" onClick={handleClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="notification-body">
          {loading && items.length === 0 ? (
            <div className="notification-empty">Loading notifications...</div>
          ) : items.length === 0 ? (
            <div className="notification-empty">
              <Bell size={40} opacity={0.2} />
              <p>You have no notifications right now.</p>
            </div>
          ) : (
            <div className="notification-list">
              {items.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`notification-item ${!notif.isRead ? 'unread' : ''}`}
                >
                  <div className="notification-icon-wrapper">
                    {getIconForType(notif.type)}
                  </div>
                  
                  <div className="notification-content">
                    <div className="notification-title">
                      {notif.title}
                      <span className="notification-time">{formatTime(notif.createdAt)}</span>
                    </div>
                    <div className="notification-message">{notif.message}</div>
                    {notif.productName && (
                      <div className="notification-product">
                        Product: <span>{notif.productName}</span>
                      </div>
                    )}
                  </div>

                  <div className="notification-item-actions">
                    {!notif.isRead && (
                      <button 
                        className="action-btn text-blue" 
                        onClick={() => handleMarkRead(notif.id)}
                        title="Mark as Read"
                      >
                        <Check size={16} />
                      </button>
                    )}
                    <button 
                      className="action-btn text-red" 
                      onClick={() => handleDelete(notif.id)}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </>
  );
};

export default NotificationPanel;
