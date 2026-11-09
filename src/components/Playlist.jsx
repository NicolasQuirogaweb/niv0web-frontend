import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams, Link } from "react-router-dom";
import { playlistServices } from "../services/api";
import { usePublicResource } from "../hooks/usePublicResource";
import { PageHeader } from "./common/PageHeader";
import { TrackList, PlayAllButton } from "./common/TrackList";
import { usePlaylistPlayer } from "../hooks/usePlaylistPlayer";
import { PageBackground } from "./common/PageBackground";
import { catalogBackground } from "../content/backgrounds";
import { SEO } from "./common/SEO";
import { LoadError } from "./common/LoadError";
import { useConsoleNav } from "../hooks/useConsoleNav";
import "./Playlist.css";

// Sirve para /beats/playlist/:id y /loops/playlist/:id. La respuesta trae los
// items bajo la misma key que el tipo ("beats" o "loops").
export const Playlist = () => {
  const { t } = useTranslation();
  const { resourceType, playlistId } = useParams();
  useConsoleNav({ back: `/${resourceType}` });
  const service = playlistServices[resourceType];
  const { data: playlistData, loading, error, run, setLoading } = usePublicResource();

  const load = useCallback(() => run(service.getById(playlistId)), [service, playlistId, run]);

  useEffect(() => {
    if (!service) {
      setLoading(false);
      return;
    }
    load();
  }, [service, load, setLoading]);

  const tracks = playlistData?.[resourceType] || [];
  // En beats y loops, al terminar un tema pasa al siguiente (como un álbum).
  const player = usePlaylistPlayer(tracks, {
    autoAdvance: true,
    meta: { album: playlistData?.title, artwork: playlistData?.imageUrl },
  });

  if (!service) return <p>{t("notFound.title")}</p>;

  return (
    <>
      <SEO title={playlistData?.title} description={t("playlist.seoDesc")} />
      <PageBackground media={catalogBackground(playlistData?.backgroundVideo)} />
      <div className="playlist-page">
        <PageHeader className="playlist-header" titleAs="h2" />
        {loading ? (
          <p>{t("playlist.loading")}</p>
        ) : error ? (
          <LoadError error={error} onRetry={load} />
        ) : playlistData ? (
          <div className="playlist-content">
            <div className="playlist-info-row">
              {playlistData.imageUrl && (
                <img src={playlistData.imageUrl} alt={playlistData.title} className="playlist-image" loading="lazy" />
              )}
              <div className="playlist-info">
                <div className="playlist-title-row">
                  <PlayAllButton player={player} disabled={tracks.length === 0} />
                  <h1 className="playlist-title">{playlistData.title}</h1>
                </div>
                <p className="playlist-description">{playlistData.description}</p>
              </div>
            </div>
            {tracks.length > 0 ? (
              <TrackList tracks={tracks} player={player} fallbackName={resourceType === "loops" ? "loop" : "beat"} showArtist allowDownload={resourceType !== "beats"} />
            ) : (
              <p>{t("playlist.none")}</p>
            )}
            {resourceType !== "beats" && <p className="free-license">{t("playlist.freeLicense")}</p>}
            {resourceType === "beats" && <p className="free-license free-license--note">{t("playlist.beatsLicenseNote")}</p>}
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
