import React, { useEffect } from 'react';
import { Menu, Boxes, Bell } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUnreadNotifications, togglePanel } from '../store/notificationSlice';

const Navbar = ({ onMenuClick }) => {
  const dispatch  = useDispatch();
  const { user }  = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notifications);

  /* Poll unread count every 60 s when logged in */
  useEffect(() => {
    if (!user) return;
    dispatch(fetchUnreadNotifications());
    const id = setInterval(() => dispatch(fetchUnreadNotifications()), 60_000);
    return () => clearInterval(id);
  }, [dispatch, user]);

  return (
    <nav className="mobile-navbar">
      {/* Mobile Hamburger menu */}
      <button className="nav-icon-button" onClick={onMenuClick} title="Open Navigation Menu">
        <Menu size={20} />
      </button>

      {/* Mobile Center Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Boxes size={22} color="var(--neon-orange)" />
        <span style={{ fontWeight: '800', fontSize: '1.1rem', letterSpacing: '0.5px', color: 'var(--text-pure-white)' }}>
          IMS CORE
        </span>
      </div>

      {/* Mobile Right — bell + avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Notification Bell */}
        <button
          className="nav-icon-button"
          title={`${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
          style={{ position: 'relative' }}
          onClick={() => dispatch(togglePanel())}
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-3px',
              right: '-3px',
              minWidth: '16px',
              height: '16px',
              borderRadius: '8px',
              background: 'var(--neon-orange)',
              color: '#000',
              fontSize: '0.65rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 3px',
              lineHeight: 1,
            }}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* Profile avatar */}
        <div className="profile-avatar" style={{ width: '32px', height: '32px', fontSize: '0.75rem' }}>
          {user?.username?.[0]?.toUpperCase() || user?.name?.[0]?.toUpperCase() || 'A'}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;