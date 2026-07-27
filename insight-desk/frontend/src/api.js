import axios from "axios";

const getHost = () => {
  if (typeof window !== "undefined" && window.location.hostname) {
    return window.location.hostname;
  }
  return "127.0.0.1";
};

export const API_URL = `http://${getHost()}:8000`;
export const WS_URL = `ws://${getHost()}:8000/ws/research`;

const api = axios.create({ baseURL: API_URL });

// har request mein token laga do (agar hai)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
