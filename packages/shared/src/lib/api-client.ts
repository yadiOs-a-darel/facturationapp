import axios, { type InternalAxiosRequestConfig } from "axios";
import { clearAuthSession } from "./auth-session";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export const apiClient = axios.create({
  baseURL,
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("gestfacturation_token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.error as string | undefined;

    if (status === 401) {
      clearAuthSession();
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/auth")) {
        const redirect = encodeURIComponent(
          window.location.pathname + window.location.search,
        );
        window.location.href = `/auth/login?redirect=${redirect}`;
      }
    } else if (status === 403 && message?.toLowerCase().includes("désactivé")) {
      clearAuthSession();
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/auth")) {
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  },
);