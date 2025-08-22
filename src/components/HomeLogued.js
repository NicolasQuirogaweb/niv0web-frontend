import React, { useEffect, useState, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram } from "@fortawesome/free-brands-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export const HomeLogued = () => {
  const [userEmail, setUserEmail] = useState(null);
  const navigate = useNavigate();

  // Traer la URL del backend desde variable de entorno
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  const handleLogout = useCallback(() => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userEmail");
    navigate("/");
  }, [navigate]);

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    const token = localStorage.getItem("authToken");

    if (email && token) {
      axios
        .get(`${BACKEND_URL}/api/auth/verify-token`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          setUserEmail(response.data.email);
        })
        .catch((error) => {
          console.error("Error al verificar el token:", error);
          handleLogout();
        });
    } else {
      console.warn("No se encontró token o email. Redirigiendo al login.");
      handleLogout();
    }
  }, [handleLogout, BACKEND_URL]);

  return (
    <section className="home-section-logued">
      <div>
        <h3>
          <Link to="/homelogued">niv0 beats</Link>
        </h3>
        <h4>
          <Link to="/homelogued">{userEmail || "Cargando..."}</Link>
        </h4>
        <h5>
          <button onClick={handleLogout}>Log out</button>
        </h5>
        <h6 className="beats-home">
          <Link to="/beats">BEATS</Link>
        </h6>
        <h6 className="samplepacks-home">
          <Link to="/samplepacks">SAMPLe PACKS</Link>
        </h6>
        <h6 className="loops-home">
          <Link to="/loops">LOOPS</Link>
        </h6>
        <h6 className="prodmixmaster-home">
          <Link to="/prodmixmaster">PROD MIX MASTER</Link>
        </h6>
      </div>
      <div className="icon-insta-logued">
        <Link to="https://www.instagram.com/__niv0__/" target="_blank">
          <FontAwesomeIcon icon={faInstagram} className="instagram-icon" />
        </Link>
      </div>
      <p>Contact me</p>
      <p>THANK YOU FOR SIGNING IN. ENJOY!</p>
    </section>
  );
};
