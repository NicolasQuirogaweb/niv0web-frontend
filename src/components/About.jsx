import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { discographyService } from "../services/api";
import { LanguageSwitcher } from "./common/LanguageSwitcher";
import { VinylGrid } from "./common/VinylGrid";
import { SEO } from "./common/SEO";
import { ABOUT_PHOTO_URL } from "../content/about";
import { useHomePath } from "../hooks/useAuth";
import "./About.css";

// Página pública (sin login): no usa PageHeader ni nada que exija sesión. El logo
// lleva al home logueado si hay sesión y al público si no.
export const About = () => {
  const { t } = useTranslation();
  const homePath = useHomePath();
  const [albums, setAlbums] = useState([]);
  const story = t("about.story", { returnObjects: true });

  useEffect(() => {
    let active = true;
    discographyService
      .getAll()
      .then((res) => active && setAlbums(Array.isArray(res.data) ? res.data : []))
      .catch(() => active && setAlbums([])); // sin discografía, la historia se muestra igual
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <SEO title={t("about.seoTitle")} description={t("about.seoDesc")} />
      <main className="about-page">
        <header className="about-header">
          <Link to={homePath} className="about-logo">{t("nav.niv0Beats")}</Link>
          <LanguageSwitcher />
        </header>

        <section className="about-story">
          {ABOUT_PHOTO_URL && <img src={ABOUT_PHOTO_URL} alt={t("about.photoAlt")} className="about-photo" />}
          <div>
            <h1>{t("about.title")}</h1>
            {Array.isArray(story) && story.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        </section>

        {albums.length > 0 && (
          <section className="about-discography">
            <h2>{t("about.discography")}</h2>
            <VinylGrid albums={albums} />
          </section>
        )}
      </main>
    </>
  );
};
