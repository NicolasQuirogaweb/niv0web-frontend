import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { adminService } from "../../services/api";
import styles from "./admin.module.css";

export const AdminUploader = ({ folder = "uploads", onUpload, accept = "image/*,video/*,audio/*" }) => {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(null);
  const [preview, setPreview] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const inputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    setErrorMsg(null);
    setUploading(true);
    setProgress(t("admin.uploader.uploading"));
    if (file.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(file));
    }
    try {
      const res = await adminService.upload.file(file, folder);
      setProgress(t("admin.uploader.completed"));
      if (onUpload) onUpload(res.data.url, file.name);
    } catch (err) {
      console.error("Error uploading file:", err);
      setProgress(t("admin.uploader.error"));
      setErrorMsg(err.response?.data?.message || err.message || t("admin.uploader.errorUploading"));
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
        <img src={preview} alt={t("admin.uploader.previewAlt")} className={styles.previewImg} />
      ) : uploading ? (
        <p className={styles.uploadProgress}>{progress}</p>
      ) : (
        <div>
          <p className={styles.dragHint}>{t("admin.uploader.dragHint")}</p>
          <p className={styles.supportedHint}>{t("admin.uploader.supported", { accept })}</p>
        </div>
      )}
      {errorMsg && (
        <p className={styles.uploadError}>{errorMsg}</p>
      )}
    </div>
  );
};
