import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { adminService } from "../../services/api";

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.dashboard()
      .then((res) => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ color: "#888" }}>Cargando estadísticas...</p>;

  const cards = [
    { label: "Catálogos (Beats)", value: stats?.playlists, path: "/admin/playlists", color: "#4caf50" },
    { label: "Catálogos (Loops)", value: stats?.playlists, path: "/admin/loops", color: "#2196f3" },
    { label: "Beats", value: stats?.beats, path: "/admin/playlists", color: "#8bc34a" },
    { label: "Loops", value: stats?.loops, path: "/admin/loops", color: "#03a9f4" },
    { label: "Sample Packs", value: stats?.samplepacks, path: "/admin/samplepacks", color: "#ff9800" },
    { label: "Samples", value: stats?.samples, path: "/admin/samplepacks", color: "#ff5722" },
    { label: "Prod Mix Masters", value: stats?.prodmix, path: "/admin/prodmix", color: "#9c27b0" },
    { label: "Usuarios", value: stats?.users, path: "/admin/users", color: "#607d8b" },
  ];

  return (
    <div>
      <h2 style={{ color: "#fff", marginBottom: 24, fontSize: 22 }}>Dashboard</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
        {cards.map((card) => (
          <Link
            key={card.label}
            to={card.path}
            style={{
              background: "#1a1a1a", borderRadius: 8, padding: 20, textDecoration: "none",
              border: "1px solid #222", transition: "border-color 0.2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = card.color}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = "#222"}
          >
            <p style={{ color: "#888", margin: 0, fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>
              {card.label}
            </p>
            <p style={{ color: "#fff", margin: "8px 0 0", fontSize: 32, fontWeight: "bold" }}>
              {card.value ?? 0}
            </p>
          </Link>
        ))}
      </div>
      <div style={{ marginTop: 32, padding: 20, background: "#1a1a1a", borderRadius: 8, border: "1px solid #222" }}>
        <h3 style={{ color: "#fff", margin: "0 0 12px", fontSize: 16 }}>Accesos rápidos</h3>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link to="/admin/playlists/new" style={btnStyle}>+ Nuevo catálogo (Beats)</Link>
          <Link to="/admin/loops/new" style={btnStyle}>+ Nuevo catálogo (Loops)</Link>
          <Link to="/admin/samplepacks" style={btnStyle}>+ Nuevo Sample Pack</Link>
        </div>
      </div>
    </div>
  );
};

const btnStyle = {
  background: "#222", color: "#e0e0e0", padding: "8px 16px", borderRadius: 6,
  textDecoration: "none", fontSize: 13, border: "1px solid #333",
};
