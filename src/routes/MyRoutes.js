import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Home } from '../components/Home';
import { HomeLogued } from '../components/HomeLogued';
import { Login } from '../components/Login';
import { Beats } from '../components/Beats';
import Playlist from '../components/Playlist';
import { Samples } from '../components/Samples';
import { SamplePacks } from '../components/SamplePacks';
import { Loops } from '../components/Loops';
import { ProdMixMaster } from '../components/ProdMixMaster';




export const MyRoutes = () => {
    return (
        <BrowserRouter>
            <section className="content">
                <Routes>
                    <Route path="/" element={<Navigate to="/home" />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/homelogued" element={<HomeLogued />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/beats" element={<Beats />} />
                    <Route path="/samplepacks" element={< SamplePacks />} />
                    <Route path="/samples" element={< Samples />} />
                    {/* Ruta dinámica corregida */}
                    <Route path="/:resourceType/playlist/:playlistId" element={<Playlist />} />
                    <Route path="/samples/samplepack/:samplepackId" element={<Samples />} />
                    <Route path="/loops" element={< Loops />} />
                    <Route path="/prodmixmaster" element={< ProdMixMaster />} />
                    
                    

                    
                    <Route path="*" element={<h1>Error 404 - Página no encontrada</h1>} />
                </Routes>
            </section>
        </BrowserRouter>
    );
};
