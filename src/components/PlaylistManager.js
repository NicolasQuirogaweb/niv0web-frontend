import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CreatePlaylist from './CreatePlaylist';
import PlaylistList from './PlaylistList';

const PlaylistManager = () => {
    const [playlists, setPlaylists] = useState([]);

    // Cargar las playlists al montar el componente
    useEffect(() => {
        const fetchPlaylists = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/playlists');
                setPlaylists(response.data);
            } catch (error) {
                console.error('Error obteniendo las playlists:', error);
            }
        };

        fetchPlaylists();
    }, []);

    // Agregar una nueva playlist al estado
    const addPlaylist = (newPlaylist) => {
        setPlaylists((prevPlaylists) => [...prevPlaylists, newPlaylist]);
    };

    return (
        <div>
            <h1>Gestión de Playlists</h1>
            <CreatePlaylist onPlaylistCreated={addPlaylist} />
            <PlaylistList playlists={playlists} />
        </div>
    );
};

export default PlaylistManager;
