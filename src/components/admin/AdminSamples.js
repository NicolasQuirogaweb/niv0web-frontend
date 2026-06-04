import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { adminService } from "../../services/api";
import { AdminUploader } from "./AdminUploader";

export const AdminSamples = () => {
  const { id } = useParams();
  const [samples, setSamples] = useState([]);
  const [pack, setPack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editSample, setEditSample] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", audioFile: "" });

  const fetchData = async () => {
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
  };

  useEffect(() => { fetchData(); }, [id]);

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
    if (!form.title || !form.description || !form.audioFile) {
      alert("Todos los campos son obligatorios");
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
      alert("Error al guardar");
    }
  };

  const handleDelete = async (sampleId) => {
    if (!window.confirm("¿Eliminar este sample?")) return;
    try {
      await adminService.samples.delete(sampleId);
      fetchData();
    } catch {
      alert("Error al eliminar");
    }
  };

  if (loading) return <p style={{ color: "#888" }}>Cargando...</p>;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Link to="/admin/samplepacks" style={{ color: "#888", fontSize: 13, textDecoration: "none" }}>← Volver a sample packs</Link>
        <h2 style={{ color: "#fff", margin: "8px 0 0", fontSize: 22 }}>{pack?.title || "Samples"}</h2>
      </div>

      <button onClick={() => { resetForm(); setShowForm(true); }} style={btnPrimary}>+ Nuevo sample</button>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: "#1a1a1a", padding: 20, borderRadius: 8, marginTop: 16, border: "1px solid #222" }}>
          <h3 style={{ color: "#fff", margin: "0 0 16px" }}>{editSample ? "Editar sample" : "Nuevo sample"}</h3>
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
              <AdminUploader folder="samples" accept="audio/*" onUpload={(url) => setForm({ ...form, audioFile: url })} />
            )}
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            <button type="submit" style={btnPrimary}>{editSample ? "Actualizar" : "Guardar"}</button>
            <button type="button" onClick={resetForm} style={btnSecondary}>Cancelar</button>
          </div>
        </form>
      )}

      <div style={{ marginTop: 16, display: "grid", gap: 8 }}>
        {samples.length === 0 && <p style={{ color: "#555" }}>No hay samples en este pack.</p>}
        {samples.map((sample) => (
          <div key={sample._id} style={{ background: "#1a1a1a", borderRadius: 6, padding: 12, border: "1px solid #222", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: "#fff", margin: 0, fontWeight: "bold" }}>{sample.title}</p>
              <p style={{ color: "#555", margin: "2px 0 0", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sample.description}</p>
            </div>
            <button onClick={() => handleEdit(sample)} style={btnSmall}>Editar</button>
            <button onClick={() => handleDelete(sample._id)} style={{ ...btnSmall, color: "#f44336" }}>Eliminar</button>
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
