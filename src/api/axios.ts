import axios from "axios";
import { useAuthStore } from "@/stores/auth.store";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const auth = useAuthStore();

  if (auth.accessToken) {
    config.headers.Authorization = `Bearer ${auth.accessToken}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const auth = useAuthStore();

    if (error.response?.status === 401 && auth.refreshToken) {
      try {
        await auth.refresh();
        error.config.headers.Authorization = `Bearer ${auth.accessToken}`;
        return api(error.config);
      } catch {
        auth.logout();
      }
    }

    return Promise.reject(error);
  }
);

export default api;
