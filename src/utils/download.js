import { downloadService } from "../services/api";

// Extensión real del archivo (.wav, .mp3...), para no guardar un WAV como .mp3.
export const fileExtension = (url) => {
  const match = /\.([a-z0-9]{2,4})(?:$|[?#])/i.exec(url || "");
  return match ? `.${match[1].toLowerCase()}` : "";
};

const clickLink = (href, filename) => {
  const a = document.createElement("a");
  a.href = href;
  if (filename) a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

/**
 * Descarga el archivo original de un tema (nunca el preview MP3).
 *
 * Camino principal: el backend devuelve un link firmado de B2 con
 * "Content-Disposition: attachment" y el navegador lo descarga directo, con su
 * propia barra de progreso. Resuelve apenas arrancó la descarga (~0,5 s), no
 * cuando termina.
 *
 * Fallback: si el link no se puede generar, se baja por el proxy del backend
 * como blob (más lento: el archivo entero pasa por memoria antes de guardarse).
 */
export const downloadTrack = async (track, fallbackName = "track") => {
  const name = track.title || fallbackName;
  try {
    const { data } = await downloadService.link(track.audioFile, name);
    clickLink(data.url);
    return "direct";
  } catch (err) {
    // El WAV de un beat viene con la licencia: el proxy también lo rechaza, no tiene sentido reintentar.
    if (err?.response?.status === 403) throw err;
    const response = await downloadService.file(track.audioFile);
    const blobUrl = URL.createObjectURL(response.data);
    clickLink(blobUrl, `${name}${fileExtension(track.audioFile)}`);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    return "proxy";
  }
};
