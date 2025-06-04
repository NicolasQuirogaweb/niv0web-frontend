import React, { useEffect, useState, useRef } from "react";
import { FaInstagram, FaSpotify, FaYoutube } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram } from "@fortawesome/free-brands-svg-icons";
import { Link } from "react-router-dom";


const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const ProdMixMaster = () => {
  const [tracks, setTracks] = useState([]);
  const [error, setError] = useState(null);
  const [currentPlayingIndex, setCurrentPlayingIndex] = useState(null);
  const audioRefs = useRef([]);

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const response = await fetch(
          `${BACKEND_URL}/api/resources/prodmixmasters`
        );
        if (!response.ok) throw new Error("Error al obtener los tracks");
        const data = await response.json();
        setTracks(data);
      } catch (error) {
        setError(error.message);
      }
    };
    fetchTracks();
  }, []);

  const handlePlay = (index) => {
    audioRefs.current.forEach((audio, i) => {
      if (audio && i !== index) {
        audio.pause();
        audio.currentTime = 0;
      }
    });

    const currentAudio = audioRefs.current[index];
    if (!currentAudio) return;

    if (currentPlayingIndex === index && !currentAudio.paused) {
      currentAudio.pause();
      setCurrentPlayingIndex(null);
    } else {
      currentAudio
        .play()
        .catch((error) => console.error("Error al reproducir:", error));
      setCurrentPlayingIndex(index);
    }
  };

  if (error) return <p>Error: {error}</p>;
  if (!tracks.length) return <p>Cargando...</p>;

  return (
    <section className="prod-mix-master-section">
      <img
        src="../images/logued/niv0loguedfr.webp" /**eventualmente cambiar a la imagen que va  */
        alt="Icono loops"
        className="prodmixmaster-imagen"
      />
      <h2>Prod mix n mastering</h2>
      <p>Sum songs niv0 was in</p>

      <div className="prod-mix-master-list">
        {tracks.map((track, index) => (
          <div
            key={track._id}
            className={`prod-mix-master-item ${
              currentPlayingIndex === index ? "playing" : ""
            }`}
          >
            <h3>{track.title}</h3>
            <p>{track.description}</p>
            <audio
              ref={(el) => (audioRefs.current[index] = el)}
              onPlay={() => handlePlay(index)}
              onEnded={() => setCurrentPlayingIndex(null)}
              controls
            >
              <source
                src={track.audioFile}
                type={
                  track.audioFile.endsWith(".wav") ? "audio/wav" : "audio/mp3"
                }
              />
              Tu navegador no soporta la reproducción de audio.
            </audio>
          </div>
        ))}
      </div>

      <div className="external-tracks-info">
        <h4>Visit the artists content</h4>
        <div className="external-track-table">
          {[
            {
              title: "By my side - Keim",
              ig: "https://www.instagram.com/keim.camila/",
              yt: "https://www.youtube.com/watch?v=ASvnN-QTAiA",
              sp: "https://open.spotify.com/album/5YJe0yEqlDHtM2xmvgHaJx",
            },
            {
              title: "Maracanazo - cegé",
              ig: "https://www.instagram.com/cege.sl/",
              yt: "https://www.youtube.com/watch?v=xauDUr19plo",
              sp: "https://open.spotify.com/artist/7n3Qbl5RWsQ81YC2J7lEqS",
            },
            {
              title: "Dont fuck with me - Lecu",
              ig: "https://www.instagram.com/alejxcornejo/",
              yt: "https://www.youtube.com/watch?v=0aOvK7nPdX0",
              sp: "https://open.spotify.com/track/6jugOIC1kvuh06b3YZ7Iox",
            },
            {
              title: "No sentir así - Franikka",
              ig: "https://www.instagram.com/franikka_/",
              yt: "https://www.youtube.com/watch?v=7QPZmWhGH58",
              sp: "https://open.spotify.com/album/26aH3ryJUroG5Bz4Fbunp1",
            },
            {
              title: "Orden de perreo - Gianni Cuero",
              ig: "https://www.instagram.com/gianni.cuero/",
              yt: "https://www.youtube.com/watch?v=eNiV3jFsDag",
              sp: "https://open.spotify.com/track/63XZpbKYocbHpnGt0kJZDH",
            },
            {
              title: "Straight - Komp",
              ig: "https://www.instagram.com/kompyyyy/",
              yt: "https://www.youtube.com/watch?v=QQkxIulbYj8",
              sp: "https://open.spotify.com/track/5RMqEI7BAg3L4robPpmdu5",
            },
            {
              title: "Vice city - Club ventura",
              ig: "https://www.instagram.com/club.ventur4/",
              yt: "https://www.youtube.com/watch?v=9WJBxP_GLX8",
              sp: "https://open.spotify.com/album/2BwXjmTZutQ5owpd5WOUCB",
            },
          ].map((artist, idx) => (
            <div className="external-track-row" key={idx}>
              <span className="track-title">{artist.title}</span>
              <div className="track-links">
                <a href={artist.ig} target="_blank" rel="noopener noreferrer">
                  <button className="ig-btn">
                    <FaInstagram />
                  </button>
                </a>
                <a href={artist.yt} target="_blank" rel="noopener noreferrer">
                  <button className="yt-btn">
                    <FaYoutube />
                  </button>
                </a>
                <a href={artist.sp} target="_blank" rel="noopener noreferrer">
                  <button className="sp-btn">
                    <FaSpotify />
                  </button>
                </a>
              </div>
            </div>
          ))}
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
