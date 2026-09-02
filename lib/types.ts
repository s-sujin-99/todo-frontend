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
  attachmentCount: number;
}

export interface AttachmentResponse {
  id: number;
  originalName: string;
  contentType: string;
  sizeBytes: number;
  createdAt: string;
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

// FR-M09: 비밀번호 해시 등 민감정보를 포함하지 않는다.
export interface AdminUserResponse {
  id: number;
  email: string;
  name: string;
  role: Role;
  provider: string;
  enabled: boolean;
  createdAt: string;
}

// FR-M07: 관리자 전체 할 일 조회 — 작성자 정보를 함께 담는다.
export interface AdminTodoResponse {
  id: number;
  title: string;
  completed: boolean;
  dueDate: string | null;
  priority: Priority;
  createdAt: string;
  authorEmail: string;
  authorName: string;
}

// FR-M08: 요약 통계.
export interface AdminStatsResponse {
  totalUsers: number;
  activeUsers: number;
  totalTodos: number;
  completedTodos: number;
}
