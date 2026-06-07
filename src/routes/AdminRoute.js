import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth";

export const AdminRoute = ({ children }) => {
  const { t } = useTranslation();
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) return <p>{t("loading")}</p>;
  if (!isAuthenticated) return <Navigate to="/home" replace />;
  if (!isAdmin) return <Navigate to="/homelogued" replace />;

  return children;
};
