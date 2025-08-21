import React, { useEffect, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram } from "@fortawesome/free-brands-svg-icons";
import { Link } from "react-router-dom";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const Loops = () => {
  const [loops, setLoops] = useState([]);
  const [error, setError] = useState(null);
  const [currentPlayingIndex, setCurrentPlayingIndex] = useState(null);
  const audioRefs = useRef([]);

  useEffect(() => {
    const fetchLoops = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/resources/loops`);
        if (!response.ok) throw new Error("Error al obtener los loops");
        const data = await response.json();
        setLoops(data);
      } catch (error) {
        setError(error.message);
      }
    };
    fetchLoops();
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
  if (!loops.length) return <p>Cargando...</p>;

  return (
    <section className="loops-section">
      <img
        src="/images/Loops/loopimg.webp"
        alt="Icono loops"
        className="loops-imagen"
      />
      <h2>LOOPS</h2>
      <div className="loops-list">
        {loops.map((loop, index) => (
          <div
            key={loop._id}
            className={`loop-item ${
              currentPlayingIndex === index ? "playing" : ""
            }`}
          >
            <h3>{loop.title}</h3>
            <p>{loop.description}</p>
            <audio
              ref={(el) => (audioRefs.current[index] = el)}
              onPlay={() => handlePlay(index)}
              onEnded={() => setCurrentPlayingIndex(null)}
              controls
            >
              <source
                src={loop.audioFile}
                type={
                  loop.audioFile.endsWith(".wav") ? "audio/wav" : "audio/mp3"
                }
              />
              Tu navegador no soporta la reproducción de audio.
            </audio>
          </div>
        ))}
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
