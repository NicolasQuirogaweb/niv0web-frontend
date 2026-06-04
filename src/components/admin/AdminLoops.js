import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { adminService } from "../../services/api";
import { AdminUploader } from "./AdminUploader";

export const AdminLoops = () => {
  const { id } = useParams();
  const [loops, setLoops] = useState([]);
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editLoop, setEditLoop] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", audioFile: "" });

  const fetchData = async () => {
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
  };

  useEffect(() => { fetchData(); }, [id]);

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
    if (!form.title || !form.description || !form.audioFile) {
      alert("Todos los campos son obligatorios");
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
      alert("Error al guardar");
    }
  };

  const handleDelete = async (loopId) => {
    if (!window.confirm("¿Eliminar este loop?")) return;
    try {
      await adminService.loops.delete(loopId);
      fetchData();
    } catch {
      alert("Error al eliminar");
    }
  };

  if (loading) return <p style={{ color: "#888" }}>Cargando...</p>;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Link to="/admin/loops" style={{ color: "#888", fontSize: 13, textDecoration: "none" }}>← Volver a catálogos de loops</Link>
        <h2 style={{ color: "#fff", margin: "8px 0 0", fontSize: 22 }}>{playlist?.title || "Loops"}</h2>
      </div>

      <button onClick={() => { resetForm(); setShowForm(true); }} style={btnPrimary}>
        + Nuevo loop
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: "#1a1a1a", padding: 20, borderRadius: 8, marginTop: 16, border: "1px solid #222" }}>
          <h3 style={{ color: "#fff", margin: "0 0 16px" }}>{editLoop ? "Editar loop" : "Nuevo loop"}</h3>
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
              <AdminUploader folder="loops" accept="audio/*" onUpload={(url) => setForm({ ...form, audioFile: url })} />
            )}
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            <button type="submit" style={btnPrimary}>{editLoop ? "Actualizar" : "Guardar"}</button>
            <button type="button" onClick={resetForm} style={btnSecondary}>Cancelar</button>
          </div>
        </form>
      )}

      <div style={{ marginTop: 16, display: "grid", gap: 8 }}>
        {loops.length === 0 && <p style={{ color: "#555" }}>No hay loops en este catálogo.</p>}
        {loops.map((loop) => (
          <div key={loop._id} style={{ background: "#1a1a1a", borderRadius: 6, padding: 12, border: "1px solid #222", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: "#fff", margin: 0, fontWeight: "bold" }}>{loop.title}</p>
              <p style={{ color: "#555", margin: "2px 0 0", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{loop.description}</p>
            </div>
            <button onClick={() => handleEdit(loop)} style={btnSmall}>Editar</button>
            <button onClick={() => handleDelete(loop._id)} style={{ ...btnSmall, color: "#f44336" }}>Eliminar</button>
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
