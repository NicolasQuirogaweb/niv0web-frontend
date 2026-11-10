import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { adminService } from "../../services/api";
import { useToast } from "../../hooks/useToast";
import { useUnsavedChanges } from "../../hooks/useUnsavedChanges";
import { AdminUploader } from "./AdminUploader";
import { Spinner, SpinnerStyles } from "./Spinner";
import { fieldA11y, FieldError, errorId, focusFirstInvalid } from "./formA11y";
import { isAbortError } from "../../utils/isAbortError";
import styles from "./admin.module.css";

const EMPTY = { title: "", description: "", imageUrl: "", backgroundVideo: "" };
const sameForm = (a, b) => Object.keys(a).every((k) => a[k] === b[k]);

export const AdminPlaylistForm = ({ type = "beats" }) => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const isEdit = !!id;
  const [form, setForm] = useState(EMPTY);
  // What the form held when it loaded: Cancel only asks when form differs from it.
  const [initialForm, setInitialForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const confirmDiscard = useUnsavedChanges(!saving && !sameForm(form, initialForm));

  const redirectBase = type === "loops" ? "/admin/loops" : "/admin/playlists";
  const itemLabel = type === "loops" ? t("admin.loops.catalogLabel") : t("admin.playlists.catalogLabel");

  useEffect(() => {
    if (!isEdit) return;
    const ctrl = new AbortController();
    adminService.playlists.list(ctrl.signal)
      .then((res) => {
        const item = res.data.find((p) => p._id === id);
        if (!item) return;
        const loaded = {
          title: item.title ?? "",
          description: item.description ?? "",
          imageUrl: item.imageUrl ?? "",
          backgroundVideo: item.backgroundVideo || "",
        };
        setForm(loaded);
        setInitialForm(loaded);
      })
      .catch((err) => {
        if (isAbortError(err)) return;
        toast.error(t("admin.toast.errorLoading", { name: itemLabel.toLowerCase() }));
      });
    return () => ctrl.abort();
  }, [id, isEdit, toast, t, itemLabel]);

  const set = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((e) => ({ ...e, [name]: "" }));
  };
  const handleChange = (e) => set(e.target.name, e.target.value);

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = t("admin.validation.titleRequired");
    else if (form.title.length > 100) errs.title = t("admin.validation.max100");
    if (!form.description.trim()) errs.description = t("admin.validation.descriptionRequired");
    else if (form.description.length > 300) errs.description = t("admin.validation.max300");
    if (!form.imageUrl.trim()) errs.imageUrl = t("admin.validation.imageRequired");
    if (!form.backgroundVideo.trim()) errs.backgroundVideo = t("admin.validation.backgroundRequired");
    setErrors(errs);
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formEl = e.currentTarget;
    const errs = validate();
    if (Object.keys(errs).length) {
      focusFirstInvalid(formEl, errs);
      return;
    }
    setSaving(true);
    try {
      const data = { ...form, type };
      if (isEdit) await adminService.playlists.update(id, data);
      else await adminService.playlists.create(data);
      toast.success(isEdit ? t("admin.toast.updated", { name: itemLabel }) : t("admin.toast.created", { name: itemLabel }));
      navigate(redirectBase);
    } catch (err) {
      toast.error(err.response?.data?.message || t("admin.toast.errorSaving"));
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    if (await confirmDiscard()) navigate(redirectBase);
  };

  const typeLabel = type === "loops" ? t("admin.loops.title") : t("admin.beats.title");
  const inputClass = (name, base = styles.input) => `${base} ${errors[name] ? styles.inputError : ""}`;

  return (
    <div className={styles.formContainer}>
      <SpinnerStyles />
      <h2 className={styles.pageTitleMb}>
        {isEdit ? t("admin.playlists.editTitle", { type: typeLabel }) : t("admin.playlists.newTitle", { type: typeLabel })}
      </h2>
      <form onSubmit={handleSubmit} noValidate className={styles.formStack}>
        <div>
          <label htmlFor="playlist-title" className={styles.label}>{t("admin.common.titleRequired")}</label>
          <input {...fieldA11y("playlist", "title", errors)} value={form.title} onChange={handleChange}
            className={inputClass("title")} placeholder={t("admin.playlists.titleExample")} />
          <FieldError prefix="playlist" name="title" errors={errors} className={styles.fieldError} />
        </div>
        <div>
          <label htmlFor="playlist-description" className={styles.label}>{t("admin.common.descriptionRequired")}</label>
          <textarea {...fieldA11y("playlist", "description", errors)} value={form.description} onChange={handleChange}
            className={inputClass("description", styles.textareaLg)} placeholder={t("admin.playlists.catalogDescription")} />
          <FieldError prefix="playlist" name="description" errors={errors} className={styles.fieldError} />
        </div>
        <div>
          <label htmlFor="playlist-imageUrl" className={styles.label}>{t("admin.common.coverImageRequired")}</label>
          <AdminUploader id="playlist-imageUrl" name="imageUrl" invalid={!!errors.imageUrl}
            describedBy={errors.imageUrl ? errorId("playlist", "imageUrl") : undefined}
            folder="images" accept="image/*" onUpload={(url) => set("imageUrl", url)} />
          {form.imageUrl && <p className={styles.uploadSuccess}>{t("admin.common.imageUploaded")}</p>}
          <FieldError prefix="playlist" name="imageUrl" errors={errors} className={styles.fieldError} />
        </div>
        <div>
          <label htmlFor="playlist-backgroundVideo" className={styles.label}>{t("admin.common.backgroundMediaRequired")}</label>
          <AdminUploader id="playlist-backgroundVideo" name="backgroundVideo" invalid={!!errors.backgroundVideo}
            describedBy={errors.backgroundVideo ? errorId("playlist", "backgroundVideo") : undefined}
            folder="videos" accept="video/*,image/*,.jfif" onUpload={(url) => set("backgroundVideo", url)} />
          {form.backgroundVideo && <p className={styles.uploadSuccess}>{t("admin.common.backgroundUploaded")}</p>}
          <FieldError prefix="playlist" name="backgroundVideo" errors={errors} className={styles.fieldError} />
        </div>
        <div className={styles.formActions} style={{ marginTop: 8 }}>
          <button type="submit" disabled={saving} className={styles.btnPrimary}>
            {saving ? <><Spinner size={14} /> {t("admin.common.saving")}</> : isEdit ? t("admin.common.update") : t("admin.playlists.create")}
          </button>
          <button type="button" onClick={handleCancel} className={styles.btnSecondary}>{t("admin.common.cancel")}</button>
        </div>
      </form>
    </div>
  );
};
