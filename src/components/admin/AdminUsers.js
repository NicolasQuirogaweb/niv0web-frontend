import { useState, useEffect } from "react";
import { adminService } from "../../services/api";

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    setLoading(true);
    adminService.users.list()
      .then((res) => setUsers(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleRole = async (user) => {
    const newRole = user.role === "admin" ? "user" : "admin";
    if (!window.confirm(`¿Cambiar a ${user.email} a ${newRole}?`)) return;
    try {
      await adminService.users.updateRole(user._id, newRole);
      fetchUsers();
    } catch {
      alert("Error al actualizar rol");
    }
  };

  if (loading) return <p style={{ color: "#888" }}>Cargando...</p>;

  return (
    <div>
      <h2 style={{ color: "#fff", marginBottom: 24, fontSize: 22 }}>Usuarios</h2>
      <div style={{ display: "grid", gap: 8 }}>
        {users.map((user) => (
          <div key={user._id} style={{
            background: "#1a1a1a", borderRadius: 6, padding: 12, border: "1px solid #222",
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <img
              src={user.imageUrl}
              alt={user.name}
              style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }}
              onError={(e) => { e.target.style.display = "none" }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: "#fff", margin: 0, fontWeight: "bold" }}>{user.name}</p>
              <p style={{ color: "#888", margin: "2px 0 0", fontSize: 13 }}>{user.email}</p>
            </div>
            <span style={{
              fontSize: 11, padding: "3px 8px", borderRadius: 4,
              background: user.role === "admin" ? "#1b5e20" : "#333",
              color: user.role === "admin" ? "#81c784" : "#999",
              textTransform: "uppercase",
            }}>
              {user.role}
            </span>
            <button onClick={() => toggleRole(user)} style={btnSmall}>
              {user.role === "admin" ? "Revocar admin" : "Hacer admin"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const btnSmall = {
  background: "#222", color: "#ccc", padding: "6px 12px", borderRadius: 4,
  border: "1px solid #333", cursor: "pointer", fontSize: 12, fontFamily: "monospace",
};
