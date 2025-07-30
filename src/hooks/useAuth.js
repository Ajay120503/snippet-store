import { useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";

export const useAuth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { admin, bootstrapped, login: ctxLogin, logout: ctxLogout } = useContext(AuthContext);

  const login = async (email, token) => {
    await Promise.resolve(ctxLogin?.(email, token));
    try { sessionStorage.removeItem("preAuthOK"); } catch {}
    const to = location.state?.from?.pathname || "/dashboard";
    navigate(to, { replace: true });
  };

  const logout = async () => {
    await Promise.resolve(ctxLogout?.());
    try { sessionStorage.removeItem("preAuthOK"); } catch {}
    navigate("/admin-login", { replace: true });
  };

  return { admin, bootstrapped, login, logout };
};
