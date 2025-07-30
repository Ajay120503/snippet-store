import { createContext } from "react";
export const AuthContext = createContext({
  admin: null,
  bootstrapped: false,
  login: async () => {},
  logout: async () => {},
});

