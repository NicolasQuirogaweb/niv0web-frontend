import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { adminService } from "../../services/api";
import { AdminUploader } from "./AdminUploader";
import { Icons } from "./icons";
import styles from "./admin.module.css";

export const AdminBeats = () => {
  const { id } = useParams();
  const [beats, setBeats] = useState([]);
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editBeat, setEditBeat] = useState(null);
  const [form, setForm] = useState({ title: "", artist: "", description: "", audioFile: "" });
  const [batchMode, setBatchMode] = useState(false);
  const [batchFiles, setBatchFiles] = useState([]);
  const [batchUploading, setBatchUploading] = useState(false);
  const [batchProgress, setBatchProgress] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const [playlistsRes, beatsRes] = await Promise.all([
        adminService.playlists.list(),
        adminService.beats.list(id),
      ]);
      setPlaylist(playlistsRes.data.find((p) => p._id === id));
      setBeats(beatsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const resetForm = () => {
    setForm({ title: "", artist: "", description: "", audioFile: "" });
    setEditBeat(null);
    setShowForm(false);
  };

  const handleEdit = (beat) => {
    setForm({ title: beat.title, artist: beat.artist, description: beat.description, audioFile: beat.audioFile });
    setEditBeat(beat);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.audioFile) {
      alert("Title and audio file are required");
      return;
    }
    try {
      if (editBeat) {
        await adminService.beats.update(editBeat._id, form);
      } else {
        await adminService.beats.create(id, form);
      }
      resetForm();
      fetchData();
    } catch {
      alert("Error saving");
    }
  };

  const handleDelete = async (beatId) => {
    if (!window.confirm("Delete this beat?")) return;
    try {
      await adminService.beats.delete(beatId);
      fetchData();
    } catch {
      alert("Error deleting");
    }
  };

  const handleBatchFiles = (e) => {
    setBatchFiles(Array.from(e.target.files));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setBatchFiles(Array.from(e.dataTransfer.files));
  };

  const handleDragOver = (e) => e.preventDefault();

  const removeBatchFile = (index) => {
    setBatchFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleBatchUpload = async () => {
    if (batchFiles.length === 0) return;
    setBatchUploading(true);
    setBatchProgress("Uploading files to B2...");
    try {
      const uploadRes = await adminService.upload.batch(batchFiles, "beats");
      const urls = uploadRes.data.urls;

      setBatchProgress("Creating beats...");
      const beats = urls.map((item) => ({
        title: item.originalName.replace(/\.[^/.]+$/, ""),
        artist: "",
        description: "",
        audioFile: item.url,
      }));

      await adminService.beats.batch(id, beats);
      setBatchMode(false);
      setBatchFiles([]);
      fetchData();
    } catch (err) {
      console.error("Batch upload error:", err);
      const msg = err.response?.data?.message || err.response?.data?.detail || err.message || "Unknown error";
      alert("Error in batch upload: " + msg);
    } finally {
      setBatchUploading(false);
      setBatchProgress("");
    }
  };

  const cancelBatch = () => {
    setBatchMode(false);
    setBatchFiles([]);
    setBatchProgress("");
  };

  if (loading) return <p className={styles.loadingText}>Loading...</p>;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Link to="/admin/playlists" className={styles.backLink}>
          <Icons.Back size={14} /> Back to Catalogs
        </Link>
        <h2 className={styles.subTitle}>{playlist?.title || "Beats"}</h2>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <button onClick={() => { resetForm(); setShowForm(true); }} className={styles.btnPrimary}>
          <Icons.Add size={16} /> New Beat
        </button>
        {!batchMode && (
          <button onClick={() => { setShowForm(false); setBatchMode(true); }} className={styles.btnSecondary}>
            <Icons.Upload size={16} /> Batch Upload
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className={styles.formBox}>
          <h3 className={styles.formTitle}>{editBeat ? "Edit Beat" : "New Beat"}</h3>
          <div className={styles.gridForm}>
            <input name="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" className={styles.input} />
            <input name="artist" value={form.artist} onChange={(e) => setForm({ ...form, artist: e.target.value })} placeholder="Artist" className={styles.input} />
          </div>
          <textarea name="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className={styles.textarea} />
          <div className={styles.mt16}>
            <label className={styles.labelPlain}>Audio File *</label>
            {form.audioFile ? (
              <div className={styles.audioRow}>
                <p className={styles.uploadSuccessInline}>✓ Audio uploaded</p>
                <button type="button" onClick={() => setForm({ ...form, audioFile: "" })} className={styles.changeBtn}>Change</button>
              </div>
            ) : (
              <AdminUploader folder="beats" accept="audio/*" onUpload={(url) => setForm({ ...form, audioFile: url })} />
            )}
          </div>
          <div className={styles.formActions}>
            <button type="submit" className={styles.btnPrimary}>{editBeat ? "Update" : "Save"}</button>
            <button type="button" onClick={resetForm} className={styles.btnSecondary}>Cancel</button>
          </div>
        </form>
      )}

      {batchMode && (
        <div className={styles.batchBox}>
          <h3 className={styles.formTitle} style={{ marginBottom: 12 }}>
            <Icons.Upload size={16} style={{ verticalAlign: "middle", marginRight: 6 }} />
            Batch Upload Beats
          </h3>
          <p className={styles.batchHint}>Filenames will be used as beat titles (e.g. my-beat.wav → "my-beat")</p>

          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => document.getElementById("batch-input")?.click()}
            className={styles.batchDrop}
          >
            <input
              id="batch-input"
              type="file"
              multiple
              accept="audio/*"
              style={{ display: "none" }}
              onChange={handleBatchFiles}
            />
            {batchFiles.length === 0 && !batchUploading ? (
              <div>
                <p className={styles.dragHint}>Drop audio files here or click to select</p>
                <p className={styles.supportedHint}>You can select multiple files at once</p>
              </div>
            ) : batchUploading ? (
              <p className={styles.uploadProgress}>{batchProgress}</p>
            ) : null}
          </div>

          {batchFiles.length > 0 && !batchUploading && (
            <div className={styles.batchList}>
              {batchFiles.map((file, i) => (
                <div key={i} className={styles.batchFileRow}>
                  <Icons.MusicNote size={14} style={{ flexShrink: 0 }} />
                  <span className={styles.batchFileName}>{file.name}</span>
                  <span className={styles.batchFileTitle}>→ {file.name.replace(/\.[^/.]+$/, "")}</span>
                  <button onClick={() => removeBatchFile(i)} className={styles.batchRemoveBtn}>
                    <Icons.Delete size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {batchFiles.length > 0 && !batchUploading && (
            <div className={styles.formActions} style={{ marginTop: 16 }}>
              <button onClick={handleBatchUpload} className={styles.btnPrimary}>
                <Icons.Upload size={16} /> Upload {batchFiles.length} beat{batchFiles.length > 1 ? "s" : ""}
              </button>
              <button onClick={cancelBatch} className={styles.btnSecondary}>Cancel</button>
            </div>
          )}
        </div>
      )}

      <div className={styles.gridItems + " " + styles.mt16}>
        {beats.length === 0 && <p className={styles.emptyText}>No beats in this catalog.</p>}
        {beats.map((beat) => (
          <div key={beat._id} className={styles.itemCard}>
            <div className={styles.itemContent}>
              <p className={styles.itemTitle}>{beat.title}</p>
              <p className={styles.itemArtist}>{beat.artist}</p>
              <p className={styles.itemDesc}>{beat.description}</p>
            </div>
            <button onClick={() => handleEdit(beat)} className={styles.btnSmall}><Icons.Edit size={13} /> Edit</button>
            <button onClick={() => handleDelete(beat._id)} className={`${styles.btnSmall} ${styles.btnDanger}`}><Icons.Delete size={13} /> Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};
