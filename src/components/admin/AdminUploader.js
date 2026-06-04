import { useState, useRef } from "react";
import { adminService } from "../../services/api";

export const AdminUploader = ({ folder = "uploads", onUpload, accept = "image/*,video/*,audio/*" }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(null);
  const [preview, setPreview] = useState(null);
  const inputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    setProgress("Subiendo...");
    if (file.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(file));
    }
    try {
      const res = await adminService.upload.file(file, folder);
      setProgress("Completado");
      if (onUpload) onUpload(res.data.url, file.name);
    } catch (err) {
      setProgress("Error");
      alert("Error al subir archivo");
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(null), 2000);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleDragOver = (e) => e.preventDefault();

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={() => inputRef.current?.click()}
      style={{
        border: "2px dashed #555",
        borderRadius: 8,
        padding: 20,
        textAlign: "center",
        cursor: "pointer",
        background: preview ? "transparent" : "#1a1a1a",
        minHeight: 120,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: "none" }}
        onChange={(e) => handleFile(e.target.files[0])}
      />
      {preview ? (
        <img src={preview} alt="preview" style={{ maxHeight: 120, maxWidth: "100%", borderRadius: 4 }} />
      ) : uploading ? (
        <p style={{ color: "#aaa" }}>{progress}</p>
      ) : (
        <div>
          <p style={{ color: "#888", margin: 0 }}>Arrastra un archivo aquí o haz clic para seleccionar</p>
          <p style={{ color: "#555", fontSize: 12, margin: "4px 0 0" }}>Soportado: {accept}</p>
        </div>
      )}
    </div>
  );
};
