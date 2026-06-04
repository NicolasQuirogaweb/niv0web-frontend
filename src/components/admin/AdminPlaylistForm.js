import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { adminService } from "../../services/api";
import { AdminUploader } from "./AdminUploader";

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
      alert("Completa todos los campos obligatorios");
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
      alert("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const title = isSamplePack ? "Sample Pack" : `Catálogo (${type === "loops" ? "Loops" : "Beats"})`;

  return (
    <div style={{ maxWidth: 600 }}>
      <h2 style={{ color: "#fff", marginBottom: 24, fontSize: 22 }}>
        {isEdit ? `Editar ${title}` : `Nuevo ${title}`}
      </h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={{ color: "#aaa", fontSize: 13, marginBottom: 4, display: "block" }}>Título *</label>
          <input name="title" value={form.title} onChange={handleChange} style={inputStyle} placeholder="Ej: Trap Essentials Vol.1" />
        </div>
        <div>
          <label style={{ color: "#aaa", fontSize: 13, marginBottom: 4, display: "block" }}>Descripción *</label>
          <textarea name="description" value={form.description} onChange={handleChange} style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} placeholder="Descripción del catálogo" />
        </div>
        <div>
          <label style={{ color: "#aaa", fontSize: 13, marginBottom: 4, display: "block" }}>Imagen de portada *</label>
          <AdminUploader folder="images" accept="image/*" onUpload={(url) => setForm({ ...form, imageUrl: url })} />
          {form.imageUrl && <p style={{ color: "#4caf50", fontSize: 12, margin: "4px 0 0" }}>✓ Imagen subida</p>}
        </div>
        {!isSamplePack && (
          <div>
            <label style={{ color: "#aaa", fontSize: 13, marginBottom: 4, display: "block" }}>Video de fondo *</label>
            <AdminUploader folder="videos" accept="video/*" onUpload={(url) => setForm({ ...form, backgroundVideo: url })} />
            {form.backgroundVideo && <p style={{ color: "#4caf50", fontSize: 12, margin: "4px 0 0" }}>✓ Video subido</p>}
          </div>
        )}
        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          <button type="submit" disabled={saving} style={{
            ...btnPrimary, opacity: saving ? 0.6 : 1,
          }}>
            {saving ? "Guardando..." : isEdit ? "Actualizar" : "Crear catálogo"}
          </button>
          <button type="button" onClick={() => navigate(redirectBase)} style={btnSecondary}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

const inputStyle = {
  width: "100%", padding: "10px 12px", borderRadius: 6, border: "1px solid #333",
  background: "#1a1a1a", color: "#e0e0e0", fontSize: 14, boxSizing: "border-box",
  fontFamily: "monospace",
};

const btnPrimary = {
  background: "#333", color: "#fff", padding: "10px 20px", borderRadius: 6,
  border: "1px solid #555", cursor: "pointer", fontSize: 14, fontFamily: "monospace",
};

const btnSecondary = {
  background: "transparent", color: "#888", padding: "10px 20px", borderRadius: 6,
  border: "1px solid #333", cursor: "pointer", fontSize: 14, fontFamily: "monospace",
};
