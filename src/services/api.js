import axios from "axios";
import { BACKEND_URL } from "../config";

const api = axios.create({
  baseURL: BACKEND_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userRole");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const authService = {
  googleLogin: (credential) =>
    api.post("/api/auth/google-login", { credential }),
  verifyToken: () => api.get("/api/auth/verify-token"),
};

export const beatsService = {
  getAll: () => api.get("/api/resources/playlists"),
  getById: (id) => api.get(`/api/resources/beats/playlist/${id}`),
};

export const samplePacksService = {
  getAll: () => api.get("/api/resources/samplepacks"),
  getSamples: (id) => api.get(`/api/resources/samples/playlist/${id}`),
};

export const loopsService = {
  getAll: () => api.get("/api/resources/loops"),
};

export const prodMixMasterService = {
  getAll: () => api.get("/api/resources/prodmixmasters"),
};

export const adminService = {
  dashboard: () => api.get("/api/admin/dashboard"),
  users: {
    list: () => api.get("/api/admin/users"),
    updateRole: (id, role) => api.put(`/api/admin/users/${id}/role`, { role }),
  },
  playlists: {
    list: () => api.get("/api/admin/playlists"),
    create: (data) => api.post("/api/admin/playlists", data),
    update: (id, data) => api.put(`/api/admin/playlists/${id}`, data),
    delete: (id) => api.delete(`/api/admin/playlists/${id}`),
    duplicate: (id) => api.post(`/api/admin/playlists/${id}/duplicate`),
  },
  beats: {
    list: (playlistId) => api.get(`/api/admin/playlists/${playlistId}/beats`),
    create: (playlistId, data) => api.post(`/api/admin/playlists/${playlistId}/beats`, data),
    batch: (playlistId, beats) => api.post(`/api/admin/playlists/${playlistId}/beats/batch`, { beats }),
    update: (id, data) => api.put(`/api/admin/beats/${id}`, data),
    delete: (id) => api.delete(`/api/admin/beats/${id}`),
  },
  loops: {
    list: (playlistId) => api.get(`/api/admin/playlists/${playlistId}/loops`),
    create: (playlistId, data) => api.post(`/api/admin/playlists/${playlistId}/loops`, data),
    batch: (playlistId, loops) => api.post(`/api/admin/playlists/${playlistId}/loops/batch`, { loops }),
    update: (id, data) => api.put(`/api/admin/loops/${id}`, data),
    delete: (id) => api.delete(`/api/admin/loops/${id}`),
  },
  samplepacks: {
    list: () => api.get("/api/admin/samplepacks"),
    create: (data) => api.post("/api/admin/samplepacks", data),
    update: (id, data) => api.put(`/api/admin/samplepacks/${id}`, data),
    delete: (id) => api.delete(`/api/admin/samplepacks/${id}`),
    duplicate: (id) => api.post(`/api/admin/samplepacks/${id}/duplicate`),
  },
  samples: {
    list: (packId) => api.get(`/api/admin/samplepacks/${packId}/samples`),
    create: (packId, data) => api.post(`/api/admin/samplepacks/${packId}/samples`, data),
    batch: (packId, samples) => api.post(`/api/admin/samplepacks/${packId}/samples/batch`, { samples }),
    update: (id, data) => api.put(`/api/admin/samples/${id}`, data),
    delete: (id) => api.delete(`/api/admin/samples/${id}`),
  },
  prodmix: {
    list: () => api.get("/api/admin/prodmixmasters"),
    create: (data) => api.post("/api/admin/prodmixmasters", data),
    update: (id, data) => api.put(`/api/admin/prodmixmasters/${id}`, data),
    delete: (id) => api.delete(`/api/admin/prodmixmasters/${id}`),
  },
  upload: {
    file: (file, folder = "uploads") => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);
      return api.post("/api/admin/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    batch: (files, folder = "uploads") => {
      const formData = new FormData();
      files.forEach((f) => formData.append("files", f));
      formData.append("folder", folder);
      return api.post("/api/admin/upload/batch", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
  },
};

export default api;
