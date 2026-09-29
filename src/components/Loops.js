import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { loopsService } from "../services/api";
import { usePublicResource } from "../hooks/usePublicResource";
import { CardPlaylist } from "./CardPlaylist";
import { PageHeader } from "./common/PageHeader";
import { SEO } from "./common/SEO";
import "./Beats.css";

// Los loops se organizan en catálogos igual que los beats, así que la página
// es la misma grilla de cards apuntando a /loops/playlist/:id.
export const Loops = () => {
  const { t } = useTranslation();
  const { data, loading, error, run } = usePublicResource();
  const catalogs = data || [];

  useEffect(() => {
    run(loopsService.getAll());
  }, [run]);

  return (
    <>
      <SEO title={t("loops.seoTitle")} description={t("loops.seoDesc")} />
      <section className="beats-section">
        <PageHeader className="beats-info" />
        {loading ? (
          <p>{t("loops.loading")}</p>
        ) : error ? (
          <p role="alert">{t("loops.error")}{error.message || t("loops.errorFallback")}</p>
        ) : catalogs.length === 0 ? (
          <p>{t("loops.none")}</p>
        ) : (
          <div className="beats-list">
            {catalogs.map((catalog) => (
              <CardPlaylist key={catalog._id} playlist={catalog} resourceType="loops" />
            ))}
          </div>
        )}
        <div className="back-to-catalogue">
          <Link to="/homelogued" className="back-to-catalogue-btn">{t("nav.backToHome")}</Link>
        </div>
      </section>
    </>
  );
};
