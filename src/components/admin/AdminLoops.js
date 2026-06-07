import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { adminService } from "../../services/api";
import { useToast } from "../../hooks/useToast";
import { useConfirm } from "../../hooks/useConfirm";
import { AdminUploader } from "./AdminUploader";
import { Icons } from "./icons";
import { Spinner, SkeletonCard, SpinnerStyles } from "./Spinner";
import styles from "./admin.module.css";

export const AdminLoops = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const [loops, setLoops] = useState([]);
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editLoop, setEditLoop] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", audioFile: "" });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const confirm = useConfirm();

  const INPUT_ERROR = { border: "1px solid #c62828" };

  const fetchData = useCallback(async (signal) => {
    try {
      const [playlistsRes, loopsRes] = await Promise.all([
        adminService.playlists.list(signal),
        adminService.loops.list(id, signal),
      ]);
      setPlaylist(playlistsRes.data.find((p) => p._id === id));
      setLoops(loopsRes.data);
    } catch (err) {
      if (err.name === "CanceledError" || err.code === "ERR_CANCELED") return;
      toast.error(t("admin.toast.errorLoading", { name: t("admin.loops.loopLabel") }));
    } finally {
      setLoading(false);
    }
  }, [id, toast, t]);

  useEffect(() => {
    const ctrl = new AbortController();
    fetchData(ctrl.signal);
    return () => ctrl.abort();
  }, [fetchData]);

  const resetForm = () => {
    setForm({ title: "", description: "", audioFile: "" });
    setErrors({});
    setEditLoop(null);
    setShowForm(false);
  };

  const handleEdit = (loop) => {
    setForm({ title: loop.title, description: loop.description, audioFile: loop.audioFile });
    setEditLoop(loop);
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
      if (editLoop) {
        await adminService.loops.update(editLoop._id, form);
        toast.success(t("admin.toast.updated", { name: t("admin.loops.loopLabel") }));
      } else {
        await adminService.loops.create(id, form);
        toast.success(t("admin.toast.created", { name: t("admin.loops.loopLabel") }));
      }
      resetForm();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || t("admin.toast.errorSaving"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (loopId) => {
    const ok = await confirm(t("admin.confirm.deleteTitle", { name: t("admin.loops.loopLabel") }), t("admin.confirm.deleteMessage", { item: loops.find(l => l._id === loopId)?.title }));
    if (!ok) return;
    try {
      await adminService.loops.delete(loopId);
      toast.success(t("admin.toast.deleted", { name: t("admin.loops.loopLabel") }));
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || t("admin.toast.errorDeleting"));
    }
  };

  return (
    <div>
      <SpinnerStyles />
      <div style={{ marginBottom: 24 }}>
        <Link to="/admin/loops" className={styles.backLink}>
          <Icons.Back size={14} /> {t("nav.backToLoopCatalogs")}
        </Link>
        <h2 className={styles.pageTitle} style={{ margin: "8px 0 0" }}>{playlist?.title || t("admin.loops.title")}</h2>
      </div>

      <button onClick={() => { resetForm(); setShowForm(true); }} className={styles.btnPrimary}>
        <Icons.Add size={16} /> {t("admin.loops.new")}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className={styles.formBox}>
          <h3 className={styles.formTitle}>{editLoop ? t("admin.loops.editTitle") : t("admin.loops.newTitle")}</h3>
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
              <AdminUploader folder="loops" accept="audio/*" onUpload={(url) => { setForm({ ...form, audioFile: url }); setErrors({ ...errors, audioFile: "" }); }} />
            )}
            {errors.audioFile && <p style={{ color: "#c62828", fontSize: 12, margin: "4px 0" }}>{errors.audioFile}</p>}
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
