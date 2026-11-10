import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useConfirm } from "./useConfirm";

/**
 * Guard for admin forms with unsaved edits.
 * - While `dirty`, closing or reloading the tab asks the browser's "leave site?".
 * - Returns `confirmDiscard()`: resolves true right away when clean, otherwise
 *   asks through useConfirm before the caller throws the edits away (Cancel).
 * In-app navigation (sidebar links) is not blocked: the app uses <BrowserRouter>,
 * and react-router's useBlocker only works with a data router.
 */
export const useUnsavedChanges = (dirty) => {
  const { t } = useTranslation();
  const confirm = useConfirm();

  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  return useCallback(async () => {
    if (!dirty || !confirm) return true;
    return confirm(t("admin.unsaved.title"), t("admin.unsaved.message"), {
      confirmLabel: t("admin.unsaved.discard"),
    });
  }, [dirty, confirm, t]);
};
