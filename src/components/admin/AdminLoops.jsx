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

const EMPTY_FORM = { title: "", description: "", audioFile: "" };
// Al subir un audio, su nombre (sin extensión) completa título y descripción; se pueden editar después.
const nameOf = (fileName = "") => fileName.replace(/\.[^/.]+$/, "");

export const AdminLoops = () => {
  const { id } = useParams();
  const { t } = useTranslation();

  const fetchData = useCallback(
    (signal) =>
      Promise.all([adminService.playlists.list(signal), adminService.loops.list(id, signal)]).then(
        ([playlistsRes, loopsRes]) => ({
          items: loopsRes.data,
          parent: playlistsRes.data.find((p) => p._id === id),
        })
      ),
    [id]
  );

  const {
    items: loops,
    parent: playlist,
    loading,
    showForm,
    setShowForm,
    editItem: editLoop,
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
    labelKey: "admin.loops.loopLabel",
    fetchData,
    createFn: (form) => adminService.loops.create(id, form),
    updateFn: (loopId, form) => adminService.loops.update(loopId, form),
    deleteFn: (loopId) => adminService.loops.delete(loopId),
    batch: {
      folder: "loops",
      mapUpload: (item) => ({
        title: nameOf(item.originalName),
        description: nameOf(item.originalName),
        audioFile: item.url,
      }),
      batchFn: (loopsData) => adminService.loops.batch(id, loopsData),
    },
  });

  return (
    <div>
      <SpinnerStyles />
      <div className={styles.sectionHeader}>
        <Link to="/admin/loops" className={styles.backLink}>
          <Icons.Back size={14} /> {t("nav.backToLoopCatalogs")}
        </Link>
        <h2 className={styles.pageTitleTop}>{playlist?.title || t("admin.loops.title")}</h2>
      </div>

      <div className={styles.actionRow}>
        <button onClick={() => { cancelBatch(); resetForm(); setShowForm(true); }} className={styles.btnPrimary}>
          <Icons.Add size={16} /> {t("admin.loops.new")}
        </button>
        {!batchMode && (
          <button onClick={() => { setShowForm(false); setBatchMode(true); }} className={styles.btnSecondary}>
            <Icons.Upload size={16} /> {t("admin.loops.batchTitle")}
          </button>
        )}
      </div>

      {batchMode && (
        <div className={styles.batchBox}>
          <h3 className={styles.batchFormTitle}>
            <Icons.Upload size={16} className={styles.batchTitleIcon} /> {t("admin.loops.batchTitle")}
          </h3>
          <p className={styles.batchHint}>{t("admin.loops.batchHint")}</p>
          <label htmlFor="batch-input-loops" onDrop={handleDrop} onDragOver={handleDragOver} className={styles.batchDrop}>
            <input id="batch-input-loops" type="file" multiple accept="audio/*" disabled={batchUploading}
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
                    <span className={styles.batchFileTitle}><span aria-hidden="true">→ </span>{nameOf(file.name)}</span>
                    <button type="button" onClick={() => removeBatchFile(i)} aria-label={`${t("admin.common.delete")} ${file.name}`} className={styles.batchRemoveBtn}><Icons.Delete size={13} aria-hidden="true" /></button>
                  </div>
                ))}
              </div>
              <div className={styles.formActions}>
                <button onClick={handleBatchUpload} className={styles.btnPrimary}>
                  <Icons.Upload size={16} /> {t("admin.loops.uploadCount", { count: batchFiles.length })}
                </button>
                <button onClick={cancelBatch} className={styles.btnSecondary}>{t("admin.common.cancel")}</button>
              </div>
            </>
          )}
        </div>
      )}

      {showForm && (
        <form ref={formRef} onSubmit={handleSubmit} noValidate className={styles.formBox}>
          <h3 className={styles.formTitle}>{editLoop ? t("admin.loops.editTitle") : t("admin.loops.newTitle")}</h3>
          <div>
            <input {...fieldA11y("loop", "title", errors)} aria-label={t("admin.common.titlePlaceholder")} value={form.title}
              onChange={(e) => { setForm({ ...form, title: e.target.value }); setErrors({ ...errors, title: "" }); }}
              placeholder={t("admin.common.titlePlaceholder")} className={`${styles.input} ${errors.title ? styles.inputError : ""}`} />
            <FieldError prefix="loop" name="title" errors={errors} className={styles.fieldError} />
          </div>
          <textarea {...fieldA11y("loop", "description", errors)} aria-label={t("admin.common.descriptionPlaceholder")} value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder={t("admin.common.descriptionPlaceholder")} className={styles.textarea} />
          <div className={styles.mt16}>
            <label htmlFor="loop-audioFile" className={styles.labelPlain}>{t("admin.common.audioFileRequired")}</label>
            {form.audioFile ? (
              <div className={styles.audioRow}>
                <p className={styles.uploadSuccessInline}>{t("admin.common.audioUploaded")}</p>
                <button type="button" onClick={() => { setForm({ ...form, audioFile: "" }); setErrors({ ...errors, audioFile: "" }); }} className={styles.changeBtn}>{t("admin.common.change")}</button>
              </div>
            ) : (
              <AdminUploader id="loop-audioFile" name="audioFile" invalid={!!errors.audioFile}
                describedBy={errors.audioFile ? errorId("loop", "audioFile") : undefined}
                folder="loops" accept="audio/*" onUpload={(url, fileName) => {
                  const name = nameOf(fileName);
                  setForm((prev) => ({ ...prev, audioFile: url, ...(name && { title: name, description: name }) }));
                  setErrors({ ...errors, audioFile: "", title: "" });
                }} />
            )}
            <FieldError prefix="loop" name="audioFile" errors={errors} className={styles.fieldErrorBlock} />
          </div>
          <div className={styles.formActions}>
            <button type="submit" disabled={saving} className={styles.btnPrimary}>
              {saving ? <><Spinner size={14} /> {t("admin.common.saving")}</> : editLoop ? t("admin.common.update") : t("admin.common.save")}
            </button>
            <button type="button" onClick={cancelForm} className={styles.btnSecondary}>{t("admin.common.cancel")}</button>
          </div>
        </form>
      )}

      <div className={styles.gridItems + " " + styles.mt16}>
        {loading ? (
          <><SkeletonCard /><SkeletonCard /></>
        ) : loops.length === 0 ? (
          <p className={styles.emptyText}>{t("admin.loops.none")}</p>
        ) : loops.map((loop) => (
          <div key={loop._id} className={styles.itemCard}>
            <div className={styles.itemContent}>
              <p className={styles.itemTitle}>{loop.title}</p>
              <p className={styles.itemDesc}>{loop.description}</p>
            </div>
            <button onClick={() => handleEdit(loop)} className={styles.btnSmall}><Icons.Edit size={13} /> {t("admin.common.edit")}</button>
            <button onClick={() => handleDelete(loop._id)} disabled={pendingId === loop._id} className={`${styles.btnSmall} ${styles.btnDanger}`}><Icons.Delete size={13} /> {t("admin.common.delete")}</button>
          </div>
        ))}
      </div>
    </div>
  );
};
