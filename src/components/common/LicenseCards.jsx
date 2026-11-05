import { useTranslation } from "react-i18next";
import { LICENSES, licenseFeatures } from "../../content/licenses";
import { CONTACT_URL } from "../../content/contact";
import "./LicenseCards.css";

const formatArs = (amount) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(amount);

// Las tres licencias como tarjetas, con la exclusiva destacada.
// Hasta que existan los pagos, el botón abre el Instagram de niv0.
export const LicenseCards = () => {
  const { t } = useTranslation();

  return (
    <div className="license-cards">
      {LICENSES.map((license) => {
        const name = t(`licenses.${license.id}.name`);
        return (
          <article
            key={license.id}
            className={`license-card${license.featured ? " license-card--featured" : ""}`}
            aria-label={name}
            data-nav-item=""
            data-nav-press=".license-cta"
          >
            {license.featured && <span className="license-badge">{t("licenses.featured")}</span>}
            <h3 className="license-name">{name}</h3>
            <p className="license-price">{formatArs(license.priceArs)}</p>
            <p className="license-summary">{t(`licenses.${license.id}.summary`)}</p>
            <ul className="license-features">
              {licenseFeatures(license).map(([key, included]) => {
                return (
                  <li key={key} className={included ? "is-included" : "is-excluded"}>
                    <span className="license-mark" aria-hidden="true">{included ? "✓" : "✕"}</span>
                    <span data-included={String(included)}>{t(`licenses.features.${key}`)}</span>
                    <span className="sr-only">{included ? t("licenses.included") : t("licenses.notIncluded")}</span>
                  </li>
                );
              })}
            </ul>
            <a className="license-cta" href={CONTACT_URL} target="_blank" rel="noopener noreferrer">
              {t("licenses.contact")}
              <span className="sr-only"> — {name}</span>
            </a>
          </article>
        );
      })}
    </div>
  );
};
