import { useEffect, useRef, useState } from "react";
import { albumEmbedUrl, albumUri, loadSpotifyIframeApi } from "../../utils/spotifyEmbed";

const HEIGHT = 152;

/**
 * Reproductor de Spotify que arranca solo el disco que se eligió. Usa la API de
 * iframes de Spotify (las escuchas cuentan en Spotify igual que en el embed común).
 * Si el script no carga, queda el embed común y hay que apretar play adentro.
 */
export const SpotifyPlayer = ({ albumId, title }) => {
  const hostRef = useRef(null);
  const controllerRef = useRef(null);
  const latestRef = useRef(albumId);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    latestRef.current = albumId;
    const controller = controllerRef.current;
    if (controller) {
      controller.loadUri(albumUri(albumId));
      controller.play();
    }
  }, [albumId]);

  useEffect(() => {
    let cancelled = false;
    loadSpotifyIframeApi().then((api) => {
      if (cancelled) return;
      if (!api) {
        setFallback(true);
        return;
      }
      const target = document.createElement("div");
      hostRef.current?.replaceChildren(target);
      api.createController(target, { uri: albumUri(latestRef.current), width: "100%", height: HEIGHT }, (controller) => {
        if (cancelled) {
          controller.destroy?.();
          return;
        }
        controllerRef.current = controller;
        // Puede que el navegador frene el sonido automático la primera vez: queda el play de Spotify.
        controller.addListener("ready", () => controller.play());
      });
    });
    return () => {
      cancelled = true;
      controllerRef.current?.destroy?.();
      controllerRef.current = null;
    };
  }, []);

  if (fallback) {
    return (
      <iframe
        className="spotify-player"
        title={`${title} — Spotify`}
        src={albumEmbedUrl(albumId)}
        width="100%"
        height={HEIGHT}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
      />
    );
  }
  return <div className="spotify-player" ref={hostRef} style={{ minHeight: HEIGHT }} />;
};
