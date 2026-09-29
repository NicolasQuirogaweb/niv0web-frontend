import { downloadService } from "../services/api";

// El browser no deja forzar la descarga de un archivo de otro dominio (B2),
// así que lo pedimos a través del proxy del backend y lo guardamos como blob.
export const downloadFile = async (url, filename) => {
  const response = await downloadService.file(url);
  const blobUrl = URL.createObjectURL(response.data);
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = filename || url.split("/").pop() || "download";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(blobUrl);
};
