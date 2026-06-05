import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { adminService } from "../../services/api";
import styles from "./admin.module.css";

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.dashboard()
      .then((res) => setStats(res.data))
      .catch((err) => console.error("Dashboard error:", err.response?.data || err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className={styles.loadingText}>Loading stats...</p>;

  const cards = [
    { label: "Catalogs (Beats)", value: stats?.playlists, path: "/admin/playlists", color: "#7c6ff0" },
    { label: "Catalogs (Loops)", value: stats?.playlists, path: "/admin/loops", color: "#5dade2" },
    { label: "Beats", value: stats?.beats, path: "/admin/playlists", color: "#58d68d" },
    { label: "Loops", value: stats?.loops, path: "/admin/loops", color: "#48c9b0" },
    { label: "Sample Packs", value: stats?.samplepacks, path: "/admin/samplepacks", color: "#f5b041" },
    { label: "Samples", value: stats?.samples, path: "/admin/samplepacks", color: "#ec7063" },
    { label: "Prod Mix Masters", value: stats?.prodmix, path: "/admin/prodmix", color: "#af7ac5" },
    { label: "Users", value: stats?.users, path: "/admin/users", color: "#85929e" },
  ];

  return (
    <div>
      <div className={styles.headerRow}>
        <h2 className={styles.pageTitle}>Dashboard</h2>
      </div>
      <div className={styles.dashboardGrid}>
        {cards.map((cardItem) => (
          <Link
            key={cardItem.label}
            to={cardItem.path}
            className={styles.cardHoverable}
            style={{ borderLeft: `3px solid ${cardItem.color}` }}
          >
            <p className={styles.cardLabel} style={{ color: cardItem.color }}>
              {cardItem.label}
            </p>
            <p className={styles.cardValue}>
              {cardItem.value ?? 0}
            </p>
          </Link>
        ))}
      </div>
      <div className={`${styles.card} ${styles.mt32}`} style={{ padding: 14 }}>
        <h3 className={styles.quickActionsTitle}>Quick Actions</h3>
        <div className={styles.quickActionsRow}>
          <Link to="/admin/playlists/new" className={styles.btnQuickAction}>+ New Catalog (Beats)</Link>
          <Link to="/admin/loops/new" className={styles.btnQuickAction}>+ New Catalog (Loops)</Link>
          <Link to="/admin/samplepacks/new" className={styles.btnQuickAction}>+ New Sample Pack</Link>
        </div>
      </div>
    </div>
  );
};
