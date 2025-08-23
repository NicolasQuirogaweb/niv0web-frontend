import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram } from "@fortawesome/free-brands-svg-icons";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const Samples = () => {
  const { samplepackId } = useParams();
  const [samplePack, setSamplePack] = useState(null);
  const [error, setError] = useState(null);
  const [currentPlayingIndex, setCurrentPlayingIndex] = useState(null);
  const audioRefs = useRef([]);

  useEffect(() => {
    const fetchSamples = async () => {
      try {
        const response = await fetch(
          `${BACKEND_URL}/api/resources/samples/playlist/${samplepackId}`
        );
        if (!response.ok) throw new Error("Error al obtener los samples");
        const data = await response.json();
        setSamplePack(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchSamples();
  }, [samplepackId]);

  const handlePlay = (index) => {
    audioRefs.current.forEach((audio, i) => {
      if (i !== index && audio) audio.pause();
    });
    setCurrentPlayingIndex(index);
  };

  if (error) return <p>Error: {error}</p>;
  if (!samplePack) return <p>Cargando...</p>;

  return (
    <section className="samples-section samplepacks-section">
      {samplePack.imageUrl && (
        <img
          src={samplePack.imageUrl}
          alt={samplePack.title}
          className="sample-image"
        />
      )}
      <h2>{samplePack.title}</h2>
      <p>{samplePack.description}</p>

      <div className="samples-list">
        {samplePack.samples.map((sample, index) => {
          const ext = (sample.audioUrl || "").split("?")[0].split(".").pop();
          const audioType = ext === "wav" ? "audio/wav" : "audio/mpeg";

          return (
            <div
              key={sample._id}
              className={`sample-item ${
                currentPlayingIndex === index ? "playing" : ""
              }`}
              onClick={() => handlePlay(index)}
            >
              <h3>{sample.title}</h3>
              <audio
                ref={(el) => (audioRefs.current[index] = el)}
                controls
                onPlay={() => handlePlay(index)}
              >
                <source src={sample.audioUrl} type={audioType} />
                Tu navegador no soporta la reproducción de audio.
              </audio>
            </div>
          );
        })}
      </div>

      <div className="back-to-catalogue">
        <Link to="/samplepacks">
          <button className="back-to-catalogue-btn">Back to packs</button>
        </Link>
      </div>

      <div className="contenedor-parrafo-final">
        <p className="parrafo-final-samples">Make crazy music</p>
        <p className="parrafo-final-samples">CONTACT ME</p>
        <Link to="https://www.instagram.com/__niv0__/" target="_blank">
          <FontAwesomeIcon
            icon={faInstagram}
            className="instagram-icon-samples"
          />
        </Link>
      </div>
    </section>
  );
};
