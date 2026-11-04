import { memo } from "react";
import { useTranslation } from "react-i18next";
import { GlassCard } from "./common/GlassCard";

// Card de un catálogo (beats, loops, sample packs) con la cantidad de temas.
const CardPlaylist = memo(function CardPlaylist({ playlist, resourceType }) {
  const { t } = useTranslation();
  const to =
    resourceType === "samples"
      ? `/samples/samplepack/${playlist._id}`
      : `/${resourceType}/playlist/${playlist._id}`;
  const countKey = resourceType === "samples" ? "card.items_samples" : resourceType === "loops" ? "card.items_loops" : "card.items_beats";

  return (
    <GlassCard
      to={to}
      imageUrl={playlist.imageUrl}
      title={playlist.title}
      meta={t(countKey, { count: playlist.itemsCount ?? 0 })}
      className="card-playlist"
    />
  );
});

export { CardPlaylist };
