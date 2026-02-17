import api from "../axios";
import type {
  Request,
  CreateRequestDTO,
  UpdateRequestDTO
} from "@/types/request.types";

export const requestApi = {
  create(data: CreateRequestDTO) {
    return api.post<Request>("/requests", data);
  },

  getAll() {
    return api.get<Request[]>("/requests");
  },

  getMine() {
    return api.get<Request[]>("/requests/mine");
  },

  getOne(id: string) {
    return api.get<Request>(`/requests/${id}`);
  },

  update(id: string, data: UpdateRequestDTO) {
    return api.put<Request>(`/requests/${id}`, data);
  },

  delete(id: string) {
    return api.delete(`/requests/${id}`);
  }
};
