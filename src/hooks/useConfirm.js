import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";

const ConfirmContext = createContext(null);

export const useConfirm = () => useContext(ConfirmContext);

export const ConfirmProvider = ({ children }) => {
  const { t } = useTranslation();
  const [state, setState] = useState({ open: false, title: "", message: "" });
  const resolveRef = useRef(null);

  const confirm = useCallback((title, message) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setState({ open: true, title, message: message || t("admin.confirm.cancel") });
    });
  }, [t]);

  const handleConfirm = useCallback(() => {
    resolveRef.current?.(true);
    setState({ open: false, title: "", message: "" });
  }, []);

  const handleCancel = useCallback(() => {
    resolveRef.current?.(false);
    setState({ open: false, title: "", message: "" });
  }, []);

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
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#111", border: "1px solid #333", borderRadius: 8,
              padding: 24, maxWidth: 400, width: "90%",
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            }}
          >
            <p style={{ color: "#fff", margin: "0 0 8px", fontSize: 15, fontWeight: "bold" }}>
              {state.title}
            </p>
            <p style={{ color: "#aaa", margin: "0 0 20px", fontSize: 13 }}>
              {state.message}
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                onClick={handleCancel}
                style={{
                  background: "transparent", border: "1px solid #333",
                  color: "#aaa", padding: "8px 20px", borderRadius: 6,
                  cursor: "pointer", fontSize: 13, fontFamily: "monospace",
                }}
              >
                {t("admin.confirm.cancel")}
              </button>
              <button
                onClick={handleConfirm}
                style={{
                  background: "#c62828", border: "none",
                  color: "#fff", padding: "8px 20px", borderRadius: 6,
                  cursor: "pointer", fontSize: 13, fontFamily: "monospace",
                }}
              >
                {t("admin.confirm.confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};
