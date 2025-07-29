// PreAuthRoute.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";

const PreAuthRoute = () => {
  const location = useLocation();
  const preAuthOK = sessionStorage.getItem("preAuthOK") === "true";
  const token = localStorage.getItem("token"); // or use your useAuth() hook

  // If already logged in, skip OTP flow entirely
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!preAuthOK) {
    return <Navigate to="/admin-login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default PreAuthRoute;
