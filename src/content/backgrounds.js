// Fondos de las páginas logueadas, uno por sección (ADR 0004).
//
// Para poner un video en una sección: subí a B2 las dos versiones que genera
// scripts/encode-background.sh (720p y 480p) y completá `video` y `videoMobile`.
// `poster` es la imagen que se ve al instante y la que queda cuando no conviene
// reproducir video (reducir movimiento, ahorro de datos, conexión lenta).
const DEFAULT_POSTER = "https://f005.backblazeb2.com/file/niv0-audios/images/fotohomeloguedfr.webp";

const section = (overrides = {}) => ({ poster: DEFAULT_POSTER, video: null, videoMobile: null, ...overrides });

export const PAGE_BACKGROUNDS = {
  homeLogued: section(),
  beats: section(),
  loops: section(),
  samplePacks: section(),
  prodMix: section(),
};

const IMAGE_EXTENSION = /\.(jpe?g|jfif|png|webp|gif|avif)(\?|$)/i;

// El fondo que cada catálogo carga desde el admin puede ser una imagen o un video.
export const catalogBackground = (src) => {
  if (!src) return section();
  return IMAGE_EXTENSION.test(src) ? section({ poster: src }) : section({ video: src });
};
