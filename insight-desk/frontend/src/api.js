import axios from "axios";

const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, "");
  }
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return `http://${hostname}:8000`;
    }
  }
  return "http://127.0.0.1:8000";
};

const getWsUrl = () => {
  if (import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL;
  }
  const apiUrl = getApiUrl();
  return apiUrl.replace(/^http/, "ws") + "/ws/research";
};

export const API_URL = getApiUrl();
export const WS_URL = getWsUrl();

const api = axios.create({ baseURL: API_URL });

// Include token in request headers if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
