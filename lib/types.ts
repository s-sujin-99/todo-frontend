export type Role = "USER" | "ADMIN";

export interface UserResponse {
  id: number;
  email: string;
  name: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  userId: number;
  email: string;
  name: string;
  role: Role;
}

export type Priority = "HIGH" | "MEDIUM" | "LOW";

export interface TodoResponse {
  id: number;
  title: string;
  content: string | null;
  completed: boolean;
  dueDate: string | null;
  priority: Priority;
  createdAt: string;
  updatedAt: string;
}

export interface TodoRequest {
  title: string;
  content: string | null;
  dueDate: string | null;
  priority: Priority;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export type TodoStatusFilter = "all" | "incomplete" | "completed";
export type TodoSortOption = "latest" | "dueDate";
