import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram } from "@fortawesome/free-brands-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "./HomeLogued.css";

export const HomeLogued = () => {
  const { userEmail, isAdmin, clearAuth } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate("/", { replace: true });
  };

  return (
    <section className="home-section-logued">
      <div>
        <div className="home-header-row">
          <h3>
            <Link to="/homelogued">niv0 beats</Link>
          </h3>
          <h4>
            <Link to="/homelogued">{userEmail || "Cargando..."}</Link>
          </h4>
          <h5>
            <button onClick={handleLogout}>Log out</button>
          </h5>
        </div>
        <h6 className="beats-home">
          <Link to="/beats">BEATS</Link>
        </h6>
        <h6 className="samplepacks-home">
          <Link to="/samplepacks">SAMPLe PACKS</Link>
        </h6>
        <h6 className="prodmixmaster-home">
          <Link to="/prodmixmaster">PROD MIX MASTER</Link>
        </h6>
        {isAdmin && (
          <h6 className="admin-home" style={{ marginTop: 16 }}>
            <Link to="/admin" style={{ color: "#4caf50", border: "1px solid #4caf50", padding: "4px 12px", borderRadius: 4, fontSize: 12 }}>
              PANEL ADMIN
            </Link>
          </h6>
        )}
      </div>
      <div className="icon-insta-logued">
        <a href="https://www.instagram.com/__niv0__/" target="_blank" rel="noopener noreferrer">
          <FontAwesomeIcon icon={faInstagram} className="instagram-icon" />
        </a>
      </div>
      <p>Contact me</p>
      <p>THANK YOU FOR SIGNING IN. ENJOY!</p>
    </section>
  );
};
