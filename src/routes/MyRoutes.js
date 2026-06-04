import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { PrivateRoute } from "./PrivateRoutes";
import { AdminRoute } from "./AdminRoute";

const Home = lazy(() =>
  import("../components/Home").then((m) => ({ default: m.Home }))
);
const HomeLogued = lazy(() =>
  import("../components/HomeLogued").then((m) => ({ default: m.HomeLogued }))
);
const Login = lazy(() =>
  import("../components/Login").then((m) => ({ default: m.Login }))
);
const Beats = lazy(() =>
  import("../components/Beats").then((m) => ({ default: m.Beats }))
);
const Playlist = lazy(() =>
  import("../components/Playlist").then((m) => ({ default: m.Playlist }))
);
const SamplePacks = lazy(() =>
  import("../components/SamplePacks").then((m) => ({ default: m.SamplePacks }))
);
const Samples = lazy(() =>
  import("../components/Samples").then((m) => ({ default: m.Samples }))
);
const Loops = lazy(() =>
  import("../components/Loops").then((m) => ({ default: m.Loops }))
);
const ProdMixMaster = lazy(() =>
  import("../components/ProdMixMaster").then((m) => ({
    default: m.ProdMixMaster,
  }))
);
const AdminLayout = lazy(() =>
  import("../components/admin/AdminLayout").then((m) => ({ default: m.AdminLayout }))
);
const AdminDashboard = lazy(() =>
  import("../components/admin/AdminDashboard").then((m) => ({ default: m.AdminDashboard }))
);
const AdminPlaylists = lazy(() =>
  import("../components/admin/AdminPlaylists").then((m) => ({ default: m.AdminPlaylists }))
);
const AdminPlaylistForm = lazy(() =>
  import("../components/admin/AdminPlaylistForm").then((m) => ({ default: m.AdminPlaylistForm }))
);
const AdminBeats = lazy(() =>
  import("../components/admin/AdminBeats").then((m) => ({ default: m.AdminBeats }))
);
const AdminLoops = lazy(() =>
  import("../components/admin/AdminLoops").then((m) => ({ default: m.AdminLoops }))
);
const AdminSamplePacks = lazy(() =>
  import("../components/admin/AdminSamplePacks").then((m) => ({ default: m.AdminSamplePacks }))
);
const AdminSamples = lazy(() =>
  import("../components/admin/AdminSamples").then((m) => ({ default: m.AdminSamples }))
);
const AdminProdMixMaster = lazy(() =>
  import("../components/admin/AdminProdMixMaster").then((m) => ({ default: m.AdminProdMixMaster }))
);
const AdminUsers = lazy(() =>
  import("../components/admin/AdminUsers").then((m) => ({ default: m.AdminUsers }))
);

const Loading = () => <p>Cargando...</p>;

export const MyRoutes = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <section className="content">
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="/home" element={<Home />} />
              <Route path="/homelogued" element={<HomeLogued />} />
              <Route path="/login" element={<Login />} />
              <Route
                path="/beats"
                element={
                  <PrivateRoute>
                    <Beats />
                  </PrivateRoute>
                }
              />
              <Route
                path="/samplepacks"
                element={
                  <PrivateRoute>
                    <SamplePacks />
                  </PrivateRoute>
                }
              />
              <Route
                path="/samples"
                element={
                  <PrivateRoute>
                    <Samples />
                  </PrivateRoute>
                }
              />
              <Route
                path="/:resourceType/playlist/:playlistId"
                element={
                  <PrivateRoute>
                    <Playlist />
                  </PrivateRoute>
                }
              />
              <Route
                path="/samples/samplepack/:samplepackId"
                element={
                  <PrivateRoute>
                    <Samples />
                  </PrivateRoute>
                }
              />
              <Route
                path="/loops"
                element={
                  <PrivateRoute>
                    <Loops />
                  </PrivateRoute>
                }
              />
              <Route
                path="/prodmixmaster"
                element={
                  <PrivateRoute>
                    <ProdMixMaster />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="playlists" element={<AdminPlaylists type="beats" />} />
                <Route path="playlists/new" element={<AdminPlaylistForm type="beats" />} />
                <Route path="playlists/:id/edit" element={<AdminPlaylistForm type="beats" />} />
                <Route path="playlists/:id/beats" element={<AdminBeats />} />
                <Route path="loops" element={<AdminPlaylists type="loops" />} />
                <Route path="loops/new" element={<AdminPlaylistForm type="loops" />} />
                <Route path="loops/:id/edit" element={<AdminPlaylistForm type="loops" />} />
                <Route path="loops/:id/loops" element={<AdminLoops />} />
                <Route path="samplepacks" element={<AdminSamplePacks />} />
                <Route path="samplepacks/new" element={<AdminPlaylistForm type="samples" />} />
                <Route path="samplepacks/:id/edit" element={<AdminPlaylistForm type="samples" />} />
                <Route path="samplepacks/:id/samples" element={<AdminSamples />} />
                <Route path="prodmix" element={<AdminProdMixMaster />} />
                <Route path="users" element={<AdminUsers />} />
              </Route>
              <Route
                path="*"
                element={<h1>Error 404 - Página no encontrada</h1>}
              />
            </Routes>
          </Suspense>
        </section>
      </AuthProvider>
    </BrowserRouter>
  );
};
