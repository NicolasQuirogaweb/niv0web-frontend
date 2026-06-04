import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram } from "@fortawesome/free-brands-svg-icons";
import { Link } from "react-router-dom";

export const Home = () => {
  return (
    <section className="home-section">
      <div>
        <h3>
          <Link to="/">niv0 beats</Link>
        </h3>
        <h4>
          <Link to="/login">log in</Link>
        </h4>
        <h5>
          <Link to="/login">sign up</Link>
        </h5>
        <h6 className="beats-home">
          <Link to="/login">BEATS</Link>
        </h6>
        <h6 className="samplepacks-home">
          <Link to="/login">
            SAMPLe
            PACKS
          </Link>
        </h6>
        <h6 className="loops-home">
          <Link to="/login">LOOPS</Link>
        </h6>
        <h6 className="prodmixmaster-home">
          <Link to="/login">PROD MIX MASTER</Link>
        </h6>
      </div>
      <div className="icon-insta">
        <a href="https://www.instagram.com/__niv0__/" target="_blank" rel="noopener noreferrer">
          <FontAwesomeIcon icon={faInstagram} className="instagram-icon" />
        </a>
      </div>
      <p>SIGN UP / LOGIN TO HAVE ACCESS</p>
    </section>
  );
};
