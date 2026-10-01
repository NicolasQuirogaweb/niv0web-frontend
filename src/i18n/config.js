import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import es from "./es.json";
import en from "./en.json";

const savedLang = localStorage.getItem("lang") || "es";

i18n.use(initReactI18next).init({
  resources: { es: { translation: es }, en: { translation: en } },
  lng: savedLang,
  fallbackLng: "es",
  interpolation: { escapeValue: false },
});

// Lectores de pantalla y el traductor del browser usan <html lang>.
const syncHtmlLang = (lng) => document.documentElement.setAttribute("lang", lng);
syncHtmlLang(i18n.language);
i18n.on("languageChanged", syncHtmlLang);

export default i18n;
