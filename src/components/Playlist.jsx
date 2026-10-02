import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams, Link } from "react-router-dom";
import { playlistServices } from "../services/api";
import { usePublicResource } from "../hooks/usePublicResource";
import { PageHeader } from "./common/PageHeader";
import { TrackList } from "./common/TrackList";
import { BackgroundMedia } from "./common/BackgroundMedia";
import { SEO } from "./common/SEO";
import "./Playlist.css";

// Sirve para /beats/playlist/:id y /loops/playlist/:id. La respuesta trae los
// items bajo la misma key que el tipo ("beats" o "loops").
export const Playlist = () => {
  const { t } = useTranslation();
  const { resourceType, playlistId } = useParams();
  const service = playlistServices[resourceType];
  const { data: playlistData, loading, error, run, setLoading } = usePublicResource();

  useEffect(() => {
    if (!service) {
      setLoading(false);
      return;
    }
    run(service.getById(playlistId));
  }, [service, playlistId, run, setLoading]);

  if (!service) return <p>{t("notFound.title")}</p>;
  if (error) return <p>{t("playlist.error")}{error.message || t("playlist.errorFallback")}</p>;

  const tracks = playlistData?.[resourceType] || [];

  return (
    <>
      <SEO title={playlistData?.title} description={t("playlist.seoDesc")} />
      <BackgroundMedia src={playlistData?.backgroundVideo} />
      <div className="playlist-page">
        <PageHeader className="playlist-header" titleAs="h2" />
        {loading ? (
          <p>{t("playlist.loading")}</p>
        ) : playlistData ? (
          <div className="playlist-content">
            <div className="playlist-info-row">
              {playlistData.imageUrl && (
                <img src={playlistData.imageUrl} alt={playlistData.title} className="playlist-image" loading="lazy" />
              )}
              <div className="playlist-info">
                <h1 className="playlist-title">{playlistData.title}</h1>
                <p className="playlist-description">{playlistData.description}</p>
              </div>
            </div>
            {tracks.length > 0 ? (
              <TrackList tracks={tracks} fallbackName={resourceType === "loops" ? "loop" : "beat"} showArtist />
            ) : (
              <p>{t("playlist.none")}</p>
            )}
            <p className="free-license">{t("playlist.freeLicense")}</p>
          </div>
        ) : null}
        <div className="back-button">
          <Link to={`/${resourceType}`} className="back-to-catalogue-btn">
            {t("nav.backToCatalogue")}
          </Link>
        </div>
      </div>
    </>
  );
};
