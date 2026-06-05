import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { adminService } from "../../services/api";
import { AdminUploader } from "./AdminUploader";
import { Icons } from "./icons";
import styles from "./admin.module.css";

export const AdminSamples = () => {
  const { id } = useParams();
  const [samples, setSamples] = useState([]);
  const [pack, setPack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editSample, setEditSample] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", audioFile: "" });
  const [batchMode, setBatchMode] = useState(false);
  const [batchFiles, setBatchFiles] = useState([]);
  const [batchUploading, setBatchUploading] = useState(false);
  const [batchProgress, setBatchProgress] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const [packsRes, samplesRes] = await Promise.all([
        adminService.samplepacks.list(),
        adminService.samples.list(id),
      ]);
      setPack(packsRes.data.find((p) => p._id === id));
      setSamples(samplesRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const resetForm = () => {
    setForm({ title: "", description: "", audioFile: "" });
    setEditSample(null);
    setShowForm(false);
  };

  const handleEdit = (sample) => {
    setForm({ title: sample.title, description: sample.description, audioFile: sample.audioFile });
    setEditSample(sample);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.audioFile) {
      alert("Title and audio file are required");
      return;
    }
    try {
      if (editSample) {
        await adminService.samples.update(editSample._id, form);
      } else {
        await adminService.samples.create(id, form);
      }
      resetForm();
      fetchData();
    } catch {
      alert("Error saving");
    }
  };

  const handleDelete = async (sampleId) => {
    if (!window.confirm("Delete this sample?")) return;
    try {
      await adminService.samples.delete(sampleId);
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
      const uploadRes = await adminService.upload.batch(batchFiles, "samples");
      const urls = uploadRes.data.urls;

      setBatchProgress("Creating samples...");
      const samples = urls.map((item) => ({
        title: item.originalName.replace(/\.[^/.]+$/, ""),
        description: "",
        audioFile: item.url,
      }));

      await adminService.samples.batch(id, samples);
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
        <Link to="/admin/samplepacks" className={styles.backLink}>
          <Icons.Back size={14} /> Back to Sample Packs
        </Link>
        <h2 className={styles.pageTitle} style={{ margin: "8px 0 0" }}>{pack?.title || "Samples"}</h2>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <button onClick={() => { resetForm(); setShowForm(true); }} className={styles.btnPrimary}>
          <Icons.Add size={16} /> New Sample
        </button>
        {!batchMode && (
          <button onClick={() => { setShowForm(false); setBatchMode(true); }} className={styles.btnSecondary}>
            <Icons.Upload size={16} /> Batch Upload
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className={styles.formBox}>
          <h3 className={styles.formTitle}>{editSample ? "Edit Sample" : "New Sample"}</h3>
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
              <AdminUploader folder="samples" accept="audio/*" onUpload={(url) => setForm({ ...form, audioFile: url })} />
            )}
          </div>
          <div className={styles.formActions}>
            <button type="submit" className={styles.btnPrimary}>{editSample ? "Update" : "Save"}</button>
            <button type="button" onClick={resetForm} className={styles.btnSecondary}>Cancel</button>
          </div>
        </form>
      )}

      {batchMode && (
        <div className={styles.batchBox}>
          <h3 className={styles.formTitle} style={{ marginBottom: 12 }}>
            <Icons.Upload size={16} style={{ verticalAlign: "middle", marginRight: 6 }} />
            Batch Upload Samples
          </h3>
          <p className={styles.batchHint}>Filenames will be used as sample titles (e.g. kick.wav → "kick")</p>

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
                <Icons.Upload size={16} /> Upload {batchFiles.length} sample{batchFiles.length > 1 ? "s" : ""}
              </button>
              <button onClick={cancelBatch} className={styles.btnSecondary}>Cancel</button>
            </div>
          )}
        </div>
      )}

      <div className={styles.gridItems + " " + styles.mt16}>
        {samples.length === 0 && <p className={styles.emptyText}>No samples in this pack.</p>}
        {samples.map((sample) => (
          <div key={sample._id} className={styles.itemCard}>
            <div className={styles.itemContent}>
              <p className={styles.itemTitle}>{sample.title}</p>
              <p className={styles.itemDesc}>{sample.description || <span style={{ color: "#444", fontStyle: "italic" }}>no description</span>}</p>
            </div>
            <button onClick={() => handleEdit(sample)} className={styles.btnSmall}><Icons.Edit size={13} /> Edit</button>
            <button onClick={() => handleDelete(sample._id)} className={`${styles.btnSmall} ${styles.btnDanger}`}><Icons.Delete size={13} /> Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};
