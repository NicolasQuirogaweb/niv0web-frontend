import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { adminService } from "../../services/api";
import { useToast } from "../../hooks/useToast";
import { formatBytes } from "../../utils/formatPrice";
import { packErrorText } from "./packErrors";
import styles from "./admin.module.css";

const POLL_MS = 5000;
// El backend antepone esto a cada error de armado; en el panel sobra.
const ERROR_PREFIX = /^No se pudo armar el ZIP:\s*/;

/**
 * Estado del ZIP del pack. El backend lo rearma solo después de cada cambio
 * (services/zipAutoBuild): el panel muestra una sola línea con en qué está y se
 * refresca solo mientras haya algo pendiente (cambios, armado o un fallo que se reintenta).
 */
export const AdminZipPanel = ({ pack, onRefresh }) => {
  const { t, i18n } = useTranslation();
  const toast = useToast();
  const [starting, setStarting] = useState(false);
  const zip = pack.zip || {};
  const status = zip.build?.status;
  const building = status === "building";
  const failed = status === "failed";
  const updating = building || (!failed && Boolean(zip.stale));
  const pending = updating || failed;

  useEffect(() => {
    if (!pending) return undefined;
    const timer = setInterval(() => onRefresh(), POLL_MS);
    return () => clearInterval(timer);
  }, [pending, onRefresh]);

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

  const detail = failed && zip.build?.error ? zip.build.error.replace(ERROR_PREFIX, "") : null;
  const date = zip.builtAt
    ? new Date(zip.builtAt).toLocaleString(i18n.language, { dateStyle: "short", timeStyle: "short" })
    : null;

  let line;
  if (updating) line = <p role="status">{t("admin.samplePacks.zip.updating")}</p>;
  else if (failed)
    line = (
      <p role="alert" className={styles.fieldErrorBlock}>
        {t("admin.samplePacks.zip.failed")}
        {detail && (
          <>
            <br />
            <small>{detail}</small>
          </>
        )}
      </p>
    );
  else if (zip.url) line = <p>{t("admin.samplePacks.zip.upToDate")}</p>;
  else line = <p>{t("admin.samplePacks.zip.none")}</p>;

  return (
    <div className={styles.formBox}>
      <h3 className={styles.formTitle}>{t("admin.samplePacks.zip.title")}</h3>
      {line}
      {zip.url && (
        <p>
          {date && <>{date} · </>}
          {formatBytes(zip.bytes)} ·{" "}
          <a href={zip.url} target="_blank" rel="noopener noreferrer">{t("admin.samplePacks.zip.download")}</a>
        </p>
      )}
      <div className={styles.formActions}>
        <button type="button" onClick={handleBuild} disabled={building || starting} className={failed ? styles.btnPrimary : styles.btnSecondary}>
          {failed ? t("admin.samplePacks.zip.retry") : zip.url ? t("admin.samplePacks.zip.rebuild") : t("admin.samplePacks.zip.build")}
        </button>
      </div>
    </div>
  );
};
