import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminService } from "../../services/api";

export const AdminPlaylists = ({ type = "beats" }) => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchPlaylists = () => {
    setLoading(true);
    adminService.playlists.list()
      .then((res) => setPlaylists(res.data.filter((p) => p.type === type)))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPlaylists(); }, [type]);

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este catálogo y todos sus items?")) return;
    try {
      await adminService.playlists.delete(id);
      fetchPlaylists();
    } catch {
      alert("Error al eliminar");
    }
  };

  const handleDuplicate = async (id) => {
    try {
      await adminService.playlists.duplicate(id);
      fetchPlaylists();
    } catch {
      alert("Error al duplicar");
    }
  };

  const label = type === "beats" ? "Beats" : "Loops";
  const newPath = type === "beats" ? "/admin/playlists/new" : "/admin/loops/new";

  if (loading) return <p style={{ color: "#888" }}>Cargando catálogos...</p>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ color: "#fff", margin: 0, fontSize: 22 }}>Catálogos ({label})</h2>
        <Link to={newPath} style={btnPrimary}>+ Nuevo catálogo</Link>
      </div>
      {playlists.length === 0 ? (
        <p style={{ color: "#555" }}>No hay catálogos de {label.toLowerCase()} todavía.</p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {playlists.map((pl) => (
            <div key={pl._id} style={{
              background: "#1a1a1a", borderRadius: 8, padding: 16, border: "1px solid #222",
              display: "flex", alignItems: "center", gap: 16,
            }}>
              <img
                src={pl.imageUrl}
                alt={pl.title}
                style={{ width: 60, height: 60, borderRadius: 6, objectFit: "cover", background: "#333" }}
                onError={(e) => { e.target.style.display = "none" }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: "#fff", margin: 0, fontWeight: "bold" }}>{pl.title}</p>
                <p style={{ color: "#888", margin: "4px 0 0", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {pl.description}
                </p>
                <p style={{ color: "#555", margin: "4px 0 0", fontSize: 12 }}>
                  {pl.itemsCount ?? 0} items
                </p>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                {type === "beats" ? (
                  <Link to={`/admin/playlists/${pl._id}/beats`} style={btnSmall}>Ver beats</Link>
                ) : (
                  <Link to={`/admin/loops/${pl._id}/loops`} style={btnSmall}>Ver loops</Link>
                )}
                {type === "beats" ? (
                  <Link to={`/admin/playlists/${pl._id}/edit`} style={btnSmall}>Editar</Link>
                ) : (
                  <Link to={`/admin/loops/${pl._id}/edit`} style={btnSmall}>Editar</Link>
                )}
                <button onClick={() => handleDuplicate(pl._id)} style={btnSmall}>Duplicar</button>
                <button onClick={() => handleDelete(pl._id)} style={{ ...btnSmall, color: "#f44336" }}>Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const btnPrimary = {
  background: "#333", color: "#fff", padding: "10px 20px", borderRadius: 6,
  textDecoration: "none", fontSize: 14, border: "1px solid #555",
};

const btnSmall = {
  background: "#222", color: "#ccc", padding: "6px 12px", borderRadius: 4,
  textDecoration: "none", fontSize: 12, border: "1px solid #333", cursor: "pointer",
};
