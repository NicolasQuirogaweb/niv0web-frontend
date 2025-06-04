import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram } from "@fortawesome/free-brands-svg-icons";
import { Link } from "react-router-dom";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Mapeo de nombres de sample packs a imágenes de fondo
const backgroundImages = {
  "BASS SAMPLES": "/images/samplesposta/samplesbass.webp",
  "SYNTH SAMPLES": "/images/samplesposta/synthsfondo.webp",
  "DRUM SAMPLES": "/images/samplesposta/samplesdrumsfondo.webp",
};

export const Samples = () => {
  const { samplepackId } = useParams();
  const [samplePack, setSamplePack] = useState(null);
  const [error, setError] = useState(null);
  const [currentPlayingIndex, setCurrentPlayingIndex] = useState(null);
  const audioRefs = useRef([]);

  useEffect(() => {
    console.log("samplepackId recibido:", samplepackId); // Debug
    const fetchSamples = async () => {
      try {
        const response = await fetch(
          `${BACKEND_URL}/api/resources/samples/samplepack/${samplepackId}`
        );
        if (!response.ok) throw new Error("Error al obtener los samples");
        const data = await response.json();
        setSamplePack(data);
      } catch (error) {
        setError(error.message);
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

  // Obtener imagen de fondo basada en el título del sample pack
  const backgroundImage =
    backgroundImages[samplePack.title] ||
    "/images/samplesposta/samplesbass.webp";
  console.log("Título recibido del samplePack:", samplePack.title);
  console.log(
    "Claves disponibles en backgroundImages:",
    Object.keys(backgroundImages)
  );
  console.log("Imagen seleccionada:", backgroundImages[samplePack.title]);

  return (
    <section
      className="samples-section"
      style={{
        background: `linear-gradient(rgba(5, 7, 11, 0.75), rgba(5, 7, 12, 0.75)), url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPposition: "center center",
        backgroundRepeat: "no-repeat",
      }}
    >
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
          const audioType = sample.audioFile.endsWith(".wav")
            ? "audio/wav"
            : "audio/mp3";

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
                onPlay={() => handlePlay(index)} // Ahora el evento se dispara al iniciar el audio
              >
                <source src={sample.audioFile} type={audioType} />
                Tu navegador no soporta la reproducción de audio.
              </audio>
            </div>
          );
        })}
      </div>
      <div className="back-to-catalogue">
        <a href="/samplepacks">
          <button className="back-to-catalogue-btn">Back to packs</button>
        </a>
      </div>
      <div className="contenedor-parrafo-final">
        <p className="parrafo-final-samples">Make crazy music</p>
        <p className="parrafo-final-samples">CONTACT ME</p>
        <Link to="https://www.instagram.com/__niv0__/" target="_blank">
          <FontAwesomeIcon icon={faInstagram} className="instagram-icon-samples" />
        </Link>
      </div>
      
    </section>
  );
};
