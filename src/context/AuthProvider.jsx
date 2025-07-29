import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { AuthContext } from "./AuthContext";
import { fetchAdmin, logoutAdmin } from "../services/api";

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const data = await fetchAdmin();
        setAdmin({ email: data.email });
      } catch (err) {
        setAdmin(null);
        Cookies.remove("token");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const login = (email, token) => {
    setAdmin({ email });
    Cookies.set("token", token, { expires: 1 });
  };

  const logout = async () => {
    try {
      await logoutAdmin();
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setAdmin(null);
      Cookies.remove("token");
    }
  };

  return (
    <AuthContext.Provider value={{ admin, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
