import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { adminService } from "../../services/api";
import { useAdminResource } from "../../hooks/useAdminResource";
import { useToast } from "../../hooks/useToast";
import { packErrorText } from "./packErrors";
import { AdminPackFolders } from "./AdminPackFolders";
import { AdminZipPanel } from "./AdminZipPanel";
import { AdminUploader } from "./AdminUploader";
import { Icons } from "./icons";
import { Spinner, SkeletonCard, SpinnerStyles } from "./Spinner";
import { fieldA11y, FieldError, errorId } from "./formA11y";
import styles from "./admin.module.css";

const EMPTY_FORM = { title: "", description: "", audioFile: "", folder: "" };
const requireFolder = (form, t) => (form.folder ? {} : { folder: t("admin.samples.folderRequired") });

export const AdminSamples = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const toast = useToast();
  const [batchFolder, setBatchFolder] = useState("");
  const [folderFilter, setFolderFilter] = useState("");

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
    reload,
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
    cancelForm,
    syncForm,
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
    labelKey: "admin.samples.sampleLabel",
    extraValidate: requireFolder,
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
        folder: batchFolder,
      }),
      batchFn: (samplesData) => adminService.samples.batch(id, samplesData),
    },
  });

  const folders = useMemo(() => pack?.folders || [], [pack]);
  const onlyFolder = folders.length === 1 ? folders[0] : "";

  // Una carpeta renombrada o borrada deja de valer: se limpia y, si queda una sola, se preselecciona.
  useEffect(() => {
    const valid = (v) => (folders.includes(v) ? v : onlyFolder);
    // syncForm: an automatic folder change is not an edit Cancel should ask about.
    syncForm((f) => (valid(f.folder) === f.folder ? f : { ...f, folder: valid(f.folder) }));
    setBatchFolder((v) => valid(v));
    setFolderFilter((v) => (folders.includes(v) ? v : ""));
  }, [folders, onlyFolder, showForm, batchMode, syncForm]);

  const samplesByFolder = useMemo(() => {
    const map = {};
    samples.forEach((s) => { (map[s.folder] ||= []).push(s); });
    return map;
  }, [samples]);

  // Guarda antes de subir a B2: una carpeta que ya no existe dejaría archivos huérfanos.
  const uploadBatch = () => {
    if (!folders.includes(batchFolder)) return;
    handleBatchUpload();
  };

  const visibleSamples = folderFilter ? samples.filter((s) => s.folder === folderFilter) : samples;

  const moveSample = async (sample, folder) => {
    try {
      await adminService.samples.update(sample._id, { folder });
      reload();
    } catch (err) {
      toast.error(packErrorText(t, err, "admin.toast.errorSaving"));
    }
  };

  return (
    <div>
      <SpinnerStyles />
      <div className={styles.sectionHeader}>
        <Link to="/admin/samplepacks" className={styles.backLink}>
          <Icons.Back size={14} /> {t("nav.backToPacks")}
        </Link>
        <h2 className={styles.pageTitleTop}>{pack?.title || t("admin.samples.title")}</h2>
      </div>

      {pack && <AdminPackFolders pack={pack} samplesByFolder={samplesByFolder} onChange={reload} />}
      {pack && <AdminZipPanel pack={pack} onRefresh={reload} />}

      <div className={styles.actionRow} style={{ marginTop: 16 }}>
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
        <form ref={formRef} onSubmit={handleSubmit} noValidate className={styles.formBox}>
          <h3 className={styles.formTitle}>{editSample ? t("admin.samples.editTitle") : t("admin.samples.newTitle")}</h3>
          <div>
            <input {...fieldA11y("sample", "title", errors)} aria-label={t("admin.common.titlePlaceholder")} value={form.title}
              onChange={(e) => { setForm({ ...form, title: e.target.value }); setErrors({ ...errors, title: "" }); }}
              placeholder={t("admin.common.titlePlaceholder")} className={`${styles.input} ${errors.title ? styles.inputError : ""}`} />
            <FieldError prefix="sample" name="title" errors={errors} className={styles.fieldError} />
          </div>
          <textarea {...fieldA11y("sample", "description", errors)} aria-label={t("admin.common.descriptionPlaceholder")} value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder={t("admin.common.descriptionPlaceholder")} className={styles.textarea} />
          <div className={styles.mt16}>
            <label htmlFor="sample-folder" className={styles.labelPlain}>{t("admin.samples.folder")}</label>
            <select {...fieldA11y("sample", "folder", errors)} value={form.folder} onChange={(e) => { setForm({ ...form, folder: e.target.value }); setErrors({ ...errors, folder: "" }); }}
              className={`${styles.input} ${errors.folder ? styles.inputError : ""}`}>
              <option value="">{t("admin.samples.chooseFolder")}</option>
              {folders.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
            <FieldError prefix="sample" name="folder" errors={errors} className={styles.fieldError} />
          </div>
          <div className={styles.mt16}>
            <label htmlFor="sample-audioFile" className={styles.labelPlain}>{t("admin.common.audioFileRequired")}</label>
            {form.audioFile ? (
              <div className={styles.audioRow}>
                <p className={styles.uploadSuccessInline}>{t("admin.common.audioUploaded")}</p>
                <button type="button" onClick={() => { setForm({ ...form, audioFile: "" }); setErrors({ ...errors, audioFile: "" }); }} className={styles.changeBtn}>{t("admin.common.change")}</button>
              </div>
            ) : (
              <AdminUploader id="sample-audioFile" name="audioFile" invalid={!!errors.audioFile}
                describedBy={errors.audioFile ? errorId("sample", "audioFile") : undefined}
                folder="samples" accept="audio/*" onUpload={(url) => { setForm({ ...form, audioFile: url }); setErrors({ ...errors, audioFile: "" }); }} />
            )}
            <FieldError prefix="sample" name="audioFile" errors={errors} className={styles.fieldErrorBlock} />
          </div>
          <div className={styles.formActions}>
            <button type="submit" disabled={saving} className={styles.btnPrimary}>
              {saving ? <><Spinner size={14} /> {t("admin.common.saving")}</> : editSample ? t("admin.common.update") : t("admin.common.save")}
            </button>
            <button type="button" onClick={cancelForm} className={styles.btnSecondary}>{t("admin.common.cancel")}</button>
          </div>
        </form>
      )}

      {batchMode && (
        <div className={styles.batchBox}>
          <h3 className={styles.batchFormTitle}>
            <Icons.Upload size={16} className={styles.batchTitleIcon} /> {t("admin.samples.batchTitle")}
          </h3>
          <p className={styles.batchHint}>{t("admin.samples.batchHint")}</p>
          <label htmlFor="batch-folder" className={styles.labelPlain}>{t("admin.samples.batchFolder")}</label>
          <select id="batch-folder" value={batchFolder} onChange={(e) => setBatchFolder(e.target.value)} className={styles.input} style={{ maxWidth: 320, marginBottom: 12 }}>
            <option value="">{t("admin.samples.chooseFolder")}</option>
            {folders.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
          {folders.length === 0 && <p className={styles.fieldErrorBlock}>{t("admin.samples.noFolders")}</p>}
          <label htmlFor="batch-input-samples" onDrop={handleDrop} onDragOver={handleDragOver} className={styles.batchDrop}>
            <input id="batch-input-samples" type="file" multiple accept="audio/*" disabled={batchUploading}
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
                    <span className={styles.batchFileTitle}><span aria-hidden="true">→ </span>{file.name.replace(/\.[^/.]+$/, "")}</span>
                    <button type="button" onClick={() => removeBatchFile(i)} aria-label={`${t("admin.common.delete")} ${file.name}`} className={styles.batchRemoveBtn}><Icons.Delete size={13} aria-hidden="true" /></button>
                  </div>
                ))}
              </div>
              <div className={styles.formActions}>
                <button onClick={uploadBatch} disabled={!folders.includes(batchFolder)} className={styles.btnPrimary}>
                  <Icons.Upload size={16} /> {t("admin.samples.uploadCount", { count: batchFiles.length })}
                </button>
                <button onClick={cancelBatch} className={styles.btnSecondary}>{t("admin.common.cancel")}</button>
              </div>
            </>
          )}
        </div>
      )}

      {folders.length > 0 && (
        <select aria-label={t("admin.samples.allFolders")} value={folderFilter} onChange={(e) => setFolderFilter(e.target.value)}
          className={styles.input} style={{ maxWidth: 260, marginTop: 16 }}>
          <option value="">{t("admin.samples.allFolders")}</option>
          {folders.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
      )}

      <div className={styles.gridItems + " " + styles.mt16}>
        {loading ? (
          <><SkeletonCard /><SkeletonCard /></>
        ) : visibleSamples.length === 0 ? (
          <p className={styles.emptyText}>{t("admin.samples.none")}</p>
        ) : visibleSamples.map((sample) => (
          <div key={sample._id} className={styles.itemCard}>
            <div className={styles.itemContent}>
              <p className={styles.itemTitle}>{sample.title}</p>
              <p className={styles.itemDesc}>{sample.description || t("admin.common.noDescription")}</p>
            </div>
            <select aria-label={`${t("admin.samples.moveTo")}: ${sample.title}`} value={folders.includes(sample.folder) ? sample.folder : ""}
              onChange={(e) => moveSample(sample, e.target.value)} className={styles.input} style={{ maxWidth: 160 }}>
              {!folders.includes(sample.folder) && <option value="">{t("admin.samples.chooseFolder")}</option>}
              {folders.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
            <button onClick={() => handleEdit(sample)} className={styles.btnSmall}><Icons.Edit size={13} /> {t("admin.common.edit")}</button>
            <button onClick={() => handleDelete(sample._id)} disabled={pendingId === sample._id} className={`${styles.btnSmall} ${styles.btnDanger}`}><Icons.Delete size={13} /> {t("admin.common.delete")}</button>
          </div>
        ))}
      </div>
    </div>
  );
};
