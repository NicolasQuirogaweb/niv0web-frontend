import { useState } from "react";
import { useTranslation } from "react-i18next";
import { adminService } from "../../services/api";
import { useToast } from "../../hooks/useToast";
import { useConfirm } from "../../hooks/useConfirm";
import { packErrorText } from "./packErrors";
import styles from "./admin.module.css";

export const AdminPackFolders = ({ pack, samplesByFolder = {}, onChange }) => {
  const { t } = useTranslation();
  const toast = useToast();
  const [newName, setNewName] = useState("");
  const [editing, setEditing] = useState(null);
  const [editName, setEditName] = useState("");
  const [deleting, setDeleting] = useState(null);
  const confirm = useConfirm();
  const folders = pack.folders || [];

  const run = async (call, successKey) => {
    try {
      await call();
      if (successKey) toast.success(t(successKey));
      onChange?.();
      return true;
    } catch (err) {
      toast.error(packErrorText(t, err, "admin.toast.errorSaving"));
      return false;
    }
  };

  const add = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    if (await run(() => adminService.samplepacks.addFolder(pack._id, newName.trim()), "admin.samplePacks.folders.added")) setNewName("");
  };

  const saveRename = async (from) => {
    if (await run(() => adminService.samplepacks.renameFolder(pack._id, from, editName.trim()), "admin.samplePacks.folders.renamed")) setEditing(null);
  };

  // Destructive: asks first, and the button stays disabled while the request runs.
  const removeFolder = async (name) => {
    const ok = await confirm(
      t("admin.samplePacks.folders.deleteTitle", { name }),
      t("admin.samplePacks.folders.deleteMessage")
    );
    if (!ok) return;
    setDeleting(name);
    await run(() => adminService.samplepacks.deleteFolder(pack._id, name), "admin.samplePacks.folders.deleted");
    setDeleting(null);
  };

  const move = (index, delta) => {
    const next = [...folders];
    [next[index], next[index + delta]] = [next[index + delta], next[index]];
    return run(() => adminService.samplepacks.reorderFolders(pack._id, next));
  };

  return (
    <div className={styles.formBox}>
      <h3 className={styles.formTitle}>{t("admin.samplePacks.folders.title")}</h3>
      {folders.length === 0 && <p className={styles.emptyText}>{t("admin.samplePacks.folders.none")}</p>}
      {folders.map((name, i) => {
        const count = samplesByFolder[name]?.length ?? 0;
        return (
          <div key={name} className={styles.itemCard}>
            <div className={styles.itemContent}>
              {editing === name ? (
                <input value={editName} onChange={(e) => setEditName(e.target.value)} className={styles.input}
                  aria-label={t("admin.samplePacks.folders.rename")} />
              ) : (
                <p className={styles.itemTitle}>{name} <span className={styles.itemMeta}>{t("admin.samplePacks.folders.count", { count })}</span></p>
              )}
            </div>
            {editing === name ? (
              <>
                <button type="button" onClick={() => saveRename(name)} className={styles.btnSmall}>{t("admin.samplePacks.folders.save")}</button>
                <button type="button" onClick={() => setEditing(null)} className={styles.btnSmall}>{t("admin.samplePacks.folders.cancel")}</button>
              </>
            ) : (
              <>
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`${t("admin.samplePacks.folders.up")} ${name}`} className={styles.btnSmall}>↑</button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === folders.length - 1} aria-label={`${t("admin.samplePacks.folders.down")} ${name}`} className={styles.btnSmall}>↓</button>
                <button type="button" onClick={() => { setEditing(name); setEditName(name); }} className={styles.btnSmall}>{t("admin.samplePacks.folders.rename")}</button>
                <button type="button" disabled={count > 0 || deleting === name} onClick={() => removeFolder(name)}
                  title={count > 0 ? t("admin.samplePacks.folders.notEmpty") : undefined}
                  className={`${styles.btnSmall} ${styles.btnDanger}`}>{t("admin.samplePacks.folders.delete")}</button>
              </>
            )}
          </div>
        );
      })}
      <form onSubmit={add} className={styles.formActions}>
        <input value={newName} onChange={(e) => setNewName(e.target.value)} className={styles.input} style={{ maxWidth: 260 }}
          placeholder={t("admin.samplePacks.folders.newPlaceholder")} aria-label={t("admin.samplePacks.folders.newPlaceholder")} />
        <button type="submit" className={styles.btnSecondary}>{t("admin.samplePacks.folders.add")}</button>
      </form>
    </div>
  );
};
