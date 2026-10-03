import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AudioPlayer, Spinner } from "./AudioPlayer";
import { downloadTrack } from "../../utils/download";
import "./AudioPlayer.css";

const NowPlaying = () => (
  <span className="eq" aria-hidden="true">
    <span />
    <span />
    <span />
  </span>
);

// Cuánto queda el ✓ después de arrancar una descarga (y el botón bloqueado).
const STARTED_FEEDBACK_MS = 2500;

const DownloadIcon = ({ state }) => {
  if (state === "preparing") return <Spinner size={16} />;
  if (state === "started") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="5 12 10 17 19 7" />
      </svg>
    );
  }
  return <img src="/images/icons/download-solid.svg" alt="" className="download-icon" />;
};

// Lista de pistas dentro de una caja con scroll propio. El estado de
// reproducción llega de usePlaylistPlayer (lo crea la página), así la página
// puede poner el botón de "play general" al lado del título.
export const TrackList = ({ tracks, player, fallbackName = "track", showArtist = false }) => {
  const { t } = useTranslation();
  // { [trackId]: "preparing" | "started" | "error" }
  const [downloads, setDownloads] = useState({});
  const busy = useRef(new Set());
  const timers = useRef([]);
  const rowRefs = useRef([]);
  const { currentIndex, isPlaying, isLoading, currentTime, duration, toggleTrack, seek } = player;

  // Cuando pasa solo al tema siguiente, que se vea dentro de la caja.
  useEffect(() => {
    if (currentIndex === null) return;
    rowRefs.current[currentIndex]?.scrollIntoView?.({ block: "nearest", behavior: "smooth" });
  }, [currentIndex]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const setDownloadState = (id, state) => setDownloads((prev) => ({ ...prev, [id]: state }));

  const handleDownload = async (track) => {
    // Un toque = una descarga, aunque se toque 20 veces seguidas.
    if (busy.current.has(track._id)) return;
    busy.current.add(track._id);
    setDownloadState(track._id, "preparing");
    try {
      await downloadTrack(track, fallbackName);
      setDownloadState(track._id, "started");
    } catch (err) {
      setDownloadState(track._id, err?.response?.data?.code === "LICENSE_REQUIRED" ? "licensed" : "error");
    }
    timers.current.push(
      setTimeout(() => {
        busy.current.delete(track._id);
        setDownloads((prev) => (prev[track._id] === "started" ? { ...prev, [track._id]: undefined } : prev));
      }, STARTED_FEEDBACK_MS)
    );
  };

  const downloadLabel = (state, title) => {
    if (state === "preparing") return t("playlist.preparingDownload");
    if (state === "started") return t("playlist.downloadStarted");
    return `${t("playlist.download")} ${title}`;
  };

  return (
    <div className="track-box">
      <ol className="beat-list">
        {tracks.map((track, i) => {
          const active = i === currentIndex;
          const state = downloads[track._id];
          return (
            <li
              key={track._id}
              ref={(el) => (rowRefs.current[i] = el)}
              className={`beat-card${active ? " beat-card--active" : ""}`}
              aria-current={active ? "true" : undefined}
            >
              <div className="beat-card-left">
                <span className="beat-number">
                  {active && isPlaying && !isLoading ? <NowPlaying /> : i + 1}
                  {active && <span className="sr-only">{t("player.nowPlaying")}</span>}
                </span>
                <div className="beat-card-info">
                  <p className="beat-title">{track.title}</p>
                  {showArtist && track.artist && <p className="beat-artist">{track.artist}</p>}
                  {(state === "error" || state === "licensed") && (
                    <p role="alert" className="beat-artist" style={{ color: "#ef9a9a" }}>
                      {t(state === "licensed" ? "playlist.licenseRequired" : "playlist.downloadError")}
                    </p>
                  )}
                </div>
              </div>
              {track.audioFile && (
                <div className="beat-card-right">
                  <AudioPlayer
                    isActive={active}
                    isPlaying={isPlaying}
                    isLoading={isLoading}
                    currentTime={currentTime}
                    duration={duration}
                    onToggle={() => toggleTrack(i)}
                    onSeek={seek}
                  />
                  <button
                    type="button"
                    onClick={() => handleDownload(track)}
                    className={`btn-download${state === "started" ? " btn-download--done" : ""}`}
                    disabled={state === "preparing" || state === "started"}
                    aria-busy={state === "preparing" || undefined}
                    aria-label={downloadLabel(state, track.title)}
                    title={downloadLabel(state, track.title)}
                  >
                    <DownloadIcon state={state} />
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
  const { isPlaying, isLoading } = player;
  return (
    <button
      type="button"
      className="play-all-btn"
      onClick={player.togglePlayAll}
      disabled={disabled}
      aria-busy={isLoading || undefined}
      aria-label={isLoading ? t("player.loading") : isPlaying ? t("player.pauseAll") : t("player.playAll")}
    >
      {isLoading ? (
        <Spinner size={22} />
      ) : isPlaying ? (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
      ) : (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="8,5 19,12 8,19"/></svg>
      )}
    </button>
  );
};
