import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { adminService } from "../../services/api";
import { useToast } from "../../hooks/useToast";
import { AdminUploader } from "./AdminUploader";
import { isAbortError } from "../../utils/isAbortError";
import { packErrorText } from "./packErrors";
import styles from "./admin.module.css";

const EMPTY = { title: "", description: "", descriptionEn: "", imageUrl: "", free: true, priceArs: "", priceUsd: "", published: false };

const isPrice = (v) => v !== "" && Number.isFinite(Number(v)) && Number(v) >= 0;

export const AdminSamplePackForm = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const isEdit = !!id;
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const label = t("admin.samplePacks.packLabel");

  useEffect(() => {
    if (!isEdit) return;
    const ctrl = new AbortController();
    adminService.samplepacks.list(ctrl.signal)
      .then((res) => {
        const item = res.data.find((p) => p._id === id);
        if (!item) return;
        setForm({
          title: item.title,
          description: item.description,
          descriptionEn: item.descriptionEn || "",
          imageUrl: item.imageUrl || "",
          free: item.priceArs == null,
          priceArs: item.priceArs ?? "",
          priceUsd: item.priceUsd ?? "",
          published: !!item.published,
        });
      })
      .catch((err) => {
        if (isAbortError(err)) return;
        toast.error(t("admin.toast.errorLoading", { name: label.toLowerCase() }));
      });
    return () => ctrl.abort();
  }, [id, isEdit, toast, t, label]);

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
    if (form.descriptionEn.length > 300) errs.descriptionEn = t("admin.validation.max300");
    if (!form.free) {
      if (!isPrice(form.priceArs)) errs.priceArs = t("admin.samplePacks.validation.priceArs");
      if (form.priceUsd !== "" && !isPrice(form.priceUsd)) errs.priceUsd = t("admin.samplePacks.validation.priceUsd");
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    const data = {
      title: form.title,
      description: form.description,
      // Opcional: vacía, la página muestra la descripción en español también en inglés.
      descriptionEn: form.descriptionEn.trim(),
      // Sin portada se manda null (el backend lo guarda asi y permite quitarla).
      imageUrl: form.imageUrl || null,
      priceArs: form.free ? null : Number(form.priceArs),
      priceUsd: form.free || form.priceUsd === "" ? null : Number(form.priceUsd),
    };
    try {
      if (isEdit) {
        await adminService.samplepacks.update(id, { ...data, published: form.published });
        toast.success(t("admin.toast.updated", { name: label }));
        navigate("/admin/samplepacks");
      } else {
        const res = await adminService.samplepacks.create(data);
        toast.success(t("admin.toast.created", { name: label }));
        // Un pack nuevo no tiene carpetas: se sigue en su pantalla para armarlas.
        navigate(res?.data?._id ? `/admin/samplepacks/${res.data._id}/samples` : "/admin/samplepacks");
      }
    } catch (err) {
      toast.error(packErrorText(t, err, "admin.toast.errorSaving"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.pageTitleMb}>
        {isEdit ? t("admin.samplePacks.form.editTitle") : t("admin.samplePacks.form.newTitle")}
      </h2>
      <form onSubmit={handleSubmit} className={styles.formStack}>
        <div>
          <label htmlFor="pack-title" className={styles.label}>{t("admin.common.titleRequired")}</label>
          <input id="pack-title" name="title" value={form.title} onChange={handleChange} className={`${styles.input} ${errors.title ? styles.inputError : ""}`} />
          {errors.title && <p className={styles.fieldError}>{errors.title}</p>}
        </div>
        <div>
          <label htmlFor="pack-description" className={styles.label}>{t("admin.common.descriptionRequired")}</label>
          <textarea id="pack-description" name="description" value={form.description} onChange={handleChange}
            className={`${styles.textareaLg} ${errors.description ? styles.inputError : ""}`} />
          {errors.description && <p className={styles.fieldError}>{errors.description}</p>}
        </div>
        <div>
          <label htmlFor="pack-description-en" className={styles.label}>{t("admin.samplePacks.form.descriptionEn")}</label>
          <textarea id="pack-description-en" name="descriptionEn" value={form.descriptionEn} onChange={handleChange}
            aria-describedby="pack-description-en-hint"
            className={`${styles.textareaLg} ${errors.descriptionEn ? styles.inputError : ""}`} />
          <p id="pack-description-en-hint" className={styles.itemMeta}>{t("admin.samplePacks.form.descriptionEnHint")}</p>
          {errors.descriptionEn && <p className={styles.fieldError}>{errors.descriptionEn}</p>}
        </div>
        <div>
          <label className={styles.label}>{t("admin.samplePacks.form.coverOptional")}</label>
          <AdminUploader folder="images" accept="image/*" onUpload={(url) => set("imageUrl", url)} />
          {form.imageUrl && <p className={styles.uploadSuccess}>{t("admin.common.imageUploaded")}</p>}
        </div>
        <div>
          <label htmlFor="pack-free">
            <input id="pack-free" type="checkbox" checked={form.free} onChange={(e) => set("free", e.target.checked)} />{" "}
            {t("admin.samplePacks.form.free")}
          </label>
        </div>
        {!form.free && (
          <>
            <div>
              <label htmlFor="pack-price-ars" className={styles.label}>{t("admin.samplePacks.form.priceArs")}</label>
              <input id="pack-price-ars" name="priceArs" type="number" min="0" step="any" value={form.priceArs}
                onChange={handleChange} className={`${styles.input} ${errors.priceArs ? styles.inputError : ""}`} />
              {errors.priceArs && <p className={styles.fieldError}>{errors.priceArs}</p>}
            </div>
            <div>
              <label htmlFor="pack-price-usd" className={styles.label}>{t("admin.samplePacks.form.priceUsd")}</label>
              <input id="pack-price-usd" name="priceUsd" type="number" min="0" step="any" value={form.priceUsd}
                onChange={handleChange} className={`${styles.input} ${errors.priceUsd ? styles.inputError : ""}`} />
              {errors.priceUsd && <p className={styles.fieldError}>{errors.priceUsd}</p>}
            </div>
          </>
        )}
        {isEdit && (
          <div>
            <label htmlFor="pack-published">
              <input id="pack-published" type="checkbox" checked={form.published} onChange={(e) => set("published", e.target.checked)} />{" "}
              {t("admin.samplePacks.form.published")}
            </label>
            {!form.free && <p className={styles.itemMeta}>{t("admin.samplePacks.form.publishedHint")}</p>}
          </div>
        )}
        <div className={styles.formActions} style={{ marginTop: 8 }}>
          <button type="submit" disabled={saving} className={styles.btnPrimary} style={{ opacity: saving ? 0.6 : 1 }}>
            {saving ? t("admin.common.saving") : isEdit ? t("admin.common.update") : t("admin.samplePacks.form.create")}
          </button>
          <button type="button" onClick={() => navigate("/admin/samplepacks")} className={styles.btnSecondary}>{t("admin.common.cancel")}</button>
        </div>
      </form>
    </div>
  );
};
