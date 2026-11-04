import { memo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./CardPlaylist.css";

// Card de catálogo (beats, loops, sample packs): tapa desenfocada de fondo, la
// tapa nítida al frente y un panel de vidrio con el nombre, la cantidad de temas
// y un ecualizador que se mueve al pasar o enfocar. Toda la card es un solo link.
const CardPlaylist = memo(function CardPlaylist({ playlist, resourceType }) {
  const { t } = useTranslation();
  const href =
    resourceType === "samples"
      ? `/samples/samplepack/${playlist._id}`
      : `/${resourceType}/playlist/${playlist._id}`;
  const cover = playlist.imageUrl ? { backgroundImage: `url(${playlist.imageUrl})` } : undefined;
  const countKey = resourceType === "samples" ? "card.items_samples" : resourceType === "loops" ? "card.items_loops" : "card.items_beats";

  return (
    <Link to={href} className="card-playlist">
      <span className="card-blur" style={cover} aria-hidden="true" />
      <span className="card-cover" style={cover} aria-hidden="true" />
      <span className="card-glass">
        <span className="card-title">{playlist.title}</span>
        <span className="card-meta">
          <span className="card-tag">{t(countKey, { count: playlist.itemsCount ?? 0 })}</span>
          <span className="card-eq" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </span>
        </span>
      </span>
    </Link>
  );
});

export { CardPlaylist };
