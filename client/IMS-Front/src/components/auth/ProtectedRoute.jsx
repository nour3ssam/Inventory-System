import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Belt-and-suspenders: also check localStorage directly so a hard refresh
  // never redirects before the Redux store hydrates from persisted state.
  const hasToken = isAuthenticated || !!localStorage.getItem('token');

  if (!hasToken) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  // Support both wrapper-component usage (<ProtectedRoute><Page /></ProtectedRoute>)
  // and nested-route usage (children-less, renders <Outlet />).
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
