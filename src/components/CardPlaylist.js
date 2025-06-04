import React from "react";
import { Link } from "react-router-dom";

const CardPlaylist = ({ playlist,resourceType }) => {
  // Construir la ruta dinámica según el tipo de recurso
  const getLink = () =>
    resourceType === "samples"
  ? `/samples/samplepack/${playlist._id}`
  : `/${resourceType}/playlist/${playlist._id}`;  

  return (
    <div className="card-playlist">
      <Link to={getLink()} className="card-playlist-link">
        <div
          className="card-playlist-image"
          style={{
            backgroundImage: `url(${playlist.imageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="card-playlist-info">
            <h3 className="card-playlist-title">{playlist.title}</h3>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default CardPlaylist;
