import { lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { PrivateRoute } from "./PrivateRoutes";
import { AdminRoute } from "./AdminRoute";
import { AdminLayout } from "../components/admin/AdminLayout";
import { AdminDashboard } from "../components/admin/AdminDashboard";
import { AdminPlaylists } from "../components/admin/AdminPlaylists";
import { AdminPlaylistForm } from "../components/admin/AdminPlaylistForm";
import { AdminBeats } from "../components/admin/AdminBeats";
import { AdminLoops } from "../components/admin/AdminLoops";
import { AdminSamplePacks } from "../components/admin/AdminSamplePacks";
import { AdminSamples } from "../components/admin/AdminSamples";
import { AdminProdMixMaster } from "../components/admin/AdminProdMixMaster";
import { AdminUsers } from "../components/admin/AdminUsers";

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
                element={<h1 style={{ color: "#fff", textAlign: "center", marginTop: 80, fontFamily: "monospace" }}>{t("notFound.title")}</h1>}
              />
            </Routes>
          </Suspense>
        </section>
      </AuthProvider>
    </BrowserRouter>
  );
};
