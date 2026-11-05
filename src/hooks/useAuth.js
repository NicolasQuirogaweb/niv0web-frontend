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

// El home que corresponde a quien mira. A diferencia de useAuth, funciona sin
// AuthProvider (páginas públicas como About): sin sesión, el home público.
export const useHomePath = () => {
  const context = useContext(AuthContext);
  return context?.isAuthenticated ? "/homelogued" : "/home";
};
