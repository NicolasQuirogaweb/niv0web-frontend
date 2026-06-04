import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { samplePacksService } from "../services/api";
import { CardPlaylist } from "./CardPlaylist";
import { useAuth } from "../hooks/useAuth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram } from "@fortawesome/free-brands-svg-icons";

export const SamplePacks = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [samplepacks, setSamplepacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/", { replace: true });
      return;
    }
    samplePacksService
      .getAll()
      .then((res) => setSamplepacks(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated, navigate]);

  return (
    <section className="samplepacks-section">
      <div className="samplepacks-content">
        <div className="samplepacks-info">
          <h3>
            <Link to="/homelogued">niv0 beats</Link>
          </h3>
          <h5>
            <Link to="/home">Log out</Link>
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
            <p>No se encontraron sample packs.</p>
          )}
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
