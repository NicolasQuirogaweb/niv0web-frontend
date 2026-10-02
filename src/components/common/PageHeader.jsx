import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useLogout } from "../../hooks/useAuth";
import { LanguageSwitcher } from "./LanguageSwitcher";

const logoutButtonStyle = {
  background: "none",
  border: "none",
  color: "#bbf0be",
  cursor: "pointer",
  fontSize: 14,
  fontFamily: "monospace",
};

// Header de las páginas privadas: logo que vuelve al home, idioma y logout.
// Cada página mantiene su clase de wrapper porque el CSS de cada una la posiciona distinto.
export const PageHeader = ({ className, titleAs: Title = "h3", style }) => {
  const { t } = useTranslation();
  const handleLogout = useLogout();

  return (
    <div className={className} style={style}>
      <Title>
        <Link to="/homelogued">{t("nav.niv0Beats")}</Link>
      </Title>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <LanguageSwitcher />
        <button type="button" onClick={handleLogout} style={logoutButtonStyle}>
          {t("nav.logOut")}
        </button>
      </div>
    </div>
  );
};
