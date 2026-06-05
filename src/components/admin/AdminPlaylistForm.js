import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { adminService } from "../../services/api";
import { AdminUploader } from "./AdminUploader";
import styles from "./admin.module.css";

export const AdminPlaylistForm = ({ type = "beats" }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [form, setForm] = useState({
    title: "", description: "", imageUrl: "", backgroundVideo: "",
  });
  const [saving, setSaving] = useState(false);

  const isSamplePack = type === "samples";
  const redirectBase = isSamplePack ? "/admin/samplepacks" : type === "loops" ? "/admin/loops" : "/admin/playlists";

  useEffect(() => {
    if (isEdit) {
      adminService.playlists.list()
        .then((res) => {
          const item = res.data.find((p) => p._id === id);
          if (item) setForm({ title: item.title, description: item.description, imageUrl: item.imageUrl, backgroundVideo: item.backgroundVideo || "" });
        })
        .catch(() => {});
    }
  }, [id, isEdit]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.imageUrl) {
      alert("Please fill all required fields");
      return;
    }
    setSaving(true);
    try {
      if (isSamplePack) {
        if (isEdit) {
          await adminService.samplepacks.update(id, form);
        } else {
          await adminService.samplepacks.create(form);
        }
      } else {
        const data = { ...form, type, backgroundVideo: form.backgroundVideo || " " };
        if (isEdit) {
          await adminService.playlists.update(id, data);
        } else {
          await adminService.playlists.create(data);
        }
      }
      navigate(redirectBase);
    } catch {
      alert("Error saving");
    } finally {
      setSaving(false);
    }
  };

  const title = isSamplePack ? "Sample Pack" : `Catalog (${type === "loops" ? "Loops" : "Beats"})`;

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.pageTitleMb}>
        {isEdit ? `Edit ${title}` : `New ${title}`}
      </h2>
      <form onSubmit={handleSubmit} className={styles.formStack}>
        <div>
          <label className={styles.label}>Title *</label>
          <input name="title" value={form.title} onChange={handleChange} className={styles.input} placeholder="e.g. Trap Essentials Vol.1" />
        </div>
        <div>
          <label className={styles.label}>Description *</label>
          <textarea name="description" value={form.description} onChange={handleChange} className={styles.textareaLg} placeholder="Catalog description" />
        </div>
        <div>
          <label className={styles.label}>Cover Image *</label>
          <AdminUploader folder="images" accept="image/*" onUpload={(url) => setForm({ ...form, imageUrl: url })} />
          {form.imageUrl && <p className={styles.uploadSuccess}>✓ Image uploaded</p>}
        </div>
        {!isSamplePack && (
          <div>
            <label className={styles.label}>Background Video *</label>
            <AdminUploader folder="videos" accept="video/*" onUpload={(url) => setForm({ ...form, backgroundVideo: url })} />
            {form.backgroundVideo && <p className={styles.uploadSuccess}>✓ Video uploaded</p>}
          </div>
        )}
        <div className={styles.formActions} style={{ marginTop: 8 }}>
          <button type="submit" disabled={saving} className={styles.btnPrimary} style={{ opacity: saving ? 0.6 : 1 }}>
            {saving ? "Saving..." : isEdit ? "Update" : "Create Catalog"}
          </button>
          <button type="button" onClick={() => navigate(redirectBase)} className={styles.btnSecondary}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
