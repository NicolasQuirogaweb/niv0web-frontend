import React from 'react';
import { Link } from 'react-router-dom';

const CardPlaylist = ({ playlist }) => {
  return (
    <div className="card-playlist">
      <Link to={`/playlist/${playlist._id}`} className="card-playlist-link">
        <div
          className="card-playlist-image"
          style={{
            backgroundImage: `url(${playlist.imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
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
