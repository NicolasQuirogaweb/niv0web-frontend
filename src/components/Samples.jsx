import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams, Link } from "react-router-dom";
import { samplePacksService } from "../services/api";
import { usePublicResource } from "../hooks/usePublicResource";
import { PageHeader } from "./common/PageHeader";
import { TrackList } from "./common/TrackList";
import { BackgroundMedia } from "./common/BackgroundMedia";
import { SEO } from "./common/SEO";
import "./Playlist.css";

export const Samples = () => {
  const { t } = useTranslation();
  const { samplepackId } = useParams();
  const { data: packData, loading, error, run, setLoading } = usePublicResource();

  useEffect(() => {
    if (!samplepackId) {
      setLoading(false);
      return;
    }
    run(samplePacksService.getSamples(samplepackId));
  }, [samplepackId, run, setLoading]);

  if (error) return <p>{t("samples.error")}{error.message || t("samples.errorFallback")}</p>;

  const samples = packData?.samples || [];

  return (
    <>
      <SEO title={packData?.title} description={t("samples.seoDesc")} />
      <BackgroundMedia src={packData?.backgroundVideo} />
      <div className="playlist-page">
        <PageHeader className="playlist-header" titleAs="h2" />
        {loading ? (
          <p>{t("samples.loading")}</p>
        ) : packData ? (
          <div className="playlist-content">
            <div className="playlist-info-row">
              {packData.imageUrl && (
                <img src={packData.imageUrl} alt={packData.title} className="playlist-image" loading="lazy" />
              )}
              <div className="playlist-info">
                <h1 className="playlist-title">{packData.title || t("samples.title")}</h1>
                {packData.description && <p className="playlist-description">{packData.description}</p>}
              </div>
            </div>
            {samples.length > 0 ? (
              <TrackList tracks={samples} fallbackName="sample" />
            ) : (
              <p>{t("samples.none")}</p>
            )}
          </div>
        ) : null}
        <div className="back-button">
          <Link to="/samplepacks" className="back-to-catalogue-btn">
            {t("nav.backToPacksShort")}
          </Link>
        </div>
      </div>
    </>
  );
};
