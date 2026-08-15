import React, { createContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { authService, setUnauthorizedHandler } from "../services/api";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [userEmail, setUserEmail] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const saveAuth = (email, role) => {
    setUserEmail(email);
    setUserRole(role || "user");
  };

  const clearAuth = useCallback(() => {
    setUserEmail(null);
    setUserRole(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearAuth();
      navigate("/login", { replace: true });
    });
  }, [clearAuth, navigate]);

  useEffect(() => {
    authService
      .verifyToken()
      .then((res) => {
        setUserEmail(res.data.email);
        setUserRole(res.data.role || "user");
      })
      .catch(() => {
        clearAuth();
      })
      .finally(() => setLoading(false));
  }, [clearAuth]);

  const value = {
    userEmail,
    userRole,
    loading,
    isAuthenticated: !!userEmail,
    isAdmin: userRole === "admin",
    saveAuth,
    clearAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
