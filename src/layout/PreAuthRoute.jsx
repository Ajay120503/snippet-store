// src/layout/PreAuthRoute.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const PreAuthRoute = () => {
  const location = useLocation();
  const { admin, bootstrapped } = useAuth();
  const preAuthOK = sessionStorage.getItem("preAuthOK") === "true";

  if (!bootstrapped) {
    return <div className="w-full h-dvh grid place-items-center">Checking session…</div>;
  }
  if (admin) return <Navigate to="/dashboard" replace />;
  if (!preAuthOK) {
    return <Navigate to="/admin-login" replace state={{ from: location }} />;
  }
  return <Outlet />;
};

export default PreAuthRoute;
