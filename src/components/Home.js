import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram } from "@fortawesome/free-brands-svg-icons";
import { Link } from "react-router-dom";

export const Home = () => {
  const enlaces = [
    { link: "", text: "nivoBeat", styleName: "grande" },
    { link: "", text: "nivoBeat", styleName: "azul" },
    { link: "", text: "nivoBeat", styleName: "" },
    { link: "", text: "nivoBeat", styleName: "" },
    { link: "", text: "nivoBeat", styleName: "" },
    { link: "", text: "nivoBeat", styleName: "" },
    { link: "", text: "nivoBeat", styleName: "" },
  ];
  return (
    <section className="home-section">
      <div>
        {enlaces.map((e) => (
          <div key={e.text.toString()} className={e.styleName}>
            <Link to={e.link}>{e.text}</Link>
          </div>
        ))}
      </div>

      {/* Icono de Instagram */}
      <div className="icon-insta">
        <Link to="https://www.instagram.com/__niv0__/" target="_blank">
          <FontAwesomeIcon icon={faInstagram} className="instagram-icon" />
        </Link>
      </div>

      <p>SIGN UP / LOGIN TO HAVE ACCESS</p>
    </section>
  );
};
