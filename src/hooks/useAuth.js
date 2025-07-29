import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.js";

export const useAuth = () => {
  const navigate = useNavigate();
  const { admin, login: contextLogin, logout: contextLogout } = useContext(AuthContext);

  const login = (email, token) => {
    contextLogin(email, token);
    navigate("/dashboard", { replace: true });
  };

  const logout = () => {
    contextLogout();
    navigate("/admin", { replace: true });
  };

  return { admin, login, logout };
};
