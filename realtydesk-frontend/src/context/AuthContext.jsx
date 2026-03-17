import { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../api/auth.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from stored token on mount
  useEffect(() => {
    const token = localStorage.getItem("realtydesk_token");
    if (!token) { setLoading(false); return; }
    authApi.me()
      .then(setUser)
      .catch(() => localStorage.removeItem("realtydesk_token"))
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const { token, user } = await authApi.login({ email, password });
    localStorage.setItem("realtydesk_token", token);
    setUser(user);
    return user;
  }

  async function register(email, password, full_name) {
    const { token, user } = await authApi.register({ email, password, full_name });
    localStorage.setItem("realtydesk_token", token);
    setUser(user);
    return user;
  }

  function logout() {
    localStorage.removeItem("realtydesk_token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
