import { useState, useEffect } from "react";
import { adminService } from "../../services/api";
import { AdminUploader } from "./AdminUploader";
import { Icons } from "./icons";
import styles from "./admin.module.css";

export const AdminProdMixMaster = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", audioFile: "" });

  const fetchItems = () => {
    setLoading(true);
    adminService.prodmix.list()
      .then((res) => setItems(res.data))
      .catch((err) => console.error("Error loading prodmix:", err.response?.data || err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchItems(); }, []);

  const resetForm = () => {
    setForm({ title: "", description: "", audioFile: "" });
    setEditItem(null);
    setShowForm(false);
  };

  const handleEdit = (item) => {
    setForm({ title: item.title, description: item.description, audioFile: item.audioFile });
    setEditItem(item);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.audioFile) {
      alert("Title and audio file are required");
      return;
    }
    try {
      if (editItem) {
        await adminService.prodmix.update(editItem._id, form);
      } else {
        await adminService.prodmix.create(form);
      }
      resetForm();
      fetchItems();
    } catch {
      alert("Error saving");
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm("Delete this prod mix master?")) return;
    try {
      await adminService.prodmix.delete(itemId);
      fetchItems();
    } catch {
      alert("Error deleting");
    }
  };

  if (loading) return <p className={styles.loadingText}>Loading...</p>;

  return (
    <div>
      <div className={styles.headerRow}>
        <h2 className={styles.pageTitle}>Prod Mix Masters</h2>
        <button onClick={() => { resetForm(); setShowForm(true); }} className={styles.btnPrimary}><Icons.Add size={16} /> New</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className={styles.formBox}>
          <h3 className={styles.formTitle}>{editItem ? "Edit" : "New Prod Mix Master"}</h3>
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
              <AdminUploader folder="prodmixmasters" accept="audio/*" onUpload={(url) => setForm({ ...form, audioFile: url })} />
            )}
          </div>
          <div className={styles.formActions}>
            <button type="submit" className={styles.btnPrimary}>{editItem ? "Update" : "Save"}</button>
            <button type="button" onClick={resetForm} className={styles.btnSecondary}>Cancel</button>
          </div>
        </form>
      )}

      <div className={styles.gridItems}>
        {items.length === 0 && <p className={styles.emptyText}>No items.</p>}
        {items.map((item) => (
          <div key={item._id} className={styles.itemCard}>
            <div className={styles.itemContent}>
              <p className={styles.itemTitle}>{item.title}</p>
              <p className={styles.itemDescPlain}>{item.description}</p>
            </div>
            <button onClick={() => handleEdit(item)} className={styles.btnSmall}><Icons.Edit size={13} /> Edit</button>
            <button onClick={() => handleDelete(item._id)} className={`${styles.btnSmall} ${styles.btnDanger}`}><Icons.Delete size={13} /> Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};
