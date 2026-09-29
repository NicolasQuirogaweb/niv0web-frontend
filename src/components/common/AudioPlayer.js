import { useRef, useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";

const formatTime = (s) => {
  if (!s || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

export const AudioPlayer = ({ src, onPlay, playingId }) => {
  const { t } = useTranslation();
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (playingId !== src && playing) {
      audioRef.current.pause();
      setPlaying(false);
    }
  }, [playingId, src, playing]);

  const togglePlay = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      el.pause();
      setPlaying(false);
    } else {
      onPlay?.(src);
      el.play().catch(() => {});
      setPlaying(true);
    }
  }, [playing, src, onPlay]);

  const handleSeek = (e) => {
    const el = audioRef.current;
    if (!el || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    el.currentTime = ratio * duration;
  };

  // Flechas para adelantar/atrasar 5s desde el teclado.
  const handleSeekKey = (e) => {
    const el = audioRef.current;
    if (!el || !duration) return;
    const step = { ArrowRight: 5, ArrowUp: 5, ArrowLeft: -5, ArrowDown: -5 }[e.key];
    if (step === undefined) return;
    e.preventDefault();
    el.currentTime = Math.min(duration, Math.max(0, el.currentTime + step));
  };

  return (
    <div className="audio-player">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onTimeUpdate={() => setCurrent(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={() => { setPlaying(false); setCurrent(0); }}
      />
      <button className="audio-play-btn" onClick={togglePlay} aria-label={playing ? t("player.pause") : t("player.play")}>
        {playing ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><polygon points="8,5 19,12 8,19"/></svg>
        )}
      </button>
      <div
        className="audio-progress"
        onClick={handleSeek}
        onKeyDown={handleSeekKey}
        role="slider"
        tabIndex={0}
        aria-label={t("player.seek")}
        aria-valuemin={0}
        aria-valuemax={Math.round(duration)}
        aria-valuenow={Math.round(current)}
        aria-valuetext={formatTime(current)}
      >
        <div className="audio-progress-track" />
        <div className="audio-progress-fill" style={{ width: `${duration ? (current / duration) * 100 : 0}%` }} />
      </div>
      <span className="audio-time">{formatTime(current)}</span>
    </div>
  );
};