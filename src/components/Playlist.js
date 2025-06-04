import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";


const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Playlist = () => {
  const { playlistId } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [error, setError] = useState(null);
  const [currentPlayingIndex, setCurrentPlayingIndex] = useState(null);
  const audioRefs = useRef([]);

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/resources/beats/playlist/${playlistId}`);
        if (!response.ok) throw new Error("Error al obtener la playlist");
        const data = await response.json();
        console.log("Beats Data:", data);
        setPlaylist(data);
      } catch (error) {
        setError(error.message);
      }
    };
    fetchPlaylist();
  }, [playlistId]);

  const handlePlay = (index) => {
    audioRefs.current.forEach((audio, i) => {
      if (audio && i !== index) {
        audio.pause();
      }
    });

    setCurrentPlayingIndex(index);
  };

  const handleEnded = (index) => {
    const nextAudio = audioRefs.current[index + 1];
    if (nextAudio) {
      nextAudio.play();
    }
  };

  if (error) return <p>Error: {error}</p>;
  if (!playlist) return <p>Cargando...</p>;

  return (
    <div className="playlist-container">
      {playlist.backgroundVideo && (
        <video src={playlist.backgroundVideo} autoPlay loop muted className="background-video" />
      )}
      <div className="playlist-content">
        <div className="Playlist-niv0beats">
          <h3>
            <a href="/homelogued">niv0 beats</a>
          </h3>
        </div>
        {playlist.imageUrl && <img src={playlist.imageUrl} alt={playlist.title} className="playlist-image" />}
        <h2>{playlist.title}</h2>
        <p>{playlist.description}</p>
        <div className="beats-list">
          {playlist.beats && playlist.beats.length > 0 ? (
            playlist.beats.map((beat, index) => (
              <div key={beat._id} className={`beat-item ${currentPlayingIndex === index ? "playing" : ""}`}>
                <h3 className="beat-title">{beat.title}</h3>
                <audio
                  controls
                  ref={(el) => (audioRefs.current[index] = el)}
                  onPlay={() => handlePlay(index)}
                  onEnded={() => handleEnded(index)}
                >
                  <source src={beat.audioFile} type="audio/mp3" />
                </audio>
              </div>
            ))
          ) : (
            <p>No se encontraron beats para esta playlist.</p>
          )}
        </div>
        <div className="back-button-container">
          <a href="/beats">
            <button className="back-to-catalogue-btn">Back to catalogue</button>
          </a>
        </div>
        <p>Free for non profit use only, contact me and buy a license.</p>
       
      </div>
    </div>
  );
};

export default Playlist;




