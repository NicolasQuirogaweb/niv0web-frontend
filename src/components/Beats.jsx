import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { beatsService } from "../services/api";
import { usePublicResource } from "../hooks/usePublicResource";
import { CardPlaylist } from "./CardPlaylist";
import { PageHeader } from "./common/PageHeader";
import { SEO } from "./common/SEO";
import "./Beats.css";

export const Beats = () => {
  const { t } = useTranslation();
  const { data, loading, error, run } = usePublicResource();
  const playlists = data || [];

  useEffect(() => {
    run(beatsService.getAll());
  }, [run]);

  return (
    <>
      <SEO title={t("beats.seoTitle")} description={t("beats.seoDesc")} />
      <section className="beats-section">
        <PageHeader className="beats-info" />
        {loading ? (
          <p>{t("beats.loading")}</p>
        ) : error ? (
          <p role="alert">{t("playlist.error")}{error.message || t("playlist.errorFallback")}</p>
        ) : playlists.length === 0 ? (
          <p>{t("beats.none")}</p>
        ) : (
          <div className="beats-list">
            {playlists.map((playlist) => (
              <CardPlaylist key={playlist._id} playlist={playlist} resourceType="beats" />
            ))}
          </div>
        )}
        <div className="beats-description">
          <h2>{t("beats.licenses")}</h2>
          <p>{t("beats.exclusiveStems")}</p>
          <p>{t("beats.exclusiveWav")}</p>
          <p>{t("beats.commonLease")}</p>
        </div>
        <div className="back-to-catalogue">
          <Link to="/homelogued" className="back-to-catalogue-btn">{t("nav.backToHome")}</Link>
        </div>
      </section>
    </>
  );
};
