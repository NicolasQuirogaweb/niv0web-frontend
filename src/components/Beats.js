import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CardPlaylist from '../components/CardPlaylist';
import { useFetch } from '../hooks/useFetch';

// TODO limpar esta URL
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';  // Asegúrate de que esta URL sea correcta

export const Beats = () => {
  const { customFetch } = useFetch()
  const [userEmail, setUserEmail] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // useEffect para obtener el email del usuario desde el almacenamiento local y las playlists desde la API
  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (email) {
      setUserEmail(email);
    } else {
      navigate('/');  // Si no hay email, redirige al login
    }

    // Función para obtener las playlists desde el backend
    // TODO mover esta declaracion
    const fetchPlaylists = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/playlists`);  // Solicita las playlists al backend
        const response2 = await customFetch(`/api/playlists`);  // Solicita las playlists al backend
        if (!response.ok) {
          throw new Error('Error al obtener las playlists');  // Manejo de error si la respuesta no es correcta
        }
        const data = await response.json();  // Convierte la respuesta a JSON
        console.log("Datos de las playlists:", data);  // Verifica que las playlists tengan _id
        setPlaylists(data);  // Actualiza el estado con las playlists
        setLoading(false);  // Cambia el estado de carga a falso
      } catch (error) {
        console.error('Error al obtener las playlists:', error);  // Muestra el error en consola
        setLoading(false);  // Cambia el estado de carga a falso en caso de error
      }
    };

    fetchPlaylists();  // Llama a la función para obtener las playlists
  }, [navigate]);
  

  return (
    <section className="beats-section">
      <div className="beats-content">
        <div className="beats-info">
          <h3><a href="/homelogued">niv0 beats</a></h3>
          <h4><a href="/">{userEmail || "Cargando..."}</a></h4>
          <h5><a href="/home">Log out</a></h5>
        </div>

        {/* Aquí mapeamos las playlists si no hay error en la carga */}
        <div className="beats-list">
          {loading ? (
            <p>Cargando playlists...</p>  // Muestra este mensaje mientras se están cargando las playlists
          ) : (
            playlists.length > 0 ? (
              playlists.map((playlist) => (
                <CardPlaylist key={playlist._id} playlist={playlist} />  // Usamos _id para evitar conflictos
              ))
            ) : (
              <p>No se encontraron playlists.</p>  // Muestra este mensaje si no hay playlists
            )
          )}
        </div>

        <p>choose your beat and make a banguer</p>
      </div>
    </section>
  );
};
