import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { adminService } from "../../services/api";
import { useToast } from "../../hooks/useToast";
import { useConfirm } from "../../hooks/useConfirm";
import { s, badge } from "./adminStyles";
import { SkeletonLine, SpinnerStyles } from "./Spinner";
import styles from "./admin.module.css";

export const AdminUsers = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const toast = useToast();
  const confirm = useConfirm();

  const fetchUsers = (signal) => {
    setLoading(true);
    adminService.users.list(signal)
      .then((res) => setUsers(res.data))
      .catch((err) => {
        if (err.name === "CanceledError" || err.code === "ERR_CANCELED") return;
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
    const newRole = user.role === "admin" ? "user" : "admin";
    const ok = await confirm(t("admin.confirm.changeRole"), t("admin.confirm.changeRoleMessage", { email: user.email, role: newRole }));
    if (!ok) return;
    try {
      await adminService.users.updateRole(user._id, newRole);
      toast.success(t("admin.toast.roleChanged", { email: user.email, role: newRole }));
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || t("admin.toast.errorUpdatingRole"));
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
            <span style={badge(user.role)}>{user.role || "user"}</span>
            <button
              onClick={() => toggleRole(user)}
              className={styles.roleBtn}
              style={{ color: user.role === "admin" ? s.danger : s.success }}
            >
              {user.role === "admin" ? t("admin.users.revokeAdmin") : t("admin.users.makeAdmin")}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
