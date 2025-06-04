import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CardPlaylist from "../components/CardPlaylist";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram } from "@fortawesome/free-brands-svg-icons";
import { Link } from "react-router-dom";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const SamplePacks = () => {
  const [userEmail, setUserEmail] = useState(null);
  const [samplepacks, setSamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (email) {
      setUserEmail(email);
    } else {
      navigate("/");
    }
    const fetchSamples = async () => {
      try {
        const response = await fetch(
          `${BACKEND_URL}/api/resources/samplepacks`
        );
        if (!response.ok) throw new Error("Error al obtener los samples");
        const data = await response.json();
        console.log("Datos de los samplepacks:", data);
        setSamples(data);
      } catch (error) {
        console.error("Error al obtener los samplepacks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSamples();
  }, [navigate]);

  return (
    <section className="samplepacks-section">
      <div className="samplepacks-content">
        <div className="samplepacks-info">
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

        <div className="beats-list-samplepacks">
          {loading ? (
            <p>Cargando samplepacks...</p>
          ) : samplepacks.length > 0 ? (
            samplepacks.map((samplepack) => (
              <CardPlaylist
                key={samplepack._id}
                playlist={samplepack}
                resourceType="samples"
              />
            ))
          ) : (
            <p>No se encontraron playlists.</p>
          )}
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
