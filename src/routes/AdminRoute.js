import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) return <p>Cargando...</p>;
  if (!isAuthenticated) return <Navigate to="/home" replace />;
  if (!isAdmin) return <Navigate to="/homelogued" replace />;

  return children;
};
