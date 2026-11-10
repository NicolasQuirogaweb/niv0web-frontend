import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

const ToastContext = createContext(null);

export const useToast = () => useContext(ToastContext);

let toastId = 0;

const SUCCESS_MS = 3500;

// Un aviso: se cierra solo (salvo los errores, que esperan a que los cierren) y
// el tiempo se pausa mientras el mouse o el foco están encima.
const Toast = ({ toast, onClose }) => {
  const { t } = useTranslation();
  const [paused, setPaused] = useState(false);
  const remaining = useRef(toast.duration);

  useEffect(() => {
    if (toast.duration == null || paused) return;
    const started = Date.now();
    const timer = setTimeout(() => onClose(toast.id), remaining.current);
    return () => {
      clearTimeout(timer);
      remaining.current -= Date.now() - started;
    };
  }, [paused, toast.duration, toast.id, onClose]);

  const isError = toast.type === "error";
  return (
    <div
      data-toast
      className="niv0-toast"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      style={{
        pointerEvents: "auto",
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "10px 10px 10px 16px",
        borderRadius: 6,
        fontSize: 13,
        color: "#fff",
        background: isError ? "#c62828" : "#2e7d32",
        boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
        maxWidth: 360,
        wordBreak: "break-word",
      }}
    >
      <span style={{ flex: 1 }}>
        <span aria-hidden="true">{isError ? "✖ " : "✔ "}</span>
        {toast.message}
      </span>
      <button
        type="button"
        className="niv0-toast-close"
        onClick={() => onClose(toast.id)}
        aria-label={t("admin.toast.close")}
        style={{
          background: "transparent", border: "none", color: "inherit",
          cursor: "pointer", fontSize: 14, lineHeight: 1, padding: 2,
        }}
      >
        <span aria-hidden="true">{"×"}</span>
      </button>
    </div>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // duration null = queda hasta que lo cierren (errores: pueden traer listas largas).
  const addToast = useCallback((message, type = "success", duration = SUCCESS_MS) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const toast = useCallback(
    (message, type) => addToast(message, type, type === "error" ? null : SUCCESS_MS),
    [addToast]
  );
  toast.success = useCallback((m) => addToast(m, "success"), [addToast]);
  toast.error = useCallback((m) => addToast(m, "error", null), [addToast]);

  const list = (type) =>
    toasts.filter((t) => (type === "error") === (t.type === "error"))
      .map((t) => <Toast key={t.id} toast={t} onClose={removeToast} />);

  const regionStyle = { display: "flex", flexDirection: "column", gap: 8 };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div style={{
        position: "fixed", top: 16, right: 16, zIndex: 9999,
        display: "flex", flexDirection: "column", gap: 8,
        pointerEvents: "none", fontFamily: "monospace",
      }}>
        {/* Las regiones existen siempre: un lector solo anuncia cambios dentro de una región ya presente. */}
        <div role="status" aria-live="polite" style={regionStyle}>{list("success")}</div>
        <div role="alert" aria-live="assertive" style={regionStyle}>{list("error")}</div>
      </div>
      <style>{`
        @keyframes toastIn { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
        .niv0-toast { animation: toastIn 0.25s ease-out; }
        .niv0-toast-close:focus-visible { outline: 2px solid var(--color-accent, #fff); outline-offset: 2px; }
        @media (prefers-reduced-motion: reduce) { .niv0-toast { animation: none; } }
      `}</style>
    </ToastContext.Provider>
  );
};
