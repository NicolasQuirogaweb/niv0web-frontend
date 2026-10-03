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
const HAVE_FUTURE_DATA = 3;
const MEDIA_EVENTS = ["play", "playing", "pause", "waiting", "ended", "error", "timeupdate", "loadedmetadata"];

// Para escuchar se usa la versión MP3 liviana si existe; la descarga siempre usa el original.
const playbackSrc = (track, original = false) => (!original && track.previewFile) || track.audioFile;

/**
 * Reproductor de una lista de temas, con dos elementos <audio> fuera del DOM.
 *
 * - Cambio de tema síncrono: con la pantalla bloqueada, Chrome en Android solo
 *   deja arrancar audio dentro del handler que disparó la acción ("siguiente" en
 *   la notificación, el fin de un tema). `loadAndPlay` cambia el src y llama a
 *   play() en ese mismo tick; el estado de React solo dibuja la UI.
 * - Precarga: mientras suena un tema, el otro elemento ya va bajando el
 *   siguiente. Al pasar de tema se le da play a ese elemento, que arranca al
 *   instante en vez de abrir otra conexión y esperar buffer.
 * - Previews: si el tema tiene `previewFile` (MP3 de un WAV), se escucha ese; si
 *   falla, se reintenta con el original antes de saltarlo.
 *
 * `autoAdvance`: al terminar un tema pasa al siguiente (catálogos de beats/loops).
 * `meta`: nombre del catálogo y tapa para la Media Session.
 */
export const usePlaylistPlayer = (tracks, { autoAdvance = false, meta = {} } = {}) => {
  const [elements] = useState(() => [new Audio(), new Audio()]);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Valores vivos para listeners y handlers que se registran una sola vez.
  const tracksRef = useRef(tracks);
  const optionsRef = useRef({ autoAdvance, meta });
  const activeRef = useRef(0); // cuál de los dos elementos está sonando
  const indexRef = useRef(null);
  const preloadedRef = useRef(null); // índice cargado en el elemento de reserva
  const triedOriginalRef = useRef(false);
  const switchingRef = useRef(false);
  const lastPositionUpdate = useRef(0);
  tracksRef.current = tracks;
  optionsRef.current = { autoAdvance, meta };

  const active = () => elements[activeRef.current];
  const spare = () => elements[1 - activeRef.current];

  const updatePositionState = useCallback(() => {
    const session = mediaSession();
    const el = elements[activeRef.current];
    if (!session?.setPositionState) return;
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
  }, [elements]);

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

  const stop = () => {
    switchingRef.current = false;
    setIsPlaying(false);
    setIsLoading(false);
    setPlaybackState("paused");
  };

  const play = (el) => {
    const attempt = el.play();
    if (attempt?.catch) {
      attempt.catch((err) => {
        // AbortError = otro cambio de tema le ganó a este; no es un fallo real.
        if (err?.name !== "AbortError" && el === active()) stop();
      });
    }
  };

  // "Siguiente" solo existe si hay un tema después; "anterior" siempre (reinicia el tema).
  const updateTrackActions = (index) => {
    if (!optionsRef.current.autoAdvance) {
      setAction("nexttrack", null);
      setAction("previoustrack", null);
      return;
    }
    const hasNext = index < tracksRef.current.length - 1;
    setAction("nexttrack", hasNext ? () => actions.current.loadAndPlay(index + 1) : null);
    setAction("previoustrack", () => actions.current.previous());
  };

  // Deja el siguiente tema bajando en el elemento de reserva.
  const preloadNext = () => {
    if (!optionsRef.current.autoAdvance) return;
    const next = indexRef.current + 1;
    const track = tracksRef.current[next];
    if (!track || preloadedRef.current === next) return;
    const el = spare();
    el.preload = "auto";
    el.src = playbackSrc(track);
    el.load();
    preloadedRef.current = next;
  };

  const loadAndPlay = (index) => {
    const track = tracksRef.current[index];
    if (!track?.audioFile) return;

    // Todo esto pasa en el mismo tick que el click / la acción de la notificación.
    switchingRef.current = true;
    triedOriginalRef.current = false;
    indexRef.current = index;
    updateMetadata(index);

    const previous = active();
    let el;
    if (preloadedRef.current === index) {
      // El siguiente ya estaba bajando: se cambia de elemento y arranca al instante.
      activeRef.current = 1 - activeRef.current;
      el = active();
      previous.pause();
    } else {
      el = previous;
      el.src = playbackSrc(track);
    }
    preloadedRef.current = null;
    el.currentTime = 0;

    // El estado va antes del play(): si el navegador dispara "playing" enseguida,
    // no tiene que quedar pisado por un "cargando" viejo.
    setCurrentIndex(index);
    setCurrentTime(0);
    setDuration(Number.isFinite(el.duration) ? el.duration : 0);
    setIsLoading(el.readyState < HAVE_FUTURE_DATA);
    updateTrackActions(index);
    play(el);
  };

  const previous = () => {
    const el = active();
    const index = indexRef.current;
    if (index === null) return;
    // Como en cualquier reproductor: pasados unos segundos, "anterior" reinicia el tema.
    if (el.currentTime > 3 || index === 0) {
      el.currentTime = 0;
      updatePositionState();
      return;
    }
    loadAndPlay(index - 1);
  };

  const resume = () => {
    if (indexRef.current === null) {
      if (tracksRef.current.length > 0) loadAndPlay(0);
      return;
    }
    play(active());
  };

  const advanceOrStop = () => {
    const index = indexRef.current;
    if (optionsRef.current.autoAdvance && index !== null && index < tracksRef.current.length - 1) {
      loadAndPlay(index + 1);
      return;
    }
    setCurrentTime(0);
    stop();
  };

  // Eventos del elemento activo. El de reserva solo puede avisar que su precarga falló.
  const onMediaEvent = (e) => {
    const el = e.currentTarget;
    if (el !== active()) {
      if (e.type === "error") preloadedRef.current = null;
      return;
    }
    switch (e.type) {
      case "play":
        setIsPlaying(true);
        break;
      case "playing":
        switchingRef.current = false;
        setIsPlaying(true);
        setIsLoading(false);
        setPlaybackState("playing");
        updatePositionState();
        preloadNext();
        break;
      case "waiting":
        setIsLoading(true);
        break;
      case "pause":
        // Cambiar el src pausa el audio un instante, y el navegador también dispara
        // "pause" justo antes de "ended". Ninguna es una pausa del usuario: si
        // avisáramos "paused" a la Media Session, Android podría cerrar la notificación.
        if (switchingRef.current || el.ended) return;
        setIsPlaying(false);
        setIsLoading(false);
        setPlaybackState("paused");
        updatePositionState();
        break;
      case "ended":
        advanceOrStop();
        break;
      case "error": {
        if (!el.getAttribute("src")) return;
        const track = tracksRef.current[indexRef.current];
        // Si falló el preview, se intenta una vez con el archivo original.
        if (track?.previewFile && !triedOriginalRef.current) {
          triedOriginalRef.current = true;
          el.src = playbackSrc(track, true);
          play(el);
          return;
        }
        // Un archivo que no carga (borrado en B2, sin red) no corta la playlist.
        advanceOrStop();
        break;
      }
      case "timeupdate": {
        setCurrentTime(el.currentTime || 0);
        const now = Date.now();
        if (now - lastPositionUpdate.current > 1000) {
          lastPositionUpdate.current = now;
          updatePositionState();
        }
        break;
      }
      case "loadedmetadata":
        setDuration(el.duration || 0);
        updatePositionState();
        break;
      default:
    }
  };

  // Siempre la versión del último render, para listeners y handlers registrados una vez.
  const actions = useRef(null);
  actions.current = { loadAndPlay, previous, resume, onMediaEvent };

  const toggleTrack = useCallback((index) => {
    const el = elements[activeRef.current];
    if (index !== indexRef.current) actions.current.loadAndPlay(index);
    else if (el.paused) actions.current.resume();
    else el.pause();
  }, [elements]);

  const togglePlayAll = useCallback(() => {
    if (tracksRef.current.length === 0) return;
    toggleTrack(indexRef.current ?? 0);
  }, [toggleTrack]);

  const next = useCallback(() => {
    const index = indexRef.current;
    if (index !== null && index < tracksRef.current.length - 1) actions.current.loadAndPlay(index + 1);
  }, []);

  const prev = useCallback(() => actions.current.previous(), []);

  const seek = useCallback((seconds) => {
    const el = elements[activeRef.current];
    if (!Number.isFinite(el.duration)) return;
    el.currentTime = Math.min(el.duration, Math.max(0, seconds));
    setCurrentTime(el.currentTime);
    updatePositionState();
  }, [elements, updatePositionState]);

  // Listeners de los dos elementos y handlers de la notificación: se registran una vez.
  useEffect(() => {
    const listener = (e) => actions.current.onMediaEvent(e);
    elements.forEach((el) => {
      el.preload = "metadata";
      MEDIA_EVENTS.forEach((type) => el.addEventListener(type, listener));
    });

    setAction("play", () => actions.current.resume());
    setAction("pause", () => elements[activeRef.current].pause());
    setAction("seekto", (details) => {
      if (typeof details?.seekTime === "number") seek(details.seekTime);
    });
    setAction("seekforward", (details) => seek(elements[activeRef.current].currentTime + (details?.seekOffset || SEEK_STEP)));
    setAction("seekbackward", (details) => seek(elements[activeRef.current].currentTime - (details?.seekOffset || SEEK_STEP)));

    return () => {
      elements.forEach((el) => {
        MEDIA_EVENTS.forEach((type) => el.removeEventListener(type, listener));
        el.pause();
        el.removeAttribute("src");
        el.load();
      });
      const session = mediaSession();
      if (!session) return;
      session.metadata = null;
      session.playbackState = "none";
      ["play", "pause", "seekto", "seekforward", "seekbackward", "nexttrack", "previoustrack"].forEach((action) =>
        setAction(action, null)
      );
    };
  }, [elements, seek]);

  // Si la página cambia de catálogo sin desmontarse, el tema viejo ya no pertenece a esta lista.
  const tracksKey = tracks.map((t) => t._id).join("|");
  useEffect(() => {
    const index = indexRef.current;
    if (index === null) return;
    const track = tracksRef.current[index];
    const el = elements[activeRef.current];
    if (track && el.getAttribute("src") && [track.previewFile, track.audioFile].includes(el.getAttribute("src"))) return;
    elements.forEach((e) => {
      e.pause();
      e.removeAttribute("src");
    });
    indexRef.current = null;
    preloadedRef.current = null;
    setCurrentIndex(null);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    setIsLoading(false);
  }, [tracksKey, elements]);

  return {
    currentIndex,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    toggleTrack,
    togglePlayAll,
    next,
    prev,
    seek,
  };
};
