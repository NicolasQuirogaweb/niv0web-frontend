import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth";

export const PrivateRoute = ({ children }) => {
  const { t } = useTranslation();
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <p>{t("loading")}</p>;
  if (!isAuthenticated) return <Navigate to="/home" replace />;

  return children;
};
