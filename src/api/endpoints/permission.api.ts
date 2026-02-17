import api from "../axios";

export interface Permission {
  id: string;
  name: string;
  description: string | null;
  created_at?: string;
}

export interface PermissionListResponse {
  success: boolean;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: Permission[];
}

export interface CreatePermissionDTO {
  name: string;
  description?: string;
}

export const permissionApi = {
  getAll(page = 1, limit = 10, search = "") {
    return api.get<PermissionListResponse>("/permissions", {
      params: { page, limit, search },
    });
  },

  getById(id: string) {
    return api.get(`/permissions/${id}`);
  },

  create(data: CreatePermissionDTO) {
    return api.post("/permissions", data);
  },

  update(id: string, data: CreatePermissionDTO) {
    return api.put(`/permissions/${id}`, data);
  },

  delete(id: string) {
    return api.delete(`/permissions/${id}`);
  },
};
