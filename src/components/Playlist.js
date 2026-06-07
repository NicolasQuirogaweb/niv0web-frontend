import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams, Link, useNavigate } from "react-router-dom";
import { authService, beatsService } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { LanguageSwitcher } from "./common/LanguageSwitcher";
import { AudioPlayer } from "./common/AudioPlayer";
import { downloadFile } from "../utils/download";
import { SEO } from "./common/SEO";
import "./Playlist.css";
import "./common/AudioPlayer.css";

export const Playlist = () => {
  const { t } = useTranslation();
  const { resourceType, playlistId } = useParams();
  const navigate = useNavigate();
  const { clearAuth } = useAuth();

  const handleLogout = async () => {
    await authService.logout().catch(() => {});
    clearAuth();
    navigate("/", { replace: true });
  };
  const [playlistData, setPlaylistData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [playingSrc, setPlayingSrc] = useState(null);

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const res = await beatsService.getById(playlistId);
        setPlaylistData(res.data);
      } catch (err) {
        setError(err.message || t("playlist.errorFallback"));
      } finally {
        setLoading(false);
      }
    };
    fetchPlaylist();
  }, [playlistId, t]);

  if (error) return <p>{t("playlist.error")}{error}</p>;

  return (
    <>
      <SEO description={t("playlist.seoDesc")} />
      {playlistData?.backgroundVideo ? (
        <video className="background-video" autoPlay loop muted playsInline>
          <source src={playlistData.backgroundVideo} type="video/mp4" />
        </video>
      ) : (
        <div className="background-fallback" />
      )}
    <div className="playlist-page">
      <div className="playlist-header">
        <h2><Link to="/homelogued">{t("nav.niv0Beats")}</Link></h2>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <LanguageSwitcher />
          <button onClick={handleLogout} style={{ background: "none", border: "none", color: "#bbf0be", cursor: "pointer", fontSize: 14, fontFamily: "monospace" }}>{t("nav.logOut")}</button>
        </div>
      </div>
      {loading ? (
        <p>{t("playlist.loading")}</p>
      ) : playlistData ? (
        <div className="playlist-content">
          <div className="playlist-info-row">
            {playlistData.imageUrl && (
              <img
                src={playlistData.imageUrl}
                alt={playlistData.title}
                className="playlist-image"
                loading="lazy"
              />
            )}
            <div className="playlist-info">
              <h1 className="playlist-title">{playlistData.title}</h1>
              <p className="playlist-description">{playlistData.description}</p>
            </div>
          </div>
          {playlistData.beats && playlistData.beats.length > 0 ? (
            <div className="beat-list">
              {playlistData.beats.map((beat) => (
                <div key={beat._id} className="beat-card">
                  <div className="beat-card-left">
                    <span className="beat-number">{playlistData.beats.indexOf(beat) + 1}</span>
                    <div className="beat-card-info">
                      <p className="beat-title">{beat.title}</p>
                      {beat.artist && <p className="beat-artist">{beat.artist}</p>}
                    </div>
                  </div>
                  <div className="beat-card-right">
                    {beat.audioFile && (
                      <AudioPlayer src={beat.audioFile} onPlay={setPlayingSrc} playingId={playingSrc} />
                    )}
                    {beat.audioFile && (
                      <button onClick={() => downloadFile(beat.audioFile, (beat.title || "beat") + ".mp3")} className="btn-download" aria-label={t("playlist.download")}>
                        <img src="/images/icons/download-solid.svg" alt="" className="download-icon" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>{t("playlist.none")}</p>
          )}
          <p className="free-license">{t("playlist.freeLicense")}</p>
        </div>
      ) : null}
      <div className="back-button">
        <Link to={`/${resourceType}`}><button className="back-to-catalogue-btn" aria-label={t("nav.backToCatalogue")}>{t("nav.backToCatalogue")}</button></Link>
      </div>
    </div>
    </>
  );
};