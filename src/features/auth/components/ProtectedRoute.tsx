import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import "./ProtectedRoute.css";

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Still checking for existing session — don't redirect yet
  if (isLoading) {
    return <div className="protected-loading">Loading...</div>;
  }

  // Not logged in — redirect to login, preserving the intended URL
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Authenticated — render the child routes
  return <Outlet />;
}