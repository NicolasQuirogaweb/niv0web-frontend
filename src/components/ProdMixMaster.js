import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram } from "@fortawesome/free-brands-svg-icons";
import { FaSpotify } from "react-icons/fa";

const SPOTIFY_PLAYLIST_URL =
  "https://open.spotify.com/playlist/5bMePdSTs9zljOIbSWsteY?si=600562fc39b540ac&pt=962bc1fe8ae84dd64108af07bfd9cdbf";

export const ProdMixMaster = () => {
  return (
    <section className="prod-mix-master-section">
      <img
        src="/images/Loops/loopimg.webp"
        alt="Icono loops"
        className="prodmixmaster-imagen"
      />
      <h2>Prod mix n mastering</h2>
      <p>Listen to my work on Spotify</p>
      <div className="spotify-playlist-container">
        <a
          href={SPOTIFY_PLAYLIST_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="spotify-playlist-link"
        >
          <FaSpotify className="spotify-icon" />
          <span>Open Spotify Playlist</span>
        </a>
      </div>
      <div className="back-to-catalogue">
        <Link to="/homelogued">
          <button className="back-to-catalogue-btn">Back to home</button>
        </Link>
      </div>
      <div className="contenedor-parrafo-final">
        <p className="parrafo-final-samples">Make crazy music</p>
        <p className="parrafo-final-samples">CONTACT ME</p>
        <a
          href="https://www.instagram.com/__niv0__/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FontAwesomeIcon
            icon={faInstagram}
            className="instagram-icon-loops"
          />
        </a>
      </div>
    </section>
  );
};
