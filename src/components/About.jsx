import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { discographyService } from "../services/api";
import { LanguageSwitcher } from "./common/LanguageSwitcher";
import { ThemePicker } from "./common/ThemePicker";
import { RecordCrate } from "./common/RecordCrate";
import { UpcomingRelease } from "./common/UpcomingRelease";
import { PageBackground } from "./common/PageBackground";
import { SEO } from "./common/SEO";
import { ABOUT_BACKGROUND, ABOUT_PHOTO_URL, UPCOMING_RELEASE } from "../content/about";
import { useHomePath } from "../hooks/useAuth";
import { useConsoleNav } from "../hooks/useConsoleNav";
import "./About.css";

// Lo que tiene la clase "reveal" aparece al llegar a la pantalla. Sin
// IntersectionObserver (navegadores viejos, tests) se ve todo desde el principio.
const useReveal = (deps) => {
  const rootRef = useRef(null);
  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === "undefined") return undefined;
    root.classList.add("reveal-on");
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        }),
      { threshold: 0.15 }
    );
    root.querySelectorAll(".reveal:not(.is-in)").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return rootRef;
};

// Página pública (sin login), en formato documental (ADR 0009): video con el
// nombre, la frase, la historia en dos columnas, el próximo disco y el cajón de
// discos con el tocadiscos. El logo lleva al home logueado si hay sesión.
export const About = () => {
  const { t } = useTranslation();
  const homePath = useHomePath();
  const [albums, setAlbums] = useState([]);
  const story = t("about.story", { returnObjects: true });
  useConsoleNav({ back: homePath });

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

  const quote = t("about.quote", { returnObjects: true });
  const pageRef = useReveal([albums.length]);

  return (
    <>
      <SEO title={t("about.seoTitle")} description={t("about.seoDesc")} />
      <div className="about-page" ref={pageRef}>
        <header className="about-hero" aria-label={t("about.title")}>
          <PageBackground media={ABOUT_BACKGROUND} contained />
          <div className="about-topbar">
            <Link to={homePath} className="about-logo">{t("nav.niv0Beats")}</Link>
            <LanguageSwitcher />
            <ThemePicker />
          </div>
          <div className="about-hero-text">
            <p className="about-kicker">{t("about.kicker")}</p>
            <h1 className="about-title">{t("about.title")}</h1>
          </div>
        </header>

        <main className="about-main">
          <figure className="about-quote reveal" aria-label={`${quote.before} ${quote.highlight} ${quote.after}`}>
            <blockquote>
              {quote.before} <em>{quote.highlight}</em> {quote.after}
            </blockquote>
          </figure>

          <section className="about-story">
            {ABOUT_PHOTO_URL && <img src={ABOUT_PHOTO_URL} alt={t("about.photoAlt")} className="about-photo reveal" />}
            {Array.isArray(story) && story.map((paragraph) => <p key={paragraph} className="reveal">{paragraph}</p>)}
          </section>

          <UpcomingRelease release={UPCOMING_RELEASE} />

          {albums.length > 0 && (
            <section className="about-discography">
              <h2 className="about-section-title reveal">{t("about.discography")}</h2>
              <RecordCrate albums={albums} />
            </section>
          )}
        </main>
      </div>
    </>
  );
};
