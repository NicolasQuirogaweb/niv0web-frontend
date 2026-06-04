import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const useRequireAuth = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  if (!loading && !isAuthenticated) {
    navigate("/", { replace: true });
  }

  return { isAuthenticated, loading };
};
