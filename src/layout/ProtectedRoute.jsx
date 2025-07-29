import { Navigate, Outlet, useLocation } from "react-router-dom";

/**
 * Gate for /admin (OTP page). Only allow if step-1 (username/password)
 * has been completed in this session.
 */
const PreAuthRoute = () => {
  const location = useLocation();
  const preAuthOK = sessionStorage.getItem("preAuthOK") === "true";

  if (!preAuthOK) {
    // Not allowed: force them to Step 1
    return <Navigate to="/admin-login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default PreAuthRoute;
