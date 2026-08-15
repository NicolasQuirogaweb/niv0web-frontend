import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram } from "@fortawesome/free-brands-svg-icons";
import { Link } from "react-router-dom";
import { useAuth, useLogout } from "../hooks/useAuth";
import { LanguageSwitcher } from "./common/LanguageSwitcher";
import { SEO } from "./common/SEO";
import "./HomeLogued.css";

export const HomeLogued = () => {
  const { t } = useTranslation();
  const { userEmail, isAdmin } = useAuth();
  const handleLogout = useLogout();

  return (
    <>
      <SEO title={t("home.seoTitle")} description={t("home.seoDescLogged")} />
    <section className="home-section-logued">
      <div>
        <div className="home-header-row">
          <h3><Link to="/homelogued">{t("nav.niv0Beats")}</Link></h3>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <LanguageSwitcher />
            <h4><Link to="/homelogued">{userEmail || t("loading")}</Link></h4>
            <h5><button onClick={handleLogout} aria-label={t("nav.logOut")}>{t("nav.logOut")}</button></h5>
          </div>
        </div>
        <h6 className="beats-home"><Link to="/beats">{t("home.beats")}</Link></h6>
        <h6 className="samplepacks-home"><Link to="/samplepacks">{t("home.samplePacks")}</Link></h6>
        <h6 className="prodmixmaster-home"><Link to="/prodmixmaster">{t("home.prodMixMaster")}</Link></h6>
        {isAdmin && (
          <h6 className="admin-home" style={{ marginTop: 16 }}>
            <Link to="/admin" style={{ color: "#4caf50", border: "1px solid #4caf50", padding: "4px 12px", borderRadius: 4, fontSize: 12 }}>
              {t("nav.adminPanel")}
            </Link>
          </h6>
        )}
      </div>
      <div className="icon-insta-logued">
        <a href="https://www.instagram.com/__niv0__/" target="_blank" rel="noopener noreferrer" aria-label={t("nav.instagram")}>
          <FontAwesomeIcon icon={faInstagram} className="instagram-icon" />
        </a>
      </div>
      <p>{t("nav.contactMe")}</p>
    </section>
    </>
  );
};
