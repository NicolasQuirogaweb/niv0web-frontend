import { useState, useRef, useEffect, useId } from "react";
import { useTranslation } from "react-i18next";
import { adminService } from "../../services/api";
import styles from "./admin.module.css";

/**
 * Drop zone for one file. The zone is a <label> for a visually-hidden file
 * input, so Tab reaches it and Enter/Space opens the picker. Pass `id` to tie
 * an outer <label htmlFor> to the input, and `name`/`invalid`/`describedBy`
 * so a form can link and focus it when the field has an error.
 */
export const AdminUploader = ({
  folder = "uploads",
  onUpload,
  accept = "image/*,video/*,audio/*",
  id,
  name,
  invalid = false,
  describedBy,
}) => {
  const { t } = useTranslation();
  const autoId = useId();
  const inputId = id || `uploader-${autoId}`;
  const [uploading, setUploading] = useState(false);
  const [percent, setPercent] = useState(null);
  const [done, setDone] = useState(false);
  const [preview, setPreview] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const doneTimer = useRef(null);

  useEffect(() => () => clearTimeout(doneTimer.current), []);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const handleFile = async (file) => {
    if (!file || uploading) return;
    clearTimeout(doneTimer.current);
    setErrorMsg(null);
    setDone(false);
    setPercent(0);
    setUploading(true);
    setPreview(file.type.startsWith("image/") ? URL.createObjectURL(file) : null);
    try {
      const res = await adminService.upload.file(file, folder, {
        onUploadProgress: (e) => {
          if (e.total) setPercent(Math.round((e.loaded * 100) / e.total));
        },
      });
      setDone(true);
      doneTimer.current = setTimeout(() => setDone(false), 3000);
      if (onUpload) onUpload(res.data.url, file.name);
    } catch (err) {
      console.error("Error uploading file:", err);
      setErrorMsg(err?.response?.data?.message || t("admin.uploader.errorUploading"));
    } finally {
      setUploading(false);
      setPercent(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e) => e.preventDefault();

  const showHints = !preview && !uploading && !errorMsg && !done;

  return (
    <label
      htmlFor={inputId}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      aria-busy={uploading || undefined}
      className={`${preview ? styles.dropZonePreview : styles.dropZoneDefault} ${uploading ? styles.dropZoneBusy : ""}`}
    >
      <input
        id={inputId}
        name={name}
        type="file"
        accept={accept}
        disabled={uploading}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        className={styles.visuallyHidden}
        onChange={(e) => {
          handleFile(e.target.files[0]);
          e.target.value = "";
        }}
      />
      {preview && <img src={preview} alt={t("admin.uploader.previewAlt")} className={styles.previewImg} />}
      {showHints && (
        <span className={styles.uploadHints}>
          <span className={styles.dragHint}>{t("admin.uploader.dragHint")}</span>
          <span className={styles.supportedHint}>{t("admin.uploader.supported", { accept })}</span>
        </span>
      )}
      {/* Estado encima de la vista previa: una subida en curso o fallida no se ve como lista. */}
      <span className={preview && (uploading || errorMsg) ? styles.uploadOverlay : styles.uploadStatus}>
        {uploading && (
          <span className={styles.uploadProgressRow}>
            <progress
              className={styles.progressBar}
              max={100}
              value={percent ?? 0}
              aria-label={t("admin.uploader.progressLabel")}
            />
            <span className={styles.uploadProgress}>{percent ?? 0}%</span>
          </span>
        )}
        {done && !uploading && <span role="status" className={styles.uploadProgress}>{t("admin.uploader.completed")}</span>}
        {errorMsg && <span role="alert" className={styles.uploadError}>{errorMsg}</span>}
      </span>
    </label>
  );
};
