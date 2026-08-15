import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams, Link } from "react-router-dom";
import { samplePacksService } from "../services/api";
import { useLogout } from "../hooks/useAuth";
import { usePublicResource } from "../hooks/usePublicResource";
import { LanguageSwitcher } from "./common/LanguageSwitcher";
import { AudioPlayer } from "./common/AudioPlayer";
import { BackgroundMedia } from "./common/BackgroundMedia";
import { downloadFile } from "../utils/download";
import { SEO } from "./common/SEO";
import "./Playlist.css";
import "./common/AudioPlayer.css";

export const Samples = () => {
  const { t } = useTranslation();
  const { samplepackId } = useParams();
  const handleLogout = useLogout();
  const { data: packData, loading, error, run, setLoading } = usePublicResource();
  const [playingSrc, setPlayingSrc] = useState(null);

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
      <SEO description={t("samples.seoDesc")} />
      <BackgroundMedia src={packData?.backgroundVideo} />
    <div className="playlist-page">
      <div className="playlist-header">
        <h2><Link to="/homelogued">{t("nav.niv0Beats")}</Link></h2>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <LanguageSwitcher />
          <button onClick={handleLogout} style={{ background: "none", border: "none", color: "#bbf0be", cursor: "pointer", fontSize: 14, fontFamily: "monospace" }}>{t("nav.logOut")}</button>
        </div>
      </div>
      {loading ? (
        <p>{t("samples.loading")}</p>
      ) : packData ? (
        <div className="playlist-content">
          <div className="playlist-info-row">
            {packData.imageUrl && (
              <img
                src={packData.imageUrl}
                alt={packData.title}
                className="playlist-image"
                loading="lazy"
              />
            )}
            <div className="playlist-info">
              <h1 className="playlist-title">{packData.title || t("samples.title")}</h1>
              {packData.description && <p className="playlist-description">{packData.description}</p>}
            </div>
          </div>
          {samples.length > 0 ? (
            <div className="beat-list">
              {samples.map((sample, i) => (
                <div key={sample._id} className="beat-card">
                  <div className="beat-card-left">
                    <span className="beat-number">{i + 1}</span>
                    <div className="beat-card-info">
                      <p className="beat-title">{sample.title}</p>
                    </div>
                  </div>
                  <div className="beat-card-right">
                    {sample.audioFile && (
                      <AudioPlayer src={sample.audioFile} onPlay={setPlayingSrc} playingId={playingSrc} />
                    )}
                    {sample.audioFile && (
                      <button onClick={() => downloadFile(sample.audioFile, (sample.title || "sample") + ".mp3")} className="btn-download" aria-label={t("playlist.download")}>
                        <img src="/images/icons/download-solid.svg" alt="" className="download-icon" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>{t("samples.none")}</p>
          )}
        </div>
      ) : null}
      <div className="back-button">
        <Link to="/samplepacks"><button className="back-to-catalogue-btn" aria-label={t("nav.backToPacksShort")}>{t("nav.backToPacksShort")}</button></Link>
      </div>
    </div>
    </>
  );
};