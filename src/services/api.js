import axios from "axios";
import { BACKEND_URL } from "../config";

const api = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
});

let unauthorizedHandler = () => {};
export const setUnauthorizedHandler = (fn) => {
  unauthorizedHandler = fn;
};

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve();
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === "object" && response.data.success === true) {
      response.data = response.data.data;
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/api/auth/refresh")
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post("/api/auth/refresh");
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        unauthorizedHandler();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const authService = {
  googleLogin: (credential) => api.post("/api/auth/google-login", { credential }),
  verifyToken: () => api.get("/api/auth/verify-token"),
  refresh: () => api.post("/api/auth/refresh"),
  logout: () => api.post("/api/auth/logout"),
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
  dashboard: (signal) => api.get("/api/admin/dashboard", { signal }),
  users: {
    list: (signal) => api.get("/api/admin/users", { signal }),
    updateRole: (id, role) => api.put(`/api/admin/users/${id}/role`, { role }),
  },
  playlists: {
    list: (signal) => api.get("/api/admin/playlists", { signal }),
    create: (data) => api.post("/api/admin/playlists", data),
    update: (id, data) => api.put(`/api/admin/playlists/${id}`, data),
    delete: (id) => api.delete(`/api/admin/playlists/${id}`),
    duplicate: (id) => api.post(`/api/admin/playlists/${id}/duplicate`),
  },
  beats: {
    list: (playlistId, signal) => api.get(`/api/admin/playlists/${playlistId}/beats`, { signal }),
    create: (playlistId, data) => api.post(`/api/admin/playlists/${playlistId}/beats`, data),
    batch: (playlistId, beats) => api.post(`/api/admin/playlists/${playlistId}/beats/batch`, { beats }),
    update: (id, data) => api.put(`/api/admin/beats/${id}`, data),
    delete: (id) => api.delete(`/api/admin/beats/${id}`),
  },
  loops: {
    list: (playlistId, signal) => api.get(`/api/admin/playlists/${playlistId}/loops`, { signal }),
    create: (playlistId, data) => api.post(`/api/admin/playlists/${playlistId}/loops`, data),
    batch: (playlistId, loops) => api.post(`/api/admin/playlists/${playlistId}/loops/batch`, { loops }),
    update: (id, data) => api.put(`/api/admin/loops/${id}`, data),
    delete: (id) => api.delete(`/api/admin/loops/${id}`),
  },
  samplepacks: {
    list: (signal) => api.get("/api/admin/samplepacks", { signal }),
    create: (data) => api.post("/api/admin/samplepacks", data),
    update: (id, data) => api.put(`/api/admin/samplepacks/${id}`, data),
    delete: (id) => api.delete(`/api/admin/samplepacks/${id}`),
    duplicate: (id) => api.post(`/api/admin/samplepacks/${id}/duplicate`),
  },
  samples: {
    list: (packId, signal) => api.get(`/api/admin/samplepacks/${packId}/samples`, { signal }),
    create: (packId, data) => api.post(`/api/admin/samplepacks/${packId}/samples`, data),
    batch: (packId, samples) => api.post(`/api/admin/samplepacks/${packId}/samples/batch`, { samples }),
    update: (id, data) => api.put(`/api/admin/samples/${id}`, data),
    delete: (id) => api.delete(`/api/admin/samples/${id}`),
  },
  prodmix: {
    list: (signal) => api.get("/api/admin/prodmixmasters", { signal }),
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
        headers: { "Content-Type": null },
      });
    },
    batch: (files, folder = "uploads") => {
      const formData = new FormData();
      files.forEach((f) => formData.append("files", f));
      formData.append("folder", folder);
      return api.post("/api/admin/upload/batch", formData, {
        headers: { "Content-Type": null },
      });
    },
  },
};

export default api;
