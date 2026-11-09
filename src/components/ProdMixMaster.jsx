import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { PageHeader } from "./common/PageHeader";
import { SEO } from "./common/SEO";
import { useConsoleNav } from "../hooks/useConsoleNav";
import "./ProdMixMaster.css";
import { PageBackground } from "./common/PageBackground";
import { PAGE_BACKGROUNDS } from "../content/backgrounds";

// Playlist pública de Spotify con los temas que produjo, mezcló o masterizó niv0.
export const PLAYLIST_ID = "5bMePdSTs9zljOIbSWsteY";
const PLAYLIST_URL = `https://open.spotify.com/playlist/${PLAYLIST_ID}`;
const EMBED_URL = `https://open.spotify.com/embed/playlist/${PLAYLIST_ID}?theme=0`;
const CONTACT_URL = "https://www.instagram.com/__niv0__/";

// Servicio de producción, mezcla y master: la playlist se ve y se escucha en la página
// con el reproductor oficial de Spotify (las reproducciones cuentan) y debajo, cómo contratarlo.
export const ProdMixMaster = () => {
  const { t } = useTranslation();
  useConsoleNav({ back: "/homelogued" });

  return (
    <>
      <SEO title={t("prodMix.seoTitle")} description={t("prodMix.seoDesc")} />
      <PageBackground media={PAGE_BACKGROUNDS.prodMix} />
      <section className="prod-mix-master-section">
        <PageHeader className="prodmix-header" />
        <div className="prodmix-content">
          <h1 className="prodmix-title">{t("prodMix.title")}</h1>
          <p className="prodmix-subtitle">{t("prodMix.subtitle")}</p>
          <div className="prodmix-player">
            <iframe
              title={t("prodMix.playerTitle")}
              src={EMBED_URL}
              width="100%"
              height="452"
              loading="lazy"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            />
          </div>
          <div className="prodmix-actions">
            <a className="prodmix-hire" href={CONTACT_URL} target="_blank" rel="noopener noreferrer">
              {t("prodMix.hire")}
            </a>
            <a className="prodmix-open" href={PLAYLIST_URL} target="_blank" rel="noopener noreferrer">
              {t("prodMix.openSpotify")}
            </a>
          </div>
        </div>
        <div className="back-to-catalogue">
          <Link to="/homelogued" className="back-to-catalogue-btn">{t("nav.backToHome")}</Link>
        </div>
      </section>
    </>
  );
};
