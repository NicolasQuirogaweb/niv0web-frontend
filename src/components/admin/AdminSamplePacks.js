import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { adminService } from "../../services/api";
import { useToast } from "../../hooks/useToast";
import { useConfirm } from "../../hooks/useConfirm";
import { Icons } from "./icons";
import { SkeletonCard, SpinnerStyles } from "./Spinner";
import styles from "./admin.module.css";

export const AdminSamplePacks = () => {
  const { t } = useTranslation();
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const toast = useToast();
  const confirm = useConfirm();

  const fetchPacks = useCallback((signal) => {
    setLoading(true);
    adminService.samplepacks.list(signal)
      .then((res) => setPacks(res.data))
      .catch((err) => {
        if (err.name === "CanceledError" || err.code === "ERR_CANCELED") return;
        const msg = err.response?.data?.message || err.message;
        toast.error(msg);
      })
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => {
    const ctrl = new AbortController();
    fetchPacks(ctrl.signal);
    return () => ctrl.abort();
  }, [fetchPacks]);

  const handleDelete = async (id) => {
    const ok = await confirm(t("admin.confirm.deleteTitle", { name: t("admin.samplePacks.packLabel").toLowerCase() }), t("admin.confirm.deletePack"));
    if (!ok) return;
    try {
      await adminService.samplepacks.delete(id);
      toast.success(t("admin.toast.deleted", { name: t("admin.samplePacks.packLabel") }));
      fetchPacks();
    } catch (err) {
      toast.error(err.response?.data?.message || t("admin.toast.errorDeleting"));
    }
  };

  const handleDuplicate = async (id) => {
    try {
      await adminService.samplepacks.duplicate(id);
      toast.success(t("admin.toast.duplicated", { name: t("admin.samplePacks.packLabel") }));
      fetchPacks();
    } catch (err) {
      toast.error(err.response?.data?.message || t("admin.toast.errorDuplicating"));
    }
  };

  const filtered = useMemo(() =>
    packs.filter((sp) =>
      sp.title.toLowerCase().includes(search.toLowerCase())
    ), [packs, search]);

  return (
    <div>
      <SpinnerStyles />
      <div className={styles.headerRow}>
        <h2 className={styles.pageTitle}>{t("admin.samplePacks.title")}</h2>
        <Link to="/admin/samplepacks/new" className={styles.btnNew}>
          <Icons.Add size={16} /> {t("admin.samplePacks.new")}
        </Link>
      </div>
      <input
        type="text"
        placeholder={t("admin.samplePacks.search")}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className={styles.input}
        style={{ marginBottom: 16, maxWidth: 320 }}
      />
      {loading ? (
        <><SkeletonCard /><SkeletonCard /></>
      ) : filtered.length === 0 ? (
        <p className={styles.emptyText}>
          {search ? t("admin.common.noResults") : t("admin.samplePacks.none")}
        </p>
      ) : (
        <div className={styles.grid}>
          {filtered.map((sp) => (
            <div key={sp._id} className={styles.itemCardLg}>
              <img src={sp.imageUrl} alt={sp.title} className={styles.thumb} loading="lazy"
                onError={(e) => { e.target.style.display = "none" }} />
              <div className={styles.itemContent}>
                <p className={styles.itemTitle}>{sp.title}</p>
                <p className={styles.itemDesc}>{sp.description}</p>
                <p className={styles.itemMeta}>{t("admin.samplePacks.samplesCount", { count: sp.itemsCount ?? 0 })}</p>
              </div>
              <div className={styles.itemActions}>
                <Link to={`/admin/samplepacks/${sp._id}/samples`} className={styles.btnSmall}><Icons.MusicNote size={13} /> {t("admin.common.view")}</Link>
                <Link to={`/admin/samplepacks/${sp._id}/edit`} className={styles.btnSmall}><Icons.Edit size={13} /> {t("admin.common.edit")}</Link>
                <button onClick={() => handleDuplicate(sp._id)} className={styles.btnSmall}><Icons.Copy size={13} /> {t("admin.common.copy")}</button>
                <button onClick={() => handleDelete(sp._id)} className={`${styles.btnSmall} ${styles.btnDanger}`}><Icons.Delete size={13} /> {t("admin.common.delete")}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
