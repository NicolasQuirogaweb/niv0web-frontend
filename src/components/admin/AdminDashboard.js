import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { adminService } from "../../services/api";
import { useToast } from "../../hooks/useToast";
import { SkeletonCard, SpinnerStyles } from "./Spinner";
import { SEO } from "../common/SEO";
import styles from "./admin.module.css";

export const AdminDashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const ctrl = new AbortController();
    adminService.dashboard(ctrl.signal)
      .then((res) => setStats(res.data))
      .catch((err) => {
        if (err.name === "CanceledError" || err.code === "ERR_CANCELED") return;
        toast.error(err.response?.data?.message || t("admin.toast.errorLoading", { name: t("admin.dashboard.title") }));
      })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const cards = [
    { label: t("admin.dashboard.cardCatalogsBeats"), value: stats?.playlists, path: "/admin/playlists", color: "#7c6ff0" },
    { label: t("admin.dashboard.cardCatalogsLoops"), value: stats?.loops, path: "/admin/loops", color: "#5dade2" },
    { label: t("admin.dashboard.cardBeats"), value: stats?.beats, path: "/admin/playlists", color: "#58d68d" },
    { label: t("admin.dashboard.cardLoops"), value: stats?.loops, path: "/admin/loops", color: "#48c9b0" },
    { label: t("admin.dashboard.cardSamplePacks"), value: stats?.samplepacks, path: "/admin/samplepacks", color: "#f5b041" },
    { label: t("admin.dashboard.cardSamples"), value: stats?.samples, path: "/admin/samplepacks", color: "#ec7063" },
    { label: t("admin.dashboard.cardProdMix"), value: stats?.prodmix, path: "/admin/prodmix", color: "#af7ac5" },
    { label: t("admin.dashboard.cardUsers"), value: stats?.users, path: "/admin/users", color: "#85929e" },
  ];

  return (
    <>
      <SEO title={t("admin.dashboard.seoTitle")} description={t("admin.dashboard.seoDesc")} />
    <div>
      <SpinnerStyles />
      <div className={styles.headerRow}>
        <h2 className={styles.pageTitle}>{t("admin.dashboard.title")}</h2>
      </div>
      {loading ? (
        <div className={styles.dashboardGrid}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={styles.cardHoverable}>
              <SkeletonCard />
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.dashboardGrid}>
          {cards.map((cardItem) => (
            <Link
              key={cardItem.path + '-' + cardItem.label}
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
      )}
      <div className={`${styles.card} ${styles.mt32}`} style={{ padding: 14 }}>
        <h3 className={styles.quickActionsTitle}>{t("admin.dashboard.quickActions")}</h3>
        <div className={styles.quickActionsRow}>
          <Link to="/admin/playlists/new" className={styles.btnQuickAction}>{t("admin.dashboard.newCatalogBeats")}</Link>
          <Link to="/admin/loops/new" className={styles.btnQuickAction}>{t("admin.dashboard.newCatalogLoops")}</Link>
          <Link to="/admin/samplepacks/new" className={styles.btnQuickAction}>{t("admin.dashboard.newSamplePack")}</Link>
        </div>
      </div>
    </div>
    </>
  );
};
