import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams, Link } from "react-router-dom";
import { samplePacksService } from "../../services/api";
import { usePublicResource } from "../../hooks/usePublicResource";
import { usePlaylistPlayer } from "../../hooks/usePlaylistPlayer";
import { useConsoleNav } from "../../hooks/useConsoleNav";
import { PageHeader } from "../common/PageHeader";
import { PageBackground } from "../common/PageBackground";
import { SEO } from "../common/SEO";
import { PAGE_BACKGROUNDS } from "../../content/backgrounds";
import { formatBytes, formatPackPrice } from "../../utils/formatPrice";
import { PackCover } from "./PackCover";
import { SampleBrowser, flattenFolders } from "./SampleBrowser";
import "./SamplePackPage.css";

const ZipControl = ({ pack, lang }) => {
  const { t } = useTranslation();
  if (!pack.isFree) {
    return (
      <button type="button" className="pack-zip-btn" disabled>
        {t("samplePacks.comingSoon")} · {formatPackPrice(pack, lang)}
      </button>
    );
  }
  if (!pack.zip) {
    return (
      <button type="button" className="pack-zip-btn" disabled>
        {t("samplePacks.zipPending")}
      </button>
    );
  }
  return (
    <a href={pack.zip.url} download className="pack-zip-btn" data-nav-item>
      {t("samplePacks.downloadZip")}
      {pack.zip.bytes != null && ` · ${formatBytes(pack.zip.bytes)}`}
    </a>
  );
};

export const SamplePackPage = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith("en") ? "en" : "es";
  const { slug } = useParams();
  useConsoleNav({ back: "/samplepacks" });
  const { data: pack, loading, error, run } = usePublicResource();

  useEffect(() => {
    run(samplePacksService.getBySlug(slug));
  }, [slug, run]);

  const folders = pack?.folders || [];
  // Los samples se escuchan de a uno: sin pasar solo al siguiente.
  const player = usePlaylistPlayer(flattenFolders(folders), {
    autoAdvance: false,
    meta: { album: pack?.title, artwork: pack?.imageUrl },
  });

  const notFound = error?.response?.status === 404;

  return (
    <>
      <SEO title={pack?.title || t("samplePacks.seoTitle")} description={pack?.description || t("samplePacks.seoDesc")} />
      <PageBackground media={PAGE_BACKGROUNDS.samplePacks} />
      <div className="pack-page">
        <PageHeader className="samplepacks-info" titleAs="h2" />
        {loading ? (
          <p>{t("samplePacks.loading")}</p>
        ) : notFound ? (
          <p role="alert">{t("samplePacks.notFound")}</p>
        ) : error ? (
          <p role="alert">{t("samples.error")}{error.message || t("samples.errorFallback")}</p>
        ) : pack ? (
          <div className="pack-page-content">
            <div className="pack-page-head">
              <div className="pack-page-cover">
                <PackCover title={pack.title} imageUrl={pack.imageUrl} />
              </div>
              <div className="pack-page-info">
                <h1 className="pack-page-title">{pack.title}</h1>
                {pack.description && <p className="pack-page-description">{pack.description}</p>}
                <ZipControl pack={pack} lang={lang} />
              </div>
            </div>
            <SampleBrowser folders={folders} player={player} />
          </div>
        ) : null}
        <div className="back-button">
          <Link to="/samplepacks" className="back-to-catalogue-btn">
            {t("nav.backToPacksShort")}
          </Link>
        </div>
      </div>
    </>
  );
};
