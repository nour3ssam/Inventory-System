import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { performLogout } from '../utils/session';
import {
  Boxes,
  LayoutDashboard,
  Package,
  FolderTree,
  Truck,
  Database,
  LogOut,
  X,
} from 'lucide-react';
import "../styles/layouts/Sidebar.css";

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Inventory', path: '/inventory', icon: Package },
  { name: 'Categories', path: '/categories', icon: FolderTree },
  { name: 'Suppliers', path: '/suppliers', icon: Truck },
  { name: 'Stock History', path: '/stock-history', icon: Database },
  // { name: 'Analytics', path: '/analytics', icon: BarChart3 },

  // { name: 'Reports', path: '/reports', icon: BarChart3 },
  // { name: 'Users', path: '/users', icon: Users },
  // { name: 'Settings', path: '/settings', icon: Settings },
];

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    await performLogout(dispatch);
    if (onClose) onClose();
    navigate('/login');
  };

  return (
    <aside className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
      {/* Logo / Branding */}
      <div className="sidebar-logo">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Boxes size={26} className="sidebar-logo-icon" />
          <span className="sidebar-logo-text">IMS CORE</span>
        </div>
        {/* Mobile close button */}
        <button className="sidebar-mobile-close" onClick={onClose} aria-label="Close sidebar">
          <X size={18} />
        </button>
      </div>

      {/* Navigation Link Items */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.name}
              to={item.path}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <div className="sidebar-icon-container">
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 2}
                  className="sidebar-icon"
                />
              </div>
              <span className="sidebar-text">
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Profile & Logout Info */}
      <div className="sidebar-footer">
        <Link to="/profile" onClick={onClose} style={{ textDecoration: 'none' }}>
          <div className="sidebar-profile">
            <div className="profile-avatar-wrapper">
              <div className="profile-avatar">
                {user?.username?.[0]?.toUpperCase() || user?.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="status-indicator"></div>
            </div>
            <div className="profile-details">
              <span className="profile-name">{user?.username || user?.name || 'Admin'}</span>
              <span className="profile-role">{user?.role || 'Administrator'}</span>
            </div>
          </div>
        </Link>

        <button onClick={handleLogout} className="logout-button" title="Logout">
          <LogOut size={20} className="logout-icon" />
          <span className="logout-text">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
