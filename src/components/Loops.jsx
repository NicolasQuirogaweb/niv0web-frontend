import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { loopsService } from "../services/api";
import { usePublicResource } from "../hooks/usePublicResource";
import { CatalogConsole } from "./common/CatalogConsole";
import { PageHeader } from "./common/PageHeader";
import { LoadError } from "./common/LoadError";
import { SEO } from "./common/SEO";
import { useConsoleNav } from "../hooks/useConsoleNav";
import "./Beats.css";
import { PageBackground } from "./common/PageBackground";
import { PAGE_BACKGROUNDS } from "../content/backgrounds";

// Los loops se organizan en catálogos igual que los beats, así que la página
// es la misma consola de catálogos apuntando a /loops/playlist/:id (ADR 0010).
export const Loops = () => {
  const { t } = useTranslation();
  const { data, loading, error, run } = usePublicResource();
  const catalogs = data || [];
  useConsoleNav({ back: "/homelogued" });

  useEffect(() => {
    run(loopsService.getAll());
  }, [run]);

  return (
    <>
      <SEO title={t("loops.seoTitle")} description={t("loops.seoDesc")} />
      <PageBackground media={PAGE_BACKGROUNDS.loops} />
      <section className="beats-section">
        <PageHeader className="beats-info" />
        {loading ? (
          <p>{t("loops.loading")}</p>
        ) : error ? (
          <LoadError error={error} onRetry={() => run(loopsService.getAll())} />
        ) : catalogs.length === 0 ? (
          <p>{t("loops.none")}</p>
        ) : (
          <CatalogConsole items={catalogs} resourceType="loops" />
        )}
        <div className="back-to-catalogue">
          <Link to="/homelogued" className="back-to-catalogue-btn">{t("nav.backToHome")}</Link>
        </div>
      </section>
    </>
  );
};
