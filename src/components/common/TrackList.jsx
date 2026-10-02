import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AudioPlayer } from "./AudioPlayer";
import { downloadFile } from "../../utils/download";
import "./AudioPlayer.css";

const NowPlaying = () => (
  <span className="eq" aria-hidden="true">
    <span />
    <span />
    <span />
  </span>
);

// Lista de pistas dentro de una caja con scroll propio. El estado de
// reproducción llega de usePlaylistPlayer (lo crea la página), así la página
// puede poner el botón de "play general" al lado del título.
export const TrackList = ({ tracks, player, fallbackName = "track", showArtist = false }) => {
  const { t } = useTranslation();
  const [failedId, setFailedId] = useState(null);
  const rowRefs = useRef([]);
  const { currentIndex, isPlaying, currentTime, duration, toggleTrack, seek, audioProps } = player;

  // Cuando pasa solo al tema siguiente, que se vea dentro de la caja.
  useEffect(() => {
    if (currentIndex === null) return;
    rowRefs.current[currentIndex]?.scrollIntoView?.({ block: "nearest", behavior: "smooth" });
  }, [currentIndex]);

  const handleDownload = async (track) => {
    setFailedId(null);
    try {
      await downloadFile(track.audioFile, `${track.title || fallbackName}.mp3`);
    } catch {
      setFailedId(track._id);
    }
  };

  return (
    <div className="track-box">
      <audio {...audioProps} />
      <ol className="beat-list">
        {tracks.map((track, i) => {
          const active = i === currentIndex;
          return (
            <li
              key={track._id}
              ref={(el) => (rowRefs.current[i] = el)}
              className={`beat-card${active ? " beat-card--active" : ""}`}
              aria-current={active ? "true" : undefined}
            >
              <div className="beat-card-left">
                <span className="beat-number">
                  {active && isPlaying ? <NowPlaying /> : i + 1}
                  {active && <span className="sr-only">{t("player.nowPlaying")}</span>}
                </span>
                <div className="beat-card-info">
                  <p className="beat-title">{track.title}</p>
                  {showArtist && track.artist && <p className="beat-artist">{track.artist}</p>}
                  {failedId === track._id && (
                    <p role="alert" className="beat-artist" style={{ color: "#ef9a9a" }}>
                      {t("playlist.downloadError")}
                    </p>
                  )}
                </div>
              </div>
              {track.audioFile && (
                <div className="beat-card-right">
                  <AudioPlayer
                    isActive={active}
                    isPlaying={isPlaying}
                    currentTime={currentTime}
                    duration={duration}
                    onToggle={() => toggleTrack(i)}
                    onSeek={seek}
                  />
                  <button
                    type="button"
                    onClick={() => handleDownload(track)}
                    className="btn-download"
                    aria-label={`${t("playlist.download")} ${track.title}`}
                  >
                    <img src="/images/icons/download-solid.svg" alt="" className="download-icon" />
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
};

// Botón grande de play del catálogo, como el de los álbumes en Spotify.
export const PlayAllButton = ({ player, disabled }) => {
  const { t } = useTranslation();
  const playing = player.isPlaying;
  return (
    <button
      type="button"
      className="play-all-btn"
      onClick={player.togglePlayAll}
      disabled={disabled}
      aria-label={playing ? t("player.pauseAll") : t("player.playAll")}
    >
      {playing ? (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
      ) : (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="8,5 19,12 8,19"/></svg>
      )}
    </button>
  );
};
