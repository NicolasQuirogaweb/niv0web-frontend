import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { adminService } from "../../services/api";
import { Icons } from "./icons";
import styles from "./admin.module.css";

export const AdminPlaylists = ({ type = "beats" }) => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPlaylists = useCallback(() => {
    setLoading(true);
    adminService.playlists.list()
      .then((res) => setPlaylists(res.data.filter((p) => p.type === type)))
      .catch((err) => console.error("Error loading playlists:", err.response?.data || err.message))
      .finally(() => setLoading(false));
  }, [type]);

  useEffect(() => { fetchPlaylists(); }, [fetchPlaylists]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this catalog and all its items?")) return;
    try {
      await adminService.playlists.delete(id);
      fetchPlaylists();
    } catch {
      alert("Error deleting");
    }
  };

  const handleDuplicate = async (id) => {
    try {
      await adminService.playlists.duplicate(id);
      fetchPlaylists();
    } catch {
      alert("Error duplicating");
    }
  };

  const label = type === "beats" ? "Beats" : "Loops";
  const newPath = type === "beats" ? "/admin/playlists/new" : "/admin/loops/new";

  if (loading) return <p className={styles.loadingText}>Loading catalogs...</p>;

  return (
    <div>
      <div className={styles.headerRow}>
        <h2 className={styles.pageTitle}>Catalogs ({label})</h2>
        <Link to={newPath} className={styles.btnNew}>
          <Icons.Add size={16} /> New Catalog
        </Link>
      </div>
      {playlists.length === 0 ? (
        <p className={styles.emptyText}>No {label.toLowerCase()} catalogs yet.</p>
      ) : (
        <div className={styles.grid}>
          {playlists.map((pl) => (
            <div key={pl._id} className={styles.itemCardLg}>
              <img
                src={pl.imageUrl}
                alt={pl.title}
                className={styles.thumb}
                onError={(e) => { e.target.style.display = "none" }}
              />
              <div className={styles.itemContent}>
                <p className={styles.itemTitle}>{pl.title}</p>
                <p className={styles.itemDesc}>
                  {pl.description}
                </p>
                <p className={styles.itemMeta}>
                  {pl.itemsCount ?? 0} items
                </p>
              </div>
              <div className={styles.itemActions}>
                {type === "beats" ? (
                  <Link to={`/admin/playlists/${pl._id}/beats`} className={styles.btnSmall}><Icons.MusicNote size={13} /> View</Link>
                ) : (
                  <Link to={`/admin/loops/${pl._id}/loops`} className={styles.btnSmall}><Icons.Loop size={13} /> View</Link>
                )}
                {type === "beats" ? (
                  <Link to={`/admin/playlists/${pl._id}/edit`} className={styles.btnSmall}><Icons.Edit size={13} /> Edit</Link>
                ) : (
                  <Link to={`/admin/loops/${pl._id}/edit`} className={styles.btnSmall}><Icons.Edit size={13} /> Edit</Link>
                )}
                <button onClick={() => handleDuplicate(pl._id)} className={styles.btnSmall}><Icons.Copy size={13} /> Copy</button>
                <button onClick={() => handleDelete(pl._id)} className={`${styles.btnSmall} ${styles.btnDanger}`}><Icons.Delete size={13} /> Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
