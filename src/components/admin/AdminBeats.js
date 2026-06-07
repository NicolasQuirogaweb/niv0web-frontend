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

export const AdminBeats = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const [beats, setBeats] = useState([]);
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editBeat, setEditBeat] = useState(null);
  const [form, setForm] = useState({ title: "", artist: "", description: "", audioFile: "" });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [batchMode, setBatchMode] = useState(false);
  const [batchFiles, setBatchFiles] = useState([]);
  const [batchUploading, setBatchUploading] = useState(false);
  const [batchProgress, setBatchProgress] = useState("");
  const toast = useToast();
  const confirm = useConfirm();

  const INPUT_ERROR = { border: "1px solid #c62828" };

  const fetchData = useCallback(async (signal) => {
    try {
      const [playlistsRes, beatsRes] = await Promise.all([
        adminService.playlists.list(signal),
        adminService.beats.list(id, signal),
      ]);
      setPlaylist(playlistsRes.data.find((p) => p._id === id));
      setBeats(beatsRes.data);
    } catch (err) {
      if (err.name === "CanceledError" || err.code === "ERR_CANCELED") return;
      toast.error(t("admin.toast.errorLoading", { name: t("admin.beats.beatLabel") }));
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
    setForm({ title: "", artist: "", description: "", audioFile: "" });
    setErrors({});
    setEditBeat(null);
    setShowForm(false);
  };

  const handleEdit = (beat) => {
    setForm({ title: beat.title, artist: beat.artist, description: beat.description, audioFile: beat.audioFile });
    setEditBeat(beat);
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
      if (editBeat) {
        await adminService.beats.update(editBeat._id, form);
        toast.success(t("admin.toast.updated", { name: t("admin.beats.beatLabel") }));
      } else {
        await adminService.beats.create(id, form);
        toast.success(t("admin.toast.created", { name: t("admin.beats.beatLabel") }));
      }
      resetForm();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || t("admin.toast.errorSaving"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (beatId) => {
    const ok = await confirm(t("admin.confirm.deleteTitle", { name: t("admin.beats.beatLabel") }), t("admin.confirm.deleteMessage", { item: beats.find(b => b._id === beatId)?.title }));
    if (!ok) return;
    try {
      await adminService.beats.delete(beatId);
      toast.success(t("admin.toast.deleted", { name: t("admin.beats.beatLabel") }));
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || t("admin.toast.errorDeleting"));
    }
  };

  const handleBatchFiles = (e) => setBatchFiles(Array.from(e.target.files));
  const handleDrop = (e) => { e.preventDefault(); setBatchFiles(Array.from(e.dataTransfer.files)); };
  const handleDragOver = (e) => e.preventDefault();
  const removeBatchFile = (index) => setBatchFiles((prev) => prev.filter((_, i) => i !== index));

  const handleBatchUpload = async () => {
    if (batchFiles.length === 0) return;
    setBatchUploading(true);
    setBatchProgress(t("admin.uploader.uploadingToB2"));
    try {
      const uploadRes = await adminService.upload.batch(batchFiles, "beats");
      const urls = uploadRes.data.urls;
      setBatchProgress(t("admin.uploader.creatingItems", { name: t("admin.beats.beatLabel").toLowerCase() }));
      const beatsData = urls.map((item) => ({
        title: item.originalName.replace(/\.[^/.]+$/, ""),
        artist: "", description: "", audioFile: item.url,
      }));
      await adminService.beats.batch(id, beatsData);
      toast.success(t("admin.toast.batchUploaded", { count: beatsData.length }));
      setBatchMode(false);
      setBatchFiles([]);
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || t("admin.common.unknownError");
      toast.error(t("admin.toast.batchError", { message: msg }));
    } finally {
      setBatchUploading(false);
      setBatchProgress("");
    }
  };

  const cancelBatch = () => { setBatchMode(false); setBatchFiles([]); setBatchProgress(""); };

  return (
    <div>
      <SpinnerStyles />
      <div style={{ marginBottom: 24 }}>
        <Link to="/admin/playlists" className={styles.backLink}>
          <Icons.Back size={14} /> {t("nav.backToCatalogs")}
        </Link>
        <h2 className={styles.pageTitle} style={{ margin: "8px 0 0" }}>{playlist?.title || t("admin.beats.title")}</h2>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
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
                placeholder={t("admin.common.titlePlaceholder")} className={styles.input} style={errors.title ? INPUT_ERROR : undefined} />
              {errors.title && <p style={{ color: "#c62828", fontSize: 12, margin: "4px 0 0" }}>{errors.title}</p>}
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
            {errors.audioFile && <p style={{ color: "#c62828", fontSize: 12, margin: "4px 0" }}>{errors.audioFile}</p>}
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
          <h3 className={styles.formTitle} style={{ marginBottom: 12 }}>
            <Icons.Upload size={16} style={{ verticalAlign: "middle", marginRight: 6 }} /> {t("admin.beats.batchTitle")}
          </h3>
          <p className={styles.batchHint}>{t("admin.beats.batchHint")}</p>
          <div onDrop={handleDrop} onDragOver={handleDragOver}
            onClick={() => document.getElementById("batch-input-beats")?.click()}
            className={styles.batchDrop}>
            <input id="batch-input-beats" type="file" multiple accept="audio/*"
              style={{ display: "none" }} onChange={handleBatchFiles} />
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
                    <Icons.MusicNote size={14} style={{ flexShrink: 0 }} />
                    <span className={styles.batchFileName}>{file.name}</span>
                    <span className={styles.batchFileTitle}>→ {file.name.replace(/\.[^/.]+$/, "")}</span>
                    <button onClick={() => removeBatchFile(i)} className={styles.batchRemoveBtn}><Icons.Delete size={13} /></button>
                  </div>
                ))}
              </div>
              <div className={styles.formActions} style={{ marginTop: 16 }}>
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
