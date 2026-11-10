import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";

const ConfirmContext = createContext(null);

export const useConfirm = () => useContext(ConfirmContext);

const CLOSED = { open: false, title: "", message: "", confirmLabel: "", tone: "danger" };

const BUTTON = {
  padding: "8px 20px", borderRadius: 6,
  cursor: "pointer", fontSize: 13, fontFamily: "monospace",
};

const TONES = {
  danger: { background: "#c62828", border: "none", color: "#fff" },
  neutral: {
    background: "var(--color-accent, #f5c26b)", border: "none",
    color: "var(--color-on-accent, #0d0d0d)",
  },
};

/**
 * confirm(title, message?, { confirmLabel?, tone? }) → Promise<boolean>.
 * tone "danger" (por defecto, botón rojo "Eliminar") o "neutral" para acciones
 * que no borran nada (ej. cambiar un rol).
 */
export const ConfirmProvider = ({ children }) => {
  const { t } = useTranslation();
  const [state, setState] = useState(CLOSED);
  const resolveRef = useRef(null);
  const dialogRef = useRef(null);
  const cancelRef = useRef(null);

  const confirm = useCallback((title, message, options = {}) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setState({
        open: true,
        title,
        message: message || "",
        confirmLabel: options.confirmLabel || "",
        tone: options.tone === "neutral" ? "neutral" : "danger",
      });
    });
  }, []);

  const close = useCallback((result) => {
    resolveRef.current?.(result);
    resolveRef.current = null;
    setState(CLOSED);
  }, []);
  const handleConfirm = useCallback(() => close(true), [close]);
  const handleCancel = useCallback(() => close(false), [close]);

  // Al abrir, el foco va a "Cancelar" (la opción segura), Esc cierra y Tab no sale
  // del diálogo. Al cerrar, el foco vuelve al botón que lo abrió.
  useEffect(() => {
    if (!state.open) return;
    const opener = document.activeElement;
    cancelRef.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") {
        handleCancel();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusables = Array.from(dialogRef.current.querySelectorAll("button:not([disabled])"));
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const inside = dialogRef.current.contains(document.activeElement);
      if (e.shiftKey && (document.activeElement === first || !inside)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (document.activeElement === last || !inside)) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      if (opener && typeof opener.focus === "function" && document.contains(opener)) opener.focus();
    };
  }, [state.open, handleCancel]);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state.open && (
        <div
          onClick={handleCancel}
          style={{
            position: "fixed", inset: 0, zIndex: 10000,
            background: "rgba(0,0,0,0.6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "monospace",
          }}
        >
          <div
            ref={dialogRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby={state.message ? "confirm-message" : undefined}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#111", border: "1px solid #333", borderRadius: 8,
              padding: 24, maxWidth: 400, width: "90%",
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            }}
          >
            <h2 id="confirm-title" style={{ color: "#fff", margin: "0 0 8px", fontSize: 15, fontWeight: "bold", fontFamily: "monospace", letterSpacing: "normal" }}>
              {state.title}
            </h2>
            {state.message && (
              <p id="confirm-message" style={{ color: "#aaa", margin: "0 0 20px", fontSize: 13 }}>
                {state.message}
              </p>
            )}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: state.message ? 0 : 20 }}>
              <button
                ref={cancelRef}
                type="button"
                className="niv0-confirm-btn"
                onClick={handleCancel}
                style={{ ...BUTTON, background: "transparent", border: "1px solid #333", color: "#aaa" }}
              >
                {t("admin.confirm.cancel")}
              </button>
              <button
                type="button"
                className="niv0-confirm-btn"
                data-tone={state.tone}
                onClick={handleConfirm}
                style={{ ...BUTTON, ...TONES[state.tone] }}
              >
                {state.confirmLabel || t("admin.confirm.confirm")}
              </button>
            </div>
          </div>
          <style>{`
            .niv0-confirm-btn:focus-visible { outline: 2px solid var(--color-accent, #f5c26b); outline-offset: 2px; }
          `}</style>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};
