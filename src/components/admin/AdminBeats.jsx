import { useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { adminService } from "../../services/api";
import { useAdminResource } from "../../hooks/useAdminResource";
import { AdminUploader } from "./AdminUploader";
import { Icons } from "./icons";
import { Spinner, SkeletonCard, SpinnerStyles } from "./Spinner";
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
        <form onSubmit={handleSubmit} className={styles.formBox}>
          <h3 className={styles.formTitle}>{editBeat ? t("admin.beats.editTitle") : t("admin.beats.new")}</h3>
          <div className={styles.gridForm}>
            <div>
              <input name="title" value={form.title} onChange={(e) => { setForm({ ...form, title: e.target.value }); setErrors({ ...errors, title: "" }); }}
                placeholder={t("admin.common.titlePlaceholder")} className={`${styles.input} ${errors.title ? styles.inputError : ""}`} />
              {errors.title && <p className={styles.fieldError}>{errors.title}</p>}
            </div>
            <input name="artist" value={form.artist} onChange={(e) => setForm({ ...form, artist: e.target.value })} placeholder={t("admin.common.artistPlaceholder")} className={styles.input} />
          </div>
          <textarea name="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder={t("admin.common.descriptionPlaceholder")} className={styles.textarea} />
          <div className={styles.mt16}>
            <label className={styles.labelPlain}>{t("admin.common.audioFileRequired")}</label>
            {form.audioFile ? (
              <div className={styles.audioRow}>
                <p className={styles.uploadSuccessInline}>{t("admin.common.audioUploaded")}</p>
                <button type="button" onClick={() => { setForm({ ...form, audioFile: "" }); setErrors({ ...errors, audioFile: "" }); }} className={styles.changeBtn}>{t("admin.common.change")}</button>
              </div>
            ) : (
              <AdminUploader folder="beats" accept="audio/*" onUpload={(url) => { setForm({ ...form, audioFile: url }); setErrors({ ...errors, audioFile: "" }); }} />
            )}
            {errors.audioFile && <p className={styles.fieldErrorBlock}>{errors.audioFile}</p>}
          </div>
          <div className={styles.formActions}>
            <button type="submit" disabled={saving} className={styles.btnPrimary} style={{ opacity: saving ? 0.6 : 1 }}>
              {saving ? <><Spinner size={14} /> {t("admin.common.saving")}</> : editBeat ? t("admin.common.update") : t("admin.common.save")}
            </button>
            <button type="button" onClick={resetForm} className={styles.btnSecondary}>{t("admin.common.cancel")}</button>
          </div>
        </form>
      )}

      {batchMode && (
        <div className={styles.batchBox}>
          <h3 className={styles.batchFormTitle}>
            <Icons.Upload size={16} className={styles.batchTitleIcon} /> {t("admin.beats.batchTitle")}
          </h3>
          <p className={styles.batchHint}>{t("admin.beats.batchHint")}</p>
          <div onDrop={handleDrop} onDragOver={handleDragOver}
            onClick={() => document.getElementById("batch-input-beats")?.click()}
            className={styles.batchDrop}>
            <input id="batch-input-beats" type="file" multiple accept="audio/*"
              className={styles.hiddenInput} onChange={handleBatchFiles} />
            {batchFiles.length === 0 && !batchUploading ? (
              <div>
                <p className={styles.dragHint}>{t("admin.uploader.batchDrop")}</p>
                <p className={styles.supportedHint}>{t("admin.uploader.batchSupported")}</p>
              </div>
            ) : batchUploading ? (
              <p className={styles.uploadProgress}><Spinner size={14} /> {batchProgress}</p>
            ) : null}
          </div>
          {batchFiles.length > 0 && !batchUploading && (
            <>
              <div className={styles.batchList}>
                {batchFiles.map((file, i) => (
                  <div key={i} className={styles.batchFileRow}>
                    <Icons.MusicNote size={14} className={styles.noShrink} />
                    <span className={styles.batchFileName}>{file.name}</span>
                    <span className={styles.batchFileTitle}>→ {file.name.replace(/\.[^/.]+$/, "")}</span>
                    <button onClick={() => removeBatchFile(i)} className={styles.batchRemoveBtn}><Icons.Delete size={13} /></button>
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
            <button onClick={() => handleDelete(beat._id)} className={`${styles.btnSmall} ${styles.btnDanger}`}><Icons.Delete size={13} /> {t("admin.common.delete")}</button>
          </div>
        ))}
      </div>
    </div>
  );
};
