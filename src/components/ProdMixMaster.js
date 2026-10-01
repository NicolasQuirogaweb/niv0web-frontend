import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { PageHeader } from "./common/PageHeader";
import { SEO } from "./common/SEO";
import "./ProdMixMaster.css";

export const ProdMixMaster = () => {
  const { t } = useTranslation();

  return (
    <>
      <SEO title={t("prodMix.seoTitle")} description={t("prodMix.seoDesc")} />
    <section className="prod-mix-master-section">
      <PageHeader
        className="prodmix-header"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "12px 40px 0" }}
      />
      <div className="prodmix-content">
        <img src="/images/prodmixmasters/img-sonido-png.png" alt={t("prodMix.iconAlt")} className="prodmix-cover-image" loading="lazy" />
        <h2>{t("prodMix.title")}</h2>
        <p>{t("prodMix.subtitle")}</p>
        <a className="spotify-playlist-link"
          href="https://open.spotify.com/playlist/5bMePdSTs9zljOIbSWsteY?si=055aa9437a584ef0"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>{t("prodMix.openSpotify")}</span>
        </a>
      </div>
      <div className="back-to-catalogue">
        <Link to="/homelogued" className="back-to-catalogue-btn">{t("nav.backToHome")}</Link>
      </div>
    </section>
    </>
  );
};
