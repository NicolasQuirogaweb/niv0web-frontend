import { useTranslation } from "react-i18next";
import "./LoadError.css";

// Qué decir cuando algo de la página no cargó, sin mostrar el error crudo (en inglés) de axios.
export const loadErrorKey = (error) => {
  const status = error?.response?.status;
  if (!status) return "loadError.network";
  if (status === 404) return "loadError.notFound";
  return "loadError.server";
};

/** Aviso de carga fallida con "Reintentar". La página alrededor (header, volver) sigue en pie. */
export const LoadError = ({ error, onRetry }) => {
  const { t } = useTranslation();
  return (
    <div className="load-error" role="alert">
      <p>{t(loadErrorKey(error))}</p>
      {onRetry && (
        <button type="button" className="load-error-retry" onClick={onRetry}>
          {t("loadError.retry")}
        </button>
      )}
    </div>
  );
};
