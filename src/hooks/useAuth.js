import { useCallback, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/api";

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const useLogout = (redirectTo = "/") => {
  const { clearAuth } = useAuth();
  const navigate = useNavigate();
  return useCallback(async () => {
    await authService.logout().catch(() => {});
    clearAuth();
    navigate(redirectTo, { replace: true });
  }, [clearAuth, navigate, redirectTo]);
};

export const useRequireAuth = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  if (!loading && !isAuthenticated) {
    navigate("/", { replace: true });
  }

  return { isAuthenticated, loading };
};
