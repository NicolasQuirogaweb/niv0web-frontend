import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { samplePacksService } from "../services/api";
import { useLogout } from "../hooks/useAuth";
import { usePublicResource } from "../hooks/usePublicResource";
import { CardPlaylist } from "./CardPlaylist";
import { LanguageSwitcher } from "./common/LanguageSwitcher";
import { SEO } from "./common/SEO";
import "./SamplePacks.css";

export const SamplePacks = () => {
  const { t } = useTranslation();
  const handleLogout = useLogout();
  const { data, loading, run } = usePublicResource();
  const packs = data || [];

  useEffect(() => {
    run(samplePacksService.getAll());
  }, [run]);

  return (
    <>
      <SEO title={t("samplePacks.seoTitle")} description={t("samplePacks.seoDesc")} />
    <section className="samplepacks-section">
      <div className="samplepacks-info">
        <h3><Link to="/homelogued">{t("nav.niv0Beats")}</Link></h3>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <LanguageSwitcher />
          <button onClick={handleLogout} style={{ background: "none", border: "none", color: "#bbf0be", cursor: "pointer", fontSize: 14, fontFamily: "monospace" }}>{t("nav.logOut")}</button>
        </div>
      </div>
      {loading ? (
        <p>{t("samplePacks.loading")}</p>
      ) : packs.length === 0 ? (
        <p>{t("samplePacks.none")}</p>
      ) : (
        <div className="beats-list-samplepacks">
          {packs.map((pack) => (
            <CardPlaylist key={pack._id} playlist={pack} resourceType="samples" />
          ))}
        </div>
      )}
      <div className="back-to-catalogue">
        <Link to="/homelogued"><button className="back-to-catalogue-btn" aria-label={t("nav.backToHome")}>{t("nav.backToHome")}</button></Link>
      </div>
    </section>
    </>
  );
};