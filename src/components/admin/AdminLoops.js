import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { adminService } from "../../services/api";
import { AdminUploader } from "./AdminUploader";
import { Icons } from "./icons";
import styles from "./admin.module.css";

export const AdminLoops = () => {
  const { id } = useParams();
  const [loops, setLoops] = useState([]);
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editLoop, setEditLoop] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", audioFile: "" });

  const fetchData = useCallback(async () => {
    try {
      const [playlistsRes, loopsRes] = await Promise.all([
        adminService.playlists.list(),
        adminService.loops.list(id),
      ]);
      setPlaylist(playlistsRes.data.find((p) => p._id === id));
      setLoops(loopsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const resetForm = () => {
    setForm({ title: "", description: "", audioFile: "" });
    setEditLoop(null);
    setShowForm(false);
  };

  const handleEdit = (loop) => {
    setForm({ title: loop.title, description: loop.description, audioFile: loop.audioFile });
    setEditLoop(loop);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.audioFile) {
      alert("Title and audio file are required");
      return;
    }
    try {
      if (editLoop) {
        await adminService.loops.update(editLoop._id, form);
      } else {
        await adminService.loops.create(id, form);
      }
      resetForm();
      fetchData();
    } catch {
      alert("Error saving");
    }
  };

  const handleDelete = async (loopId) => {
    if (!window.confirm("Delete this loop?")) return;
    try {
      await adminService.loops.delete(loopId);
      fetchData();
    } catch {
      alert("Error deleting");
    }
  };

  if (loading) return <p className={styles.loadingText}>Loading...</p>;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Link to="/admin/loops" className={styles.backLink}>
          <Icons.Back size={14} /> Back to Loop Catalogs
        </Link>
        <h2 className={styles.subTitle}>{playlist?.title || "Loops"}</h2>
      </div>

      <button onClick={() => { resetForm(); setShowForm(true); }} className={styles.btnPrimary}>
        <Icons.Add size={16} /> New Loop
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className={styles.formBox}>
          <h3 className={styles.formTitle}>{editLoop ? "Edit Loop" : "New Loop"}</h3>
          <input name="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" className={styles.input} />
          <textarea name="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className={styles.textarea} />
          <div className={styles.mt16}>
            <label className={styles.labelPlain}>Audio File *</label>
            {form.audioFile ? (
              <div className={styles.audioRow}>
                <p className={styles.uploadSuccessInline}>✓ Audio uploaded</p>
                <button type="button" onClick={() => setForm({ ...form, audioFile: "" })} className={styles.changeBtn}>Change</button>
              </div>
            ) : (
              <AdminUploader folder="loops" accept="audio/*" onUpload={(url) => setForm({ ...form, audioFile: url })} />
            )}
          </div>
          <div className={styles.formActions}>
            <button type="submit" className={styles.btnPrimary}>{editLoop ? "Update" : "Save"}</button>
            <button type="button" onClick={resetForm} className={styles.btnSecondary}>Cancel</button>
          </div>
        </form>
      )}

      <div className={styles.gridItems + " " + styles.mt16}>
        {loops.length === 0 && <p className={styles.emptyText}>No loops in this catalog.</p>}
        {loops.map((loop) => (
          <div key={loop._id} className={styles.itemCard}>
            <div className={styles.itemContent}>
              <p className={styles.itemTitle}>{loop.title}</p>
              <p className={styles.itemDesc}>{loop.description}</p>
            </div>
            <button onClick={() => handleEdit(loop)} className={styles.btnSmall}><Icons.Edit size={13} /> Edit</button>
            <button onClick={() => handleDelete(loop._id)} className={`${styles.btnSmall} ${styles.btnDanger}`}><Icons.Delete size={13} /> Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};
