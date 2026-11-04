import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { PageHeader } from "./common/PageHeader";
import { GlassCard } from "./common/GlassCard";
import { SEO } from "./common/SEO";
import "./ProdMixMaster.css";

const SPOTIFY_PLAYLIST_URL = "https://open.spotify.com/playlist/5bMePdSTs9zljOIbSWsteY?si=055aa9437a584ef0";
const COVER_URL = "/images/prodmixmasters/img-sonido-png.png";

// Servicio de producción, mezcla y master: la misma card de vidrio que los
// catálogos, pero lleva a la playlist de Spotify con los trabajos.
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
          <h1 className="prodmix-title">{t("prodMix.title")}</h1>
          <p className="prodmix-subtitle">{t("prodMix.subtitle")}</p>
          <GlassCard
            href={SPOTIFY_PLAYLIST_URL}
            imageUrl={COVER_URL}
            title={t("prodMix.title")}
            meta={t("prodMix.openSpotify")}
            className="prodmix-card"
          />
        </div>
        <div className="back-to-catalogue">
          <Link to="/homelogued" className="back-to-catalogue-btn">{t("nav.backToHome")}</Link>
        </div>
      </section>
    </>
  );
};
