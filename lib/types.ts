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
