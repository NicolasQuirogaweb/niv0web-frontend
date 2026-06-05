import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { adminService } from "../../services/api";
import { Icons } from "./icons";
import styles from "./admin.module.css";

export const AdminSamplePacks = () => {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPacks = useCallback(() => {
    setLoading(true);
    adminService.samplepacks.list()
      .then((res) => setPacks(res.data))
      .catch((err) => console.error("Error loading samplepacks:", err.response?.data || err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchPacks(); }, [fetchPacks]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this sample pack and all its samples?")) return;
    try {
      await adminService.samplepacks.delete(id);
      fetchPacks();
    } catch {
      alert("Error deleting");
    }
  };

  const handleDuplicate = async (id) => {
    try {
      await adminService.samplepacks.duplicate(id);
      fetchPacks();
    } catch {
      alert("Error duplicating");
    }
  };

  if (loading) return <p className={styles.loadingText}>Loading...</p>;

  return (
    <div>
      <div className={styles.headerRow}>
        <h2 className={styles.pageTitle}>Sample Packs</h2>
        <Link to="/admin/samplepacks/new" className={styles.btnNew}>
          <Icons.Add size={16} /> New Sample Pack
        </Link>
      </div>
      {packs.length === 0 ? (
        <p className={styles.emptyText}>No sample packs.</p>
      ) : (
        <div className={styles.grid}>
          {packs.map((sp) => (
            <div key={sp._id} className={styles.itemCardLg}>
              <img src={sp.imageUrl} alt={sp.title} className={styles.thumb}
                onError={(e) => { e.target.style.display = "none" }} />
              <div className={styles.itemContent}>
                <p className={styles.itemTitle}>{sp.title}</p>
                <p className={styles.itemDesc}>{sp.description}</p>
                <p className={styles.itemMeta}>{sp.itemsCount ?? 0} samples</p>
              </div>
              <div className={styles.itemActions}>
                <Link to={`/admin/samplepacks/${sp._id}/samples`} className={styles.btnSmall}><Icons.MusicNote size={13} /> View</Link>
                <Link to={`/admin/samplepacks/${sp._id}/edit`} className={styles.btnSmall}><Icons.Edit size={13} /> Edit</Link>
                <button onClick={() => handleDuplicate(sp._id)} className={styles.btnSmall}><Icons.Copy size={13} /> Copy</button>
                <button onClick={() => handleDelete(sp._id)} className={`${styles.btnSmall} ${styles.btnDanger}`}><Icons.Delete size={13} /> Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
