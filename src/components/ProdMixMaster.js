import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useLogout } from "../hooks/useAuth";
import { LanguageSwitcher } from "./common/LanguageSwitcher";
import { SEO } from "./common/SEO";
import "./ProdMixMaster.css";

export const ProdMixMaster = () => {
  const { t } = useTranslation();
  const handleLogout = useLogout();

  return (
    <>
      <SEO title={t("prodMix.seoTitle")} description={t("prodMix.seoDesc")} />
    <section className="prod-mix-master-section">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "12px 40px 0" }}>
        <h3 style={{ color: "#bbf0be", margin: 0, fontSize: 50 }}><Link to="/homelogued" style={{ color: "inherit", textDecoration: "none" }}>{t("nav.niv0Beats")}</Link></h3>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <LanguageSwitcher />
          <button onClick={handleLogout} style={{ background: "none", border: "none", color: "#bbf0be", cursor: "pointer", fontSize: 14, fontFamily: "monospace" }}>{t("nav.logOut")}</button>
        </div>
      </div>
      <div className="prodmix-content">
        <img src="/images/prodmixmasters/mixingfondo.webp" alt={t("prodMix.iconAlt")} className="prodmixmaster-imagen" loading="lazy" />
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
        <Link to="/homelogued"><button className="back-to-catalogue-btn" aria-label={t("nav.backToHome")}>{t("nav.backToHome")}</button></Link>
      </div>
    </section>
    </>
  );
};
