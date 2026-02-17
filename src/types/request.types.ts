/* =========================
   STATUS & PRIORITY
========================= */

export type RequestStatus =
  | "open"
  | "in_progress"
  | "waiting_user"
  | "resolved"
  | "closed"
  | "rejected";

export type RequestPriority =
  | "low"
  | "medium"
  | "high"
  | "urgent";

/* =========================
   MODELO PRINCIPAL
========================= */

export interface Request {
  id: string;
  title: string;
  description: string;
  status: RequestStatus;
  priority: RequestPriority;

  user_id: string;
  assigned_to: string | null;

  resolution: string | null;

  created_at: string;
  updated_at: string;
  resolved_at?: string | null;
  closed_at?: string | null;

  email?: string; // si lo estás enviando desde backend
}

/* =========================
   DTOs
========================= */

export interface CreateRequestDTO {
  title: string;
  description: string;
  priority?: RequestPriority;
}

export interface UpdateRequestDTO {
  title?: string;
  description?: string;
  status?: RequestStatus;
  priority?: RequestPriority;
  assigned_to?: string | null;
  resolution?: string | null;
}
