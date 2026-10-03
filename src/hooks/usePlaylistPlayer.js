import { useCallback, useEffect, useRef, useState } from "react";

const mediaSession = () =>
  typeof navigator !== "undefined" && "mediaSession" in navigator ? navigator.mediaSession : null;

const setAction = (action, handler) => {
  try {
    mediaSession()?.setActionHandler(action, handler);
  } catch {
    // Algunos navegadores no soportan todas las acciones (p. ej. seekto en iOS viejo).
  }
};

const SEEK_STEP = 10;

/**
 * Un solo <audio> por página, manejado de forma imperativa.
 *
 * Por qué imperativo: con la pantalla bloqueada, Chrome en Android solo deja
 * arrancar audio dentro del handler que disparó la acción (el botón "siguiente"
 * de la notificación, el fin de un tema). Si el cambio de tema pasara por un
 * re-render de React y un useEffect, el play() llegaría tarde, el audio quedaría
 * en pausa con un src nuevo y Chrome cerraría el reproductor de la notificación.
 * Por eso `loadAndPlay` cambia el src y llama a play() en el mismo tick, y el
 * estado de React solo se usa para dibujar la UI.
 *
 * `autoAdvance`: al terminar un tema pasa al siguiente (catálogos de beats/loops).
 * `meta`: nombre del catálogo y tapa para la Media Session.
 */
export const usePlaylistPlayer = (tracks, { autoAdvance = false, meta = {} } = {}) => {
  const audioRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Valores vivos para los handlers de la Media Session, que se registran una sola vez.
  const tracksRef = useRef(tracks);
  const optionsRef = useRef({ autoAdvance, meta });
  const indexRef = useRef(null);
  const switchingRef = useRef(false);
  const lastPositionUpdate = useRef(0);
  tracksRef.current = tracks;
  optionsRef.current = { autoAdvance, meta };

  const updatePositionState = useCallback(() => {
    const session = mediaSession();
    const el = audioRef.current;
    if (!session?.setPositionState || !el) return;
    const total = el.duration;
    if (!Number.isFinite(total) || total <= 0) return;
    try {
      session.setPositionState({
        duration: total,
        position: Math.min(Math.max(el.currentTime, 0), total),
        playbackRate: el.playbackRate || 1,
      });
    } catch {
      // Chrome tira si los valores son inconsistentes durante una carga; no es grave.
    }
  }, []);

  const setPlaybackState = (state) => {
    const session = mediaSession();
    if (session) session.playbackState = state;
  };

  const updateMetadata = (index) => {
    const session = mediaSession();
    const track = tracksRef.current[index];
    if (!session || !track || typeof window.MediaMetadata !== "function") return;
    const { meta: m } = optionsRef.current;
    session.metadata = new window.MediaMetadata({
      title: track.title,
      artist: track.artist || m.artist || "niv0",
      album: m.album || "",
      artwork: m.artwork ? [{ src: m.artwork, sizes: "512x512" }] : [],
    });
  };

  const stop = useCallback(() => {
    switchingRef.current = false;
    setIsPlaying(false);
    setPlaybackState("paused");
  }, []);

  // "Siguiente" solo existe si hay un tema después; "anterior" siempre (reinicia el tema).
  const updateTrackActions = (index) => {
    if (!optionsRef.current.autoAdvance) {
      setAction("nexttrack", null);
      setAction("previoustrack", null);
      return;
    }
    const hasNext = index < tracksRef.current.length - 1;
    setAction("nexttrack", hasNext ? () => loadAndPlayRef.current(index + 1) : null);
    setAction("previoustrack", () => previousRef.current());
  };

  const loadAndPlay = (index) => {
    const el = audioRef.current;
    const track = tracksRef.current[index];
    if (!el || !track?.audioFile) return;

    // Todo esto pasa en el mismo tick que el click / la acción de la notificación.
    switchingRef.current = true;
    indexRef.current = index;
    updateMetadata(index);
    el.src = track.audioFile;
    const attempt = el.play();
    if (attempt?.catch) {
      attempt.catch((err) => {
        // AbortError = otro cambio de tema le ganó a este; no es un fallo real.
        if (err?.name !== "AbortError") stop();
      });
    }

    setCurrentIndex(index);
    setCurrentTime(0);
    setDuration(0);
    updateTrackActions(index);
  };

  const previous = () => {
    const el = audioRef.current;
    const index = indexRef.current;
    if (index === null || !el) return;
    // Como en cualquier reproductor: pasados unos segundos, "anterior" reinicia el tema.
    if (el.currentTime > 3 || index === 0) {
      el.currentTime = 0;
      updatePositionState();
      return;
    }
    loadAndPlay(index - 1);
  };

  const loadAndPlayRef = useRef(loadAndPlay);
  const previousRef = useRef(previous);
  loadAndPlayRef.current = loadAndPlay;
  previousRef.current = previous;

  const resume = () => {
    const el = audioRef.current;
    if (!el) return;
    if (indexRef.current === null) {
      if (tracksRef.current.length > 0) loadAndPlayRef.current(0);
      return;
    }
    const attempt = el.play();
    if (attempt?.catch) attempt.catch(() => stop());
  };
  const resumeRef = useRef(resume);
  resumeRef.current = resume;

  const toggleTrack = useCallback((index) => {
    const el = audioRef.current;
    if (!el) return;
    if (index !== indexRef.current) {
      loadAndPlayRef.current(index);
    } else if (el.paused) {
      resumeRef.current();
    } else {
      el.pause();
    }
  }, []);

  const togglePlayAll = useCallback(() => {
    if (tracksRef.current.length === 0) return;
    toggleTrack(indexRef.current ?? 0);
  }, [toggleTrack]);

  const next = useCallback(() => {
    const index = indexRef.current;
    if (index !== null && index < tracksRef.current.length - 1) loadAndPlayRef.current(index + 1);
  }, []);

  const prev = useCallback(() => previousRef.current(), []);

  const seek = useCallback((seconds) => {
    const el = audioRef.current;
    if (!el || !Number.isFinite(el.duration)) return;
    el.currentTime = Math.min(el.duration, Math.max(0, seconds));
    setCurrentTime(el.currentTime);
    updatePositionState();
  }, [updatePositionState]);

  // Handlers de la notificación / pantalla bloqueada: se registran una vez y leen refs.
  useEffect(() => {
    if (!mediaSession()) return undefined;
    setAction("play", () => resumeRef.current());
    setAction("pause", () => audioRef.current?.pause());
    setAction("seekto", (details) => {
      if (typeof details?.seekTime === "number") seek(details.seekTime);
    });
    setAction("seekforward", (details) => {
      const el = audioRef.current;
      if (el) seek(el.currentTime + (details?.seekOffset || SEEK_STEP));
    });
    setAction("seekbackward", (details) => {
      const el = audioRef.current;
      if (el) seek(el.currentTime - (details?.seekOffset || SEEK_STEP));
    });

    const el = audioRef.current;
    return () => {
      el?.pause();
      if (el) {
        el.removeAttribute("src");
        el.load();
      }
      const session = mediaSession();
      if (!session) return;
      session.metadata = null;
      session.playbackState = "none";
      ["play", "pause", "seekto", "seekforward", "seekbackward", "nexttrack", "previoustrack"].forEach((action) =>
        setAction(action, null)
      );
    };
  }, [seek]);

  // Si la página cambia de catálogo sin desmontarse, el tema viejo ya no pertenece a esta lista.
  const tracksKey = tracks.map((t) => t._id).join("|");
  useEffect(() => {
    const index = indexRef.current;
    if (index === null) return;
    const el = audioRef.current;
    const stillHere = tracksRef.current[index]?.audioFile && el?.src === tracksRef.current[index].audioFile;
    if (stillHere) return;
    el?.pause();
    el?.removeAttribute("src");
    indexRef.current = null;
    setCurrentIndex(null);
    setCurrentTime(0);
    setDuration(0);
    stop();
  }, [tracksKey, stop]);

  const audioProps = {
    ref: audioRef,
    preload: "metadata",
    onPlay: () => setIsPlaying(true),
    onPlaying: () => {
      switchingRef.current = false;
      setIsPlaying(true);
      setPlaybackState("playing");
      updatePositionState();
    },
    onPause: (e) => {
      // Cambiar el src pausa el audio un instante, y el navegador también dispara
      // "pause" justo antes de "ended". Ninguna de las dos es una pausa del usuario:
      // si avisáramos "paused" a la Media Session, Android podría cerrar la notificación.
      if (switchingRef.current || e.currentTarget.ended) return;
      setIsPlaying(false);
      setPlaybackState("paused");
      updatePositionState();
    },
    onEnded: () => {
      const index = indexRef.current;
      if (optionsRef.current.autoAdvance && index !== null && index < tracksRef.current.length - 1) {
        loadAndPlayRef.current(index + 1);
        return;
      }
      setCurrentTime(0);
      stop();
    },
    onError: () => {
      // Un archivo que no carga (borrado en B2, sin red) no tiene que cortar la playlist.
      const index = indexRef.current;
      if (index === null || !audioRef.current?.getAttribute("src")) return;
      if (optionsRef.current.autoAdvance && index < tracksRef.current.length - 1) {
        loadAndPlayRef.current(index + 1);
        return;
      }
      stop();
    },
    onTimeUpdate: (e) => {
      setCurrentTime(e.currentTarget.currentTime || 0);
      const now = Date.now();
      if (now - lastPositionUpdate.current > 1000) {
        lastPositionUpdate.current = now;
        updatePositionState();
      }
    },
    onLoadedMetadata: (e) => {
      setDuration(e.currentTarget.duration || 0);
      updatePositionState();
    },
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
