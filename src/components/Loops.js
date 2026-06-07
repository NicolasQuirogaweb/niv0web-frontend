import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { authService, loopsService } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { LanguageSwitcher } from "./common/LanguageSwitcher";
import { SEO } from "./common/SEO";
import "./Beats.css";

export const Loops = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { clearAuth } = useAuth();
  const [loops, setLoops] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    await authService.logout().catch(() => {});
    clearAuth();
    navigate("/", { replace: true });
  };
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLoops = async () => {
      try {
        const res = await loopsService.getAll();
        setLoops(res.data);
      } catch (err) {
        setError(err.message || t("loops.errorFallback"));
      } finally {
        setLoading(false);
      }
    };
    fetchLoops();
  }, [t]);

  if (error) return <p>{t("loops.error")}{error}</p>;

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
