// src/layout/ProtectedRoute.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth"; // use relative path if no alias

const ProtectedRoute = () => {
  const location = useLocation();
  const { admin, bootstrapped } = useAuth();

  if (!bootstrapped) {
    return <div className="w-full h-dvh grid place-items-center">Checking session…</div>;
  }
  if (!admin) {
    return <Navigate to="/admin-login" replace state={{ from: location }} />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
