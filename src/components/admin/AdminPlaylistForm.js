import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { adminService } from "../../services/api";
import { useToast } from "../../hooks/useToast";
import { AdminUploader } from "./AdminUploader";
import styles from "./admin.module.css";

const INPUT_ERROR = { border: "1px solid #c62828" };

export const AdminPlaylistForm = ({ type = "beats" }) => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const isEdit = !!id;
  const [form, setForm] = useState({
    title: "", description: "", imageUrl: "", backgroundVideo: "",
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const isSamplePack = type === "samples";
  const redirectBase = isSamplePack ? "/admin/samplepacks" : type === "loops" ? "/admin/loops" : "/admin/playlists";
  const itemLabel = isSamplePack ? t("admin.samplePacks.packLabel") : type === "loops" ? t("admin.loops.catalogLabel") : t("admin.playlists.catalogLabel");

  useEffect(() => {
    if (isEdit) {
      adminService.playlists.list()
        .then((res) => {
          const item = res.data.find((p) => p._id === id);
          if (item) setForm({ title: item.title, description: item.description, imageUrl: item.imageUrl, backgroundVideo: item.backgroundVideo || "" });
        })
        .catch(() => toast.error(t("admin.toast.errorLoading", { name: itemLabel.toLowerCase() })));
    }
  }, [id, isEdit, toast, t, itemLabel]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = t("admin.validation.titleRequired");
    else if (form.title.length > 100) errs.title = t("admin.validation.max100");
    if (!form.description.trim()) errs.description = t("admin.validation.descriptionRequired");
    else if (form.description.length > 300) errs.description = t("admin.validation.max300");
    if (!form.imageUrl.trim()) errs.imageUrl = t("admin.validation.imageRequired");
    if (!isSamplePack && !form.backgroundVideo.trim()) errs.backgroundVideo = t("admin.validation.videoRequired");
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      if (isSamplePack) {
        if (isEdit) await adminService.samplepacks.update(id, form);
        else await adminService.samplepacks.create(form);
      } else {
        const data = { ...form, type, backgroundVideo: form.backgroundVideo || " " };
        if (isEdit) await adminService.playlists.update(id, data);
        else await adminService.playlists.create(data);
      }
      toast.success(isEdit ? t("admin.toast.updated", { name: itemLabel }) : t("admin.toast.created", { name: itemLabel }));
      navigate(redirectBase);
    } catch (err) {
      toast.error(err.response?.data?.message || t("admin.toast.errorSaving"));
    } finally {
      setSaving(false);
    }
  };

  const typeLabel = type === "loops" ? t("admin.loops.title") : t("admin.beats.title");

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.pageTitleMb}>
        {isEdit ? t("admin.playlists.editTitle", { type: typeLabel }) : t("admin.playlists.newTitle", { type: typeLabel })}
      </h2>
      <form onSubmit={handleSubmit} className={styles.formStack}>
        <div>
          <label className={styles.label}>{t("admin.common.titleRequired")}</label>
          <input name="title" value={form.title} onChange={handleChange} className={styles.input}
            style={errors.title ? INPUT_ERROR : undefined}
            placeholder={t("admin.playlists.titleExample")} />
          {errors.title && <p style={{ color: "#c62828", fontSize: 12, margin: "4px 0 0" }}>{errors.title}</p>}
        </div>
        <div>
          <label className={styles.label}>{t("admin.common.descriptionRequired")}</label>
          <textarea name="description" value={form.description} onChange={handleChange} className={styles.textareaLg}
            style={errors.description ? INPUT_ERROR : undefined}
            placeholder={t("admin.playlists.catalogDescription")} />
          {errors.description && <p style={{ color: "#c62828", fontSize: 12, margin: "4px 0 0" }}>{errors.description}</p>}
        </div>
        <div>
          <label className={styles.label}>{t("admin.common.coverImageRequired")}</label>
          <AdminUploader folder="images" accept="image/*" onUpload={(url) => { setForm({ ...form, imageUrl: url }); setErrors({ ...errors, imageUrl: "" }); }} />
          {form.imageUrl && <p className={styles.uploadSuccess}>{t("admin.common.imageUploaded")}</p>}
          {errors.imageUrl && <p style={{ color: "#c62828", fontSize: 12, margin: "4px 0 0" }}>{errors.imageUrl}</p>}
        </div>
        {!isSamplePack && (
          <div>
            <label className={styles.label}>{t("admin.common.backgroundVideoRequired")}</label>
            <AdminUploader folder="videos" accept="video/*" onUpload={(url) => { setForm({ ...form, backgroundVideo: url }); setErrors({ ...errors, backgroundVideo: "" }); }} />
            {form.backgroundVideo && <p className={styles.uploadSuccess}>{t("admin.common.videoUploaded")}</p>}
            {errors.backgroundVideo && <p style={{ color: "#c62828", fontSize: 12, margin: "4px 0 0" }}>{errors.backgroundVideo}</p>}
          </div>
        )}
        <div className={styles.formActions} style={{ marginTop: 8 }}>
          <button type="submit" disabled={saving} className={styles.btnPrimary} style={{ opacity: saving ? 0.6 : 1 }}>
            {saving ? t("admin.common.saving") : isEdit ? t("admin.common.update") : t("admin.playlists.create")}
          </button>
          <button type="button" onClick={() => navigate(redirectBase)} className={styles.btnSecondary}>{t("admin.common.cancel")}</button>
        </div>
      </form>
    </div>
  );
};
