import { useState, useEffect } from "react";
import { adminService } from "../../services/api";
import { AdminUploader } from "./AdminUploader";

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
      .catch(() => {})
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
    if (!form.title || !form.description || !form.audioFile) {
      alert("Todos los campos son obligatorios");
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
      alert("Error al guardar");
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm("¿Eliminar este prod mix master?")) return;
    try {
      await adminService.prodmix.delete(itemId);
      fetchItems();
    } catch {
      alert("Error al eliminar");
    }
  };

  if (loading) return <p style={{ color: "#888" }}>Cargando...</p>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ color: "#fff", margin: 0, fontSize: 22 }}>Prod Mix Masters</h2>
        <button onClick={() => { resetForm(); setShowForm(true); }} style={btnPrimary}>+ Nuevo</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: "#1a1a1a", padding: 20, borderRadius: 8, marginBottom: 16, border: "1px solid #222" }}>
          <h3 style={{ color: "#fff", margin: "0 0 16px" }}>{editItem ? "Editar" : "Nuevo Prod Mix Master"}</h3>
          <input name="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Título" style={inputStyle} />
          <textarea name="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descripción" style={{ ...inputStyle, marginTop: 12, minHeight: 60, resize: "vertical" }} />
          <div style={{ marginTop: 12 }}>
            <label style={{ color: "#aaa", fontSize: 13, display: "block", marginBottom: 4 }}>Archivo de audio *</label>
            {form.audioFile ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <p style={{ color: "#4caf50", fontSize: 12 }}>✓ Audio subido</p>
                <button type="button" onClick={() => setForm({ ...form, audioFile: "" })} style={{ background: "none", border: "none", color: "#f44336", cursor: "pointer", fontSize: 12 }}>Cambiar</button>
              </div>
            ) : (
              <AdminUploader folder="prodmixmasters" accept="audio/*" onUpload={(url) => setForm({ ...form, audioFile: url })} />
            )}
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            <button type="submit" style={btnPrimary}>{editItem ? "Actualizar" : "Guardar"}</button>
            <button type="button" onClick={resetForm} style={btnSecondary}>Cancelar</button>
          </div>
        </form>
      )}

      <div style={{ display: "grid", gap: 8 }}>
        {items.length === 0 && <p style={{ color: "#555" }}>No hay items.</p>}
        {items.map((item) => (
          <div key={item._id} style={{ background: "#1a1a1a", borderRadius: 6, padding: 12, border: "1px solid #222", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: "#fff", margin: 0, fontWeight: "bold" }}>{item.title}</p>
              <p style={{ color: "#555", margin: "2px 0 0", fontSize: 12 }}>{item.description}</p>
            </div>
            <button onClick={() => handleEdit(item)} style={btnSmall}>Editar</button>
            <button onClick={() => handleDelete(item._id)} style={{ ...btnSmall, color: "#f44336" }}>Eliminar</button>
          </div>
        ))}
      </div>
    </div>
  );
};

const inputStyle = {
  width: "100%", padding: "10px 12px", borderRadius: 6, border: "1px solid #333",
  background: "#0d0d0d", color: "#e0e0e0", fontSize: 14, boxSizing: "border-box", fontFamily: "monospace",
};

const btnPrimary = {
  background: "#333", color: "#fff", padding: "10px 20px", borderRadius: 6,
  border: "1px solid #555", cursor: "pointer", fontSize: 13, fontFamily: "monospace",
};

const btnSecondary = {
  background: "transparent", color: "#888", padding: "10px 20px", borderRadius: 6,
  border: "1px solid #333", cursor: "pointer", fontSize: 13, fontFamily: "monospace",
};

const btnSmall = {
  background: "#222", color: "#ccc", padding: "6px 12px", borderRadius: 4,
  border: "1px solid #333", cursor: "pointer", fontSize: 12, fontFamily: "monospace",
};
