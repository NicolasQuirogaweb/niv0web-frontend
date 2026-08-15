import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { beatsService } from "../services/api";
import { useLogout } from "../hooks/useAuth";
import { usePublicResource } from "../hooks/usePublicResource";
import { CardPlaylist } from "./CardPlaylist";
import { LanguageSwitcher } from "./common/LanguageSwitcher";
import { SEO } from "./common/SEO";
import "./Beats.css";

export const Beats = () => {
  const { t } = useTranslation();
  const handleLogout = useLogout();
  const { data, loading, run } = usePublicResource();
  const playlists = data || [];

  useEffect(() => {
    run(beatsService.getAll());
  }, [run]);

  return (
    <>
      <SEO title={t("beats.seoTitle")} description={t("beats.seoDesc")} />
    <section className="beats-section">
      <div className="beats-info">
        <h3><Link to="/homelogued">{t("nav.niv0Beats")}</Link></h3>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <LanguageSwitcher />
          <button onClick={handleLogout} style={{ background: "none", border: "none", color: "#bbf0be", cursor: "pointer", fontSize: 14, fontFamily: "monospace" }}>{t("nav.logOut")}</button>
        </div>
      </div>
      {loading ? (
        <p>{t("beats.loading")}</p>
      ) : playlists.length === 0 ? (
        <p>{t("beats.none")}</p>
      ) : (
        <div className="beats-list">
          {playlists.map((playlist) => (
            <CardPlaylist key={playlist._id} playlist={playlist} resourceType="beats" />
          ))}
        </div>
      )}
      <div className="beats-description">
        <h2>{t("beats.licenses")}</h2>
        <p>{t("beats.exclusiveStems")}</p>
        <p>{t("beats.exclusiveWav")}</p>
        <p>{t("beats.commonLease")}</p>
      </div>
      <div className="back-to-catalogue">
        <Link to="/homelogued"><button className="back-to-catalogue-btn" aria-label={t("nav.backToHome")}>{t("nav.backToHome")}</button></Link>
      </div>
    </section>
    </>
  );
};
