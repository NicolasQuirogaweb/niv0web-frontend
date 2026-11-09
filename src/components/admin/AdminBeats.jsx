import { useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { adminService } from "../../services/api";
import { useAdminResource } from "../../hooks/useAdminResource";
import { AdminUploader } from "./AdminUploader";
import { Icons } from "./icons";
import { Spinner, SkeletonCard, SpinnerStyles } from "./Spinner";
import { fieldA11y, FieldError, errorId } from "./formA11y";
import styles from "./admin.module.css";

const EMPTY_FORM = { title: "", artist: "", description: "", audioFile: "" };

export const AdminBeats = () => {
  const { id } = useParams();
  const { t } = useTranslation();

  const fetchData = useCallback(
    (signal) =>
      Promise.all([adminService.playlists.list(signal), adminService.beats.list(id, signal)]).then(
        ([playlistsRes, beatsRes]) => ({
          items: beatsRes.data,
          parent: playlistsRes.data.find((p) => p._id === id),
        })
      ),
    [id]
  );

  const {
    items: beats,
    parent: playlist,
    loading,
    showForm,
    setShowForm,
    editItem: editBeat,
    form,
    setForm,
    errors,
    setErrors,
    saving,
    resetForm,
    cancelForm,
    formRef,
    pendingId,
    handleEdit,
    handleSubmit,
    handleDelete,
    batchMode,
    setBatchMode,
    batchFiles,
    batchUploading,
    batchProgress,
    handleBatchFiles,
    handleDrop,
    handleDragOver,
    removeBatchFile,
    handleBatchUpload,
    cancelBatch,
  } = useAdminResource({
    emptyForm: EMPTY_FORM,
    labelKey: "admin.beats.beatLabel",
    fetchData,
    createFn: (form) => adminService.beats.create(id, form),
    updateFn: (beatId, form) => adminService.beats.update(beatId, form),
    deleteFn: (beatId) => adminService.beats.delete(beatId),
    batch: {
      folder: "beats",
      mapUpload: (item) => ({
        title: item.originalName.replace(/\.[^/.]+$/, ""),
        artist: "",
        description: "",
        audioFile: item.url,
      }),
      batchFn: (beatsData) => adminService.beats.batch(id, beatsData),
    },
  });

  return (
    <div>
      <SpinnerStyles />
      <div className={styles.sectionHeader}>
        <Link to="/admin/playlists" className={styles.backLink}>
          <Icons.Back size={14} /> {t("nav.backToCatalogs")}
        </Link>
        <h2 className={styles.pageTitleTop}>{playlist?.title || t("admin.beats.title")}</h2>
      </div>

      <div className={styles.actionRow}>
        <button onClick={() => { resetForm(); setShowForm(true); }} className={styles.btnPrimary}>
          <Icons.Add size={16} /> {t("admin.beats.new")}
        </button>
        {!batchMode && (
          <button onClick={() => { setShowForm(false); setBatchMode(true); }} className={styles.btnSecondary}>
            <Icons.Upload size={16} /> {t("admin.beats.batchTitle")}
          </button>
        )}
      </div>

      {showForm && (
        <form ref={formRef} onSubmit={handleSubmit} noValidate className={styles.formBox}>
          <h3 className={styles.formTitle}>{editBeat ? t("admin.beats.editTitle") : t("admin.beats.new")}</h3>
          <div className={styles.gridForm}>
            <div>
              <input {...fieldA11y("beat", "title", errors)} aria-label={t("admin.common.titlePlaceholder")} value={form.title}
                onChange={(e) => { setForm({ ...form, title: e.target.value }); setErrors({ ...errors, title: "" }); }}
                placeholder={t("admin.common.titlePlaceholder")} className={`${styles.input} ${errors.title ? styles.inputError : ""}`} />
              <FieldError prefix="beat" name="title" errors={errors} className={styles.fieldError} />
            </div>
            <input {...fieldA11y("beat", "artist", errors)} aria-label={t("admin.common.artistPlaceholder")} value={form.artist}
              onChange={(e) => setForm({ ...form, artist: e.target.value })} placeholder={t("admin.common.artistPlaceholder")} className={styles.input} />
          </div>
          <textarea {...fieldA11y("beat", "description", errors)} aria-label={t("admin.common.descriptionPlaceholder")} value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder={t("admin.common.descriptionPlaceholder")} className={styles.textarea} />
          <div className={styles.mt16}>
            <label htmlFor="beat-audioFile" className={styles.labelPlain}>{t("admin.common.audioFileRequired")}</label>
            {form.audioFile ? (
              <div className={styles.audioRow}>
                <p className={styles.uploadSuccessInline}>{t("admin.common.audioUploaded")}</p>
                <button type="button" onClick={() => { setForm({ ...form, audioFile: "" }); setErrors({ ...errors, audioFile: "" }); }} className={styles.changeBtn}>{t("admin.common.change")}</button>
              </div>
            ) : (
              <AdminUploader id="beat-audioFile" name="audioFile" invalid={!!errors.audioFile}
                describedBy={errors.audioFile ? errorId("beat", "audioFile") : undefined}
                folder="beats" accept="audio/*" onUpload={(url) => { setForm({ ...form, audioFile: url }); setErrors({ ...errors, audioFile: "" }); }} />
            )}
            <FieldError prefix="beat" name="audioFile" errors={errors} className={styles.fieldErrorBlock} />
          </div>
          <div className={styles.formActions}>
            <button type="submit" disabled={saving} className={styles.btnPrimary}>
              {saving ? <><Spinner size={14} /> {t("admin.common.saving")}</> : editBeat ? t("admin.common.update") : t("admin.common.save")}
            </button>
            <button type="button" onClick={cancelForm} className={styles.btnSecondary}>{t("admin.common.cancel")}</button>
          </div>
        </form>
      )}

      {batchMode && (
        <div className={styles.batchBox}>
          <h3 className={styles.batchFormTitle}>
            <Icons.Upload size={16} className={styles.batchTitleIcon} /> {t("admin.beats.batchTitle")}
          </h3>
          <p className={styles.batchHint}>{t("admin.beats.batchHint")}</p>
          <label htmlFor="batch-input-beats" onDrop={handleDrop} onDragOver={handleDragOver} className={styles.batchDrop}>
            <input id="batch-input-beats" type="file" multiple accept="audio/*" disabled={batchUploading}
              className={styles.visuallyHidden} onChange={handleBatchFiles} />
            {batchFiles.length === 0 && !batchUploading ? (
              <span className={styles.uploadHints}>
                <span className={styles.dragHint}>{t("admin.uploader.batchDrop")}</span>
                <span className={styles.supportedHint}>{t("admin.uploader.batchSupported")}</span>
              </span>
            ) : batchUploading ? (
              <span role="status" className={styles.uploadProgress}><Spinner size={14} /> {batchProgress}</span>
            ) : null}
          </label>
          {batchFiles.length > 0 && !batchUploading && (
            <>
              <div className={styles.batchList}>
                {batchFiles.map((file, i) => (
                  <div key={file.name + file.size} className={styles.batchFileRow}>
                    <Icons.MusicNote size={14} className={styles.noShrink} aria-hidden="true" />
                    <span className={styles.batchFileName}>{file.name}</span>
                    <span className={styles.batchFileTitle}><span aria-hidden="true">→ </span>{file.name.replace(/.[^/.]+$/, "")}</span>
                    <button type="button" onClick={() => removeBatchFile(i)} aria-label={`${t("admin.common.delete")} ${file.name}`} className={styles.batchRemoveBtn}><Icons.Delete size={13} aria-hidden="true" /></button>
                  </div>
                ))}
              </div>
              <div className={styles.formActions}>
                <button onClick={handleBatchUpload} className={styles.btnPrimary}>
                  <Icons.Upload size={16} /> {t("admin.beats.uploadCount", { count: batchFiles.length })}
                </button>
                <button onClick={cancelBatch} className={styles.btnSecondary}>{t("admin.common.cancel")}</button>
              </div>
            </>
          )}
        </div>
      )}

      <div className={styles.gridItems + " " + styles.mt16}>
        {loading ? (
          <><SkeletonCard /><SkeletonCard /></>
        ) : beats.length === 0 ? (
          <p className={styles.emptyText}>{t("admin.beats.none")}</p>
        ) : beats.map((beat) => (
          <div key={beat._id} className={styles.itemCard}>
            <div className={styles.itemContent}>
              <p className={styles.itemTitle}>{beat.title}</p>
              <p className={styles.itemArtist}>{beat.artist}</p>
              <p className={styles.itemDesc}>{beat.description}</p>
            </div>
            <button onClick={() => handleEdit(beat)} className={styles.btnSmall}><Icons.Edit size={13} /> {t("admin.common.edit")}</button>
            <button onClick={() => handleDelete(beat._id)} disabled={pendingId === beat._id} className={`${styles.btnSmall} ${styles.btnDanger}`}><Icons.Delete size={13} /> {t("admin.common.delete")}</button>
          </div>
        ))}
      </div>
    </div>
  );
};
