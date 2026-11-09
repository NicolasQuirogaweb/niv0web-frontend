import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { adminService } from "../../services/api";
import { useToast } from "../../hooks/useToast";
import { useConfirm } from "../../hooks/useConfirm";
import { useAuth } from "../../hooks/useAuth";
import { SkeletonLine, SpinnerStyles } from "./Spinner";
import styles from "./admin.module.css";
import { isAbortError } from "../../utils/isAbortError";

export const AdminUsers = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pendingId, setPendingId] = useState(null);
  const toast = useToast();
  const confirm = useConfirm();
  const { userEmail } = useAuth();
  const roleName = (role) => t(`admin.users.roles.${role === "admin" ? "admin" : "user"}`);
  // Quitarse el propio rol de admin deja al panel sin acceso: no se ofrece.
  const isSelfAdmin = (user) => user.role === "admin" && !!userEmail && user.email === userEmail;

  const fetchUsers = (signal) => {
    setLoading(true);
    adminService.users.list(signal)
      .then((res) => setUsers(res.data))
      .catch((err) => {
        if (isAbortError(err)) return;
        toast.error(err.response?.data?.message || t("admin.toast.errorLoading", { name: t("admin.users.usersLabel") }));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const ctrl = new AbortController();
    fetchUsers(ctrl.signal);
    return () => ctrl.abort();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleRole = async (user) => {
    if (isSelfAdmin(user)) return;
    const newRole = user.role === "admin" ? "user" : "admin";
    const ok = await confirm(
      t("admin.confirm.changeRole"),
      t("admin.confirm.changeRoleMessage", { email: user.email, role: roleName(newRole) }),
      { confirmLabel: t("admin.users.changeRole"), tone: "neutral" }
    );
    if (!ok) return;
    setPendingId(user._id);
    try {
      await adminService.users.updateRole(user._id, newRole);
      toast.success(t("admin.toast.roleChanged", { email: user.email, role: roleName(newRole) }));
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || t("admin.toast.errorUpdatingRole"));
    } finally {
      setPendingId(null);
    }
  };

  const filtered = useMemo(() =>
    users.filter((u) =>
      (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(search.toLowerCase())
    ), [users, search]);

  return (
    <div>
      <SpinnerStyles />
      <h2 className={styles.pageTitleMb}>{t("admin.users.title")}</h2>
      <input
        type="text"
        placeholder={t("admin.users.search")}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className={styles.input}
        style={{ marginBottom: 16, maxWidth: 320 }}
      />
      <div className={styles.gridItems}>
        {loading ? (
          <><SkeletonLine /><SkeletonLine /><SkeletonLine /></>
        ) : filtered.length === 0 ? (
          <p className={styles.emptyText}>
            {search ? t("admin.users.noResults") : t("admin.users.none")}
          </p>
        ) : filtered.map((user) => (
          <div key={user._id} className={styles.itemCard}>
            <img
              src={user.imageUrl}
              alt={user.name}
              className={styles.thumbRound}
              loading="lazy"
              onError={(e) => { e.target.style.display = "none" }}
            />
            <div className={styles.itemContent}>
              <p className={styles.userName}>{user.name || "—"}</p>
              <p className={styles.userEmailText}>{user.email || "—"}</p>
            </div>
            <span className={`${styles.badge} ${user.role === "admin" ? styles.badgeAdmin : styles.badgeUser}`}>{roleName(user.role)}</span>
            <button
              onClick={() => toggleRole(user)}
              disabled={pendingId === user._id || isSelfAdmin(user)}
              aria-describedby={isSelfAdmin(user) ? `self-admin-${user._id}` : undefined}
              title={isSelfAdmin(user) ? t("admin.users.cantRevokeSelf") : undefined}
              className={`${styles.roleBtn} ${user.role === "admin" ? styles.roleBtnDanger : styles.roleBtnSuccess}`}
            >
              {user.role === "admin" ? t("admin.users.revokeAdmin") : t("admin.users.makeAdmin")}
            </button>
            {isSelfAdmin(user) && <span id={`self-admin-${user._id}`} className={styles.visuallyHidden}>{t("admin.users.cantRevokeSelf")}</span>}
          </div>
        ))}
      </div>
    </div>
  );
};
