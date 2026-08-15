import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { adminService } from "../services/api";
import { useToast } from "./useToast";
import { useConfirm } from "./useConfirm";

/**
 * Shared state/handlers for the admin "list + form + delete" CRUD screens
 * (Beats, Samples, Loops, ProdMixMaster). Each screen supplies its own
 * fetch/create/update/delete calls (bound to whatever parent id it needs)
 * and keeps its own JSX, since the form fields differ per entity.
 */
export const useAdminResource = ({ fetchData, createFn, updateFn, deleteFn, emptyForm, labelKey, batch }) => {
  const { t } = useTranslation();
  const toast = useToast();
  const confirm = useConfirm();
  const label = t(labelKey);

  const [items, setItems] = useState([]);
  const [parent, setParent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [batchMode, setBatchMode] = useState(false);
  const [batchFiles, setBatchFiles] = useState([]);
  const [batchUploading, setBatchUploading] = useState(false);
  const [batchProgress, setBatchProgress] = useState("");

  const load = useCallback(async (signal) => {
    try {
      const result = await fetchData(signal);
      setItems(result.items);
      setParent(result.parent ?? null);
    } catch (err) {
      if (err.name === "CanceledError" || err.code === "ERR_CANCELED") return;
      toast.error(t("admin.toast.errorLoading", { name: label }));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchData, label]);

  useEffect(() => {
    const ctrl = new AbortController();
    load(ctrl.signal);
    return () => ctrl.abort();
  }, [load]);

  const resetForm = () => {
    setForm(emptyForm);
    setErrors({});
    setEditItem(null);
    setShowForm(false);
  };

  const handleEdit = (item) => {
    const picked = Object.fromEntries(Object.keys(emptyForm).map((key) => [key, item[key]]));
    setForm(picked);
    setEditItem(item);
    setShowForm(true);
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = t("admin.validation.titleRequired");
    if (!form.audioFile) errs.audioFile = t("admin.validation.audioRequired");
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      if (editItem) {
        await updateFn(editItem._id, form);
        toast.success(t("admin.toast.updated", { name: label }));
      } else {
        await createFn(form);
        toast.success(t("admin.toast.created", { name: label }));
      }
      resetForm();
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || t("admin.toast.errorSaving"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (itemId) => {
    const target = items.find((i) => i._id === itemId);
    const ok = await confirm(
      t("admin.confirm.deleteTitle", { name: label }),
      t("admin.confirm.deleteMessage", { item: target?.title })
    );
    if (!ok) return;
    try {
      await deleteFn(itemId);
      toast.success(t("admin.toast.deleted", { name: label }));
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || t("admin.toast.errorDeleting"));
    }
  };

  const handleBatchFiles = (e) => setBatchFiles(Array.from(e.target.files));
  const handleDrop = (e) => {
    e.preventDefault();
    setBatchFiles(Array.from(e.dataTransfer.files));
  };
  const handleDragOver = (e) => e.preventDefault();
  const removeBatchFile = (index) => setBatchFiles((prev) => prev.filter((_, i) => i !== index));

  const handleBatchUpload = async () => {
    if (!batch || batchFiles.length === 0) return;
    setBatchUploading(true);
    setBatchProgress(t("admin.uploader.uploadingToB2"));
    try {
      const uploadRes = await adminService.upload.batch(batchFiles, batch.folder);
      const results = uploadRes.data.results;
      const succeeded = results.filter((r) => r.success);
      const failed = results.filter((r) => !r.success);

      if (succeeded.length) {
        setBatchProgress(t("admin.uploader.creatingItems", { name: label.toLowerCase() }));
        const itemsData = succeeded.map(batch.mapUpload);
        await batch.batchFn(itemsData);
        toast.success(t("admin.toast.batchUploaded", { count: itemsData.length }));
      }
      if (failed.length) {
        toast.error(t("admin.toast.batchPartialError", {
          count: failed.length,
          names: failed.map((f) => f.originalName).join(", "),
        }));
      }
      setBatchMode(false);
      setBatchFiles([]);
      load();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || t("admin.common.unknownError");
      toast.error(t("admin.toast.batchError", { message: msg }));
    } finally {
      setBatchUploading(false);
      setBatchProgress("");
    }
  };

  const cancelBatch = () => {
    setBatchMode(false);
    setBatchFiles([]);
    setBatchProgress("");
  };

  return {
    items,
    parent,
    loading,
    label,
    showForm,
    setShowForm,
    editItem,
    form,
    setForm,
    errors,
    setErrors,
    saving,
    resetForm,
    handleEdit,
    handleSubmit,
    handleDelete,
    batchMode,
    setBatchMode,
    batchFiles,
    batchUploading,
    batchProgress,
    handleBatchFiles,
    handleDrop,
    handleDragOver,
    removeBatchFile,
    handleBatchUpload,
    cancelBatch,
  };
};
