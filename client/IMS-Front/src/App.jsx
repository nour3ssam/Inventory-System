import { useState } from 'react';
import './App.css';
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";

import CinematicIntro from './components/ui/CinematicIntro';

import Navbar from './layouts/Navbar';
import Sidebar from './layouts/Sidebar';
import BackgroundCanvas from './components/ui/BackgroundCanvas';
import NotificationPanel from './components/ui/NotificationPanel';

import NotFound from "./pages/NotFound";
import Home from './pages/Home';
import Login from './pages/Login';
import Inventory from "./pages/Inventory";
import Categories from "./pages/Categories";
import Suppliers from "./pages/Suppliers";
import StockHistory from "./pages/StockHistory";
import Profile from "./pages/Profile";
import Analytics from "./pages/Analytics";
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const showLayout = location.pathname !== '/login';
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Show the cinematic intro only ONCE per browser-tab session.
  // sessionStorage persists across in-page navigations but resets on a new tab.
  const [showIntro, setShowIntro] = useState(() => !sessionStorage.getItem('introSeen'));

  const handleIntroComplete = () => {
    sessionStorage.setItem('introSeen', '1');
    setShowIntro(false);
    navigate('/login');
  };

  return (
    <div className="app-container">
      <BackgroundCanvas />

      {/* First-visit box animation — renders above everything */}
      {showIntro && (
        <CinematicIntro onComplete={handleIntroComplete} />
      )}
      {showLayout && (
        <Sidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {showLayout && isMobileSidebarOpen && (
        <div
          className="sidebar-mobile-overlay"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {showLayout && <NotificationPanel />}

      <div className={showLayout ? "main-content" : "auth-content"}>
        {showLayout && (
          <Navbar
            onMenuClick={() => setIsMobileSidebarOpen(true)}
          />
        )}
        <main className="page-body">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Home />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/suppliers" element={<Suppliers />} />
              <Route path="/stock-history" element={<StockHistory />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
