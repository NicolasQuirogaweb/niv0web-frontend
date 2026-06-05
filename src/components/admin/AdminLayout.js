import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Icons } from "./icons";
import styles from "./admin.module.css";

const navItems = [
  { path: "/admin", label: "Dashboard", icon: Icons.Dashboard, end: true },
  { path: "/admin/playlists", label: "Catalogs (Beats)", icon: Icons.MusicNote },
  { path: "/admin/samplepacks", label: "Sample Packs", icon: Icons.Inventory },
  { path: "/admin/prodmix", label: "Prod Mix Masters", icon: Icons.Tune },
  { path: "/admin/users", label: "Users", icon: Icons.People },
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
    <div className={styles.wrapper}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <Link to="/admin" className={styles.logoLink}>
            niv0 admin
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
              >
                <Icon size={16} className={active ? styles.navIconActive : styles.navIcon} />
                <span className={styles.navLabel}>{item.label}</span>
              </Link>
            );
          })}
          <div className={styles.divider}>
            <Link to="/homelogued" className={styles.navLink}>
              <Icons.Home size={16} className={styles.navIcon} />
              <span className={styles.navLabel}>Back to Home</span>
            </Link>
          </div>
        </nav>
        <div className={styles.footer}>
          <p className={styles.userEmail}>{userEmail}</p>
          <button onClick={handleLogout} className={styles.signOutBtn}>
            <Icons.Logout size={16} className={styles.navIcon} />
            <span className={styles.navLabel}>Sign out</span>
          </button>
        </div>
      </aside>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
};
