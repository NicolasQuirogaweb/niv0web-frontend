import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { beatsService } from "../services/api";
import { usePublicResource } from "../hooks/usePublicResource";
import { CatalogConsole } from "./common/CatalogConsole";
import { PageHeader } from "./common/PageHeader";
import { LicenseCards } from "./common/LicenseCards";
import { SEO } from "./common/SEO";
import { useConsoleNav } from "../hooks/useConsoleNav";
import "./Beats.css";
import { PageBackground } from "./common/PageBackground";
import { PAGE_BACKGROUNDS } from "../content/backgrounds";

// Disposición elegida por niv0: encabezado, catálogos y al final las licencias
// ("primero escuchás, después ves cómo comprar").
export const Beats = () => {
  const { t } = useTranslation();
  const { data, loading, error, run } = usePublicResource();
  const playlists = data || [];
  useConsoleNav({ back: "/homelogued" });

  useEffect(() => {
    run(beatsService.getAll());
  }, [run]);

  return (
    <>
      <SEO title={t("beats.seoTitle")} description={t("beats.seoDesc")} />
      <PageBackground media={PAGE_BACKGROUNDS.beats} />
      <section className="beats-section">
        <PageHeader className="beats-info" />

        <header className="beats-hero">
          <h1>{t("beatsPage.title")}</h1>
          <p>{t("beatsPage.subtitle")}</p>
        </header>

        <section className="beats-block" aria-labelledby="beats-catalogs-title">
          <h2 id="beats-catalogs-title" className="beats-block-title">{t("beatsPage.catalogs")}</h2>
          {loading ? (
            <p>{t("beats.loading")}</p>
          ) : error ? (
            <p role="alert">{t("playlist.error")}{error.message || t("playlist.errorFallback")}</p>
          ) : playlists.length === 0 ? (
            <p>{t("beats.none")}</p>
          ) : (
            <CatalogConsole items={playlists} resourceType="beats" />
          )}
        </section>

        <section className="beats-block" aria-labelledby="beats-licenses-title">
          <h2 id="beats-licenses-title" className="beats-block-title">{t("licenses.title")}</h2>
          <p className="beats-block-subtitle">{t("licenses.subtitle")}</p>
          <LicenseCards />
        </section>

        <div className="back-to-catalogue">
          <Link to="/homelogued" className="back-to-catalogue-btn">{t("nav.backToHome")}</Link>
        </div>
      </section>
    </>
  );
};
