import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { samplePacksService } from "../services/api";
import { usePublicResource } from "../hooks/usePublicResource";
import { CardPlaylist } from "./CardPlaylist";
import { PageHeader } from "./common/PageHeader";
import { SEO } from "./common/SEO";
import "./SamplePacks.css";

export const SamplePacks = () => {
  const { t } = useTranslation();
  const { data, loading, error, run } = usePublicResource();
  const packs = data || [];

  useEffect(() => {
    run(samplePacksService.getAll());
  }, [run]);

  return (
    <>
      <SEO title={t("samplePacks.seoTitle")} description={t("samplePacks.seoDesc")} />
    <section className="samplepacks-section">
      <PageHeader className="samplepacks-info" />
      <div className="samplepacks-body">
        {loading ? (
          <p>{t("samplePacks.loading")}</p>
        ) : error ? (
          <p role="alert">{t("samples.error")}{error.message || t("samples.errorFallback")}</p>
        ) : packs.length === 0 ? (
          <p>{t("samplePacks.none")}</p>
        ) : (
          <div className="beats-list-samplepacks">
            {packs.map((pack) => (
              <CardPlaylist key={pack._id} playlist={pack} resourceType="samples" />
            ))}
          </div>
        )}
      </div>
      <div className="back-to-catalogue">
        <Link to="/homelogued" className="back-to-catalogue-btn">{t("nav.backToHome")}</Link>
      </div>
    </section>
    </>
  );
};