import { useTranslation } from "react-i18next";

const baseStyle = {
  background: "none",
  color: "#888",
  padding: "4px 10px",
  borderRadius: 4,
  cursor: "pointer",
  fontSize: 11,
  fontFamily: "monospace",
  transition: "all 0.15s",
  borderWidth: 1,
  borderStyle: "solid",
};

const btnStyle = {
  ...baseStyle,
  borderColor: "#333",
};

const activeStyle = {
  ...baseStyle,
  color: "#fff",
  borderColor: "#7c6ff0",
  background: "rgba(124,111,240,0.15)",
};

export const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();

  const toggleLang = () => {
    const next = i18n.language === "es" ? "en" : "es";
    i18n.changeLanguage(next);
    localStorage.setItem("lang", next);
  };

  const label = i18n.language === "es" ? t("lang.switchTo") : t("lang.switchFrom");

  return (
    <button
      onClick={toggleLang}
      style={i18n.language === "en" ? activeStyle : btnStyle}
      title={label}
      aria-label={label}
    >
      {i18n.language === "es" ? "EN" : "ES"}
    </button>
  );
};
