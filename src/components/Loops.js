import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { loopsService } from "../services/api";
import { useLogout } from "../hooks/useAuth";
import { usePublicResource } from "../hooks/usePublicResource";
import { LanguageSwitcher } from "./common/LanguageSwitcher";
import { SEO } from "./common/SEO";
import "./Beats.css";

export const Loops = () => {
  const { t } = useTranslation();
  const handleLogout = useLogout();
  const { data, loading, error, run } = usePublicResource();
  const loops = data || [];

  useEffect(() => {
    run(loopsService.getAll());
  }, [run]);

  if (error) return <p>{t("loops.error")}{error.message || t("loops.errorFallback")}</p>;

  return (
    <>
      <SEO title={t("loops.seoTitle")} description={t("loops.seoDesc")} />
    <section className="beats-section">
      <div className="beats-header-row">
        <h3><Link to="/homelogued">{t("nav.niv0Beats")}</Link></h3>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <LanguageSwitcher />
          <button onClick={handleLogout} style={{ background: "none", border: "none", color: "#bbf0be", cursor: "pointer", fontSize: 14, fontFamily: "monospace" }}>{t("nav.logOut")}</button>
        </div>
      </div>
      {loading ? (
        <p>{t("loops.loading")}</p>
      ) : (
        <div className="beats-content">
          <img src="/images/Loops/loopimg.webp" alt={t("loops.iconAlt")} className="prodmixmaster-imagen" loading="lazy" />
          <h2>{t("loops.title")}</h2>
          {loops.length === 0 ? (
            <p>{t("loops.none")}</p>
          ) : (
            loops.map((loop) => (
              <div key={loop._id} className="prod-mix-master-item">
                <p>{loop.title}</p>
                <audio controls>
                  <source src={loop.audioFile} type="audio/mpeg" />
                  {t("loops.audioNotSupported")}
                </audio>
              </div>
            ))
          )}
        </div>
      )}
      <div className="back-to-catalogue">
        <Link to="/homelogued"><button className="back-to-catalogue-btn" aria-label={t("nav.backToHome")}>{t("nav.backToHome")}</button></Link>
      </div>
    </section>
    </>
  );
};
