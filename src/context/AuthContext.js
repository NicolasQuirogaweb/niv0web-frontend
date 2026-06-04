import React, { createContext, useState, useEffect, useCallback } from "react";
import { authService } from "../services/api";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [userEmail, setUserEmail] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("authToken"));
  const [loading, setLoading] = useState(true);

  const saveAuth = (newToken, email, role) => {
    localStorage.setItem("authToken", newToken);
    localStorage.setItem("userEmail", email);
    localStorage.setItem("userRole", role || "user");
    setToken(newToken);
    setUserEmail(email);
    setUserRole(role || "user");
  };

  const clearAuth = useCallback(() => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    setToken(null);
    setUserEmail(null);
    setUserRole(null);
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    const storedEmail = localStorage.getItem("userEmail");
    const storedRole = localStorage.getItem("userRole");
    if (storedToken && storedEmail) {
      authService
        .verifyToken()
        .then((res) => {
          setUserEmail(res.data.email);
          const role = res.data.role || storedRole || "user";
          setUserRole(role);
          localStorage.setItem("userRole", role);
          setToken(storedToken);
        })
        .catch(() => {
          clearAuth();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [clearAuth]);

  const value = {
    userEmail,
    userRole,
    token,
    loading,
    isAuthenticated: !!token && !!userEmail,
    isAdmin: userRole === "admin",
    saveAuth,
    clearAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
