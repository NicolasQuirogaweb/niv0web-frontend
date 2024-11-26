import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

// Importar Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Playlist = () => {
    const { id } = useParams();
    const [playlist, setPlaylist] = useState(null);
    const [beats, setBeats] = useState([]);
    const [activeBeat, setActiveBeat] = useState(null);

    useEffect(() => {
        if (!BACKEND_URL) {
            console.error("La variable de entorno BACKEND_URL no está definida.");
            return;
        }

        const fetchPlaylistAndBeats = async () => {
            try {
                const playlistResponse = await fetch(`${BACKEND_URL}/api/playlists/${id}`);
                const playlistData = await playlistResponse.json();
                setPlaylist(playlistData);

                const beatsResponse = await fetch(`${BACKEND_URL}/api/beats/playlist/${id}`);
                const beatsData = await beatsResponse.json();
                setBeats(beatsData);
            } catch (error) {
                console.error("Error al obtener la playlist o los beats:", error);
            }
        };

        fetchPlaylistAndBeats();
    }, [id]);

    const handlePlay = (beatId) => {
        setActiveBeat(beatId);

        beats.forEach((beat) => {
            if (beat._id !== beatId) {
                const audioElement = document.getElementById(`audio-${beat._id}`);
                if (audioElement) {
                    audioElement.pause();
                    audioElement.currentTime = 0;
                }
            }
        });
    };

    if (!playlist || beats.length === 0) {
        return <div className="loading">Cargando...</div>;
    }

    return (
        <div className="playlist-page">
            {/* Imagen de la playlist al lado */}
            <div className="playlist-header">
                <img src={playlist.imageUrl} alt={playlist.title} className="playlist-image" />
                <div className="playlist-info">
                    <h1 className="playlist-title">{playlist.title}</h1>
                    <p className="playlist-description">{playlist.description}</p>
                </div>
            </div>

            {/* Lista de beats */}
            <ul className="beat-list">
                {beats.map((beat) => (
                    <li 
                        key={beat._id} 
                        className={`beat-card ${activeBeat === beat._id ? 'active' : ''}`}
                    >
                        <div className="beat-card-image" style={{ backgroundImage: `url(${playlist.imageUrl})` }}></div>
                        <div className="beat-details">
                            <h3 className="beat-title">{beat.title}</h3>
                            <p className="beat-artist">{beat.artist}</p>
                            <audio 
                                controls 
                                onPlay={() => handlePlay(beat._id)}
                                onPause={() => setActiveBeat(null)}
                                id={`audio-${beat._id}`}
                            >
                                <source src={beat.audioFile} type="audio/mp3" />
                                Tu navegador no soporta el elemento de audio.
                            </audio>
                            <a href={beat.audioFile} download={beat.title} className="btn-download">
                                <FontAwesomeIcon icon={faDownload} /> {/* Ícono de descarga */}
                            </a>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Playlist;
