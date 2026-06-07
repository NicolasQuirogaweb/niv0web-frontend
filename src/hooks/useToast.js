import React, { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

export const useToast = () => useContext(ToastContext);

let toastId = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = "success", duration = 3500) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), duration);
  }, [removeToast]);

  const toast = useCallback(
    (message, type) => addToast(message, type),
    [addToast]
  );
  toast.success = useCallback((m) => addToast(m, "success"), [addToast]);
  toast.error = useCallback((m) => addToast(m, "error", 5000), [addToast]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div style={{
        position: "fixed", top: 16, right: 16, zIndex: 9999,
        display: "flex", flexDirection: "column", gap: 8,
        pointerEvents: "none", fontFamily: "monospace",
      }}>
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              pointerEvents: "auto",
              padding: "10px 16px",
              borderRadius: 6,
              fontSize: 13,
              color: "#fff",
              background: t.type === "error" ? "#c62828" : "#2e7d32",
              boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
              animation: "toastIn 0.25s ease-out",
              maxWidth: 360,
              wordBreak: "break-word",
            }}
          >
            {t.type === "error" ? "\u2716 " : "\u2714 "}{t.message}
          </div>
        ))}
      </div>
      <style>{`
        @keyframes toastIn { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>
    </ToastContext.Provider>
  );
};
