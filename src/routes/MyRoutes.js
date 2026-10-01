import { lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { PrivateRoute } from "./PrivateRoutes";
import { AdminRoute } from "./AdminRoute";

// Todas las páginas se cargan bajo demanda. El panel admin en particular no
// tiene por qué viajar en el bundle de alguien que solo escucha beats.
const lazyNamed = (loader, name) => lazy(() => loader().then((m) => ({ default: m[name] })));

const Home = lazyNamed(() => import("../components/Home"), "Home");
const HomeLogued = lazyNamed(() => import("../components/HomeLogued"), "HomeLogued");
const Login = lazyNamed(() => import("../components/Login"), "Login");
const Beats = lazyNamed(() => import("../components/Beats"), "Beats");
const Playlist = lazyNamed(() => import("../components/Playlist"), "Playlist");
const SamplePacks = lazyNamed(() => import("../components/SamplePacks"), "SamplePacks");
const Samples = lazyNamed(() => import("../components/Samples"), "Samples");
const Loops = lazyNamed(() => import("../components/Loops"), "Loops");
const ProdMixMaster = lazyNamed(() => import("../components/ProdMixMaster"), "ProdMixMaster");

const AdminLayout = lazyNamed(() => import("../components/admin/AdminLayout"), "AdminLayout");
const AdminDashboard = lazyNamed(() => import("../components/admin/AdminDashboard"), "AdminDashboard");
const AdminPlaylists = lazyNamed(() => import("../components/admin/AdminPlaylists"), "AdminPlaylists");
const AdminPlaylistForm = lazyNamed(() => import("../components/admin/AdminPlaylistForm"), "AdminPlaylistForm");
const AdminBeats = lazyNamed(() => import("../components/admin/AdminBeats"), "AdminBeats");
const AdminLoops = lazyNamed(() => import("../components/admin/AdminLoops"), "AdminLoops");
const AdminSamplePacks = lazyNamed(() => import("../components/admin/AdminSamplePacks"), "AdminSamplePacks");
const AdminSamples = lazyNamed(() => import("../components/admin/AdminSamples"), "AdminSamples");
const AdminUsers = lazyNamed(() => import("../components/admin/AdminUsers"), "AdminUsers");

const Loading = () => {
  const { t } = useTranslation();
  return <p>{t("loading")}</p>;
};

export const MyRoutes = () => {
  const { t } = useTranslation();
  return (
    <BrowserRouter>
      <AuthProvider>
        <section className="content">
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="/home" element={<Home />} />
              <Route
                path="/homelogued"
                element={
                  <PrivateRoute>
                    <HomeLogued />
                  </PrivateRoute>
                }
              />
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
                <Route path="users" element={<AdminUsers />} />
              </Route>
              <Route
                path="*"
                element={<h1 style={{ color: "#fff", textAlign: "center", marginTop: 80, fontFamily: "monospace" }}>{t("notFound.title")}</h1>}
              />
            </Routes>
          </Suspense>
        </section>
      </AuthProvider>
    </BrowserRouter>
  );
};
