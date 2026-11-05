// Foto de la página About. Va en B2 (no en public/, ver CLAUDE.md).
// null hasta que Nicolás pase la suya: la página se ve bien sin foto.
export const ABOUT_PHOTO_URL = null;

// Video de fondo del encabezado de NIVØ (ADR 0004/0009): el pasillo, 20 s en loop.
// Para cambiarlo: scripts/encode-background.sh, subir los tres archivos a B2
// backgrounds/ y pegar las URLs acá.
const BG = "https://s3.us-east-005.backblazeb2.com/niv0-audios/backgrounds";
export const ABOUT_BACKGROUND = {
  poster: `${BG}/about-poster-defcc054.webp`,
  video: `${BG}/about-720-364c5225.mp4`,
  videoMobile: `${BG}/about-480-2bfa759f.mp4`,
};

// Próximo disco (ADR 0009). Se completa a medida que haya datos:
// - month: "AAAA-MM" (obligatorio): con solo esto dice "sale en noviembre".
// - releaseDate: fecha y hora de salida con zona, ej. "2026-11-21T00:00:00-03:00": suma el día y la cuenta regresiva.
// - coverUrl: tapa (en B2, no en public/). Sin tapa se ve un disco en sombra.
// - presaveUrl: link de pre-save o de Spotify para el botón.
// Cuando el disco sale, el aviso desaparece solo; ponelo en null cuando ya no haga falta.
export const UPCOMING_RELEASE = {
  title: "Sentimientos restringidos",
  month: "2026-11",
  releaseDate: null,
  coverUrl: null,
  presaveUrl: null,
};
