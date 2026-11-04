// Fondos de las páginas logueadas, uno por sección (ADR 0004).
//
// Para poner un video en una sección: subí a B2 (carpeta backgrounds/) los tres
// archivos que genera scripts/encode-background.sh, con un hash en el nombre para
// poder cachearlos para siempre, y completá `poster`, `video` y `videoMobile`.
// `poster` es la imagen que se ve al instante y la que queda cuando no conviene
// reproducir video (reducir movimiento, ahorro de datos, conexión lenta).
const BG = "https://s3.us-east-005.backblazeb2.com/niv0-audios/backgrounds";
const DEFAULT_POSTER = "https://f005.backblazeb2.com/file/niv0-audios/images/fotohomeloguedfr.webp";

const section = (overrides = {}) => ({ poster: DEFAULT_POSTER, video: null, videoMobile: null, ...overrides });

export const PAGE_BACKGROUNDS = {
  homeLogued: section({
    poster: `${BG}/home-poster-a51b63fc.webp`,
    video: `${BG}/home-720-7b49aad9.mp4`,
    videoMobile: `${BG}/home-480-793a41ad.mp4`,
  }),
  beats: section({
    poster: `${BG}/beats-poster-e3dd139b.webp`,
    video: `${BG}/beats-720-17b419b0.mp4`,
    videoMobile: `${BG}/beats-480-18b94a69.mp4`,
  }),
  loops: section({
    poster: `${BG}/loops-poster-5e8a0eb2.webp`,
    video: `${BG}/loops-720-ccc489a3.mp4`,
    videoMobile: `${BG}/loops-480-d3be2955.mp4`,
  }),
  samplePacks: section({
    poster: `${BG}/samplepacks-poster-2a840592.webp`,
    video: `${BG}/samplepacks-720-879f4f5b.mp4`,
    videoMobile: `${BG}/samplepacks-480-43114a4a.mp4`,
  }),
  prodMix: section({
    poster: `${BG}/prodmix-poster-aecc0dfa.webp`,
    video: `${BG}/prodmix-720-9a854903.mp4`,
    videoMobile: `${BG}/prodmix-480-48bbca9f.mp4`,
  }),
};

const IMAGE_EXTENSION = /\.(jpe?g|jfif|png|webp|gif|avif)(\?|$)/i;

// El fondo que cada catálogo carga desde el admin puede ser una imagen o un video.
export const catalogBackground = (src) => {
  if (!src) return section();
  return IMAGE_EXTENSION.test(src) ? section({ poster: src }) : section({ video: src });
};
