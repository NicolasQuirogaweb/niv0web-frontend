import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { adminService } from "../../services/api";
import { useToast } from "../../hooks/useToast";
import { useConfirm } from "../../hooks/useConfirm";
import { AdminUploader } from "./AdminUploader";
import { Icons } from "./icons";
import { Spinner, SkeletonCard, SpinnerStyles } from "./Spinner";
import styles from "./admin.module.css";

export const AdminProdMixMaster = () => {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", audioFile: "" });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const confirm = useConfirm();

  const INPUT_ERROR = { border: "1px solid #c62828" };

  const fetchItems = (signal) => {
    setLoading(true);
    adminService.prodmix.list(signal)
      .then((res) => setItems(res.data))
      .catch((err) => {
        if (err.name === "CanceledError" || err.code === "ERR_CANCELED") return;
        toast.error(err.response?.data?.message || t("admin.toast.errorLoading", { name: t("admin.prodmix.prodmixLabel") }));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const ctrl = new AbortController();
    fetchItems(ctrl.signal);
    return () => ctrl.abort();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const resetForm = () => {
    setForm({ title: "", description: "", audioFile: "" });
    setErrors({});
    setEditItem(null);
    setShowForm(false);
  };

  const handleEdit = (item) => {
    setForm({ title: item.title, description: item.description, audioFile: item.audioFile });
    setEditItem(item);
    setShowForm(true);
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = t("admin.validation.titleRequired");
    if (!form.audioFile) errs.audioFile = t("admin.validation.audioRequired");
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      if (editItem) {
        await adminService.prodmix.update(editItem._id, form);
        toast.success(t("admin.toast.updated", { name: t("admin.prodmix.itemLabel") }));
      } else {
        await adminService.prodmix.create(form);
        toast.success(t("admin.toast.created", { name: t("admin.prodmix.itemLabel") }));
      }
      resetForm();
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.message || t("admin.toast.errorSaving"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (itemId) => {
    const ok = await confirm(t("admin.confirm.deleteTitle", { name: t("admin.prodmix.itemLabel").toLowerCase() }), t("admin.confirm.deleteMessage", { item: items.find(i => i._id === itemId)?.title }));
    if (!ok) return;
    try {
      await adminService.prodmix.delete(itemId);
      toast.success(t("admin.toast.deleted", { name: t("admin.prodmix.itemLabel") }));
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.message || t("admin.toast.errorDeleting"));
    }
  };

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
              placeholder={t("admin.common.titlePlaceholder")} className={styles.input} style={errors.title ? INPUT_ERROR : undefined} />
            {errors.title && <p style={{ color: "#c62828", fontSize: 12, margin: "4px 0 0" }}>{errors.title}</p>}
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
            {errors.audioFile && <p style={{ color: "#c62828", fontSize: 12, margin: "4px 0" }}>{errors.audioFile}</p>}
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
