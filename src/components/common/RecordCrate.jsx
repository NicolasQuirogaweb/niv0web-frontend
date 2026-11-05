import { useState } from "react";
import { useTranslation } from "react-i18next";
import { SpotifyPlayer } from "./SpotifyPlayer";

// Discografía como un cajón de disquería (ADR 0009): los discos están parados y
// al pasar uno se levanta. Al elegirlo (clic, o flechas + Enter con useConsoleNav)
// cae en el tocadiscos, baja el brazo y suena en el reproductor de Spotify.
export const RecordCrate = ({ albums }) => {
  const { t } = useTranslation();
  const [current, setCurrent] = useState(null);
  // Cambia en cada elección para que el disco vuelva a caer aunque sea el mismo.
  const [spinKey, setSpinKey] = useState(0);
  const playing = albums.find((album) => album.spotifyId === current);

  const pick = (album) => {
    setCurrent(album.spotifyId);
    setSpinKey((key) => key + 1);
  };

  return (
    <div className="record-crate">
      <ul className="crate">
        {albums.map((album) => {
          const year = album.releaseDate.slice(0, 4);
          const selected = album.spotifyId === current;
          return (
            <li key={album.spotifyId} className="crate-slot">
              <button
                type="button"
                className={`crate-record${selected ? " crate-record--selected" : ""}`}
                aria-pressed={selected}
                aria-label={`${album.name} ${year}`}
                data-nav-item=""
                onClick={() => pick(album)}
              >
                {album.imageUrl ? (
                  <img src={album.imageUrl} alt="" loading="lazy" />
                ) : (
                  <span className="crate-nocover">
                    <span>{album.name}</span>
                    <span>{t("about.noCover")}</span>
                  </span>
                )}
                <span className="crate-name" aria-hidden="true">{album.name}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <section className="deck" aria-label={t("about.turntable")}>
        <div className={`turntable${playing ? " turntable--on" : ""}`} aria-hidden="true">
          <div className="turntable-platter">
            {playing && (
              <div key={spinKey} className="turntable-disc">
                <div
                  className="turntable-label"
                  style={playing.imageUrl ? { backgroundImage: `url(${playing.imageUrl})` } : undefined}
                />
              </div>
            )}
          </div>
          <div className="turntable-arm-base" />
          <div className="turntable-arm" />
        </div>

        <div className="deck-info">
          {playing ? (
            <>
              <p className="deck-year">{playing.releaseDate.slice(0, 4)}</p>
              <h3 className="deck-name">{playing.name}</h3>
              <SpotifyPlayer albumId={playing.spotifyId} title={playing.name} />
              <a className="deck-link" href={playing.spotifyUrl} target="_blank" rel="noopener noreferrer">
                {t("about.listenOnSpotify")}
              </a>
            </>
          ) : (
            <p className="deck-year">{t("about.pickRecord")}</p>
          )}
        </div>
      </section>
    </div>
  );
};
