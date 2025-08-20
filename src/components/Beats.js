import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CardPlaylist from "../components/CardPlaylist";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram } from "@fortawesome/free-brands-svg-icons";
import { Link } from "react-router-dom";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const Beats = () => {
  const [userEmail, setUserEmail] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (email) {
      setUserEmail(email);
    } else {
      navigate("/");
    }
    const fetchPlaylists = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/resources/playlists`);
        if (!response.ok) throw new Error("Error al obtener las playlists");
        const data = await response.json();
        console.log("Datos de las playlists:", data);
        setPlaylists(data);
      } catch (error) {
        console.error("Error al obtener las playlists:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, [navigate]);

  return (
    <section className="beats-section">
      <div className="beats-content">
        <div className="beats-info">
          <h3>
            <a href="/homelogued">niv0 beats</a>
          </h3>
          <h4>
            <a href="/">{userEmail ? userEmail : "Cargando..."}</a>
          </h4>
          <h5>
            <a href="/home">Log out</a>
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
        <a href="/homelogued">
          <button className="back-to-catalogue-btn">Back to home</button>
        </a>
      </div>
      <div className="contenedor-parrafo-final">
        <p className="parrafo-final-samples">Make crazy music</p>
        <p className="parrafo-final-samples">CONTACT ME</p>
        <Link to="https://www.instagram.com/__niv0__/" target="_blank">
          <FontAwesomeIcon
            icon={faInstagram}
            className="instagram-icon-loops"
          />
        </Link>
      </div>
    </section>
  );
};
