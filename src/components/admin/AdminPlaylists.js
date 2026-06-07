import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { adminService } from "../../services/api";
import { useToast } from "../../hooks/useToast";
import { useConfirm } from "../../hooks/useConfirm";
import { Icons } from "./icons";
import { SkeletonCard, SpinnerStyles } from "./Spinner";
import styles from "./admin.module.css";

export const AdminPlaylists = ({ type = "beats" }) => {
  const { t } = useTranslation();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const toast = useToast();
  const confirm = useConfirm();

  const fetchPlaylists = useCallback((signal) => {
    setLoading(true);
    adminService.playlists.list(signal)
      .then((res) => setPlaylists(res.data.filter((p) => p.type === type)))
      .catch((err) => {
        if (err.name === "CanceledError" || err.code === "ERR_CANCELED") return;
        const msg = err.response?.data?.message || err.message;
        toast.error(msg);
      })
      .finally(() => setLoading(false));
  }, [type, toast]);

  useEffect(() => {
    const ctrl = new AbortController();
    fetchPlaylists(ctrl.signal);
    return () => ctrl.abort();
  }, [fetchPlaylists]);

  const handleDelete = async (id) => {
    const ok = await confirm(t("admin.confirm.deleteTitle", { name: itemLabel.toLowerCase() }), t("admin.confirm.deleteCatalog"));
    if (!ok) return;
    try {
      await adminService.playlists.delete(id);
      toast.success(t("admin.toast.deleted", { name: itemLabel }));
      fetchPlaylists();
    } catch (err) {
      toast.error(err.response?.data?.message || t("admin.toast.errorDeleting"));
    }
  };

  const handleDuplicate = async (id) => {
    try {
      await adminService.playlists.duplicate(id);
      toast.success(t("admin.toast.duplicated", { name: itemLabel }));
      fetchPlaylists();
    } catch (err) {
      toast.error(err.response?.data?.message || t("admin.toast.errorDuplicating"));
    }
  };

  const label = type === "beats" ? t("admin.beats.title") : t("admin.loops.title");
  const itemLabel = type === "beats" ? t("admin.playlists.catalogLabel") : t("admin.loops.catalogLabel");
  const newPath = type === "beats" ? "/admin/playlists/new" : "/admin/loops/new";

  const filtered = useMemo(() =>
    playlists.filter((pl) =>
      pl.title.toLowerCase().includes(search.toLowerCase())
    ), [playlists, search]);

  return (
    <div>
      <SpinnerStyles />
      <div className={styles.headerRow}>
        <h2 className={styles.pageTitle}>{t("admin.playlists.title", { type: label })}</h2>
        <Link to={newPath} className={styles.btnNew}>
          <Icons.Add size={16} /> {t("admin.playlists.new")}
        </Link>
      </div>
      <input
        type="text"
        placeholder={t("admin.playlists.search")}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className={styles.input}
        style={{ marginBottom: 16, maxWidth: 320 }}
      />
      {loading ? (
        <>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </>
      ) : filtered.length === 0 ? (
        <p className={styles.emptyText}>
          {search ? t("admin.common.noResults") : t("admin.playlists.none", { type: label.toLowerCase() })}
        </p>
      ) : (
        <div className={styles.grid}>
          {filtered.map((pl) => (
            <div key={pl._id} className={styles.itemCardLg}>
              <img
                src={pl.imageUrl}
                alt={pl.title}
                className={styles.thumb}
                loading="lazy"
                onError={(e) => { e.target.style.display = "none" }}
              />
              <div className={styles.itemContent}>
                <p className={styles.itemTitle}>{pl.title}</p>
                <p className={styles.itemDesc}>{pl.description}</p>
                <p className={styles.itemMeta}>{t("admin.common.itemsCount", { count: pl.itemsCount ?? 0 })}</p>
              </div>
              <div className={styles.itemActions}>
                {type === "beats" ? (
                  <Link to={`/admin/playlists/${pl._id}/beats`} className={styles.btnSmall}><Icons.MusicNote size={13} /> {t("admin.common.view")}</Link>
                ) : (
                  <Link to={`/admin/loops/${pl._id}/loops`} className={styles.btnSmall}><Icons.Loop size={13} /> {t("admin.common.view")}</Link>
                )}
                {type === "beats" ? (
                  <Link to={`/admin/playlists/${pl._id}/edit`} className={styles.btnSmall}><Icons.Edit size={13} /> {t("admin.common.edit")}</Link>
                ) : (
                  <Link to={`/admin/loops/${pl._id}/edit`} className={styles.btnSmall}><Icons.Edit size={13} /> {t("admin.common.edit")}</Link>
                )}
                <button onClick={() => handleDuplicate(pl._id)} className={styles.btnSmall}><Icons.Copy size={13} /> {t("admin.common.copy")}</button>
                <button onClick={() => handleDelete(pl._id)} className={`${styles.btnSmall} ${styles.btnDanger}`}><Icons.Delete size={13} /> {t("admin.common.delete")}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
