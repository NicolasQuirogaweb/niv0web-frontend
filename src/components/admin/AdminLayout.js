import { useState, useCallback } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth, useLogout } from "../../hooks/useAuth";
import { ToastProvider } from "../../hooks/useToast";
import { ConfirmProvider } from "../../hooks/useConfirm";
import { LanguageSwitcher } from "../common/LanguageSwitcher";
import { Icons } from "./icons";
import styles from "./admin.module.css";

export const AdminLayout = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { userEmail } = useAuth();
  const handleLogout = useLogout("/home");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { path: "/admin", label: t("admin.nav.dashboard"), icon: Icons.Dashboard, end: true },
    { path: "/admin/playlists", label: t("admin.nav.catalogsBeats"), icon: Icons.MusicNote },
    { path: "/admin/samplepacks", label: t("admin.nav.samplePacks"), icon: Icons.Inventory },
    { path: "/admin/prodmix", label: t("admin.nav.prodMixMasters"), icon: Icons.Tune },
    { path: "/admin/users", label: t("admin.nav.users"), icon: Icons.People },
  ];

  const isActive = (item) => {
    if (item.end) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  };

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className={styles.wrapper}>
      {sidebarOpen && <div className={styles.overlay} onClick={closeSidebar} />}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarExpanded : ""}`}>
        <div className={styles.logo}>
          <Link to="/admin" className={styles.logoLink} onClick={closeSidebar}>
            {t("admin.layout.niv0Admin")}
          </Link>
        </div>
        <nav className={styles.nav}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={active ? styles.navLinkActive : styles.navLink}
                onClick={closeSidebar}
              >
                <Icon size={20} className={active ? styles.navIconActive : styles.navIcon} />
                <span className={`${styles.navLabel} ${sidebarOpen ? "" : styles.navLabelHidden}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
          <div className={styles.divider}>
            <Link to="/homelogued" className={styles.navLink} onClick={closeSidebar}>
              <Icons.Home size={20} className={styles.navIcon} />
              <span className={`${styles.navLabel} ${sidebarOpen ? "" : styles.navLabelHidden}`}>
                {t("admin.layout.backToHome")}
              </span>
            </Link>
          </div>
        </nav>
        <div className={styles.footer}>
          <p className={`${styles.userEmail} ${sidebarOpen ? "" : styles.userEmailHidden}`}>
            {userEmail}
          </p>
          <div className={`${styles.langWrap} ${sidebarOpen ? "" : styles.langWrapHidden}`}>
            <LanguageSwitcher />
          </div>
          <button onClick={handleLogout} className={styles.signOutBtn} aria-label={t("admin.layout.signOut")}>
            <Icons.Logout size={20} className={styles.navIcon} />
            <span className={`${styles.navLabel} ${sidebarOpen ? "" : styles.navLabelHidden}`}>
              {t("admin.layout.signOut")}
            </span>
          </button>
        </div>
      </aside>
      <main className={`${styles.main} ${sidebarOpen ? styles.mainShift : ""}`}>
        <div className={styles.topBar}>
          <button onClick={() => setSidebarOpen((v) => !v)} className={styles.menuBtn} aria-label={t("nav.toggleMenu")}>
            <Icons.Menu size={22} />
          </button>
        </div>
        <ToastProvider>
          <ConfirmProvider>
            <Outlet />
          </ConfirmProvider>
        </ToastProvider>
      </main>
    </div>
  );
};
