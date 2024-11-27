import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Home } from '../components/Home';
import { HomeLogued } from '../components/HomeLogued';
import { Login } from '../components/Login';
import { Beats } from '../components/Beats';
import Playlist from '../components/Playlist';

import CreatePlaylist from '../components/CreatePlaylist';
import PlaylistList from '../components/PlaylistList';
import PlaylistManager from '../components/PlaylistManager';
import { Inventario } from '../components/Inventario';

// Aquí importamos el componente Playlist que vamos a crear

export const MyRoutes = () => {
    return (
        <BrowserRouter>
            {/*LAYOUT*/}
            <section className="content">
                <Routes>
                    {/*Ruta base, redirige a /home */}
                    <Route path="/" element={<Navigate to="/home" />} />

                    {/*Rutas para cada seccion*/}
                    <Route path="/home" element={<Home />} />
                    <Route path="/homelogued" element={<HomeLogued />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/beats" element={<Beats />} />

                    {/* Rutas de las playlists */}
                    <Route path="/playlist/:id" element={<Playlist />} />

                    {/* Rutas de CREAR  playlists */}
                    <Route path="/createplaylist" element={<CreatePlaylist />} />
                    {/* Rutas de playlistList */}
                    <Route path="/playlistlist" element={<PlaylistList />} />
                    {/* PlaylistManager */}
                    <Route path="/playlistmanager" element={<PlaylistManager />} />

                    {/* Inventario de prueba */}
                    <Route path="/inventario" element={<Inventario />} />

                    {/* Página 404 */}
                    <Route path="*" element={
                        <div className='page'>
                            <h1 className='heading'>Error 404</h1>
                        </div>
                    } />
                </Routes>
            </section>
        </BrowserRouter>
    );
};
