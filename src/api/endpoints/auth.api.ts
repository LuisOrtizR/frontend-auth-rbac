import axios from "axios";
import type {
  AuthResponse,
  RefreshResponse,
  RegisterDTO,
  LoginDTO,
} from "@/types/auth.types";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
});

/* ======================================================
   AUTH API
====================================================== */

export const authApi = {
  login(payload: LoginDTO) {
    return api.post<AuthResponse>("/auth/login", payload);
  },

  register(payload: RegisterDTO) {
    return api.post<AuthResponse>("/auth/register", payload);
  },

  refresh(refreshToken: string) {
    return api.post<RefreshResponse>("/auth/refresh", {
      refreshToken,
    });
  },

  logout(refreshToken: string) {
    return api.post("/auth/logout", { refreshToken });
  },
};
