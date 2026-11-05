import { useEffect, useRef, useState } from "react";
import "./PageBackground.css";

const SLOW_CONNECTIONS = ["slow-2g", "2g", "3g"];
const MOBILE_QUERY = "(max-width: 768px)";

const matches = (query) => typeof window.matchMedia === "function" && window.matchMedia(query).matches;

// Un video de fondo vale la pena solo si no le cuesta caro a quien mira: con
// "reducir movimiento", ahorro de datos o una conexión lenta se queda la imagen.
export const canPlayBackgroundVideo = () => {
  if (matches("(prefers-reduced-motion: reduce)")) return false;
  const connection = navigator.connection;
  if (connection?.saveData) return false;
  if (SLOW_CONNECTIONS.includes(connection?.effectiveType)) return false;
  return true;
};

// Espera a que la página termine de cargar: el video nunca compite con lo importante.
const usePageLoaded = () => {
  const [loaded, setLoaded] = useState(() => document.readyState === "complete");
  useEffect(() => {
    if (loaded) return undefined;
    const onLoad = () => setLoaded(true);
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, [loaded]);
  return loaded;
};

/**
 * Fondo de las páginas logueadas (ADR 0004). Con `contained` llena solo su sección
 * (el encabezado de NIVØ) en vez de toda la pantalla. `media` viene de
 * src/content/backgrounds.js o del catálogo: { poster, video?, videoMobile? }.
 *
 * - La imagen (`poster`) se ve al instante y queda si no hay video o no conviene.
 * - El video se carga recién con la página lista, en versión liviana en celular,
 *   sin sonido y en loop, y se pausa cuando la pestaña no se ve.
 */
export const PageBackground = ({ media, contained = false }) => {
  const videoRef = useRef(null);
  const pageLoaded = usePageLoaded();
  const [allowed] = useState(canPlayBackgroundVideo);
  const [mobile] = useState(() => matches(MOBILE_QUERY));

  const poster = media?.poster;
  const videoSrc = (mobile && media?.videoMobile) || media?.video;
  const showVideo = Boolean(videoSrc && allowed && pageLoaded);

  // React pone `muted` como propiedad pero no como atributo, y Chrome a veces no
  // arranca el autoplay así. Lo marcamos mudo a mano y le damos play; si el
  // navegador se niega, queda la imagen de fondo.
  useEffect(() => {
    const el = videoRef.current;
    if (!showVideo || !el) return;
    el.defaultMuted = true;
    el.muted = true;
    el.play()?.catch?.(() => {});
  }, [showVideo, videoSrc]);

  useEffect(() => {
    if (!showVideo) return undefined;
    const onVisibility = () => {
      const el = videoRef.current;
      if (!el) return;
      if (document.visibilityState === "hidden") el.pause();
      else el.play()?.catch?.(() => {});
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [showVideo]);

  return (
    <div
      className={`page-bg${contained ? " page-bg--contained" : ""}`}
      style={poster ? { backgroundImage: `url(${poster})` } : undefined}
      aria-hidden="true"
    >
      {showVideo && (
        <video
          ref={videoRef}
          className="page-bg-video"
          src={videoSrc}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
      )}
      <div className="page-bg-shade" />
    </div>
  );
};
