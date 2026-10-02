import { useTranslation } from "react-i18next";

export const formatTime = (s) => {
  if (!s || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

// Solo controles: el <audio> vive en usePlaylistPlayer, uno por página.
// Una fila que no es la activa muestra la barra en 0 y no se puede mover.
export const AudioPlayer = ({ isActive, isPlaying, currentTime, duration, onToggle, onSeek }) => {
  const { t } = useTranslation();
  const playing = isActive && isPlaying;
  const time = isActive ? currentTime : 0;
  const total = isActive ? duration : 0;

  const handleSeek = (e) => {
    if (!total) return;
    const rect = e.currentTarget.getBoundingClientRect();
    onSeek(((e.clientX - rect.left) / rect.width) * total);
  };

  // Flechas para adelantar/atrasar 5s desde el teclado.
  const handleSeekKey = (e) => {
    const step = { ArrowRight: 5, ArrowUp: 5, ArrowLeft: -5, ArrowDown: -5 }[e.key];
    if (step === undefined || !total) return;
    e.preventDefault();
    onSeek(time + step);
  };

  return (
    <div className="audio-player">
      <button
        type="button"
        className={`audio-play-btn${playing ? " audio-play-btn--playing" : ""}`}
        onClick={onToggle}
        aria-label={playing ? t("player.pause") : t("player.play")}
      >
        {playing ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="8,5 19,12 8,19"/></svg>
        )}
      </button>
      <div
        className="audio-progress"
        onClick={handleSeek}
        onKeyDown={handleSeekKey}
        role="slider"
        tabIndex={isActive ? 0 : -1}
        aria-label={t("player.seek")}
        aria-disabled={!isActive}
        aria-valuemin={0}
        aria-valuemax={Math.round(total)}
        aria-valuenow={Math.round(time)}
        aria-valuetext={formatTime(time)}
      >
        <div className="audio-progress-track" />
        <div className="audio-progress-fill" style={{ width: `${total ? (time / total) * 100 : 0}%` }} />
      </div>
      <span className="audio-time">{formatTime(time)}</span>
    </div>
  );
};
