import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { adminService } from "../../services/api";
import { useToast } from "../../hooks/useToast";
import { formatBytes } from "../../utils/formatPrice";
import { packErrorText } from "./packErrors";
import styles from "./admin.module.css";

const POLL_MS = 5000;

export const AdminZipPanel = ({ pack, onRefresh }) => {
  const { t, i18n } = useTranslation();
  const toast = useToast();
  const [starting, setStarting] = useState(false);
  const zip = pack.zip || {};
  const status = zip.build?.status;
  const building = status === "building";

  // Solo se consulta mientras se arma; al salir de 'building' o desmontar se limpia el timer.
  useEffect(() => {
    if (!building) return undefined;
    const timer = setInterval(() => onRefresh(), POLL_MS);
    return () => clearInterval(timer);
  }, [building, onRefresh]);

  const handleBuild = async () => {
    setStarting(true);
    try {
      await adminService.samplepacks.buildZip(pack._id);
      toast.success(t("admin.samplePacks.zip.started"));
    } catch (err) {
      toast.error(packErrorText(t, err, "admin.toast.errorSaving"));
    } finally {
      setStarting(false);
      onRefresh();
    }
  };

  return (
    <div className={styles.formBox}>
      <h3 className={styles.formTitle}>{t("admin.samplePacks.zip.title")}</h3>
      {zip.url ? (
        <p>
          {t("admin.samplePacks.zip.built", { date: new Date(zip.builtAt).toLocaleDateString(i18n.language) })}
          {" · "}{formatBytes(zip.bytes)}{" · "}
          <a href={zip.url} target="_blank" rel="noopener noreferrer">{t("admin.samplePacks.zip.download")}</a>
        </p>
      ) : (
        <p>{t("admin.samplePacks.zip.none")}</p>
      )}
      {zip.url && zip.stale && <p className={styles.fieldErrorBlock}>{t("admin.samplePacks.zip.stale")}</p>}
      {building && <p>{t("admin.samplePacks.zip.building")}</p>}
      {status === "failed" && <p className={styles.fieldErrorBlock}>{t("admin.samplePacks.zip.failed", { error: zip.build?.error || "" })}</p>}
      <div className={styles.formActions}>
        <button type="button" onClick={handleBuild} disabled={building || starting} className={styles.btnPrimary}>
          {t("admin.samplePacks.zip.build")}
        </button>
      </div>
    </div>
  );
};
