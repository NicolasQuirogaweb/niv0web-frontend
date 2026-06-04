import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const navItems = [
  { path: "/admin", label: "Dashboard", icon: "📊", end: true },
  { path: "/admin/playlists", label: "Catálogos (Beats)", icon: "🎵" },
  { path: "/admin/loops", label: "Catálogos (Loops)", icon: "🔄" },
  { path: "/admin/samplepacks", label: "Sample Packs", icon: "📦" },
  { path: "/admin/prodmix", label: "Prod Mix Masters", icon: "🎛" },
  { path: "/admin/users", label: "Usuarios", icon: "👥" },
];

export const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userEmail, clearAuth } = useAuth();

  const isActive = (item) => {
    if (item.end) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  };

  const handleLogout = () => {
    clearAuth();
    navigate("/home", { replace: true });
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0d0d0d", color: "#e0e0e0", fontFamily: "monospace" }}>
      <aside style={{
        width: 240, background: "#141414", borderRight: "1px solid #222",
        display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 100,
      }}>
        <div style={{ padding: "20px 16px", borderBottom: "1px solid #222" }}>
          <Link to="/admin" style={{ color: "#fff", textDecoration: "none", fontSize: 18, fontWeight: "bold" }}>
            niv0 admin
          </Link>
        </div>
        <nav style={{ flex: 1, padding: "8px 0", overflowY: "auto" }}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 16px", color: isActive(item) ? "#fff" : "#777",
                background: isActive(item) ? "#222" : "transparent",
                textDecoration: "none", fontSize: 14, borderLeft: isActive(item) ? "3px solid #fff" : "3px solid transparent",
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div style={{ padding: "12px 16px", borderTop: "1px solid #222", fontSize: 12, color: "#555" }}>
          <p style={{ margin: 0 }}>{userEmail}</p>
          <button onClick={handleLogout} style={{
            background: "none", border: "none", color: "#888", cursor: "pointer",
            fontSize: 12, padding: 0, marginTop: 4, textDecoration: "underline",
          }}>
            Cerrar sesión
          </button>
        </div>
      </aside>
      <main style={{ flex: 1, marginLeft: 240, padding: 24, overflow: "auto" }}>
        <Outlet />
      </main>
    </div>
  );
};
