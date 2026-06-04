import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { adminService } from "../../services/api";

export const AdminSamplePacks = () => {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPacks = useCallback(() => {
    setLoading(true);
    adminService.samplepacks.list()
      .then((res) => setPacks(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchPacks(); }, [fetchPacks]);

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este sample pack y todos sus samples?")) return;
    try {
      await adminService.samplepacks.delete(id);
      fetchPacks();
    } catch {
      alert("Error al eliminar");
    }
  };

  const handleDuplicate = async (id) => {
    try {
      await adminService.samplepacks.duplicate(id);
      fetchPacks();
    } catch {
      alert("Error al duplicar");
    }
  };

  if (loading) return <p style={{ color: "#888" }}>Cargando...</p>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ color: "#fff", margin: 0, fontSize: 22 }}>Sample Packs</h2>
        <Link to="/admin/samplepacks/new" style={btnPrimary}>+ Nuevo sample pack</Link>
      </div>
      {packs.length === 0 ? (
        <p style={{ color: "#555" }}>No hay sample packs.</p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {packs.map((sp) => (
            <div key={sp._id} style={{
              background: "#1a1a1a", borderRadius: 8, padding: 16, border: "1px solid #222",
              display: "flex", alignItems: "center", gap: 16,
            }}>
              <img src={sp.imageUrl} alt={sp.title} style={{ width: 60, height: 60, borderRadius: 6, objectFit: "cover", background: "#333" }}
                onError={(e) => { e.target.style.display = "none" }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: "#fff", margin: 0, fontWeight: "bold" }}>{sp.title}</p>
                <p style={{ color: "#888", margin: "4px 0 0", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sp.description}</p>
                <p style={{ color: "#555", margin: "4px 0 0", fontSize: 12 }}>{sp.itemsCount ?? 0} samples</p>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <Link to={`/admin/samplepacks/${sp._id}/samples`} style={btnSmall}>Ver samples</Link>
                <Link to={`/admin/samplepacks/${sp._id}/edit`} style={btnSmall}>Editar</Link>
                <button onClick={() => handleDuplicate(sp._id)} style={btnSmall}>Duplicar</button>
                <button onClick={() => handleDelete(sp._id)} style={{ ...btnSmall, color: "#f44336" }}>Eliminar</button>
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
