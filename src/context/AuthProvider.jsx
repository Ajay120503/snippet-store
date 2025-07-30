// src/context/AuthProvider.jsx
import { useEffect, useMemo, useState } from "react";
import { AuthContext } from "./AuthContext";
import { fetchAdmin, logoutAdmin } from "../services/api";

const TOKEN_KEY = "token";

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        // Axios interceptor will add Authorization from localStorage token
        const data = await fetchAdmin();      // <-- your server returns { email: "..." }
        if (data?.email) setAdmin({ email: data.email });
        else setAdmin(null);
      } catch {
        try { localStorage.removeItem(TOKEN_KEY); } catch {}
        setAdmin(null);
      } finally {
        setBootstrapped(true);                // <-- important so guards wait
      }
    };
    init();
  }, []);

  const login = async (email, token) => {
    if (token) {
      try { localStorage.setItem(TOKEN_KEY, token); } catch {}
    }
    try {
      const data = await fetchAdmin();       // expect { email }
      setAdmin(data?.email ? { email: data.email } : { email });
    } catch {
      setAdmin({ email });
    }
  };

  const logout = async () => {
    try { await logoutAdmin(); } catch {}
    try { localStorage.removeItem(TOKEN_KEY); } catch {}
    setAdmin(null);
  };

  const value = useMemo(
    () => ({ admin, bootstrapped, login, logout }),
    [admin, bootstrapped]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
