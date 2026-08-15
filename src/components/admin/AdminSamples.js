import { useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { adminService } from "../../services/api";
import { useAdminResource } from "../../hooks/useAdminResource";
import { AdminUploader } from "./AdminUploader";
import { Icons } from "./icons";
import { Spinner, SkeletonCard, SpinnerStyles } from "./Spinner";
import styles from "./admin.module.css";

const EMPTY_FORM = { title: "", description: "", audioFile: "" };

export const AdminSamples = () => {
  const { id } = useParams();
  const { t } = useTranslation();

  const fetchData = useCallback(
    (signal) =>
      Promise.all([adminService.samplepacks.list(signal), adminService.samples.list(id, signal)]).then(
        ([packsRes, samplesRes]) => ({
          items: samplesRes.data,
          parent: packsRes.data.find((p) => p._id === id),
        })
      ),
    [id]
  );

  const {
    items: samples,
    parent: pack,
    loading,
    showForm,
    setShowForm,
    editItem: editSample,
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
    labelKey: "admin.samples.sampleLabel",
    fetchData,
    createFn: (form) => adminService.samples.create(id, form),
    updateFn: (sampleId, form) => adminService.samples.update(sampleId, form),
    deleteFn: (sampleId) => adminService.samples.delete(sampleId),
    batch: {
      folder: "samples",
      mapUpload: (item) => ({
        title: item.originalName.replace(/\.[^/.]+$/, ""),
        description: "",
        audioFile: item.url,
      }),
      batchFn: (samplesData) => adminService.samples.batch(id, samplesData),
    },
  });

  return (
    <div>
      <SpinnerStyles />
      <div className={styles.sectionHeader}>
        <Link to="/admin/samplepacks" className={styles.backLink}>
          <Icons.Back size={14} /> {t("nav.backToPacks")}
        </Link>
        <h2 className={styles.pageTitleTop}>{pack?.title || t("admin.samples.title")}</h2>
      </div>

      <div className={styles.actionRow}>
        <button onClick={() => { resetForm(); setShowForm(true); }} className={styles.btnPrimary}>
          <Icons.Add size={16} /> {t("admin.samples.new")}
        </button>
        {!batchMode && (
          <button onClick={() => { setShowForm(false); setBatchMode(true); }} className={styles.btnSecondary}>
            <Icons.Upload size={16} /> {t("admin.samples.batchTitle")}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className={styles.formBox}>
          <h3 className={styles.formTitle}>{editSample ? t("admin.samples.editTitle") : t("admin.samples.newTitle")}</h3>
          <div>
            <input name="title" value={form.title} onChange={(e) => { setForm({ ...form, title: e.target.value }); setErrors({ ...errors, title: "" }); }}
              placeholder={t("admin.common.titlePlaceholder")} className={`${styles.input} ${errors.title ? styles.inputError : ""}`} />
            {errors.title && <p className={styles.fieldError}>{errors.title}</p>}
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
              <AdminUploader folder="samples" accept="audio/*" onUpload={(url) => { setForm({ ...form, audioFile: url }); setErrors({ ...errors, audioFile: "" }); }} />
            )}
            {errors.audioFile && <p className={styles.fieldErrorBlock}>{errors.audioFile}</p>}
          </div>
          <div className={styles.formActions}>
            <button type="submit" disabled={saving} className={styles.btnPrimary} style={{ opacity: saving ? 0.6 : 1 }}>
              {saving ? <><Spinner size={14} /> {t("admin.common.saving")}</> : editSample ? t("admin.common.update") : t("admin.common.save")}
            </button>
            <button type="button" onClick={resetForm} className={styles.btnSecondary}>{t("admin.common.cancel")}</button>
          </div>
        </form>
      )}

      {batchMode && (
        <div className={styles.batchBox}>
          <h3 className={styles.batchFormTitle}>
            <Icons.Upload size={16} className={styles.batchTitleIcon} /> {t("admin.samples.batchTitle")}
          </h3>
          <p className={styles.batchHint}>{t("admin.samples.batchHint")}</p>
          <div onDrop={handleDrop} onDragOver={handleDragOver}
            onClick={() => document.getElementById("batch-input-samples")?.click()}
            className={styles.batchDrop}>
            <input id="batch-input-samples" type="file" multiple accept="audio/*"
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
                  <Icons.Upload size={16} /> {t("admin.samples.uploadCount", { count: batchFiles.length })}
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
        ) : samples.length === 0 ? (
          <p className={styles.emptyText}>{t("admin.samples.none")}</p>
        ) : samples.map((sample) => (
          <div key={sample._id} className={styles.itemCard}>
            <div className={styles.itemContent}>
              <p className={styles.itemTitle}>{sample.title}</p>
              <p className={styles.itemDesc}>{sample.description || t("admin.common.noDescription")}</p>
            </div>
            <button onClick={() => handleEdit(sample)} className={styles.btnSmall}><Icons.Edit size={13} /> {t("admin.common.edit")}</button>
            <button onClick={() => handleDelete(sample._id)} className={`${styles.btnSmall} ${styles.btnDanger}`}><Icons.Delete size={13} /> {t("admin.common.delete")}</button>
          </div>
        ))}
      </div>
    </div>
  );
};
