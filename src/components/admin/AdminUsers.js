import { useState, useEffect } from "react";
import { adminService } from "../../services/api";
import { s, badge } from "./adminStyles";
import styles from "./admin.module.css";

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    setLoading(true);
    adminService.users.list()
      .then((res) => setUsers(res.data))
      .catch((err) => console.error("Error loading users:", err.response?.data || err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleRole = async (user) => {
    const newRole = user.role === "admin" ? "user" : "admin";
    if (!window.confirm(`Change ${user.email} to ${newRole}?`)) return;
    try {
      await adminService.users.updateRole(user._id, newRole);
      fetchUsers();
    } catch {
      alert("Error updating role");
    }
  };

  if (loading) return <p className={styles.loadingText}>Loading...</p>;

  return (
    <div>
      <h2 className={styles.pageTitleMb}>Users</h2>
      <div className={styles.gridItems}>
        {users.map((user) => (
          <div key={user._id} className={styles.itemCard}>
            <img
              src={user.imageUrl}
              alt={user.name}
              className={styles.thumbRound}
              onError={(e) => { e.target.style.display = "none" }}
            />
            <div className={styles.itemContent}>
              <p className={styles.userName}>{user.name || "—"}</p>
              <p className={styles.userEmailText}>{user.email || "—"}</p>
            </div>
            <span style={badge(user.role)}>{user.role || "user"}</span>
            <button
              onClick={() => toggleRole(user)}
              className={styles.roleBtn}
              style={{ color: user.role === "admin" ? s.danger : s.success }}
            >
              {user.role === "admin" ? "Revoke Admin" : "Make Admin"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
