import { useCallback, useEffect, useRef, useState } from "react";

const hasMediaSession = () => typeof navigator !== "undefined" && "mediaSession" in navigator;

/**
 * Un solo <audio> para toda la lista. Antes cada fila tenía el suyo y no había
 * forma de encadenar temas; acá el estado vive en un lugar y la página decide
 * si al terminar un tema pasa al siguiente (`autoAdvance`).
 *
 * `meta` alimenta la Media Session: nombre del tema y del catálogo, y la tapa,
 * en la pantalla bloqueada y en la notificación del celular.
 */
export const usePlaylistPlayer = (tracks, { autoAdvance = false, meta = {} } = {}) => {
  const audioRef = useRef(null);
  const pendingPlay = useRef(false);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const current = currentIndex === null ? null : tracks[currentIndex];
  const isLast = currentIndex === tracks.length - 1;

  const startAt = useCallback((index) => {
    pendingPlay.current = true;
    setCurrentTime(0);
    setDuration(0);
    setCurrentIndex(index);
  }, []);

  // El src del <audio> cambia en el render; recién después se le puede dar play.
  useEffect(() => {
    if (!pendingPlay.current || !audioRef.current) return;
    pendingPlay.current = false;
    const result = audioRef.current.play();
    if (result?.catch) result.catch(() => setIsPlaying(false));
  }, [currentIndex]);

  const toggleTrack = useCallback((index) => {
    const el = audioRef.current;
    if (index !== currentIndex) return startAt(index);
    if (!el) return;
    if (el.paused) {
      const result = el.play();
      if (result?.catch) result.catch(() => setIsPlaying(false));
    } else {
      el.pause();
    }
  }, [currentIndex, startAt]);

  const togglePlayAll = useCallback(() => {
    if (tracks.length === 0) return;
    toggleTrack(currentIndex ?? 0);
  }, [tracks.length, currentIndex, toggleTrack]);

  const next = useCallback(() => {
    if (currentIndex !== null && currentIndex < tracks.length - 1) startAt(currentIndex + 1);
  }, [currentIndex, tracks.length, startAt]);

  const prev = useCallback(() => {
    const el = audioRef.current;
    // Como en cualquier reproductor: si ya avanzó unos segundos, vuelve al principio del tema.
    if (el && el.currentTime > 3) {
      el.currentTime = 0;
      return;
    }
    if (currentIndex > 0) startAt(currentIndex - 1);
  }, [currentIndex, startAt]);

  const seek = useCallback((seconds) => {
    const el = audioRef.current;
    if (!el || !duration) return;
    el.currentTime = Math.min(duration, Math.max(0, seconds));
  }, [duration]);

  const handleEnded = () => {
    if (autoAdvance && !isLast) {
      startAt(currentIndex + 1);
      return;
    }
    setIsPlaying(false);
    setCurrentTime(0);
  };

  // Media Session: título y controles en la pantalla bloqueada del celular.
  const handlers = useRef({});
  handlers.current = { toggle: () => togglePlayAll(), next, prev };

  useEffect(() => {
    if (!hasMediaSession() || !current) return;
    const { mediaSession } = navigator;
    if (typeof window.MediaMetadata === "function") {
      mediaSession.metadata = new window.MediaMetadata({
        title: current.title,
        artist: current.artist || meta.artist || "niv0",
        album: meta.album || "",
        artwork: meta.artwork ? [{ src: meta.artwork, sizes: "512x512" }] : [],
      });
    }
    const set = (action, fn) => {
      try {
        mediaSession.setActionHandler(action, fn);
      } catch {
        // Algunos navegadores no soportan todas las acciones.
      }
    };
    set("play", () => handlers.current.toggle());
    set("pause", () => handlers.current.toggle());
    set("nexttrack", autoAdvance ? () => handlers.current.next() : null);
    set("previoustrack", autoAdvance ? () => handlers.current.prev() : null);
  }, [current, autoAdvance, meta.artist, meta.album, meta.artwork]);

  useEffect(() => () => {
    if (!hasMediaSession()) return;
    navigator.mediaSession.metadata = null;
    ["play", "pause", "nexttrack", "previoustrack"].forEach((action) => {
      try {
        navigator.mediaSession.setActionHandler(action, null);
      } catch {
        // ver arriba
      }
    });
  }, []);

  const audioProps = {
    ref: audioRef,
    src: current?.audioFile || undefined,
    preload: "metadata",
    onPlay: () => setIsPlaying(true),
    onPause: () => setIsPlaying(false),
    onEnded: handleEnded,
    onTimeUpdate: (e) => setCurrentTime(e.currentTarget.currentTime || 0),
    onLoadedMetadata: (e) => setDuration(e.currentTarget.duration || 0),
  };

  return {
    currentIndex,
    isPlaying,
    currentTime,
    duration,
    toggleTrack,
    togglePlayAll,
    next,
    prev,
    seek,
    audioProps,
  };
};
