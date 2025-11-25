import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// ¡AHORA USA EL BACKEND INTEGRADO EN NEXT.JS!
const baseURL = process.env.NEXT_PUBLIC_APP_URL || 
  (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

const API = axios.create({
  baseURL: `${baseURL}/api`,
  headers: { "Content-Type": "application/json" },
});

API.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("access") : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refresh = typeof window !== "undefined" ? localStorage.getItem("refresh") : null;
      if (refresh) {
        try {
          // Usar el nuevo endpoint de refresh
          const { data } = await axios.post(`${baseURL}/api/auth/refresh`, { refresh });
          const newAccess = data?.access;
          const newRefresh = data?.refresh;
          if (newAccess) {
            localStorage.setItem("access", newAccess);
            if (newRefresh) localStorage.setItem("refresh", newRefresh);
            originalRequest.headers = originalRequest.headers || {};
            (originalRequest.headers as Record<string, string>)["Authorization"] = `Bearer ${newAccess}`;
            return API(originalRequest);
          }
        } catch {
          // Si falla el refresh, limpiar tokens y redirigir a login
          if (typeof window !== 'undefined') {
            localStorage.removeItem("access");
            localStorage.removeItem("refresh");
            window.location.href = '/login';
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export default API;
