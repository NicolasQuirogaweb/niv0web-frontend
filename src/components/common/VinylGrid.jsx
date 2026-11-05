import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

// Discografía como grilla de vinilos. Cada lanzamiento es un <button> (teclado y
// touch, no solo hover): al abrirlo se muestra el reproductor embebido de
// Spotify, para que las escuchas sumen reproducciones allá.
export const VinylGrid = ({ albums }) => {
  const { t } = useTranslation();
  const [openId, setOpenId] = useState(null);
  const playerRef = useRef(null);
  const open = albums.find((a) => a.spotifyId === openId);

  useEffect(() => {
    if (!openId) return undefined;
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      // Esc cierra el vinilo; preventDefault para que la página no vuelva atrás también.
      e.preventDefault();
      setOpenId(null);
    };
    document.addEventListener("keydown", onKey);
    playerRef.current?.scrollIntoView?.({ block: "nearest", behavior: "smooth" });
    return () => document.removeEventListener("keydown", onKey);
  }, [openId]);

  return (
    <div className="vinyl-section">
      <ul className="vinyl-grid">
        {albums.map((album) => {
          const isOpen = album.spotifyId === openId;
          return (
            <li key={album.spotifyId}>
              <button
                type="button"
                className={`vinyl${isOpen ? " vinyl--open" : ""}`}
                onClick={() => setOpenId(isOpen ? null : album.spotifyId)}
                aria-expanded={isOpen}
                data-nav-item=""
              >
                <span className="vinyl-disc" aria-hidden="true" />
                <span className="vinyl-sleeve">
                  {album.imageUrl ? (
                    <img src={album.imageUrl} alt="" loading="lazy" />
                  ) : (
                    <span className="vinyl-nocover">{t("about.noCover")}</span>
                  )}
                </span>
                <span className="vinyl-info">
                  <span className="vinyl-name">{album.name}</span>
                  <span className="vinyl-year">{album.releaseDate.slice(0, 4)}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {open && (
        <div className="vinyl-player" ref={playerRef}>
          <iframe
            key={open.spotifyId}
            title={`${open.name} — Spotify`}
            src={`https://open.spotify.com/embed/album/${open.spotifyId}`}
            width="100%"
            height="352"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          />
          <div className="vinyl-player-actions">
            <a href={open.spotifyUrl} target="_blank" rel="noopener noreferrer">{t("about.listenOnSpotify")}</a>
            <button type="button" onClick={() => setOpenId(null)}>{t("about.close")}</button>
          </div>
        </div>
      )}
    </div>
  );
};
