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
    handleEdit,
    handleSubmit,
    handleDelete,
  } = useAdminResource({
    emptyForm: EMPTY_FORM,
    labelKey: "admin.loops.loopLabel",
    fetchData,
    createFn: (form) => adminService.loops.create(id, form),
    updateFn: (loopId, form) => adminService.loops.update(loopId, form),
    deleteFn: (loopId) => adminService.loops.delete(loopId),
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

      <button onClick={() => { resetForm(); setShowForm(true); }} className={styles.btnPrimary}>
        <Icons.Add size={16} /> {t("admin.loops.new")}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className={styles.formBox}>
          <h3 className={styles.formTitle}>{editLoop ? t("admin.loops.editTitle") : t("admin.loops.newTitle")}</h3>
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
              <AdminUploader folder="loops" accept="audio/*" onUpload={(url) => { setForm({ ...form, audioFile: url }); setErrors({ ...errors, audioFile: "" }); }} />
            )}
            {errors.audioFile && <p className={styles.fieldErrorBlock}>{errors.audioFile}</p>}
          </div>
          <div className={styles.formActions}>
            <button type="submit" disabled={saving} className={styles.btnPrimary} style={{ opacity: saving ? 0.6 : 1 }}>
              {saving ? <><Spinner size={14} /> {t("admin.common.saving")}</> : editLoop ? t("admin.common.update") : t("admin.common.save")}
            </button>
            <button type="button" onClick={resetForm} className={styles.btnSecondary}>{t("admin.common.cancel")}</button>
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
            <button onClick={() => handleDelete(loop._id)} className={`${styles.btnSmall} ${styles.btnDanger}`}><Icons.Delete size={13} /> {t("admin.common.delete")}</button>
          </div>
        ))}
      </div>
    </div>
  );
};
