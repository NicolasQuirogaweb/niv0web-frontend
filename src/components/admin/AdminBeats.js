import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { adminService } from "../../services/api";
import { AdminUploader } from "./AdminUploader";

export const AdminBeats = () => {
  const { id } = useParams();
  const [beats, setBeats] = useState([]);
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editBeat, setEditBeat] = useState(null);
  const [form, setForm] = useState({ title: "", artist: "", description: "", audioFile: "" });

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
    if (!form.title || !form.artist || !form.description || !form.audioFile) {
      alert("Todos los campos son obligatorios");
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
      alert("Error al guardar");
    }
  };

  const handleDelete = async (beatId) => {
    if (!window.confirm("¿Eliminar este beat?")) return;
    try {
      await adminService.beats.delete(beatId);
      fetchData();
    } catch {
      alert("Error al eliminar");
    }
  };

  if (loading) return <p style={{ color: "#888" }}>Cargando...</p>;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Link to="/admin/playlists" style={{ color: "#888", fontSize: 13, textDecoration: "none" }}>← Volver a catálogos</Link>
        <h2 style={{ color: "#fff", margin: "8px 0 0", fontSize: 22 }}>{playlist?.title || "Beats"}</h2>
      </div>

      <button onClick={() => { resetForm(); setShowForm(true); }} style={btnPrimary}>
        + Nuevo beat
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: "#1a1a1a", padding: 20, borderRadius: 8, marginTop: 16, border: "1px solid #222" }}>
          <h3 style={{ color: "#fff", margin: "0 0 16px" }}>{editBeat ? "Editar beat" : "Nuevo beat"}</h3>
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
            <input name="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Título" style={inputStyle} />
            <input name="artist" value={form.artist} onChange={(e) => setForm({ ...form, artist: e.target.value })} placeholder="Artista" style={inputStyle} />
          </div>
          <textarea name="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descripción" style={{ ...inputStyle, marginTop: 12, minHeight: 60, resize: "vertical" }} />
          <div style={{ marginTop: 12 }}>
            <label style={{ color: "#aaa", fontSize: 13, display: "block", marginBottom: 4 }}>Archivo de audio *</label>
            {form.audioFile ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <p style={{ color: "#4caf50", fontSize: 12 }}>✓ Audio subido</p>
                <button type="button" onClick={() => setForm({ ...form, audioFile: "" })} style={{ background: "none", border: "none", color: "#f44336", cursor: "pointer", fontSize: 12 }}>Cambiar</button>
              </div>
            ) : (
              <AdminUploader folder="beats" accept="audio/*" onUpload={(url) => setForm({ ...form, audioFile: url })} />
            )}
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            <button type="submit" style={btnPrimary}>{editBeat ? "Actualizar" : "Guardar"}</button>
            <button type="button" onClick={resetForm} style={btnSecondary}>Cancelar</button>
          </div>
        </form>
      )}

      <div style={{ marginTop: 16, display: "grid", gap: 8 }}>
        {beats.length === 0 && <p style={{ color: "#555" }}>No hay beats en este catálogo.</p>}
        {beats.map((beat) => (
          <div key={beat._id} style={{ background: "#1a1a1a", borderRadius: 6, padding: 12, border: "1px solid #222", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: "#fff", margin: 0, fontWeight: "bold" }}>{beat.title}</p>
              <p style={{ color: "#888", margin: "2px 0 0", fontSize: 13 }}>{beat.artist}</p>
              <p style={{ color: "#555", margin: "2px 0 0", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{beat.description}</p>
            </div>
            <button onClick={() => handleEdit(beat)} style={btnSmall}>Editar</button>
            <button onClick={() => handleDelete(beat._id)} style={{ ...btnSmall, color: "#f44336" }}>Eliminar</button>
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
