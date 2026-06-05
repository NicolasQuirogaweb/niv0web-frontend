import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { beatsService } from "../services/api";
import "./Playlist.css";

export const Playlist = () => {
  const { playlistId } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [error, setError] = useState(null);
  const [currentPlayingIndex, setCurrentPlayingIndex] = useState(null);
  const audioRefs = useRef([]);

  useEffect(() => {
    beatsService
      .getById(playlistId)
      .then((res) => setPlaylist(res.data))
      .catch((err) => setError(err.message));
  }, [playlistId]);

  const handlePlay = (index) => {
    audioRefs.current.forEach((audio, i) => {
      if (audio && i !== index) audio.pause();
    });
    setCurrentPlayingIndex(index);
  };

  const handleEnded = (index) => {
    const nextAudio = audioRefs.current[index + 1];
    if (nextAudio) nextAudio.play();
  };

  if (error) return <p>Error: {error}</p>;
  if (!playlist) return <p>Cargando...</p>;

  return (
    <div className="playlist-container">
      {playlist.backgroundVideo && (
        <video
          src={playlist.backgroundVideo}
          autoPlay
          loop
          muted
          className="background-video"
        />
      )}
      <div className="playlist-content">
        <div className="Playlist-niv0beats">
          <h3>
            <Link to="/homelogued">niv0 beats</Link>
          </h3>
        </div>

        {playlist.imageUrl && (
          <img
            src={playlist.imageUrl}
            alt={playlist.title}
            className="playlist-image"
          />
        )}

        <h2>{playlist.title}</h2>
        <p>{playlist.description}</p>

        <div className="beats-list">
          {playlist.beats && playlist.beats.length > 0 ? (
            playlist.beats.map((beat, index) => (
              <div
                key={beat._id}
                className={`beat-item ${
                  currentPlayingIndex === index ? "playing" : ""
                }`}
              >
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
          <Link to="/beats">
            <button className="back-to-catalogue-btn">Back to catalogue</button>
          </Link>
        </div>

        <p>Free for non profit use only, contact me and buy a license.</p>
      </div>
    </div>
  );
};
