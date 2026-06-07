import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { LanguageSwitcher } from "./common/LanguageSwitcher";
import { SEO } from "./common/SEO";
import { useAuth } from "../hooks/useAuth";
import "./Home.css";

export const Home = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  return (
    <>
      <SEO description={t("home.seoDesc")} />
    <section className="home-section">
      <div>
        <div className="home-header-row">
          <h3><Link to="/home">{t("nav.niv0Beats")}</Link></h3>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <LanguageSwitcher />
            {isAuthenticated ? (
              <h4><Link to="/homelogued">{t("nav.logIn")}</Link></h4>
            ) : (
              <>
                <h4><Link to="/login">{t("nav.logIn")}</Link></h4>
                <h4><Link to="/login">{t("nav.signUp")}</Link></h4>
              </>
            )}
          </div>
        </div>
        <h6 className="beats-home"><Link to="/beats">{t("home.beats")}</Link></h6>
        <h6 className="samplepacks-home"><Link to="/samplepacks">{t("home.samplePacks")}</Link></h6>
        <h6 className="prodmixmaster-home"><Link to="/prodmixmaster">{t("home.prodMixMaster")}</Link></h6>
        <p>{t("home.cta")}</p>
      </div>
    </section>
    </>
  );
};
