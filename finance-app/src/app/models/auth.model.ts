export interface User {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  photoUrl?: string;
  monthlyIncome?: number;
  salaryAutoAddEnabled?: boolean;
  salaryAutoAddDay?: number;
  lastSalaryAddDate?: string;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
}

export interface UserPublic {
  id: number;
  name: string;
  email: string;
  photoUrl?: string;
  monthlyIncome?: number;
  salaryAutoAddEnabled?: boolean;
  salaryAutoAddDay?: number;
  lastSalaryAddDate?: string;
  createdAt?: string;
  lastLoginAt?: string;
}

export interface AuthSession {
  userId: number;
  token: string;
  expiresAt: number;
  createdAt: number;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: UserPublic;
  token?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserPublic | null;
  token?: string;
  expiresAt?: number;
}
