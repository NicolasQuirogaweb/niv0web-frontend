import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { beatsService } from "../services/api";
import { CardPlaylist } from "./CardPlaylist";
import { useAuth } from "../hooks/useAuth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram } from "@fortawesome/free-brands-svg-icons";
import "./Beats.css";

export const Beats = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/", { replace: true });
      return;
    }
    beatsService
      .getAll()
      .then((res) => setPlaylists(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated, navigate]);

  return (
    <section className="beats-section">
      <div className="beats-content">
        <div className="beats-info">
          <h3>
            <Link to="/homelogued">niv0 beats</Link>
          </h3>
          <h5>
            <Link to="/home">Log out</Link>
          </h5>
        </div>

        <div className="beats-list">
          {loading ? (
            <p>Cargando playlists...</p>
          ) : playlists.length > 0 ? (
            playlists.map((playlist) => (
              <CardPlaylist
                key={playlist._id}
                playlist={playlist}
                resourceType="playlists"
              />
            ))
          ) : (
            <p>No se encontraron playlists.</p>
          )}
        </div>

        <div className="beats-description">
          <h2>LICENSES</h2>
          <p>Exclusive + stems $100usd $100mil AR</p>
          <p>Exclusive wav $80usd $80mil AR</p>
          <p>common lease wav $20usd $20mil AR</p>
        </div>
      </div>
      <div className="back-to-catalogue">
        <Link to="/homelogued">
          <button className="back-to-catalogue-btn">Back to home</button>
        </Link>
      </div>
      <div className="contenedor-parrafo-final">
        <p className="parrafo-final-samples">Make crazy music</p>
        <p className="parrafo-final-samples">CONTACT ME</p>
        <a href="https://www.instagram.com/__niv0__/" target="_blank" rel="noopener noreferrer">
          <FontAwesomeIcon
            icon={faInstagram}
            className="instagram-icon-loops"
          />
        </a>
      </div>
    </section>
  );
};
