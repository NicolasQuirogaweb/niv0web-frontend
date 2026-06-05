import { useState, useRef } from "react";
import { adminService } from "../../services/api";
import styles from "./admin.module.css";

export const AdminUploader = ({ folder = "uploads", onUpload, accept = "image/*,video/*,audio/*" }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(null);
  const [preview, setPreview] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const inputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    setErrorMsg(null);
    setUploading(true);
    setProgress("Uploading...");
    if (file.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(file));
    }
    try {
      const res = await adminService.upload.file(file, folder);
      setProgress("Completed");
      if (onUpload) onUpload(res.data.url, file.name);
    } catch (err) {
      console.error("Error uploading file:", err);
      setProgress("Error");
      setErrorMsg(err.response?.data?.message || err.message || "Error uploading file");
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(null), 3000);
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
      className={preview ? styles.dropZonePreview : styles.dropZoneDefault}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: "none" }}
        onChange={(e) => handleFile(e.target.files[0])}
      />
      {preview ? (
        <img src={preview} alt="preview" className={styles.previewImg} />
      ) : uploading ? (
        <p className={styles.uploadProgress}>{progress}</p>
      ) : (
        <div>
          <p className={styles.dragHint}>Drag a file here or click to select</p>
          <p className={styles.supportedHint}>Supported: {accept}</p>
        </div>
      )}
      {errorMsg && (
        <p className={styles.uploadError}>{errorMsg}</p>
      )}
    </div>
  );
};
