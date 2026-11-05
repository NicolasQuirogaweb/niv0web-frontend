// API de iframes de Spotify (https://developer.spotify.com/documentation/embeds/references/iframe-api):
// con ella la página le puede decir al reproductor qué disco cargar y que arranque,
// en vez de dejar al visitante apretando play adentro del iframe.
const SCRIPT_URL = "https://open.spotify.com/embed/iframe-api/v1";

let apiPromise = null;

// Carga el script una sola vez. Se resuelve con la API, o con null si no carga
// (bloqueadores, sin conexión): en ese caso se usa el embed común.
export const loadSpotifyIframeApi = () => {
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve) => {
    window.onSpotifyIframeApiReady = (api) => resolve(api);
    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.async = true;
    script.dataset.spotifyIframeApi = "";
    script.addEventListener("error", () => resolve(null));
    document.body.appendChild(script);
  });
  return apiPromise;
};

export const albumUri = (albumId) => `spotify:album:${albumId}`;
export const albumEmbedUrl = (albumId) => `https://open.spotify.com/embed/album/${albumId}`;

export const resetSpotifyIframeApiForTests = () => {
  apiPromise = null;
};
