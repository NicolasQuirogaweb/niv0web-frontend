import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { samplePacksService } from "../services/api";
import { usePublicResource } from "../hooks/usePublicResource";
import { CatalogConsole } from "./common/CatalogConsole";
import { PackCover } from "./samplepacks/PackCover";
import { formatPackPrice } from "../utils/formatPrice";
import { PageHeader } from "./common/PageHeader";
import { LoadError } from "./common/LoadError";
import { SEO } from "./common/SEO";
import { useConsoleNav } from "../hooks/useConsoleNav";
import "./SamplePacks.css";
import { PageBackground } from "./common/PageBackground";
import { PAGE_BACKGROUNDS } from "../content/backgrounds";

export const SamplePacks = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith("en") ? "en" : "es";
  const { data, loading, error, run } = usePublicResource();
  useConsoleNav({ back: "/homelogued" });
  const packs = data || [];

  useEffect(() => {
    run(samplePacksService.getAll());
  }, [run]);

  return (
    <>
      <SEO title={t("samplePacks.seoTitle")} description={t("samplePacks.seoDesc")} />
    <PageBackground media={PAGE_BACKGROUNDS.samplePacks} />
    <section className="samplepacks-section">
      <PageHeader className="samplepacks-info" />
      <div className="samplepacks-body">
        {loading ? (
          <p>{t("samplePacks.loading")}</p>
        ) : error ? (
          <LoadError error={error} onRetry={() => run(samplePacksService.getAll())} />
        ) : packs.length === 0 ? (
          <p>{t("samplePacks.none")}</p>
        ) : (
          <CatalogConsole
            items={packs}
            resourceType="samplepacks"
            getHref={(pack) => `/samplepacks/${pack.slug}`}
            getMeta={(pack) => t("samplePacks.meta", {
              folders: t("samplePacks.folderCount", { count: pack.folderCount }),
              samples: t("samplePacks.sampleCount", { count: pack.itemsCount }),
            })}
            getBadge={(pack) => (pack.isFree ? t("samplePacks.free") : formatPackPrice(pack, lang))}
            renderLabelFallback={(pack) => <PackCover title={pack.title} imageUrl={null} />}
          />
        )}
      </div>
      <div className="back-to-catalogue">
        <Link to="/homelogued" className="back-to-catalogue-btn">{t("nav.backToHome")}</Link>
      </div>
    </section>
    </>
  );
};