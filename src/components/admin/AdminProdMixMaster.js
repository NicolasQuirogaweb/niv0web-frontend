import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { adminService } from "../../services/api";
import { useAdminResource } from "../../hooks/useAdminResource";
import { AdminUploader } from "./AdminUploader";
import { Icons } from "./icons";
import { Spinner, SkeletonCard, SpinnerStyles } from "./Spinner";
import styles from "./admin.module.css";

const EMPTY_FORM = { title: "", description: "", audioFile: "" };

export const AdminProdMixMaster = () => {
  const { t } = useTranslation();

  const fetchData = useCallback(
    (signal) => adminService.prodmix.list(signal).then((res) => ({ items: res.data })),
    []
  );

  const {
    items,
    loading,
    showForm,
    setShowForm,
    editItem,
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
    labelKey: "admin.prodmix.itemLabel",
    fetchData,
    createFn: (form) => adminService.prodmix.create(form),
    updateFn: (itemId, form) => adminService.prodmix.update(itemId, form),
    deleteFn: (itemId) => adminService.prodmix.delete(itemId),
  });

  return (
    <div>
      <SpinnerStyles />
      <div className={styles.headerRow}>
        <h2 className={styles.pageTitle}>{t("admin.prodmix.title")}</h2>
        <button onClick={() => { resetForm(); setShowForm(true); }} className={styles.btnPrimary}>
          <Icons.Add size={16} /> {t("admin.prodmix.new")}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className={styles.formBox}>
          <h3 className={styles.formTitle}>{editItem ? t("admin.prodmix.editTitle") : t("admin.prodmix.newTitle")}</h3>
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
              <AdminUploader folder="prodmixmasters" accept="audio/*" onUpload={(url) => { setForm({ ...form, audioFile: url }); setErrors({ ...errors, audioFile: "" }); }} />
            )}
            {errors.audioFile && <p className={styles.fieldErrorBlock}>{errors.audioFile}</p>}
          </div>
          <div className={styles.formActions}>
            <button type="submit" disabled={saving} className={styles.btnPrimary} style={{ opacity: saving ? 0.6 : 1 }}>
              {saving ? <><Spinner size={14} /> {t("admin.common.saving")}</> : editItem ? t("admin.common.update") : t("admin.common.save")}
            </button>
            <button type="button" onClick={resetForm} className={styles.btnSecondary}>{t("admin.common.cancel")}</button>
          </div>
        </form>
      )}

      <div className={styles.gridItems}>
        {loading ? (
          <><SkeletonCard /><SkeletonCard /></>
        ) : items.length === 0 ? (
          <p className={styles.emptyText}>{t("admin.prodmix.none")}</p>
        ) : items.map((item) => (
          <div key={item._id} className={styles.itemCard}>
            <div className={styles.itemContent}>
              <p className={styles.itemTitle}>{item.title}</p>
              <p className={styles.itemDescPlain}>{item.description}</p>
            </div>
            <button onClick={() => handleEdit(item)} className={styles.btnSmall}><Icons.Edit size={13} /> {t("admin.common.edit")}</button>
            <button onClick={() => handleDelete(item._id)} className={`${styles.btnSmall} ${styles.btnDanger}`}><Icons.Delete size={13} /> {t("admin.common.delete")}</button>
          </div>
        ))}
      </div>
    </div>
  );
};
