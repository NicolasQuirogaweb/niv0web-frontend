import React, { useState } from 'react';
import axios from 'axios';
import { useFetch } from '../hooks/useFetch';

const CreatePlaylist = () => {
    const { customFetch } = useFetch()
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title || !description || !imageUrl) {
            setError('Todos los campos son requeridos.');
            return;
        }

        try {
            const response = await customFetch('/api/playlists', {
                title,
                description,
                imageUrl,
            });

            console.log('Playlist creada:', response.data);
            setError('');
            setTitle('');
            setDescription('');
            setImageUrl('');
        } catch (error) {
            console.error('Error creando la playlist:', error);
            setError('Hubo un error al crear la playlist.');
        }
    };

    return (
        <div>
            <h2>Crear Playlist</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Título:</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Descripción:</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>URL de la Imagen:</label>
                    <input
                        type="text"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        required
                    />
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit">Crear Playlist</button>
            </form>
        </div>
    );
};

export default CreatePlaylist;
